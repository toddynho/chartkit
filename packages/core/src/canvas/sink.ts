import type { BucketMemo } from "../sampling";

export interface SceneMark {
  kind: "line" | "area" | "bar" | "scatter";
  x: Float64Array;
  y: Float64Array;
  n: number;
  /** Area fill returns to this pixel. Null for a stroke. */
  baseline: number | null;
  rects: Float32Array;
  rectN: number;
  color: string;
  stroke: string;
  strokeWidth: number;
  strokePaint: string;
  fillPaint: string;
  fillOpacity: number;
  dash: string;
  gradient: boolean;
  curve: "linear" | "monotone" | "step" | "step-before" | "step-after";
  /** Scatter glyph. Empty means a circle. */
  shape: string;
  hollow: boolean;
  /** Per-rect or per-dot fill. Null uses `color`. */
  fills: string[] | null;
  /** Scatter series or category name, one per dot. */
  names: string[] | null;
  /** Source row of each scatter dot. */
  indexes: Int32Array | null;
  name: string;
  rows: number;
  ys: ArrayLike<number | null>;
  axis: "y" | "y2";
  memo: BucketMemo | null;
  xs: Float64Array | null;
}

export interface SceneProfile {
  ingest: number;
  scales: number;
  sample: number;
  svg: number;
  dom: number;
  paint: number;
  rows: number;
  kept: number;
}

export interface SceneFrame {
  plot: { left: number; top: number; right: number; bottom: number } | null;
  width: number;
  height: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  y2Min: number;
  y2Max: number;
  py0: number;
  py1: number;
  py20: number;
  py21: number;
  linear: boolean;
  x0: number;
  stride: number;
  count: number;
  xs: Float64Array | null;
  marks: SceneMark[];
  key: string;
  reuseKey: string;
  reused: boolean;
  profile: SceneProfile;
}

let current: SceneFrame | null = null;
let lineX: Float64Array[] = [];
let lineY: Float64Array[] = [];
let lineCursor = 0;
let rects: Float32Array[] = [];
let rectCursor = 0;
let markPool: SceneMark[] = [];
let markCursor = 0;

function grow64(buf: Float64Array | undefined, need: number): Float64Array {
  if (buf && buf.length >= need) return buf;
  let cap = buf?.length ?? 256;
  while (cap < need) cap *= 2;
  return new Float64Array(cap);
}

function grow32(buf: Float32Array | undefined, need: number): Float32Array {
  if (buf && buf.length >= need) return buf;
  let cap = buf?.length ?? 256;
  while (cap < need) cap *= 2;
  return new Float32Array(cap);
}

export function beginScene(reuseKey = ""): SceneFrame {
  lineCursor = 0;
  rectCursor = 0;
  markCursor = 0;
  current = {
    plot: null,
    width: 0,
    height: 0,
    xMin: 0,
    xMax: 1,
    yMin: 0,
    yMax: 1,
    y2Min: 0,
    y2Max: 1,
    py0: 0,
    py1: 0,
    py20: 0,
    py21: 0,
    linear: false,
    x0: 0,
    stride: 0,
    count: 0,
    xs: null,
    marks: [],
    key: "",
    reuseKey,
    reused: false,
    profile: { ingest: 0, scales: 0, sample: 0, svg: 0, dom: 0, paint: 0, rows: 0, kept: 0 },
  };
  return current;
}

export function activeScene(): SceneFrame | null {
  return current;
}

export function endScene(): void {
  current = null;
}

export function lineBuffers(n: number): { x: Float64Array; y: Float64Array } {
  const i = lineCursor++;
  lineX[i] = grow64(lineX[i], n);
  lineY[i] = grow64(lineY[i], n);
  return { x: lineX[i], y: lineY[i] };
}

/** `need` is the number of floats (4 per rect). */
export function rectBuffers(need: number): Float32Array {
  const i = rectCursor++;
  rects[i] = grow32(rects[i], need);
  return rects[i];
}

/** Append one pixel rect. `fill` is kept when cells do not share a color. */
export function pushRect(mark: SceneMark, x: number, y: number, w: number, h: number, fill?: string): void {
  const n = mark.rectN;
  const need = (n + 1) * 4;
  if (mark.rects.length < need) {
    const grown = new Float32Array(Math.max(need, (mark.rects.length || 32) * 2));
    grown.set(mark.rects.subarray(0, n * 4));
    mark.rects = grown;
  }
  const at = n * 4;
  mark.rects[at] = x;
  mark.rects[at + 1] = y;
  mark.rects[at + 2] = w;
  mark.rects[at + 3] = h;
  mark.rectN = n + 1;
  if (fill !== undefined) {
    if (!mark.fills) mark.fills = [];
    mark.fills[n] = fill;
  }
}

export function takeMark(): SceneMark {
  const i = markCursor++;
  const found = markPool[i];
  if (found) {
    found.n = 0;
    found.rectN = 0;
    found.baseline = null;
    found.memo = null;
    found.xs = null;
    found.kind = "line";
    found.shape = "";
    found.hollow = false;
    found.fills = null;
    found.names = null;
    found.indexes = null;
    found.fillOpacity = 1;
    return found;
  }
  const mark: SceneMark = {
    kind: "line",
    x: new Float64Array(0),
    y: new Float64Array(0),
    n: 0,
    baseline: null,
    rects: new Float32Array(0),
    rectN: 0,
    color: "",
    stroke: "",
    strokeWidth: 2,
    strokePaint: "2",
    fillPaint: "1",
    fillOpacity: 1,
    dash: "",
    gradient: false,
    curve: "linear",
    shape: "",
    hollow: false,
    fills: null,
    names: null,
    indexes: null,
    name: "",
    rows: 0,
    ys: new Float64Array(0),
    axis: "y",
    memo: null,
    xs: null,
  };
  markPool[i] = mark;
  return mark;
}
