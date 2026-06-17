import crypto from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { SemanticGrepConfig } from "./config.js";

export interface TextChunk {
	file: string;
	startLine: number;
	endLine: number;
	text: string;
	hash: string;
}

export interface FileSnapshot {
	file: string;
	abs: string;
	size: number;
	mtimeMs: number;
	hash: string;
}

export function findRepoRoot(cwd: string): string {
	let dir = path.resolve(cwd);
	while (true) {
		try {
			if (statSync(path.join(dir, ".git")).isDirectory()) return dir;
		} catch {}
		const parent = path.dirname(dir);
		if (parent === dir) return path.resolve(cwd);
		dir = parent;
	}
}

function walk(
	dir: string,
	root: string,
	config: SemanticGrepConfig,
	out: string[],
): void {
	for (const ent of readdirSync(dir, { withFileTypes: true })) {
		if (ent.isSymbolicLink() && !config.indexing.followSymlinks) continue;
		const abs = path.join(dir, ent.name);
		if (ent.isDirectory()) {
			if (!config.indexing.excludeDirs.includes(ent.name))
				walk(abs, root, config, out);
			continue;
		}
		if (!ent.isFile()) continue;
		const ext = path.extname(ent.name).toLowerCase();
		if (!config.indexing.includeExtensions.includes(ext)) continue;
		const st = statSync(abs);
		if (st.size > config.indexing.maxFileBytes) continue;
		out.push(path.relative(root, abs));
	}
}

export function listIndexableFiles(
	root: string,
	config: SemanticGrepConfig,
): string[] {
	const out: string[] = [];
	walk(root, root, config, out);
	return out.sort();
}

export function hashText(text: string): string {
	return crypto.createHash("sha256").update(text).digest("hex");
}

export function readFileSnapshot(
	root: string,
	rel: string,
): FileSnapshot | undefined {
	const abs = path.join(root, rel);
	const st = statSync(abs);
	const text = readFileSync(abs, "utf8");
	if (text.includes("\0")) return undefined;
	return {
		file: rel,
		abs,
		size: st.size,
		mtimeMs: st.mtimeMs,
		hash: hashText(text),
	};
}

function splitOversizedChunk(text: string, maxChars: number): string[] {
	const out: string[] = [];
	for (let i = 0; i < text.length; i += maxChars) {
		const part = text.slice(i, i + maxChars).trim();
		if (part.length >= 20) out.push(part);
	}
	return out;
}

export function chunkFile(
	root: string,
	rel: string,
	config: SemanticGrepConfig,
	knownHash?: string,
): TextChunk[] {
	const abs = path.join(root, rel);
	const text = readFileSync(abs, "utf8");
	if (text.includes("\0")) return [];
	const hash = knownHash ?? hashText(text);
	const lines = text.split(/\r?\n/);
	const size = Math.max(1, config.indexing.chunkLines);
	const overlap = Math.min(config.indexing.chunkOverlap, size - 1);
	const step = size - overlap;
	const chunks: TextChunk[] = [];
	for (let i = 0; i < lines.length; i += step) {
		const part = lines.slice(i, i + size);
		const chunkText = part.join("\n").trim();
		if (chunkText.length < 20) continue;
		if (chunkText.length > config.indexing.maxChunkChars) {
			if (config.indexing.skipOversizedChunks) continue;
			const subChunks = splitOversizedChunk(
				chunkText,
				config.indexing.maxChunkChars,
			);
			for (const [j, subText] of subChunks.entries()) {
				chunks.push({
					file: rel,
					startLine: i + 1,
					endLine: Math.min(i + size, lines.length),
					text: `[part ${j + 1}/${subChunks.length}]\n${subText}`,
					hash,
				});
			}
			continue;
		}
		chunks.push({
			file: rel,
			startLine: i + 1,
			endLine: Math.min(i + size, lines.length),
			text: chunkText,
			hash,
		});
		if (i + size >= lines.length) break;
	}
	return chunks;
}
