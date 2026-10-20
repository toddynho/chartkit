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
