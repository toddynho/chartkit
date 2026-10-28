/** Intl presets from the spec. No custom function formatters. */

interface Fmt {
  style: string;
  decimals?: number;
  /** Set when the spec asked for a minimum. Axis ticks then keep the fraction digits. */
  minimumFractionDigits?: number;
  currency?: string;
  prefix?: string;
  suffix?: string;
  signed?: boolean;
  /** Thousands separators. A specifier without a comma turns them off. */
  group?: boolean;
}

/** `.2f`, `,.0f`, `$,.0f`, `.1%`, `.2e`, `+.1f`, and `s`. Null when it is not a specifier. */
export function parseSpecifier(source: string): Fmt | null {
  const match = /^([+ ])?(\$)?(,)?(?:\.(\d+))?([fdegs%])$/.exec(source.trim());
  if (!match) return null;
  const signed = match[1] === "+";
  const dollar = match[2] === "$";
  const group = match[3] === ",";
  const decimals = match[4] !== undefined ? Number(match[4]) : undefined;
  const type = match[5];
  const prefix = dollar ? "$" : undefined;
  if (type === "s") return { style: "compact", decimals, signed, prefix, group };
  if (type === "%") return { style: "percent", decimals: decimals ?? 0, signed, group };
  if (type === "e" || type === "g") return { style: "exponent", decimals: decimals ?? 0, signed, prefix, group };
  if (type === "d") return { style: "integer", signed, prefix, group };
  return { style: "number", decimals, signed, prefix, group: group || false };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalize(format: unknown): Fmt {
  if (typeof format === "string") return parseSpecifier(format) ?? { style: format };
  if (isRecord(format) && typeof format.specifier === "string") {
    const parsed = parseSpecifier(format.specifier);
    if (parsed) {
      if (typeof format.prefix === "string") parsed.prefix = format.prefix;
      if (typeof format.suffix === "string") parsed.suffix = format.suffix;
      if (format.signed === true) parsed.signed = true;
      return parsed;
    }
  }
  if (isRecord(format) && typeof format.style === "string") {
    return {
      style: format.style,
      decimals: typeof format.decimals === "number" ? format.decimals : undefined,
      minimumFractionDigits: typeof format.minimumFractionDigits === "number" ? format.minimumFractionDigits : undefined,
      currency: typeof format.currency === "string" ? format.currency : undefined,
      prefix: typeof format.prefix === "string" ? format.prefix : undefined,
      suffix: typeof format.suffix === "string" ? format.suffix : undefined,
      signed: format.signed === true,
    };
  }
  return { style: "number" };
}

function digits(fmt: Fmt, fallback: number): { minimumFractionDigits?: number; maximumFractionDigits: number } {
  if (fmt.decimals !== undefined) return { minimumFractionDigits: fmt.decimals, maximumFractionDigits: fmt.decimals };
  if (fmt.minimumFractionDigits !== undefined) {
    return { minimumFractionDigits: fmt.minimumFractionDigits, maximumFractionDigits: Math.max(fmt.minimumFractionDigits, fallback) };
  }
  return { maximumFractionDigits: fallback };
}

/** Negative zero formats as zero. Intl currency otherwise prints a minus. */
function zero(value: number): number {
  return Object.is(value, -0) || value === 0 ? 0 : value;
}

function formatBytes(value: number): string {
  const sign = value < 0 ? "-" : "";
  let abs = Math.abs(value);
  let index = 0;
  while (abs >= 1024 && index < 4) abs /= 1024, index++;
  const rounded = abs >= 10 || !index ? Math.round(abs) : Math.round(abs * 10) / 10;
  return `${sign}${rounded} ${["B", "KB", "MB", "GB", "TB"][index]}`;
}

function formatDuration(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const step = abs < 1e3 ? 1 : abs < 6e4 ? 1e3 : abs < 36e5 ? 6e4 : 36e5;
  const n = abs / step;
  return sign + (step === 1 ? Math.round(abs) : Math.round(n * 10) / 10) + (step === 1 ? "ms" : step === 1e3 ? "s" : step === 6e4 ? "m" : "h");
}

/** Minutes and seconds together: 144000 → `2m 24s`. Hours join in when the span reaches one hour. */
function formatDurationHm(value: number): string {
  const sign = value < 0 ? "-" : "";
  let seconds = Math.round(Math.abs(value) / 1000);
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  if (hours > 0) return seconds ? `${sign}${hours}h ${minutes}m ${seconds}s` : `${sign}${hours}h ${minutes}m`;
  return `${sign}${minutes}m ${seconds}s`;
}

const numberFormats = new Map<string, Intl.NumberFormat>();
const dateFormats = new Map<string, Intl.DateTimeFormat>();

function numberFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}\0${JSON.stringify(options)}`;
  const hit = numberFormats.get(key);
  if (hit) return hit;
  const format = new Intl.NumberFormat(locale, options);
  numberFormats.set(key, format);
  return format;
}

function dateFormat(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}\0${JSON.stringify(options)}`;
  const hit = dateFormats.get(key);
  if (hit) return hit;
  const format = new Intl.DateTimeFormat(locale, options);
  dateFormats.set(key, format);
  return format;
}

function formatDate(value: number, style: string, locale: string, zone: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const options: Intl.DateTimeFormatOptions = { timeZone: zone || "UTC" };
  const dateish = style === "date" || style === "datetime";
  if (dateish || style === "year") options.year = "numeric";
  if (dateish || style === "month") options.month = "short";
  if (dateish) options.day = "numeric";
  if (style === "time" || style === "datetime") {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }
  if (style === "weekday") options.weekday = "short";
  return dateFormat(locale, options).format(date);
}

function body(value: number, fmt: Fmt, locale: string, zone: string): string {
  value = zero(value);
  const style = fmt.style;
  if (style === "bytes") return formatBytes(value);
  if (style === "duration-ms") return formatDuration(value);
  if (style === "duration-hm") return formatDurationHm(value);
  if (style === "date" || style === "time" || style === "datetime" || style === "month" || style === "year" || style === "weekday") {
    return formatDate(value, style, locale, zone);
  }
  if (style === "exponent") return value.toExponential(fmt.decimals ?? 0);
  if (style === "integer") {
    return numberFormat(locale, { maximumFractionDigits: 0, useGrouping: fmt.group === false ? false : undefined }).format(value);
  }
  const options: Intl.NumberFormatOptions = digits(fmt, style === "compact" || style === "percent" || style === "percent-raw" ? 1 : 2);
  if (fmt.group === false) options.useGrouping = false;
  else if (fmt.group === true) options.useGrouping = true;
  if (style === "compact") options.notation = "compact";
  else if (style === "percent" || style === "percent-raw") options.style = "percent";
  else if (style === "currency") {
    options.style = "currency";
    options.currency = fmt.currency ?? "USD";
  }
  return numberFormat(locale, options).format(style === "percent-raw" ? value / 100 : value);
}

function fractionsLocked(fmt: Fmt): boolean {
  return fmt.decimals !== undefined || fmt.minimumFractionDigits !== undefined;
}

function allWhole(ticks: ArrayLike<number>): boolean {
  let seen = false;
  for (let i = 0; i < ticks.length; i++) {
    const value = ticks[i];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    seen = true;
    if (!Number.isInteger(zero(value))) return false;
  }
  return seen;
}

/**
 * Axis ticks. When every tick is a whole number and the format did not set
 * `decimals` or `minimumFractionDigits`, drop the trailing fraction (`£10,000`).
 * Mark labels keep `formatValue`, so they stay at the encoding precision.
 */
export function formatAxisValue(value: number, format: unknown, locale: string, ticks: ArrayLike<number>, zone = "UTC"): string {
  const fmt = normalize(format);
  const numeric = fmt.style === "number" || fmt.style === "currency" || fmt.style === "percent" || fmt.style === "percent-raw" || fmt.style === "compact";
  if (numeric && !fractionsLocked(fmt) && allWhole(ticks)) {
    const base = isRecord(format) ? format : { style: fmt.style };
    return formatValue(value, { ...base, decimals: 0 }, locale, zone);
  }
  return formatValue(value, format, locale, zone);
}

/** Format a number with a spec preset or format object. `zone` is UTC unless the spec set one. */
export function formatValue(value: number, format: unknown, locale: string, zone = "UTC"): string {
  const fmt = normalize(format);
  let text = body(zero(value), fmt, locale, zone);
  if (fmt.signed && value > 0 && !text.startsWith("+")) text = `+${text}`;
  return `${fmt.prefix ?? ""}${text}${fmt.suffix ?? ""}`;
}
