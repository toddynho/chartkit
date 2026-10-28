import type { DataTable } from "./data";
import { esc, isRecord, n } from "./svg";
import { mountRange, type Series } from "./renderers/cartesian";

/**
 * Pixel envelope of a dense band. Null when the series is not at least two
 * points per pixel, so the caller keeps the exact path. A null that crosses
 * into a new pixel starts a new run, so a gap stays open.
 */
export function denseBand(
  lo: ArrayLike<number | null>,
  hi: ArrayLike<number | null>,
  xAt: (index: number) => number,
  yAt: (value: number) => number,
): string | null {
  const count = Math.min(lo.length, hi.length);
  if (count < 4) return null;
  const x0 = xAt(0);
  const x1 = xAt(count - 1);
  const left = Math.min(x0, x1);
  const span = Math.abs(x1 - x0);
  const buckets = Math.max(1, Math.ceil(span));
  if (buckets < 2 || count < buckets * 2) return null;
  const top = new Float64Array(buckets);
  const bot = new Float64Array(buckets);
  top.fill(Infinity);
  bot.fill(-Infinity);
  const seam = new Uint8Array(buckets);
  const denom = buckets - 1;
  let gap = false;
  let prev = -1;
  for (let i = 0; i < count; i++) {
    const a = lo[i];
    const b = hi[i];
    if (a === null || b === null || !Number.isFinite(a) || !Number.isFinite(b)) {
      gap = true;
      continue;
    }
    let k = Math.round(((xAt(i) - left) / (span || 1)) * denom);
    if (k < 0) k = 0;
    else if (k >= buckets) k = buckets - 1;
    if (gap && prev >= 0 && k !== prev) seam[k] = 1;
    gap = false;
    prev = k;
    const hiV = a > b ? a : b;
    const loV = a < b ? a : b;
    const t = yAt(hiV);
    const bm = yAt(loV);
    if (t < top[k]) top[k] = t;
    if (bm > bot[k]) bot[k] = bm;
  }
  const xOf = (k: number) => left + (k / denom) * span;
  const parts: string[] = [];
  let from = -1;
  const flush = (to: number) => {
    if (from < 0 || to <= from) return;
    let d = `M ${n(xOf(from))} ${n(top[from])}`;
    for (let k = from + 1; k < to; k++) d += ` L ${n(xOf(k))} ${n(top[k])}`;
    for (let k = to - 1; k >= from; k--) d += ` L ${n(xOf(k))} ${n(bot[k])}`;
    parts.push(`${d} Z`);
    from = -1;
  };
  for (let k = 0; k < buckets; k++) {
    if (!Number.isFinite(top[k]) || seam[k]) flush(k);
    if (!Number.isFinite(top[k])) continue;
    if (from < 0) from = k;
  }
  flush(buckets);
  return parts.length ? parts.join(" ") : null;
}

/**
 * Min and max of a dense line in each pixel, in index order. Null when the
 * series is not dense enough to decimate. A null that enters a new pixel
 * breaks the stroke.
 */
export function denseLine(
  values: ArrayLike<number | null>,
  xAt: (index: number) => number,
  yAt: (value: number) => number,
): string | null {
  const count = values.length;
  if (count < 4) return null;
  const x0 = xAt(0);
  const x1 = xAt(count - 1);
  const left = Math.min(x0, x1);
  const span = Math.abs(x1 - x0);
  const buckets = Math.max(1, Math.ceil(span));
  if (buckets < 2 || count < buckets * 2) return null;
  const loI = new Int32Array(buckets);
  const hiI = new Int32Array(buckets);
  loI.fill(-1);
  hiI.fill(-1);
  const seam = new Uint8Array(buckets);
  const denom = buckets - 1;
  let gap = false;
  let prev = -1;
  for (let i = 0; i < count; i++) {
    const value = values[i];
    if (value === null || !Number.isFinite(value)) {
      gap = true;
      continue;
    }
    let k = Math.round(((xAt(i) - left) / (span || 1)) * denom);
    if (k < 0) k = 0;
    else if (k >= buckets) k = buckets - 1;
    if (gap && prev >= 0 && k !== prev) seam[k] = 1;
    gap = false;
    prev = k;
    const lo = loI[k];
    if (lo < 0 || value < (values[lo] as number) || (value === values[lo] && i < lo)) loI[k] = i;
    const hi = hiI[k];
    if (hi < 0 || value > (values[hi] as number) || (value === values[hi] && i < hi)) hiI[k] = i;
  }
  let d = "";
  let open = false;
  const emit = (index: number) => {
    const value = values[index];
    if (value === null || !Number.isFinite(value)) return;
    d += `${open ? "L" : "M"} ${n(xAt(index))} ${n(yAt(value as number))} `;
    open = true;
  };
  for (let k = 0; k < buckets; k++) {
    const a = loI[k];
    const b = hiI[k];
    if (a < 0 || seam[k]) open = false;
    if (a < 0) continue;
    if (b < 0 || a === b) emit(a);
    else if (a < b) {
      emit(a);
      emit(b);
    } else {
      emit(b);
      emit(a);
    }
  }
  const trimmed = d.trim();
  return trimmed || null;
}

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
