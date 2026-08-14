## General stuff

I like ambitious ideas, simple systems and solutions, and software that feels obvious. Do not preserve complexity just because it already exists. Do not introduce machinery because it looks architecturally impressive. Understand the real constraint, then fight for the smallest model that makes the correct behavior unsurprising. Do not over-engineer, strive for the minimal working solution - "less is more" mentality.

- DO NOT USE ANY BROWSER IF UNLESS EXPLICITLY ASKED BY A USER. NEVER. NADA.
- NEVER USE A BROWSER. NEVER.
- WHEN YOU ARE GIVEN URL OR NEED TO RESEARCH - NEVER USE A BROWSER, THERE IS CURL AND WEBSEARCH TOOLS, OR ANYTHING ELSE.

Channel both "measure twice, cut once" and "yagni". Fight scope creep. Try to honor the dev's intent in both a minimal and realistic fashion.

The rest of this document is meant to help you navigate the codebase and make changes effectively. Think of these instructions less as "hard rules", more as "good defaults". The developer's preferences should be able to override anything here.

- NEVER USE PYTHON. UNDER ANY CIRCUMSTANCES. NEVER. NADA. PERIOD.
- Don't verify with browsers or computer use unless the user explicitly agrees or requests it.
- in tanstack start projects, always prefer the file-based routing the `src/routes/foo/bar/qux` not dot-notation based ones.
- always prefer TailwindCSS, even when desigining a single html file pages - in such cases you can use the tailwind cdn.
- If you are asked to replace occurances, you can just use bash tool with `sed`/`awk` or similar.
- NEVER edit files with python, try to use the native `fs_edit` tool or other `edit` tool, then fallback to `bash`/`shell_exec`.
- Think before you do dumb shit. Always prefer and use the built-in tools when possible.
- Always prefer `rg` instead of native OS `grep`.
- Always prefer `fd` instead of native OS `find`.
- Never hard-wrap prose. Keep each paragraph on one line.
- Follow Zinsser's four principles of quality writing: 1. Simplicity 2. Brevity 3. Clarity 4. Humanity.
- Clone a repository into `~/repos` only when the user explicitly asks for a clone or the task genuinely requires source-level inspection or modification. A URL, installer, package, documentation page, or incidental GitHub reference is not permission to clone. Prefer release metadata, published artifacts, and documentation when they are sufficient. Before cloning, state the concrete source-level reason.
- git and gh are routed by `gitswitch`. Inspect the repository remote url: if it includes `tunnckoCore` use `gitswitch switch tunnckoCore` and if it includes `olstenlarck` use `gitswitch switch olstenlarck`.
- Git transport is SSH-only - both auth and signing - and SSH commit/tag signing is required. Both GitHub accounts use distinct P-256 keys for authentication and signing.
- For git/gh ops: never change a remote to HTTPS. Do NOT install/use an HTTPS credential helper, do NOT run `gh auth setup-git`; do NOT migrate/copy authentication state, or change GitHub authentication/protocol state unless explicitly requested.
- never USE the `npm` and `npx` commands - most of the times it's `bun`/`bunx` or `pnpm`/`pnpx` - detect by looking for lockfiles in the workspace
- never RUN `npm` commands. Ask if the user is sure before proceeding - but only if there is no other way.
- if asked about nixos and to update something on it - assume that it gets build with `~/nixos-config` - you are running on NixOS system.
- Validate NixOS/Home Manager changes with `nix build --no-link`.
- Never activate or switch configurations unless explicitly authorized.
- if some POSIX tool or CLI program is missing (like `cloudflared`), use nixos shellrun (like `nix run nixpkgs#cloudflared -- tunnel` but for other missing programs) or ask/suggest if the user wants to be added to his system config at `~/nixos-config`.

## Clean Code and Product Design (UI)

- when writing code or working on projects, always read `~/skills/clean_code.md` file and follow its instructions.
- When designing a webapp or single-page html file, always read and follow `~/skills/product_design.md`

## Pull requests

- Never make a PR unless the developer explicitly asks you to do so.
- Never make draft PRs, always a real PRs - they run PR review bots
- Conventional commit titles, plain language: `fix(web): new threads no longer spike CPU`.
- Body: the problem in a sentence or two, then how you fixed it. End with the model and harness that did the work.
- **Rebase onto latest main before opening.** Stale branches conflict and burn a review round.
- UI changes need before/after images. Motion or timing needs a short video.
- One concern per PR. If the description says "also", split it.
- When babysitting: poll checks and comments newer than the last push, verify each bot finding against the source, fix real ones, dismiss false positives with a written reason. Stay quiet when nothing is new. Stop when the bots are green on the latest commit.
