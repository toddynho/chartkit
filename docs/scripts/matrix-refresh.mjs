/**
 * Publish docs/data/matrix/matrix.json as features.json and per-feature Markdown.
 * Spec snippets are included only after validate() and render() succeed.
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "@chartkitdev/core/validate";
import { validatePhase4 } from "@chartkitdev/core/validate/phase4";
import { render } from "@chartkitdev/core/extra";

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const matrixPath = join(docsRoot, "data/matrix/matrix.json");
const publicDir = join(docsRoot, "public");
const featureDir = join(publicDir, "features");
const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);

const TYPE_FOR = {
  "type.line": "line",
  "type.line.step": "line",
  "type.line.smooth": "line",
  "type.area": "line",
  "type.area.stacked": "stacked-area",
  "type.area.percent": "stacked-area",
  "type.bar.vertical": "bar",
  "type.bar.horizontal": "bar",
  "type.bar.grouped": "bar",
  "type.bar.stacked": "bar",
  "type.bar.percent": "bar",
  "type.bar.waterfall": "waterfall",
  "type.combo": "combo",
  "type.scatter": "scatter",
  "type.bubble": "scatter",
  "type.slope": "line",
  "type.pie": "donut",
  "type.donut": "donut",
  "type.pie.semi": "donut",
  "type.polar.radialbar": "progress-ring",
  "type.radar": "radar",
  "type.gauge": "gauge",
  "type.gauge.linear": "bullet",
  "type.kpi": "kpi",
  "type.sparkline": "sparkline",
  "type.bullet": "bullet",
  "type.progress.ring": "progress-ring",
  "type.heatmap": "heatmap",
  "type.heatmap.calendar": "heatmap",
  "type.treemap": "treemap",
  "type.sankey": "sankey",
  "type.funnel": "funnel",
  "type.pyramid": "funnel",
  "type.histogram": "histogram",
  "type.boxplot": "boxplot",
  "type.candlestick": "candlestick",
  "type.finance.volume": "candlestick",
  "type.gantt": "gantt",
  "type.timeline": "timeline",
  "type.quadrant": "quadrant",
  "type.venn": "venn",
  "type.journey": "journey",
  "type.table": "line",
  "label.show": "bar",
  "label.format": "bar",
  "mark.bar.radius": "bar",
  "mark.bar.width": "bar",
  "mark.color.point": "bar",
};

function hostType(feature) {
  if (TYPE_FOR[feature.id]) return TYPE_FOR[feature.id];
  if (feature.id.startsWith("mark.point.")) return "scatter";
  return "line";
}

function badgeOf(cell) {
  const note = cell.note || "";
  if (cell.status === "native" || cell.status === "partial" || cell.status === "unknown") return cell.status;
  if (cell.status === "plugin" || cell.status === "manual") return cell.status;
  if (cell.status === "none" && /CK3012/.test(note) && /accepted|warns|ignored/.test(note) && !/interaction\.select warns/.test(note)) {
    return "warns";
  }
  return cell.status || "unknown";
}

function loadBases() {
  const text = readFileSync(join(publicDir, "llms.txt"), "utf8");
  const bases = {};
  for (const match of text.matchAll(/```json\n([\s\S]*?)```/g)) {
    const spec = JSON.parse(match[1]);
    bases[spec.type] = spec;
  }
  return bases;
}

function setPath(root, parts, value) {
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const next = cur[key];
    if (typeof next === "string") cur[key] = { field: next };
    else if (next == null || typeof next !== "object" || Array.isArray(next)) cur[key] = {};
    cur = cur[key];
  }
  const leaf = parts[parts.length - 1];
  if (typeof cur[leaf] === "string" && value && typeof value === "object" && !Array.isArray(value)) {
    cur[leaf] = { field: cur[leaf], ...value };
  } else {
    cur[leaf] = value;
  }
}

function addField(spec, field) {
  if (!Array.isArray(spec.data)) return;
  spec.data.forEach((row, index) => {
    if (row && typeof row === "object" && !(field in row)) row[field] = index % 2 === 0 ? "A" : "B";
  });
}

function demoValue(id, parts, literal) {
  if (literal != null) {
    if (literal === "true") return true;
    if (literal === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(literal)) return Number(literal);
    return literal;
  }
  const leaf = parts[parts.length - 1];
  if (id === "scale.nice" || leaf === "nice") return false;
  if (id.startsWith("annotation.") || leaf === "annotations") {
    const axis = id.includes(".x") ? "x" : "y";
    return [{ type: "rule", axis, value: axis === "x" ? "Q2" : 50, label: "Mark" }];
  }
  if (id === "scale.domain" || id === "scale.domain.partial" || leaf === "domain") return [0, 80];
  if (id === "axis.ticks.values") return [20, 50];
  if (id === "axis.ticks.count" || leaf === "ticks") return 3;
  if (id === "layout.margin" || leaf === "padding") return { left: 48, right: 16, top: 12, bottom: 28 };
  if (leaf === "title") return parts.includes("x") ? "Quarter" : "Units";
  if (leaf === "subtitle") return "Two quarters";
  if (leaf === "rotate") return -40;
  if (leaf === "description") return "Units rose from Q1 to Q2.";
  if (leaf === "position" && parts.includes("legend")) return "bottom";
  if (leaf === "position") return parts.includes("y") ? "right" : "top";
  if (["labels", "values", "show", "reverse", "zero", "grid", "interactive", "crosshair", "keyboard", "dataTable", "connectNulls", "area", "gradient", "glow", "pan"].includes(leaf)) {
    return true;
  }
  if (leaf === "duration") return 200;
  if (leaf === "opacity" || leaf === "fillOpacity") return 0.7;
  if (leaf === "gap") return 0.35;
  if (leaf === "strokeWidth" || leaf === "pointSize" || leaf === "cornerRadius") return 4;
  if (leaf === "innerRadius" || leaf === "startAngle") return 0;
  if (leaf === "bins") return 4;
  if (leaf === "aspectRatio") return 2;
  if (leaf === "width" && parts.includes("size")) return 640;
  if (leaf === "locale") return "en-US";
  if (leaf === "format") return "compact";
  if (leaf === "dash") return "dashed";
  if (leaf === "series" && parts.includes("tokens")) return ["#0066cc", "#c45c26"];
  if (leaf === "series") return "group";
  if (leaf === "color" && parts[0] === "encoding" && parts.length === 2) return "group";
  if (leaf === "range") return ["#d6e4f0", "#0066cc"];
  if (leaf === "stack") return "stack";
  if (leaf === "orientation") return "horizontal";
  if (leaf === "curve") return "monotone";
  if (leaf === "points") return "always";
  if (leaf === "sampling") return "lttb";
  if (leaf === "layout") return "calendar";
  if (leaf === "shape") return "trapezoid";
  if (leaf === "linecap") return "round";
  if (leaf === "hover") return true;
  if (leaf === "zoom" || leaf === "brush") return "x";
  if (leaf === "animation") return { duration: 200 };
  if (leaf === "legend") return { show: true, position: "bottom" };
  if (leaf === "tooltip") return { show: true };
  if (parts[0] === "axes" && parts.length === 2) return { title: parts[1] === "x" ? "Quarter" : "Units" };
  if (leaf === "preset") return "midnight";
  if (leaf === "tokens") return { axis: "#5c6b7a" };
  if (["background", "surface", "negative", "axis"].includes(leaf)) return "#5c6b7a";
  if (leaf === "alt") return "Units rose in Q2.";
  if (leaf === "version") return "1";
  if (leaf === "volume") return "volume";
  if (leaf === "size" && parts[0] === "encoding") return "units";
  return null;
}

function concretePath(cell) {
  return (cell.apiPaths || []).find((path) => path && !path.startsWith("~"));
}

function applyFeature(spec, feature) {
  const path = concretePath(feature.cells.chartkit);
  if (!path) return feature.id.startsWith("type.");
  if (path === "ChartKitChartSpecV1") return false;
  let body = path.replace(/^ChartKitChartSpecV1\./, "");
  let literal = null;
  const eq = body.indexOf("=");
  if (eq !== -1) {
    literal = body.slice(eq + 1);
    body = body.slice(0, eq);
  }
  const parts = body.split(".").filter(Boolean);
  if (parts.length === 0) return false;
  if (parts[0] === "annotations") {
    spec.annotations = demoValue(feature.id, ["annotations"], null);
    return true;
  }
  const value = demoValue(feature.id, parts, literal);
  if (value == null) return false;
  setPath(spec, parts, value);
  if (value === "group") addField(spec, "group");
  if (feature.id === "type.finance.volume") addField(spec, "volume");
  if (feature.id === "type.bubble") {
    spec.data.forEach((row, index) => {
      row.size = 4 + index * 6;
    });
    spec.encoding.size = "size";
  }
  if (parts.includes("axis") && (value === "y2" || spec.encoding?.y?.axis === "y2")) {
    spec.axes = { ...spec.axes, y2: { title: "Other" } };
  }
  if (parts[0] === "encoding" && parts[1] === "color" && parts.includes("range")) {
    const color = spec.encoding.color;
    if (color && typeof color === "object" && !color.field) color.field = "units";
  }
  if (feature.id === "data.columns") {
    spec.data = { columns: { quarter: ["Q1", "Q2"], units: [40, 55] } };
  }
  return true;
}

function accept(spec) {
  const type = typeof spec.type === "string" ? spec.type : "";
  const result = PHASE4.has(type) ? validatePhase4(spec) : validate(spec);
  if (!result.ok) return result.errors?.map((error) => error.message).join("; ") || "invalid";
  if ((result.warnings || []).some((warning) => warning.code === "CK3012")) return "CK3012";
  let svg = "";
  try {
    svg = render(spec);
  } catch (error) {
    return error instanceof Error ? error.message : "render threw";
  }
  if (!svg || svg.includes("ck-chart-error")) return "ck-chart-error";
  return null;
}

function buildSpec(feature, bases) {
  const badge = badgeOf(feature.cells.chartkit);
  if (badge !== "native" && badge !== "partial") return null;
  const type = hostType(feature);
  const base = bases[type];
  if (!base) return null;
  const spec = feature.id === "type.heatmap.calendar"
    ? {
        version: "1",
        type: "heatmap",
        data: [
          { date: "2026-01-01", value: 1 },
          { date: "2026-01-02", value: 4 },
          { date: "2026-01-03", value: 2 },
        ],
        encoding: { x: { field: "date", type: "temporal" }, color: { field: "value" } },
        mark: { layout: "calendar" },
        a11y: { alt: "Activity peaked on January 2." },
        size: { width: 640, height: 260 },
      }
    : structuredClone(base);
  if (!spec.size) spec.size = { width: 640, height: 260 };
  const applied = feature.id === "type.heatmap.calendar" ? true : applyFeature(spec, feature);
  if (!applied && !feature.id.startsWith("type.")) return null;
  const problem = accept(spec);
  if (problem) return problem;
  return spec;
}

function publishPaths(paths) {
  return (paths || []).filter((path) => path && !path.startsWith("~[") && path.length < 180);
}

function publishCell(cell) {
  const out = {
    status: cell.status,
    tier: cell.tier ?? null,
    apiPaths: publishPaths(cell.apiPaths),
    verified: cell.verified,
    strength: cell.strength,
    source: (cell.evidence || []).map((item) => item.loc).filter(Boolean),
  };
  if (cell.note) out.note = cell.note;
  if (cell.assessed) out.assessed = cell.assessed;
  return out;
}

function addSynonym(index, name, id) {
  const key = String(name || "").trim();
  if (key.length < 2 || key.length > 140) return;
  if (/^[~\\^$]|[\[\]()*+?]/.test(key)) return;
  const list = index.get(key) || [];
  if (!list.includes(id)) list.push(id);
  index.set(key, list);
}

function pathKeys(path) {
  if (!path || path.startsWith("~[")) return [];
  if (path.startsWith("~")) {
    const body = path.slice(1);
    if (/[\\[(]/.test(body)) return [];
    return body.split("|").map((part) => part.trim()).filter((part) => /^[A-Za-z_][\w.-]*$/.test(part) && part.length >= 3);
  }
  const noEq = path.split("=")[0];
  const stripped = noEq
    .replace(/^ChartKitChartSpecV1\./, "")
    .replace(/^ChartConfiguration\.options\./, "")
    .replace(/^ChartConfiguration\./, "")
    .replace(/^Options\./, "");
  const keys = [noEq, stripped];
  const parts = stripped.split(".");
  if (parts.length >= 2) keys.push(parts.slice(-2).join("."), parts.slice(-3).join("."));
  const stop = new Set(["type", "data", "show", "text", "value", "label", "name", "line", "bar", "size", "color", "axis", "mark", "true", "false", "options"]);
  return keys.filter((key) => {
    if (!key || key.length < 3 || key.length > 140) return false;
    const last = key.split(".").pop();
    if (key.includes(".")) return true;
    return !stop.has(last);
  });
}

function probeTokens(probe) {
  if (!probe || typeof probe !== "string") return [];
  return probe
    .replace(/\\[bBdDwWsS]/g, " ")
    .split("|")
    .map((part) => part.replace(/[\\^$.*+?()[\]{}]/g, "").trim())
    .filter((part) => /^[A-Za-z][A-Za-z0-9 _./-]{1,48}$/.test(part));
}

function markdown(feature, libraries) {
  const lines = [`# ${feature.label}`, "", `ChartKit: **${feature.badge}**`, "", feature.desc, ""];
  const cell = feature.cells.chartkit;
  lines.push(`Matrix status: \`${cell.status}\`. Verification: \`${cell.verified}\` (${cell.strength}).`);
  if (cell.note) lines.push("", cell.note);
  if (cell.source?.length) lines.push("", `Source: ${cell.source.join(", ")}`);
  if (feature.spec) {
    lines.push("", "## ChartKit spec", "", "```json", JSON.stringify(feature.spec, null, 2), "```", "", "This snippet passed `validate()` (or `validatePhase4()` for phase 4) and `render()` did not return `ck-chart-error`.");
  } else if (feature.badge === "warns") {
    lines.push("", "No spec snippet. The option is accepted and `validate()` warns. It is not drawn.");
  } else if (feature.badge === "none") {
    lines.push("", "No spec snippet. ChartKit does not support this feature.");
  } else if (feature.badge === "unknown") {
    lines.push("", "No spec snippet. This ChartKit cell is unknown.");
  } else {
    lines.push("", "No spec snippet. This row is not a single option that `validate()` can show.");
  }
  lines.push("", "## Other libraries", "", "| Library | Status | Option | Verification | Source |", "|---|---|---|---|---|");
  for (const library of libraries) {
    if (library.id === "chartkit") continue;
    const other = feature.cells[library.id];
    const option = (other.apiPaths || []).slice(0, 2).join(", ").replaceAll("|", "\\|") || "—";
    const source = (other.source || []).slice(0, 2).join(", ").replaceAll("|", "\\|") || "—";
    const note = other.note ? ` ${other.note.replaceAll("|", "\\|")}` : "";
    lines.push(`| ${library.name} | ${other.status}${other.tier ? ` (${other.tier})` : ""} | ${option} | ${other.verified} (${other.strength}) | ${source}${note} |`);
  }
  lines.push("", "Other libraries were checked on 2026-10-18 against types and schemas, not by rendering. ChartKit was rechecked on 2026-10-19 against main 116d0af.", "", "https://chartkit.dev/features.json", "");
  return lines.join("\n");
}

function main() {
  const matrix = JSON.parse(readFileSync(matrixPath, "utf8"));
  const bases = loadBases();
  const synonyms = new Map();
  const skipped = [];
  const features = matrix.features.map((feature) => {
    const cells = {};
    for (const [id, cell] of Object.entries(feature.cells)) cells[id] = publishCell(cell);
    const built = buildSpec(feature, bases);
    const spec = built && typeof built === "object" ? built : null;
    if (typeof built === "string") skipped.push(`${feature.id}: ${built}`);
    const published = {
      id: feature.id,
      category: feature.category,
      label: feature.label,
      desc: feature.desc,
      agentRelevance: feature.agentRelevance,
      badge: badgeOf(feature.cells.chartkit),
      spec,
      cells,
    };
    addSynonym(synonyms, feature.label, feature.id);
    addSynonym(synonyms, feature.label.toLowerCase(), feature.id);
    for (const part of feature.label.split("/")) addSynonym(synonyms, part.trim().toLowerCase(), feature.id);
    for (const token of probeTokens(feature.probe)) addSynonym(synonyms, token, feature.id);
    for (const cell of Object.values(feature.cells)) {
      for (const path of cell.apiPaths || []) {
        for (const key of pathKeys(path)) addSynonym(synonyms, key, feature.id);
      }
    }
    return published;
  });

  const axisTitle = features.find((feature) => feature.id === "axis.title");
  if (axisTitle?.cells.chartjs?.status === "native") {
    for (const name of ["scales.x.title", "scales.y.title", "options.scales.x.title", "options.scales.x.title.text"]) {
      addSynonym(synonyms, name, "axis.title");
    }
  }

  const synonymObject = Object.fromEntries([...synonyms.entries()].sort(([a], [b]) => a.localeCompare(b)));
  const payload = {
    schemaVersion: "1.0.0",
    generated: "2026-10-19",
    methodology: "https://chartkit.dev/features#method",
    chartkitCommit: "116d0af",
    chartkitRechecked: "2026-10-19",
    dateChecked: matrix.dateChecked,
    synonymsNote:
      "Keys are feature labels, absence-probe tokens, and recorded api paths. Regex absence probes are omitted. scales.x.title and scales.y.title are conventional Chart.js names for axis.title; that cell's recorded evidence is a grep (~title), not a type-checked path.",
    schema: matrix.schema,
    libraries: matrix.libraries,
    notScored: matrix.notScored,
    taxonomy: matrix.taxonomy,
    features,
    synonyms: synonymObject,
    coverage: matrix.coverage,
  };

  mkdirSync(featureDir, { recursive: true });
  for (const file of readdirSync(featureDir)) {
    if (file.endsWith(".md")) rmSync(join(featureDir, file));
  }
  const json = `${JSON.stringify(payload)}\n`;
  writeFileSync(join(publicDir, "features.json"), json);
  for (const feature of features) {
    writeFileSync(join(featureDir, `${feature.id}.md`), markdown(feature, matrix.libraries));
  }

  const withSpec = features.filter((feature) => feature.spec).length;
  const stale = features.filter((feature) => /createRenderer\(\[line\]\) ignores/.test(feature.cells.chartkit.note || ""));
  if (stale.length) {
    console.error(stale.map((feature) => feature.id).join("\n"));
    throw new Error("ChartKit notes still say createRenderer([line]) ignores an option");
  }
  const labels = features.find((feature) => feature.id === "label.show");
  if (labels?.badge !== "partial" || labels.cells.chartkit.status !== "partial") {
    throw new Error("label.show must stay partial");
  }
  if (!synonymObject["xAxis.name"]?.includes("axis.title") || !synonymObject["scales.x.title"]?.includes("axis.title")) {
    throw new Error("synonyms missing axis title lookups");
  }
  console.log(`features.json ${json.length} bytes, ${features.length} features, ${withSpec} specs, ${Object.keys(synonymObject).length} synonyms`);
  if (skipped.length) console.log(`snippets omitted: ${skipped.length}\n${skipped.slice(0, 40).join("\n")}`);
}

main();
