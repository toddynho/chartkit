/**
 * Scatter grid and point dots. Imported by the canvas painter, not by interact.
 */
import type { DataHit, ScatterGrid } from "./hit-state";

export type { DataHit, HitSeries, ScatterGrid } from "./hit-state";
export { dataHit, onSceneRepaint, paintScene, registerScenePainter, sceneRepaint, setDataHit } from "./hit-state";

export function dotsAt(hit: DataHit, index: number): { x: number; y: number; color: string }[] {
  const x = hit.pixelAt(index);
  const out: { x: number; y: number; color: string }[] = [];
  for (let i = 0; i < hit.series.length; i++) {
    const series = hit.series[i];
    const y = series.ys[index];
    if (typeof y !== "number" || y !== y) continue;
    out.push({ x, y: series.py(y), color: series.color });
  }
  return out;
}

export function nearestSorted(xs: Float64Array, target: number, count: number): number {
  const n = Math.min(count, xs.length);
  if (n <= 1) return 0;
  if (target <= xs[0]) return 0;
  if (target >= xs[n - 1]) return n - 1;
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= target) lo = mid;
    else hi = mid;
  }
  return target - xs[lo] <= xs[hi] - target ? lo : hi;
}

export function buildScatterGrid(
  px: Float32Array,
  py: Float32Array,
  n: number,
  color: string[],
  name: string[],
  index: Int32Array,
  left: number,
  top: number,
  width: number,
  height: number,
): ScatterGrid {
  const cell = 16;
  const cols = Math.max(1, Math.ceil(width / cell));
  const rows = Math.max(1, Math.ceil(height / cell));
  const cells = cols * rows;
  const counts = new Int32Array(cells);
  const colOf = (x: number) => {
    let c = Math.floor((x - left) / cell);
    if (c < 0) c = 0;
    else if (c >= cols) c = cols - 1;
    return c;
  };
  const rowOf = (y: number) => {
    let r = Math.floor((y - top) / cell);
    if (r < 0) r = 0;
    else if (r >= rows) r = rows - 1;
    return r;
  };
  for (let i = 0; i < n; i++) counts[rowOf(py[i]) * cols + colOf(px[i])] += 1;
  const starts = new Int32Array(cells + 1);
  for (let i = 0; i < cells; i++) starts[i + 1] = starts[i] + counts[i];
  const order = new Int32Array(n);
  const cursor = starts.slice(0, cells);
  for (let i = 0; i < n; i++) {
    const cellIndex = rowOf(py[i]) * cols + colOf(px[i]);
    order[cursor[cellIndex]++] = i;
  }
  return { cols, rows, left, top, cell, starts, order, px, py, color, name, index };
}

export function nearestScatter(grid: ScatterGrid, x: number, y: number, radius = 14): { index: number; x: number; y: number; color: string; name: string } | null {
  const col = Math.floor((x - grid.left) / grid.cell);
  const row = Math.floor((y - grid.top) / grid.cell);
  let best = radius * radius;
  let pick = -1;
  for (let dy = -1; dy <= 1; dy++) {
    const r = row + dy;
    if (r < 0 || r >= grid.rows) continue;
    for (let dx = -1; dx <= 1; dx++) {
      const c = col + dx;
      if (c < 0 || c >= grid.cols) continue;
      const cell = r * grid.cols + c;
      for (let k = grid.starts[cell]; k < grid.starts[cell + 1]; k++) {
        const i = grid.order[k];
        const ox = grid.px[i] - x;
        const oy = grid.py[i] - y;
        const dist = ox * ox + oy * oy;
        if (dist < best) {
          best = dist;
          pick = i;
        }
      }
    }
  }
  if (pick < 0) return null;
  return { index: grid.index[pick], x: grid.px[pick], y: grid.py[pick], color: grid.color[pick] ?? "", name: grid.name[pick] ?? "" };
}
