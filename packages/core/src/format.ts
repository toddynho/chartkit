/** Intl presets from the spec. No custom function formatters. */

interface Fmt {
  style: string;
  decimals?: number;
  currency?: string;
  prefix?: string;
  suffix?: string;
  signed?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalize(format: unknown): Fmt {
  if (typeof format === "string") return { style: format };
  if (isRecord(format) && typeof format.style === "string") {
    return {
      style: format.style,
      decimals: typeof format.decimals === "number" ? format.decimals : undefined,
      currency: typeof format.currency === "string" ? format.currency : undefined,
      prefix: typeof format.prefix === "string" ? format.prefix : undefined,
      suffix: typeof format.suffix === "string" ? format.suffix : undefined,
      signed: format.signed === true,
    };
  }
  return { style: "number" };
}

function digits(fmt: Fmt, fallback: number): { minimumFractionDigits?: number; maximumFractionDigits: number } {
  if (fmt.decimals === undefined) return { maximumFractionDigits: fallback };
  return { minimumFractionDigits: fmt.decimals, maximumFractionDigits: fmt.decimals };
}

function formatBytes(value: number): string {
  const sign = value < 0 ? "-" : "";
  let abs = Math.abs(value);
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  while (abs >= 1024 && index < units.length - 1) {
    abs /= 1024;
    index += 1;
  }
  const rounded = abs >= 10 || index === 0 ? Math.round(abs) : Math.round(abs * 10) / 10;
  return `${sign}${rounded} ${units[index]}`;
}

function formatDuration(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const trim = (n: number) => String(Math.round(n * 10) / 10);
  if (abs < 1000) return `${sign}${Math.round(abs)}ms`;
  if (abs < 60_000) return `${sign}${trim(abs / 1000)}s`;
  if (abs < 3_600_000) return `${sign}${trim(abs / 60_000)}m`;
  return `${sign}${trim(abs / 3_600_000)}h`;
}

function formatDate(value: number, style: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const options: Intl.DateTimeFormatOptions = { timeZone: "UTC" };
  if (style === "date") {
    options.year = "numeric";
    options.month = "short";
    options.day = "numeric";
  } else if (style === "time") {
    options.hour = "2-digit";
    options.minute = "2-digit";
  } else if (style === "datetime") {
    options.year = "numeric";
    options.month = "short";
    options.day = "numeric";
    options.hour = "2-digit";
    options.minute = "2-digit";
  } else if (style === "month") options.month = "short";
  else if (style === "year") options.year = "numeric";
  else if (style === "weekday") options.weekday = "short";
  return new Intl.DateTimeFormat(locale, options).format(date);
}

function body(value: number, fmt: Fmt, locale: string): string {
  const style = fmt.style;
  if (style === "bytes") return formatBytes(value);
  if (style === "duration-ms") return formatDuration(value);
  if (style === "date" || style === "time" || style === "datetime" || style === "month" || style === "year" || style === "weekday") {
    return formatDate(value, style, locale);
  }
  if (style === "integer") return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
  const options: Intl.NumberFormatOptions = digits(fmt, style === "compact" || style === "percent" || style === "percent-raw" ? 1 : 2);
  if (style === "compact") options.notation = "compact";
  else if (style === "percent" || style === "percent-raw") options.style = "percent";
  else if (style === "currency") {
    options.style = "currency";
    options.currency = fmt.currency ?? "USD";
  }
  return new Intl.NumberFormat(locale, options).format(style === "percent-raw" ? value / 100 : value);
}

/** Format a number with a spec preset or format object. */
export function formatValue(value: number, format: unknown, locale: string): string {
  const fmt = normalize(format);
  let text = body(value, fmt, locale);
  if (fmt.signed && value > 0 && !text.startsWith("+")) text = `+${text}`;
  return `${fmt.prefix ?? ""}${text}${fmt.suffix ?? ""}`;
}
