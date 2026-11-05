/**
 * Geometry and sanity checks on one SSR SVG.
 * Text width uses the same 6.4px-at-11px estimate the renderers use, so a
 * gap the layout already reserved is not reported as overlap.
 * Labels are never treated as something to shorten. Overlap is a layout bug.
 */
import { contrast, flatten, hexOf, parseColor, resolvePaint } from "./colors.mjs";
import { DARK_PAGE, LIGHT_PAGE, schemeModes } from "./themes.mjs";

export const LABEL_RULE = "ChartKit does not rewrite or shorten labels. Overlap is a layout bug. The spec size wins.";

const GLYPH = 6.4 / 11;
const BOLD = 0.62;

export function checkSvg(svg, spec) {
  const findings = [];
  if (!svg || !svg.includes("<svg")) return findings;
  if (svg.includes("ck-chart-error")) return findings;
  const scene = parseScene(svg);
  if (!scene) return findings;
  const texts = scene.texts.filter((item) => item.snippet.trim() && !item.hidden);
  classify(texts, scene.swatches);
  findings.push(...overlaps(texts));
  findings.push(...outside(texts, scene));
  findings.push(...clipped(texts, scene));
  findings.push(...marksOutside(scene));
  findings.push(...legendOverlap(texts, scene));
  findings.push(...contrastFindings(texts, scene, spec));
  findings.push(...badNumbers(svg));
  findings.push(...emptyChart(scene, spec));
  return findings;
}

function overlaps(texts) {
  const pairs = [];
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i];
      const b = texts[j];
      const box = intersection(a.bbox, b.bbox);
      if (!box || box.w < 2 || box.h < 2) continue;
      const roles = [a.role, b.role].sort();
      const score = (roles.includes("legend") ? 50 : 0) + (roles.includes("tick") ? 30 : 0) + (roles.includes("title") ? 20 : 0) + box.w * box.h;
      pairs.push({ a, b, box, roles, score });
    }
  }
  pairs.sort((a, b) => b.score - a.score);
  return pairs.slice(0, 8).map((pair) => ({
    check: "text-overlap",
    severity: "error",
    detail: `${roleName(pair.a)} “${pair.a.snippet}” overlaps ${roleName(pair.b)} “${pair.b.snippet}”. ${LABEL_RULE}`,
    elements: [element(pair.a), element(pair.b)],
    signature: [pair.a, pair.b].map((item) => `${item.role}:${clip(item.snippet)}`).sort().join("~"),
    roles: pair.roles,
  }));
}

function outside(texts, scene) {
  const hits = texts.filter((item) => !contains(scene.view, item.bbox, 1));
  return hits.slice(0, 8).map((item) => ({
    check: "text-outside",
    severity: "error",
    detail: `${roleName(item)} “${item.snippet}” extends outside the viewBox. ${LABEL_RULE}`,
    elements: [element(item)],
    signature: `${item.role}:${clip(item.snippet)}`,
    roles: [item.role],
  }));
}

function clipped(texts, scene) {
  const hits = [];
  for (const item of texts) {
    if (!item.clip) continue;
    if (!contains(scene.view, item.bbox, 1)) continue;
    if (!contains(item.clip, item.bbox, 1)) hits.push(item);
  }
  return hits.slice(0, 8).map((item) => ({
    check: "text-clipped",
    severity: "error",
    detail: `${roleName(item)} “${item.snippet}” is clipped by the plot. ${LABEL_RULE}`,
    elements: [element(item)],
    signature: `${item.role}:${clip(item.snippet)}`,
    roles: [item.role],
  }));
}

function marksOutside(scene) {
  const hits = [];
  for (const mark of scene.marks) {
    if (mark.clipped) continue;
    const pastView = !contains(scene.view, mark.bbox, 2);
    const pastPlot = scene.plot && !contains(scene.plot, mark.bbox, 4);
    if (!pastView && !pastPlot) continue;
    hits.push(mark);
  }
  return hits.slice(0, 8).map((mark) => ({
    check: "mark-outside",
    severity: "error",
    detail: `Mark ${mark.id} is outside ${scene.plot && !contains(scene.plot, mark.bbox, 4) ? "the plot area" : "the viewBox"}.`,
    elements: [{ id: mark.id, role: "mark", bbox: roundBox(mark.bbox) }],
    signature: mark.id,
    roles: ["mark"],
  }));
}

function legendOverlap(texts, scene) {
  const legend = texts.filter((item) => item.role === "legend");
  if (!legend.length) return [];
  const near = scene.swatches.filter((shape) => legend.some((item) => swatchBeside(item, shape)));
  const box = union(legend.map((item) => item.bbox).concat(near.map((item) => item.bbox)));
  if (!box) return [];
  const inside = scene.legendInside;
  const hits = [];
  if (!inside && scene.plot && intersects(box, scene.plot, 1)) hits.push("plot");
  const ticks = texts.filter((item) => item.role === "tick");
  if (ticks.some((item) => intersects(box, item.bbox, 1))) hits.push("tick");
  if (scene.axes.some((axis) => intersects(box, axis, 1))) hits.push("axis");
  if (!hits.length) return [];
  const kind = hits.includes("tick") ? "tick" : hits[0];
  return [
    {
      check: "legend-overlap",
      severity: "error",
      detail: `Legend overlaps the ${kind === "tick" ? "axis labels" : kind === "axis" ? "axis" : "plot"}. ${LABEL_RULE}`,
      elements: legend.slice(0, 3).map(element),
      signature: `legend×${kind}`,
      roles: ["legend", kind],
    },
  ];
}

function contrastFindings(texts, scene, spec) {
  const modes = schemeModes(spec ?? {});
  const hits = [];
  for (const mode of modes) {
    const page = parseColor(mode === "dark" ? DARK_PAGE : LIGHT_PAGE);
    const backdrop = sceneBackground(scene, mode, page);
    for (const item of texts) {
      const fill = resolvePaint(item.fill, mode);
      if (!fill || fill.a === 0) continue;
      if (item.onPath && !item.behind) continue;
      const behindSource = item.role === "tick" ? null : item.behind;
      const behind = behindSource ? resolvePaint(behindSource.fill, mode) : null;
      if (behind && behindSource.opacity < 1) behind.a *= behindSource.opacity;
      const bg = behind && behind.a > 0.4 ? flatten(behind, backdrop) : backdrop;
      const fg = flatten(fill, bg);
      const ratio = contrast(fg, bg);
      if (ratio == null) continue;
      const large = item.fontSize >= 18 || item.weight >= 700;
      const min = large ? 3 : 4.5;
      if (ratio + 1e-6 >= min) continue;
      hits.push({ item, mode, ratio, min, fg, bg });
    }
  }
  for (const mode of modes) {
    const page = parseColor(mode === "dark" ? DARK_PAGE : LIGHT_PAGE);
    const backdrop = sceneBackground(scene, mode, page);
    const seen = new Set();
    for (const graphic of scene.graphics ?? []) {
      const paint = resolvePaint(graphic.paint, mode);
      if (!paint || paint.a === 0) continue;
      const fg = graphic.opacity < 1 ? { ...paint, a: paint.a * graphic.opacity } : paint;
      const flat = flatten(fg, backdrop);
      const ratio = contrast(flat, backdrop);
      if (ratio == null || ratio + 1e-6 >= 3) continue;
      const key = `${mode}:${hexOf(flat)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({
        item: { id: graphic.kind, role: "mark", snippet: graphic.kind, fill: graphic.paint, fontSize: 11, weight: 400, bbox: { x: 0, y: 0, w: 0, h: 0 } },
        mode,
        ratio,
        min: 3,
        fg: flat,
        bg: backdrop,
        graphic: true,
      });
    }
  }
  hits.sort((a, b) => a.ratio - b.ratio);
  return hits.slice(0, 6).map((hit) => ({
    check: "contrast",
    severity: "error",
    detail: hit.graphic
      ? `${hit.item.snippet === "stroke" ? "Line" : "Mark"} ${hexOf(hit.fg)} is ${hit.ratio.toFixed(2)}:1 on ${hexOf(hit.bg)} in ${hit.mode} mode. Minimum for a graphic is 3:1.`
      : `${roleName(hit.item)} “${hit.item.snippet}” is ${hit.ratio.toFixed(2)}:1 on ${hexOf(hit.bg)} in ${hit.mode} mode. Minimum is ${hit.min}:1.`,
    elements: [element(hit.item)],
    signature: hit.graphic ? `graphic:${hit.mode}:${hexOf(hit.fg)}` : `${hit.mode}:${hit.item.role}:${clip(hit.item.snippet)}`,
    roles: [hit.item.role],
    mode: hit.mode,
  }));
}

function badNumbers(svg) {
  const hit = /\b(?:NaN|Infinity|-Infinity|undefined)\b/.exec(svg);
  if (!hit) return [];
  return [
    {
      check: "bad-number",
      severity: "error",
      detail: `SVG contains ${hit[0]}.`,
      elements: [],
      signature: hit[0],
      roles: [],
    },
  ];
}

function emptyChart(scene, spec) {
  if (!hasData(spec)) return [];
  if (scene.marks.length > 0) return [];
  if (scene.texts.some((item) => item.fontSize >= 18)) return [];
  if (pointsHidden(spec)) return [];
  return [
    {
      check: "empty-chart",
      severity: "error",
      detail: "The spec has data and the SVG has no marks.",
      elements: [],
      signature: "no-marks",
      roles: [],
    },
  ];
}

/** pointShape none asks for no marker. A scatter then has no other mark, which is the spec. */
function pointsHidden(spec) {
  if (!spec || typeof spec !== "object") return false;
  const mark = spec.mark;
  if (mark && typeof mark === "object" && mark.pointShape === "none") return true;
  const encoding = spec.encoding;
  const y = encoding && typeof encoding === "object" ? encoding.y : undefined;
  return Boolean(y && typeof y === "object" && !Array.isArray(y) && y.pointShape === "none");
}

function hasData(spec) {
  if (!spec || typeof spec !== "object") return false;
  if (Array.isArray(spec.data) && spec.data.length > 0) return true;
  if (spec.data && typeof spec.data === "object" && Array.isArray(spec.data.rows) && spec.data.rows.length > 0) return true;
  if (spec.metric && typeof spec.metric === "object" && spec.metric.value != null && spec.metric.value !== "") return true;
  return false;
}

function sceneBackground(scene, mode, page) {
  const paint = scene.background ? resolvePaint(scene.background, mode) : null;
  if (!paint || paint.a < 0.5) return page;
  return flatten(paint, page);
}

function classify(texts, swatches) {
  for (const item of texts) {
    if (item.legendGroup || item.key.startsWith("legt:") || item.key.startsWith("leg:")) {
      item.role = "legend";
      continue;
    }
    if (/^(x:|y:|y2:)/.test(item.key)) {
      item.role = "tick";
      continue;
    }
    if (item.fontSize >= 14 && item.weight >= 600) {
      item.role = "title";
      continue;
    }
    const swatch = swatches.find((shape) => swatchBeside(item, shape));
    if (swatch) {
      item.role = "legend";
      continue;
    }
    if (item.anchor === "middle" && item.bbox.y < 40 && item.fontSize <= 12) {
      item.role = "tick";
      continue;
    }
    item.role = "label";
  }
}

function parseScene(svg) {
  if (!/<svg\b/i.test(svg)) return null;
  let view = { x: 0, y: 0, w: 640, h: 360 };
  const stack = [{ name: "#root", matrix: ident(), clip: null, hidden: false, legend: false, legendPos: "", defs: false, clipDef: "", mark: "" }];
  const texts = [];
  const swatches = [];
  const marks = [];
  const graphics = [];
  const axes = [];
  const fills = [];
  const clips = new Map();
  let background = "";
  let legendInside = false;
  const tagRe = /<!--[\s\S]*?-->|<\/?([A-Za-z][\w:.-]*)\b([^>]*?)(\/?)>/g;
  const styleRules = [];
  let last = 0;
  let match;
  let textIndex = 0;
  while ((match = tagRe.exec(svg))) {
    const owner = textOwner(stack);
    if (owner && match.index > last) {
      const chunk = decode(svg.slice(last, match.index));
      if (chunk.trim()) owner.chunks.push(chunk);
    }
    const styleFrame = styleOwner(stack);
    if (styleFrame && match.index > last) styleFrame.chunks.push(svg.slice(last, match.index));
    last = tagRe.lastIndex;
    if (!match[1]) continue;
    const name = match[1];
    const closing = match[0].startsWith("</");
    const self = Boolean(match[3]) || match[0].endsWith("/>");
    if (closing) {
      const frame = stack.pop();
      if (frame?.name === "style") styleRules.push(...classFonts(frame.chunks.join("")));
      if (frame?.name === "text") texts.push(finishText(frame, textIndex++, styleRules));
      continue;
    }
    const at = attrs(match[2] ?? "");
    const parent = stack[stack.length - 1];
    if (!parent) continue;
    if (name === "svg" && stack.length === 1) view = viewOf(at);
    const local = mul(parent.matrix, parseTransform(at.transform));
    const frame = {
      name,
      attrs: at,
      matrix: name === "svg" ? mul(local, svgMatrix(at, view)) : local,
      clip: parent.clip,
      hidden: parent.hidden || /display\s*:\s*none/.test(at.style || ""),
      legend: parent.legend || at["data-ck-legend"] !== undefined || at["data-ck-legend-row"] !== undefined,
      legendPos: at["data-ck-legend"] || parent.legendPos,
      defs: parent.defs || name === "defs" || name === "clipPath" || name === "title" || name === "desc",
      clipDef: name === "clipPath" ? at.id || parent.clipDef : parent.clipDef,
      mark: parent.mark || at["data-ck-mark"] || "",
      chunks: [],
    };
    if (at["clip-path"]) frame.clip = clips.get(urlId(at["clip-path"])) ?? parent.clip;
    if (at["data-ck-legend"] === "inside") legendInside = true;
    if (name === "textPath") {
      const owner = textOwner(stack);
      if (owner) owner.onPath = true;
    }
    if (!self) stack.push(frame);
    if (frame.defs && name !== "rect") continue;
    if (name === "rect") {
      const box = rectBox(at, frame.matrix, view);
      if (!box) continue;
      if (frame.clipDef) {
        const list = clips.get(frame.clipDef) ? [clips.get(frame.clipDef)] : [];
        clips.set(frame.clipDef, union(list.concat(box)) ?? box);
      }
      if (frame.defs) continue;
      if (!background && isBackdrop(box, view)) background = at.fill || background;
      else if (at.fill && (!frame.legend || at["data-ck-legend-plate"])) fills.push({ bbox: box, fill: at.fill, opacity: opacityOf(at) });
      if (!at["data-ck-mark"] && !frame.mark && !at["data-ck-headline"] && box.w >= 6 && box.w <= 14 && box.h >= 6 && box.h <= 14) swatches.push({ bbox: box });
      if (isMark(at, frame.mark) && !frame.legend) {
        marks.push({ id: markId(at, marks.length), bbox: box, clipped: Boolean(frame.clip) });
        noteGraphic(graphics, at, "fill");
      }
    } else if (!frame.defs && (name === "line" || name === "path" || name === "circle" || name === "ellipse" || name === "polygon" || name === "polyline")) {
      const box = shapeBox(name, at, frame.matrix);
      if (!box) continue;
      const grid = at["data-ck-grid"] !== undefined || /^(?:yg|xg):/.test(at["data-ck-key"] || "") || at["data-ck-annotation"] !== undefined;
      const marked = Boolean(at["data-ck-mark"] || frame.mark);
      if (name === "line" && !grid && !marked && (at["data-ck-axis"] || box.w > 40 || box.h > 40)) axes.push(expand(box, 1));
      if (isMark(at, frame.mark) && !frame.legend) {
        marks.push({ id: markId(at, marks.length), bbox: box, clipped: Boolean(frame.clip) });
        noteGraphic(graphics, at, name === "line" || name === "path" ? "stroke" : "fill");
        if (name === "path" && at.fill && at.fill !== "none" && box.w < view.w * 0.92 && box.h < view.h * 0.92) {
          fills.push({ bbox: box, fill: at.fill, opacity: opacityOf(at) });
        }
      }
    }
  }
  const plot = largestClip(clips, view);
  for (const item of texts) {
    const cx = item.bbox.x + item.bbox.w / 2;
    const cy = item.bbox.y + item.bbox.h / 2;
    let behind = null;
    for (const fill of fills) {
      if (cx >= fill.bbox.x && cx <= fill.bbox.x + fill.bbox.w && cy >= fill.bbox.y && cy <= fill.bbox.y + fill.bbox.h) behind = fill;
    }
    item.behind = behind;
  }
  return { view, texts, swatches, marks, graphics, axes, plot, background, legendInside };
}

function textOwner(stack) {
  for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name === "text") return stack[i];
  return null;
}

function styleOwner(stack) {
  for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name === "style") return stack[i];
  return null;
}

/** Class rules from a chart stylesheet. Later rules win, same as equal-specificity CSS. */
function classFonts(css) {
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let match;
  while ((match = re.exec(css))) {
    const fontSize = /font-size:\s*([0-9.]+)px/i.exec(match[2]);
    const weight = /font-weight:\s*([0-9]+)/i.exec(match[2]);
    if (!fontSize && !weight) continue;
    const selectors = match[1]
      .split(",")
      .map((item) => item.trim())
      .filter((item) => /^\.[A-Za-z_][\w-]*$/.test(item));
    if (!selectors.length) continue;
    rules.push({
      selectors,
      fontSize: fontSize ? Number(fontSize[1]) : null,
      weight: weight ? Number(weight[1]) : null,
    });
  }
  return rules;
}

function paintedType(at, rules) {
  let fontSize = at["font-size"] ? num(at["font-size"], 16) : null;
  const weight = at["font-weight"] ? num(at["font-weight"], 400) : 400;
  const classes = new Set(String(at.class || "").split(/\s+/).filter(Boolean));
  if (classes.size && fontSize == null) {
    for (const rule of rules) {
      if (rule.fontSize == null) continue;
      if (!rule.selectors.some((selector) => classes.has(selector.slice(1)))) continue;
      fontSize = rule.fontSize;
    }
  }
  return { fontSize: fontSize ?? 16, weight };
}

export function textBoxes(svg) {
  const scene = parseScene(svg);
  if (!scene) return [];
  return scene.texts.map((item) => ({ snippet: item.snippet, fontSize: item.fontSize, weight: item.weight, bbox: item.bbox }));
}

function finishText(frame, index, rules) {
  const at = frame.attrs;
  const painted = paintedType(at, rules);
  const fontSize = painted.fontSize;
  const weight = painted.weight;
  const anchor = at["text-anchor"] || "start";
  const lines = frame.chunks.map((chunk) => chunk.replace(/\s+/g, " ").trim()).filter(Boolean);
  const snippet = lines.join(" ").trim();
  const px = fontSize * (weight >= 600 ? BOLD : GLYPH);
  const longest = lines.reduce((best, line) => Math.max(best, line.length), snippet.length);
  const width = Math.max(px, longest * px);
  const x = num(at.x, 0);
  const y = num(at.y, 0);
  let left = x;
  if (anchor === "middle") left = x - width / 2;
  else if (anchor === "end") left = x - width;
  const local = { x: left, y: y - fontSize * 0.82, w: width, h: fontSize * Math.max(1, lines.length) };
  const bbox = transformBox(local, frame.matrix);
  return {
    id: at.id || at["data-ck-key"] || `text:${index}:${clip(snippet)}`,
    key: at["data-ck-key"] || "",
    snippet,
    fill: at.fill || "",
    fontSize,
    weight,
    anchor,
    bbox,
    clip: frame.clip,
    legendGroup: frame.legend,
    hidden: Boolean(frame.hidden),
    role: "label",
    behind: "",
    onPath: Boolean(frame.onPath),
  };
}

function noteGraphic(graphics, at, kind) {
  const paint = kind === "stroke" ? at.stroke : at.fill;
  if (!paint || paint === "none" || paint === "transparent") return;
  const opacity = kind === "stroke" ? 1 : opacityOf(at);
  if (opacity < 0.85) return;
  graphics.push({ paint, opacity, kind });
}

function opacityOf(at) {
  const value = num(at["fill-opacity"], 1);
  return value >= 0 && value <= 1 ? value : 1;
}

function isMark(at, inherited) {
  if (at["data-ck-mark"] || inherited) return true;
  const key = at["data-ck-key"] || "";
  return /^(l:|a:|b:|p:)/.test(key);
}

function swatchBeside(item, shape) {
  const gap = item.bbox.x - (shape.bbox.x + shape.bbox.w);
  const vertically = item.bbox.y < shape.bbox.y + shape.bbox.h + 6 && item.bbox.y + item.bbox.h > shape.bbox.y - 6;
  return gap >= -4 && gap <= 22 && vertically;
}

function markId(at, index) {
  return at.id || at["data-ck-key"] || at["data-ck-mark"] || `mark:${index}`;
}

function isBackdrop(box, view) {
  return box.w >= view.w * 0.9 && box.h >= view.h * 0.9;
}

function largestClip(clips, view) {
  let best = null;
  for (const box of clips.values()) {
    if (!box || box.w > view.w * 0.98 && box.h > view.h * 0.98) continue;
    if (!best || box.w * box.h > best.w * best.h) best = box;
  }
  return best;
}

function viewOf(at) {
  const vb = (at.viewBox || "").trim().split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) return { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
  return { x: 0, y: 0, w: num(at.width, 640), h: num(at.height, 360) };
}

function rectBox(at, matrix, view) {
  const w = at.width === "100%" ? view.w : num(at.width, 0);
  const h = at.height === "100%" ? view.h : num(at.height, 0);
  if (!(w > 0) || !(h > 0)) return null;
  return transformBox({ x: num(at.x, 0), y: num(at.y, 0), w, h }, matrix);
}

function shapeBox(name, at, matrix) {
  if (name === "line") {
    const x1 = num(at.x1, 0);
    const y1 = num(at.y1, 0);
    const x2 = num(at.x2, 0);
    const y2 = num(at.y2, 0);
    return transformBox({ x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 1, h: Math.abs(y2 - y1) || 1 }, matrix);
  }
  if (name === "circle" || name === "ellipse") {
    const rx = num(at.r ?? at.rx, 0);
    const ry = num(at.r ?? at.ry, rx);
    const cx = num(at.cx, 0);
    const cy = num(at.cy, 0);
    if (!(rx > 0)) return null;
    return transformBox({ x: cx - rx, y: cy - ry, w: rx * 2, h: ry * 2 }, matrix);
  }
  if (name === "polygon" || name === "polyline") {
    const nums = (at.points || "").trim().split(/[\s,]+/).map(Number).filter(Number.isFinite);
    if (nums.length < 4) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i + 1 < nums.length; i += 2) {
      minX = Math.min(minX, nums[i]);
      maxX = Math.max(maxX, nums[i]);
      minY = Math.min(minY, nums[i + 1]);
      maxY = Math.max(maxY, nums[i + 1]);
    }
    return transformBox({ x: minX, y: minY, w: maxX - minX, h: maxY - minY }, matrix);
  }
  if (name === "path") return pathBox(at.d || "", matrix);
  return null;
}

function pathBox(d, matrix) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi);
  if (!tokens) return null;
  let i = 0;
  let cx = 0;
  let cy = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const add = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };
  const take = () => Number(tokens[i++]);
  while (i < tokens.length) {
    let cmd = tokens[i];
    if (!/^[a-zA-Z]$/.test(cmd)) break;
    i += 1;
    const rel = cmd === cmd.toLowerCase();
    const kind = cmd.toUpperCase();
    const pull = (count) => {
      const pts = [];
      for (let n = 0; n < count; n++) pts.push(take());
      return pts;
    };
    if (kind === "Z") continue;
    if (kind === "H") {
      while (i < tokens.length && !/^[a-zA-Z]$/.test(tokens[i])) {
        const x = take();
        cx = rel ? cx + x : x;
        add(cx, cy);
      }
      continue;
    }
    if (kind === "V") {
      while (i < tokens.length && !/^[a-zA-Z]$/.test(tokens[i])) {
        const y = take();
        cy = rel ? cy + y : y;
        add(cx, cy);
      }
      continue;
    }
    const arity = kind === "C" ? 6 : kind === "Q" || kind === "S" ? 4 : kind === "A" ? 7 : 2;
    if (arity === 7) {
      while (i < tokens.length && !/^[a-zA-Z]$/.test(tokens[i])) {
        const nums = pull(7);
        const x = nums[5];
        const y = nums[6];
        cx = rel ? cx + x : x;
        cy = rel ? cy + y : y;
        add(cx, cy);
      }
      continue;
    }
    while (i < tokens.length && !/^[a-zA-Z]$/.test(tokens[i])) {
      const nums = pull(arity);
      if (nums.some((n) => !Number.isFinite(n))) break;
      const x = nums[nums.length - 2];
      const y = nums[nums.length - 1];
      cx = rel ? cx + x : x;
      cy = rel ? cy + y : y;
      add(cx, cy);
      for (let p = 0; p + 1 < nums.length - 2; p += 2) {
        const px = rel ? cx + nums[p] : nums[p];
        const py = rel ? cy + nums[p + 1] : nums[p + 1];
        add(px, py);
      }
    }
  }
  if (!Number.isFinite(minX)) return null;
  return transformBox({ x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) }, matrix);
}

function element(item) {
  return { id: item.id, role: item.role, bbox: roundBox(item.bbox) };
}

function roleName(item) {
  if (item.role === "tick") return "Tick label";
  if (item.role === "legend") return "Legend item";
  if (item.role === "title") return "Title";
  return "Label";
}

function clip(text) {
  return text.length > 24 ? `${text.slice(0, 24)}…` : text;
}

function roundBox(box) {
  const n = (v) => Math.round(v * 100) / 100;
  return { x: n(box.x), y: n(box.y), w: n(box.w), h: n(box.h) };
}

function contains(outer, inner, slop) {
  return inner.x >= outer.x - slop && inner.y >= outer.y - slop && inner.x + inner.w <= outer.x + outer.w + slop && inner.y + inner.h <= outer.y + outer.h + slop;
}

function intersects(a, b, slop) {
  return a.x < b.x + b.w - slop && a.x + a.w > b.x + slop && a.y < b.y + b.h - slop && a.y + a.h > b.y + slop;
}

function intersection(a, b) {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const r = Math.min(a.x + a.w, b.x + b.w);
  const bo = Math.min(a.y + a.h, b.y + b.h);
  if (r <= x || bo <= y) return null;
  return { x, y, w: r - x, h: bo - y };
}

function union(boxes) {
  const list = boxes.filter(Boolean);
  if (!list.length) return null;
  let x = Infinity;
  let y = Infinity;
  let r = -Infinity;
  let b = -Infinity;
  for (const box of list) {
    x = Math.min(x, box.x);
    y = Math.min(y, box.y);
    r = Math.max(r, box.x + box.w);
    b = Math.max(b, box.y + box.h);
  }
  return { x, y, w: r - x, h: b - y };
}

function expand(box, pad) {
  return { x: box.x - pad, y: box.y - pad, w: box.w + pad * 2, h: box.h + pad * 2 };
}

function attrs(source) {
  const out = {};
  const re = /([:@\w.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = re.exec(source))) out[match[1]] = decode(match[2] ?? match[3] ?? match[4] ?? "");
  return out;
}

function decode(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function num(value, fallback) {
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function urlId(value) {
  const match = /url\(#([^)]+)\)/.exec(value || "");
  return match?.[1] ?? "";
}

function ident() {
  return [1, 0, 0, 1, 0, 0];
}

function mul(a, b) {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

function apply(m, x, y) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

function transformBox(box, matrix) {
  const corners = [
    apply(matrix, box.x, box.y),
    apply(matrix, box.x + box.w, box.y),
    apply(matrix, box.x, box.y + box.h),
    apply(matrix, box.x + box.w, box.y + box.h),
  ];
  const xs = corners.map((p) => p[0]);
  const ys = corners.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

function parseTransform(value) {
  if (!value) return ident();
  const parts = [];
  const re = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
  let match;
  while ((match = re.exec(value))) {
    parts.push([match[1], match[2].trim().split(/[\s,]+/).map(Number)]);
  }
  let matrix = ident();
  for (let i = parts.length - 1; i >= 0; i--) matrix = mul(oneTransform(parts[i][0], parts[i][1]), matrix);
  return matrix;
}

function oneTransform(name, args) {
  if (name === "matrix" && args.length >= 6) return args.slice(0, 6);
  if (name === "translate") return [1, 0, 0, 1, args[0] || 0, args[1] || 0];
  if (name === "scale") {
    const x = args[0] || 1;
    return [x, 0, 0, args[1] ?? x, 0, 0];
  }
  if (name === "rotate") {
    const rad = ((args[0] || 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rot = [cos, sin, -sin, cos, 0, 0];
    const cx = args[1] || 0;
    const cy = args[2] || 0;
    if (!cx && !cy) return rot;
    return mul(mul([1, 0, 0, 1, cx, cy], rot), [1, 0, 0, 1, -cx, -cy]);
  }
  return ident();
}

function svgMatrix(at, fallback) {
  const vb = (at.viewBox || "").trim().split(/[\s,]+/).map(Number);
  const box = vb.length === 4 && vb[2] > 0 && vb[3] > 0 ? { x: vb[0], y: vb[1], w: vb[2], h: vb[3] } : fallback;
  const x = num(at.x, 0);
  const y = num(at.y, 0);
  const w = at.width === "100%" || at.width === undefined ? box.w : num(at.width, box.w);
  const h = at.height === "100%" || at.height === undefined ? box.h : num(at.height, box.h);
  const sx = box.w ? w / box.w : 1;
  const sy = box.h ? h / box.h : 1;
  return [sx, 0, 0, sy, x - box.x * sx, y - box.y * sy];
}
