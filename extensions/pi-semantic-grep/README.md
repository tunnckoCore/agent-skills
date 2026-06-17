# pi-semantic-grep

Semantic search for pi. This extension gives the agent a `semantic_grep` tool that finds relevant code or documentation by meaning, not just by exact words. It indexes each repository into a local SQLite database under `.pi/`, embeds code chunks through your configured OpenAI-compatible embeddings endpoint, and incrementally refreshes the index at the start of each pi session.

Package: `@howaboua/pi-semantic-grep`  
Repository: <https://github.com/IgorWarzocha/pi-semantic-grep>

## What it is good for

Use it when a normal text search is too literal:

- “Where is auth/session state handled?”
- “Find the code that formats tool results.”
- “Where do we build prompts for the model?”
- “What files are involved in indexing documents?”
- “Find docs or examples for adding a custom renderer.”

The agent receives ranked matches with file paths, line ranges, scores, and snippets. By default the result renders compactly in pi and expands with the normal tool expand keybinding.

## Requirements

- pi
- Node.js compatible with pi extensions
- An OpenAI-compatible embeddings endpoint

The endpoint must accept:

```http
POST /v1/embeddings
Content-Type: application/json

{
  "model": "your-embedding-model",
  "input": "text to embed"
}
```

and return an OpenAI-style response containing:

```json
{
  "data": [
    { "embedding": [0.1, 0.2, 0.3] }
  ]
}
```

This has been designed for OpenAI-compatible local servers such as LM Studio, llama.cpp-style servers, or any service that exposes the same embeddings response shape. It should also work with hosted OpenAI-compatible embedding APIs when configured with the right URL/model/API key.

## Installation

Install as a pi package:

```bash
pi install npm:@howaboua/pi-semantic-grep
```

Or run directly from a local checkout:

```bash
git clone https://github.com/IgorWarzocha/pi-semantic-grep.git
cd pi-semantic-grep
npm install
pi -e ./src/index.ts
```

## Configuration

On first load, the extension creates:

```text
~/.pi/agent/semantic-grep.json
```

Default config:

```json
{
  "embeddings": {
    "url": "http://127.0.0.1:1234/v1/embeddings",
    "model": "text-embedding-embeddinggemma-300m-qat"
  },
  "indexing": {
    "chunkLines": 80,
    "chunkOverlap": 20,
    "maxFileBytes": 512000,
    "maxChunkChars": 12000,
    "skipOversizedChunks": false,
    "followSymlinks": false,
    "includeExtensions": [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".lua", ".rs", ".go", ".java", ".cs", ".cpp", ".c", ".h", ".hpp", ".md", ".json", ".yaml", ".yml", ".toml", ".css", ".scss", ".html", ".svelte", ".vue"],
    "excludeDirs": [".git", ".pi", "node_modules", "dist", "build", "target", ".venv", "venv", "vendor", ".next", ".cache"]
  },
  "search": {
    "defaultTopK": 8,
    "maxTopK": 30
  },
  "autoIndex": {
    "enabled": true,
    "mode": "incremental"
  },
  "safety": {
    "requireProjectMarker": true,
    "projectMarkers": [".git", "package.json", "pyproject.toml", "Cargo.toml", "go.mod", "deno.json", "bun.lock", "pnpm-lock.yaml", "yarn.lock"],
    "denyRootBasenames": ["Desktop", "Documents", "Downloads", "Pictures", "Music", "Movies", "Videos", "Public", "Templates", "Applications", "Library", "System", "Volumes", "Users", "Program Files", "Program Files (x86)", "ProgramData", "Windows", "PerfLogs", "AppData", "OneDrive", "Dropbox", "Google Drive", "iCloud Drive"],
    "denyRootPaths": ["~", "/", "C:\\", "C:/"]
  }
}
```

For your example local endpoint:

```bash
curl http://127.0.0.1:1234/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-embeddinggemma-300m-qat",
    "input": "Some text to embed"
  }'
```

use:

```json
{
  "embeddings": {
    "url": "http://127.0.0.1:1234/v1/embeddings",
    "model": "text-embedding-embeddinggemma-300m-qat"
  }
}
```

For an endpoint requiring a bearer token:

```json
{
  "embeddings": {
    "url": "https://example.com/v1/embeddings",
    "model": "my-embedding-model",
    "apiKey": "YOUR_API_KEY"
  }
}
```

## Indexing behavior

The index is stored per repository:

```text
<repo>/.pi/semantic-grep.sqlite
```

Global config lives at `~/.pi/agent/semantic-grep.json`. A repository may also define a project override at:

```text
<repo>/.pi/semantic-grep.json
```

Project config is merged over the global config. Nested objects are merged; arrays such as `indexing.excludeDirs` replace the global array, so include the defaults you still want.

By default the file walker does not follow or index symlinks. Set `indexing.followSymlinks` to `true` globally or in a project config if a repository intentionally keeps indexable code behind symlinks.

At session start, the extension syncs the index automatically.

`autoIndex.mode` options:

- `incremental` — default; only embed new or changed files and remove deleted files
- `missing` — build only if the SQLite index does not exist
- `always` — force a full rebuild at every session start

A full rebuild is also triggered when indexing settings change, such as embedding model, chunk size, included extensions, excluded directories, max chunk size, or schema version. Oversized chunks are split by default instead of failing the whole indexing run; tune `indexing.maxChunkChars` for your embedder.

## Safety defaults

The extension intentionally avoids indexing broad system or user directories. By default it requires a project marker such as `.git`, `package.json`, `pyproject.toml`, `Cargo.toml`, or `go.mod`, and refuses protected roots like `~`, `/`, `C:\\`, plus common Windows/macOS/Linux home folders such as Desktop, Documents, Downloads, Pictures, Applications, Library, Program Files, Windows, AppData, OneDrive, Dropbox, Google Drive, and iCloud Drive.

You can adjust these rules in `~/.pi/agent/semantic-grep.json` under `safety`.

## Tool available to the agent

```ts
semantic_grep({
  query: string,
  top_k?: number
})
```

Examples:

```ts
semantic_grep({ query: "where are tool calls dispatched?" })
semantic_grep({ query: "code that formats markdown output", top_k: 5 })
semantic_grep({ query: "configuration loading and defaults", top_k: 10 })
```

## Tech stack

- TypeScript pi extension
- `better-sqlite3` for repo-local storage
- OpenAI-compatible `/v1/embeddings` HTTP API for vectors
- Simple line-window chunking with overlap
- SHA256 per-file tracking for incremental indexing
- Brute-force cosine similarity over vectors loaded from SQLite

The implementation is intentionally simple and portable. It does not require Python, FAISS, a background service, or a separate vector database. For very large repositories, an approximate nearest-neighbor index may be added later.
