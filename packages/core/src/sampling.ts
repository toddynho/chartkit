/**
 * Downsampling for line-like marks. Every kept index is an original point.
 * `auto` and `minmax` keep the min and max in each horizontal pixel bucket.
 * `lttb` is largest-triangle-three-buckets. Both are deterministic.
 * Sampling starts only when the finite point count exceeds twice the plot width.
 */

export type SamplingMode = "auto" | "none" | "lttb" | "minmax";

export function readSamplingMode(value: unknown): SamplingMode {
  if (value === "auto" || value === "none" || value === "lttb" || value === "minmax") return value;
  return "auto";
}

export interface SampledRuns {
  reduced: boolean;
  mode: "none" | "lttb" | "minmax";
  runs: Int32Array[];
}

export function samplingThreshold(plotWidth: number): number {
  const width = Number.isFinite(plotWidth) && plotWidth > 0 ? Math.floor(plotWidth) : 1;
  return Math.max(2, width * 2);
}

export function resolveSampling(mode: SamplingMode, count: number, plotWidth: number): "none" | "lttb" | "minmax" {
  if (mode === "none" || count <= samplingThreshold(plotWidth)) return "none";
  return mode === "lttb" ? "lttb" : "minmax";
}

let frame = 0;
const denseNote = new WeakMap<object, { frame: number; length: number }>();
const linearNote = new WeakMap<object, number>();

/** Start a render. A density note from an older render no longer applies. */
export function beginFrame(): void {
  frame += 1;
}

/**
 * This column was entirely finite during the current render.
 * Sampling can skip its gap scan. The values are still read by the sampler.
 */
export function noteDense(values: ArrayLike<number | null>): void {
  if (typeof values === "object" && values !== null) denseNote.set(values, { frame, length: values.length });
}

function notedDense(values: ArrayLike<number | null>, count: number): boolean {
  if (typeof values !== "object" || values === null) return false;
  const note = denseNote.get(values);
  return note !== undefined && note.frame === frame && note.length === count;
}

/** `x[i]` is an exact arithmetic sequence for this render, so buckets follow the index. */
export function noteLinear(values: ArrayLike<number | null>): void {
  if (typeof values === "object" && values !== null) linearNote.set(values, frame);
}

function notedLinear(values: ArrayLike<number | null> | null): boolean {
  if (typeof values !== "object" || values === null) return false;
  return linearNote.get(values) === frame;
}

export function sampleSeries(
  requested: SamplingMode,
  xs: ArrayLike<number | null> | null,
  ys: ArrayLike<number | null>,
  count: number,
  plotWidth: number,
  connectNulls: boolean,
): SampledRuns {
  // A short series, and sampling "none", never drop points. Skip the scan.
  if (requested === "none" || count <= samplingThreshold(plotWidth)) {
    return { reduced: false, mode: "none", runs: [] };
  }
  // The domain scan already proved this column has no gaps. Don't walk it again
  // just to discover that. minmax still reads every point.
  if (notedDense(ys, count)) {
    const mode = resolveSampling(requested, count, plotWidth);
    if (mode === "none") return { reduced: false, mode, runs: [] };
    const target = samplingThreshold(plotWidth);
    const run = sampleDense(mode, xs, ys, 0, count, Math.min(target, count));
    return { reduced: run.length < count, mode, runs: run.length < count ? [run] : [] };
  }
  let finite = 0;
  let gaps = false;
  for (let i = 0; i < count; i++) {
    if (finiteY(ys[i])) finite += 1;
    else gaps = true;
  }
  const mode = resolveSampling(requested, finite, plotWidth);
  if (mode === "none") return { reduced: false, mode, runs: [] };

  const target = samplingThreshold(plotWidth);

  if (!gaps) {
    const run = sampleDense(mode, xs, ys, 0, count, Math.min(target, count));
    return { reduced: run.length < count, mode, runs: run.length < count ? [run] : [] };
  }

  if (connectNulls) {
    const idx = new Int32Array(finite);
    const compactX = xs ? new Float64Array(finite) : null;
    const compactY = new Float64Array(finite);
    let n = 0;
    for (let i = 0; i < count; i++) {
      const y = ys[i];
      if (!finiteY(y)) continue;
      idx[n] = i;
      if (compactX) compactX[n] = xAt(xs, i);
      compactY[n] = y as number;
      n += 1;
    }
    const picked = sampleDense(mode, compactX, compactY, 0, n, Math.min(target, n));
    const mapped = new Int32Array(picked.length);
    for (let i = 0; i < picked.length; i++) mapped[i] = idx[picked[i]];
    return { reduced: mapped.length < finite, mode, runs: mapped.length < finite ? [mapped] : [] };
  }

  const runs: Int32Array[] = [];
  let kept = 0;
  let start = -1;
  const emit = (from: number, to: number) => {
    const len = to - from;
    const share = Math.max(2, Math.min(len, Math.round((target * len) / finite)));
    const run = sampleDense(mode, xs, ys, from, to, share);
    kept += run.length;
    runs.push(run);
  };
  for (let i = 0; i < count; i++) {
    if (finiteY(ys[i])) {
      if (start < 0) start = i;
    } else if (start >= 0) {
      emit(start, i);
      start = -1;
    }
  }
  if (start >= 0) emit(start, count);
  return { reduced: kept < finite, mode, runs: kept < finite ? runs : [] };
}

function sampleDense(
  mode: "lttb" | "minmax",
  xs: ArrayLike<number | null> | null,
  ys: ArrayLike<number | null>,
  start: number,
  end: number,
  target: number,
): Int32Array {
  const len = end - start;
  const cap = Math.max(2, target);
  if (len <= cap) return copyRange(start, end);
  if (mode === "minmax" && ys instanceof Float64Array && (xs === null || notedLinear(xs))) return minmaxIndex(ys, start, end, cap);
  if (mode === "minmax" && xs instanceof Float64Array && ys instanceof Float64Array) return minmaxFloat(xs, ys, start, end, cap);
  return mode === "lttb" ? lttbRange(xs, ys, start, end, cap) : minmaxRange(xs, ys, start, end, cap);
}

/**
 * Min/max inside equal index buckets. Matches x-based buckets when x is linear in the index.
 * Ties keep the earlier point. The first and last indexes are always kept.
 */
function minmaxIndex(ys: Float64Array, start: number, end: number, target: number): Int32Array {
  const last = end - 1;
  const len = last - start;
  const buckets = Math.max(1, Math.floor((target - 2) / 2));
  const minI = new Int32Array(buckets);
  const maxI = new Int32Array(buckets);
  minI.fill(-1);
  for (let bucket = 0; bucket < buckets; bucket++) {
    let from = start + 1 + Math.floor((bucket * len) / buckets);
    let to = start + 1 + Math.floor(((bucket + 1) * len) / buckets);
    if (from < start + 1) from = start + 1;
    if (to > last) to = last;
    if (from >= to) continue;
    let minV = Infinity;
    let maxV = -Infinity;
    let lo = -1;
    let hi = -1;
    for (let i = from; i < to; i++) {
      const y = ys[i];
      if (y < minV) {
        minV = y;
        lo = i;
      }
      if (y > maxV) {
        maxV = y;
        hi = i;
      }
    }
    minI[bucket] = lo;
    maxI[bucket] = hi;
  }
  const raw = new Int32Array(2 + buckets * 2);
  let n = 0;
  raw[n++] = start;
  for (let bucket = 0; bucket < buckets; bucket++) {
    const a = minI[bucket];
    const b = maxI[bucket];
    if (a >= 0) raw[n++] = a;
    if (b >= 0 && b !== a) raw[n++] = b;
  }
  raw[n++] = last;
  return uniqueSorted(raw, n);
}

/** Min/max buckets for dense typed columns. Indexes increase, so an equal y keeps the earlier point. */
function minmaxFloat(xs: Float64Array, ys: Float64Array, start: number, end: number, target: number): Int32Array {
  const last = end - 1;
  const buckets = Math.max(1, Math.floor((target - 2) / 2));
  const minI = new Int32Array(buckets);
  const maxI = new Int32Array(buckets);
  minI.fill(-1);
  const x0 = xs[start];
  const span = xs[last] - x0;
  const scale = span !== 0 ? buckets / span : 0;
  for (let i = start + 1; i < last; i++) {
    const y = ys[i];
    let bucket = 0;
    if (scale !== 0) {
      bucket = Math.floor((xs[i] - x0) * scale);
      if (bucket < 0) bucket = 0;
      else if (bucket >= buckets) bucket = buckets - 1;
    }
    const lo = minI[bucket];
    if (lo < 0 || y < ys[lo]) minI[bucket] = i;
    const hi = maxI[bucket];
    if (hi < 0 || y > ys[hi]) maxI[bucket] = i;
  }
  const raw = new Int32Array(2 + buckets * 2);
  let n = 0;
  raw[n++] = start;
  for (let bucket = 0; bucket < buckets; bucket++) {
    const a = minI[bucket];
    const b = maxI[bucket];
    if (a >= 0) raw[n++] = a;
    if (b >= 0 && b !== a) raw[n++] = b;
  }
  raw[n++] = last;
  return uniqueSorted(raw, n);
}

function minmaxRange(
  xs: ArrayLike<number | null> | null,
  ys: ArrayLike<number | null>,
  start: number,
  end: number,
  target: number,
): Int32Array {
  const last = end - 1;
  const buckets = Math.max(1, Math.floor((target - 2) / 2));
  const minI = new Int32Array(buckets);
  const maxI = new Int32Array(buckets);
  minI.fill(-1);
  const x0 = xAt(xs, start);
  const x1 = xAt(xs, last);
  const span = x1 - x0;
  for (let i = start + 1; i < last; i++) {
    const y = ys[i] as number;
    let bucket = 0;
    if (span !== 0) {
      bucket = Math.floor(((xAt(xs, i) - x0) / span) * buckets);
      if (bucket < 0) bucket = 0;
      else if (bucket >= buckets) bucket = buckets - 1;
    }
    const lo = minI[bucket];
    if (lo < 0 || y < (ys[lo] as number) || (y === ys[lo] && i < lo)) minI[bucket] = i;
    const hi = maxI[bucket];
    if (hi < 0 || y > (ys[hi] as number) || (y === ys[hi] && i < hi)) maxI[bucket] = i;
  }
  const raw = new Int32Array(2 + buckets * 2);
  let n = 0;
  raw[n++] = start;
  for (let bucket = 0; bucket < buckets; bucket++) {
    const a = minI[bucket];
    const b = maxI[bucket];
    if (a >= 0) raw[n++] = a;
    if (b >= 0 && b !== a) raw[n++] = b;
  }
  raw[n++] = last;
  return uniqueSorted(raw, n);
}

function lttbRange(
  xs: ArrayLike<number | null> | null,
  ys: ArrayLike<number | null>,
  start: number,
  end: number,
  threshold: number,
): Int32Array {
  const len = end - start;
  if (threshold <= 2) {
    const out = new Int32Array(len === 1 ? 1 : 2);
    out[0] = start;
    if (len > 1) out[1] = end - 1;
    return out;
  }
  const out = new Int32Array(threshold);
  out[0] = start;
  const bucketSize = (len - 2) / (threshold - 2);
  let prev = start;
  for (let i = 0; i < threshold - 2; i++) {
    let avgStart = start + Math.floor((i + 1) * bucketSize) + 1;
    let avgEnd = start + Math.floor((i + 2) * bucketSize) + 1;
    if (avgStart < start + 1) avgStart = start + 1;
    if (avgEnd > end) avgEnd = end;
    if (avgEnd <= avgStart) avgEnd = Math.min(end, avgStart + 1);
    let avgX = 0;
    let avgY = 0;
    let avgN = 0;
    for (let j = avgStart; j < avgEnd; j++) {
      avgX += xAt(xs, j);
      avgY += ys[j] as number;
      avgN += 1;
    }
    if (avgN === 0) {
      avgX = xAt(xs, end - 1);
      avgY = ys[end - 1] as number;
      avgN = 1;
    }
    avgX /= avgN;
    avgY /= avgN;
    let rangeStart = start + Math.floor(i * bucketSize) + 1;
    let rangeEnd = start + Math.floor((i + 1) * bucketSize) + 1;
    if (rangeStart < start + 1) rangeStart = start + 1;
    if (rangeEnd > end - 1) rangeEnd = end - 1;
    if (rangeEnd <= rangeStart) rangeEnd = Math.min(end - 1, rangeStart + 1);
    const ax = xAt(xs, prev);
    const ay = ys[prev] as number;
    let maxArea = -1;
    let next = rangeStart;
    for (let j = rangeStart; j < rangeEnd; j++) {
      const area = Math.abs((ax - avgX) * ((ys[j] as number) - ay) - (ax - xAt(xs, j)) * (avgY - ay));
      if (area > maxArea) {
        maxArea = area;
        next = j;
      }
    }
    out[i + 1] = next;
    prev = next;
  }
  out[threshold - 1] = end - 1;
  return uniqueSorted(out, threshold);
}

function copyRange(start: number, end: number): Int32Array {
  const out = new Int32Array(end - start);
  for (let i = start; i < end; i++) out[i - start] = i;
  return out;
}

function uniqueSorted(raw: Int32Array, n: number): Int32Array {
  const view = raw.subarray(0, n);
  view.sort();
  let w = 0;
  for (let i = 0; i < n; i++) {
    if (w === 0 || view[i] !== view[w - 1]) view[w++] = view[i];
  }
  return Int32Array.from(view.subarray(0, w));
}

function finiteY(value: number | null): boolean {
  return value !== null && Number.isFinite(value);
}

function xAt(xs: ArrayLike<number | null> | null, index: number): number {
  if (!xs) return index;
  const x = xs[index];
  return typeof x === "number" && Number.isFinite(x) ? x : index;
}
