# pi-vent

A tiny [Pi](https://pi.dev) extension that gives the agent a `vent` tool.

When the agent notices **repeated or systemic workflow friction**, it can leave a note in `VENT.md` in your current workspace. This is less about complaining and more about capturing patterns that should become future automation, docs, or workflow fixes.

The tool is meant for cases like repeated hook/tool failures with the same root cause, manually applying the same cleanup workaround more than once, tool output that forces the same retry sequence, or project instructions that cause avoidable backtracking. It should not be used for one-off lint/type errors or ordinary coding mistakes that are simply part of normal development.

Entries are batched and appended near the end of an agent turn, so you get a useful feedback log without constant tool chatter.

## What it writes

If `VENT.md` does not exist, pi-vent creates it. Each entry is appended with a human-readable local timestamp:

```md
## 26-04-29 10:42 — tool_error

Symptom: a hook failed twice for the same generated artifact. Repeated workaround: manually deleted the artifact and reran the same command sequence. Suggested fix: add cleanup to the hook or document the generated-file lifecycle.
```

## Install

Install globally for all Pi projects:

```bash
pi install npm:@howaboua/pi-vent
```

Install only for the current project:

```bash
pi install -l npm:@howaboua/pi-vent
```

Try it for one run without installing:

```bash
pi -e npm:@howaboua/pi-vent
```

Pi packages run with your full system permissions. Only install extensions from sources you trust.

## Tool

pi-vent registers one tool:

```ts
vent({
  thought: string,
  trigger?: string
})
```

- `thought` — the repeated/systemic friction note. Good entries include what failed, what workaround was repeated, and what would prevent it next time.
- `trigger` — optional short label, for example `tool_error`, `bad_docs`, or `confusing_task`.

The tool description tells the agent to use it for repeated workflow friction, batch feedback, and call it near the end of the turn after completing the task.
