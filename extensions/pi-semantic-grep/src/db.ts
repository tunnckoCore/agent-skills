import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export interface ChunkRow {
	id: number;
	file: string;
	start_line: number;
	end_line: number;
	text: string;
	vector: string;
}

export interface FileRow {
	file: string;
	hash: string;
	size: number;
	mtime_ms: number;
	indexed_at: string;
}

export function dbPathFor(root: string): string {
	return path.join(root, ".pi", "semantic-grep.sqlite");
}

export function openDb(root: string): Database.Database {
	mkdirSync(path.join(root, ".pi"), { recursive: true });
	const db = new Database(dbPathFor(root));
	db.pragma("journal_mode = WAL");
	db.exec(`
    create table if not exists meta (key text primary key, value text not null);
    create table if not exists files (
      file text primary key,
      hash text not null,
      size integer not null,
      mtime_ms real not null,
      indexed_at text not null
    );
    create table if not exists chunks (
      id integer primary key,
      file text not null,
      start_line integer not null,
      end_line integer not null,
      text text not null,
      hash text not null,
      vector text not null,
      foreign key(file) references files(file) on delete cascade
    );
    create index if not exists chunks_file_idx on chunks(file);
  `);
	return db;
}

export function resetDb(db: Database.Database): void {
	db.exec("delete from chunks; delete from files; delete from meta;");
}

export function getMeta(
	db: Database.Database,
	key: string,
): string | undefined {
	return (
		db.prepare("select value from meta where key = ?").get(key) as
			| { value: string }
			| undefined
	)?.value;
}

export function setMeta(
	db: Database.Database,
	key: string,
	value: string,
): void {
	db.prepare(
		"insert into meta (key, value) values (?, ?) on conflict(key) do update set value = excluded.value",
	).run(key, value);
}
