import { capturing } from "../canvas/scene-hook";
import { marker } from "../glyphs";
import { CHROME_TOP } from "../chrome";
import { legendSpace, type LegendItem } from "../legend";
import { ch, esc, fontStyle, n } from "../svg";
import { slots } from "../feature-hooks";
import { labelInk } from "../ink";
import { cssVar } from "../theme";
import type { PlotBox, PlotModel, Series } from "./types";
import { hooks } from "./hooks";
import { explicitMark, markerShape, strokeOf } from "./marks";

function legendColor(model: PlotModel, series: Series): string {
  if (series.mark === "line") return strokeOf(series, model);
  return series.color;
}

export function legendItems(model: PlotModel): LegendItem[] {
  const rules = model.legend ? ruleItems(model) : [];
  if (model.swatches && model.swatches.length > 1) return [...model.swatches.map((item) => ({ name: item.name, color: item.color })), ...rules];
  return [...model.series.map((series) => {
    const shape = markerShape(model, series);
    const marked = shape && (explicitMark(model, series) || model.dots === "shown") ? shape : undefined;
    const symbol = series.mark === "bar" ? "square" : marked;
    return { name: legendName(model, series), color: legendColor(model, series), symbol };
  }), ...rules];
}

function ruleItems(model: PlotModel): LegendItem[] {
  return (model.ruleLegend ?? []).map((item) => ({ name: item.name, color: item.color, symbol: item.symbol ?? "circle" }));
}

export function legend(model: PlotModel, x: number, y: number, maxRight: number): string {
  if (model.swatches && model.swatches.length > 1) {
    let cx = x;
    let cy = y;
    const out: string[] = [];
    for (const item of model.swatches) {
      const width = 26 + ch(item.name.length, 6.6);
      if (cx > x && cx + width > maxRight) {
        cx = x;
        cy += 18;
      }
      out.push(`<rect x="${n(cx)}" y="${n(cy)}" width="10" height="10" rx="2" fill="${item.color}" /><text x="${n(cx + 16)}" y="${n(cy + 9)}" fill="${cssVar("text", model.preset.text)}" font-size="12">${esc(item.name)}</text>`);
      cx += width;
    }
    appendRules(out, model, cx, cy, x, maxRight);
    return out.join("");
  }
  return legendSeries(model, x, y, maxRight);
}

/** Subtitle-only charts used to keep the legend on the titled row, so it met the plot. */
export function legendTop(model: PlotModel): number {
  if (model.subtitle) return model.title ? 54 : 36;
  if (model.title) return 36;
  return CHROME_TOP;
}

function legendIcon(model: PlotModel, series: Series, x: number, y: number, key = ""): string {
  const color = legendColor(model, series);
  const id = key ? ` data-ck-key="${esc(key)}"` : "";
  if (series.mark === "bar") return `<rect x="${n(x)}" y="${n(y)}" width="10" height="10" rx="2" fill="${color}"${id} />`;
  const shape = markerShape(model, series);
  if (shape && (explicitMark(model, series) || model.dots === "shown")) {
    return marker(x + 5, y + 5, 4.5, shape, color, series.hollow ?? model.pointHollow, id);
  }
  return `<rect x="${n(x)}" y="${n(y)}" width="10" height="10" rx="2" fill="${color}"${id} />`;
}

function legendSeries(model: PlotModel, x: number, y: number, maxRight: number): string {
  let cx = x;
  let cy = y;
  const out: string[] = [];
  for (const series of model.series) {
    const name = legendName(model, series);
    const width = 26 + ch(name.length, 6.6);
    if (cx > x && cx + width > maxRight) {
      cx = x;
      cy += 18;
    }
    out.push(`${legendIcon(model, series, cx, cy, `leg:${name}`)}<text x="${n(cx + 16)}" y="${n(cy + 9)}" fill="${cssVar("text", model.preset.text)}" font-size="12" data-ck-key="${esc(`legt:${name}`)}">${esc(name)}</text>`);
    cx += width;
  }
  appendRules(out, model, cx, cy, x, maxRight);
  return out.join("");
}

function appendRules(out: string[], model: PlotModel, cx: number, cy: number, x: number, maxRight: number): void {
  for (const item of ruleItems(model)) {
    const width = 26 + ch(item.name.length, 6.6);
    if (cx > x && cx + width > maxRight) {
      cx = x;
      cy += 18;
    }
    const swatch =
      item.symbol === "square"
        ? `<rect x="${n(cx)}" y="${n(cy)}" width="10" height="10" rx="2" fill="${item.color}" />`
        : `<circle cx="${n(cx + 5)}" cy="${n(cy + 5)}" r="4.5" fill="${item.color}" stroke="${cssVar("background", model.preset.background)}" stroke-width="1.5" />`;
    out.push(`${swatch}<text x="${n(cx + 16)}" y="${n(cy + 9)}" fill="${cssVar("text", model.preset.text)}" font-size="12">${esc(item.name)}</text>`);
    cx += width;
  }
}

/** Tabular digits at these sizes run about 0.68em wide. A wider page font scales this in the browser. */
function headlineInk(text: string, size: number): number {
  return Math.ceil(ch(text.length, size * 0.68));
}

export function headlineSvg(model: PlotModel): string {
  const head = model.headline;
  if (!head) return "";
  const text = cssVar("text", model.preset.text);
  if (!head.label && !head.value && !head.compare && !head.delta) {
    const swatch = head.tone === "negative" ? cssVar("negative", model.preset.negative) : head.tone === "neutral" ? cssVar("muted", model.preset.muted) : cssVar("positive", model.preset.positive);
    return `<rect data-ck-headline="1" x="12" y="12" width="12" height="12" rx="6" fill="${swatch}" />`;
  }
  const muted = cssVar("muted", model.preset.muted);
  const tone = head.tone === "negative" ? cssVar("negative", model.preset.negative) : head.tone === "neutral" ? muted : cssVar("positive", model.preset.positive);
  const pillFill = head.tone === "negative"
    ? cssVar("negative-fill", model.preset.negativeFill ?? "#c80046")
    : cssVar("positive-fill", model.preset.positiveFill ?? "#007437");
  const pillInk = labelInk(pillFill);
  let y = model.title ? 36 : 16;
  if (model.subtitle) y += 16;
  let out = "";
  const labelSize = 14;
  const valueSize = 40;
  const compareSize = 22;
  const deltaSize = 13;
  if (head.label) {
    out += `<text x="12" y="${y}" fill="${muted}" font-size="${labelSize}" font-weight="500">${esc(head.label)}</text>`;
    y += 24;
  }
  const baseline = y + valueSize - 8;
  out += `<text data-ck-headline="1" x="12" y="${baseline}" fill="${text}" font-size="${valueSize}" font-weight="650">${esc(head.value)}</text>`;
  const edge = model.width - 16;
  const deltaW = head.delta ? headlineInk(head.delta, deltaSize) + 22 : 0;
  const compareW = head.compare ? headlineInk(head.compare, compareSize) : 0;
  const between = head.compare && head.delta ? 10 : 0;
  const compareX = edge - deltaW - between - compareW;
  if (head.compare) {
    out += `<text x="${n(compareX)}" y="${baseline}" fill="${muted}" font-size="${compareSize}" font-weight="500">${esc(head.compare)}</text>`;
  }
  if (head.delta) {
    const pillX = edge - deltaW;
    const pillY = baseline - 20;
    const solid = head.tone === "positive" || head.tone === "negative";
    out += `<rect data-ck-delta="1" x="${n(pillX)}" y="${n(pillY)}" width="${n(deltaW)}" height="24" rx="12" fill="${solid ? pillFill : tone}"${solid ? "" : ' fill-opacity="0.16"'} />`;
    out += `<text x="${n(pillX + deltaW / 2)}" y="${n(pillY + 16)}" text-anchor="middle" fill="${solid ? pillInk : tone}" font-size="${deltaSize}" font-weight="650">${esc(head.delta)}</text>`;
  }
  return out;
}

function svgStyle(model: PlotModel): string {
  return fontStyle(model.preset.fontFamily);
}

export function tipAttrs(model: PlotModel): string {
  const tip = model.tip;
  if (!tip) return "";
  let out = "";
  if (tip.background) out += ` data-ck-chrome-bg="${esc(tip.background)}"`;
  if (tip.radius !== undefined) out += ` data-ck-chrome-radius="${n(tip.radius)}"`;
  if (tip.shadow) out += ` data-ck-chrome-shadow="${esc(tip.shadow)}"`;
  if (tip.crosshair) out += ` data-ck-xhair="${esc(tip.crosshair)}"`;
  return out;
}

/** Linear y domain and the pixels of its ends. Motion reprojects an entering line through this. */
export function yScaleStamp(model: PlotModel, domain: [number, number], scale: (value: number) => number, horizontal: boolean): string {
  if (horizontal || model.yLog || model.ySym || model.yAxis.breaks?.length) return "";
  const min = domain[0];
  const max = domain[1];
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "";
  const p0 = scale(min);
  const p1 = scale(max);
  if (!Number.isFinite(p0) || !Number.isFinite(p1)) return "";
  return ` data-ck-yscale="${n(min)},${n(max)},${n(p0)},${n(p1)}"`;
}

export function openSvg(model: PlotModel, scale = ""): string {
  const width = model.responsive ? "100%" : String(model.width);
  const described = model.description ? ` aria-describedby="${model.id}-d"` : "";
  const intent = model.intent ? ` data-ck-intent="${esc(model.intent)}"` : "";
  const exported = model.exportMark ? ` data-ck-export="${esc(model.exportMark)}"` : "";
  const chromeTip = slots.chromeTip ? slots.chromeTip(model) : "";
  const canvas = model.canvas ? ` data-ck-render="canvas"` : "";
  const sceneAttr = capturing() ? ` data-ck-scene="1"` : "";
  const gap = model.stackGap > 0 ? ` data-ck-stack-gap="${n(model.stackGap)}"` : "";
  const partialFade = model.partialOpacity !== undefined ? ` data-ck-partial-opacity="${n(model.partialOpacity)}"` : "";
  const desc = model.description ? `<desc id="${model.id}-d">${esc(model.description)}</desc>` : `<desc>${esc(model.alt)}</desc>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${model.height}" viewBox="0 0 ${model.width} ${model.height}" role="img" aria-label="${esc(model.alt)}"${described} class="ck-chart" data-ck-type="${esc(model.type)}" data-ck-id="${model.id}"${intent}${exported}${canvas}${sceneAttr}${gap}${partialFade}${scale}${chromeTip} style="${svgStyle(model)}">` +
    `<title>${esc(model.title || model.alt)}</title>${desc}`;
}

function legendName(model: PlotModel, series: Series): string {
  if (series.legendName) return series.legendName;
  return hooks?.seriesName(model, series) ?? series.name;
}

export function legendRows(model: PlotModel, start: number, maxRight: number): number {
  let cx = start;
  let rows = 1;
  const names = model.swatches && model.swatches.length > 1 ? model.swatches.map((item) => item.name) : model.series.map((series) => legendName(model, series));
  if (model.legend) for (const item of model.ruleLegend ?? []) names.push(item.name);
  for (const name of names) {
    const width = 26 + ch(name.length, 6.6);
    if (cx > start && cx + width > maxRight) {
      rows += 1;
      cx = start;
    }
    cx += width;
  }
  return rows;
}

/** Per-point colour from a colour field, a domain map, a constant, or mark.colorRules. */
export function colorLegendFoot(model: PlotModel): number {
  return model.colorScale && model.legendOn ? 46 : 0;
}

/** The bottom legend's own band, so the x title sits above it instead of in it. */
export function bottomLegendFoot(model: PlotModel, plot: PlotBox): number {
  if (!model.legend || !model.legendBox || model.legendBox.position !== "bottom") return 0;
  return legendSpace(model.legendBox, legendItems(model), Math.max(80, plot.right - plot.left)).band;
}
