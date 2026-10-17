import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildSync } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const LIBRARIES = ["chartkit", "recharts", "echarts", "chartjs"];

function extractJsonObject(text) {
  const fenced = String(text ?? "").match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : String(text ?? "");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("no JSON object");
  return JSON.parse(raw.slice(start, end + 1));
}

/** First-try output tokens, and a ChartKit pass rate after repair() with no model call. */
export function efficiencyFromRows(rows, repair) {
  const groups = new Map(LIBRARIES.map((library) => [library, []]));
  for (const row of rows ?? []) {
    if (!row || typeof row.library !== "string") continue;
    const list = groups.get(row.library) ?? [];
    list.push(row);
    groups.set(row.library, list);
  }
  const stats = [];
  for (const library of LIBRARIES) {
    const list = groups.get(library) ?? [];
    if (list.length === 0) continue;
    const tokens = list
      .map((row) => row.usage?.output_tokens)
      .filter((value) => typeof value === "number" && Number.isFinite(value));
    let repairPassed = null;
    let repairChecked = null;
    let repairLabel = "no repair()";
    if (library === "chartkit") {
      repairChecked = list.length;
      if (typeof repair !== "function") {
        repairLabel = "not computed";
      } else {
        repairPassed = 0;
        for (const row of list) {
          try {
            if (repair(extractJsonObject(row.output)).ok) repairPassed += 1;
          } catch {
            // Unparseable output does not pass repair().
          }
        }
        repairLabel = `${repairPassed} / ${repairChecked}`;
      }
    }
    stats.push({
      library,
      n: list.length,
      tokenRows: tokens.length,
      meanOutput: tokens.length ? tokens.reduce((sum, value) => sum + value, 0) / tokens.length : null,
      repairPassed,
      repairChecked,
      repairLabel,
    });
  }
  return stats;
}

/** ChartKit first tries that pass check() after repair(). Misses are task ids. */
export function chartkitAfterRepair(rows, tasks, repair, check) {
  const byId = new Map((tasks ?? []).map((task) => [task.id, task]));
  let passed = 0;
  let checked = 0;
  const misses = [];
  for (const row of rows ?? []) {
    if (row?.library !== "chartkit") continue;
    checked += 1;
    const task = byId.get(row.id);
    if (!task || typeof repair !== "function" || typeof check !== "function") {
      misses.push(row.id ?? "?");
      continue;
    }
    try {
      const repaired = repair(extractJsonObject(row.output));
      if (check(repaired.spec, task).ok) passed += 1;
      else misses.push(row.id);
    } catch {
      misses.push(row.id ?? "?");
    }
  }
  return { passed, checked, misses };
}

export function formatMean(stat) {
  if (!stat || stat.meanOutput == null) return `— (${stat?.tokenRows ?? 0} of ${stat?.n ?? 0})`;
  const rounded = Math.round(stat.meanOutput * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${text} (n=${stat.tokenRows})`;
}

let cachedCheck;
/** Bundled checker and tasks. No model call. */
export function currentCheck() {
  if (cachedCheck) return cachedCheck;
  const outfile = join(here, "../.out/check-for-report.cjs");
  mkdirSync(dirname(outfile), { recursive: true });
  buildSync({
    entryPoints: [join(here, "../agent/suite.mjs")],
    bundle: true,
    format: "cjs",
    platform: "node",
    outfile,
    external: ["esbuild", "playwright"],
    define: { "import.meta.url": JSON.stringify(pathToFileURL(outfile).href) },
    logLevel: "silent",
  });
  const suite = createRequire(import.meta.url)(outfile);
  cachedCheck = { tasks: suite.tasks, checkChartKit: suite.checkChartKit, repair: suite.repair };
  return cachedCheck;
}

let cachedRepair;
/** Current repair(), bundled from source. No model call. */
export function currentRepair() {
  if (cachedRepair) return cachedRepair;
  const outfile = join(here, "../.out/repair-for-report.cjs");
  mkdirSync(dirname(outfile), { recursive: true });
  buildSync({
    entryPoints: [join(here, "../../packages/core/src/validate.ts")],
    bundle: true,
    format: "cjs",
    platform: "node",
    outfile,
    logLevel: "silent",
  });
  cachedRepair = createRequire(import.meta.url)(outfile).repair;
  return cachedRepair;
}

export function loadRecordedRows() {
  const path = join(here, "../results/agent/sonnet-4-5/main.json");
  if (!existsSync(path)) return [];
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  return parsed.agent?.results ?? [];
}
