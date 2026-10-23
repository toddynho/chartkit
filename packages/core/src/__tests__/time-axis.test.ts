import { describe, expect, it } from "vitest";
import { line } from "../charts/line";
import { createRenderer } from "../render";
import { formatTimeLabel, timeTicks } from "../renderers/cartesian";
import { zonedTimeTicks } from "../timezone";

const render = createRenderer([line]);

function chart(locale: string, start: number, step: number, count = 24): string {
  const x = new Float64Array(count);
  const y = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    x[i] = start + i * step;
    y[i] = i + 1;
  }
  return render({
    version: "1",
    type: "line",
    data: { columns: { x, y } },
    encoding: { x: { field: "x", type: "temporal" }, y: "y" },
    mark: { curve: "linear", points: "none" },
    size: { width: 640, height: 360 },
    locale,
    a11y: { alt: "Time series" },
  });
}

function labels(svg: string): string[] {
  return [...svg.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((match) => match[1]);
}

describe("time axis", () => {
  it("matches en-US and other-locale Intl labels", () => {
    const start = Date.UTC(2024, 0, 15, 13, 5);
    const step = 5 * 60 * 1000;
    const en = labels(chart("en-US", start, step));
    const de = labels(chart("de-DE", start, step));
    const times = en.filter((label) => /^\d{2}:\d{2} [AP]M$/.test(label));
    expect(times.length).toBeGreaterThan(1);
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });
    for (const label of times) {
      const matched = [0, 15, 30, 45].some((minute) => {
        const hour = Number(label.slice(0, 2)) % 12 + (label.endsWith("PM") ? 12 : 0);
        const utcHour = label.startsWith("12") ? (label.endsWith("AM") ? 0 : 12) : hour;
        return fmt.format(new Date(Date.UTC(2024, 0, 15, utcHour, minute))) === label;
      });
      expect(matched, label).toBe(true);
    }
    const deFmt = new Intl.DateTimeFormat("de-DE", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });
    expect(de).toContain(deFmt.format(new Date(Date.UTC(2024, 0, 15, 13, 15))));
    expect(de.join(" | ")).not.toContain("PM");

    const dayStart = Date.UTC(2024, 8, 1);
    const dayStep = 2 * 24 * 60 * 60 * 1000;
    const dayCount = 20;
    const dayFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" });
    const dayWindow: string[] = [];
    for (let t = dayStart; t <= dayStart + dayStep * (dayCount - 1); t += 24 * 60 * 60 * 1000) dayWindow.push(dayFmt.format(new Date(t)));
    const dayHits = labels(chart("en-US", dayStart, dayStep, dayCount)).filter((label) => dayWindow.includes(label));
    expect(dayHits.length).toBeGreaterThan(1);

    const deDayFmt = new Intl.DateTimeFormat("de-DE", { timeZone: "UTC", month: "short", day: "numeric" });
    const deWindow: string[] = [];
    for (let t = dayStart; t <= dayStart + dayStep * (dayCount - 1); t += 24 * 60 * 60 * 1000) deWindow.push(deDayFmt.format(new Date(t)));
    const deHits = labels(chart("de-DE", dayStart, dayStep, dayCount)).filter((label) => deWindow.includes(label));
    expect(deHits.length).toBeGreaterThan(1);

    const monthStart = Date.UTC(2023, 0, 1);
    const monthStep = 20 * 24 * 60 * 60 * 1000;
    const monthCount = 30;
    const monthFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", year: "numeric" });
    const monthWindow: string[] = [];
    for (let t = monthStart; t <= monthStart + monthStep * (monthCount - 1); t += 24 * 60 * 60 * 1000) {
      monthWindow.push(monthFmt.format(new Date(t)));
    }
    const monthHits = labels(chart("en-US", monthStart, monthStep, monthCount)).filter((label) => monthWindow.includes(label));
    expect(monthHits.length).toBeGreaterThan(1);

    const year = labels(chart("en-US", Date.UTC(2018, 0, 1), 40 * 24 * 60 * 60 * 1000, 40));
    expect(year).toContain("2020");
  });

  it("labels a 30-day UTC span through the last day, and a zoned span reaches the end", () => {
    const min = Date.parse("2025-09-22T00:00:00Z");
    const max = Date.parse("2025-10-21T00:00:00Z");
    const ticks = timeTicks(min, max, 14);
    expect(ticks.length).toBeGreaterThan(12);
    expect(ticks[ticks.length - 1]).toBe(max);
    expect(formatTimeLabel(max, max - min, "en-US", undefined)).toBe("Oct 21");
    const days = Array.from({ length: 30 }, (_, index) => ({
      x: new Date(min + index * 86400000).toISOString().slice(0, 10),
      y: 10 + (index % 4),
    }));
    const wide = labels(render({
      version: "1",
      type: "line",
      data: days,
      encoding: { x: { field: "x", type: "temporal" }, y: "y" },
      mark: { curve: "linear", points: "none" },
      size: { width: 1100, height: 280 },
      a11y: { alt: "Visitors across thirty days." },
    }));
    const dates = wide.filter((label) => /^(Sep|Oct) /.test(label));
    expect(dates.at(-1)).toBe("Oct 21");
    expect(dates).toContain("Oct 17");
    const phone = labels(render({
      version: "1",
      type: "line",
      data: days,
      encoding: { x: { field: "x", type: "temporal" }, y: "y" },
      mark: { curve: "linear", points: "none" },
      size: { width: 360, height: 240 },
      a11y: { alt: "Visitors across thirty days." },
    }));
    expect(phone.filter((label) => /^(Sep|Oct) /.test(label)).at(-1)).toBe("Oct 21");

    const zoned = zonedTimeTicks(min, max, 14, "America/New_York");
    expect(zoned[zoned.length - 1]).toBe(max);
    expect(max - zoned[0]).toBeGreaterThan(20 * 86400000);
  });
});
