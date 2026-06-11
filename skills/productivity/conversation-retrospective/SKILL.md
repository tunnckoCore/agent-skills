---
name: conversation-retrospective
description: >
  Reviews recent Pi conversation/session logs to find repeated friction,
  ambiguity loops, expensive reasoning, user corrections, and missing skills,
  MCP servers, scripts, or workflow guardrails. Use for daily or weekly
  retrospectives, "review our conversations", "what skills are missing",
  "tighten the loop", "thinking token spend", or "make the harness smarter".
---

# Conversation Retrospective

Use this skill to turn recent work into system improvements. The goal is not a
vibe recap; the goal is to identify places where the agent spent too much
reasoning, needed too much back-and-forth, violated user preferences, or lacked
the right skill/tool/MCP server — then propose the smallest delta that prevents
the same failure next week.

Default Pi session root for this machine: `~/.config/pi/agent/sessions/`.
There is no `~/.pi` here unless the user explicitly says otherwise.

## Workflow

### Step 1: Set the review window

- If the user says "daily", scan the last 1 day.
- If the user says "weekly" or does not specify, scan the last 7 days.
- If they give dates, use exact dates.
- If this is run by a scheduled job, write the report to a stable file under
  the current repo, e.g. `retrospectives/YYYY-MM-DD-conversation-retro.md`,
  unless the user gave another destination.

### Step 2: Generate the evidence pack

Run the bundled scanner from the skill directory:

```bash
python3 scripts/scan_pi_sessions.py --since-days 7
```

Useful variants:

```bash
python3 scripts/scan_pi_sessions.py --since-days 1 --max-sessions 8
python3 scripts/scan_pi_sessions.py --from-date 2026-06-01 --to-date 2026-06-08
python3 scripts/scan_pi_sessions.py --session-root ~/.config/pi/agent/sessions --output /tmp/retro.md
```

The script is a triage tool. Treat its output as evidence, not conclusions.
Open the highest-friction session files and inspect the surrounding turns before
making a recommendation.

### Step 3: Look for the loop-tightening patterns

For each high-friction session, classify the failure mode:

- **Missing workflow skill**: user repeatedly had to specify the same mode,
  sequence, branch policy, testing policy, or review checklist.
- **Missing domain skill**: user corrected basic domain facts, docs, product
  behavior, project conventions, or architecture assumptions.
- **Missing tool/script**: the agent manually did repeated mechanical work that
  should be deterministic.
- **Missing MCP/server/integration**: the task needed a persistent external
  capability: browser, docs retrieval, issue tracker, memory search, database,
  repo intelligence, visual inspection, etc.
- **Missing guardrail**: the agent touched files during exploration, ignored a
  "do not" constraint, overbuilt, used the wrong root, or failed to read the
  named files first.
- **Missing memory/SOUL update**: the user preference is durable and should be
  carried forward rather than rediscovered.

Prefer concrete, reusable causes over one-off blame. If the same correction
appears twice, it is probably a system requirement.

### Step 4: Calculate the delta

For every candidate improvement, answer:

1. What exact moment would have gone differently?
2. What would the agent have done first if this skill/tool existed?
3. How many turns or failed attempts would it likely remove?
4. Is the fix a skill, script, MCP server, config change, SOUL update, or docs?
5. What is the smallest implementation that captures 80% of the value?

Do not recommend broad "be more careful" fixes. Convert them into executable
rules, checklists, scripts, or triggerable skills.

### Step 5: Produce the retrospective report

Use this structure:

```markdown
# Conversation Retrospective — YYYY-MM-DD

Window: YYYY-MM-DD to YYYY-MM-DD
Session root: ~/.config/pi/agent/sessions

## Executive Summary
- [1-3 bullets: biggest recurring bottlenecks]

## High-Friction Episodes
| Session | Signal | What happened | Missing capability |
|---|---|---|---|

## Pattern Inventory
1. **Pattern name** — evidence, why it matters, recurrence.
2. ...

## Recommended Deltas
| Priority | Delta | Type | Why it tightens the loop | First implementation step |
|---|---|---|---|---|

## Skills To Create or Update
- `skill-name`: trigger, workflow, validation check.

## MCP / Tooling Opportunities
- Tool/server idea: capability, inputs, outputs, failure modes.

## SOUL / Memory Updates
- Durable preference or operating rule to preserve.

## Next Week Guardrails
- [ ] Concrete behavior to enforce next week.
```

### Step 6: Act on the smallest high-value improvement

If the user asks you to implement, do one small improvement immediately: create
or patch the skill, script, SOUL entry, or config. Validate it. Do not create a
large platform before proving the loop closes.

## User-Specific Interpretation Rules

- Treat profanity or sharp corrections as signal, not as personal hostility.
  The correction usually encodes a durable preference.
- The user values concise, file-path-specific findings, not generic advice.
- If the user says "explore", "review", or "do not edit", stay read-only.
- If the user says "implementer", use the exact worktree/branch/root they gave.
- Prefer reading named files and docs before answering. Do not hallucinate API
  behavior the repo can answer.
- When suggesting tools, include the exact delta: what turns disappear, what
  ambiguity is removed, and how it would have changed a real session.

## Quality Checklist

Before finalizing a retro:

- [ ] At least three concrete evidence points were checked from session logs.
- [ ] Each recommendation maps to a repeated friction pattern.
- [ ] Every "skill needed" has a trigger phrase and first workflow step.
- [ ] Tool/MCP ideas include inputs, outputs, and when not to use them.
- [ ] The report distinguishes evidence from inference.
- [ ] The final answer is short and action-oriented unless asked for detail.

## Common Mistakes

- **Only summarizing conversations**: the output must improve the harness.
- **Confusing one-off task complexity with missing skill**: require recurrence
  or high severity.
- **Recommending giant MCP servers first**: start with a skill or script unless
  persistent state or external APIs are truly required.
- **Ignoring the user's constraints**: constraint violations are first-class
  retro items.
- **Over-indexing on raw counts**: use script metrics to choose sessions, then
  read the actual turns.
