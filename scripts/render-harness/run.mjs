/**
 * Render sweep.
 *
 *   node scripts/render-harness/run.mjs --fast
 *   node scripts/render-harness/run.mjs --full
 *   node scripts/render-harness/run.mjs --full --update
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadRuntime } from "./load.mjs";
import { loadExamples } from "./examples.mjs";
import { SEED, buildCases, fnv } from "./generate.mjs";
import { checkSvg } from "./geometry.mjs";
import { hamming, rasterCase, svgDigest } from "./raster.mjs";
import { findingKey, novelFindings, readAllowlist, writeAllowlist } from "./allowlist.mjs";
import { visionSummary, writeReports } from "./report.mjs";
import { HASH_TOLERANCE, RASTER_WIDTH, SLOW_MS, baselineDir, fastBaselinePath, fullBaselinePath, outDir, pngDir } from "./paths.mjs";

process.env.TZ = "UTC";

export async function sweep({ mode = "fast", update = false, type = "", raster = true, writeReport = true, allowlist = true } = {}) {
  const started = performance.now();
  const runtime = await loadRuntime();
  const examples = loadExamples(runtime);
  const built = buildCases(runtime, examples, { mode });
  let cases = built.cases;
  if (type) cases = cases.filter((row) => row.type === type);
  const renderable = cases.filter((row) => row.status === "render");
  const findings = [];
  const hashes = new Map();
  const times = [];
  const seenSvg = new Map();
  const pngBudget = new Map();
  const inherited = new Map();
  let pngs = 0;
  mkdirSync(pngDir, { recursive: true });

  let done = 0;
  for (const row of renderable) {
    done += 1;
    if (done % 500 === 0 || done === renderable.length) process.stderr.write(`\r${mode} ${done}/${renderable.length}`);
    const spec = row.spec;
    row.spec = null;
    const drawn = await draw(runtime, spec);
    times.push(drawn.ms);
    for (const log of drawn.logs) {
      findings.push(decorate(row, {
        check: "console",
        severity: log.level === "error" ? "error" : "warning",
        detail: log.message.slice(0, 240),
        elements: [],
        signature: log.message.slice(0, 80),
        roles: [],
      }));
    }
    if (drawn.ms >= SLOW_MS) {
      findings.push(decorate(row, {
        check: "render-time",
        severity: "warning",
        detail: `Render took ${drawn.ms.toFixed(0)} ms.`,
        elements: [],
        signature: "slow",
        roles: [],
      }));
    }
    if (drawn.failed) {
      findings.push(decorate(row, {
        check: "render-exception",
        severity: "error",
        detail: drawn.message,
        elements: [],
        signature: drawn.message.slice(0, 80),
        roles: [],
      }));
      continue;
    }
    let visual = checkSvg(drawn.svg, spec).map((item) => calmStress(row, decorate(row, item)));
    const inheritKey = `${row.type}|${row.example}`;
    if (row.kind === "default") {
      inherited.set(inheritKey, new Set(visual.map((item) => `${item.check}|${item.signature}`)));
    } else {
      const known = inherited.get(inheritKey);
      if (known) visual = visual.filter((item) => !known.has(`${item.check}|${item.signature}`));
    }
    const digest = svgDigest(drawn.svg);
    let hash = seenSvg.get(digest);
    const save = wantPng(row, visual, pngBudget, pngs);
    if (raster && (!hash || save)) {
      try {
        const image = await rasterCase(spec, drawn.svg, { png: false });
        hash = image.hash;
        seenSvg.set(digest, hash);
        if (save) {
          const display = await rasterCase(spec, drawn.svg, { png: true, width: 720 });
          const file = join(pngDir, `${fnv(row.id)}.png`);
          writeFileSync(file, display.png);
          pngs += 1;
          for (const item of visual) item.image = file;
        }
      } catch (error) {
        findings.push(decorate(row, {
          check: "snapshot",
          severity: "error",
          detail: `Raster failed: ${error instanceof Error ? error.message : String(error)}`.slice(0, 240),
          elements: [],
          signature: "raster-failed",
          roles: [],
        }));
      }
    }
    if (hash) hashes.set(row.id, hash);
    findings.push(...visual);
  }
  process.stderr.write("\n");

  const baselinePath = mode === "full" ? fullBaselinePath : fastBaselinePath;
  const snapshot = compareHashes(hashes, baselinePath, update, mode, built);
  for (const change of snapshot.changed) {
    const row = renderable.find((item) => item.id === change.id);
    if (!row) continue;
    findings.push(decorate(row, {
      check: "snapshot",
      severity: "error",
      detail: `dHash distance ${change.distance} exceeds ${HASH_TOLERANCE}.`,
      elements: [],
      signature: "changed",
      roles: [],
    }));
  }

  const recorded = countRecorded(cases);
  const timings = summarize(times);
  const result = {
    seed: SEED,
    mode,
    examples: examples.length,
    cases: cases.length,
    rendered: renderable.length,
    runtimeMs: performance.now() - started,
    findings,
    recorded,
    timings,
    snapshot,
    vision: visionSummary(findings),
    outDir,
    novel: novelFindings(findings, update ? new Set() : readAllowlist()).map(findingKey),
  };
  if (writeReport) writeReports({ ...result, mode: type ? "partial" : result.mode });
  if (update && !type && allowlist) writeAllowlist(findings);
  return result;
}

function wantPng(row, visual, budget, pngs) {
  if (!visual.length) return false;
  if (isBareGantt(row)) return true;
  if (pngs >= 36) return false;
  const bucket = `${visual[0].check}:${(visual[0].roles ?? []).join("×")}`;
  const used = budget.get(bucket) ?? 0;
  if (used >= 3) return false;
  budget.set(bucket, used + 1);
  return true;
}

function isBareGantt(row) {
  if (row.type !== "gantt") return false;
  if (row.option === "title" && row.value === "") return true;
  return Boolean(row.value && typeof row.value === "object" && row.value.title === "");
}

async function draw(runtime, spec) {
  const logs = [];
  const warn = console.warn;
  const error = console.error;
  console.warn = (...args) => logs.push({ level: "warning", message: args.map(String).join(" ") });
  console.error = (...args) => logs.push({ level: "error", message: args.map(String).join(" ") });
  const t0 = performance.now();
  let svg = "";
  let thrown = "";
  try {
    const type = spec?.type;
    if (type === "bar-list") svg = runtime.renderBarList(spec) ?? "";
    else if (type === "choropleth" || type === "map-points") svg = await runtime.renderGeo(spec);
    else svg = runtime.render(spec);
    if (typeof svg !== "string") svg = "";
  } catch (err) {
    thrown = err instanceof Error ? err.message : String(err);
  } finally {
    console.warn = warn;
    console.error = error;
  }
  const ms = performance.now() - t0;
  const failed = Boolean(thrown) || !svg.includes("<svg") || svg.includes("ck-chart-error");
  const message = thrown || textOf(svg) || "render returned an error SVG";
  return { svg, ms, logs: logs.filter((log) => !/ExperimentalWarning|DeprecationWarning/.test(log.message)), failed, message: message.slice(0, 240) };
}

function textOf(svg) {
  const match = /<text\b[^>]*>([^<]*)<\/text>/.exec(svg);
  if (!match) return "";
  return match[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

const STRESS_CHARS = 48;
const STRESS_ABS = 10000;

/** A sweep-invented extreme: a very long string, or a number at the 10000 / 1000000 edge. */
export function isStressValue(value) {
  if (typeof value === "string") {
    if (value.length > STRESS_CHARS) return true;
    if (value === "0" || value === "10000") return true;
    if (value.trim() !== "" && Number.isFinite(Number(value)) && Math.abs(Number(value)) >= STRESS_ABS) return true;
    return false;
  }
  if (typeof value === "number") return !Number.isFinite(value) || Math.abs(value) >= STRESS_ABS;
  if (Array.isArray(value)) return value.some((item) => isStressValue(item));
  if (value && typeof value === "object") return Object.values(value).some((item) => isStressValue(item));
  return false;
}

function calmStress(row, finding) {
  if (finding.check !== "text-outside" && finding.check !== "text-overlap") return finding;
  if (!isStressValue(row.value)) return finding;
  return {
    ...finding,
    severity: "info",
    detail: `${finding.detail} Stress input: a very long string or an extreme number. Reported, not failed.`,
  };
}

function decorate(row, finding) {
  return {
    type: row.type,
    example: row.example,
    option: row.option,
    value: row.value,
    check: finding.check,
    severity: finding.severity,
    detail: finding.detail,
    elements: finding.elements ?? [],
    signature: finding.signature ?? "",
    roles: finding.roles ?? [],
    caseId: row.id,
    image: finding.image ?? "",
  };
}

function countRecorded(cases) {
  const counts = { "not-yet": new Set(), "needs-data": new Set(), unsampled: new Set(), blocked: new Set() };
  for (const row of cases) {
    if (!counts[row.status]) continue;
    counts[row.status].add(`${row.type}|${row.option}`);
  }
  return {
    "not-yet": counts["not-yet"].size,
    "needs-data": counts["needs-data"].size,
    unsampled: counts.unsampled.size,
    blocked: counts.blocked.size,
  };
}

function summarize(times) {
  const sorted = [...times].sort((a, b) => a - b);
  const at = (p) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)))] : 0);
  return { p50: at(0.5), p95: at(0.95), max: at(1) };
}

function compareHashes(hashes, baselinePath, update, mode, built) {
  const previous = readBaseline(baselinePath);
  const changed = [];
  const missing = [];
  if (!update) {
    for (const [id, hash] of hashes) {
      const prior = previous.cases?.[id];
      if (!prior) missing.push(id);
      else {
        const distance = hamming(prior, hash);
        if (distance > HASH_TOLERANCE) changed.push({ id, distance });
      }
    }
  }
  const cases = Object.fromEntries([...hashes.entries()].sort((a, b) => a[0].localeCompare(b[0])));
  if (update) writeBaseline(baselinePath, cases);
  const note = update
    ? `Wrote the dHash baseline for this mode. Baselines are 64-bit hashes at raster width ${RASTER_WIDTH}, not PNGs. A full sweep is about twenty thousand renders. Committing every PNG would add tens of megabytes. The hash catches a changed picture and stays small. Flagged renders are written under scripts/render-harness/out/png, and a few display-sized frames are copied into report/examples.`
    : `Baselines are committed dHash values, not PNGs, so the repo does not carry a render of every option.`;
  return {
    changed,
    missing,
    compared: hashes.size,
    tolerance: HASH_TOLERANCE,
    baseline: baselinePath,
    note,
    mode,
    primary: built.primary,
  };
}

function readBaseline(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return { cases: {} };
  }
}

function writeBaseline(file, cases) {
  mkdirSync(baselineDir, { recursive: true });
  const doc = {
    version: 1,
    seed: SEED,
    algorithm: "dhash-64",
    tolerance: HASH_TOLERANCE,
    rasterWidth: RASTER_WIDTH,
    note: "Perceptual hash of the SSR SVG rasterized at rasterWidth. PNGs are not committed. A distance above tolerance is a changed render.",
    cases,
  };
  writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`);
}

function parseArgs(argv) {
  const mode = argv.includes("--full") ? "full" : "fast";
  const update = argv.includes("--update");
  const typeFlag = argv.indexOf("--type");
  const type = typeFlag >= 0 ? argv[typeFlag + 1] ?? "" : "";
  const count = argv.includes("--count");
  return { mode, update, type, count };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.type && args.update) {
    console.error("--update cannot be combined with --type");
    process.exitCode = 1;
    return;
  }
  if (args.count) {
    const runtime = await loadRuntime();
    const examples = loadExamples(runtime);
    const built = buildCases(runtime, examples, { mode: args.mode });
    const rows = args.type ? built.cases.filter((row) => row.type === args.type) : built.cases;
    const by = {};
    for (const row of rows) by[row.status] = (by[row.status] ?? 0) + 1;
    console.log(JSON.stringify({ mode: args.mode, cases: rows.length, ...by }, null, 2));
    return;
  }
  const result = await sweep(args);
  if (args.mode === "full" && args.update && !args.type) {
    await sweep({ mode: "fast", update: true, writeReport: false, allowlist: false });
  }
  const byCheck = {};
  for (const finding of result.findings) {
    if (finding.severity === "info") continue;
    byCheck[finding.check] = (byCheck[finding.check] ?? 0) + 1;
  }
  console.log(JSON.stringify({
    mode: result.mode,
    cases: result.cases,
    rendered: result.rendered,
    runtimeMs: Math.round(result.runtimeMs),
    findings: result.findings.filter((finding) => finding.severity !== "info").length,
    byCheck,
    recorded: result.recorded,
    snapshotChanged: result.snapshot.changed.length,
    novel: result.novel.length,
  }, null, 2));
  if (!args.update && result.novel.length) process.exitCode = 1;
  if (!args.update && (result.snapshot.changed.length || result.snapshot.missing.length)) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
