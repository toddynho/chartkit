/**
 * Option-effect audit for the playground catalog.
 *
 * For one example of each chart type, write a non-default value for every
 * option the playground would show and compare the rendered SVG. Interaction
 * options that do not change the static SVG are hovered through the real
 * vanilla mount.
 *
 *   npm run audit:options
 *   node scripts/audit-options.mjs --type line
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";
import { createRequire } from "node:module";
import { isExtra, render as renderAll } from "@chartkitdev/core/all";
import { renderBarList } from "@chartkitdev/core/charts/bar-list";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { optionBlocked, optionCatalog, readOption, writeOption } from "@chartkitdev/core/options";
import { writeStatus } from "./audit-status.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "apps/web/audit");
const onlyType = process.argv.includes("--type") ? process.argv[process.argv.indexOf("--type") + 1] : "";

const INTERACTION = /^(tooltip|interaction\.(hover|select|zoom|pan|brush)|legend\.interactive)/;

function renderSpec(spec) {
  const type = typeof spec.type === "string" ? spec.type : "";
  if (type === "choropleth" || type === "map-points") {
    return { svg: "", error: "geo" };
  }
  try {
    const svg = type === "bar-list" ? renderBarList(spec) ?? "" : isExtra(type) ? renderExtra(spec) : renderAll(spec);
    const error = !svg.includes("<svg") || svg.includes("ck-chart-error");
    return { svg, error };
  } catch (error) {
    return { svg: "", error: error instanceof Error ? error.message : "render threw" };
  }
}

function norm(svg) {
  const ids = new Map();
  let n = 0;
  const id = (value) => {
    if (!ids.has(value)) ids.set(value, `i${n++}`);
    return ids.get(value);
  };
  return svg
    .replace(/\sdata-ck-id="[^"]*"/g, "")
    .replace(/\sdata-ck-intent="[^"]*"/g, "")
    .replace(/\bid="([^"]+)"/g, (_, value) => `id="${id(value)}"`)
    .replace(/#([A-Za-z_][\w:-]*)/g, (match, value) => (ids.has(value) ? `#${ids.get(value)}` : match))
    .replace(/\s+/g, " ")
    .trim();
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function viewHeight(svg) {
  const match = /viewBox="0 0 [\d.]+ ([\d.]+)"/.exec(svg);
  return match ? Number(match[1]) : 0;
}

function probeValues(field, spec, baseSvg = "") {
  const view = readOption(spec, field);
  const current = view.value;
  if (field.path === "size.aspectRatio") return [2, 0.5];
  if (field.path === "size.minHeight") {
    const drawn = viewHeight(baseSvg);
    const stated = spec.size && typeof spec.size.height === "number" ? spec.size.height : 0;
    const floor = Math.max(drawn, stated, 32);
    return [Math.round(floor + 160)];
  }
  if (field.control === "json" || view.complex) return [];
  if (field.path.endsWith(".autoSkip")) return [true, false].filter((value) => value !== current);
  if (field.control === "boolean" || field.storage === "union-boolean") return [current === true ? false : true];
  if (field.control === "enum" && field.enumValues?.length) {
    const text = current == null ? "" : String(current);
    const rest = field.enumValues.filter((value) => value !== text && value !== String(field.defaultValue ?? ""));
    const preferred = ["false", "dotted", "currency", "percent", "step", "dark", "horizontal", "top", "end", "nearest", "dashed", "none"];
    const picks = [];
    for (const value of preferred) if (rest.includes(value) && !picks.includes(value)) picks.push(value);
    for (const value of rest) if (!picks.includes(value)) picks.push(value);
    return picks.slice(0, 4);
  }
  if (field.control === "number") {
    const base = typeof current === "number" ? current : typeof field.defaultValue === "number" ? field.defaultValue : 0;
    let next = field.coerce === "integer" ? Math.round(base) + 3 : Math.round((base + 1) * 1000) / 1000;
    if (typeof field.maximum === "number" && next > field.maximum) next = field.minimum ?? 0;
    const far = typeof field.maximum === "number" ? field.maximum : base > 200 ? Math.round(base / 2) : base + 120;
    return [...new Set([next, far])];
  }
  if (field.control === "color") return [current === "#ff00aa" ? "#00aaff" : "#ff00aa"];
  if (field.control === "text") {
    const text = current == null ? "" : String(current);
    if (field.path === "locale") return ["de-DE", "ja-JP"];
    if (field.path === "timezone") return ["UTC", "America/New_York"];
    if (field.path.endsWith("currency")) return ["EUR", "USD"];
    if (field.path.endsWith("specifier")) return [".0f", "$.0f"];
    if (field.path.endsWith("prefix")) return ["~", "$"];
    if (field.path.endsWith("suffix")) return [" kg", "%"];
    if (field.path.includes("width") || field.path.includes("height") || field.path.endsWith("size")) return ["800", "240"];
    return [text === "Probe" ? "Probe two" : "Probe"];
  }
  return [current == null || current === "" ? "Probe" : `${current} x`];
}

function channelValues(spec, channel) {
  const encoding = spec.encoding && typeof spec.encoding === "object" ? spec.encoding : {};
  const node = encoding[channel];
  const field = typeof node === "string" ? node : node && typeof node === "object" && typeof node.field === "string" ? node.field : "";
  if (!field || !Array.isArray(spec.data)) return [];
  return spec.data.map((row) => (row && typeof row === "object" ? row[field] : undefined)).filter((value) => value != null);
}

function quantitative(values) {
  return values.some((value) => typeof value === "number" || (typeof value === "string" && /\d/.test(value) && !Number.isNaN(Date.parse(value))));
}

function numericValues(values) {
  return values.length > 0 && values.every((value) => typeof value === "number" || (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)));
}

function isTemporal(value) {
  if (typeof value === "number") return value > 1e11;
  if (typeof value !== "string") return false;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return true;
  return /\d{4}/.test(value) && !Number.isNaN(Date.parse(value));
}

function axisOf(path) {
  if (path.startsWith("axes.y2") || path.startsWith("encoding.y2")) return "y2";
  if (path.startsWith("encoding.x") || path.startsWith("axes.x")) return "x";
  if (path.startsWith("encoding.y") || path.startsWith("axes.y")) return "y";
  return "";
}

function axisDrawn(spec, key) {
  const axes = spec.axes;
  if (!axes || typeof axes !== "object") return true;
  const node = axes[key];
  if (node === false) return false;
  if (node && typeof node === "object" && node.show === false) return false;
  return true;
}

function fieldName(node) {
  if (typeof node === "string") return node;
  if (node && typeof node === "object" && typeof node.field === "string") return node.field;
  if (Array.isArray(node) && node.length) return fieldName(node[0]);
  return "";
}

function columnValues(spec, name) {
  if (!name || !Array.isArray(spec.data)) return [];
  return spec.data.map((row) => (row && typeof row === "object" ? row[name] : undefined));
}

function varies(values) {
  const seen = new Set(values.map((value) => JSON.stringify(value)));
  return seen.size > 1;
}

function sortColumn(spec) {
  const encoding = spec.encoding && typeof spec.encoding === "object" ? spec.encoding : {};
  const preferred = [fieldName(encoding.y), fieldName(encoding.x)];
  const row = Array.isArray(spec.data) ? spec.data.find((item) => item && typeof item === "object") : undefined;
  const keys = row ? Object.keys(row) : [];
  for (const name of [...preferred, ...keys]) {
    if (name && varies(columnValues(spec, name))) return name;
  }
  return "";
}

function compareValues(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function flippedOrder(values) {
  let asc = true;
  let desc = true;
  for (let i = 1; i < values.length; i++) {
    const cmp = compareValues(values[i - 1], values[i]);
    if (cmp > 0) asc = false;
    if (cmp < 0) desc = false;
  }
  if (asc && !desc) return "descending";
  if (desc && !asc) return "ascending";
  return "descending";
}

function withSort(spec, written) {
  const column = sortColumn(spec);
  if (!column) return written;
  const sort = written.sort && typeof written.sort === "object" ? { ...written.sort } : {};
  sort.field = column;
  sort.order = flippedOrder(columnValues(spec, column));
  written.sort = sort;
  return written;
}

function withAxisTitle(spec, path) {
  const axis = axisOf(path) || "x";
  const axes = spec.axes && typeof spec.axes === "object" ? { ...spec.axes } : {};
  const node = axes[axis] && typeof axes[axis] === "object" ? { ...axes[axis] } : {};
  if (typeof node.title !== "string" || node.title === "") node.title = "Axis";
  axes[axis] = node;
  return { ...spec, axes };
}

function seedLocale(spec) {
  const next = structuredClone(spec);
  if (next.metric && typeof next.metric === "object" && typeof next.metric.value === "number") {
    next.metric = { ...next.metric, value: 1234.5 };
    return next;
  }
  if (!Array.isArray(next.data)) return null;
  const rows = next.data.map((row) => (row && typeof row === "object" ? { ...row } : row));
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    for (const key of Object.keys(row)) {
      if (typeof row[key] === "number") {
        row[key] = 1234.5;
        next.data = rows;
        return next;
      }
    }
  }
  return null;
}

function showsGroupedNumber(svg) {
  return /1[.,\s]?234/.test(svg) || svg.includes("1234.5") || svg.includes("1234,5");
}

function dataReason(path, spec, baseSvg = "") {
  if (path === "id") return "id is a hook, not paint";
  if (path.startsWith("animation") || path.startsWith("motion")) return "motion runs in the client, not in the static SVG";
  if (path === "a11y.keyboard" || path === "a11y.dataTable") return "client behavior; the static SVG only records intent";
  if (path.startsWith("layout.facet")) return "example is not faceted";
  if (path.startsWith("layout.concat")) return "example is not a concatenation";
  if (path.startsWith("interaction.drilldown")) return "example has no drilldown";
  if (path.startsWith("legend")) return "";
  if (path === "subtitle" && (typeof spec.subtitle !== "string" || spec.subtitle === "")) return "example has no subtitle";
  if (path.startsWith("metric.")) {
    const metric = spec.metric;
    const key = path.slice("metric.".length).split(".")[0];
    if (!metric || typeof metric !== "object" || metric[key] == null || metric[key] === "") return `example has no metric.${key}`;
  }
  if (path.startsWith("sort.") && !sortColumn(spec)) return "example has no column whose order can change";
  if (path === "locale" && !seedLocale(spec)) return "example has no number to format";
  const token = /^theme\.tokens\.([A-Za-z0-9]+)/.exec(path);
  if (token && token[1] !== "fontSize") {
    const name = token[1];
    const needle = name === "series" ? "--ck-series-" : name === "fontFamily" ? "--ck-font-family" : `--ck-${name}`;
    if (!baseSvg.includes(needle)) return "example does not paint this token";
  }
  if (path === "timezone" && !channelValues(spec, "x").some(isTemporal)) return "x values are categories, so timezone does not apply";
  const encoding = spec.encoding && typeof spec.encoding === "object" ? spec.encoding : {};
  const y = encoding.y;
  const yList = Array.isArray(y) ? y : y ? [y] : [];
  const axis = axisOf(path);
  if (axis && path.startsWith("axes.") && !axisDrawn(spec, axis) && (path.includes(".format") || path.endsWith(".autoSkip") || path.endsWith(".minorTicks") || path.endsWith(".titlePosition") || path.endsWith(".titleRotate"))) {
    return `${axis} axis is not drawn`;
  }
  if (axis && path.startsWith("axes.") && (path.includes(".format") || path.endsWith(".minorTicks"))) {
    const values = channelValues(spec, axis === "y2" ? "y" : axis);
    // No column means a computed scale (histogram counts). Only a non-numeric column opts out.
    // autoSkip stays probed on category axes: skipping crowded category labels is a normal axis.
    if (values.length && !numericValues(values)) return `${axis} axis is not numeric, so format and minor ticks do not apply`;
  }
  if (axis && (path.includes(".format") || path.includes(".scale") || path.endsWith(".type"))) {
    const values = channelValues(spec, axis === "y2" ? "y" : axis);
    if (values.length && !quantitative(values)) return `${axis} values are categories, so type, format, and scale do not apply`;
  }
  if (path.startsWith("axes.y2") || path.startsWith("encoding.y2")) {
    const usesY2 = yList.some((item) => item && typeof item === "object" && item.axis === "y2");
    if (!usesY2) return "example has no series on y2";
  }
  if (path === "encoding.series" || path.startsWith("encoding.series.")) {
    const rows = Array.isArray(spec.data) ? spec.data : [];
    const keys = rows[0] && typeof rows[0] === "object" ? Object.keys(rows[0]) : [];
    if (keys.length < 3 && !encoding.series) return "example rows have no spare series column";
  }
  if ((path === "mark.stack" || path.startsWith("mark.stack")) && yList.length < 2 && !encoding.series) return "stack needs more than one series";
  if (path.startsWith("encoding.color") && !encoding.color && yList.length < 2) return "example has no color field";
  if (path.startsWith("encoding.size") && !encoding.size) return "example has no size field";
  if (path.startsWith("encoding.open") || path.startsWith("encoding.high") || path.startsWith("encoding.low") || path.startsWith("encoding.close") || path.startsWith("encoding.volume")) {
    return "example is not an OHLC series";
  }
  return "";
}

function loadExamples() {
  const dir = join(root, "apps/web/.generated/examples");
  const byType = new Map();
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith(".json") || name === "index.json") continue;
    const file = JSON.parse(readFileSync(join(dir, name), "utf8"));
    const type = file.spec?.type || file.type;
    if (!type || byType.has(type)) continue;
    byType.set(type, { slug: file.slug, title: file.title, type, spec: file.spec });
  }
  return [...byType.values()].filter((item) => !onlyType || item.type === onlyType);
}

function fieldsFor(spec) {
  const type = spec.type;
  return optionCatalog.filter((field) => (!field.appliesTo || field.appliesTo.includes(type)) && !optionBlocked(spec, field.path));
}

const examples = loadExamples();
const rows = [];
const coverage = {};
let probed = 0;
let effects = 0;

for (const example of examples) {
  const base = renderSpec(example.spec);
  const baseNorm = norm(base.svg);
  const legendField = optionCatalog.find((field) => field.path === "legend");
  const legendMatters = legendField ? norm(renderSpec(writeOption(example.spec, legendField, false)).svg) !== baseNorm : false;
  coverage[example.type] = fieldsFor(example.spec).map((field) => field.path);
  for (const field of fieldsFor(example.spec)) {
    probed++;
    const values = probeValues(field, example.spec, base.svg);
    if (!values.length) {
      rows.push({ type: example.type, slug: example.slug, path: field.path, control: field.control, klass: "d", reason: "freeform value, no safe non-default probe", specChanged: false, svgChanged: false });
      continue;
    }
    let origin = example.spec;
    let originNorm = baseNorm;
    let originError = base.error;
    const titled = /^axes\.(x|y|y2)\.(titlePosition|titleRotate)$/.test(field.path);
    if (titled) origin = withAxisTitle(example.spec, field.path);
    if (field.path === "locale") origin = seedLocale(example.spec) ?? example.spec;
    if (origin !== example.spec) {
      const drawn = renderSpec(origin);
      originNorm = norm(drawn.svg);
      originError = drawn.error;
    }
    let next = origin;
    let value = values[0];
    let specChanged = false;
    let svgChanged = false;
    let invalid = false;
    for (const candidate of values) {
      const written = writeOption(origin, field, candidate);
      if (field.path === "size.aspectRatio") {
        const size = written.size && typeof written.size === "object" ? { ...written.size } : {};
        size.height = "auto";
        written.size = size;
      }
      if (field.path.startsWith("sort.")) withSort(example.spec, written);
      if (same(origin, written)) continue;
      specChanged = true;
      value = candidate;
      next = written;
      const drawn = renderSpec(written);
      if (drawn.error && !originError) {
        invalid = true;
        continue;
      }
      if (!originError && !drawn.error && norm(drawn.svg) !== originNorm) {
        svgChanged = true;
        break;
      }
    }
    if (!specChanged) {
      rows.push({ type: example.type, slug: example.slug, path: field.path, control: field.control, klass: "d", reason: "probe did not stick in the spec", specChanged: false, svgChanged: false, probe: value });
      continue;
    }
    if (svgChanged && !INTERACTION.test(field.path)) {
      effects++;
      continue;
    }
    if (svgChanged && INTERACTION.test(field.path)) effects++;
    if (invalid && !svgChanged) {
      rows.push({ type: example.type, slug: example.slug, path: field.path, control: field.control, klass: "d", reason: "probe value makes the spec invalid", specChanged: true, svgChanged: false, probe: value });
      continue;
    }
    let reason = field.path === "legend" || field.path.startsWith("legend.")
      ? legendMatters ? "" : "example draws no legend"
      : dataReason(field.path, example.spec, base.svg);
    if (!reason && field.path === "locale" && !showsGroupedNumber(originNorm)) reason = "example does not format 1234.5";
    if (reason) {
      rows.push({ type: example.type, slug: example.slug, path: field.path, control: field.control, klass: "d", reason, specChanged: true, svgChanged: false, probe: value });
      continue;
    }
    if (INTERACTION.test(field.path)) {
      rows.push({ type: example.type, slug: example.slug, path: field.path, control: field.control, klass: "interaction", reason: "static SVG unchanged", specChanged: true, svgChanged: false, probe: value, spec: next });
      continue;
    }
    rows.push({ type: example.type, slug: example.slug, path: field.path, control: field.control, klass: "b", reason: "spec changed and the rendered SVG did not", specChanged: true, svgChanged: false, probe: value });
  }
  process.stdout.write(`\r${example.type}  `);
}
process.stdout.write("\n");

const pending = rows.filter((row) => row.klass === "interaction");
if (pending.length && !process.argv.includes("--skip-hover")) {
  const require = createRequire(import.meta.url);
  const playwright = require("playwright");
  const outfile = join(root, "apps/web/audit/.probe.js");
  mkdirSync(outDir, { recursive: true });
  await esbuild.build({
    entryPoints: [join(root, "scripts/audit-probe.mjs")],
    bundle: true,
    format: "iife",
    platform: "browser",
    outfile,
    logLevel: "silent",
  });
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.setContent(`<!doctype html><html><body><div id="host"></div><script>${readFileSync(outfile, "utf8")}<\/script></body></html>`, { waitUntil: "load" });
  const bySlug = new Map(examples.map((item) => [item.slug, item]));
  let done = 0;
  for (const row of pending) {
    const example = bySlug.get(row.slug);
    const baseTip = await hover(page, example.spec);
    const nextTip = await hover(page, row.spec);
    const changed = baseTip.present !== nextTip.present || baseTip.cross !== nextTip.cross || (baseTip.present && baseTip.text !== nextTip.text);
    const togglesTip = row.path === "tooltip" || row.path === "tooltip.show" || row.path === "interaction.hover";
    if (togglesTip && baseTip.present && nextTip.present && (row.probe === false || row.probe === "false")) {
      row.klass = "b";
      row.reason = "mounted chart still shows a tooltip when the option is off";
    } else if (changed) {
      row.klass = "ok";
      row.reason = "hover changed";
    } else if (togglesTip && !baseTip.present && !nextTip.present) {
      row.klass = "d";
      row.reason = "hover did not land on a mark, so the tooltip could not be compared";
    } else {
      row.klass = "d";
      row.reason = baseTip.present ? "hover tooltip did not change for this example" : "this example does not show a hover tooltip to change";
    }
    delete row.spec;
    done++;
    if (done % 10 === 0) process.stdout.write(`\rhover ${done}/${pending.length}`);
  }
  process.stdout.write("\n");
  await browser.close();
  try { (await import("node:fs")).unlinkSync(outfile); } catch { /* already gone */ }
} else {
  for (const row of pending) delete row.spec;
}

function counts(list) {
  const out = { a: 0, b: 0, c: 0, d: 0, interaction: 0 };
  for (const row of list) if (out[row.klass] != null) out[row.klass]++;
  return out;
}

const kept = rows.filter((row) => row.klass === "a" || row.klass === "b" || row.klass === "c" || row.klass === "d");
const summary = {
  generated: new Date().toISOString(),
  examples: examples.map((item) => ({ type: item.type, slug: item.slug, title: item.title })),
  probed,
  effects,
  counts: counts(kept),
  note: "Class (a) is a playground wiring bug. The preview used to assign a static SVG and never call mount(), so tooltip, crosshair, legend toggle, and hover could not run. That is fixed in the playground by mounting @chartkitdev/vanilla. Rows here are what remains after that mount is used for the hover probe.",
};

mkdirSync(outDir, { recursive: true });
const auditFile = { summary, coverage, rows: kept };
writeFileSync(join(outDir, "option-effect.json"), JSON.stringify(auditFile, null, 2));
writeStatus(auditFile);

const byType = new Map();
for (const row of kept) {
  if (row.klass === "d" && row.reason.startsWith("freeform")) continue;
  const list = byType.get(row.type) ?? [];
  list.push(row);
  byType.set(row.type, list);
}

const lines = [];
lines.push("# Option effect audit");
lines.push("");
lines.push(summary.note);
lines.push("");
lines.push(`Probed ${probed} option writes across ${examples.length} chart types. ${effects} changed the SVG. Remaining rows are classified below.`);
lines.push("");
lines.push(`- (a) playground wiring: ${summary.counts.a}`);
lines.push(`- (b) core ignores a listed option: ${summary.counts.b}`);
lines.push(`- (c) catalog scope too wide: ${summary.counts.c}`);
lines.push(`- (d) no-op for this example: ${summary.counts.d}`);
lines.push("");
lines.push("## By chart type");
lines.push("");
for (const [type, list] of [...byType.entries()].sort((a, b) => b[1].filter((row) => row.klass !== "d").length - a[1].filter((row) => row.klass !== "d").length)) {
  const interesting = list.filter((row) => row.klass === "b" || row.klass === "c" || row.klass === "a");
  if (!interesting.length) continue;
  lines.push(`### ${type} (${interesting.length})`);
  lines.push("");
  for (const row of interesting.slice(0, 12)) lines.push(`- **${row.klass}** \`${row.path}\` — ${row.reason}`);
  if (interesting.length > 12) lines.push(`- … ${interesting.length - 12} more`);
  lines.push("");
}
lines.push("## Example-only no-ops");
lines.push("");
lines.push("These changed the spec and not the picture, and the example data cannot exercise them.");
lines.push("");
const dataRows = kept.filter((row) => row.klass === "d" && !row.reason.startsWith("freeform") && !row.reason.startsWith("probe did not"));
const seen = new Set();
for (const row of dataRows) {
  const key = `${row.type}:${row.reason}`;
  if (seen.has(key)) continue;
  seen.add(key);
  lines.push(`- ${row.type}: ${row.reason} (\`${row.path}\`)`);
}
writeFileSync(join(outDir, "option-effect.md"), lines.join("\n") + "\n");
console.log(JSON.stringify(summary, null, 2));

async function hover(page, spec) {
  await page.evaluate(async (value) => {
    await window.auditMount(value);
  }, spec);
  await page.waitForSelector("#host svg", { timeout: 4000 }).catch(() => {});
  return page.evaluate(() => window.auditHover());
}
