/** UTC day math shared by gantt and timeline. Dates stay on the calendar day, with no local zone. */

export const DAY = 86_400_000;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function parseDay(value: unknown): number | null {
  if (typeof value === "number" && value > 1e11 && value < 1e14) return Math.round(value);
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const time = Date.UTC(year, month - 1, day);
  const check = new Date(time);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return time;
}

/** A day count. "2w" is fourteen days. "5d" and a bare number are days. */
export function parseDuration(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  if (typeof value !== "string") return null;
  const match = /^(\d+(?:\.\d+)?)([dw])?$/i.exec(value.trim());
  if (!match) return null;
  const count = Number(match[1]);
  if (!Number.isFinite(count) || count < 0) return null;
  return match[2]?.toLowerCase() === "w" ? count * 7 : count;
}

export function formatISO(ms: number): string {
  const date = new Date(ms);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

export function formatDay(ms: number): string {
  const date = new Date(ms);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export function formatMonth(ms: number, withYear: boolean): string {
  const date = new Date(ms);
  const month = MONTHS[date.getUTCMonth()];
  return withYear ? `${month} ${date.getUTCFullYear()}` : month;
}

export function formatYear(ms: number): string {
  return String(new Date(ms).getUTCFullYear());
}

export function monthTicks(min: number, max: number): number[] {
  const start = new Date(min);
  let year = start.getUTCFullYear();
  let month = start.getUTCMonth();
  const out: number[] = [];
  for (let guard = 0; guard < 240; guard++) {
    const time = Date.UTC(year, month, 1);
    if (time > max) break;
    if (time >= min - DAY) out.push(time);
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  return out;
}

export function yearTicks(min: number, max: number): number[] {
  const start = new Date(min).getUTCFullYear();
  const end = new Date(max).getUTCFullYear();
  const out: number[] = [];
  for (let year = start; year <= end; year++) out.push(Date.UTC(year, 0, 1));
  return out;
}
