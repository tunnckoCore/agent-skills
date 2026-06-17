import { existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import type { SemanticGrepConfig } from "./config.js";

function expandHome(p: string): string {
	if (p === "~") return homedir();
	if (p.startsWith("~/") || p.startsWith("~\\"))
		return path.join(homedir(), p.slice(2));
	return p;
}

function samePath(a: string, b: string): boolean {
	return path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
}

function hasMarker(dir: string, markers: string[]): boolean {
	return markers.some((marker) => existsSync(path.join(dir, marker)));
}

export function findProjectRoot(
	cwd: string,
	config: SemanticGrepConfig,
): string | undefined {
	let dir = path.resolve(cwd);
	while (true) {
		if (hasMarker(dir, config.safety.projectMarkers)) return dir;
		const parent = path.dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return config.safety.requireProjectMarker ? undefined : path.resolve(cwd);
}

export function denyReason(
	root: string,
	config: SemanticGrepConfig,
): string | undefined {
	const resolved = path.resolve(root);
	for (const denied of config.safety.denyRootPaths) {
		if (samePath(resolved, expandHome(denied)))
			return `refusing to index protected root: ${denied}`;
	}

	const base = path.basename(resolved);
	if (config.safety.denyRootBasenames.includes(base))
		return `refusing to index standard system/user directory: ${base}`;

	try {
		const home = homedir();
		if (samePath(resolved, home)) return "refusing to index home directory";
		const parent = path.dirname(resolved);
		if (
			samePath(parent, home) &&
			config.safety.denyRootBasenames.includes(base)
		) {
			return `refusing to index standard home directory: ${base}`;
		}
		if (statSync(resolved).isDirectory()) return undefined;
	} catch {
		return `root does not exist: ${resolved}`;
	}
	return undefined;
}
