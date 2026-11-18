import { readFileSync } from "node:fs";
import { join } from "node:path";
import { repair, validate } from "@chartkitdev/core/validate";
import { paintSpec } from "../lib/chartkit";
import { repoRoot } from "../lib/repo-root";

/**
 * The homepage repair replay.
 *
 * Every case is a first answer recorded in the agent eval (round 6, claude-sonnet-4-5, no docs),
 * read from the raw rows in `bench/results/agent/round-6/no-docs.jsonl`. Nothing here is written
 * by hand: the diagnostics come from validate(), the fixes from repair(), and the picture from
 * render(), all at build time. The browser only plays the result back.
 *
 * The build fails if a case stops failing validate(), stops repairing, or stops drawing, so the
 * page cannot show a repair that the library no longer performs.
 */
const ROWS = "bench/results/agent/round-6/no-docs.jsonl";
export const replaySource = { round: "round 6", model: "claude-sonnet-4-5", docs: "no docs", file: ROWS };

/** id in the eval, the tab label, and the request the model was given (bench/agent/tasks.mjs). */
const PICKS: { id: string; label: string; asked: string }[] = [
  { id: "combo-weather", label: "Combo", asked: "Combo chart: rainfall as bars and temperature as a line." },
  { id: "donut-traffic", label: "Donut", asked: "Donut chart of session share by source. Search is the largest slice." },
  { id: "gauge-cpu", label: "Gauge", asked: "Gauge of CPU usage at 41 percent." },
];

type Row = { id: string; library: string; output: string; usage?: { output_tokens?: number } };

export type ReplayLine = { text: string; mark: "" | "bad" | "good" };
export type ReplayIssue = { code: string; path: string; message: string };
export type ReplayCase = {
  id: string;
  label: string;
  asked: string;
  tokens: number;
  /** The answer exactly as recorded. */
  wrote: string;
  wroteLines: ReplayLine[];
  fixedLines: ReplayLine[];
  lines: number;
  errors: ReplayIssue[];
  patches: string[];
  warnings: number;
  svg: string;
  svgBytes: number;
  alt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fenced(output: string): string {
  const match = output.match(/```(?:json)?\n([\s\S]*?)```/);
  return (match ? match[1] : output).trim();
}

function rows(): Row[] {
  return readFileSync(join(repoRoot(), ROWS), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Row)
    .filter((row) => row.library === "chartkit");
}

/** One line, the way the model writes a row: {"day": "Mon", "rain": 2}. */
function inline(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(inline).join(", ")}]`;
  if (isRecord(value)) {
    return `{${Object.entries(value)
      .map(([key, item]) => `${JSON.stringify(key)}: ${inline(item)}`)
      .join(", ")}}`;
  }
  return JSON.stringify(value);
}

/**
 * Two-space JSON laid out the way the recorded answers are: array items on one line each,
 * and an object nested two levels down (encoding.x) on one line.
 */
function pretty(value: unknown, depth = 0): string {
  if (depth >= 2 && isRecord(value)) return inline(value);
  const pad = "  ".repeat(depth);
  const inner = "  ".repeat(depth + 1);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[\n${value.map((item) => `${inner}${inline(item)}`).join(",\n")}\n${pad}]`;
  }
  if (isRecord(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    return `{\n${entries.map(([key, item]) => `${inner}${JSON.stringify(key)}: ${pretty(item, depth + 1)}`).join(",\n")}\n${pad}}`;
  }
  return JSON.stringify(value);
}

const bare = (line: string) => line.trim().replace(/,$/, "");

/** Marks the lines one side has and the other does not. A trailing comma alone is not a change. */
function marked(text: string, other: string, mark: "bad" | "good"): ReplayLine[] {
  const theirs = new Set(other.split("\n").map(bare));
  return text.split("\n").map((line) => ({ text: line, mark: theirs.has(bare(line)) ? "" : mark }));
}

function patchLine(op: { op: string; path: string; from?: string; value?: unknown }): string {
  if (op.op === "move") return `move ${op.from} → ${op.path}`;
  if (op.op === "remove") return `remove ${op.path}`;
  return `${op.op} ${op.path} = ${inline(op.value)}`;
}

function build(pick: (typeof PICKS)[number], all: Row[]): ReplayCase {
  const fail = (why: string): never => {
    throw new Error(`homepage repair replay, ${pick.id}: ${why}`);
  };
  const row = all.find((item) => item.id === pick.id) ?? fail(`no chartkit row in ${ROWS}`);
  const wrote = fenced(row.output);
  const spec = JSON.parse(wrote) as unknown;
  const checked = validate(spec);
  if (checked.ok) fail("the recorded answer now passes validate(), so there is nothing to repair");
  const fixed = repair(spec);
  if (!fixed.ok) fail(`repair() no longer fixes it: ${fixed.errors.map((error) => error.code).join(", ")}`);
  if (fixed.applied.length === 0) fail("repair() applied no fix");
  const painted = paintSpec(fixed.spec);
  if (!painted.ok || !painted.svg.includes("<svg") || painted.svg.includes("ck-chart-error")) fail(`the repaired spec did not draw: ${painted.footer}`);
  const fixedText = pretty(fixed.spec);
  if (wrote !== pretty(spec)) fail("the recorded answer is not laid out the way pretty() prints, so the line marks would be wrong");
  const wroteLines = marked(wrote, fixedText, "bad");
  const fixedLines = marked(fixedText, wrote, "good");
  if (!wroteLines.some((line) => line.mark) || !fixedLines.some((line) => line.mark)) fail("no changed line to show");
  const a11y = isRecord(fixed.spec) && isRecord(fixed.spec.a11y) ? fixed.spec.a11y : {};
  return {
    id: pick.id,
    label: pick.label,
    asked: pick.asked,
    tokens: row.usage?.output_tokens ?? 0,
    wrote,
    wroteLines,
    fixedLines,
    lines: Math.max(wroteLines.length, fixedLines.length),
    errors: checked.errors.map((error) => ({ code: error.code, path: error.path || "/", message: error.message })),
    patches: fixed.applied.map((op) => patchLine(op as { op: string; path: string; from?: string; value?: unknown })),
    warnings: fixed.warnings.length,
    svg: painted.svg,
    svgBytes: new TextEncoder().encode(painted.svg).length,
    alt: typeof a11y.alt === "string" ? a11y.alt : "",
  };
}

export type ReplayTally = { tasks: number; failed: number; repaired: number };

/** How many first answers in the file fail validate(), and how many of those repair() turns into a drawn chart. */
function tally(all: Row[]): ReplayTally {
  let failed = 0;
  let repaired = 0;
  for (const row of all) {
    let spec: unknown;
    try {
      spec = JSON.parse(fenced(row.output));
    } catch {
      failed += 1;
      continue;
    }
    if (validate(spec).ok) continue;
    failed += 1;
    const fixed = repair(spec);
    if (!fixed.ok) continue;
    const painted = paintSpec(fixed.spec);
    if (painted.ok && painted.svg.includes("<svg") && !painted.svg.includes("ck-chart-error")) repaired += 1;
  }
  return { tasks: all.length, failed, repaired };
}

export function repairReplay(): { cases: ReplayCase[]; tally: ReplayTally } {
  const all = rows();
  return { cases: PICKS.map((pick) => build(pick, all)), tally: tally(all) };
}
