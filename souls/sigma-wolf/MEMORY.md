# Memory

## Log

- **2026-06-11**: Initialized Sigma as a standalone merged soul: blunt technical operator, proof-first persistent agent, maintainer-grade standards, no meta-source references.
- **2026-07-04**: When the user asks for a simple version bump plus commit/push, do only the necessary package.json edit and git operation. Do not inspect/read unrelated files or lockfiles unless required by the change or requested.
- **2026-07-04**: For Nix/Home Manager env files, do not put secrets into Nix-managed `home.file` or `home.sessionVariables`; those values enter git or the Nix store. Prefer a local untracked env overlay for API keys and use Nix only for non-secret defaults or sourcing hooks.

- When answering harness system-prompt behavior, distinguish “this fork ships its own default prompt” from “it mutates the user’s installed upstream prompt”; inspect prompt assembly source and tests, because docs can lag the actual wrapper semantics.
When a user forbids global PI_* or XDG_* exports for a new wrapper, do not remove their existing shell-local Pi environment setup unless they explicitly ask; preserve independent pi binary configuration.

- When asked to search env vars by prefix, run the exact prefix search first (`rg OMP_[A-Z0-9_]+`) and only categorize after; do not prematurely narrow to guessed variables.
Pi session JSONL files under ~/.config/pi/agent/sessions store the canonical session id, timestamp, and cwd on the first `type=session` line; later `session_info` records may add a human name.
opencode stores clipboard image attachments as base64 data URLs in the SQLite part table at $XDG_DATA_HOME/opencode/opencode.db (default ~/.local/share/opencode/opencode.db), not as loose image files.
When cleaning /tmp, avoid broad /tmp/.* globs; use dotglob/nullglob or mindepth/maxdepth patterns that include hidden entries without targeting . or .., and preserve /tmp as root:root mode 1777.
Provider-specific usage meters miss wrapper/profile session roots; status integrations should query the log owner and pass explicit session paths.
User's NixOS Sway config sets modifier to Mod1/Alt; internal keyboard+touchpad toggle is Mod1+physical apostrophe (bindcode 48), touchpad-only is Mod1+physical semicolon (bindcode 47).
When a window-manager startup action must enforce device state, add an idempotent script target and call it from startup/reload config; do not reuse a toggle.
When adding a model family to provider-specific allowlists, include the base alias and every documented variant across each provider namespace, then test the allowlist table rather than isolated examples.
For CLI multi-account wrappers used by humans or agents, require an explicit profile and isolate credentials with the tool’s config-directory environment variable rather than mutating a shared active-account setting.
For NixOS-integrated Home Manager, verify that `home.packages` lands in a stable profile already on login `PATH`; `home-manager.useUserPackages = true` uses `/etc/profiles/per-user/$USER`, avoiding packages stranded only in a standalone Home Manager generation.
Shell functions invoked through command substitution run in a subshell, so in-memory cache mutations do not persist; call the function directly and store its rendered output in a variable.
For segmented SVG moves, edit absolute coordinates in each path d value when transforms are disallowed; keep relative deltas and excluded paths unchanged.
Usage-report autodiscovery can omit valid data stored in nonstandard profile roots; verify provider-specific path flags before treating unified totals as complete.
With Next.js Cache Components/PPR, request-bound APIs can throw framework control-flow errors during prospective prerendering; broad application catch blocks must rethrow Next internal errors before logging or converting them to responses.
A dependency lockfile freezes the resolved package graph, not the package-manager binary, runtime, environment, remote inputs, or time-based staleness warnings; diagnose those boundaries separately.
When validating an existing GitHub profile setup, use the configured credentials and SSH agent as-is; never create or replace keys unless explicitly requested.
A multi-account `gh` wrapper that only switches `GH_CONFIG_DIR` does not route SSH identity; SSH clones also require per-profile host/key selection with `IdentitiesOnly`, and Git author/signing identity must be routed separately.
When running Pi management commands from a sandbox or detached subprocess, set `PI_CODING_AGENT_DIR` explicitly; `XDG_CONFIG_HOME` alone does not select Pi's agent directory, and commands may silently inspect the default `~/.pi/agent` instead.
A second CLI install is only truly isolated when both its executable prefix and runtime config/data/cache/state directories are separated; a local package install alone can still share credentials and configuration.
Use `rc` rather than `status` for shell exit-code variables because `status` is read-only in zsh.
When Nix globally enables use-xdg-base-directories but standalone Home Manager cannot inspect osConfig, set `nix.assumeXdg = true`; otherwise Home Manager may target `~/.nix-profile` and invoke `nix-env` against a modern XDG `nix profile`.
For user-facing wrappers that must appear immediately in long-lived shells, manage them under an already-stable `~/.local/bin` path instead of relying only on a mutable Nix profile bin directory.
When a user specifies matching wrapper and root names, verify the exact spelling in both generated configuration and the resulting filesystem path before claiming completion.
In pi, disable an installed package without uninstalling it by replacing its package string with a filter object whose extensions, skills, prompts, and themes arrays are empty; reload or restart pi for the active runtime to drop it.
