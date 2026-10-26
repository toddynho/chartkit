import type { LiveSpec } from "./live-specs";

/**
 * Production-weight rows for docs try-it and the gallery.
 * Core example JSON stays small; only these copies are expanded.
 */

const DAY = 86_400_000;
/** Monday 6 Jan 2025. */
const START = Date.UTC(2025, 0, 6);

function rng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function day(index: number): string {
  return new Date(START + index * DAY).toISOString().slice(0, 10);
}

function monthStart(index: number): string {
  return new Date(Date.UTC(2024, index, 1)).toISOString().slice(0, 10);
}

function round(value: number, digits = 0): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function wave(index: number, base: number, trend: number, amp: number, period: number, noise: number, random: () => number): number {
  const seasonal = Math.sin((index / period) * Math.PI * 2);
  return base + index * trend + seasonal * amp + (random() - 0.5) * noise;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function temporalX(spec: LiveSpec, field: string): void {
  const encoding = isRecord(spec.encoding) ? { ...spec.encoding } : {};
  encoding.x = { field, type: "temporal" };
  spec.encoding = encoding;
}

function alt(spec: LiveSpec, text: string): void {
  const a11y = isRecord(spec.a11y) ? { ...spec.a11y } : {};
  a11y.alt = text;
  spec.a11y = a11y;
}

function series(count: number, seed: number, base: number, trend: number, amp: number, period: number, noise: number): number[] {
  const random = rng(seed);
  return Array.from({ length: count }, (_, index) => Math.max(1, Math.round(wave(index, base, trend, amp, period, noise, random))));
}

const LINE_POINTS = 80;
const BAR_MONTHS = 24;
const HEATMAP_DAYS = 84;
const CANDLE_SESSIONS = 1000;

function lineRows(): Record<string, unknown>[] {
  const random = rng(11);
  return Array.from({ length: LINE_POINTS }, (_, index) => ({
    date: day(index),
    revenue: Math.round(wave(index, 148, 0.85, 22, 7, 14, random)),
  }));
}

function densifyLine(spec: LiveSpec, filled: boolean): void {
  spec.data = lineRows();
  temporalX(spec, "date");
  const mark = isRecord(spec.mark) ? { ...spec.mark } : {};
  mark.points = "none";
  if (filled) mark.area = true;
  spec.mark = mark;
  alt(
    spec,
    filled
      ? "Filled daily revenue across 80 weekdays, rising overall with a weekly dip."
      : "Daily revenue across 80 weekdays, rising from about 150 with a weekly rhythm.",
  );
}

function densify(spec: LiveSpec): void {
  const type = spec.type;
  switch (type) {
    case "line": {
      densifyLine(spec, spec.mark && isRecord(spec.mark) ? spec.mark.area === true : false);
      if (spec.title === "Revenue" || spec.title === undefined) spec.title = "Weekday revenue";
      return;
    }
    case "bar": {
      const random = rng(21);
      spec.data = Array.from({ length: BAR_MONTHS }, (_, index) => ({
        month: monthStart(index),
        signups: Math.round(wave(index, 820, 18, 210, 12, 90, random)),
      }));
      temporalX(spec, "month");
      alt(spec, "Monthly signups across two years, with a seasonal peak and a steady climb.");
      return;
    }
    case "stacked-area": {
      const random = rng(31);
      spec.data = Array.from({ length: LINE_POINTS }, (_, index) => ({
        date: day(index),
        free: Math.round(wave(index, 46, 0.12, 8, 7, 6, random)),
        pro: Math.round(wave(index, 18, 0.42, 6, 7, 5, random)),
      }));
      temporalX(spec, "date");
      alt(spec, "Pro accounts grow faster than free across 80 weekdays, and both keep a weekly rhythm.");
      return;
    }
    case "combo": {
      const random = rng(41);
      spec.data = Array.from({ length: 52 }, (_, index) => ({
        week: day(index * 7),
        revenue: Math.round(wave(index, 96, 1.4, 18, 13, 12, random)),
        margin: round(0.18 + Math.sin(index / 13) * 0.04 + (random() - 0.5) * 0.02, 3),
      }));
      temporalX(spec, "week");
      alt(spec, "Weekly revenue climbs over a year while margin stays near 18 to 24 percent.");
      return;
    }
    case "area-range": {
      const random = rng(51);
      const forecastAt = 50;
      spec.data = Array.from({ length: LINE_POINTS }, (_, index) => {
        const revenue = Math.round(wave(index, 410, 2.2, 28, 14, 16, random));
        const band = index < forecastAt ? null : 28 + (index - forecastAt) * 1.6;
        return {
          date: day(index),
          revenue,
          lo: band === null ? null : Math.round(revenue - band),
          hi: band === null ? null : Math.round(revenue + band),
        };
      });
      temporalX(spec, "date");
      spec.annotations = [{ type: "rule", axis: "x", value: day(forecastAt), label: "forecast" }];
      alt(spec, "Revenue is history for 50 weekdays, then a forecast whose band widens over the next 30.");
      return;
    }
    case "scatter": {
      const random = rng(61);
      const regions = ["NA", "EU", "APAC", "LATAM"];
      spec.data = Array.from({ length: 80 }, () => {
        const employees = 3 + Math.floor(random() * 90);
        const revenue = round(employees * (0.55 + random() * 0.9) + random() * 8, 1);
        const valuation = round(revenue * (0.7 + random() * 1.8), 1);
        const region = regions[Math.floor(random() * regions.length)];
        return { revenue, employees, valuation, region };
      });
      alt(spec, "Eighty companies: headcount, revenue, and valuation, colored by region.");
      return;
    }
    case "heatmap": {
      const random = rng(71);
      spec.data = Array.from({ length: HEATMAP_DAYS }, (_, index) => {
        const weekend = index % 7 >= 5;
        const value = weekend ? Math.round(random() * 3) : Math.round(2 + random() * 9 + Math.sin(index / 7) * 2);
        return { date: day(index), value };
      });
      alt(spec, "Twelve weeks of daily activity. Weekdays run hotter than weekends.");
      return;
    }
    case "candlestick": {
      const random = rng(81);
      let price = 42;
      const rows: Record<string, unknown>[] = [];
      let cursor = 0;
      while (rows.length < CANDLE_SESSIONS) {
        const weekday = new Date(START + cursor * DAY).getUTCDay();
        if (weekday !== 0 && weekday !== 6) {
          const anchor = 42 + rows.length * 0.035;
          const open = round(price, 2);
          const close = round(Math.max(8, open + (anchor - open) * 0.02 + (random() - 0.5) * 1.15), 2);
          const high = round(Math.max(open, close) + random() * 0.55, 2);
          const low = round(Math.min(open, close) - random() * 0.55, 2);
          rows.push({
            date: day(cursor),
            open,
            high,
            low,
            close,
            volume: Math.round(3200 + random() * 9000),
          });
          price = close;
        }
        cursor += 1;
      }
      spec.data = rows;
      alt(spec, "About one thousand sessions. The close drifts upward from 42, with ordinary daily ranges.");
      return;
    }
    case "spike": {
      const random = rng(91);
      spec.data = Array.from({ length: 80 }, (_, index) => {
        const minutes = index * 5;
        const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
        const burst = random() > 0.9;
        const count = burst ? Math.round(10 + random() * 28) : Math.round(random() * 3);
        return { time, count };
      });
      alt(spec, "Blocked requests over 80 five-minute buckets, mostly quiet with a few spikes.");
      return;
    }
    case "sparkline":
    case "mini-area": {
      spec.data = series(80, type === "sparkline" ? 101 : 111, 12, 0.18, 4, 10, 3);
      alt(spec, type === "sparkline" ? "An 80-point sparkline that trends up with a short cycle." : "An 80-point mini area that trends up with a short cycle.");
      return;
    }
    case "kpi": {
      spec.data = series(80, 121, 14, 0.12, 3, 9, 2);
      return;
    }
    case "donut": {
      spec.data = [
        { label: "Search", value: 1840 },
        { label: "Direct", value: 1260 },
        { label: "Social", value: 980 },
        { label: "Email", value: 740 },
        { label: "Referral", value: 610 },
        { label: "Affiliates", value: 420 },
        { label: "Partners", value: 280 },
        { label: "Other", value: 160 },
      ];
      alt(spec, "Search is the largest of eight session sources. Other is the smallest slice.");
      return;
    }
    case "pie": {
      spec.data = [
        { label: "Search", value: 32 },
        { label: "Direct", value: 18 },
        { label: "Social", value: 14 },
        { label: "Email", value: 11 },
        { label: "Referral", value: 9 },
        { label: "Affiliates", value: 7 },
        { label: "Partners", value: 5 },
        { label: "Other", value: 4 },
      ];
      alt(spec, "Search is the largest of eight revenue shares. Other is the smallest slice.");
      return;
    }
    case "histogram":
      return;
    case "boxplot": {
      const regions = ["North", "South", "East", "West", "Central", "Canada", "UK", "DACH"];
      const random = rng(171);
      spec.data = regions.flatMap((region) =>
        Array.from({ length: 24 }, () => ({
          region,
          days: Math.round(18 + random() * 28 + (region.length % 3) * 4),
        })),
      );
      alt(spec, "Days to close for eight regions, twenty-four deals each.");
      return;
    }
    case "radar": {
      spec.data = [
        { spoke: "Speed", car: 7, bike: 5, rail: 8 },
        { spoke: "Handling", car: 6, bike: 8, rail: 5 },
        { spoke: "Comfort", car: 8, bike: 4, rail: 7 },
        { spoke: "Safety", car: 7, bike: 6, rail: 9 },
        { spoke: "Range", car: 5, bike: 7, rail: 8 },
        { spoke: "Cost", car: 3, bike: 8, rail: 6 },
        { spoke: "Cargo", car: 8, bike: 2, rail: 7 },
        { spoke: "Noise", car: 4, bike: 6, rail: 5 },
      ];
      if (isRecord(spec.encoding)) spec.encoding = { ...spec.encoding, y: ["car", "bike", "rail"] };
      alt(spec, "Car, bike, and rail compared on eight traits. Rail leads safety and range.");
      return;
    }
    case "funnel": {
      spec.data = [
        { stage: "Visit", count: 48200 },
        { stage: "Engage", count: 22100 },
        { stage: "Signup", count: 14600 },
        { stage: "Verify", count: 9800 },
        { stage: "Activate", count: 6400 },
        { stage: "Trial", count: 4100 },
        { stage: "Pay", count: 1860 },
        { stage: "Renew", count: 940 },
      ];
      alt(spec, "940 of 48,200 visits renew. The steepest drop is from visit to engage.");
      return;
    }
    case "treemap": {
      const groups: Array<[string, string[]]> = [
        ["Wood", ["Oak", "Pine", "Maple", "Walnut", "Ash", "Cherry"]],
        ["Metal", ["Steel", "Aluminum", "Copper", "Tin", "Brass", "Zinc"]],
        ["Glass", ["Clear", "Tinted", "Laminated", "Mirror", "Frosted", "Wired"]],
        ["Textile", ["Wool", "Linen", "Cotton", "Canvas", "Felt", "Silk"]],
      ];
      const random = rng(131);
      spec.data = groups.flatMap(([group, names]) =>
        names.map((name, index) => ({
          name,
          group,
          size: Math.round(48 - index * 6 + random() * 10),
        })),
      );
      alt(spec, "Four materials, six products each. Oak and steel are the largest tiles.");
      return;
    }
    case "sankey": {
      spec.data = [
        { from: "Ads", to: "Landing", flow: 42 },
        { from: "Ads", to: "Product", flow: 24 },
        { from: "Search", to: "Landing", flow: 36 },
        { from: "Search", to: "Blog", flow: 22 },
        { from: "Search", to: "Product", flow: 16 },
        { from: "Email", to: "Landing", flow: 18 },
        { from: "Email", to: "Blog", flow: 11 },
        { from: "Referral", to: "Product", flow: 14 },
        { from: "Landing", to: "Trial", flow: 40 },
        { from: "Landing", to: "Paid", flow: 22 },
        { from: "Product", to: "Trial", flow: 20 },
        { from: "Product", to: "Paid", flow: 18 },
        { from: "Blog", to: "Trial", flow: 12 },
        { from: "Blog", to: "Paid", flow: 6 },
        { from: "Trial", to: "Paid", flow: 28 },
        { from: "Trial", to: "Churn", flow: 16 },
      ];
      alt(spec, "Ads, search, email, and referral reach paid mostly through landing, product, and trial.");
      return;
    }
    case "waterfall": {
      const steps = [
        ["Open", 120, true],
        ["New logos", 48, false],
        ["Expansion", 22, false],
        ["Services", 14, false],
        ["Churn", -18, false],
        ["Downgrades", -12, false],
        ["Credits", -7, false],
        ["Close", 167, true],
      ] as const;
      spec.data = steps.map(([step, amount, total]) => (total ? { step, amount, total: true } : { step, amount }));
      alt(spec, "The year closes at 167 after three gains and three losses.");
      return;
    }
    case "bullet": {
      spec.data = [
        { name: "Revenue", value: 275, target: 250, poor: 150, ok: 225, good: 300 },
        { name: "Profit", value: 22, target: 27, poor: 15, ok: 25, good: 40 },
        { name: "NPS", value: 46, target: 50, poor: 20, ok: 40, good: 70 },
        { name: "Retention", value: 91, target: 90, poor: 70, ok: 85, good: 97 },
        { name: "Latency", value: 180, target: 150, poor: 250, ok: 180, good: 120 },
        { name: "Uptime", value: 99.92, target: 99.9, poor: 99, ok: 99.5, good: 99.95 },
      ];
      alt(spec, "Six measures against target. Revenue and retention are past target. Profit and NPS are short.");
      return;
    }
    case "errorbar": {
      const random = rng(141);
      const names = ["Control", "A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3", "D1", "D2"];
      spec.data = names.map((assay, index) => {
        const mean = round(16 + index * 0.7 + (random() - 0.5) * 2, 1);
        const spread = round(0.6 + random() * 0.9, 1);
        return { assay, mean, lo: round(mean - spread, 1), hi: round(mean + spread, 1) };
      });
      alt(spec, "Twelve assays. Means step upward, and each whisker stays inside about one unit of the mean.");
      return;
    }
    case "bar-range": {
      spec.data = Array.from({ length: 12 }, (_, index) => {
        const min = round(-4 + Math.sin(((index - 1) / 12) * Math.PI * 2) * 12, 1);
        const max = round(min + 10 + Math.sin((index / 12) * Math.PI * 2) * 4, 1);
        return { month: monthStart(index), min, max };
      });
      temporalX(spec, "month");
      alt(spec, "Monthly temperature range over a year. July is the warmest span.");
      return;
    }
    case "radial-bar": {
      const desks = ["Music", "Talk", "News", "Sky", "Spots", "Ident", "Sport", "Drama", "Kids", "Docs", "Live", "Archive"];
      const random = rng(151);
      spec.data = desks.map((desk) => ({
        desk,
        weeknight: Math.round(12 + random() * 180),
        saturday: Math.round(8 + random() * 200),
      }));
      alt(spec, "Twelve desks, weeknight against Saturday. A few shows run much longer than the rest.");
      return;
    }
    case "rose": {
      const places = ["Hale", "Mill", "Quay", "Ridge", "Yard", "Orchard", "Pier", "Market", "Station", "Green", "Lock", "Common"];
      const random = rng(161);
      spec.data = places.map((place) => ({ place, listeners: Math.round(1200 + random() * 4800) }));
      alt(spec, "Saturday listeners across twelve places. A few sites carry most of the audience.");
      return;
    }
    case "gantt": {
      const extra = [
        { id: "research", task: "Interview customers", section: "Plan", start: "2026-03-02", end: "2026-03-11", progress: 1, status: "done", depends: "spec" },
        { id: "ia", task: "Map the information architecture", section: "Plan", start: "2026-03-10", end: "2026-03-18", progress: 0.7, status: "active", depends: "research" },
        { id: "tokens", task: "Set the design tokens", section: "Plan", start: "2026-03-16", end: "2026-03-24", progress: 0.4, status: "active", depends: "design" },
        { id: "schema", task: "Freeze the schema", section: "Build", start: "2026-03-18", end: "2026-03-27", progress: 0.6, status: "active", depends: "spec" },
        { id: "auth", task: "Add sign-in", section: "Build", start: "2026-03-25", end: "2026-04-08", progress: 0.35, status: "active", depends: "api" },
        { id: "qa", task: "Run the beta checklist", section: "Launch", start: "2026-04-06", end: "2026-04-15", progress: 0.15, status: "active", depends: "beta" },
        { id: "docs", task: "Publish the docs", section: "Launch", start: "2026-04-08", end: "2026-04-16", progress: 0.1, status: "active", depends: "web" },
        { id: "support", task: "Brief support", section: "Launch", start: "2026-04-13", end: "2026-04-17", progress: 0, status: "crit", depends: "docs" },
      ];
      spec.data = [...(Array.isArray(spec.data) ? spec.data : []), ...extra];
      alt(spec, "Northstar has sixteen tasks from spec through support. The web app and the support brief are critical.");
      return;
    }
    case "timeline": {
      const extra = [
        { label: "First hire", date: "2014-09-01", kind: "event" },
        { label: "Seed", date: "2015-02-01", kind: "event" },
        { label: "EU launch", date: "2017-05-01", kind: "event" },
        { label: "Mobile app", start: "2018-06-01", end: "2020-01-01", kind: "period" },
        { label: "SOC 2", date: "2022-04-01", kind: "event" },
        { label: "Enterprise plan", date: "2024-09-01", kind: "event" },
        { label: "Docs rewrite", start: "2025-06-01", end: "2026-01-15", kind: "period" },
      ];
      spec.data = [...(Array.isArray(spec.data) ? spec.data : []), ...extra];
      alt(spec, "Northstar from 2014 to 2026: founding, two rounds, offices, and the platform era.");
      return;
    }
    case "quadrant": {
      spec.data = [
        { name: "SSO", x: 0.18, y: 0.84, size: 16, color: "positive" },
        { name: "Saved replies", x: 0.3, y: 0.68, size: 10, color: "positive" },
        { name: "Keyboard shortcuts", x: 0.22, y: 0.74, size: 8, color: "positive" },
        { name: "CSV import", x: 0.16, y: 0.58, size: 7, color: "positive" },
        { name: "Checkout rewrite", x: 0.8, y: 0.88, size: 18, color: "accent" },
        { name: "Search ranking", x: 0.64, y: 0.72, size: 14, color: "accent" },
        { name: "Billing portal", x: 0.72, y: 0.8, size: 13, color: "accent" },
        { name: "Audit export", x: 0.7, y: 0.62, size: 9, color: "accent" },
        { name: "Dark mode", x: 0.24, y: 0.28, size: 8, color: "muted" },
        { name: "Empty states", x: 0.32, y: 0.22, size: 6, color: "muted" },
        { name: "Icon set", x: 0.14, y: 0.18, size: 5, color: "muted" },
        { name: "PDF export", x: 0.84, y: 0.24, size: 12, color: "negative" },
        { name: "Custom domains", x: 0.78, y: 0.16, size: 9, color: "negative" },
        { name: "Audit log", x: 0.46, y: 0.56, size: 11, color: "accent" },
      ];
      alt(spec, "Fourteen bets. SSO is a quick win. Checkout is a big bet. PDF export is high effort and low impact.");
      return;
    }
    case "sunburst": {
      spec.data = [
        {
          name: "Organic",
          children: [
            { name: "Search", value: 4200 },
            { name: "Referral", value: 1800 },
            { name: "Direct", value: 2460 },
          ],
        },
        {
          name: "Paid",
          children: [
            { name: "Search ads", value: 2600 },
            { name: "Social", value: 940 },
            { name: "Display", value: 610 },
          ],
        },
        {
          name: "Owned",
          children: [
            { name: "Email", value: 1540 },
            { name: "Newsletter", value: 820 },
            { name: "Push", value: 310 },
          ],
        },
        {
          name: "Partner",
          children: [
            { name: "Affiliates", value: 740 },
            { name: "Resellers", value: 480 },
            { name: "Events", value: 220 },
          ],
        },
      ];
      alt(spec, "Organic search is the largest leaf. Partner events are the smallest. Four branches, three leaves each.");
      return;
    }
    case "bar-list": {
      spec.data = [
        { page: "/docs/charts/line", visits: 18420 },
        { page: "/pricing", visits: 15110 },
        { page: "/docs", visits: 12840 },
        { page: "/gallery", visits: 9720 },
        { page: "/docs/charts/bar", visits: 8640 },
        { page: "/cloud", visits: 7410 },
        { page: "/docs/charts/candlestick", visits: 6880 },
        { page: "/playground", visits: 5320 },
        { page: "/docs/charts/heatmap", visits: 4910 },
        { page: "/agents", visits: 3760 },
        { page: "/docs/theming", visits: 2980 },
        { page: "/benchmarks", visits: 2140 },
        { page: "/docs/charts/gantt", visits: 1660 },
        { page: "/showcase", visits: 980 },
      ];
      alt(spec, "Line docs lead fourteen pages. Showcase is the shortest row.");
      return;
    }
    case "journey": {
      spec.data = [
        { section: "Browse", step: "Land on the product", score: 5, actors: "Shopper" },
        { section: "Browse", step: "Filter by room", score: 4, actors: "Shopper" },
        { section: "Browse", step: "Compare two lamps", score: 4, actors: "Shopper" },
        { section: "Browse", step: "Read the reviews", score: 3, actors: "Shopper" },
        { section: "Cart", step: "Add the lamp", score: 5, actors: "Shopper" },
        { section: "Cart", step: "See the shipping date", score: 3, actors: "Shopper" },
        { section: "Cart", step: "Apply a code", score: 2, actors: "Shopper" },
        { section: "Pay", step: "Create an account", score: 2, actors: "Shopper" },
        { section: "Pay", step: "Enter the card", score: 2, actors: "Shopper, Payments" },
        { section: "Pay", step: "Fix a declined card", score: 1, actors: "Shopper, Payments, Support" },
        { section: "Done", step: "See the confirmation", score: 4, actors: "Shopper" },
        { section: "Done", step: "Track the parcel", score: 5, actors: "Shopper" },
      ];
      alt(spec, "Checkout is smooth until payment. A promo code scores 2, and a declined card scores 1.");
      return;
    }
    default:
      return;
  }
}

/** Clone a dressed example and replace its rows with a denser fictional series. */
export function densifyDemo(spec: LiveSpec): LiveSpec {
  const copy = structuredClone(spec);
  densify(copy);
  return copy;
}

export const denseCounts = {
  line: LINE_POINTS,
  bar: BAR_MONTHS,
  heatmap: HEATMAP_DAYS,
  candlestick: CANDLE_SESSIONS,
};
