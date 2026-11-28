/** IANA zones for axes, ticks, and tooltips. Omitted or invalid stays UTC. */

const good = new Set<string>(["UTC"]);
const bad = new Set<string>();

/** A usable IANA zone, or null. `UTC` and `Etc/UTC` both return `UTC`. */
export function namedZone(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 80) return null;
  if (value === "UTC" || value === "Etc/UTC" || value === "Etc/Universal") return "UTC";
  if (good.has(value)) return value;
  if (bad.has(value)) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(0);
    good.add(value);
    return value;
  } catch {
    bad.add(value);
    return null;
  }
}

/** Spec zone, or UTC when the spec omits it or names a zone Intl rejects. */
export function zoneOf(spec: { timezone?: unknown }): string {
  return namedZone(spec.timezone) ?? "UTC";
}

/** A date, or a date and a clock time, with no `Z` and no offset. */
const BARE = /^\d{4}(-\d\d){2}([T ][\d:.]+)?$/;

/** Epoch millis for a date string, with a string that has no offset read as UTC. Never the host zone. */
export function utcTime(value: string): number {
  return Date.parse(value.length > 10 && BARE.test(value) ? value.replace(" ", "T") + "Z" : value);
}

/**
 * Epoch millis for a date string. `2026-11-27`, `2026-11-27T07:40` and
 * `2026-11-27 07:40:15.5` carry no offset, so they are clock time in `zone`,
 * never in the host zone. A string with `Z` or an offset is that instant.
 * A clock time skipped by a DST jump moves forward by the jump. One that
 * happens twice is the first of the two.
 */
export function parseTime(value: string, zone: string): number {
  const utc = utcTime(value);
  if (zone === "UTC" || utc !== utc || !BARE.test(value)) return utc;
  // Try the offset a day before, then a day after. Neither fits inside a DST gap.
  const before = zoneOffset(utc - 86400000, zone);
  const first = utc - before;
  if (zoneOffset(first, zone) === before) return first;
  const after = zoneOffset(utc + 86400000, zone);
  return zoneOffset(utc - after, zone) === after ? utc - after : first;
}

/**
 * Epoch millis for a date string or a large numeric timestamp. Pass `utcTime`,
 * or `parseTime` bound to the spec zone, as `parse`. The `Date.parse` default
 * reads a string with no offset in the host zone. Only the hover tooltip still
 * uses it, because its bundle has no room for the parser.
 */
export function instantOf(value: unknown, parse: (text: string) => number = Date.parse): number | null {
  if (typeof value === "number" && Number.isFinite(value) && Math.abs(value) > 1e11) return value;
  if (typeof value === "string" && /\d{4}-\d{2}-\d{2}/.test(value)) {
    const ms = parse(value);
    if (Number.isFinite(ms)) return ms;
  }
  return null;
}

/** Tick format for a span: 0 time, 1 month and day, 2 month and year, 3 year. */
export function timeLevel(span: number): number {
  return span < 1728e5 ? 0 : span < 6048e6 ? 1 : span < 6912e7 ? 2 : 3;
}

/** Tick text in `zone` at one level. Level 4 is date and time. The UTC en-US path stays in the cartesian formatter. */
export function zonedText(ms: number, level: number, locale: string, zone: string): string {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "";
  const options: Intl.DateTimeFormatOptions = { timeZone: zone };
  // Time on 0 and 4, day on 1 and 4, month on 1, 2 and 4, year on 2 and 3.
  if (!(level % 4)) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    if (locale === "en-US") options.hourCycle = "h12";
  }
  if (level % 3 === 1) options.day = "numeric";
  if (level % 3) options.month = "short";
  if (level >> 1 === 1) options.year = "numeric";
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/** Tick text in `zone` for one value, at the level the span picks. */
export function formatZoned(ms: number, span: number, locale: string, zone: string): string {
  return zonedText(ms, timeLevel(span), locale, zone);
}

/**
 * Labels for a whole axis. Starts at the level the span picks and moves to a
 * finer one while two ticks would read the same: year, month and year, month
 * and day. The last step shows the date at midnight on the `zone` clock and
 * date with time on every other tick.
 */
export function distinctLabels(values: number[], span: number, zone: string, text: (ms: number, level: number) => string): string[] {
  // The start is `timeLevel(span)`, written out so a bundle with only this function stays small.
  for (let level = span < 1728e5 ? 0 : span < 6048e6 ? 1 : span < 6912e7 ? 2 : 3; ; level = level > 1 ? level - 1 : 4) {
    // Midnight on the zone clock: the clock reading, taken as UTC, is a whole day.
    const labels = values.map((value) => text(value, level > 3 && (value + zoneOffset(value, zone)) % 86400000 === 0 ? 1 : level));
    if (level > 3 || new Set(labels).size === labels.length) return labels;
  }
}

const MINUTE = 60000;
const HOUR_STEPS = [60, 120, 180, 240, 360, 720, 1440, 2880, 10080, 43200, 129600, 525600];
const FINE_STEPS = [1, 5, 15, 30, 60, 120, 180, 360, 720, 1440];

interface Wall {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** One clock per zone. Building one for every data point is the slow part of reading a column. */
const clocks: Record<string, Intl.DateTimeFormat> = {};

function wall(ms: number, zone: string): Wall {
  const bag: Record<string, number> = {};
  const clock = (clocks[zone] ||= new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }));
  for (const part of clock.formatToParts(ms)) {
    if (part.type !== "literal") bag[part.type] = Number(part.value);
  }
  return {
    year: bag.year,
    month: bag.month,
    day: bag.day,
    hour: bag.hour === 24 ? 0 : bag.hour,
    minute: bag.minute,
    second: bag.second,
  };
}

/** How far the `zone` clock is ahead of UTC at `ms`, in millis. Negative west of Greenwich. */
export function zoneOffset(ms: number, zone: string): number {
  // The clock reads whole seconds, so the instant is cut to the second it falls in.
  const p = wall(ms, zone);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
}

/** UTC instant for a wall-clock time, or null when that clock time does not exist. */
function wallUtc(year: number, month: number, day: number, hour: number, minute: number, zone: string): number | null {
  let utc = Date.UTC(year, month - 1, day, hour, minute) - zoneOffset(Date.UTC(year, month - 1, day, hour, minute), zone);
  for (let i = 0; i < 3; i++) {
    const next = Date.UTC(year, month - 1, day, hour, minute) - zoneOffset(utc, zone);
    if (next === utc) break;
    utc = next;
  }
  const p = wall(utc, zone);
  return p.year === year && p.month === month && p.day === day && p.hour === hour && p.minute === minute ? utc : null;
}

/**
 * Ticks on the zone clock. Spans of a couple of hours or more land on whole hours.
 * The grid stays aligned to local midnight, and a missing hour is skipped.
 */
export function zonedTimeTicks(min: number, max: number, count: number, zone: string): number[] {
  const span = max - min || 1;
  const steps = span >= 2 * 3600000 ? HOUR_STEPS : FINE_STEPS;
  const budget = Math.max(2, count);
  let step = steps[steps.length - 1];
  for (let i = 0; i < steps.length; i++) {
    if (span / (steps[i] * MINUTE) <= budget + 1) {
      step = steps[i];
      break;
    }
  }
  const origin = wall(min, zone);
  let day = Date.UTC(origin.year, origin.month - 1, origin.day) - 86400000;
  const out: number[] = [];
  const dayStep = step >= 1440 ? Math.max(1, Math.round(step / 1440)) : 1;
  const guards = Math.ceil(span / 86400000) + 3;
  const finish = (ticks: number[]) => {
    if (ticks.length && span >= 2 * 86400000 && max - ticks[ticks.length - 1] > 60000) ticks.push(max);
    return ticks.length ? ticks : [min, max];
  };
  for (let guard = 0; guard < guards; guard++) {
    const date = new Date(day);
    for (let minute = 0; minute < 1440; minute += step) {
      const hit = wallUtc(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), Math.floor(minute / 60), minute % 60, zone);
      if (hit === null || hit < min) continue;
      if (hit > max) return finish(out);
      out.push(hit);
    }
    day += dayStep * 86400000;
  }
  return finish(out);
}

/** Tooltip instant. Date and time, in the spec zone, never the host zone. */
export function formatInstant(ms: number, locale: string, zone: string): string {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "";
  const options: Intl.DateTimeFormatOptions = {
    timeZone: zone,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  if (locale === "en-US") options.hourCycle = "h12";
  return new Intl.DateTimeFormat(locale, options).format(date);
}
