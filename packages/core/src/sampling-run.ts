/**
 * Typed LTTB and minmax for canvas. The SVG line sampler lives in ./sampling
 * so a synchronous line render still downsamples. This chunk loads with the painter.
 */
import { notedDense as notedDenseFn0, notedLinear as notedLinearFn0, resolveSampling, sampleSeries, samplingThreshold, type BucketMemo, type SampledRuns, type SamplingMode, type TypedSample } from "./sampling";

let notedDenseFn = notedDenseFn0;
let notedLinearFn = notedLinearFn0;

export interface SamplingApi {
  sampleSeries: typeof sampleSeries;
  sampleTyped: typeof sampleTyped;
  extendMinmax: typeof extendMinmax;
  id: "ck-sampling-run";
}

/** Point the algorithms at the renderer's note tables, then hand back the API. */
export function bindSampling(notes: {
  notedDense: typeof notedDenseFn0;
  notedLinear: typeof notedLinearFn0;
}): SamplingApi {
  notedDenseFn = notes.notedDense;
  notedLinearFn = notes.notedLinear;
  return { sampleSeries, sampleTyped, extendMinmax, id: "ck-sampling-run" };
}

function finiteY(value: number | null): boolean {
  return value !== null && Number.isFinite(value);
}

function xAt(xs: ArrayLike<number | null> | null, index: number): number {
  if (!xs) return index;
  const x = xs[index];
  return typeof x === "number" && Number.isFinite(x) ? x : index;
}

let slotLo = new Int32Array(2048);
let slotHi = new Int32Array(2048);
let scratch = new Int32Array(8192);
let packed = new Int32Array(4096);
let memoLo = new Int32Array(2048);
let memoHi = new Int32Array(2048);
const memo: BucketMemo = {
  buckets: 0,
  lo: memoLo,
  hi: memoHi,
  x0: 0,
  x1: 0,
  count: 0,
  first: 0,
  last: 0,
  linear: false,
  stride: 0,
  dataX0: 0,
};

function slots(buckets: number): void {
  if (slotLo.length >= buckets) return;
  let cap = slotLo.length;
  while (cap < buckets) cap *= 2;
  slotLo = new Int32Array(cap);
  slotHi = new Int32Array(cap);
}

function holdMemo(buckets: number): void {
  if (memoLo.length < buckets) {
    let cap = memoLo.length;
    while (cap < buckets) cap *= 2;
    memoLo = new Int32Array(cap);
    memoHi = new Int32Array(cap);
    memo.lo = memoLo;
    memo.hi = memoHi;
  }
  memoLo.set(slotLo.subarray(0, buckets));
  memoHi.set(slotHi.subarray(0, buckets));
  memo.buckets = buckets;
}

function packInto(buckets: number, start: number, last: number): number {
  const need = 2 + buckets * 2;
  if (scratch.length < need) {
    let cap = scratch.length;
    while (cap < need) cap *= 2;
    scratch = new Int32Array(cap);
  }
  let n = 0;
  scratch[n++] = start;
  for (let bucket = 0; bucket < buckets; bucket++) {
    const a = slotLo[bucket];
    const b = slotHi[bucket];
    if (a >= 0) scratch[n++] = a;
    if (b >= 0 && b !== a) scratch[n++] = b;
  }
  scratch[n++] = last;
  scratch.subarray(0, n).sort();
  let w = 0;
  for (let i = 0; i < n; i++) {
    if (w === 0 || scratch[i] !== scratch[w - 1]) scratch[w++] = scratch[i];
  }
  if (packed.length < w) {
    let cap = packed.length;
    while (cap < w) cap *= 2;
    packed = new Int32Array(cap);
  }
  packed.set(scratch.subarray(0, w));
  return w;
}

/**
 * Min-max or LTTB straight over typed columns into reused index buffers.
 * No per-point objects. Callers must read `index` before the next call.
 */
export function sampleTyped(
  requested: SamplingMode,
  xs: Float64Array | null,
  ys: Float64Array,
  count: number,
  plotWidth: number,
): TypedSample {
  const mode = resolveSampling(requested, count, plotWidth);
  if (mode === "none" || count < 2) return { index: packed, length: 0, reduced: false, mode: "none", memo: null };
  const target = Math.min(samplingThreshold(plotWidth), count);
  const linear = xs === null || notedLinearFn(xs);
  if (mode === "minmax" && linear) {
    const length = minmaxIndexInto(ys, 0, count, target, xs);
    return { index: packed, length, reduced: length < count, mode, memo };
  }
  if (mode === "minmax" && xs) {
    const length = minmaxSortedInto(xs, ys, 0, count, target);
    if (length >= 0) return { index: packed, length, reduced: length < count, mode, memo };
    const ranged = minmaxRangeInto(xs, ys, 0, count, target);
    return { index: packed, length: ranged, reduced: ranged < count, mode, memo };
  }
  const length = mode === "lttb" ? lttbInto(xs, ys, 0, count, target) : minmaxRangeInto(xs, ys, 0, count, target);
  return { index: packed, length, reduced: length < count, mode, memo: mode === "minmax" ? memo : null };
}

function minmaxIndexInto(ys: Float64Array, start: number, end: number, target: number, xs: Float64Array | null): number {
  const last = end - 1;
  const len = last - start;
  const buckets = Math.max(1, Math.floor((target - 2) / 2));
  slots(buckets);
  slotLo.fill(-1, 0, buckets);
  slotHi.fill(-1, 0, buckets);
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
    slotLo[bucket] = lo;
    slotHi[bucket] = hi;
  }
  holdMemo(buckets);
  const x0 = xs ? xs[start] : start;
  const x1 = xs ? xs[last] : last;
  memo.x0 = x0;
  memo.x1 = x1;
  memo.count = end - start;
  memo.first = start;
  memo.last = last;
  memo.linear = true;
  memo.stride = end - start > 1 ? (x1 - x0) / (end - start - 1) : 0;
  memo.dataX0 = x0;
  return packInto(buckets, start, last);
}

function minmaxSortedInto(xs: Float64Array, ys: Float64Array, start: number, end: number, target: number): number {
  const last = end - 1;
  const x0 = xs[start];
  const endX = xs[last];
  const span = endX - x0;
  if (!(span >= 0)) return -1;
  const buckets = Math.max(1, Math.floor((target - 2) / 2));
  slots(buckets);
  slotLo.fill(-1, 0, buckets);
  slotHi.fill(-1, 0, buckets);
  let i = start + 1;
  let prev = x0;
  for (let bucket = 0; bucket < buckets; bucket++) {
    const edge = span > 0 && bucket < buckets - 1 ? x0 + ((bucket + 1) * span) / buckets : Infinity;
    let lo = -1;
    let hi = -1;
    while (i < last) {
      const x = xs[i];
      if (!(x >= prev) || x > endX) return -1;
      if (x >= edge) break;
      const y = ys[i];
      if (lo < 0 || y < ys[lo]) lo = i;
      if (hi < 0 || y > ys[hi]) hi = i;
      prev = x;
      i += 1;
    }
    slotLo[bucket] = lo;
    slotHi[bucket] = hi;
  }
  holdMemo(buckets);
  memo.x0 = x0;
  memo.x1 = endX;
  memo.count = end - start;
  memo.first = start;
  memo.last = last;
  memo.linear = false;
  memo.stride = 0;
  memo.dataX0 = x0;
  return packInto(buckets, start, last);
}

function minmaxRangeInto(xs: ArrayLike<number | null> | null, ys: ArrayLike<number | null>, start: number, end: number, target: number): number {
  const last = end - 1;
  const buckets = Math.max(1, Math.floor((target - 2) / 2));
  slots(buckets);
  slotLo.fill(-1, 0, buckets);
  slotHi.fill(-1, 0, buckets);
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
    const lo = slotLo[bucket];
    if (lo < 0 || y < (ys[lo] as number) || (y === ys[lo] && i < lo)) slotLo[bucket] = i;
    const hi = slotHi[bucket];
    if (hi < 0 || y > (ys[hi] as number) || (y === ys[hi] && i < hi)) slotHi[bucket] = i;
  }
  holdMemo(buckets);
  memo.x0 = x0;
  memo.x1 = x1;
  memo.count = end - start;
  memo.first = start;
  memo.last = last;
  memo.linear = xs === null;
  memo.stride = 0;
  memo.dataX0 = x0;
  return packInto(buckets, start, last);
}

function lttbInto(xs: ArrayLike<number | null> | null, ys: ArrayLike<number | null>, start: number, end: number, threshold: number): number {
  const len = end - start;
  if (threshold <= 2) {
    if (packed.length < 2) packed = new Int32Array(2);
    packed[0] = start;
    if (len > 1) packed[1] = end - 1;
    return len === 1 ? 1 : 2;
  }
  if (packed.length < threshold) {
    let cap = packed.length;
    while (cap < threshold) cap *= 2;
    packed = new Int32Array(cap);
  }
  packed[0] = start;
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
    packed[i + 1] = next;
    prev = next;
  }
  packed[threshold - 1] = end - 1;
  packed.subarray(0, threshold).sort();
  let w = 0;
  for (let i = 0; i < threshold; i++) {
    if (w === 0 || packed[i] !== packed[w - 1]) packed[w++] = packed[i];
  }
  memo.buckets = 0;
  return w;
}

/**
 * Fold `from..to` into an existing minmax memo. Bucket edges stay at `memo.x0`/`memo.x1`,
 * so this is only valid while the x domain has not moved. Returns fresh indexes in the reused buffer.
 */
export function extendMinmax(memoIn: BucketMemo, xs: Float64Array | null, ys: Float64Array, from: number, to: number): TypedSample {
  const buckets = memoIn.buckets;
  const span = memoIn.x1 - memoIn.x0;
  slots(buckets);
  slotLo.set(memoIn.lo.subarray(0, buckets));
  slotHi.set(memoIn.hi.subarray(0, buckets));
  for (let i = from; i < to; i++) {
    const x = xs ? xs[i] : memoIn.dataX0 + i * memoIn.stride;
    const y = ys[i];
    if (!Number.isFinite(y) || !Number.isFinite(x)) continue;
    let bucket = span === 0 ? 0 : Math.floor(((x - memoIn.x0) / span) * buckets);
    if (bucket < 0) bucket = 0;
    else if (bucket >= buckets) bucket = buckets - 1;
    const lo = slotLo[bucket];
    if (lo < 0 || y < ys[lo]) slotLo[bucket] = i;
    const hi = slotHi[bucket];
    if (hi < 0 || y > ys[hi]) slotHi[bucket] = i;
  }
  holdMemo(buckets);
  memo.x0 = memoIn.x0;
  memo.x1 = memoIn.x1;
  memo.count = to;
  memo.first = memoIn.first;
  memo.last = to - 1;
  memo.linear = memoIn.linear;
  memo.stride = memoIn.stride;
  memo.dataX0 = memoIn.dataX0;
  const length = packInto(buckets, memoIn.first, to - 1);
  return { index: packed, length, reduced: true, mode: "minmax", memo };
}
