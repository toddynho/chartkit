import { describe, expect, it } from "vitest";
import { render } from "../extra";

/**
 * No two tick labels on an automatic temporal axis read the same, and none is
 * clipped or laid over its neighbour. Everything here is read back from the SVG.
 */

const HOUR = 3600000;
const DAY = 24 * HOUR;
const alt = "Readings over several days.";

interface Label {
  text: string;
  left: number;
  right: number;
}

/** Labels on the bottom axis with the box each one covers, at the 6.4px a character the renderer lays out with. */
function bottomLabels(svg: string): { labels: Label[]; width: number } {
  const width = Number(/viewBox="0 0 (\d+(?:\.\d+)?) /.exec(svg)?.[1]);
  const texts = [...svg.matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)].map((match) => {
    const x = Number(/\bx="([^"]+)"/.exec(match[1])?.[1]);
    const y = Number(/\by="([^"]+)"/.exec(match[1])?.[1]);
    const anchor = /text-anchor="([^"]+)"/.exec(match[1])?.[1] ?? "start";
    const size = match[2].length * 6.4;
    const left = anchor === "middle" ? x - size / 2 : anchor === "end" ? x - size : x;
    return { text: match[2], y, left, right: left + size };
  });
  const floor = Math.max(...texts.map((item) => item.y));
  return { labels: texts.filter((item) => item.y === floor).sort((a, b) => a.left - b.left), width };
}

/** The UTC instant an en-US label names: `Nov 26`, `Nov 25, 12:00 PM` or `09:00 AM`. */
function instant(label: string, year = 2026): number {
  const match = /^([A-Z][a-z]{2}) (\d{1,2})(?:, (\d{2}):(\d{2}) ([AP]M))?$/.exec(label);
  if (!match) throw new Error(`Not a date label: ${label}`);
  const month = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(match[1]) / 3;
  const hour = match[3] ? (Number(match[3]) % 12) + (match[5] === "PM" ? 12 : 0) : 0;
  return Date.UTC(year, month, Number(match[2]), hour, Number(match[4] ?? 0));
}

function series(start: string, end: string, every: number): { t: string; v: number }[] {
  const out: { t: string; v: number }[] = [];
  for (let at = Date.parse(start), i = 0; at <= Date.parse(end); at += every, i++) out.push({ t: new Date(at).toISOString(), v: 10 + ((i * 7) % 13) });
  return out;
}

const lineOf = (data: unknown[], more: Record<string, unknown> = {}) => ({
  version: "1",
  type: "line",
  data,
  encoding: { x: { field: "t", type: "temporal" }, y: "v" },
  a11y: { alt },
  ...more,
});

function expectClear(svg: string, atLeast = 2): Label[] {
  const { labels, width } = bottomLabels(svg);
  expect(labels.length).toBeGreaterThanOrEqual(atLeast);
  const texts = labels.map((label) => label.text);
  expect(new Set(texts).size, `duplicate in ${texts.join(" | ")}`).toBe(texts.length);
  for (let i = 0; i < labels.length; i++) {
    expect(labels[i].left, `${labels[i].text} starts inside the view box`).toBeGreaterThanOrEqual(0);
    expect(labels[i].right, `${labels[i].text} ends inside the view box`).toBeLessThanOrEqual(width);
    if (i) expect(labels[i].left, `${labels[i - 1].text} and ${labels[i].text} do not overlap`).toBeGreaterThanOrEqual(labels[i - 1].right);
  }
  return labels;
}

/** Smallest step between neighbouring labels, which is the tick interval when no label was dropped. */
function interval(labels: Label[]): number {
  let step = Infinity;
  for (let i = 1; i < labels.length; i++) step = Math.min(step, instant(labels[i].text) - instant(labels[i - 1].text));
  return step;
}

const repro = ["2026-11-25T08:30Z", "2026-11-25T20:10Z", "2026-11-26T08:00Z", "2026-11-26T21:00Z", "2026-11-27T08:30Z", "2026-11-27T19:45Z"].map((t, v) => ({ t, v }));

describe("distinct temporal tick labels", () => {
  it("tells the ticks of the reported chart apart", () => {
    const labels = expectClear(render(lineOf(repro)) ?? "");
    expect(labels.map((label) => label.text)).toEqual(["Nov 25, 12:00 PM", "Nov 26", "Nov 26, 12:00 PM", "Nov 27", "Nov 27, 12:00 PM"]);
    expect(interval(labels)).toBe(12 * HOUR);
  });

  it("keeps every label distinct and clear at 1 hour ticks over three days", () => {
    const svg = render(lineOf(series("2026-11-25T00:00Z", "2026-11-27T12:00Z", HOUR), { size: { width: 10000, height: 320 } })) ?? "";
    const labels = expectClear(svg);
    expect(interval(labels)).toBe(HOUR);
    expect(labels.length).toBe(61);
    expect(labels.slice(0, 2).map((label) => label.text)).toEqual(["Nov 25", "Nov 25, 01:00 AM"]);
    expect(labels.map((label) => label.text)).toContain("Nov 26");
  });

  it("keeps every label distinct and clear at 6 hour ticks", () => {
    const wide = expectClear(render(lineOf(repro, { size: { width: 1200, height: 320 } })) ?? "");
    expect(interval(wide)).toBe(6 * HOUR);
    expect(wide.map((label) => label.text)).toEqual(["Nov 25, 12:00 PM", "Nov 25, 06:00 PM", "Nov 26", "Nov 26, 06:00 AM", "Nov 26, 12:00 PM", "Nov 26, 06:00 PM", "Nov 27", "Nov 27, 06:00 AM", "Nov 27, 06:00 PM"]);
    const dayAndHalf = expectClear(render(lineOf(series("2026-11-25T03:00Z", "2026-11-26T15:00Z", HOUR), { size: { width: 1200, height: 320 } })) ?? "");
    expect(interval(dayAndHalf)).toBe(6 * HOUR);
    expect(dayAndHalf.map((label) => label.text)).toContain("Nov 26");
  });

  it("keeps every label distinct and clear at 12 hour ticks over two and a half days", () => {
    const labels = expectClear(render(lineOf(series("2026-11-25T08:30Z", "2026-11-27T19:45Z", HOUR / 4))) ?? "");
    expect(interval(labels)).toBe(12 * HOUR);
    expect(labels.map((label) => label.text)).toEqual(["Nov 25, 12:00 PM", "Nov 26", "Nov 26, 12:00 PM", "Nov 27", "Nov 27, 12:00 PM"]);
  });

  it("keeps every label distinct and clear at 1 day ticks over a week", () => {
    const svg = render(lineOf(series("2026-11-20T08:30Z", "2026-11-26T19:45Z", HOUR / 4))) ?? "";
    const labels = expectClear(svg);
    expect(interval(labels)).toBe(DAY);
    // The data ends at 19:45 on Nov 26. The tick at that instant would repeat "Nov 26", so it is left out.
    expect(labels.map((label) => label.text)).toEqual(["Nov 21", "Nov 22", "Nov 23", "Nov 24", "Nov 25", "Nov 26"]);
  });

  it("uses plain days for daily data instead of days and noons", () => {
    const days = ["2026-11-25", "2026-11-26", "2026-11-27", "2026-11-28"].map((t, v) => ({ t, v }));
    expect(expectClear(render(lineOf(days)) ?? "").map((label) => label.text)).toEqual(["Nov 25", "Nov 26", "Nov 27", "Nov 28"]);
  });

  it.each([320, 480, 640, 900, 1200, 1800])("stays distinct and clear at width %i for spans from hours to years", (width) => {
    const spans: [string, string, number][] = [
      ["2026-11-25T03:00Z", "2026-11-25T21:00Z", HOUR],
      ["2026-11-25T03:00Z", "2026-11-26T15:00Z", HOUR],
      ["2026-11-25T08:30Z", "2026-11-27T19:45Z", HOUR],
      ["2026-11-20T08:30Z", "2026-11-26T19:45Z", HOUR],
      ["2026-10-01T05:00Z", "2026-11-26T19:45Z", 6 * HOUR],
      ["2026-01-01T00:00Z", "2026-04-11T00:00Z", DAY],
      ["2025-03-01T00:00Z", "2026-11-26T00:00Z", DAY],
      ["2021-03-01T00:00Z", "2026-11-26T00:00Z", 7 * DAY],
    ];
    for (const [start, end, every] of spans) {
      for (const timezone of [undefined, "America/New_York", "Asia/Kolkata"]) {
        for (const locale of ["en-US", "de-DE"]) {
          const svg = render(lineOf(series(start, end, every), { size: { width, height: 320 }, locale, ...(timezone ? { timezone } : {}) })) ?? "";
          try {
            // A zoned axis on a narrow chart can thin to one label. That is older than this test and is not checked here.
            expectClear(svg, timezone && width < 640 ? 1 : 2);
          } catch (error) {
            throw new Error(`${start} to ${end}, ${timezone ?? "UTC"}, ${locale}, ${width}px: ${(error as Error).message}`);
          }
        }
      }
    }
  });

  it("names each tick of a 100 day span by its day, not by a repeated month", () => {
    const svg = render(lineOf(series("2026-01-01T00:00Z", "2026-04-11T00:00Z", DAY))) ?? "";
    expect(expectClear(svg).map((label) => label.text)).toEqual(["Jan 1", "Jan 15", "Jan 29", "Feb 12", "Feb 26", "Mar 12", "Mar 26", "Apr 11"]);
  });

  it("keeps the short formats where they were already distinct", () => {
    const hours = render(lineOf(series("2026-11-27T07:40Z", "2026-11-27T22:30Z", HOUR / 2))) ?? "";
    expect(bottomLabels(hours).labels.map((label) => label.text)).toEqual(["09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM", "09:00 PM"]);
    const years = render(lineOf(series("2021-03-01T00:00Z", "2026-11-26T00:00Z", 7 * DAY))) ?? "";
    for (const label of bottomLabels(years).labels) expect(label.text).toMatch(/^\d{4}$/);
  });

  it("lets a format in the spec win, even when it repeats", () => {
    const byDate = render(lineOf(repro, { encoding: { x: { field: "t", type: "temporal", format: "date" }, y: "v" } })) ?? "";
    const dates = bottomLabels(byDate).labels.map((label) => label.text);
    expect(dates.length).toBeGreaterThan(1);
    for (const text of dates) expect(text).toMatch(/^Nov \d{1,2}, 2026$/);
    const byTime = render(lineOf(repro, { encoding: { x: { field: "t", type: "temporal", format: { style: "time" } }, y: "v" } })) ?? "";
    const times = bottomLabels(byTime).labels.map((label) => label.text);
    expect(times.length).toBeGreaterThan(1);
    for (const text of times) expect(text).toMatch(/^\d{2}:\d{2} [AP]M$/);
  });

  it("keeps explicit tick values and labels the ones that share a day apart", () => {
    const values = [0, 6, 12, 18, 24, 30, 36, 42, 48].map((hours) => Date.parse("2026-11-25T12:00Z") + hours * HOUR);
    const svg = render(lineOf(series("2026-11-25T08:30Z", "2026-11-27T19:45Z", HOUR), { size: { width: 1400, height: 320 }, axes: { x: { ticks: values } } })) ?? "";
    const labels = expectClear(svg);
    expect(labels.map((label) => instant(label.text))).toEqual(values);
  });
});
