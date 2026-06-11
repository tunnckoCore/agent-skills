#!/usr/bin/env python3
"""Scan Pi JSONL session logs for retrospective friction signals.

This is intentionally heuristic. It finds sessions worth reading; it does not
replace human/agent judgment.

Usage:
    python3 scripts/scan_pi_sessions.py --since-days 7
    python3 scripts/scan_pi_sessions.py --from-date 2026-06-01 --to-date 2026-06-08
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


UTC = dt.timezone.utc


SIGNALS: dict[str, re.Pattern[str]] = {
    "correction": re.compile(
        r"\b(that'?s wrong|not true|garbage|stupid|noo+|no,|you missed|"
        r"read the (file|docs)|read .* first|stop|again|what the fuck|wtf)\b",
        re.I,
    ),
    "scope_guard": re.compile(
        r"\b(do not|don'?t|without touching|do not edit|read-only|"
        r"ignore|focus only|work only|hold on|do not touch)\b",
        re.I,
    ),
    "ambiguity_loop": re.compile(
        r"\b(i thought|i don'?t understand|why\??|shouldn'?t|can we|"
        r"what .*\?|which|clarification|what do you mean)\b",
        re.I,
    ),
    "implementation_protocol": re.compile(
        r"\b(worktree|branch|commit|push|pull request|pr|run focused tests|"
        r"npm run check|conventional commits|master|main)\b",
        re.I,
    ),
    "tool_or_skill": re.compile(
        r"\b(skill|mcp|server|extension|tool|browser|agent|subagent)\b",
        re.I,
    ),
}

SECRETISH = re.compile(r"(api[_-]?key|token|secret|password|auth|credential)", re.I)


def parse_ts(value: str | None) -> dt.datetime | None:
    if not value:
        return None
    try:
        return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def day_start(value: str) -> dt.datetime:
    return dt.datetime.fromisoformat(value).replace(tzinfo=UTC)


def text_from_content(content: object) -> str:
    if isinstance(content, str):
        return content
    if not isinstance(content, list):
        return ""
    parts: list[str] = []
    for part in content:
        if isinstance(part, dict) and part.get("type") == "text":
            parts.append(str(part.get("text", "")))
    return "\n".join(parts)


def redact(text: str, limit: int = 240) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if SECRETISH.search(text):
        text = SECRETISH.sub("[redacted-keyword]", text)
    if len(text) > limit:
        text = text[: limit - 1].rstrip() + "…"
    return text


@dataclass
class SessionStats:
    path: Path
    session_ts: dt.datetime | None = None
    cwd: str = ""
    models: Counter[str] = field(default_factory=Counter)
    thinking_levels: Counter[str] = field(default_factory=Counter)
    message_counts: Counter[str] = field(default_factory=Counter)
    content_types: Counter[str] = field(default_factory=Counter)
    signal_counts: Counter[str] = field(default_factory=Counter)
    snippets: dict[str, list[str]] = field(default_factory=lambda: defaultdict(list))
    first_msg_ts: dt.datetime | None = None
    last_msg_ts: dt.datetime | None = None

    @property
    def turns(self) -> int:
        return self.message_counts["user"] + self.message_counts["assistant"]

    @property
    def duration_minutes(self) -> float:
        if self.first_msg_ts and self.last_msg_ts and self.last_msg_ts >= self.first_msg_ts:
            return (self.last_msg_ts - self.first_msg_ts).total_seconds() / 60
        return 0.0

    @property
    def score(self) -> int:
        return (
            self.signal_counts["correction"] * 6
            + self.signal_counts["scope_guard"] * 3
            + self.signal_counts["ambiguity_loop"] * 2
            + self.signal_counts["implementation_protocol"]
            + self.signal_counts["tool_or_skill"]
            + min(self.turns, 30)
            + min(int(self.duration_minutes // 10), 12)
            + self.thinking_levels["xhigh"] * 5
            + self.thinking_levels["high"] * 3
        )


def iter_session_files(root: Path) -> Iterable[Path]:
    yield from sorted(root.rglob("*.jsonl"))


def scan_file(path: Path, start: dt.datetime, end: dt.datetime, max_snips: int) -> SessionStats | None:
    stats = SessionStats(path=path)
    include = False

    try:
        lines = path.read_text(errors="ignore").splitlines()
    except OSError:
        return None

    for line in lines:
        if not line.strip():
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue

        typ = obj.get("type")
        ts = parse_ts(obj.get("timestamp"))

        if typ == "session":
            stats.session_ts = ts
            stats.cwd = str(obj.get("cwd", ""))
            if ts and start <= ts < end:
                include = True

        elif typ == "model_change":
            model = obj.get("modelId")
            if model:
                stats.models[str(model)] += 1

        elif typ == "thinking_level_change":
            level = obj.get("thinkingLevel")
            if level:
                stats.thinking_levels[str(level)] += 1

        elif typ == "message":
            if ts and start <= ts < end:
                include = True
            if ts:
                if stats.first_msg_ts is None or ts < stats.first_msg_ts:
                    stats.first_msg_ts = ts
                if stats.last_msg_ts is None or ts > stats.last_msg_ts:
                    stats.last_msg_ts = ts

            msg = obj.get("message", {}) or {}
            role = msg.get("role", "unknown")
            stats.message_counts[str(role)] += 1
            content = msg.get("content", [])
            if isinstance(content, list):
                for part in content:
                    if isinstance(part, dict):
                        stats.content_types[str(part.get("type", "unknown"))] += 1

            if role == "user":
                text = text_from_content(content)
                for name, pattern in SIGNALS.items():
                    if pattern.search(text):
                        stats.signal_counts[name] += 1
                        if len(stats.snippets[name]) < max_snips:
                            stats.snippets[name].append(redact(text))

    if not include:
        return None
    return stats


def format_counter(counter: Counter[str]) -> str:
    if not counter:
        return "-"
    return ", ".join(f"{k}:{v}" for k, v in counter.most_common())


def build_report(stats: list[SessionStats], args: argparse.Namespace, start: dt.datetime, end: dt.datetime) -> str:
    total_sessions = len(stats)
    total_turns = sum(s.turns for s in stats)
    aggregate_signals: Counter[str] = Counter()
    cwd_counts: Counter[str] = Counter()
    model_counts: Counter[str] = Counter()
    thinking_counts: Counter[str] = Counter()

    for s in stats:
        aggregate_signals.update(s.signal_counts)
        if s.cwd:
            cwd_counts[s.cwd] += 1
        model_counts.update(s.models)
        thinking_counts.update(s.thinking_levels)

    ranked = sorted(stats, key=lambda s: (s.score, s.turns), reverse=True)[: args.max_sessions]

    lines: list[str] = []
    lines.append(f"# Conversation Retrospective Scan — {dt.datetime.now(UTC).date()}")
    lines.append("")
    lines.append(f"Window: {start.date()} to {end.date()}")
    lines.append(f"Session root: `{Path(args.session_root).expanduser()}`")
    lines.append("")
    lines.append("## Totals")
    lines.append(f"- Sessions scanned in window: {total_sessions}")
    lines.append(f"- User/assistant message turns: {total_turns}")
    lines.append(f"- Thinking levels seen: {format_counter(thinking_counts)}")
    lines.append(f"- Models seen: {format_counter(model_counts)}")
    lines.append(f"- Friction signals: {format_counter(aggregate_signals)}")
    lines.append("")
    lines.append("## Highest-Friction Sessions")

    if not ranked:
        lines.append("No sessions found in window.")
    for idx, s in enumerate(ranked, 1):
        lines.append("")
        lines.append(f"### {idx}. `{s.path}`")
        lines.append(f"- Score: {s.score}")
        lines.append(f"- CWD: `{s.cwd or '-'}`")
        lines.append(f"- Session timestamp: {s.session_ts.isoformat() if s.session_ts else '-'}")
        lines.append(f"- Turns: {s.turns} ({format_counter(s.message_counts)})")
        lines.append(f"- Duration: {s.duration_minutes:.1f} minutes")
        lines.append(f"- Thinking levels: {format_counter(s.thinking_levels)}")
        lines.append(f"- Signals: {format_counter(s.signal_counts)}")
        for name in SIGNALS:
            if s.snippets.get(name):
                lines.append(f"- {name} evidence:")
                for snip in s.snippets[name]:
                    lines.append(f"  - {snip}")

    lines.append("")
    lines.append("## Project Hotspots")
    for cwd, count in cwd_counts.most_common(12):
        lines.append(f"- `{cwd}` — {count} session(s)")

    lines.append("")
    lines.append("## Heuristic Follow-Up")
    lines.append("- Open the top 3-5 sessions and inspect surrounding turns before deciding on new skills.")
    lines.append("- Map repeated corrections to durable guardrails, not one-off apologies.")
    lines.append("- Convert repeated manual work into a script before proposing a large MCP server.")
    lines.append("- Propose an MCP/server only when persistent state, external APIs, or cross-session search are required.")
    lines.append("- Record durable user preferences in SOUL.md or a memory file if they apply beyond one project.")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--session-root", default=os.path.expanduser("~/.config/pi/agent/sessions"))
    parser.add_argument("--since-days", type=int, default=7)
    parser.add_argument("--from-date", help="Inclusive YYYY-MM-DD; overrides --since-days")
    parser.add_argument("--to-date", help="Exclusive YYYY-MM-DD; defaults to tomorrow UTC")
    parser.add_argument("--max-sessions", type=int, default=12)
    parser.add_argument("--max-snippets", type=int, default=3)
    parser.add_argument("--output", help="Write Markdown report to this path")
    args = parser.parse_args()

    now = dt.datetime.now(UTC)
    if args.from_date:
        start = day_start(args.from_date)
    else:
        start = now - dt.timedelta(days=args.since_days)

    if args.to_date:
        end = day_start(args.to_date)
    else:
        end = now + dt.timedelta(days=1)

    root = Path(args.session_root).expanduser()
    if not root.exists():
        raise SystemExit(f"session root not found: {root}")

    stats = [
        s
        for p in iter_session_files(root)
        if (s := scan_file(p, start, end, args.max_snippets)) is not None
    ]
    report = build_report(stats, args, start, end)

    if args.output:
        out = Path(args.output).expanduser()
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(report + "\n")
        print(f"wrote {out}")
    else:
        print(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
