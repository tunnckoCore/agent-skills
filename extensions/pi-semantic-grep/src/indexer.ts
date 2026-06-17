import crypto from "node:crypto";
import type Database from "better-sqlite3";
import type { SemanticGrepConfig } from "./config.js";
import { type FileRow, getMeta, resetDb, setMeta } from "./db.js";
import { embed } from "./embeddings.js";
import { chunkFile, listIndexableFiles, readFileSnapshot } from "./files.js";

export interface IndexStats {
	files: number;
	chunks: number;
	added: number;
	changed: number;
	unchanged: number;
	deleted: number;
	fullRebuild: boolean;
}

function indexFingerprint(config: SemanticGrepConfig): string {
	const payload = {
		schema: 4,
		model: config.embeddings.model,
		dimensions: config.embeddings.dimensions ?? null,
		chunkLines: config.indexing.chunkLines,
		chunkOverlap: config.indexing.chunkOverlap,
		includeExtensions: config.indexing.includeExtensions,
		excludeDirs: config.indexing.excludeDirs,
		maxFileBytes: config.indexing.maxFileBytes,
		maxChunkChars: config.indexing.maxChunkChars,
		skipOversizedChunks: config.indexing.skipOversizedChunks,
		followSymlinks: config.indexing.followSymlinks,
	};
	return crypto
		.createHash("sha256")
		.update(JSON.stringify(payload))
		.digest("hex");
}

async function indexOneFile(
	db: Database.Database,
	root: string,
	file: string,
	snapshot: NonNullable<ReturnType<typeof readFileSnapshot>>,
	config: SemanticGrepConfig,
	signal?: AbortSignal,
): Promise<number> {
	db.prepare("delete from chunks where file = ?").run(file);
	db.prepare("delete from files where file = ?").run(file);

	const chunks = chunkFile(root, file, config, snapshot.hash);
	const insertChunk = db.prepare(
		"insert into chunks (file, start_line, end_line, text, hash, vector) values (?, ?, ?, ?, ?, ?)",
	);
	const insertFile = db.prepare(
		"insert into files (file, hash, size, mtime_ms, indexed_at) values (?, ?, ?, ?, ?)",
	);

	insertFile.run(
		file,
		snapshot.hash,
		snapshot.size,
		snapshot.mtimeMs,
		new Date().toISOString(),
	);
	for (const chunk of chunks) {
		signal?.throwIfAborted();
		const vector = await embed(
			`File: ${chunk.file}\nLines: ${chunk.startLine}-${chunk.endLine}\n\n${chunk.text}`,
			config,
			signal,
		);
		insertChunk.run(
			chunk.file,
			chunk.startLine,
			chunk.endLine,
			chunk.text,
			chunk.hash,
			JSON.stringify(vector),
		);
	}
	return chunks.length;
}

export async function syncIndex(
	db: Database.Database,
	root: string,
	config: SemanticGrepConfig,
	forceFullRebuild = false,
	signal?: AbortSignal,
	onProgress?: (msg: string) => void,
): Promise<IndexStats> {
	const fingerprint = indexFingerprint(config);
	const priorFingerprint = getMeta(db, "index_fingerprint");
	const fullRebuild = forceFullRebuild || priorFingerprint !== fingerprint;
	if (fullRebuild) resetDb(db);

	const files = listIndexableFiles(root, config);
	const current = new Set(files);
	const knownRows = db
		.prepare("select file, hash, size, mtime_ms, indexed_at from files")
		.all() as FileRow[];
	const known = new Map(knownRows.map((r) => [r.file, r]));

	let chunks = 0,
		added = 0,
		changed = 0,
		unchanged = 0,
		deleted = 0;

	for (const row of knownRows) {
		if (!current.has(row.file)) {
			db.prepare("delete from chunks where file = ?").run(row.file);
			db.prepare("delete from files where file = ?").run(row.file);
			deleted++;
		}
	}

	for (let i = 0; i < files.length; i++) {
		signal?.throwIfAborted();
		const file = files[i];
		if (!file) continue;
		const snapshot = readFileSnapshot(root, file);
		if (!snapshot) continue;
		const old = known.get(file);
		const same =
			old && old.hash === snapshot.hash && old.size === snapshot.size;
		if (!fullRebuild && same) {
			unchanged++;
			continue;
		}

		if (old) changed++;
		else added++;
		onProgress?.(`[${i + 1}/${files.length}] indexing ${file}`);
		chunks += await indexOneFile(db, root, file, snapshot, config, signal);
	}

	setMeta(db, "index_fingerprint", fingerprint);
	setMeta(db, "indexed_at", new Date().toISOString());
	setMeta(db, "embedding_model", config.embeddings.model);

	return {
		files: files.length,
		chunks,
		added,
		changed,
		unchanged,
		deleted,
		fullRebuild,
	};
}

export async function buildIndex(
	db: Database.Database,
	root: string,
	config: SemanticGrepConfig,
	signal?: AbortSignal,
	onProgress?: (msg: string) => void,
): Promise<IndexStats> {
	return syncIndex(db, root, config, true, signal, onProgress);
}
