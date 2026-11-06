/**
 * Paint claims for playground options.
 *
 * One option from optionCatalog (the same list the playground and
 * `audit:options` use) is written onto one base example. The rendered SVG
 * has to show that option's effect. A chart that merely stays non-empty
 * does not pass. Chrome text has to appear as a <text> node.
 *
 *   node scripts/render-harness/claims.mjs
 *   node scripts/render-harness/claims.mjs --update
 *   node scripts/render-harness/claims.mjs --path subtitle
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadExamples } from "./examples.mjs";
import { loadStatus } from "./generate.mjs";
import { loadRuntime } from "./load.mjs";
import { SEED, claimAllowlistPath } from "./paths.mjs";

/** A failing subtitle claim cannot be written into the allowlist. */
export const LOCKED = new Set(["subtitle"]);

const FIELD_PATH = /^encoding\.(x|y|series|color|size|open|high|low|close|volume|source|target|error|label|id|parent|note|path)$/;

const PREFER = {
  title: ["line"],
  subtitle: ["line"],
  tooltip: ["line"],
  "tooltip.mode": ["line"],
  legend: ["donut", "bar", "combo", "stacked-area"],
  "legend.position": ["donut", "combo", "bar", "stacked-area"],
  "legend.anchor": ["donut", "combo", "bar"],
  "legend.align": ["donut", "combo", "bar"],
  "legend.orient": ["donut", "combo", "bar"],
  "legend.title": ["donut", "bar", "combo"],
  "mark.innerRadius": ["donut", "pie", "sunburst"],
};

const ENUM_RANK = ["right", "bottom", "left", "horizontal", "dark", "midnight", "dashed", "dotted", "step", "currency", "percent", "nearest", "inside", "outside", "always", "none", "end", "start", "log", "band", "square"];

export function familyFor(field) {
  const path = field.path;
  if (path === "type") return "unsampled";
  if (path === "subtitle") return "subtitle";
  if (path === "title") return "title";
  if (path === "id") return "id";
  if (path === "legend") return "legend";
  if (path === "legend.position" || path === "legend.anchor" || path === "legend.align" || path === "legend.orient") return "legend-move";
  if (path === "mark.innerRadius") return "hole";
  if (path === "tooltip") return "tooltip";
  if (path === "a11y.alt") return "aria";
  if (path === "a11y.description") return "desc";
  if (path === "a11y.keyboard" || path === "a11y.dataTable" || path === "legend.interactive") return "intent";
  if (path === "animation" || path.startsWith("animation.") || path === "motion" || path.startsWith("motion.") || path === "render") return "intent";
  if (path.startsWith("interaction.")) return "intent";
  if (path === "size.width") return "width";
  if (path === "size.height" || path === "size.minHeight" || path === "size.aspectRatio") return "height";
  if (path.startsWith("size.padding")) return "clip";
  if (path === "theme" || path === "theme.mode") return "theme";
  if (path === "theme.tokens.fontSize") return "font-size";
  if (path === "theme.tokens.fontFamily") return "font-family";
  if (field.control === "color" || path.endsWith(".color")) return "color";
  if (isVisibleText(path)) return "visible-text";
  if (path === "tooltip.background" || path === "tooltip.crosshairColor") return "chrome-color";
  if (path === "tooltip.radius") return "chrome-radius";
  if (path === "tooltip.shadow") return "chrome-shadow";
  if (path.endsWith(".prefix") || path.endsWith(".suffix") || path === "mark.labelSuffix") return "text-token";
  if (path === "locale" || path === "timezone" || path.endsWith(".format") || path.endsWith(".decimals") || path.endsWith(".signed") || path.endsWith(".specifier")) return "text-changed";
  if (field.control === "json" && jsonValue(path, {}) == null) return "unsampled";
  return "semantic";
}

function isVisibleText(path) {
  if (path === "annotations") return true;
  if (path.endsWith(".title")) return true;
  if (path === "metric.label" || path === "axes.x.edgeLabel" || path === "axes.y.edgeLabel") return true;
  if (path === "mark.baseLabel" || path === "mark.total" || path === "mark.notePrefix" || path === "mark.highlight") return true;
  if (path.startsWith("headline.") && path !== "headline.tone") return true;
  return false;
}

function unescapeText(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Visible <text> nodes. The SVG <title> and <desc> are not the heading. */
export function visibleTexts(svg) {
  const stripped = svg.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "").replace(/<desc\b[^>]*>[\s\S]*?<\/desc>/gi, "");
  const out = [];
  const re = /<text\b([^>]*)>([\s\S]*?)<\/text>/g;
  for (const match of stripped.matchAll(re)) {
    const attrs = match[1] ?? "";
    const value = unescapeText((match[2] ?? "").replace(/<[^>]+>/g, ""));
    const x = Number(attrs.match(/\bx="([^"]+)"/)?.[1]);
    const y = Number(attrs.match(/\by="([^"]+)"/)?.[1]);
    if (value) out.push({ value, x, y });
  }
  return out;
}

export function plotTop(svg) {
  const clip = svg.match(/<clipPath\b[^>]*>\s*<rect\b([^>]*)\/?>/);
  const y = clip?.[1]?.match(/\by="([^"]+)"/)?.[1];
  return y == null ? null : Number(y);
}

function findText(svg, value) {
  return visibleTexts(svg).find((node) => node.value === value) ?? null;
}

/** Subtitle string in the heading, under the title when the spec has one, above the plot. */
export function judgeSubtitle(svg, spec, probe) {
  const node = findText(svg, probe);
  if (!node) return { ok: false, detail: `visible heading text does not include ${JSON.stringify(probe)}` };
  const title = typeof spec.title === "string" ? spec.title : "";
  if (title) {
    const heading = findText(svg, title);
    if (!heading) return { ok: false, detail: "title is not a visible text node, so the subtitle has nothing to sit under" };
    if (!(node.y > heading.y)) return { ok: false, detail: `subtitle y=${node.y} is not under the title y=${heading.y}` };
    if (Number.isFinite(node.x) && Number.isFinite(heading.x) && Math.abs(node.x - heading.x) > 1) {
      return { ok: false, detail: `subtitle x=${node.x} does not share the title x=${heading.x}` };
    }
  }
  const top = plotTop(svg);
  if (top != null && !(top > node.y + 3)) return { ok: false, detail: `plot clip y=${top} covers subtitle y=${node.y}` };
  return { ok: true, detail: `subtitle at y=${node.y}${top == null ? "" : `, plot at y=${top}`}` };
}

function judgeTitle(svg, probe) {
  const node = findText(svg, probe);
  if (!node) return { ok: false, detail: `visible heading text does not include ${JSON.stringify(probe)}` };
  const top = plotTop(svg);
  if (top != null && !(top > node.y + 3)) return { ok: false, detail: `plot clip y=${top} covers title y=${node.y}` };
  return { ok: true, detail: `title at y=${node.y}` };
}

function viewBox(svg) {
  const match = svg.match(/viewBox="0 0 ([0-9.]+) ([0-9.]+)"/);
  return match ? [Number(match[1]), Number(match[2])] : [0, 0];
}

function intentTokens(svg) {
  const value = svg.match(/\bdata-ck-intent="([^"]*)"/)?.[1] ?? "";
  return value.split(/\s+/).filter(Boolean);
}

function legendSig(svg) {
  const attrs = [...svg.matchAll(/\b(data-ck-legend[a-z-]*)="([^"]*)"/g)].map((match) => `${match[1]}=${match[2]}`).sort();
  const swatches = [];
  for (const match of svg.matchAll(/<rect\b([^>]*)\/?>/g)) {
    const attrs = match[1] ?? "";
    if (attrs.match(/\bwidth="([^"]+)"/)?.[1] !== "10") continue;
    if (attrs.match(/\bheight="([^"]+)"/)?.[1] !== "10") continue;
    swatches.push(`${attrs.match(/\bx="([^"]+)"/)?.[1] ?? ""},${attrs.match(/\by="([^"]+)"/)?.[1] ?? ""}`);
  }
  return { attrs, swatches };
}

function innerArc(svg) {
  const radii = [...svg.matchAll(/\bA\s+([0-9.]+)\s+[0-9.]+/g)].map((match) => Number(match[1])).filter((value) => value > 0);
  if (!radii.length) return null;
  const outer = Math.max(...radii);
  const inner = radii.filter((value) => value < outer - 0.5);
  if (!inner.length) return 0;
  return Math.min(...inner);
}

function markGeometry(svg) {
  const bits = [];
  for (const match of svg.matchAll(/<(?:rect|line|circle|ellipse)\b([^>]*)\/?>/g)) {
    const attrs = match[1] ?? "";
    const width = attrs.match(/\bwidth="([^"]+)"/)?.[1];
    const height = attrs.match(/\bheight="([^"]+)"/)?.[1];
    if (width === "100%" || height === "100%") continue;
    const pick = ["x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "width", "height", "rx", "ry"].map((name) => attrs.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1] ?? "");
    bits.push(pick.join(","));
  }
  return bits.join("|");
}

function colorsOf(svg) {
  const found = new Set();
  for (const match of svg.matchAll(/\b(?:fill|stroke)="([^"]+)"/g)) {
    const value = match[1].toLowerCase();
    if (value === "none" || value === "transparent") continue;
    found.add(value);
  }
  return [...found].sort();
}

function nums(svg, name) {
  return [...svg.matchAll(new RegExp(`\\b${name}="([^"]+)"`, "g"))].map((match) => match[1]).sort();
}

function paintFacts(svg) {
  const texts = visibleTexts(svg);
  const legend = legendSig(svg);
  const box = viewBox(svg);
  const clip = svg.match(/<clipPath\b[^>]*>\s*<rect\b([^>]*)\/?>/)?.[1] ?? "";
  const hooks = [...svg.matchAll(/\b(data-ck-[a-z0-9-]+)="([^"]*)"/g)]
    .filter((match) => match[1] !== "data-ck-id" && match[1] !== "data-ck-key")
    .map((match) => `${match[1]}=${match[2]}`)
    .sort();
  const geometry = [
    ...svg.matchAll(/\b(?:d|points)="([^"]+)"/g),
  ].map((match) => match[1]).join("|");
  return {
    texts: texts.map((node) => node.value),
    places: texts.map((node) => `${node.value}@${Math.round(node.x)},${Math.round(node.y)}`),
    aria: svg.match(/\baria-label="([^"]*)"/)?.[1] ?? "",
    desc: svg.match(/<desc\b[^>]*>([\s\S]*?)<\/desc>/)?.[1] ?? "",
    intent: intentTokens(svg).join(" "),
    legend: legend.attrs.join(" "),
    swatches: legend.swatches.join(" "),
    box: box.join(" "),
    clip,
    hooks: hooks.join(" "),
    colors: colorsOf(svg).join(" "),
    strokes: nums(svg, "stroke-width").join(" "),
    opacity: [...nums(svg, "opacity"), ...nums(svg, "fill-opacity"), ...nums(svg, "stroke-opacity")].join(" "),
    fonts: nums(svg, "font-size").join(" "),
    family: svg.match(/\bstyle="([^"]*)"/)?.[1] ?? "",
    circles: nums(svg, "r").join(" "),
    marks: markGeometry(svg),
    transforms: [...svg.matchAll(/\btransform="([^"]+)"/g)].map((match) => match[1]).join("|"),
    blur: (svg.match(/feGaussianBlur/g) ?? []).length,
    gradients: (svg.match(/<linearGradient/g) ?? []).length,
    dash: (svg.match(/stroke-dasharray/g) ?? []).length,
    inner: innerArc(svg),
    geometry,
  };
}

function factChanges(before, after) {
  const left = paintFacts(before);
  const right = paintFacts(after);
  const names = [];
  for (const key of Object.keys(left)) {
    if (JSON.stringify(left[key]) !== JSON.stringify(right[key])) names.push(key);
  }
  return names;
}

function jsonValue(path, spec) {
  if (path === "annotations") return [{ type: "rule", axis: "y", value: sampleNumber(spec), label: "CkRule" }];
  if (path === "mark.palette" || path === "theme.tokens.series") return ["#ff00aa", "#111111", "#00aaff"];
  if (path === "mark.colorRules") return [{ color: "#ff00aa", gte: 0 }];
  if (path.endsWith(".scale.domain") || path === "encoding.color.domain" || path === "encoding.color.range") return [0, 10];
  if (path.endsWith(".ticks")) return [0, 1, 2];
  if (path === "mark.explode") return ["Search"];
  if (path === "axes.x.breaks" || path === "axes.y.breaks" || path === "axes.y2.breaks") return [{ from: 1, to: 2 }];
  return null;
}

function sampleNumber(spec) {
  const rows = Array.isArray(spec.data) ? spec.data : [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    for (const value of Object.values(row)) {
      if (typeof value === "number" && Number.isFinite(value)) return value;
    }
  }
  const metric = spec.metric;
  if (metric && typeof metric === "object" && typeof metric.value === "number") return metric.value;
  return 1;
}

function spareColumn(spec, current) {
  const rows = Array.isArray(spec.data) ? spec.data : [];
  const row = rows.find((item) => item && typeof item === "object");
  if (!row) return null;
  return Object.keys(row).find((key) => key && key !== current) ?? null;
}

function probeFor(field, spec, current) {
  if (field.path === "tooltip.background" || field.path === "tooltip.crosshairColor") return { value: "#ff00aa" };
  if (field.path === "tooltip.shadow") return { value: "0 2px 4px #00000022" };
  if (field.control === "json" || field.path === "annotations") {
    const value = field.path === "annotations" ? jsonValue(field.path, spec) : jsonValue(field.path, spec);
    if (value == null) return { skip: "unsampled", detail: "JSON control has no discrete painted probe" };
    return { value };
  }
  if (field.control === "boolean" || field.storage === "union-boolean") {
    if (current === true) return { value: false };
    if (current === false) return { value: true };
    return { value: field.defaultValue === true ? false : true };
  }
  if (field.control === "enum") return { value: enumProbe(field, current) };
  if (field.control === "number") {
    if (field.path === "size.minHeight") return { value: 800 };
    if (field.path === "size.aspectRatio") return { value: 2 };
    if (field.path.startsWith("size.padding")) return { value: 96 };
    if (field.path.endsWith("pointSize")) return { value: 14 };
    return { value: numberProbe(field, current) };
  }
  if (field.control === "color") return { value: String(current).toLowerCase() === "#ff00aa" ? "#111111" : "#ff00aa" };
  if (field.control === "text" || field.storage === "union-text") return { value: textProbe(field, spec, current) };
  return { skip: "unsampled", detail: "No discrete painted probe" };
}

function enumProbe(field, current) {
  const values = field.enumValues ?? [];
  const ranked = [...ENUM_RANK.filter((value) => values.includes(value)), ...values];
  for (const value of ranked) {
    if (value === current) continue;
    if (value === field.defaultValue) continue;
    return value;
  }
  return values.find((value) => value !== current) ?? null;
}

function numberProbe(field, current) {
  const min = typeof field.minimum === "number" ? field.minimum : null;
  const max = typeof field.maximum === "number" ? field.maximum : null;
  const candidates = [0.22, 0.82, 2, 3, 4, 6, 8, 12, 16, 24, 36, 48, 0.5, 1, 0];
  for (const raw of candidates) {
    if (min != null && raw < min) continue;
    if (max != null && raw > max) continue;
    const value = field.coerce === "integer" ? Math.round(raw) : raw;
    if (value === current) continue;
    if (value === field.defaultValue) continue;
    return value;
  }
  if (typeof max === "number" && max !== current && max !== field.defaultValue) return max;
  return null;
}

function textProbe(field, spec, current) {
  const path = field.path;
  if (path === "title") return "Testing";
  if (path === "subtitle") return "testing where is this?";
  if (path === "locale") return current === "de-DE" ? "ja-JP" : "de-DE";
  if (path === "timezone") return current === "UTC" ? "America/New_York" : "UTC";
  if (path.endsWith("currency")) return current === "EUR" ? "USD" : "EUR";
  if (path.endsWith("prefix")) return "≈";
  if (path.endsWith("suffix") || path === "mark.labelSuffix") return " kg";
  if (path.endsWith("specifier")) return ".0f";
  if (path === "size.width") return current === "520" ? "280" : "520";
  if (path === "size.height") return current === "180" ? "420" : "180";
  if (path === "id") return "ck-paint-id";
  if (path === "theme.tokens.fontFamily") return "Georgia";
  if (FIELD_PATH.test(path)) return spareColumn(spec, typeof current === "string" ? current : "");
  if (current === "CkPaint") return "CkPaint two";
  return "CkPaint";
}

function hasLegend(spec) {
  const encoding = spec.encoding && typeof spec.encoding === "object" ? spec.encoding : {};
  if (typeof encoding.series === "string" && encoding.series) return true;
  if (Array.isArray(encoding.y) && encoding.y.length > 1) return true;
  return spec.type === "donut" || spec.type === "pie" || spec.type === "treemap" || spec.type === "sunburst";
}

function hasY2(spec) {
  const y = spec.encoding && typeof spec.encoding === "object" ? spec.encoding.y : undefined;
  const list = Array.isArray(y) ? y : y ? [y] : [];
  return list.some((item) => item && typeof item === "object" && item.axis === "y2");
}

function preferTypes(path) {
  if (PREFER[path]) return PREFER[path];
  if (path.startsWith("tooltip")) return ["line", "bar", "combo"];
  if (path.startsWith("axes.")) return ["line", "bar", "combo", "stacked-area"];
  if (path.startsWith("encoding.")) return ["line", "bar", "combo", "scatter"];
  if (path.startsWith("mark.") || path.startsWith("theme") || path === "locale" || path === "timezone" || path.startsWith("size.")) return ["line", "bar", "donut"];
  return ["line", "bar", "donut", "combo"];
}

function hostFor(field, examples, status, runtime) {
  const present = [...new Set(examples.map((example) => example.type))];
  const types = (field.appliesTo?.length ? field.appliesTo : present).filter((type) => present.includes(type));
  if (!types.length) return { status: "needs-data", detail: "No example for this option", examples: [] };
  const known = types.map((type) => status[type]?.[field.path]?.status).filter(Boolean);
  if (known.length && known.every((item) => item === "not-yet")) return { status: "not-yet", detail: "Not yet supported", examples: [] };
  if (known.length && !known.includes("works") && known.every((item) => item === "needs-data" || item === "not-yet")) {
    return { status: "needs-data", detail: "Example data does not exercise this option", examples: [] };
  }
  const usable = types.filter((type) => {
    const item = status[type]?.[field.path]?.status;
    return item == null || item === "works";
  });
  const pool = usable.length ? usable : types;
  let list = examples.filter((example) => pool.includes(example.type));
  if (field.path === "legend" || field.path.startsWith("legend.")) {
    const legend = list.filter((example) => hasLegend(example.spec));
    if (legend.length) list = legend;
  }
  if (field.path.startsWith("axes.y2") || field.path.startsWith("encoding.y2")) {
    const y2 = list.filter((example) => hasY2(example.spec));
    if (y2.length) list = y2;
  }
  if (field.path === "title" || field.path === "subtitle") {
    const titled = list.filter((example) => typeof example.spec.title === "string" && example.spec.title);
    if (titled.length) list = titled;
  }
  const prefer = preferTypes(field.path);
  const rank = (type) => {
    const index = prefer.indexOf(type);
    return index === -1 ? prefer.length + 1 : index;
  };
  list.sort((a, b) => rank(a.type) - rank(b.type) || a.type.localeCompare(b.type) || a.slug.localeCompare(b.slug));
  const picked = [];
  for (const example of list) {
    if (runtime.optionBlocked(example.spec, field.path)) continue;
    picked.push(example);
    if (picked.length >= 6) break;
  }
  if (!picked.length) return { status: "blocked", detail: "An ancestor is an array, so the nested control does not apply", examples: [] };
  return { examples: picked };
}

function stick(runtime, spec, field, value) {
  if (value == null) return null;
  const next = runtime.writeOption(spec, field, value);
  if (JSON.stringify(next) === JSON.stringify(spec)) return null;
  return next;
}

async function paint(render, spec) {
  const drawn = await render(spec);
  if (drawn.failed) return { ok: false, detail: drawn.message || "render failed", svg: drawn.svg };
  return { ok: true, detail: "", svg: drawn.svg };
}

function judge(family, beforeSvg, afterSvg, probe, spec) {
  if (family === "title") return judgeTitle(afterSvg, probe);
  if (family === "subtitle") return judgeSubtitle(afterSvg, spec, probe);
  if (family === "visible-text") {
    const node = findText(afterSvg, String(probe));
    if (!node) return { ok: false, detail: `visible text does not include ${JSON.stringify(probe)}` };
    if (findText(beforeSvg, String(probe))) return { ok: false, detail: "probe was already painted" };
    return { ok: true, detail: `text at y=${node.y}` };
  }
  if (family === "text-token") {
    const token = String(probe);
    const hit = visibleTexts(afterSvg).some((node) => node.value.includes(token));
    if (!hit) return { ok: false, detail: `no visible text includes ${JSON.stringify(token)}` };
    return { ok: true, detail: `visible text includes ${JSON.stringify(token)}` };
  }
  if (family === "text-changed") {
    const left = visibleTexts(beforeSvg).map((node) => node.value).join("\n");
    const right = visibleTexts(afterSvg).map((node) => node.value).join("\n");
    if (left === right) return { ok: false, detail: "visible text did not change" };
    return { ok: true, detail: "visible text changed" };
  }
  if (family === "aria") {
    const label = afterSvg.match(/\baria-label="([^"]*)"/)?.[1] ?? "";
    if (!unescapeText(label).includes(String(probe))) return { ok: false, detail: "aria-label does not include the alt text" };
    return { ok: true, detail: "aria-label includes the alt text" };
  }
  if (family === "desc") {
    const desc = afterSvg.match(/<desc\b[^>]*>([\s\S]*?)<\/desc>/)?.[1] ?? "";
    if (!unescapeText(desc).includes(String(probe))) return { ok: false, detail: "desc does not include the description" };
    return { ok: true, detail: "desc includes the description" };
  }
  if (family === "id") {
    const before = beforeSvg.match(/\bdata-ck-id="([^"]*)"/)?.[1] ?? "";
    const after = afterSvg.match(/\bdata-ck-id="([^"]*)"/)?.[1] ?? "";
    if (!after || after === before) return { ok: false, detail: "data-ck-id did not change" };
    return { ok: true, detail: "data-ck-id changed" };
  }
  if (family === "intent") {
    const before = intentTokens(beforeSvg).join(" ");
    const after = intentTokens(afterSvg).join(" ");
    if (before === after) return { ok: false, detail: "data-ck-intent did not change" };
    return { ok: true, detail: `data-ck-intent ${JSON.stringify(before) || "∅"} → ${JSON.stringify(after) || "∅"}` };
  }
  if (family === "width" || family === "height") {
    const [bw, bh] = viewBox(beforeSvg);
    const [aw, ah] = viewBox(afterSvg);
    const changed = family === "width" ? aw !== bw : ah !== bh;
    if (!changed) return { ok: false, detail: `viewBox stayed ${bw}×${bh}` };
    return { ok: true, detail: `viewBox ${bw}×${bh} → ${aw}×${ah}` };
  }
  if (family === "color" || family === "chrome-color") {
    const needle = String(probe).toLowerCase();
    const painted = afterSvg.toLowerCase().includes(needle);
    if (family === "chrome-color") {
      if (!painted || !/data-ck-(?:chrome-|xhair=)/.test(afterSvg)) return { ok: false, detail: `${needle} is not on a tooltip chrome hook` };
      return { ok: true, detail: `${needle} is on the tooltip chrome` };
    }
    if (painted) return { ok: true, detail: `${needle} is painted` };
    if (factChanges(beforeSvg, afterSvg).includes("colors")) return { ok: true, detail: "painted colors changed" };
    return { ok: false, detail: `${needle} is not in the SVG` };
  }
  if (family === "chrome-radius") {
    const value = afterSvg.match(/\bdata-ck-chrome-radius="([^"]+)"/)?.[1];
    if (value == null) return { ok: false, detail: "data-ck-chrome-radius is missing" };
    return { ok: true, detail: `data-ck-chrome-radius=${value}` };
  }
  if (family === "chrome-shadow") {
    if (!afterSvg.includes("data-ck-chrome-shadow=")) return { ok: false, detail: "data-ck-chrome-shadow is missing" };
    return { ok: true, detail: "data-ck-chrome-shadow is set" };
  }
  if (family === "font-size") {
    const before = nums(beforeSvg, "font-size").join(" ");
    const after = nums(afterSvg, "font-size").join(" ");
    if (before === after) return { ok: false, detail: "font-size did not change" };
    return { ok: true, detail: `font-size ${before || "∅"} → ${after || "∅"}` };
  }
  if (family === "font-family") {
    if (!afterSvg.includes(String(probe))) return { ok: false, detail: "font family is not in the SVG" };
    return { ok: true, detail: `font family ${probe}` };
  }
  if (family === "theme" || family === "clip" || family === "semantic") {
    const names = factChanges(beforeSvg, afterSvg);
    if (!names.length) return { ok: false, detail: "painted SVG did not change" };
    return { ok: true, detail: names.join(", ") };
  }
  return { ok: false, detail: `no judge for ${family}` };
}

function withAxisTitle(spec, path) {
  const axis = path.split(".")[1] || "x";
  const next = structuredClone(spec);
  const axes = next.axes && typeof next.axes === "object" ? { ...next.axes } : {};
  const node = axes[axis] && typeof axes[axis] === "object" ? { ...axes[axis] } : {};
  if (typeof node.title !== "string" || node.title === "") node.title = "CkAxis";
  axes[axis] = node;
  next.axes = axes;
  return next;
}

function withPoints(spec) {
  const next = structuredClone(spec);
  const mark = next.mark && typeof next.mark === "object" ? { ...next.mark } : {};
  mark.points = "always";
  next.mark = mark;
  return next;
}

function seedLocale(spec) {
  const next = structuredClone(spec);
  if (next.metric && typeof next.metric === "object" && typeof next.metric.value === "number") {
    next.metric = { ...next.metric, value: 1234.5 };
    return next;
  }
  if (!Array.isArray(next.data)) return spec;
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
  return spec;
}

function finishProbe(field, next) {
  if (!next) return null;
  if (field.path === "size.aspectRatio" && next.size && typeof next.size === "object") {
    next.size = { ...next.size, height: "auto" };
  }
  return next;
}

async function claimOne(runtime, field, examples, status, render) {
  const family = familyFor(field);
  const host = hostFor(field, examples, status, runtime);
  const first = host.examples[0];
  const base = {
    path: field.path,
    family,
    type: first?.type ?? "",
    example: first?.slug ?? "",
    probe: null,
  };
  if (!first) return { ...base, status: host.status, detail: host.detail };
  if (family === "unsampled") return { ...base, status: "unsampled", detail: "JSON control, or the type field, has no discrete painted probe" };

  let failure = null;
  let skipped = null;
  for (const example of host.examples) {
    const result = await claimExample(runtime, field, example, family, render);
    if (result.status === "pass") return result;
    if (result.status === "fail") failure = failure ?? result;
    else skipped = skipped ?? result;
  }
  return failure ?? skipped ?? { ...base, status: "fail", detail: "No example could be claimed" };
}

function preparedSpec(field, spec) {
  let next = spec;
  if (field.path === "locale") next = seedLocale(next);
  if (/\.titleRotate$/.test(field.path) || /\.titlePosition$/.test(field.path)) next = withAxisTitle(next, field.path);
  if (field.path === "mark.pointSize" || field.path === "mark.pointFill" || field.path === "encoding.y.pointSize" || field.path === "encoding.y.pointFill") next = withPoints(next);
  return next;
}

async function claimExample(runtime, field, example, family, render) {
  const spec = preparedSpec(field, example.spec);
  const base = { path: field.path, family, type: example.type, example: example.slug, probe: null };
  const current = runtime.readOption(spec, field);
  if (current.complex && field.control !== "json" && !FIELD_PATH.test(field.path)) {
    return { ...base, status: "unsampled", detail: "The example stores a complex value the scalar control cannot edit" };
  }
  if (family === "hole") return holeClaim(runtime, field, spec, render, base);
  if (family === "legend") return legendClaim(runtime, field, spec, render, base);
  if (family === "legend-move") return legendMoveClaim(runtime, field, spec, render, base);
  if (family === "tooltip") return tooltipClaim(runtime, field, spec, render, base);

  const probed = probeFor(field, spec, current.value);
  if (probed.skip) return { ...base, status: probed.skip, detail: probed.detail };
  if (probed.value == null || probed.value === "") return { ...base, status: "needs-data", detail: "No probe value for this example" };
  const next = finishProbe(field, stick(runtime, spec, field, probed.value));
  if (!next) return { ...base, status: "needs-data", detail: "Probe did not stick in the spec", probe: probed.value };
  const before = await paint(render, spec);
  const after = await paint(render, next);
  if (!before.ok || !after.ok) {
    return { ...base, status: "fail", detail: after.detail || before.detail, probe: probed.value };
  }
  const verdict = judge(family, before.svg, after.svg, probed.value, next);
  return { ...base, status: verdict.ok ? "pass" : "fail", detail: verdict.detail, probe: probed.value };
}

async function holeClaim(runtime, field, spec, render, base) {
  const lowSpec = stick(runtime, spec, field, 0.22);
  const highSpec = stick(runtime, spec, field, 0.82);
  if (!lowSpec || !highSpec) return { ...base, status: "needs-data", detail: "Inner radius probe did not stick", probe: "0.22→0.82" };
  const low = await paint(render, lowSpec);
  const high = await paint(render, highSpec);
  if (!low.ok || !high.ok) return { ...base, status: "fail", detail: high.detail || low.detail, probe: "0.22→0.82" };
  const innerLow = innerArc(low.svg);
  const innerHigh = innerArc(high.svg);
  if (innerLow == null || innerHigh == null) return { ...base, status: "fail", detail: "No arc radius in the SVG", probe: "0.22→0.82" };
  if (!(innerHigh > innerLow + 1)) {
    return { ...base, status: "fail", detail: `inner radius ${innerLow} did not grow to ${innerHigh}`, probe: "0.22→0.82" };
  }
  return { ...base, status: "pass", detail: `inner radius ${innerLow} → ${innerHigh}`, probe: "0.22→0.82" };
}

async function legendClaim(runtime, field, spec, render, base) {
  const onSpec = stick(runtime, spec, field, true) ?? spec;
  const offSpec = stick(runtime, spec, field, false);
  if (!offSpec) return { ...base, status: "needs-data", detail: "legend false did not stick", probe: false };
  const on = await paint(render, onSpec);
  const off = await paint(render, offSpec);
  if (!on.ok || !off.ok) return { ...base, status: "fail", detail: off.detail || on.detail, probe: false };
  const shown = legendSig(on.svg);
  const hidden = legendSig(off.svg);
  if (shown.swatches.length > hidden.swatches.length || (shown.attrs.length > 0 && hidden.attrs.length === 0)) {
    return { ...base, status: "pass", detail: `legend marks ${shown.swatches.length} → ${hidden.swatches.length}`, probe: false };
  }
  return { ...base, status: "fail", detail: `legend marks stayed ${shown.swatches.length}`, probe: false };
}

async function legendMoveClaim(runtime, field, spec, render, base) {
  const values = (field.enumValues ?? []).filter((value) => value !== field.defaultValue);
  const first = values.includes("right") ? "right" : values[0];
  const second = values.includes("bottom") && first !== "bottom" ? "bottom" : values.find((value) => value !== first);
  const left = stick(runtime, spec, field, first);
  const right = second ? stick(runtime, spec, field, second) : null;
  if (!left || !right) return { ...base, status: "needs-data", detail: "Legend position probe did not stick", probe: `${first}→${second ?? ""}` };
  const a = await paint(render, left);
  const b = await paint(render, right);
  if (!a.ok || !b.ok) return { ...base, status: "fail", detail: b.detail || a.detail, probe: `${first}→${second}` };
  const leftSig = legendSig(a.svg);
  const rightSig = legendSig(b.svg);
  const attrsDiffer = leftSig.attrs.join(" ") !== rightSig.attrs.join(" ");
  const marksDiffer = leftSig.swatches.join(" ") !== rightSig.swatches.join(" ");
  if (attrsDiffer || marksDiffer) {
    const how = attrsDiffer ? `legend attr ${leftSig.attrs[0] ?? "∅"} → ${rightSig.attrs[0] ?? "∅"}` : "legend swatches moved";
    return { ...base, status: "pass", detail: how, probe: `${first}→${second}` };
  }
  return { ...base, status: "fail", detail: "legend did not move", probe: `${first}→${second}` };
}

async function tooltipClaim(runtime, field, spec, render, base) {
  const onSpec = stick(runtime, spec, field, true) ?? spec;
  const offSpec = stick(runtime, spec, field, false);
  if (!offSpec) return { ...base, status: "needs-data", detail: "tooltip false did not stick", probe: false };
  const on = await paint(render, onSpec);
  const off = await paint(render, offSpec);
  if (!on.ok || !off.ok) return { ...base, status: "fail", detail: off.detail || on.detail, probe: false };
  const onTip = intentTokens(on.svg).includes("tip");
  const offTip = intentTokens(off.svg).includes("tip");
  if (offTip && !onTip) return { ...base, status: "pass", detail: "data-ck-intent includes tip when tooltip is off, and not when it is on", probe: false };
  return {
    ...base,
    status: "fail",
    detail: `tooltip on intent=${JSON.stringify(intentTokens(on.svg).join(" ") || "∅")} off intent=${JSON.stringify(intentTokens(off.svg).join(" ") || "∅")}`,
    probe: false,
  };
}

async function draw(runtime, spec) {
  try {
    const type = spec?.type;
    let svg = "";
    if (type === "bar-list") svg = runtime.renderBarList(spec) ?? "";
    else if (type === "choropleth" || type === "map-points") svg = await runtime.renderGeo(spec);
    else svg = runtime.render(spec) ?? "";
    if (typeof svg !== "string") svg = "";
    const failed = !svg.includes("<svg") || svg.includes("ck-chart-error");
    return { svg, failed, message: failed ? "render returned an error SVG" : "" };
  } catch (error) {
    return { svg: "", failed: true, message: error instanceof Error ? error.message : String(error) };
  }
}

export function readClaimAllowlist() {
  try {
    const parsed = JSON.parse(readFileSync(claimAllowlistPath, "utf8"));
    return new Set(parsed.paths ?? []);
  } catch {
    return new Set();
  }
}

export function writeClaimAllowlist(paths) {
  const clean = [...new Set(paths)].filter((path) => !LOCKED.has(path)).sort();
  const doc = {
    version: 1,
    seed: SEED,
    note: "Playground options whose painted claim already fails. CI fails when a run reports a failing path that is not listed. subtitle is not allowed here. Refresh with npm run test:render:claims:update.",
    paths: clean,
  };
  writeFileSync(claimAllowlistPath, `${JSON.stringify(doc, null, 2)}\n`);
  return clean.length;
}

export async function runClaims({ update = false, only = "" } = {}) {
  const runtime = await loadRuntime();
  const examples = loadExamples(runtime);
  const status = loadStatus();
  const cache = new Map();
  const render = (spec) => {
    const key = JSON.stringify(spec);
    if (!cache.has(key)) cache.set(key, draw(runtime, spec));
    return cache.get(key);
  };
  const fields = runtime.optionCatalog.filter((field) => !only || field.path === only);
  const results = [];
  for (const field of fields) results.push(await claimOne(runtime, field, examples, status, render));
  results.sort((a, b) => a.path.localeCompare(b.path));
  const allowlist = readClaimAllowlist();
  const failures = results.filter((row) => row.status === "fail");
  const novel = failures.filter((row) => !allowlist.has(row.path));
  const locked = results.filter((row) => LOCKED.has(row.path) && row.status !== "pass");
  if (update && !only) writeClaimAllowlist(failures.map((row) => row.path));
  const counts = {};
  for (const row of results) counts[row.status] = (counts[row.status] ?? 0) + 1;
  return { results, failures, novel, locked, allowlist, counts, byPath: Object.fromEntries(results.map((row) => [row.path, row])) };
}

function parseArgs(argv) {
  const update = argv.includes("--update");
  const pathFlag = argv.indexOf("--path");
  const only = pathFlag >= 0 ? argv[pathFlag + 1] ?? "" : "";
  return { update, only };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await runClaims(args);
  const lines = result.novel.map((row) => `${row.path} [${row.type}] ${row.detail}`);
  if (lines.length) console.error(lines.join("\n"));
  else if (result.failures.length) console.error(`${result.failures.length} known claim misses are allowlisted.`);
  console.log(JSON.stringify({ ...result.counts, novel: result.novel.map((row) => row.path), locked: result.locked.map((row) => row.path) }, null, 2));
  if (result.locked.length || (!args.update && result.novel.length)) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
