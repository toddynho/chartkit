// Re-score recorded ChartKit first answers with the current validate() and repairAsync().
// No model calls and no API key. It answers "would today's repair() have passed that first answer?"
// Usage: node bench/agent/replay.mjs [results.jsonl ...] [--all]
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));

export async function loadSuite() {
  const outfile = join(here, `../.out/agent-replay-${process.pid}.mjs`);
  mkdirSync(dirname(outfile), { recursive: true });
  await build({
    entryPoints: [join(here, "suite.mjs")],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    external: ["esbuild", "playwright"],
    logLevel: "silent",
  });
  return import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
}

export async function replayRows(suite, rows) {
  const byId = new Map([...suite.tasks, ...(suite.suppTasks ?? [])].map((task) => [task.id, task]));
  const check = (spec, task) => (typeof task.pass === "function" ? suite.checkSupp(spec, task) : suite.checkChartKit(spec, task));
  const out = [];
  for (const row of rows.filter((item) => item.library === "chartkit")) {
    const task = byId.get(row.id);
    if (!task) continue;
    let spec;
    try {
      spec = suite.extractJson(row.output ?? "");
    } catch {
      out.push({ id: row.id, raw: false, repaired: false, failed: ["parse"] });
      continue;
    }
    const raw = await check(spec, task);
    const fixed = await suite.repairAsync(spec);
    const after = await check(fixed.spec, task);
    const failed = Object.entries(after.stages).filter(([, stage]) => !stage.ok).map(([name, stage]) => (stage.errors?.length ? `${name}: ${stage.errors.join(" | ")}` : name));
    out.push({ id: row.id, raw: raw.ok, repaired: after.ok, failed });
  }
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const all = args.includes("--all");
  const files = args.filter((arg) => !arg.startsWith("--"));
  const suite = await loadSuite();
  for (const file of files.length ? files : ["bench/results/agent/round-6/no-docs.jsonl"]) {
    const rows = readFileSync(file, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
    const result = await replayRows(suite, rows);
    const raw = result.filter((row) => row.raw).length;
    const fixed = result.filter((row) => row.repaired).length;
    console.log(`${file}: first answer ${raw}/${result.length}, first answer + repair() ${fixed}/${result.length}`);
    for (const row of result) {
      if (all || !row.repaired) console.log(`  ${row.repaired ? "ok  " : "FAIL"} ${row.raw ? "raw-ok" : "raw-fail"} ${row.id}${row.failed.length ? `: ${row.failed.join("; ").slice(0, 500)}` : ""}`);
    }
  }
}
