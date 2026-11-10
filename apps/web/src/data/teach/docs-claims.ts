/**
 * Painted claims for the docs control sweep.
 * A control passes only when the SVG changes in the dimension that control draws.
 * Legend position is the legend box against the plot or mark box, not the data-ck-legend attribute.
 * A value that paints the same picture as another is a failure, unless CLAIM_ALLOWLIST names it and says why.
 * A waiver may let some values share one picture. It may not omit `values` for a control on the page:
 * that excuses every value painting the same chart.
 * Nested treemap shading is a separate painted claim (treemapShadeProblems). It is not listed here.
 */

export type Box = { x: number; y: number; w: number; h: number };

export type LegendRead = {
  x: number;
  y: number;
  w: number;
  h: number;
  insideView: boolean;
  screenInside: boolean;
  plot: Box | null;
  markBox: Box | null;
  marks: Box[];
  swatches: number;
  texts: string[];
};

export type ClaimWaiver = {
  type?: string;
  example?: string;
  id: string;
  /**
   * Values that may share one painted result with each other.
   * Other values must still differ from each other and from this shared picture.
   * Omitting this waives every value. The docs sweep rejects that for a control on the page.
   */
  values?: string[];
  /** Also skip the legend box checks. Only for a legend whose placement is a known design exception. */
  legend?: boolean;
  reason: string;
};

/**
 * Design exceptions. Each entry names values that may share one picture, and why.
 * An entry does not relax a different claim, and it does not hide a legend that sits on the marks
 * unless `legend` is set. Omitting `values` is rejected when the control is on the page.
 */
export const CLAIM_ALLOWLIST: ClaimWaiver[] = [
  {
    type: "treemap",
    id: "depth",
    values: ["all", "3"],
    reason:
      "Every treemap example is three levels deep. All omits the cap, which draws the same tiles as depth 3. Depth 1, 2, and 3 still paint different nesting.",
  },
  {
    type: "sunburst",
    id: "depth",
    values: ["all", "3"],
    reason:
      "The cellar and yard sunbursts are three rings. All omits the cap and paints the same rings as depth 3. Depth 1 and 2 still differ.",
  },
  {
    type: "sunburst",
    example: "traffic",
    id: "depth",
    values: ["all", "2", "3"],
    reason:
      "Traffic by source is two rings. Depth 2, 3, and all draw that whole tree. Depth 1 draws the sources only.",
  },
  {
    type: "kpi",
    example: "churn",
    id: "format",
    values: ["compact", "number"],
    reason: "Churn is 2.4. Compact and number both print 2.4. Percent prints 240 percent and still has to differ.",
  },
  {
    type: "progress-ring",
    id: "readout",
    values: ["share", "value"],
    reason: "These rings store a percent of the range. Share and the saved format both print that percent, so the center text matches.",
  },
  {
    type: "histogram",
    example: "scores",
    id: "bin",
    values: ["count", "sqrt"],
    reason: "This sample is small enough that the count rule and the square-root rule choose the same bins.",
  },
  {
    type: "donut",
    example: "sessions",
    id: "sort",
    values: ["none", "desc"],
    reason: "Sessions is already stored largest first. None keeps that order, so it paints the same slices as descending. Ascending still has to differ.",
  },
  {
    type: "donut",
    example: "sources",
    id: "sort",
    values: ["none", "desc"],
    reason: "Sources is already stored largest first. None keeps that order, so it paints the same slices as descending. Ascending still has to differ.",
  },
  {
    type: "donut",
    example: "yard",
    id: "sort",
    values: ["none", "desc"],
    reason: "Yard is already stored largest first. None keeps that order, so it paints the same slices as descending. Ascending still has to differ.",
  },
  {
    type: "donut",
    example: "fleet",
    id: "sort",
    values: ["none", "desc"],
    reason: "Fleet is already stored largest first. None keeps that order, so it paints the same slices as descending. Ascending still has to differ.",
  },
  {
    type: "pie",
    example: "revenue",
    id: "sort",
    values: ["none", "desc"],
    reason: "Revenue is already stored largest first. None keeps that order, so it paints the same slices as descending. Ascending still has to differ.",
  },
  {
    type: "pie",
    example: "plans",
    id: "sort",
    values: ["none", "desc"],
    reason: "Plans is already stored largest first. None keeps that order, so it paints the same slices as descending. Ascending still has to differ.",
  },
  {
    type: "line",
    id: "points",
    values: ["none", "hover"],
    reason:
      "Hover points are not in the static SVG. They appear on hover. Always paints the dots, and that picture has to differ from none and hover.",
  },
  {
    type: "combo",
    id: "points",
    values: ["none", "hover"],
    reason:
      "Hover points are not in the static SVG. They appear on hover. Always paints the dots, and that picture has to differ from none and hover.",
  },
  {
    type: "stacked-area",
    example: "mix",
    id: "stack",
    values: ["stack", "percent"],
    reason: "Each month in this mix already sums to the same total, so a percent stack paints the same areas as a plain stack.",
  },
  {
    type: "streamgraph",
    example: "centered",
    id: "order",
    values: ["inside-out", "ascending"],
    reason: "On this centered stream, inside-out and ascending lay the series in the same order.",
  },
  {
    type: "streamgraph",
    example: "centered",
    id: "order",
    values: ["none", "descending"],
    reason: "On this centered stream, data order and descending lay the series in the same order.",
  },
  {
    type: "streamgraph",
    example: "weekly",
    id: "order",
    values: ["inside-out", "none", "ascending"],
    reason: "On this weekly stream, inside-out, data order, and ascending lay the series in the same order. Descending still has to differ.",
  },
  {
    type: "strip",
    example: "tokens",
    id: "sort",
    values: ["none", "asc"],
    reason: "Tokens is already stored in ascending order. None keeps that order. Descending still has to differ.",
  },
  {
    type: "strip",
    example: "desks",
    id: "sort",
    values: ["none", "asc"],
    reason: "Desks is already stored in ascending order. None keeps that order. Descending still has to differ.",
  },
];

const DIMENSION: Record<string, string> = {
  anchor: "error-bar geometry",
  area: "area fill",
  atlas: "map outline",
  band: "band geometry",
  bands: "gauge bands",
  bandwidth: "density shape",
  baseline: "baseline",
  bin: "bin geometry",
  bins: "bin count",
  curve: "line shape",
  dash: "dash pattern",
  depth: "nesting",
  direction: "delta colour",
  format: "formatted value",
  gradient: "gradient fill",
  innerRadius: "hole",
  jitter: "point spread",
  labels: "labels",
  layout: "node positions",
  line: "center line",
  lineAxis: "line position",
  linecap: "stroke cap",
  link: "link shape",
  normalize: "density scale",
  offset: "stream shape",
  order: "series order",
  orient: "node positions",
  orientation: "orientation",
  padAngle: "slice gap",
  palette: "colours",
  points: "points",
  ranges: "range bands",
  readout: "center readout",
  rug: "rug marks",
  scale: "colour scale",
  scheme: "cell colours",
  seriesMark: "series mark",
  shape: "mark shape",
  size: "point size",
  sort: "mark order",
  span: "arc sweep",
  sparkline: "sparkline",
  stack: "stack geometry",
  startAngle: "start angle",
  summary: "summary mark",
  sweep: "gauge sweep",
  target: "target mark",
  thresholds: "threshold state",
  track: "track geometry",
  volume: "volume bars",
  legend: "legend box",
};

type Painted = { value: string | number; svg: string; measured: { legend: LegendRead | null } };

export function legendProblems(value: string | number, measured: { legend: LegendRead | null }): string[] {
  const legend = measured.legend;
  if (value === "off") return legend ? ["legend off still paints a legend"] : [];
  if (!legend) return ["legend marks are missing"];
  const problems: string[] = [];
  if (legend.w < 2 || legend.h < 2) problems.push("legend box is zero-size");
  if (!legend.insideView) {
    problems.push(`legend sits outside the viewBox (${legend.x.toFixed(1)},${legend.y.toFixed(1)} ${legend.w.toFixed(1)}×${legend.h.toFixed(1)})`);
  }
  if (!legend.screenInside) problems.push("legend is clipped by the chart frame");
  const area = legend.plot ?? legend.markBox;
  if (!area || area.w <= 0 || area.h <= 0) {
    problems.push("no plot or mark area to place the legend against");
    return problems;
  }
  const eps = 0.5;
  const bottom = legend.y + legend.h;
  const right = legend.x + legend.w;
  if (value === "top" && bottom > area.y + eps) {
    problems.push(`top legend bottom ${bottom.toFixed(1)} is below the plot top ${area.y.toFixed(1)}`);
  }
  if (value === "bottom" && legend.y < area.y + area.h - eps) {
    problems.push(`bottom legend top ${legend.y.toFixed(1)} is above the plot bottom ${(area.y + area.h).toFixed(1)}`);
  }
  if (value === "right" && legend.x < area.x + area.w - eps) {
    problems.push(`right legend left ${legend.x.toFixed(1)} is left of the plot right ${(area.x + area.w).toFixed(1)}`);
  }
  if (value === "left" && right > area.x + eps) {
    problems.push(`left legend right ${right.toFixed(1)} is right of the plot left ${area.x.toFixed(1)}`);
  }
  if (legend.plot && intersects(legend, legend.plot)) problems.push("legend overlaps the plot");
  if (legend.marks.some((mark) => intersects(legend, mark))) problems.push("legend overlaps a mark");
  return problems;
}

export function effectProblems(type: string, example: string, id: string, painted: Painted[]): string[] {
  if (id === "tooltip" || painted.length < 2) return [];
  const matched = waivers(type, example, id);
  if (matched.some((item) => item.values == null)) return [];
  const keys = painted.map((item) => ({ value: String(item.value), key: visualKey(id, item) }));
  const groups = matched.filter((item) => item.values?.length).map((item) => item.values ?? []);
  const excused = new Set(groups.flat());
  const problems: string[] = [];
  const seen = new Map<string, string>();
  for (const item of keys) {
    if (excused.has(item.value)) continue;
    const prior = seen.get(item.key);
    if (prior) problems.push(`${id} paints the same ${DIMENSION[id] ?? id} for ${prior} and ${item.value}`);
    else seen.set(item.key, item.value);
  }
  const groupKeys = groups.map((group) => {
    const rows = keys.filter((item) => group.includes(item.value));
    return { group, key: rows[0]?.key ?? "" };
  });
  for (let i = 0; i < groupKeys.length; i++) {
    for (let j = i + 1; j < groupKeys.length; j++) {
      const left = groupKeys[i];
      const right = groupKeys[j];
      const share = left && right && left.group.some((value) => right.group.includes(value));
      if (left && right && !share && left.key && left.key === right.key) {
        problems.push(`${id} paints the same ${DIMENSION[id] ?? id} for ${left.group.join(", ")} and ${right.group.join(", ")}`);
      }
    }
  }
  for (const item of keys) {
    if (excused.has(item.value)) continue;
    if (groupKeys.some((group) => group.key === item.key)) {
      problems.push(`${id} ${item.value} paints the same ${DIMENSION[id] ?? id} as a value declared to have no further effect`);
    }
  }
  return problems;
}

/** True when a waiver asks to skip the legend box checks for this example. */
export function legendWaived(type: string, example: string): boolean {
  return waivers(type, example, "legend").some((item) => item.legend === true);
}

function waivers(type: string, example: string, id: string): ClaimWaiver[] {
  return CLAIM_ALLOWLIST.filter((item) => item.id === id && (item.type == null || item.type === type) && (item.example == null || item.example === example));
}

function visualKey(id: string, item: Painted): string {
  if (id === "legend") {
    const box = item.measured.legend;
    if (!box) return "off";
    return `x${q(box.x, 8)}y${q(box.y, 8)}w${q(box.w, 8)}h${q(box.h, 8)}`;
  }
  return effectKey(id, item.svg);
}

function q(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function effectKey(id: string, svg: string): string {
  const body = withoutLegend(svg);
  switch (id) {
    case "depth":
      return depthKey(svg);
    case "curve":
    case "link":
    case "offset":
    case "order":
    case "lineAxis":
    case "bandwidth":
    case "normalize":
      return `${texts(body).join("|")}|${paths(body).join(";")}`;
    case "innerRadius":
    case "padAngle":
    case "startAngle":
    case "sweep":
    case "span":
    case "atlas":
      return paths(body).join(";") || "no-path";
    case "points": {
      const count = body.match(/data-ck-key="p:/g)?.length ?? body.match(/data-ck-mark="point"/g)?.length ?? 0;
      const hidden = body.match(/display:var\(--ck-line-dots/g)?.length ?? 0;
      return `points:${count} hidden:${hidden}`;
    }
    case "area":
      return `areas:${body.match(/data-ck-key="a:/g)?.length ?? 0}`;
    case "line":
      return `lines:${body.match(/data-ck-mark="line"/g)?.length ?? 0}`;
    case "gradient":
      return /<linearGradient|<radialGradient|fill="url\(/.test(svg) ? "gradient" : "solid";
    case "dash":
      return marked(body, "line").some((tag) => tag.includes("stroke-dasharray")) ? "dashed" : "solid";
    case "orientation": {
      const bars = seriesBars(body);
      if (bars.length) {
        const w = Number(/width="([^"]+)"/.exec(bars[0] ?? "")?.[1] ?? 0);
        const h = Number(/height="([^"]+)"/.exec(bars[0] ?? "")?.[1] ?? 0);
        return w >= h ? "wide" : "tall";
      }
      return paths(body).join(";") || pointKey(body);
    }
    case "stack": {
      const bars = seriesBars(body);
      if (!bars.length) return paths(body).join(";") || "no-bar";
      return bars
        .map((tag) => {
          const x = q(Number(/\bx="([^"]+)"/.exec(tag)?.[1] ?? 0), 8);
          const y = q(Number(/\by="([^"]+)"/.exec(tag)?.[1] ?? 0), 8);
          const w = q(Number(/width="([^"]+)"/.exec(tag)?.[1] ?? 0), 8);
          const h = q(Number(/height="([^"]+)"/.exec(tag)?.[1] ?? 0), 8);
          return `${x},${y},${w},${h}`;
        })
        .join(";");
    }
    case "labels":
      return labeledTexts(body);
    case "format":
    case "readout":
      return texts(body).join("|");
    case "sort":
      return uniqueNames(body).join(">");
    case "shape":
    case "seriesMark": {
      const kinds = [...body.matchAll(/data-ck-mark="([^"]+)"/g)].map((match) => match[1]);
      const tags = [...body.matchAll(/<(rect|path|polygon|circle)\b[^>]*data-ck-mark=/g)].map((match) => match[1]);
      return `${kinds.join(",")}|${tags.join(",")}|paths:${paths(body).length}`;
    }
    case "size": {
      const radii = circles(body)
        .map((dot) => dot.r)
        .filter((radius, index, all) => all.indexOf(radius) === index)
        .sort((a, b) => a - b);
      const markers = [...body.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*>/g)]
        .map((match) => match[1] ?? "")
        .filter((d) => d.length > 0 && d.length < 120)
        .map((d) => quantizePath(d));
      return `${radii.join(",")}|${markers.join(";")}` || "none";
    }
    case "palette":
    case "scheme":
    case "scale":
      return uniqueFills(body);
    case "anchor":
      return `${markGeom(body, "whisker")}|bars:${marked(body, "bar").length}|points:${marked(body, "point").length}`;
    case "rug":
      return markGeom(body, "rug") || "0";
    case "summary":
      return markGeom(body, "summary") || "0";
    case "band":
      return markGeom(body, "band") || "0";
    case "ranges": {
      const bands = markGeom(body, "band") || markGeom(body, "range");
      if (bands) return bands;
      return [...body.matchAll(/<rect\b[^>]*>/g)]
        .map((match) => q(Number(/width="([^"]+)"/.exec(match[0])?.[1] ?? 0), 4))
        .join(",");
    }
    case "target":
      return body.includes('data-ck-mark="target"') ? markGeom(body, "target") || "1" : "0";
    case "volume":
      return String(body.match(/data-ck-mark="volume"/g)?.length ?? 0);
    case "bands":
      return String(body.match(/data-ck-mark="gauge-band"/g)?.length ?? 0);
    case "linecap":
      return [...body.matchAll(/stroke-linecap="([^"]+)"/g)].map((match) => match[1]).join(",") || "none";
    case "direction":
    case "thresholds": {
      const fills = [...body.matchAll(/fill="([^"]+)"/g)].map((match) => match[1]);
      const threshold = /data-ck-threshold="([^"]+)"/.exec(svg)?.[1] ?? "";
      return `${threshold}|${fills.join("|")}|${texts(body).join("|")}`;
    }
    case "sparkline":
      return body.includes('data-ck-mark="spark"') ? "on" : "off";
    case "track":
      return [...body.matchAll(/<rect\b[^>]*>/g)]
        .map((match) => q(Number(/width="([^"]+)"/.exec(match[0])?.[1] ?? 0), 8))
        .join(",");
    case "layout":
    case "orient":
    case "jitter":
      return pointKey(body);
    case "baseline":
      return [...body.matchAll(/<line\b[^>]*data-ck-mark="spike"[^>]*>/g)]
        .map((match) => q(Number(/y1="([^"]+)"/.exec(match[0])?.[1] ?? 0), 4))
        .join(",");
    case "bin":
    case "bins": {
      const bars = marked(body, "bar");
      const widths = bars.map((tag) => q(Number(/width="([^"]+)"/.exec(tag)?.[1] ?? 0), 4));
      return `n:${bars.length}:${widths.join(",")}`;
    }
    default:
      return "unchecked";
  }
}

function depthKey(svg: string): string {
  let levels = 1;
  for (const match of svg.matchAll(/aria-label="([^"]*)"/g)) {
    const head = decode(match[1] ?? "").split(":")[0] ?? "";
    const segs = head.split(" / ").filter(Boolean).length;
    if (segs > levels) levels = segs;
  }
  const marks = svg.match(/data-ck-mark="/g)?.length ?? 0;
  return `levels:${levels} marks:${marks}`;
}

function withoutLegend(svg: string): string {
  let out = "";
  let cursor = 0;
  while (cursor < svg.length) {
    const start = svg.indexOf("<g data-ck-legend=", cursor);
    if (start < 0) {
      out += svg.slice(cursor);
      break;
    }
    out += svg.slice(cursor, start);
    let depth = 0;
    let index = start;
    for (; index < svg.length; index++) {
      if (svg.startsWith("<g>", index) || svg.startsWith("<g ", index)) depth += 1;
      else if (svg.startsWith("</g>", index)) {
        depth -= 1;
        if (depth === 0) {
          index += 4;
          break;
        }
      }
    }
    cursor = index;
  }
  return out;
}

function paths(svg: string): string[] {
  const out: string[] = [];
  for (const match of svg.matchAll(/<path\b[^>]*>/g)) {
    const d = /\bd="([^"]+)"/.exec(match[0])?.[1];
    if (d) out.push(quantizePath(d));
  }
  return out;
}

function quantizePath(d: string): string {
  return d.replace(/-?\d+(?:\.\d+)?/g, (num) => String(q(Number(num), 8)));
}

/** Cartesian bars are rects keyed b:series:category. They do not carry data-ck-mark. */
function seriesBars(svg: string): string[] {
  const out: string[] = [];
  for (const match of svg.matchAll(/<rect\b[^>]*>/g)) {
    if (/data-ck-key="b:/.test(match[0])) out.push(match[0]);
  }
  return out.length ? out : marked(svg, "bar");
}

function marked(svg: string, kind: string): string[] {
  const out: string[] = [];
  for (const match of svg.matchAll(/<\w+\b[^>]*>/g)) {
    if (match[0].includes(`data-ck-mark="${kind}"`)) out.push(match[0]);
  }
  return out;
}

function markGeom(svg: string, kind: string): string {
  return marked(svg, kind)
    .map((tag) =>
      [...tag.matchAll(/-?\d+(?:\.\d+)?/g)]
        .map((match) => String(q(Number(match[0]), 8)))
        .join(","),
    )
    .join(";");
}

function circles(svg: string): { r: number; hidden: boolean }[] {
  const out: { r: number; hidden: boolean }[] = [];
  for (const match of svg.matchAll(/<circle\b[^>]*>/g)) {
    const radius = Number(/\br="([^"]+)"/.exec(match[0])?.[1]);
    if (!Number.isFinite(radius) || radius < 1) continue;
    out.push({ r: Math.round(radius), hidden: /display:\s*none|display:var\(--ck-line-dots/.test(match[0]) });
  }
  return out;
}

function pointKey(svg: string): string {
  return [...svg.matchAll(/<circle\b[^>]*>/g)]
    .map((match) => {
      const cx = q(Number(/\bcx="([^"]+)"/.exec(match[0])?.[1] ?? 0), 8);
      const cy = q(Number(/\bcy="([^"]+)"/.exec(match[0])?.[1] ?? 0), 8);
      const id = /data-ck-id="([^"]*)"/.exec(match[0])?.[1] ?? "";
      return `${id}@${cx},${cy}`;
    })
    .join(";");
}

function labeledTexts(svg: string): string {
  return [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)]
    .map((match) => {
      const x = q(Number(/\bx="([^"]+)"/.exec(match[0])?.[1] ?? 0), 8);
      const y = q(Number(/\by="([^"]+)"/.exec(match[0])?.[1] ?? 0), 8);
      const label = decode(match[1] ?? "").replace(/\s+/g, " ").trim();
      return label ? `${label}@${x},${y}` : "";
    })
    .filter(Boolean)
    .join("|");
}

function texts(svg: string): string[] {
  return [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)]
    .map((match) => decode(match[1] ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function uniqueNames(svg: string): string[] {
  const names: string[] = [];
  for (const match of svg.matchAll(/data-ck-name="([^"]+)"/g)) {
    const name = decode(match[1] ?? "");
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
}

function uniqueFills(svg: string): string {
  const fills = new Set<string>();
  for (const match of svg.matchAll(/<(?:path|rect|circle|polygon)\b[^>]*>/g)) {
    if (match[0].includes("data-ck-legend")) continue;
    const fill = /fill="([^"]+)"/.exec(match[0])?.[1];
    if (fill && fill !== "none" && fill !== "transparent") fills.add(fill);
  }
  return [...fills].sort().join("|");
}

function decode(text: string): string {
  return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

/**
 * A painted label must be a whole source string.
 * An ellipsis, or a proper prefix of a longer data label, is a shortened label.
 */
export function truncationProblems(spec: Record<string, unknown>, svg: string): string[] {
  const sources = sourceLabels(spec);
  const exact = new Set(sources);
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const text of paintedLabels(svg)) {
    if (seen.has(text)) continue;
    seen.add(text);
    if (exact.has(text)) continue;
    if (text.endsWith("…") || text.endsWith("...")) {
      problems.push(`"${text}" is a shortened label`);
      continue;
    }
    if (text.length < 3 || numericLabel(text)) continue;
    const longer = sources.find((source) => source.length > text.length && source.startsWith(text));
    if (longer) problems.push(`"${text}" is a prefix of "${longer}"`);
  }
  return problems;
}

function sourceLabels(spec: Record<string, unknown>): string[] {
  const labels = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value !== "string") return;
    const text = value.replace(/\s+/g, " ").trim();
    if (text.length < 2 || numericLabel(text)) return;
    labels.add(text);
  };
  const walk = (value: unknown) => {
    if (typeof value === "string") add(value);
    else if (Array.isArray(value)) for (const item of value) walk(item);
    else if (value && typeof value === "object") {
      for (const item of Object.values(value as Record<string, unknown>)) walk(item);
    }
  };
  /** A title of "Low|High" paints each end as its own full label. */
  const addTitle = (value: unknown) => {
    add(value);
    if (typeof value !== "string" || !value.includes("|")) return;
    for (const part of value.split("|")) add(part);
  };
  walk(spec.data);
  add(spec.title);
  add(spec.subtitle);
  const encoding = spec.encoding;
  if (encoding && typeof encoding === "object") walkEncoding(encoding, addTitle);
  const axes = spec.axes;
  if (axes && typeof axes === "object") {
    for (const axis of Object.values(axes as Record<string, unknown>)) {
      if (axis && typeof axis === "object") addTitle((axis as { title?: unknown }).title);
    }
  }
  return [...labels];
}

function walkEncoding(value: unknown, add: (value: unknown) => void): void {
  if (Array.isArray(value)) {
    for (const item of value) walkEncoding(item, add);
    return;
  }
  if (!value || typeof value !== "object") return;
  const rec = value as Record<string, unknown>;
  add(rec.title);
  add(rec.name);
  if (rec.y) walkEncoding(rec.y, add);
  if (rec.color) walkEncoding(rec.color, add);
  if (rec.x) walkEncoding(rec.x, add);
}

function paintedLabels(svg: string): string[] {
  const out: string[] = [];
  for (const match of svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)) {
    const text = decode(match[1].replace(/<[^>]+>/g, ""))
      .replace(/\s+/g, " ")
      .trim();
    if (text) out.push(text);
  }
  return out;
}

function numericLabel(text: string): boolean {
  return /^[-+]?[$£€¥]?[\d,. ]+%?$/.test(text);
}

function intersects(a: Box, b: Box): boolean {
  const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return ix > 0.5 && iy > 0.5;
}
