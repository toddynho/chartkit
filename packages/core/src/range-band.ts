import type { DataTable } from "./data";
import { esc, isRecord, n } from "./svg";
import { mountRange, type Series } from "./renderers/cartesian";

/** Closed band between lo and hi. Nulls break the run. Shared by combo and area-range. */
export function bandPath(
  lo: ArrayLike<number | null>,
  hi: ArrayLike<number | null>,
  xAt: (index: number) => number,
  yAt: (value: number) => number,
): string {
  const runs: { x: number; top: number; bottom: number }[][] = [];
  let run: { x: number; top: number; bottom: number }[] = [];
  const count = Math.min(lo.length, hi.length);
  for (let i = 0; i < count; i++) {
    const a = lo[i];
    const b = hi[i];
    if (a === null || b === null || !Number.isFinite(a) || !Number.isFinite(b)) {
      if (run.length) runs.push(run);
      run = [];
      continue;
    }
    run.push({ x: xAt(i), top: yAt(Math.max(a, b)), bottom: yAt(Math.min(a, b)) });
  }
  if (run.length) runs.push(run);
  return runs
    .map((points) => {
      if (points.length === 1) {
        const point = points[0];
        return `M ${n(point.x)} ${n(point.top)} L ${n(point.x)} ${n(point.bottom)}`;
      }
      let d = `M ${n(points[0].x)} ${n(points[0].top)}`;
      for (let i = 1; i < points.length; i++) d += ` L ${n(points[i].x)} ${n(points[i].top)}`;
      for (let i = points.length - 1; i >= 0; i--) d += ` L ${n(points[i].x)} ${n(points[i].bottom)}`;
      return `${d} Z`;
    })
    .join(" ");
}

function nums(table: DataTable, field: string): (number | null)[] {
  const column = table.columns[field];
  const out: (number | null)[] = [];
  for (let i = 0; i < table.length; i++) {
    const value = column ? column[i] : null;
    out.push(typeof value === "number" && Number.isFinite(value) ? value : null);
  }
  return out;
}

/** Outer rank 0 is the lightest fill. A single band sits between the two nested weights. */
export function nestedOpacity(rank: number, count: number): number {
  if (count <= 1) return 0.22;
  if (count === 2) return rank === 0 ? 0.15 : 0.3;
  return 0.15 + (rank / (count - 1)) * 0.2;
}

/** "95%" becomes "95% interval". Other names stay as written. */
export function intervalLabel(name: string): string {
  return /^\d+(?:\.\d+)?%$/.test(name) ? `${name} interval` : name;
}

function paintBand(series: Series, _index: number, xAt: (index: number) => number, yAt: (value: number) => number): string {
  const span = series.span;
  if (!span) return "";
  const d = bandPath(span.lo, span.hi, xAt, yAt);
  if (!d) return "";
  const opacity = n(series.bandOpacity ?? 0.22);
  const label = series.name;
  return `<path d="${d}" fill="${series.color}" fill-opacity="${opacity}" stroke="none" data-ck-mark="band" data-ck-series="${esc(label)}" aria-label="${esc(label)}"><title>${esc(label)}</title></path>`;
}

function prepareBands(
  table: DataTable,
  encoding: Record<string, unknown>,
  series: Series[],
  labels: string[],
): { series: Series[]; labels: string[] } | null {
  const y = encoding.y;
  const list = Array.isArray(y) ? y : y === undefined ? [] : [y];
  let changed = false;
  const next = series.map((item, index) => {
    const spec = list[index];
    if (!isRecord(spec)) return item;
    const loName = typeof spec.lo === "string" ? spec.lo : "";
    const hiName = typeof spec.hi === "string" ? spec.hi : "";
    const wants = spec.mark === "range" || (Boolean(loName) && Boolean(hiName) && spec.mark !== "line" && spec.mark !== "bar" && spec.mark !== "area");
    if (!wants || !loName || !hiName) return item;
    changed = true;
    const lo = nums(table, loName);
    const hi = nums(table, hiName);
    const mid: (number | null)[] = [];
    let extentLo = Infinity;
    let extentHi = -Infinity;
    for (let i = 0; i < table.length; i++) {
      const a = lo[i];
      const b = hi[i];
      if (a !== null) {
        if (a < extentLo) extentLo = a;
        if (a > extentHi) extentHi = a;
      }
      if (b !== null) {
        if (b < extentLo) extentLo = b;
        if (b > extentHi) extentHi = b;
      }
      mid.push(a !== null && b !== null ? (a + b) / 2 : (a ?? b));
    }
    // Domain reads series.values and nothing else. A range mark is not drawn from
    // those values, so the ends can live in the first two slots without a scan
    // hook in the shared cartesian module (that hook survived into the line bundle).
    if (mid.length >= 2) {
      if (Number.isFinite(extentLo)) mid[0] = mid[0] === null ? extentLo : Math.min(mid[0], extentLo);
      if (Number.isFinite(extentHi)) mid[1] = mid[1] === null ? extentHi : Math.max(mid[1], extentHi);
    } else if (mid.length === 1 && Number.isFinite(extentLo) && Number.isFinite(extentHi)) {
      mid[0] = extentLo;
      mid.push(extentHi);
    }
    return { ...item, mark: "range" as const, span: { lo, hi }, values: mid };
  });
  if (changed) linkBands(list, next);
  return changed ? { series: next, labels } : null;
}

function meanSpan(series: Series): number {
  const span = series.span;
  if (!span) return 0;
  let sum = 0;
  let count = 0;
  const length = Math.min(span.lo.length, span.hi.length);
  for (let i = 0; i < length; i++) {
    const lo = span.lo[i];
    const hi = span.hi[i];
    if (lo === null || hi === null || !Number.isFinite(lo) || !Number.isFinite(hi)) continue;
    sum += Math.abs(hi - lo);
    count += 1;
  }
  return count ? sum / count : 0;
}

/** Bands without their own colour take the nearest line, and the wider band is the lighter fill. */
function linkBands(list: unknown[], series: Series[]): void {
  const lines: number[] = [];
  for (let i = 0; i < list.length; i++) {
    const spec = list[i];
    if (!isRecord(spec) || typeof spec.field !== "string") continue;
    if (spec.mark === "range" || spec.mark === "bar" || spec.mark === "area") continue;
    lines.push(i);
  }
  const groups = new Map<number, number[]>();
  for (let i = 0; i < series.length; i++) {
    if (series[i].mark !== "range" || !series[i].span) continue;
    const spec = list[i];
    const explicit = isRecord(spec) && typeof spec.color === "string";
    let link = -1;
    if (!explicit && lines.length) {
      let best = lines[0];
      let dist = Math.abs(best - i);
      for (const line of lines) {
        const gap = Math.abs(line - i);
        if (gap < dist) {
          dist = gap;
          best = line;
        }
      }
      link = best;
      series[i].color = series[best].color;
      series[i].name = intervalLabel(series[i].name);
    }
    const group = groups.get(link) ?? [];
    group.push(i);
    groups.set(link, group);
  }
  for (const group of groups.values()) {
    const ranked = [...group].sort((a, b) => meanSpan(series[b]) - meanSpan(series[a]) || a - b);
    ranked.forEach((index, rank) => {
      series[index].bandOpacity = nestedOpacity(rank, ranked.length);
    });
  }
}

/** Called from the combo entry only. */
export function mountRangeBand(): void {
  mountRange(paintBand, prepareBands);
}
