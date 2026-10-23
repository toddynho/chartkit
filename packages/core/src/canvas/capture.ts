/**
 * Sampled mark geometry for the canvas painter. The line bundle does not import this module.
 */
import { beginScene, endScene, lineBuffers, rectBuffers, takeMark, type SceneFrame } from "./sink";
import { readIngest, setCapture, type CaptureArgs } from "./scene-hook";
import { notedLinearColumn, sampleSeries, sampleTyped } from "../sampling";
import { renderPlotted, type Layers, type PlotModel, type Series, type XScale } from "../renderers/cartesian";
import { clamp } from "../svg";
import { lineStroke } from "../theme";

function strokeOf(series: Series, model: PlotModel): string {
  return lineStroke(series.color, model.strokeWidth, model.preset.lines);
}

function hasGap(values: ArrayLike<number | null>, count: number): boolean {
  for (let i = 0; i < count; i++) {
    const y = values[i];
    if (typeof y !== "number" || y !== y) return true;
  }
  return false;
}

/**
 * Chrome SVG plus sampled mark geometry. `render()` stays a full SVG.
 * The returned frame's typed buffers are reused on the next call.
 */
export function renderCartesianScene(spec: Record<string, unknown>, reuseKey = ""): { svg: string; frame: SceneFrame } | null {
  const type = spec.type;
  if (type !== "line" && type !== "stacked-area" && type !== "bar" && type !== "sparkline" && type !== "mini-area" && type !== "combo") return null;
  const scene = beginScene(reuseKey);
  setCapture((args) => fillScene(scene, args), (ms) => {
    scene.profile.svg = ms;
  });
  try {
    const svg = renderPlotted(spec);
    if (svg === null || !scene.plot) return null;
    return { svg, frame: scene };
  } finally {
    setCapture(null);
    endScene();
  }
}

function fillScene(scene: SceneFrame, args: CaptureArgs): "scene" | "reuse" {
  const { model, xScale, yScale, y2Scale, plot, count, scalesMs, yDomain, y2Domain } = args;
  scene.profile.ingest = readIngest();
  scene.profile.scales = scalesMs;
  scene.plot = plot;
  scene.width = model.width;
  scene.height = model.height;
  scene.xMin = xScale.min;
  scene.xMax = xScale.max;
  scene.yMin = yDomain[0];
  scene.yMax = yDomain[1];
  scene.y2Min = y2Domain[0];
  scene.y2Max = y2Domain[1];
  scene.py0 = yScale(yDomain[0]);
  scene.py1 = yScale(yDomain[1]);
  scene.py20 = y2Scale(y2Domain[0]);
  scene.py21 = y2Scale(y2Domain[1]);
  scene.count = count;
  const xs = model.x;
  if (xs instanceof Float64Array && notedLinearColumn(xs)) {
    scene.linear = true;
    scene.xs = xs;
    scene.x0 = xs[0];
    scene.stride = count > 1 ? (xs[count - 1] - xs[0]) / (count - 1) : 0;
  } else if (!xs) {
    scene.linear = true;
    scene.xs = null;
    scene.x0 = 0;
    scene.stride = 1;
  } else {
    scene.linear = false;
    scene.xs = xs instanceof Float64Array ? xs : null;
    scene.x0 = 0;
    scene.stride = 0;
  }
  const names = model.series.map((series) => series.color + series.name).join("\n");
  scene.key = `${model.width}|${model.height}|${model.type}|${xScale.min}|${xScale.max}|${yDomain[0]}|${yDomain[1]}|${y2Domain[0]}|${y2Domain[1]}|${plot.left}|${plot.top}|${plot.right}|${plot.bottom}|${model.title ?? ""}|${model.subtitle ?? ""}|${names}`;
  const tSample = performance.now();
  captureMarks(model, xScale, yScale, y2Scale, plot, scene);
  scene.profile.sample = performance.now() - tSample;
  scene.profile.rows = count;
  scene.profile.kept = scene.marks.reduce((sum, item) => sum + (item.kind === "bar" ? item.rectN : item.n), 0);
  if (scene.reuseKey && scene.reuseKey === scene.key) {
    scene.reused = true;
    return "reuse";
  }
  return "scene";
}

function captureMarks(
  model: PlotModel,
  xScale: XScale,
  yScale: (value: number) => number,
  y2Scale: (value: number) => number,
  plot: { left: number; top: number; right: number; bottom: number },
  scene: SceneFrame,
): void {
  const horizontal = model.orientation === "horizontal" && model.type === "bar";
  const layers = model.layers;
  const plotWidth = Math.max(1, plot.right - plot.left);
  const barCount = model.barSlots || model.series.filter((series) => series.mark === "bar").length || model.series.length;
  model.series.forEach((series, index) => {
    const scale = series.axis === "y2" ? y2Scale : yScale;
    if (series.mark === "bar" || model.type === "bar") {
      captureBars(model, series, index, layers, xScale, scale, plot, horizontal, model.barSlot[index] ?? 0, barCount, scene);
      return;
    }
    captureLine(model, series, index, layers, xScale, scale, plotWidth, scene);
  });
}

function captureLine(
  model: PlotModel,
  series: Series,
  index: number,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
  plotWidth: number,
  scene: SceneFrame,
): void {
  const raw = series.values;
  const stacked = Boolean(layers?.on[index]);
  const area = series.area || model.type === "stacked-area" || model.type === "mini-area";
  const mark = takeMark();
  mark.kind = area ? "area" : "line";
  mark.color = series.color;
  mark.stroke = strokeOf(series, model);
  mark.strokeWidth = model.strokeWidth;
  mark.strokePaint = model.strokePaint;
  mark.fillPaint = model.fillPaint;
  mark.fillOpacity = model.fillOpacity;
  mark.dash = series.dash === "dashed" ? "6 4" : series.dash === "dotted" ? "1.5 3" : "";
  mark.gradient = model.gradient && area;
  mark.curve = model.curve;
  mark.name = series.name;
  mark.rows = raw.length;
  mark.ys = stacked ? layers!.top[index] : raw;
  mark.axis = series.axis;
  mark.xs = model.x instanceof Float64Array ? model.x : null;
  mark.baseline = area ? yScale(0) : null;
  if (!stacked && raw instanceof Float64Array && !hasGap(raw, raw.length) && !model.yLog && !(series.axis === "y2" && model.y2Log)) {
    const xs = model.x instanceof Float64Array ? model.x : null;
    const sampled = sampleTyped(model.sampling, xs, raw, raw.length, plotWidth);
    const n = sampled.reduced ? sampled.length : raw.length;
    const buf = lineBuffers(n);
    if (sampled.reduced) writeIndexed(sampled.index, sampled.length, xs, raw, xScale, yScale, buf.x, buf.y);
    else writeAll(xs, raw, xScale, yScale, buf.x, buf.y);
    mark.x = buf.x;
    mark.y = buf.y;
    mark.n = n;
    mark.memo = sampled.memo;
    scene.marks.push(mark);
    return;
  }
  const top = stacked ? layers!.top[index] : raw;
  const sampled = stacked ? null : sampleSeries(model.sampling, model.x, raw, raw.length, plotWidth, model.connectNulls);
  const runs = sampled?.reduced ? sampled.runs : [null];
  let written = 0;
  const breaks = sampled?.reduced ? Math.max(0, sampled.runs.length - 1) : 0;
  const buf = lineBuffers((sampled?.reduced ? sampled.runs.reduce((sum, run) => sum + run.length, 0) : top.length) + breaks);
  let open = false;
  for (const run of runs) {
    if (open) {
      buf.x[written] = Number.NaN;
      buf.y[written] = Number.NaN;
      written += 1;
    }
    open = true;
    const limit = run ? run.length : top.length;
    for (let k = 0; k < limit; k++) {
      const i = run ? run[k] : k;
      const value = top[i];
      if (typeof value !== "number" || value !== value) continue;
      buf.x[written] = xScale.center(i);
      buf.y[written] = yScale(value);
      written += 1;
    }
  }
  mark.x = buf.x;
  mark.y = buf.y;
  mark.n = written;
  if (area && stacked && layers) {
    const base = lineBuffers(written);
    let b = 0;
    for (const run of runs) {
      const limit = run ? run.length : top.length;
      for (let k = 0; k < limit; k++) {
        const i = run ? run[k] : k;
        const value = top[i];
        if (typeof value !== "number" || value !== value) continue;
        base.x[b] = xScale.center(i);
        base.y[b] = yScale(layers.bottom[index][i]);
        b += 1;
      }
    }
    mark.baseline = null;
    mark.x = buf.x;
    mark.y = buf.y;
    // Stash the baseline polyline in the rect buffer as pairs is awkward. Use a second line by encoding y0 into unused x of a parallel buffer.
    mark.rects = floatToRect(base.y, b);
    mark.rectN = b;
  }
  scene.marks.push(mark);
}

function floatToRect(values: Float64Array, n: number): Float32Array {
  const out = rectBuffers(n);
  for (let i = 0; i < n; i++) out[i] = values[i];
  return out;
}

function writeIndexed(
  index: Int32Array,
  n: number,
  xs: Float64Array | null,
  ys: Float64Array,
  xScale: XScale,
  yScale: (value: number) => number,
  outX: Float64Array,
  outY: Float64Array,
): void {
  const linear = xs === null || notedLinearColumn(xs);
  let ax = 0;
  let bx = 0;
  if (linear) {
    const last = ys.length - 1;
    const x0 = xs ? xs[0] : 0;
    const x1 = xs && last > 0 ? xs[last] : last;
    const p0 = xScale.at(x0);
    const p1 = xScale.at(x1);
    ax = p0;
    bx = last > 0 ? (p1 - p0) / last : 0;
  }
  for (let k = 0; k < n; k++) {
    const i = index[k];
    outX[k] = linear ? ax + i * bx : xScale.at(xs ? xs[i] : i);
    outY[k] = yScale(ys[i]);
  }
}

function writeAll(
  xs: Float64Array | null,
  ys: Float64Array,
  xScale: XScale,
  yScale: (value: number) => number,
  outX: Float64Array,
  outY: Float64Array,
): void {
  const linear = xs === null || notedLinearColumn(xs);
  let ax = 0;
  let bx = 0;
  if (linear) {
    const last = ys.length - 1;
    const x0 = xs ? xs[0] : 0;
    const x1 = xs && last > 0 ? xs[last] : last;
    ax = xScale.at(x0);
    const p1 = xScale.at(x1);
    bx = last > 0 ? (p1 - ax) / last : 0;
  }
  for (let i = 0; i < ys.length; i++) {
    outX[i] = linear ? ax + i * bx : xScale.at(xs ? xs[i] : i);
    outY[i] = yScale(ys[i]);
  }
}

function captureBars(
  model: PlotModel,
  series: Series,
  index: number,
  layers: Layers | null,
  xScale: XScale,
  yScale: (value: number) => number,
  plot: { left: number; right: number; top: number; bottom: number },
  horizontal: boolean,
  barIndex: number,
  barCount: number,
  scene: SceneFrame,
): void {
  const gap = clamp(model.gap, 0, 0.9);
  const stacked = Boolean(layers?.on[index]);
  const slot = barIndex;
  const slots = Math.max(1, barCount);
  const rect = rectBuffers(series.values.length * 4);
  let n = 0;
  for (let i = 0; i < series.values.length; i++) {
    const value = stacked ? layers!.top[index][i] : series.values[i];
    if (value === null && !stacked) continue;
    const baseline = stacked ? layers!.bottom[index][i] : 0;
    const band = xScale.band(i);
    const inner = band.size * (1 - gap);
    const barSize = inner / slots;
    const start = band.start + (band.size - inner) / 2 + slot * barSize;
    const a = yScale(baseline);
    const b = yScale(value ?? baseline);
    const inset = slots > 1 ? 2 : 0;
    const at = n * 4;
    if (horizontal) {
      rect[at] = Math.min(a, b);
      rect[at + 1] = start;
      rect[at + 2] = Math.max(0, Math.abs(b - a));
      rect[at + 3] = Math.max(0, barSize - inset);
    } else {
      rect[at] = start;
      rect[at + 1] = Math.min(a, b);
      rect[at + 2] = Math.max(0, barSize - inset);
      rect[at + 3] = Math.max(0, Math.abs(b - a));
    }
    n += 1;
  }
  const mark = takeMark();
  mark.kind = "bar";
  mark.rects = rect;
  mark.rectN = n;
  mark.color = series.color;
  mark.name = series.name;
  mark.rows = series.values.length;
  mark.ys = series.values;
  mark.axis = series.axis;
  mark.n = 0;
  scene.marks.push(mark);
}
