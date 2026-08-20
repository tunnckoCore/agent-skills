---
name: conversation-retrospective
description: Use only when explicitly requested. Use to scan the conversations or session logs with coding agents (pi/codex/claude) to find repeated friction, ambiguity loops, expensive reasoning, user corrections, and missing skills, MCP servers, scripts, memory, or workflow guardrails. Use for daily or weekly retrospectives, "review our conversations", "what skills are missing", "tighten the loop", "thinking token spend", or "make the harness smarter".
---

# Conversation Retrospective

Turn recent agent work into small system improvements. Identify where an agent spent too much reasoning, needed too much back-and-forth, violated user preferences, or lacked the right skill, tool, or integration. Propose the smallest delta that prevents the same failure next week.

Support Pi, Codex, and Claude logs. Scan every available source by default, or limit the scan when the user names a harness.

## Workflow

### Step 1: Set the review window

- use bun or node, prefer Bun if installed (this skill references use `bun`).
- Scan the last 1 day when the user says "daily".
- Scan the last 7 days when the user says "weekly" or gives no window.
- Use exact dates when the user provides them.
- Write scheduled reports to `<this-skill-repo>/retrospectives/YYYY-MM-DD-conversation-retro.md` (when arcka/tunnckoCore/olstenlarck it is `~/skills/` rpeo) unless the user provides another destination.

### Step 2: Generate the evidence pack

Run the bundled scanner from the skill directory:

```bash
bun scripts/scan_sessions.mjs --since-days 7
```

The scanner discovers these roots when they exist:

| Source | Default roots |
|---|---|
| Pi | `$PI_CODING_AGENT_DIR/sessions` |
| Codex | `$CODEX_HOME/sessions`, `~/.local/share/codex/sessions`, `~/.codex/sessions` |
| Claude | `$CLAUDE_CONFIG_DIR/projects`, `~/.claude/projects` |

Use focused or custom scans when needed:

```bash
bun scripts/scan_sessions.mjs --since-days 1 --max-sessions 8
bun scripts/scan_sessions.mjs --from-date 2026-06-01 --to-date 2026-06-08
bun scripts/scan_sessions.mjs --source codex
bun scripts/scan_sessions.mjs --source pi --source claude
bun scripts/scan_sessions.mjs --source claude --root claude=~/.claude/projects --output /tmp/retro.md
```

Treat scanner output as triage evidence, not conclusions. Open the highest-friction session files and inspect the surrounding turns before making a recommendation. Preserve source labels because similar signals can require different Pi, Codex, or Claude configuration changes.

### Step 3: Classify loop-tightening patterns

- **Missing workflow skill**: The user repeatedly specified the same mode, sequence, branch policy, testing policy, or review checklist.
- **Missing domain skill**: The user corrected domain facts, documentation, product behavior, project conventions, or architecture assumptions.
- **Missing tool or script**: The agent repeated mechanical work that should be deterministic.
- **Missing MCP server or integration**: The task needed a persistent external capability such as browser access, documentation retrieval, issue tracking, memory search, database access, repository intelligence, or visual inspection.
- **Missing guardrail**: The agent edited during exploration, ignored a constraint, overbuilt, used the wrong root, or failed to read named files first.
- **Missing durable instruction or memory**: A user preference should live in the harness's persistent instruction or memory mechanism instead of being rediscovered.

Prefer concrete, reusable causes over one-off blame. Treat a correction that appears twice as a likely system requirement.

### Step 4: Calculate the delta

For every candidate improvement, answer:

1. What exact moment would have gone differently?
2. What would the agent have done first if this capability existed?
3. How many turns or failed attempts would it likely remove?
4. Is the fix a skill, script, MCP server, config change, durable instruction, memory update, or documentation change?
5. What is the smallest implementation that captures 80% of the value?
6. Is the delta harness-neutral, or must it target Pi, Codex, or Claude?

Do not recommend broad "be more careful" fixes. Convert them into executable rules, checklists, scripts, configuration, or triggerable skills. Prefer a shared skill or script when all harnesses need the same behavior; use harness-specific configuration only when the underlying capability differs.

### Step 5: Produce the retrospective report

Use this structure:

```markdown
# Conversation Retrospective — YYYY-MM-DD

Window: YYYY-MM-DD to YYYY-MM-DD
Sources: Pi, Codex, Claude
Session roots: [roots actually scanned]

## Executive Summary
- [1-3 bullets: biggest recurring bottlenecks]

## High-Friction Episodes
| Source | Session | Signal | What happened | Missing capability |
|---|---|---|---|---|

## Pattern Inventory
1. **Pattern name** — evidence, why it matters, recurrence, affected harnesses.

## Recommended Deltas
| Priority | Delta | Scope | Type | Why it tightens the loop | First implementation step |
|---|---|---|---|---|---|

## Skills To Create or Update
- `skill-name`: trigger, workflow, validation check.

## MCP / Tooling Opportunities
- Tool or server idea: capability, inputs, outputs, failure modes, supported harnesses.

## Durable Instruction / Memory Updates
- Preference or operating rule: destination such as `AGENTS.md`, `CLAUDE.md`, `SOUL.md`, or harness memory.

## Next Week Guardrails
- [ ] Concrete behavior to enforce next week.
```

### Step 6: Act on the smallest high-value improvement

When the user asks for implementation, make one small improvement immediately: patch the skill, script, instruction file, memory entry, or configuration and validate the changed behavior. Do not create a platform before proving the loop closes.

## Interpretation Rules

- Treat profanity or sharp corrections as signal, not personal hostility. The correction usually encodes a durable preference.
- Give concise, file-path-specific findings instead of generic advice.
- Stay read-only when the user says "explore", "review", or "do not edit".
- Use the exact worktree, branch, and root when the user provides them.
- Read named files and local documentation before answering. Do not invent behavior the repository or session log can answer.
- State which harness produced each evidence point and whether the proposed fix applies to one harness or all of them.
- Include the exact delta when suggesting tooling: which turns disappear, which ambiguity goes away, and how the tool would have changed a real session.

## Quality Checklist

- [ ] Check at least three concrete evidence points from session logs.
- [ ] Map each recommendation to repeated friction or one high-severity failure.
- [ ] Give every proposed skill a trigger phrase and first workflow step.
- [ ] Give tool and MCP ideas inputs, outputs, failure modes, and supported harnesses.
- [ ] Distinguish evidence from inference.
- [ ] Distinguish shared improvements from Pi-, Codex-, or Claude-specific configuration.
- [ ] Keep the final answer short and action-oriented unless the user asks for detail.

## Common Mistakes

- **Only summarizing conversations**: Improve the harness instead.
- **Treating one log format as universal**: Keep source-specific parsing and source labels.
- **Confusing one-off task complexity with a missing skill**: Require recurrence or high severity.
- **Recommending a large MCP server first**: Start with a skill or script unless persistent state or external APIs are required.
- **Ignoring user constraints**: Treat constraint violations as first-class retrospective items.
- **Over-indexing on raw counts**: Use metrics to choose sessions, then read the actual turns.
