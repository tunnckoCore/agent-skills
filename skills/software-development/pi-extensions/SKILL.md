---
name: pi-extensions
description: "Build and package native Pi coding-agent extensions: tools, skills, prompt templates, themes, and project-local Pi homes/settings."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [pi, coding-agent, extensions, skills, tools, memory, packaging]
---

# Pi Extensions

Use this skill when the user asks to build, modify, package, install, or troubleshoot extensions for the `pi` coding assistant.

## Core Rule

Do not scaffold a generic Python/Node/Rust project unless the user explicitly asks for that implementation. Pi already has a native extension/package surface. Start by discovering and using Pi's own extension, skill, prompt-template, theme, settings, and session-directory mechanisms.

## Discovery First

1. Run `pi --help` to confirm the installed Pi CLI and available flags.
2. Run `pi install --help`, `pi list`, and, if needed, `pi config` help/output to understand package installation and resource toggles.
3. Inspect a candidate extension/package only enough to identify its manifest and exported resource shape.
4. Keep the work in the requested project directory, usually under `~/code/<name>`.
5. If the user asks for a standalone Pi distribution/home, prefer project-local configuration:
   - `.pi/settings.json` for local package/resource settings when supported by `pi install -l`.
   - A wrapper script that exports `PI_CODING_AGENT_DIR=<project>/.pi/agent` when the user wants sessions/state isolated to that distribution.

## Hermes-Inspired Feature Mapping

When porting Hermes ideas into Pi, map concepts to Pi-native resources:

- Hermes skills → Pi skill files/directories loaded with `--skill` or packaged as extension resources.
- Hermes tools → Pi extension tools, not replacement built-in tools.
- Hermes memory → project-local memory files plus skills/prompts/tools that read/write them through Pi's allowed tool surface.
- Hermes system prompt mechanics → Pi prompt templates or `--append-system-prompt` resources.
- Hermes profile/home isolation → `PI_CODING_AGENT_DIR` and local `.pi/settings.json`, not global Hermes profiles.

## Workflow

1. Clarify only if the target Pi extension format cannot be discovered locally. Otherwise inspect and act.
2. If the user says "Pi" plus "Hermes skills/tools/memory", treat that as a request for a Pi-native package/extension layer, not a new coding-agent runtime.
3. Create an extension-style directory, not a generic app skeleton.
4. For a local package, include `package.json` with `type: "module"`, `keywords: ["pi-package"]`, and a `pi` manifest such as `{ "extensions": ["./extensions"], "skills": ["./skills"] }`.
5. Add a short README that says how to install locally, for example `pi install -l ./path` when appropriate.
6. Add an executable wrapper only if it improves the requested distribution, e.g. `bin/pi-hermes` that sets `PI_CODING_AGENT_DIR` to the project-local home before invoking `pi --extension "$ROOT"`.
7. Verify without depending on provider billing when possible:
   - `bun -e 'await import("./extensions/name.ts")'` for extension import/syntax.
   - A Bun mock `ExtensionAPI` to assert `registerTool`, `registerCommand`, and event handlers work.
   - `pi install -l ./` and `PI_CODING_AGENT_DIR="$PWD/.pi/agent" pi list` for local package settings.
   - A tiny non-interactive Pi smoke command only if credentials/model setup are available and the user permits model calls.
8. After smoke runs, remove any local auth/session artifacts from the package tree and add `.gitignore` rules for `.pi/agent/auth.json`, db files, sessions, logs, terminal sessions, `node_modules/`, `dist/`, and tarballs.

## Pitfalls

- Do not assume "agent distribution" means writing a new agent runtime.
- Do not create `pyproject.toml`, tests, or package code just because the requested features resemble Hermes internals.
- Do not over-apply TDD before discovering whether the task is packaging/configuration/generation; for Pi packages, first discover Pi's native package format and write the requested extension resources.
- Do not modify Hermes internal files while building Pi extensions.
- Do not install globally when the user requested a new standalone directory; use local install/settings where possible.
- If a live Pi smoke command fails due to provider billing/credentials, do not encode that as a Pi limitation. Verify package mechanics with import checks, a mocked `ExtensionAPI`, and `pi list` instead.
- If the user angrily rejects the direction, stop the wrong path immediately, keep the reply short, and correct the artifact rather than defending the earlier assumption.

## Support Files

- `references/pi-hermes-mechanics-package.md` — concrete notes for packaging Hermes-style skills, memory, tools, project-local Pi home, verification, and cleanup as a standard Pi package.

Session-specific extension-format notes, example manifests, or known-good package layouts should go in `references/` and be linked here when added.
