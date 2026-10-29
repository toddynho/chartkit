/**
 * Measure current bundle sizes and write catalog/data/measured-sizes.json.
 * Runs scripts/size.mjs and reads bench/results/bundle.json. Pages read the file.
 * Do not type the byte counts into the site.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(docsRoot, "..");
const benchRoot = join(repoRoot, "bench");

function git(args) {
  const result = spawnSync("git", args, { cwd: repoRoot, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || `git ${args.join(" ")} failed`);
  return result.stdout.trim();
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed\n${result.stderr}\n${result.stdout}`);
  }
  return result.stdout;
}

// scripts/size.mjs prints the measurement and exits 1 when a gzip budget is over. The JSON is still the current size, so this file records it. The budget check stays in scripts/size.mjs.
const sizeRun = spawnSync("node", ["scripts/size.mjs"], { cwd: repoRoot, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
const sizeStdout = sizeRun.stdout ?? "";
if (sizeRun.status !== 0 && !sizeStdout.trim().startsWith("{")) {
  throw new Error(`node scripts/size.mjs failed\n${sizeRun.stderr}\n${sizeStdout}`);
}
if (sizeRun.status !== 0) console.error(sizeRun.stderr);
const sizeJson = JSON.parse(sizeStdout);
if (typeof sizeJson.measured?.line !== "number" || typeof sizeJson.measured?.all !== "number") {
  throw new Error("scripts/size.mjs did not report line and all gzip");
}

const bundlePath = join(benchRoot, "results/bundle.json");
if (!existsSync(bundlePath)) {
  run("node", ["run.mjs", "--skip-browser", "--skip-ssr", "--skip-agent"], benchRoot);
}
const bundle = JSON.parse(readFileSync(bundlePath, "utf8"));
if (!Array.isArray(bundle.cells) || bundle.cells.length === 0) throw new Error("bench/results/bundle.json has no cells");

function resolved(cell) {
  if (cell.gzipBytes != null || cell.status !== "ok") return cell;
  const pkg = (bundle.packages ?? []).find((item) => item.id === cell.packageId);
  if (!pkg) return cell;
  return {
    ...cell,
    minBytes: pkg.minBytes ?? null,
    gzipBytes: pkg.gzipBytes ?? null,
    brotliBytes: pkg.brotliBytes ?? null,
    cssMinBytes: cell.cssMinBytes ?? pkg.cssMinBytes ?? null,
    cssGzipBytes: cell.cssGzipBytes ?? pkg.cssGzipBytes ?? null,
    reactExternal: cell.reactExternal ?? pkg.reactExternal ?? null,
    note: cell.note ?? pkg.note ?? null,
  };
}

const rows = bundle.cells.map((cell) => {
  const source = resolved(cell);
  return {
    id: cell.library === "ChartKit minimal" ? "chartkit-minimal" : cell.id,
    library: cell.library,
    chart: cell.chart,
    renderer: cell.renderer ?? null,
    react: cell.react ?? null,
    status: cell.status,
    gzipBytes: source.gzipBytes ?? null,
    minBytes: source.minBytes ?? null,
    brotliBytes: source.brotliBytes ?? null,
    cssGzipBytes: source.cssGzipBytes ?? null,
    cssMinBytes: source.cssMinBytes ?? null,
    reactExternalGzipBytes: source.reactExternal?.gzipBytes ?? null,
    reactExternalMinBytes: source.reactExternal?.minBytes ?? null,
    note: source.note ?? null,
    label: cell.label ?? null,
  };
});

const coreDiff = spawnSync("git", ["diff", "--quiet", "origin/main", "--", "packages/core"], { cwd: repoRoot });
const payload = {
  commit: git(["rev-parse", "HEAD"]),
  coreCommit: git(["rev-parse", "origin/main"]),
  coreMatchesMain: coreDiff.status === 0,
  sizeScript: {
    command: "node scripts/size.mjs",
    method:
      "esbuild --bundle --minify, gzip level 9, platform node. line is createRenderer([line]) from packages/core/src. all is packages/core/src/all.ts.",
    measuredAt: new Date().toISOString(),
    measured: { line: sizeJson.measured.line, all: sizeJson.measured.all },
    minBytes: { line: sizeJson.minBytes.line, all: sizeJson.minBytes.all },
  },
  bench: {
    command: "node bench/run.mjs --skip-browser --skip-ssr --skip-agent",
    measuredAt: bundle.measuredAt,
    method: bundle.method,
    commit: bundle.commit,
    versions: bundle.versions,
    rows,
  },
};

const out = join(docsRoot, "data/measured-sizes.json");
writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);
const line = rows.find((row) => row.id === "chartkit-minimal" && row.chart === "line");
console.log(
  JSON.stringify(
    {
      wrote: "catalog/data/measured-sizes.json",
      commit: payload.commit,
      sizeScriptLine: payload.sizeScript.measured.line,
      harnessLine: line?.gzipBytes ?? null,
      sizeScriptStatus: sizeRun.status,
    },
    null,
    2,
  ),
);
if (sizeRun.status !== 0) process.exit(sizeRun.status);
