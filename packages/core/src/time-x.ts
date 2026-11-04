import { formatValue } from "./format";
import { isRecord } from "./svg";
import { formatZoned, instantOf, zoneOf, zonedTimeTicks } from "./timezone";

export interface TimeScale {
  /** Pixel x for one row. Endpoints sit inset, like a category slot. */
  at(index: number, width: number, origin: number): number;
  /** Pixel x for a 0..1 tick from `ticks`. */
  px(t: number, width: number, origin: number): number;
  ticks(locale: string): { t: number; text: string }[];
}

/**
 * Continuous x when the values are datetimes, or the channel says temporal.
 * Nominal, ordinal, and quantitative channels stay on the caller's category axis.
 */
export function readTimeScale(spec: Record<string, unknown>, values: unknown[]): TimeScale | null {
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const channel = encoding.x;
  const type = isRecord(channel) && typeof channel.type === "string" ? channel.type : "";
  if (type === "nominal" || type === "ordinal" || type === "quantitative" || type === "linear") return null;
  const forced = type === "temporal" || type === "time" || type === "utc";
  const ms = values.map((value) => instantOf(value));
  if (!forced && ms.some((value) => value === null)) return null;
  const finite = ms.filter((value): value is number => value !== null);
  if (finite.length < 2) return null;
  const scale = isRecord(channel) && isRecord(channel.scale) ? channel.scale : undefined;
  const reverse = scale?.reverse === true;
  const pad = typeof scale?.padding === "number" ? Math.max(0, scale.padding) : 0;
  const padMin = scale && isRecord(scale.padding) && typeof scale.padding.min === "number" ? Math.max(0, scale.padding.min) : pad;
  const padMax = scale && isRecord(scale.padding) && typeof scale.padding.max === "number" ? Math.max(0, scale.padding.max) : pad;
  let min = Math.min(...finite);
  let max = Math.max(...finite);
  const dataSpan = max - min || 1;
  min -= dataSpan * padMin;
  max += dataSpan * padMax;
  const span = max - min || 1;
  const zone = zoneOf(spec);
  const format = isRecord(channel) ? channel.format : undefined;
  const place = (t: number, width: number, origin: number) => {
    const inset = width / Math.max(2, values.length);
    return origin + inset / 2 + Math.min(1, Math.max(0, t)) * (width - inset);
  };
  return {
    px: place,
    at(index, width, origin) {
      const value = ms[index];
      let t = value == null ? index / Math.max(1, values.length - 1) : (value - min) / span;
      if (reverse) t = 1 - t;
      return place(t, width, origin);
    },
    ticks(locale) {
      const marks = zonedTimeTicks(min, max, 4, zone);
      return marks.map((mark) => ({
        t: reverse ? 1 - (mark - min) / span : (mark - min) / span,
        text: format !== undefined ? formatValue(mark, withStyle(format), locale, zone) : formatZoned(mark, span, locale, zone),
      }));
    },
  };
}

function withStyle(format: unknown): unknown {
  if (!isRecord(format) || typeof format.style === "string" || typeof format.specifier === "string") return format;
  return { ...format, style: typeof format.currency === "string" ? "currency" : "number" };
}
