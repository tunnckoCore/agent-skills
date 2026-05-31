# Pi Hermes Mechanics Package Notes

Session-derived notes for building a standard Pi package that ports Hermes-like mechanics without replacing Pi.

## Key correction

When the user asks for "Pi" and mentions Hermes mechanics, do not build a new agent runtime or generic Python project. Use standard `pi` and package the requested behavior as Pi extensions/skills/tools.

## Installed Pi facts observed

`pi --help` showed native support for:

- `pi install <source> [-l]`
- `pi remove <source> [-l]`
- `pi update [source|self|pi]`
- `pi list`
- `pi config`
- `--extension/-e <path>` to load extension files or packages
- `--skill <path>` to load skills
- `--session-dir <dir>` and `PI_CODING_AGENT_DIR` for session/state home

Project-local installs use `.pi/settings.json` via:

```bash
pi install -l ./
```

For a distribution-style wrapper, set Pi home locally:

```bash
export PI_CODING_AGENT_DIR="$ROOT/.pi/agent"
exec pi --extension "$ROOT" "$@"
```

## Pi package manifest shape

A directory package can be local and private:

```json
{
  "name": "pi-hermes-mechanics",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "keywords": ["pi-package"],
  "pi": {
    "extensions": ["./extensions"],
    "skills": ["./skills"]
  },
  "peerDependencies": {
    "@mariozechner/pi-ai": "*",
    "@mariozechner/pi-coding-agent": "*",
    "@mariozechner/pi-tui": "*",
    "typebox": "*"
  }
}
```

Pi also auto-discovers conventional directories if no manifest exists:

- `extensions/` for `.ts`/`.js` extension files
- `skills/` for `SKILL.md` folders and top-level `.md` skills
- `prompts/` for prompt templates
- `themes/` for JSON themes

## Extension APIs used

A Pi extension is a TS/JS module with a default export receiving `ExtensionAPI`:

```ts
import { Type } from "typebox";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function extension(pi: ExtensionAPI) {
  pi.on("resources_discover", async () => ({ skillPaths: ["/path/to/skills"] }));

  pi.on("before_agent_start", async (event) => ({
    systemPrompt: event.systemPrompt + "\nExtra instructions...\n",
  }));

  pi.registerTool({
    name: "example_tool",
    label: "Example Tool",
    description: "Does one thing.",
    parameters: Type.Object({ input: Type.String() }),
    async execute(_id, params) {
      return { content: [{ type: "text", text: params.input }] };
    },
  });

  pi.registerCommand("example", {
    description: "Example command",
    handler: async (_args, ctx) => ctx.ui.notify("ok", "info"),
  });
}
```

Useful event/API pieces:

- `resources_discover` can return `{ skillPaths, promptPaths, themePaths }`.
- `before_agent_start` can append/replace the system prompt for a turn.
- `registerTool` adds LLM-callable tools with TypeBox schemas.
- `registerCommand` adds slash commands.
- `appendEntry` exists for branch/session-local state, but durable Hermes-like memory should use files under `PI_CODING_AGENT_DIR` when cross-session memory is desired.

## Hermes-to-Pi mechanic mapping

- Hermes skills: package under `skills/<name>/SKILL.md` and expose via `pi.skills`; optionally add `resources_discover`.
- Hermes memory: extension tools that read/write JSON under `$PI_CODING_AGENT_DIR/memory/`.
- Hermes tool registry: individual `pi.registerTool(...)` calls.
- Hermes home/profile isolation: wrapper with `PI_CODING_AGENT_DIR=$ROOT/.pi/agent`, plus project-local `.pi/settings.json`.
- Hermes system prompt injection: `before_agent_start` appends recent memory and operating instructions.

## Verification pattern

Avoid model calls when credentials/billing may be unavailable. Verify extension mechanics directly with Bun and a Pi-shaped mock API:

```bash
PI_CODING_AGENT_DIR="$PWD/.pi/agent" bun - <<'EOF'
import ext from './extensions/hermes-mechanics.ts';
const tools = new Map();
const events = new Map();
const commands = new Map();
ext({
  on: (name, handler) => events.set(name, handler),
  registerTool: (tool) => tools.set(tool.name, tool),
  registerCommand: (name, cmd) => commands.set(name, cmd),
});
console.log([...tools.keys()].sort().join('\n'));
const home = await tools.get('hermes_pi_home').execute('1', {}, undefined, undefined, {});
console.log(home.content[0].text);
EOF
```

Then verify Pi package settings without requiring LLM/provider calls:

```bash
pi install -l ./
PI_CODING_AGENT_DIR="$PWD/.pi/agent" pi list
```

## Cleanup/security notes

A smoke run may create local runtime files under `.pi/agent`, including auth/session/db files. Remove credentials from distributable state and ignore runtime artifacts:

```gitignore
.pi/agent/auth.json
.pi/agent/*.db
.pi/agent/*.db-*
.pi/agent/sessions/**
.pi/agent/logs/**
.pi/agent/terminal-sessions/**
node_modules/
dist/
*.tgz
```
