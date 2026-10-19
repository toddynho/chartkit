/**
 * Measure current bundle sizes and write docs/data/measured-sizes.json.
 * Runs scripts/size.mjs and the bench bundle step. Pages read the file.
 * Do not type the byte counts into the site.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
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

const sizeStdout = run("node", ["scripts/size.mjs"], repoRoot);
const sizeJson = JSON.parse(sizeStdout);
if (typeof sizeJson.measured?.line !== "number" || typeof sizeJson.measured?.all !== "number") {
  throw new Error("scripts/size.mjs did not report line and all gzip");
}

run("node", ["run.mjs", "--skip-browser", "--skip-ssr", "--skip-agent"], benchRoot);
const partial = JSON.parse(readFileSync(join(benchRoot, "results/partial.json"), "utf8"));
if (!partial.bundle?.rows?.length) throw new Error("bench bundle measurement wrote no rows");

const rows = partial.bundle.rows.map((row) => ({
  id: row.id,
  library: row.library,
  chart: row.chart,
  renderer: row.renderer,
  react: row.react,
  status: row.status,
  gzipBytes: row.gzipBytes ?? null,
  minBytes: row.minBytes ?? null,
  brotliBytes: row.brotliBytes ?? null,
  cssGzipBytes: row.cssGzipBytes ?? null,
  cssMinBytes: row.cssMinBytes ?? null,
  reactExternalGzipBytes: row.reactExternal?.gzipBytes ?? null,
  reactExternalMinBytes: row.reactExternal?.minBytes ?? null,
  note: row.note ?? null,
}));

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
    command: partial.command,
    measuredAt: partial.machine.measuredAt,
    method: partial.bundle.method,
    versions: partial.versions,
    rows,
  },
};

const out = join(docsRoot, "data/measured-sizes.json");
writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);
const line = rows.find((row) => row.id === "chartkit-minimal" && row.chart === "line");
console.log(
  JSON.stringify(
    {
      wrote: "docs/data/measured-sizes.json",
      commit: payload.commit,
      sizeScriptLine: payload.sizeScript.measured.line,
      harnessLine: line?.gzipBytes ?? null,
    },
    null,
    2,
  ),
);
