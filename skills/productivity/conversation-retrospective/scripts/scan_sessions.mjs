import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const SOURCES = ["pi", "codex", "claude"];
const UTC_DAY = 86_400_000;
const SIGNALS = {
  correction: /\b(that'?s wrong|not true|garbage|stupid|noo+|no,|you missed|read the (file|docs)|read .* first|stop|again|what the fuck|wtf)\b/i,
  scope_guard: /\b(do not|don'?t|without touching|do not edit|read-only|ignore|focus only|work only|hold on|do not touch)\b/i,
  ambiguity_loop: /\b(i thought|i don'?t understand|why\??|shouldn'?t|can we|what .*\?|which|clarification|what do you mean)\b/i,
  implementation_protocol: /\b(worktree|branch|commit|push|pull request|pr|run focused tests|npm run check|conventional commits|master|main)\b/i,
  tool_or_skill: /\b(skill|mcp|server|extension|tool|browser|agent|subagent)\b/i,
};

function printHelp() {
  console.log(`Scan Pi, Codex, and Claude JSONL session logs for retrospective friction signals.

Usage:
  bun scripts/scan_sessions.mjs [options]

Options:
  --source <pi|codex|claude>  Scan only this source; repeat to select more than one
  --root <source>=<path>      Override a source root; repeat to add another root
  --since-days <number>       Look back this many days (default: 7)
  --from-date <YYYY-MM-DD>    Inclusive start date; overrides --since-days
  --to-date <YYYY-MM-DD>      Exclusive end date
  --max-sessions <number>     Maximum ranked sessions in the report (default: 12)
  --max-snippets <number>     Maximum evidence snippets per signal (default: 3)
  --output <path>             Write the Markdown report to this path
  --help                      Show this help`);
}

function takeValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

function positiveInteger(value, option) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${option} must be a positive integer`);
  }
  return parsed;
}

function parseArgs(argv) {
  const options = {
    sources: new Set(),
    roots: new Map(),
    sinceDays: 7,
    fromDate: null,
    toDate: null,
    maxSessions: 12,
    maxSnippets: 3,
    output: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === "--help") {
      printHelp();
      process.exit(0);
    }

    const value = takeValue(argv, index, option);
    index += 1;

    if (option === "--source") {
      if (!SOURCES.includes(value)) {
        throw new Error(`unknown source: ${value}`);
      }
      options.sources.add(value);
    } else if (option === "--root") {
      const separator = value.indexOf("=");
      const source = value.slice(0, separator);
      const root = value.slice(separator + 1);
      if (separator < 1 || !SOURCES.includes(source) || !root) {
        throw new Error("--root must use <pi|codex|claude>=<path>");
      }
      const roots = options.roots.get(source) ?? [];
      roots.push(resolve(expandHome(root)));
      options.roots.set(source, roots);
    } else if (option === "--since-days") {
      options.sinceDays = positiveInteger(value, option);
    } else if (option === "--from-date") {
      options.fromDate = value;
    } else if (option === "--to-date") {
      options.toDate = value;
    } else if (option === "--max-sessions") {
      options.maxSessions = positiveInteger(value, option);
    } else if (option === "--max-snippets") {
      options.maxSnippets = positiveInteger(value, option);
    } else if (option === "--output") {
      options.output = resolve(expandHome(value));
    } else {
      throw new Error(`unknown option: ${option}`);
    }
  }

  return options;
}

function expandHome(value) {
  if (value === "~") {
    return homedir();
  }
  if (value.startsWith("~/")) {
    return join(homedir(), value.slice(2));
  }
  return value;
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => resolve(value)))];
}

function defaultRoots() {
  const piHome = process.env.PI_CODING_AGENT_DIR ? expandHome(process.env.PI_CODING_AGENT_DIR) : null;
  const codexHome = process.env.CODEX_HOME ? expandHome(process.env.CODEX_HOME) : null;
  const claudeHome = process.env.CLAUDE_CONFIG_DIR ? expandHome(process.env.CLAUDE_CONFIG_DIR) : join(homedir(), ".claude");

  return {
    pi: unique([piHome ? join(piHome, "sessions") : null]),
    codex: unique([
      codexHome ? join(codexHome, "sessions") : null,
      join(homedir(), ".local/share/codex/sessions"),
      join(homedir(), ".codex/sessions"),
    ]),
    claude: [join(claudeHome, "projects")],
  };
}

function parseDay(value, option) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${option} must use YYYY-MM-DD`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`${option} is not a valid date`);
  }
  return date;
}

function reviewWindow(options) {
  const now = new Date();
  const start = options.fromDate ? parseDay(options.fromDate, "--from-date") : new Date(now.getTime() - options.sinceDays * UTC_DAY);
  const end = options.toDate ? parseDay(options.toDate, "--to-date") : now;
  if (start >= end) {
    throw new Error("review window start must be before its end");
  }
  return { start, end };
}

function* jsonlFiles(root) {
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return;
  }

  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      yield* jsonlFiles(path);
    } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
      yield path;
    }
  }
}

function counter() {
  return new Map();
}

function increment(values, key, amount = 1) {
  if (key) {
    values.set(String(key), (values.get(String(key)) ?? 0) + amount);
  }
}

function createStats(source, path) {
  return {
    source,
    path,
    sessionTs: null,
    cwd: "",
    models: counter(),
    reasoningLevels: counter(),
    messageCounts: counter(),
    contentTypes: counter(),
    signalCounts: counter(),
    snippets: new Map(),
    firstMsgTs: null,
    lastMsgTs: null,
    reasoningEvents: 0,
    currentTurnId: null,
    currentModel: null,
    seenMessages: new Set(),
    seenModels: new Set(),
  };
}

function parseTimestamp(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isInWindow(timestamp, start, end) {
  return timestamp && timestamp >= start && timestamp < end;
}

function contentParts(content) {
  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }
  if (!Array.isArray(content)) {
    return [];
  }
  return content.filter((part) => part && typeof part === "object");
}

function textFromContent(content) {
  return contentParts(content)
    .filter((part) => ["text", "input_text", "output_text"].includes(part.type))
    .map((part) => part.text ?? "")
    .join("\n");
}

function redact(text, limit = 240) {
  let redacted = text.replace(/\s+/g, " ").trim();
  redacted = redacted.replace(/\b(api[_ -]?key|token|secret|password|authorization|credential)\b(\s*[:=]\s*|\s+)[^\s,;]+/gi, "$1$2[redacted]");
  redacted = redacted.replace(/\b(Bearer\s+)[A-Za-z0-9._~+/=-]+/gi, "$1[redacted]");
  if (redacted.length > limit) {
    return `${redacted.slice(0, limit - 1).trimEnd()}…`;
  }
  return redacted;
}

function recordSignals(stats, text, maxSnippets) {
  for (const [name, pattern] of Object.entries(SIGNALS)) {
    if (!pattern.test(text)) {
      continue;
    }
    increment(stats.signalCounts, name);
    const snippets = stats.snippets.get(name) ?? [];
    if (snippets.length < maxSnippets) {
      snippets.push(redact(text));
      stats.snippets.set(name, snippets);
    }
  }
}

function recordContent(stats, content) {
  for (const part of contentParts(content)) {
    increment(stats.contentTypes, part.type ?? "unknown");
    if (["thinking", "reasoning"].includes(part.type)) {
      stats.reasoningEvents += 1;
    }
  }
}

function recordModel(stats, model, key) {
  if (!model || stats.seenModels.has(key)) {
    return;
  }
  stats.seenModels.add(key);
  increment(stats.models, model);
}

function recordMessage(stats, { key, role, timestamp, content, text, maxSnippets }) {
  if (timestamp) {
    if (!stats.firstMsgTs || timestamp < stats.firstMsgTs) {
      stats.firstMsgTs = timestamp;
    }
    if (!stats.lastMsgTs || timestamp > stats.lastMsgTs) {
      stats.lastMsgTs = timestamp;
    }
  }

  recordContent(stats, content);
  if (stats.seenMessages.has(key)) {
    return;
  }

  stats.seenMessages.add(key);
  increment(stats.messageCounts, role);
  if (role === "user" && text) {
    recordSignals(stats, text, maxSnippets);
  }
}

function scanPiRecord(stats, object, timestamp, inWindow, maxSnippets) {
  if (object.type === "session") {
    stats.sessionTs = timestamp ?? stats.sessionTs;
    stats.cwd = String(object.cwd ?? stats.cwd);
  } else if (object.type === "model_change") {
    stats.currentModel = object.modelId ?? stats.currentModel;
  } else if (object.type === "thinking_level_change" && inWindow) {
    increment(stats.reasoningLevels, object.thinkingLevel);
  }

  if (object.type !== "message" || !inWindow) {
    return;
  }
  const message = object.message ?? {};
  if (message.role === "user") {
    stats.currentTurnId = object.id ?? object.timestamp;
    recordMessage(stats, {
      key: `pi:user:${stats.currentTurnId}`,
      role: "user",
      timestamp,
      content: message.content,
      text: textFromContent(message.content),
      maxSnippets,
    });
  } else if (message.role === "assistant") {
    const turn = stats.currentTurnId ?? object.id ?? object.timestamp;
    recordModel(stats, message.model ?? stats.currentModel, `pi:assistant:${turn}`);
    recordMessage(stats, {
      key: `pi:assistant:${turn}`,
      role: "assistant",
      timestamp,
      content: message.content,
      text: "",
      maxSnippets,
    });
  }
}

function scanCodexRecord(stats, object, timestamp, inWindow, maxSnippets) {
  const payload = object.payload ?? {};
  if (object.type === "session_meta") {
    stats.sessionTs = timestamp ?? stats.sessionTs;
    stats.cwd = String(payload.cwd ?? stats.cwd);
  } else if (object.type === "event_msg" && payload.type === "task_started") {
    stats.currentTurnId = payload.turn_id ?? object.timestamp;
  } else if (object.type === "turn_context" && inWindow) {
    stats.cwd = String(payload.cwd ?? stats.cwd);
    recordModel(stats, payload.model, `codex:model:${payload.turn_id ?? object.timestamp}`);
    increment(stats.reasoningLevels, payload.effort);
  } else if (object.type === "response_item" && payload.type === "reasoning" && inWindow) {
    stats.reasoningEvents += 1;
  }

  if (object.type !== "event_msg" || !inWindow) {
    return;
  }
  if (payload.type === "user_message") {
    const turn = stats.currentTurnId ?? object.timestamp;
    recordMessage(stats, {
      key: `codex:user:${turn}`,
      role: "user",
      timestamp,
      content: [{ type: "text", text: payload.message ?? "" }],
      text: String(payload.message ?? ""),
      maxSnippets,
    });
  } else if (payload.type === "agent_message") {
    const turn = stats.currentTurnId ?? object.timestamp;
    recordMessage(stats, {
      key: `codex:assistant:${turn}`,
      role: "assistant",
      timestamp,
      content: [{ type: "text", text: payload.message ?? "" }],
      text: "",
      maxSnippets,
    });
  }
}

function scanClaudeRecord(stats, object, timestamp, inWindow, maxSnippets) {
  if (timestamp && (!stats.sessionTs || timestamp < stats.sessionTs)) {
    stats.sessionTs = timestamp;
  }
  stats.cwd = String(object.cwd ?? stats.cwd);
  if (!inWindow || !["user", "assistant"].includes(object.type)) {
    return;
  }

  const message = object.message ?? {};
  const parts = contentParts(message.content);
  const text = textFromContent(message.content);
  if (object.type === "user" && text) {
    stats.currentTurnId = object.uuid ?? object.promptId ?? object.timestamp;
    recordMessage(stats, {
      key: `claude:user:${stats.currentTurnId}`,
      role: "user",
      timestamp,
      content: parts,
      text,
      maxSnippets,
    });
  } else if (object.type === "assistant") {
    const turn = stats.currentTurnId ?? object.requestId ?? object.uuid ?? object.timestamp;
    recordModel(stats, message.model, `claude:assistant:${turn}`);
    recordMessage(stats, {
      key: `claude:assistant:${turn}`,
      role: "assistant",
      timestamp,
      content: parts,
      text: "",
      maxSnippets,
    });
  }
}

function scanFile(source, path, start, end, maxSnippets) {
  const stats = createStats(source, path);
  let included = false;
  let lines;
  try {
    lines = readFileSync(path, "utf8").split("\n");
  } catch {
    return null;
  }

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }
    let object;
    try {
      object = JSON.parse(line);
    } catch {
      continue;
    }

    const timestamp = parseTimestamp(object.timestamp ?? object.message?.timestamp);
    const inWindow = isInWindow(timestamp, start, end);
    included ||= Boolean(inWindow);
    if (source === "pi") {
      scanPiRecord(stats, object, timestamp, inWindow, maxSnippets);
    } else if (source === "codex") {
      scanCodexRecord(stats, object, timestamp, inWindow, maxSnippets);
    } else {
      scanClaudeRecord(stats, object, timestamp, inWindow, maxSnippets);
    }
  }

  return included ? stats : null;
}

function counterEntries(values) {
  return [...values.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

function formatCounter(values) {
  const entries = counterEntries(values);
  return entries.length ? entries.map(([key, count]) => `${key}:${count}`).join(", ") : "-";
}

function mergeCounter(target, source) {
  for (const [key, count] of source) {
    increment(target, key, count);
  }
}

function turns(stats) {
  return (stats.messageCounts.get("user") ?? 0) + (stats.messageCounts.get("assistant") ?? 0);
}

function durationMinutes(stats) {
  if (!stats.firstMsgTs || !stats.lastMsgTs || stats.lastMsgTs < stats.firstMsgTs) {
    return 0;
  }
  return (stats.lastMsgTs - stats.firstMsgTs) / 60_000;
}

function score(stats) {
  return (
    (stats.signalCounts.get("correction") ?? 0) * 6 +
    (stats.signalCounts.get("scope_guard") ?? 0) * 3 +
    (stats.signalCounts.get("ambiguity_loop") ?? 0) * 2 +
    (stats.signalCounts.get("implementation_protocol") ?? 0) +
    (stats.signalCounts.get("tool_or_skill") ?? 0) +
    Math.min(turns(stats), 30) +
    Math.min(Math.floor(durationMinutes(stats) / 10), 12) +
    (stats.reasoningLevels.get("xhigh") ?? 0) * 5 +
    (stats.reasoningLevels.get("high") ?? 0) * 3 +
    Math.min(stats.reasoningEvents, 10)
  );
}

function sourceName(source) {
  return source[0].toUpperCase() + source.slice(1);
}

function buildReport(stats, roots, missingRoots, options, start, end) {
  const aggregateSignals = counter();
  const modelCounts = counter();
  const reasoningLevels = counter();
  const sourceCounts = counter();
  const cwdCounts = counter();
  for (const session of stats) {
    mergeCounter(aggregateSignals, session.signalCounts);
    mergeCounter(modelCounts, session.models);
    mergeCounter(reasoningLevels, session.reasoningLevels);
    increment(sourceCounts, session.source);
    if (session.cwd) {
      increment(cwdCounts, `${sourceName(session.source)} · ${session.cwd}`);
    }
  }

  const ranked = [...stats]
    .sort((left, right) => score(right) - score(left) || turns(right) - turns(left))
    .slice(0, options.maxSessions);
  const lines = [
    `# Conversation Retrospective Scan — ${new Date().toISOString().slice(0, 10)}`,
    "",
    `Window: ${start.toISOString()} to ${end.toISOString()}`,
    `Sources: ${[...new Set(roots.map(({ source }) => sourceName(source)))].join(", ") || "none"}`,
    "",
    "## Session Roots",
  ];

  for (const { source, root } of roots) {
    lines.push(`- ${sourceName(source)}: \`${root}\``);
  }
  for (const { source, root } of missingRoots) {
    lines.push(`- ${sourceName(source)}: \`${root}\` (not found)`);
  }

  lines.push(
    "",
    "## Totals",
    `- Sessions scanned in window: ${stats.length} (${formatCounter(sourceCounts)})`,
    `- User/assistant turns: ${stats.reduce((total, session) => total + turns(session), 0)}`,
    `- Reasoning levels seen: ${formatCounter(reasoningLevels)}`,
    `- Models seen: ${formatCounter(modelCounts)}`,
    `- Friction signals: ${formatCounter(aggregateSignals)}`,
    "",
    "## Highest-Friction Sessions",
  );

  if (!ranked.length) {
    lines.push("No sessions found in the window.");
  }
  ranked.forEach((session, index) => {
    lines.push(
      "",
      `### ${index + 1}. ${sourceName(session.source)} · \`${session.path}\``,
      `- Score: ${score(session)}`,
      `- CWD: \`${session.cwd || "-"}\``,
      `- Session timestamp: ${session.sessionTs?.toISOString() ?? "-"}`,
      `- Turns: ${turns(session)} (${formatCounter(session.messageCounts)})`,
      `- Duration: ${durationMinutes(session).toFixed(1)} minutes`,
      `- Models: ${formatCounter(session.models)}`,
      `- Reasoning: ${formatCounter(session.reasoningLevels)}; events:${session.reasoningEvents}`,
      `- Signals: ${formatCounter(session.signalCounts)}`,
    );
    for (const name of Object.keys(SIGNALS)) {
      const snippets = session.snippets.get(name);
      if (!snippets?.length) {
        continue;
      }
      lines.push(`- ${name} evidence:`);
      for (const snippet of snippets) {
        lines.push(`  - ${snippet}`);
      }
    }
  });

  lines.push("", "## Project Hotspots");
  for (const [cwd, count] of counterEntries(cwdCounts).slice(0, 12)) {
    lines.push(`- \`${cwd}\` — ${count} session(s)`);
  }

  lines.push(
    "",
    "## Heuristic Follow-Up",
    "- Open the top 3-5 sessions and inspect surrounding turns before deciding on improvements.",
    "- Preserve each source label and separate shared improvements from harness-specific configuration.",
    "- Map repeated corrections to durable guardrails instead of one-off apologies.",
    "- Convert repeated manual work into a script before proposing a large MCP server.",
    "- Propose an MCP server only when persistent state, external APIs, or cross-session search are required.",
    "- Store durable preferences in the appropriate shared instruction, harness instruction, or memory file.",
    "",
  );
  return lines.join("\n");
}

function selectedRoots(options) {
  const defaults = defaultRoots();
  const selectedSources = options.sources.size ? [...options.sources] : SOURCES;
  const roots = [];
  const missingRoots = [];
  for (const source of selectedSources) {
    const candidates = options.roots.get(source) ?? defaults[source];
    for (const root of unique(candidates)) {
      const item = { source, root };
      if (existsSync(root)) {
        roots.push(item);
      } else {
        missingRoots.push(item);
      }
    }
  }
  return { roots, missingRoots };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const { start, end } = reviewWindow(options);
  const { roots, missingRoots } = selectedRoots(options);
  const stats = [];
  const scannedPaths = new Set();

  for (const { source, root } of roots) {
    for (const path of jsonlFiles(root)) {
      const identity = `${source}:${resolve(path)}`;
      if (scannedPaths.has(identity)) {
        continue;
      }
      scannedPaths.add(identity);
      const session = scanFile(source, path, start, end, options.maxSnippets);
      if (session) {
        stats.push(session);
      }
    }
  }

  const report = buildReport(stats, roots, missingRoots, options, start, end);
  if (options.output) {
    mkdirSync(dirname(options.output), { recursive: true });
    writeFileSync(options.output, `${report}\n`);
    console.log(`wrote ${options.output}`);
  } else {
    console.log(report);
  }
}

try {
  main();
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}
