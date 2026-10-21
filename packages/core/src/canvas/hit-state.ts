/**
 * Shared hit slot. The grid and the binary search live in the canvas chunk.
 * `globalThis` keeps one map when interact and the painter are separate bundles.
 */

export interface HitSeries {
  name: string;
  ys: ArrayLike<number | null>;
  color: string;
  /** Pixel y of a data y. */
  py: (y: number) => number;
}

export interface ScatterGrid {
  cols: number;
  rows: number;
  left: number;
  top: number;
  cell: number;
  /** Point indexes per cell, packed. `starts[cell + 1]` is the end. */
  starts: Int32Array;
  order: Int32Array;
  px: Float32Array;
  py: Float32Array;
  color: string[];
  name: string[];
  index: Int32Array;
}

export interface DataHit {
  kind: "line" | "area" | "bar" | "scatter";
  count: number;
  plotLeft: number;
  plotTop: number;
  plotWidth: number;
  plotHeight: number;
  xMin: number;
  xMax: number;
  linear: boolean;
  x0: number;
  stride: number;
  xs: Float64Array | null;
  series: HitSeries[];
  indexAt: (px: number) => number;
  pixelAt: (index: number) => number;
  grid?: ScatterGrid;
  /** Built in the canvas chunk. Absent until that chunk has painted. */
  dots?: (index: number) => { x: number; y: number; color: string }[];
  nearest?: (x: number, y: number) => { index: number; x: number; y: number; color: string; name: string } | null;
}

interface Slot {
  hits: WeakMap<Element, DataHit>;
  repaints: WeakMap<Element, () => void>;
  painter: ((host: Element, spec: unknown) => boolean) | null;
}

function slot(): Slot {
  const host = globalThis as unknown as { __chartkitHit?: Slot };
  return (host.__chartkitHit ??= { hits: new WeakMap(), repaints: new WeakMap(), painter: null });
}

export function setDataHit(svg: Element, hit: DataHit | null): void {
  const hits = slot().hits;
  if (hit) hits.set(svg, hit);
  else hits.delete(svg);
}

export function dataHit(svg: Element | null): DataHit | null {
  if (!svg) return null;
  return slot().hits.get(svg) ?? null;
}

export function onSceneRepaint(svg: Element, fn: () => void): void {
  slot().repaints.set(svg, fn);
}

export function sceneRepaint(svg: Element): void {
  slot().repaints.get(svg)?.();
}

/** Registered by the canvas chunk the first time it loads. */
export function registerScenePainter(fn: (host: Element, spec: unknown) => boolean): void {
  slot().painter = fn;
}

export function paintScene(host: Element, spec: unknown): boolean {
  const painter = slot().painter;
  return painter ? painter(host, spec) : false;
}
