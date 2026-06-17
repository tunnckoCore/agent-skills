import type { SemanticGrepConfig } from "./config.js";

interface EmbeddingResponse {
	data?: Array<{ embedding?: number[] }>;
}

export async function embed(
	input: string,
	config: SemanticGrepConfig,
	signal?: AbortSignal,
): Promise<number[]> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (config.embeddings.apiKey)
		headers["Authorization"] = `Bearer ${config.embeddings.apiKey}`;

	const init: RequestInit = {
		method: "POST",
		headers,
		body: JSON.stringify({ model: config.embeddings.model, input }),
	};
	if (signal) init.signal = signal;
	const res = await fetch(config.embeddings.url, init);
	if (!res.ok)
		throw new Error(`embedding endpoint ${res.status}: ${await res.text()}`);
	const json = (await res.json()) as EmbeddingResponse;
	const vector = json.data?.[0]?.embedding;
	if (!Array.isArray(vector) || vector.length === 0)
		throw new Error("embedding response did not contain data[0].embedding");
	return vector;
}

export function cosine(a: number[], b: number[]): number {
	let dot = 0,
		aa = 0,
		bb = 0;
	const n = Math.min(a.length, b.length);
	for (let i = 0; i < n; i++) {
		const av = a[i] ?? 0;
		const bv = b[i] ?? 0;
		dot += av * bv;
		aa += av * av;
		bb += bv * bv;
	}
	return aa && bb ? dot / (Math.sqrt(aa) * Math.sqrt(bb)) : 0;
}
