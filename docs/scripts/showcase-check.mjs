/**
 * Validate showcase specs, keep their data off the eval themes, and write the
 * agent-readable copies. `node docs/scripts/showcase-check.mjs --check` fails
 * when the published files drift.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tasks } from "../../bench/agent/tasks.mjs";
import { dashboardMarkdown, dashboards } from "../lib/dashboards.ts";
import { showcaseBoards } from "../lib/showcase.ts";

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(docsRoot, "public");
const check = process.argv.includes("--check");

const THEME_WORDS = [
  "revenue",
  "users",
  "temperature",
  "signups",
  "regions",
  "traffic",
  "budget",
  "survey",
  "plans",
  "energy",
  "queues",
  "ads",
  "latency",
  "margin",
  "orders",
  "weather",
  "load",
  "commits",
  "sales",
  "cpu",
  "nps",
  "errors",
  "uptime",
  "balance",
  "storage",
  "tasks",
  "deploys",
  "alerts",
];

function walk(value, visit) {
  if (Array.isArray(value)) {
    value.forEach((item) => walk(item, visit));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      visit(key, item);
      walk(item, visit);
    }
  }
}

function rowKey(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  const keys = Object.keys(row).sort();
  return JSON.stringify(keys) + JSON.stringify(keys.map((key) => row[key]));
}

function evalSignatures() {
  const rows = new Set();
  const sequences = new Set();
  for (const task of tasks) {
    const data = task.data;
    if (Array.isArray(data) && data.every((item) => typeof item === "number") && data.length >= 3) {
      sequences.add(JSON.stringify(data));
    }
    if (Array.isArray(data)) {
      for (const row of data) {
        const key = rowKey(row);
        if (key) rows.add(key);
      }
    }
  }
  return { rows, sequences };
}

function assertEvalClear(boards) {
  const { rows, sequences } = evalSignatures();
  const hits = [];
  const blobParts = [];
  for (const board of boards) {
    const payload = {
      lede: board.lede,
      title: board.title,
      charts: board.charts.map((chart) => chart.spec),
      mermaid: (board.mermaid ?? []).map((card) => ({ source: card.source, spec: card.chart.spec })),
      repairs: (board.repairs ?? []).map((item) => ({ broken: item.broken, repaired: item.repaired })),
    };
    blobParts.push(JSON.stringify(payload));
    walk(payload, (key, value) => {
      if (THEME_WORDS.includes(key.toLowerCase())) hits.push(`${board.slug} key ${key}`);
      if (typeof value === "string" && THEME_WORDS.includes(value.toLowerCase())) hits.push(`${board.slug} value ${value}`);
      const signature = rowKey(value);
      if (signature && rows.has(signature)) hits.push(`${board.slug} reuses an eval row`);
      if (Array.isArray(value) && value.every((item) => typeof item === "number") && value.length >= 3 && sequences.has(JSON.stringify(value))) {
        hits.push(`${board.slug} reuses an eval value sequence`);
      }
    });
    const text = JSON.stringify(payload);
    for (const word of THEME_WORDS) {
      const pattern = new RegExp(`\\b${word}\\b`, "i");
      if (pattern.test(text)) hits.push(`${board.slug} mentions ${word}`);
    }
  }
  if (hits.length) {
    throw new Error(`showcase data overlaps the eval themes:\n${[...new Set(hits)].join("\n")}`);
  }
}

function markdown(board) {
  const lines = [`# ${board.title}`, "", board.lede, ""];
  if (board.sources) {
    const sources = board.sources;
    lines.push(
      `Bundle bytes are from docs/data/measured-sizes.json, size script measured ${sources.sizeMeasured} on \`${sources.sizeCommit}\`, bench bundles measured ${sources.benchMeasured}. Timings are older round ${sources.round}, measured ${sources.roundMeasured} on \`${sources.roundCommit}\`, from benchmarks.json.`,
      "",
    );
  }
  for (const chart of board.charts) {
    lines.push(`## ${chart.title}`, "", chart.caption, "", "```json", JSON.stringify(chart.spec, null, 2), "```", "");
  }
  for (const card of board.mermaid ?? []) {
    lines.push(`## ${card.title}`, "", card.caption, "", "```mermaid", card.source.trim(), "```", "", "```json", JSON.stringify(card.chart.spec, null, 2), "```", "");
  }
  for (const item of board.repairs ?? []) {
    lines.push(`## ${item.title}`, "", item.caption, "", "Broken:", "", "```json", JSON.stringify(item.broken, null, 2), "```", "");
    if (item.repaired) lines.push("Repaired:", "", "```json", JSON.stringify(item.repaired, null, 2), "```", "");
  }
  if (board.stacks?.length) {
    lines.push("## Stacks", "");
    for (const stack of board.stacks) lines.push(`### ${stack.label}`, "", "```", stack.code.trimEnd(), "```", "");
  }
  if (board.losses?.length) {
    lines.push("## Losses", "");
    for (const loss of board.losses) lines.push(`- **${loss.label}.** ${loss.detail}`);
    lines.push("");
  }
  lines.push("## Options used", "");
  for (const option of board.options) lines.push(`- [${option.label}](https://chartkit.dev/features/${option.id}) (\`${option.id}\`)`);
  lines.push("", `https://chartkit.dev/showcase/${board.slug}`, "");
  return lines.join("\n");
}

function publish(path, body) {
  if (check) {
    const current = readFileSync(path, "utf8");
    if (current !== body) throw new Error(`${path} does not match the showcase generator. Run node docs/scripts/showcase-check.mjs`);
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
}

const boards = showcaseBoards();
assertEvalClear(boards);
const index = {
  generated: "2026-10-19",
  boards: boards.map((board) => ({
    slug: board.slug,
    number: board.number,
    title: board.title,
    types: [...new Set(board.charts.map((chart) => chart.spec.type).concat((board.mermaid ?? []).map((card) => card.chart.spec.type)))],
    options: board.options.map((option) => option.id),
    theme: "soft",
    themes: ["soft", "refined", "editorial", "midnight"],
  })),
};
publish(join(publicDir, "showcase.json"), `${JSON.stringify(index, null, 2)}\n`);
for (const board of boards) publish(join(publicDir, "showcase", `${board.slug}.md`), markdown(board));
const dashboardDir = join(publicDir, "dashboards");
function assertDrew(slug, id, svg) {
  if (!svg || !/<svg[\s>]/.test(svg)) throw new Error(`${slug} ${id} did not draw`);
  if (!/<(?:path|rect|circle|polygon|polyline|line)\b/.test(svg)) throw new Error(`${slug} ${id} drew no mark`);
}
for (const board of dashboards()) {
  for (const chart of board.charts) {
    assertDrew(board.slug, chart.id, chart.svg);
    for (const variant of chart.variants ?? []) assertDrew(board.slug, `${chart.id}:${variant.id}`, variant.svg);
  }
  for (const spark of board.sparks) assertDrew(board.slug, spark.id, spark.svg);
  publish(join(dashboardDir, `${board.slug}.md`), dashboardMarkdown(board));
}
console.log(`showcase ok: ${boards.length} boards, ${boards.reduce((sum, board) => sum + board.charts.length + (board.mermaid?.length ?? 0) + (board.repairs?.length ?? 0), 0)} charts`);
