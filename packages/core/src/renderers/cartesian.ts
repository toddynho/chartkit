import { capturing, noteIngest, noteSvg, runCapture } from "../canvas/scene-hook";
import type { DataTable } from "../data";
import { beginFrame } from "../sampling";
import { CHROME_TOP } from "../chrome";
import { paintLegend } from "../legend";
import { layoutPaint } from "../layout-hook";
import { boxId, brokenScale, clipPath, esc, n } from "../svg";
import { bump, slots } from "../feature-hooks";
import { cssVar, type PresetTokens } from "../theme";
import type { ColorScaleReader, MarkDraw, PlotModel, Series, YChannel } from "../cartesian/types";
import { hooks, rangePrepare } from "../cartesian/hooks";
import { numKey, pivotBars } from "../cartesian/data";
import { categoryTickText, resolveTicks, tickText } from "../cartesian/ticks";
import { axisClamps, domain, modelClamp, planStacks, stackLayers, xPosition } from "../cartesian/scales";
import { readChromeOf, toModel } from "../cartesian/model";
import { paintNotes, placeLineLabels } from "../cartesian/labels";
import { areaMid, drawBars, drawCombo, drawLines } from "../cartesian/marks";
import { headlineSvg, legend, legendItems, legendTop, openSvg, tipAttrs, yScaleStamp } from "../cartesian/chrome";
import { drawAxes, setLabelPx, setTextDir } from "../cartesian/axes";
import { markPadding, padding } from "../cartesian/layout";
import { applyColorScale, runColorRules } from "../cartesian/colors";

export type { Headline, TipChrome, AxisBox, Pad, TotalHook, Series, PlotModel, ChartShell, Layers, XScale } from "../cartesian/types";
export { mountRange, mountTotals, installAxes } from "../cartesian/hooks";
export { xAngle, widest, resolveTicks, timeTicks, formatTimeLabel, tickLabel, tickText, formatNumber } from "../cartesian/ticks";
export { stackLayers, planStacks } from "../cartesian/scales";
export { labelText } from "../cartesian/labels";
export { legendRows } from "../cartesian/chrome";

function renderTyped(
  spec: Record<string, unknown>,
  type: string,
  draw: MarkDraw,
  adjust?: (
    table: DataTable,
    encoding: Record<string, unknown>,
    channels: YChannel[],
    preset: PresetTokens,
    series: Series[],
    labels: string[],
  ) => { series: Series[]; labels: string[] } | null,
): string | null {
  if (spec.type !== type) return null;
  beginFrame();
  const t0 = performance.now();
  const model = toModel(spec, adjust);
  const ingest = performance.now() - t0;
  if (!model) return null;
  if (capturing()) noteIngest(ingest);
  return modelToSvg(model, draw);
}

/**
 * Bar and combo mount this. Line, area, and sparkline do not, so a plain line
 * bundle pays for legend layout and not for sequential, diverging, quantize, or threshold.
 * A line chart never paints a quantitative ramp, including from the full bundle, so the
 * two entries stay in step.
 */
export function mountColorScale(reader: ColorScaleReader): void {
  slots.colorScale = reader;
  slots.scale = applyColorScale;
  bump();
}

/** Callouts, trends, fits, rules, and weekend bands. Absent from a line-only bundle until this runs. */
export function mountAnnotations(): void {
  slots.notes = paintNotes;
  bump();
}

/** Colour rules, categorical point colours, and delta-E shifts. A bar ramp does not need this. */
export function mountColorRules(): void {
  slots.colors = runColorRules;
  bump();
}

/** Headline row and tooltip chrome attributes. The static line entry omits both. */
export function mountChrome(): void {
  slots.chromeRead = readChromeOf;
  slots.chromePaint = headlineSvg;
  slots.chromeTip = tipAttrs;
  bump();
}

/** Stack groups. Bar, stacked-area, and combo call this. A plain line does not. */
export function mountStacks(): void {
  slots.stacks = planStacks;
  slots.stackFold = stackLayers;
  bump();
}

/** Series labels and the padding they reserve. Bar and stacked-area call this. */
export function mountMarks(): void {
  slots.labels = placeLineLabels;
  slots.markPad = markPadding;
  bump();
}

/** Area is type "line" plus mark.area, so it stays in this entry. */
export function renderLine(spec: Record<string, unknown>): string | null {
  return renderTyped(spec, "line", drawLines);
}

export function renderBar(spec: Record<string, unknown>): string | null {
  return renderTyped(spec, "bar", drawBars, (table, encoding, channels, preset, series, labels) => {
    const pivoted = pivotBars(table, encoding, channels, preset);
    if (pivoted) return pivoted;
    return null;
  });
}

export function renderStackedArea(spec: Record<string, unknown>): string | null {
  return renderTyped(spec, "stacked-area", drawLines);
}

export function renderSparkline(spec: Record<string, unknown>): string | null {
  return renderTyped(spec, "sparkline", drawLines);
}

export function renderMiniArea(spec: Record<string, unknown>): string | null {
  return renderTyped(spec, "mini-area", drawLines);
}

export function renderCombo(spec: Record<string, unknown>): string | null {
  return renderTyped(
    spec,
    "combo",
    drawCombo,
    rangePrepare ? (table, encoding, _channels, _preset, series, labels) => rangePrepare?.(table, encoding, series, labels) ?? null : undefined,
  );
}

/** Line, bar, area, sparkline, and combo. The canvas chunk calls this while capture is mounted. */
export function renderPlotted(spec: Record<string, unknown>): string | null {
  switch (spec.type) {
    case "line":
      return renderLine(spec);
    case "bar":
      return renderBar(spec);
    case "stacked-area":
      return renderStackedArea(spec);
    case "sparkline":
      return renderSparkline(spec);
    case "mini-area":
      return renderMiniArea(spec);
    case "combo":
      return renderCombo(spec);
    default:
      return null;
  }
}

function modelToSvg(model: PlotModel, draw: MarkDraw): string {
  setLabelPx(model.preset.fontSize ?? 11);
  const tScale = performance.now();
  const horizontal = model.orientation === "horizontal" && model.type === "bar";
  const yDomain = domain(model, "y");
  const y2Domain = domain(model, "y2");
  const yTicks = resolveTicks(model, "y", yDomain[0], yDomain[1], model.yAxis?.count ?? 5, model.yLog);
  const y2Ticks = resolveTicks(model, "y2", y2Domain[0], y2Domain[1], model.y2Axis?.count ?? 5, model.y2Log);
  const yTickText = tickText(yTicks, model, model.yFormat);
  const y2TickText = tickText(y2Ticks, model, model.y2Format);
  const count = model.series[0]?.values.length ?? model.labels.length;
  const pad = padding(model, yTickText, y2TickText, categoryTickText(model, count));
  const plot = {
    left: pad.left,
    top: pad.top,
    right: model.width - pad.right,
    bottom: model.height - pad.bottom,
  };
  const plotW = Math.max(1, plot.right - plot.left);
  const plotH = Math.max(1, plot.bottom - plot.top);
  const yRev = model.f & 8;
  const yFrom = horizontal ? (yRev ? plot.right : plot.left) : yRev ? plot.top : plot.bottom;
  const yTo = horizontal ? (yRev ? plot.left : plot.right) : yRev ? plot.bottom : plot.top;
  const yMapped = brokenScale(yDomain[0], yDomain[1], yFrom, yTo, model.yAxis.breaks, model.ySym ? "symlog" : model.yLog ? "log" : "linear", model.symC);
  model.ySpans = yMapped.spans;
  const yScale = modelClamp(yMapped.at, yDomain, axisClamps(model, "y"));
  const y2Rev = model.f & 16;
  const y2From = y2Rev ? plot.top : plot.bottom;
  const y2To = y2Rev ? plot.bottom : plot.top;
  const y2Mapped = brokenScale(y2Domain[0], y2Domain[1], y2From, y2To, model.y2Axis.breaks, model.y2Sym ? "symlog" : model.y2Log ? "log" : "linear", model.symC2);
  model.y2Spans = y2Mapped.spans;
  const y2Scale = modelClamp(y2Mapped.at, y2Domain, axisClamps(model, "y2"));
  const xScale = xPosition(model, count, plot.left, plot.right, plot.top, plot.bottom, horizontal);
  const pass = capturing()
    ? runCapture({
        model,
        xScale,
        yScale,
        y2Scale,
        plot,
        count,
        scalesMs: performance.now() - tScale,
        yDomain,
        y2Domain,
      })
    : "off";
  if (pass === "reuse") return "";

  const tSvg = performance.now();
  const paint = layoutPaint();
  setTextDir(paint ? paint.bidi(Boolean(model.rtl)) : "");
  const parts: string[] = [];
  parts.push(openSvg(model, yScaleStamp(model, yDomain, yScale, horizontal)));
  parts.push(`<rect width="100%" height="100%" fill="${cssVar("background", model.preset.background)}" />`);
  const titleX = paint ? paint.titleX(Boolean(model.rtl), model.width, pad.left) : pad.left;
  const titleAnchor = paint ? paint.titleAttr(Boolean(model.rtl)) : "";
  if (model.title) {
    parts.push(`<text x="${n(titleX)}" y="${CHROME_TOP}"${titleAnchor} fill="${cssVar("text", model.preset.text)}" font-size="15" font-weight="650">${esc(model.title)}</text>`);
  }
  if (model.subtitle) {
    parts.push(`<text x="${n(titleX)}" y="${model.title ? 40 : 18}"${titleAnchor} fill="${cssVar("muted", model.preset.muted)}" font-size="12" font-weight="400">${esc(model.subtitle)}</text>`);
  }
  if (slots.chromePaint && model.headline) parts.push(slots.chromePaint(model));
  if (model.legend && !model.legendBox) parts.push(legend(model, pad.left, legendTop(model), plot.right));

  const clip = boxId(model.id, plot.left, plot.top, plotW, plotH);
  parts.push(`<defs>${clipPath(clip, plot.left, plot.top, plotW, plotH)}`);
  if (model.glow) {
    const blur = model.preset.text === "#ffffff" ? 3 : 1.8;
    parts.push(`<filter id="${model.id}glow" x="-25%" y="-50%" width="150%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter>`);
  }
  if (model.gradient) {
    model.series.forEach((series, index) => {
      parts.push(
        `<linearGradient id="${model.id}-g${index}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${series.color}" stop-opacity="${model.fillPaint}" /><stop offset="62%" stop-color="${series.color}" stop-opacity="${areaMid(model)}" /><stop offset="100%" stop-color="${series.color}" stop-opacity="0" /></linearGradient>`,
      );
    });
  }
  parts.push(`</defs>`);

  if (model.yGrid && model.showY) {
    for (const tick of yTicks) {
      const pos = yScale(tick);
      const dash = model.yGrid === "dashed" ? ' stroke-dasharray="3 3"' : model.yGrid === "dotted" ? ' stroke-dasharray="1 3"' : "";
      const gridKey = ` data-ck-key="yg:${esc(numKey(tick))}"`;
      if (horizontal) {
        parts.push(`<line x1="${n(pos)}" y1="${n(plot.top)}" x2="${n(pos)}" y2="${n(plot.bottom)}" stroke="${cssVar("grid", model.preset.grid)}"${dash}${gridKey} />`);
      } else {
        parts.push(`<line x1="${n(plot.left)}" y1="${n(pos)}" x2="${n(plot.right)}" y2="${n(pos)}" stroke="${cssVar("grid", model.preset.grid)}"${dash}${gridKey} />`);
      }
    }
  }
  const grid = hooks?.grid(model, plot, horizontal, count, xScale);
  if (grid) parts.push(grid);

  const notes = slots.notes ? slots.notes(model, plot, xScale, yScale, y2Scale, horizontal, count) : { under: "", over: "" };
  parts.push(`<g clip-path="url(#${clip})">`);
  parts.push(notes.under);
  if (pass === "off") {
    const marks = draw(model, xScale, yScale, y2Scale, plot, horizontal);
    parts.push(model.canvas ? `<g data-ck-layer="marks">${marks}</g>` : marks);
  }
  parts.push(`</g>`);
  parts.push(notes.over);
  if (model.late) parts.push(model.late);

  parts.push(drawAxes(model, plot, horizontal, count, yTicks, y2Ticks, yTickText, y2TickText, yScale, y2Scale, xScale));
  if (model.legend && model.legendBox) {
    parts.push(paintLegend(model.legendBox, legendItems(model), { plot, width: model.width, height: model.height, preset: model.preset }));
  }
  if (model.colorScale && model.legendOn) parts.push(model.colorScale.legend(plot.left, model.height - 46, cssVar("muted", model.preset.muted)));

  parts.push(`</svg>`);
  if (pass !== "off") noteSvg(performance.now() - tSvg);
  return parts.join("");
}
