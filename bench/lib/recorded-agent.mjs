import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ACCEPTED } from "../agent/capabilities.mjs";
import { tasks } from "../agent/tasks.mjs";

const recordedDir = join(dirname(fileURLToPath(import.meta.url)), "../results/agent/sonnet-4-5");

function load(name) {
  const path = join(recordedDir, name);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function rowsOf(file) {
  return file?.agent?.results ?? [];
}

function byLibrary(rows) {
  const map = new Map();
  for (const row of rows) {
    const list = map.get(row.library) ?? [];
    list.push(row);
    map.set(row.library, list);
  }
  return map;
}

function failKind(row) {
  const stages = row.stages ?? {};
  if (stages.validate && stages.validate.ok === false) return "Invalid spec";
  if (stages.render && stages.render.ok === false) return "Render error";
  if (stages.type && stages.type.ok === false) return "Wrong chart type";
  if (stages.fields && stages.fields.ok === false) return "Wrong field mapping";
  if (stages.values && stages.values.ok === false) return "Missing or wrong values";
  if (stages.parse && stages.parse.ok === false) return "Code doesn't compile";
  if (row.status === "error" || (stages.runner && stages.runner.ok === false)) return "API or runner error";
  if (stages.library && stages.library.ok === false) return "Did not use the library";
  return "Other";
}

function supportedCount(library) {
  return tasks.filter((task) => ACCEPTED[library]?.[task.type] != null).length;
}

function summarizeFailures(ids) {
  const byType = new Map();
  for (const id of ids) {
    const type = tasks.find((task) => task.id === id)?.type ?? id;
    byType.set(type, (byType.get(type) ?? 0) + 1);
  }
  if (byType.size === 0) return "none";
  return [...byType.entries()].map(([type, count]) => `${type} ×${count}`).join(", ");
}

function dollars(usage) {
  if (!usage) return null;
  return (usage.input_tokens / 1e6) * 3 + (usage.output_tokens / 1e6) * 15;
}

export function recordedAgentSection() {
  const main = load("main.json");
  if (!main) return "";
  const rows = rowsOf(main);
  const groups = byLibrary(rows);
  const order = ["chartkit", "recharts", "echarts", "chartjs"];
  const lines = [];
  lines.push("### Recorded run: claude-sonnet-4-5, published protocol");
  lines.push("");
  lines.push("One run, temperature 0, max_tokens 4096, one attempt per task, no repair loop. Model **claude-sonnet-4-5** via Anthropic. The checker in that run did not require a library import: `render()` only had to return a string, and `meta.values` is written by the model. Those code-library rates are inflated. Raw rows are in `bench/results/agent/sonnet-4-5/`. The fair-scoring rerun (import and library markup required, Chart.js and browser-only ECharts in Playwright, one repair try) has not been run.");
  lines.push("");
  const machine = main.machine;
  if (machine) {
    lines.push(`Recorded **${machine.measuredAt}**, Node **${machine.node}**, **${machine.platform}**, CPU **${machine.cpu}**, **${machine.cpuCount}** CPUs. This is a different machine from the browser table above.`);
    lines.push("");
  }
  lines.push("| Library | First-try pass | Rate | Honest unsupported included | Passes that import the library | Hand-written SVG passes | Strict (import, or correct unsupported) |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|");
  for (const library of order) {
    const list = groups.get(library) ?? [];
    const passed = list.filter((row) => row.ok).length;
    const unsupported = list.filter((row) => row.ok && row.status === "unsupported").length;
    const imported = list.filter((row) => row.ok && row.status !== "unsupported" && row.diagnostics?.importsLibrary).length;
    const hand = list.filter((row) => row.ok && row.status !== "unsupported" && !row.diagnostics?.importsLibrary).length;
    const strict = library === "chartkit" ? passed : imported + unsupported;
    const rate = list.length ? `${((passed / list.length) * 100).toFixed(1)}%` : "—";
    const strictCell = library === "chartkit" ? `${passed} / ${list.length}` : `${strict} / ${list.length} (${list.length ? ((strict / list.length) * 100).toFixed(0) : 0}%)`;
    lines.push(`| ${library} | ${passed} / ${list.length} | ${rate} | ${unsupported} | ${library === "chartkit" ? "—" : imported} | ${library === "chartkit" ? "—" : hand} | ${strictCell} |`);
  }
  lines.push("");
  const supported = order.filter((library) => library !== "chartkit").map((library) => `${library} ${supportedCount(library)}`).join(", ");
  lines.push(`Supported tasks in this set: ${supported}. Chart.js strict passes are all correct \`meta.unsupported\` answers (0 imported the library).`);
  lines.push("");
  const kinds = ["Invalid spec", "Render error", "Wrong chart type", "Wrong field mapping", "Missing or wrong values", "Code doesn't compile", "API or runner error"];
  lines.push("| Failure | " + order.join(" | ") + " |");
  lines.push("|---|" + order.map(() => "---:").join("|") + "|");
  for (const kind of kinds) {
    const cells = order.map((library) => (groups.get(library) ?? []).filter((row) => !row.ok && failKind(row) === kind).length);
    if (cells.every((count) => count === 0)) continue;
    lines.push(`| ${kind} | ${cells.join(" | ")} |`);
  }
  lines.push("");
  const chartkitPass = (groups.get("chartkit") ?? []).filter((row) => row.ok).map((row) => row.id);
  lines.push(`ChartKit first-try passes: ${chartkitPass.join(", ") || "none"}.`);
  lines.push("");
  const usage = main.agent?.usage;
  if (usage) {
    const cost = dollars(usage);
    lines.push(`Tokens: ${usage.input_tokens} input, ${usage.output_tokens} output. At the list price noted with the run ($3/M input, $15/M output) that is $${cost.toFixed(2)}.`);
    lines.push("");
  }
  lines.push("### Supplementary runs, same model, ChartKit only, docs prepended");
  lines.push("");
  lines.push("These are not the published protocol. The context files were not part of the checker.");
  lines.push("");
  lines.push("| Context | ChartKit pass | Failures |");
  lines.push("|---|---:|---|");
  const mainPass = (groups.get("chartkit") ?? []).filter((row) => row.ok).length;
  const mainN = (groups.get("chartkit") ?? []).length;
  lines.push(`| None (the run above) | ${mainPass} / ${mainN} | Vega-Lite-shaped specs |`);
  const extraNotes = [];
  for (const [file, label] of [
    ["supp-llms.json", "`docs/public/llms.txt` as shipped (recorded as 5.9 KB)"],
    ["supp-examples.json", "the 15 `packages/core/examples/*.json` files (recorded as 6.2 KB, plus one hint sentence)"],
  ]) {
    const extra = load(file);
    if (!extra) continue;
    const extraRows = rowsOf(extra);
    const failed = extraRows.filter((row) => !row.ok).map((row) => row.id);
    const passed = extraRows.filter((row) => row.ok).length;
    lines.push(`| ${label} | ${passed} / ${extraRows.length} | ${summarizeFailures(failed)} |`);
    if (failed.length) extraNotes.push(`${file} failures: ${failed.join(", ")}.`);
    const extraUsage = extra.agent?.usage;
    if (extraUsage) {
      extraNotes.push(`${file}: ${extraUsage.input_tokens} input tokens, ${extraUsage.output_tokens} output tokens, about $${dollars(extraUsage).toFixed(2)} at the same list price.`);
    }
  }
  lines.push("");
  if (extraNotes.length) {
    lines.push(extraNotes.join(" "));
    lines.push("");
  }
  const examples = load("supp-examples.json");
  const renderFails = examples
    ? rowsOf(examples).filter((row) => !row.ok && row.stages?.validate?.ok && row.stages?.render?.ok === false).map((row) => row.id)
    : [];
  if (renderFails.length) {
    lines.push(`With the examples in the prompt, ${renderFails.join(" and ")} still failed: \`validate\` passed and \`render\` did not. The heatmap renderer uses the calendar layout unless \`mark.layout\` is \`"grid"\`, and calendar mode does not draw a non-date x. That is a product bug, not a harness bug. It is not fixed on this branch.`);
    lines.push("");
  }
  lines.push("Second-try column: not measured on this run. The harness now feeds validator errors, render errors, compile errors, and library-use failures back once. That column stays empty until the fair-scoring rerun.");
  return lines.join("\n");
}
