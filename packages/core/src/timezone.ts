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

/** Epoch millis for an ISO instant or a large numeric timestamp. */
export function instantOf(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && Math.abs(value) > 1e11) return value;
  if (typeof value === "string" && value.length >= 10 && /\d{4}-\d{2}-\d{2}/.test(value)) {
    const ms = Date.parse(value);
    if (Number.isFinite(ms)) return ms;
  }
  return null;
}

/** Tick text in `zone`. The UTC en-US path stays in the cartesian formatter. */
export function formatZoned(ms: number, span: number, locale: string, zone: string): string {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "";
  const options: Intl.DateTimeFormatOptions = { timeZone: zone };
  if (span < 1728e5) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    if (locale === "en-US") options.hourCycle = "h12";
  } else if (span < 6048e6) {
    options.month = "short";
    options.day = "numeric";
  } else if (span < 6912e7) {
    options.month = "short";
    options.year = "numeric";
  } else options.year = "numeric";
  return new Intl.DateTimeFormat(locale, options).format(date);
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

function wall(ms: number, zone: string): Wall {
  const bag: Record<string, number> = {};
  for (const part of new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ms))) {
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

function zoneOffset(ms: number, zone: string): number {
  const p = wall(ms, zone);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ms;
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
