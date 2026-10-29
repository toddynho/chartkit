/**
 * Fixed Soft visual pack.
 *
 * One frozen spec per chart type the catalog can draw, rendered at 640×360
 * in Soft light and Soft dark. Re-running writes the same bytes.
 *
 *   npm run visual:pack
 *
 * Specs live in this file (histogram and box plot rows are copied from
 * packages/core/examples on each run). Renders resolve light-dark() and var()
 * so a file opened on its own shows that mode. PNG uses the Cloud resvg path
 * when that module loads, and is skipped when it does not.
 */
import { mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

process.env.TZ = "UTC";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const visual = join(root, "catalog/visual");
const specDir = join(visual, "specs");
const renderDir = join(visual, "renders");
const examplesDir = join(root, "packages/core/examples");
const WIDTH = 640;
const HEIGHT = 360;
const CARD = { light: "#f5f5f7", dark: "#1c1c1e" };

const ORDER = [
  "version",
  "id",
  "type",
  "title",
  "subtitle",
  "theme",
  "locale",
  "size",
  "metric",
  "data",
  "encoding",
  "mark",
  "axes",
  "legend",
  "annotations",
  "quadrants",
  "layout",
  "a11y",
];

function pack(partial) {
  const spec = { ...partial };
  spec.version = "1";
  spec.id = `soft-${partial.type}`;
  spec.theme = { preset: "soft", tokens: { fontFamily: "Inter" } };
  spec.locale = "en-US";
  spec.size = { width: WIDTH, height: HEIGHT };
  const out = {};
  for (const key of ORDER) if (spec[key] !== undefined) out[key] = spec[key];
  for (const key of Object.keys(spec)) if (out[key] === undefined && spec[key] !== undefined) out[key] = spec[key];
  return out;
}

function fromExample(file, extra = {}) {
  const raw = JSON.parse(readFileSync(join(examplesDir, file), "utf8"));
  delete raw.theme;
  delete raw.size;
  delete raw.id;
  delete raw.locale;
  delete raw.version;
  return pack({ ...raw, ...extra });
}

/**
 * Approximate percent change in state population, 2020 to 2023.
 * Frozen from catalog/lib/geo-samples.ts.
 */
const stateChange = [
  ["AL", 1.9], ["AK", 0.3], ["AZ", 3.8], ["AR", 2.0], ["CA", -0.5], ["CO", 2.2], ["CT", 0.6],
  ["DE", 3.7], ["DC", -0.1], ["FL", 4.7], ["GA", 2.9], ["HI", -0.3], ["ID", 6.2], ["IL", -1.2],
  ["IN", 1.2], ["IA", 0.7], ["KS", 0.4], ["KY", 1.0], ["LA", -0.7], ["ME", 2.4], ["MD", 0.7],
  ["MA", 0.3], ["MI", 0.0], ["MN", 1.0], ["MS", -0.2], ["MO", 0.8], ["MT", 3.5], ["NE", 1.3],
  ["NV", 3.1], ["NH", 2.0], ["NJ", 0.8], ["NM", 0.5], ["NY", -2.1], ["NC", 3.8], ["ND", 1.6],
  ["OH", 0.2], ["OK", 2.0], ["OR", 0.5], ["PA", 0.2], ["RI", 0.5], ["SC", 5.0], ["SD", 3.6],
  ["TN", 3.1], ["TX", 4.3], ["UT", 4.5], ["VT", 0.6], ["VA", 1.3], ["WA", 1.5], ["WV", -1.3],
  ["WI", 0.9], ["WY", 1.0],
];

/** Approximate urban-area population in millions. Frozen from catalog/lib/geo-samples.ts. */
const cities = [
  { name: "Tokyo", lat: 35.7, lon: 139.7, pop: 37.4 },
  { name: "Delhi", lat: 28.6, lon: 77.2, pop: 32.9 },
  { name: "Shanghai", lat: 31.2, lon: 121.5, pop: 29.2 },
  { name: "Dhaka", lat: 23.8, lon: 90.4, pop: 23.2 },
  { name: "São Paulo", lat: -23.6, lon: -46.6, pop: 22.6 },
  { name: "Cairo", lat: 30.0, lon: 31.2, pop: 22.2 },
  { name: "Mexico City", lat: 19.4, lon: -99.1, pop: 22.3 },
  { name: "Beijing", lat: 39.9, lon: 116.4, pop: 21.3 },
  { name: "Mumbai", lat: 19.1, lon: 72.9, pop: 21.3 },
  { name: "Osaka", lat: 34.7, lon: 135.5, pop: 19.0 },
  { name: "New York", lat: 40.7, lon: -74.0, pop: 18.9 },
  { name: "Karachi", lat: 24.9, lon: 67.0, pop: 17.6 },
  { name: "Lagos", lat: 6.5, lon: 3.4, pop: 16.5 },
  { name: "Istanbul", lat: 41.0, lon: 29.0, pop: 16.0 },
  { name: "Buenos Aires", lat: -34.6, lon: -58.4, pop: 15.5 },
  { name: "Kolkata", lat: 22.6, lon: 88.4, pop: 15.3 },
  { name: "Los Angeles", lat: 34.1, lon: -118.2, pop: 12.5 },
  { name: "Moscow", lat: 55.8, lon: 37.6, pop: 12.6 },
  { name: "London", lat: 51.5, lon: -0.1, pop: 9.6 },
  { name: "Paris", lat: 48.9, lon: 2.3, pop: 11.1 },
  { name: "Johannesburg", lat: -26.2, lon: 28.0, pop: 6.1 },
  { name: "Sydney", lat: -33.9, lon: 151.2, pop: 5.3 },
];

function specs() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenue = [42, 46, 44, 51, 58, 55, 63, 61, 70, 74, 72, 81];
  const target = [40, 43, 46, 49, 52, 55, 58, 61, 64, 67, 70, 73];
  return [
    pack({
      type: "line",
      title: "Revenue",
      data: months.map((month, index) => ({ month, revenue: revenue[index], target: target[index] })),
      encoding: {
        x: "month",
        y: [
          { field: "revenue", title: "Revenue", area: true },
          { field: "target", title: "Target", dash: "dashed" },
        ],
      },
      a11y: { alt: "Revenue stays near the target and finishes the year above it, at 81 against a target of 73." },
    }),
    pack({
      type: "bar",
      title: "Traffic by channel",
      data: [
        { month: "Jan", search: 40, direct: 22, social: 12 },
        { month: "Feb", search: 46, direct: 20, social: 16 },
        { month: "Mar", search: 44, direct: 26, social: 18 },
        { month: "Apr", search: 52, direct: 24, social: 15 },
        { month: "May", search: 48, direct: 28, social: 17 },
        { month: "Jun", search: 55, direct: 26, social: 19 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "search", title: "Search" },
          { field: "direct", title: "Direct" },
          { field: "social", title: "Social" },
        ],
      },
      mark: { stack: "stack" },
      a11y: { alt: "Search is the largest channel in every month. The stack is tallest in June." },
    }),
    pack({
      type: "bar-list",
      title: "Payments by method",
      data: [
        { method: "Card", amount: 168400 },
        { method: "Bank", amount: 64200 },
        { method: "Wallet", amount: 28400 },
        { method: "Wire", amount: 22100 },
        { method: "ACH", amount: 18600 },
        { method: "Cash", amount: 9400 },
        { method: "Check", amount: 6100 },
        { method: "Crypto", amount: 2800 },
        { method: "Invoice", amount: 1900 },
        { method: "Gift", amount: 1200 },
        { method: "Points", amount: 800 },
        { method: "Other", amount: 400 },
      ],
      encoding: { x: "method", y: { field: "amount", format: { style: "compact", prefix: "$" } } },
      mark: { track: "row" },
      a11y: { alt: "Card is the largest method at 168 thousand dollars. Crypto is the smallest." },
    }),
    fromExample("29-pie.json", { legend: false }),
    fromExample("04-donut.json", { title: "Sessions by source", legend: { position: "bottom" } }),
    pack({
      type: "stacked-area",
      title: "Spend by team",
      data: [
        { month: "Jan", product: 20, design: 12, support: 8 },
        { month: "Feb", product: 24, design: 11, support: 9 },
        { month: "Mar", product: 22, design: 14, support: 10 },
        { month: "Apr", product: 28, design: 13, support: 11 },
        { month: "May", product: 30, design: 15, support: 12 },
        { month: "Jun", product: 29, design: 16, support: 13 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "product", title: "Product" },
          { field: "design", title: "Design" },
          { field: "support", title: "Support" },
        ],
      },
      a11y: { alt: "Total spend rises from January to June, and product remains the largest share." },
    }),
    pack({
      type: "scatter",
      title: "Yield by temperature",
      data: [
        { temp: 14, yield: 3.1, plot: 8 },
        { temp: 16, yield: 3.8, plot: 10 },
        { temp: 18, yield: 4.1, plot: 11 },
        { temp: 21, yield: 5.2, plot: 16 },
        { temp: 23, yield: 5.0, plot: 14 },
        { temp: 26, yield: 4.2, plot: 12 },
        { temp: 29, yield: 3.4, plot: 9 },
      ],
      encoding: {
        x: { field: "temp", title: "Temperature" },
        y: { field: "yield", title: "Yield" },
        size: { field: "plot", range: [6, 18] },
      },
      legend: false,
      a11y: { alt: "Yield peaks near 21 degrees and falls off at both cooler and hotter temperatures." },
    }),
    pack({
      type: "combo",
      title: "Revenue and margin",
      data: [
        { month: "Jan", revenue: 100, margin: 0.2 },
        { month: "Feb", revenue: 140, margin: 0.24 },
        { month: "Mar", revenue: 130, margin: 0.22 },
        { month: "Apr", revenue: 160, margin: 0.26 },
        { month: "May", revenue: 155, margin: 0.25 },
        { month: "Jun", revenue: 172, margin: 0.28 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "revenue", title: "Revenue", mark: "bar" },
          { field: "margin", title: "Margin", mark: "line", axis: "y2", format: "percent" },
        ],
      },
      axes: { y2: { title: "Margin", format: "percent" } },
      a11y: { alt: "Revenue and margin both finish the half higher than they started." },
    }),
    pack({
      type: "heatmap",
      title: "Requests by hour",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].flatMap((day, dayIndex) =>
        ["6", "8", "10", "12", "14", "16", "18", "20"].map((hour, hourIndex) => ({
          day,
          hour,
          value: [2, 4, 7, 11, 9, 6, 3, 1, 3, 6, 10, 14, 12, 8, 4, 2, 1, 3, 5, 8, 6, 4, 2, 1][(dayIndex * 3 + hourIndex) % 24],
        })),
      ),
      encoding: {
        x: { field: "hour", title: "Hour" },
        y: "day",
        color: { field: "value", type: "quantitative", title: "Requests" },
      },
      mark: { layout: "grid" },
      a11y: { alt: "Weekday middays are the busiest. Early morning and Sunday evening are quiet." },
    }),
    fromExample("09-gauge.json"),
    fromExample("10-kpi.json"),
    pack({
      type: "sparkline",
      title: "Requests",
      data: [1200, 1800, 2100, 1900, 2400, 2600, 2300, 2500, 2700, 2400, 2800, 3000],
      a11y: { alt: "Requests rise from 1,200 to 3,000, with dips in April and August." },
    }),
    pack({
      type: "mini-area",
      title: "Signups",
      data: [40, 55, 48, 62, 70, 66, 80, 92, 88, 104, 110, 126],
      a11y: { alt: "Signups rise from 40 to 126 across the year." },
    }),
    fromExample("15-progress-ring.json"),
    pack({
      type: "spike",
      title: "Blocked requests",
      data: [
        { time: "00", count: 1 }, { time: "01", count: 0 }, { time: "02", count: 0 }, { time: "03", count: 2 },
        { time: "04", count: 0 }, { time: "05", count: 8 }, { time: "06", count: 1 }, { time: "07", count: 0 },
        { time: "08", count: 3 }, { time: "09", count: 14 }, { time: "10", count: 2 }, { time: "11", count: 0 },
        { time: "12", count: 1 }, { time: "13", count: 0 }, { time: "14", count: 6 }, { time: "15", count: 1 },
        { time: "16", count: 0 }, { time: "17", count: 4 }, { time: "18", count: 0 }, { time: "19", count: 9 },
        { time: "20", count: 2 }, { time: "21", count: 1 }, { time: "22", count: 0 }, { time: "23", count: 3 },
      ],
      encoding: { x: "time", y: "count" },
      mark: { baseline: 0 },
      legend: false,
      a11y: { alt: "Blocked requests stay near zero, then spike to 14 at 09 and 9 at 19." },
    }),
    pack({
      type: "candlestick",
      title: "Northstar",
      data: [
        { date: "2026-03-02", open: 101.2, high: 104.0, low: 100.4, close: 103.1, volume: 1820 },
        { date: "2026-03-03", open: 103.1, high: 105.6, low: 102.2, close: 104.8, volume: 1640 },
        { date: "2026-03-04", open: 104.8, high: 106.1, low: 103.0, close: 103.6, volume: 2100 },
        { date: "2026-03-05", open: 103.6, high: 107.4, low: 103.2, close: 106.9, volume: 1980 },
        { date: "2026-03-06", open: 106.9, high: 108.2, low: 104.5, close: 105.1, volume: 2410 },
        { date: "2026-03-09", open: 105.1, high: 105.8, low: 101.6, close: 102.4, volume: 2680 },
        { date: "2026-03-10", open: 102.4, high: 104.9, low: 101.8, close: 104.2, volume: 1760 },
        { date: "2026-03-11", open: 104.2, high: 109.0, low: 103.7, close: 108.4, volume: 3120 },
        { date: "2026-03-12", open: 108.4, high: 110.2, low: 107.1, close: 109.6, volume: 2240 },
        { date: "2026-03-13", open: 109.6, high: 111.0, low: 106.8, close: 107.5, volume: 2530 },
      ],
      encoding: {
        x: { field: "date", type: "temporal" },
        open: "open",
        high: "high",
        low: "low",
        close: "close",
        volume: "volume",
      },
      legend: false,
      a11y: { alt: "The price rises from 101 to a close of 107.5, with a drop on March 9 and a high of 111." },
    }),
    fromExample("16-histogram.json"),
    fromExample("17-boxplot.json"),
    fromExample("18-radar.json"),
    fromExample("19-funnel.json"),
    fromExample("20-treemap.json"),
    fromExample("33-sunburst.json"),
    fromExample("21-sankey.json"),
    fromExample("22-bullet.json", { title: "Quota" }),
    fromExample("23-waterfall.json"),
    fromExample("30-area-range.json"),
    fromExample("31-bar-range.json"),
    fromExample("32-errorbar.json"),
    fromExample("24-gantt.json"),
    fromExample("25-timeline.json"),
    fromExample("26-quadrant.json"),
    fromExample("27-venn.json"),
    pack({
      type: "journey",
      title: "Checkout",
      data: [
        { section: "Browse", step: "Land on the product", score: 5, actors: "Shopper" },
        { section: "Browse", step: "Compare two lamps", score: 4, actors: "Shopper" },
        { section: "Pay", step: "Enter the card", score: 2, actors: "Shopper, Payments" },
        { section: "Pay", step: "Fix a declined card", score: 1, actors: "Shopper, Payments, Support" },
      ],
      encoding: { x: "step", y: "score", series: "section", color: "actors" },
      a11y: { alt: "Checkout is smooth while browsing. Entering the card scores 2, and a declined card scores 1." },
    }),
    fromExample("34-radial-bar.json", { legend: { position: "bottom" } }),
    fromExample("35-rose.json", { legend: false }),
    pack({
      type: "choropleth",
      title: "Population change, 2020–2023",
      data: stateChange.map(([id, change]) => ({ id, change })),
      encoding: { region: "id", color: { field: "change", format: "%", title: "Change" } },
      mark: { atlas: "us", projection: "albersUsa", scale: "diverging" },
      legend: { position: "bottom" },
      a11y: { alt: "Approximate percent change in population from 2020 to 2023. Idaho, Florida, and Texas grew. New York, West Virginia, and Illinois shrank." },
    }),
    pack({
      type: "map-points",
      title: "Largest urban areas",
      data: cities,
      encoding: {
        latitude: "lat",
        longitude: "lon",
        size: { field: "pop", format: { suffix: " million" }, title: "Population" },
        color: "pop",
        label: "name",
      },
      mark: { atlas: "world", projection: "equalEarth", labelCount: 8 },
      legend: { position: "bottom" },
      a11y: { alt: "Approximate urban-area population in millions. The largest cities are labelled." },
    }),
  ];
}

function catalogTypes() {
  const text = readFileSync(join(root, "catalog/lib/specs.ts"), "utf8");
  const start = text.indexOf("export const chartTypes");
  const end = text.indexOf("export const examples");
  const block = text.slice(start, end);
  return [...block.matchAll(/type: "([a-z0-9-]+)"/g)].map((match) => match[1]);
}

function jsonText(spec) {
  return `${JSON.stringify(spec, null, 2)}\n`;
}

function matchingParen(value, open) {
  let depth = 0;
  for (let i = open; i < value.length; i++) {
    if (value[i] === "(") depth += 1;
    else if (value[i] === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function splitTop(inside) {
  let depth = 0;
  let quote = "";
  for (let i = 0; i < inside.length; i++) {
    const ch = inside[i];
    if (quote) {
      if (ch === quote && inside[i - 1] !== "\\") quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    else if (ch === "," && depth === 0) return i;
  }
  return -1;
}

function resolveVars(input) {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    if (input.startsWith("var(", i)) {
      const open = i + 3;
      const end = matchingParen(input, open);
      if (end < 0) {
        out += input[i];
        continue;
      }
      const inside = input.slice(open + 1, end);
      const comma = splitTop(inside);
      const fallback = comma < 0 ? inside : inside.slice(comma + 1);
      out += resolveVars(fallback.trim());
      i = end;
      continue;
    }
    out += input[i];
  }
  return out;
}

function resolveLightDark(input, dark) {
  const token = "light-dark(";
  let out = "";
  for (let i = 0; i < input.length; i++) {
    if (input.startsWith(token, i)) {
      const open = i + token.length - 1;
      const end = matchingParen(input, open);
      if (end < 0) {
        out += input[i];
        continue;
      }
      const inside = input.slice(open + 1, end);
      const comma = splitTop(inside);
      const light = comma < 0 ? inside : inside.slice(0, comma);
      const night = comma < 0 ? inside : inside.slice(comma + 1);
      out += resolveLightDark((dark ? night : light).trim(), dark);
      i = end;
      continue;
    }
    out += input[i];
  }
  return out;
}

function parseColor(input) {
  const value = input.trim();
  if (value === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  const hex = /^#([0-9a-fA-F]{3,8})$/.exec(value);
  if (hex) {
    let body = hex[1];
    if (body.length === 3 || body.length === 4) body = [...body].map((ch) => ch + ch).join("");
    if (body.length !== 6 && body.length !== 8) return null;
    return {
      r: Number.parseInt(body.slice(0, 2), 16),
      g: Number.parseInt(body.slice(2, 4), 16),
      b: Number.parseInt(body.slice(4, 6), 16),
      a: body.length === 8 ? Number.parseInt(body.slice(6, 8), 16) / 255 : 1,
    };
  }
  const modern = /^rgba?\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+)(%)?)?\s*\)$/.exec(value);
  const legacy = /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/.exec(value);
  const match = modern ?? legacy;
  if (!match) return null;
  let alpha = match[4] === undefined ? 1 : Number(match[4]);
  if (modern && match[5] === "%") alpha /= 100;
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: alpha };
}

function formatColor(color) {
  const channel = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  if (color.a >= 0.999) return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
  const a = Math.round(color.a * 1000) / 1000;
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${a})`;
}

function mixColors(a, b, amount) {
  const t = amount / 100;
  return {
    r: a.r * t + b.r * (1 - t),
    g: a.g * t + b.g * (1 - t),
    b: a.b * t + b.b * (1 - t),
    a: a.a * t + b.a * (1 - t),
  };
}

function flattenMix(input) {
  const token = "color-mix(";
  let out = "";
  for (let i = 0; i < input.length; i++) {
    if (input.startsWith(token, i)) {
      const open = i + token.length - 1;
      const end = matchingParen(input, open);
      if (end < 0) {
        out += input[i];
        continue;
      }
      const inside = input.slice(open + 1, end).trim();
      const head = /^in\s+srgb\s*,\s*/.exec(inside);
      if (!head) {
        out += input.slice(i, end + 1);
        i = end;
        continue;
      }
      const rest = inside.slice(head[0].length);
      const comma = splitTop(rest);
      if (comma < 0) {
        out += input.slice(i, end + 1);
        i = end;
        continue;
      }
      const left = rest.slice(0, comma).trim();
      const right = rest.slice(comma + 1).trim();
      const pct = /^(.*)\s+([0-9.]+)%$/.exec(left);
      const colorA = flattenMix(pct ? pct[1].trim() : left);
      const amount = pct ? Number(pct[2]) : 50;
      const colorB = flattenMix(right);
      const a = parseColor(colorA);
      const b = parseColor(colorB);
      out += a && b ? formatColor(mixColors(a, b, amount)) : input.slice(i, end + 1);
      i = end;
      continue;
    }
    out += input[i];
  }
  return out;
}

function bakeColors(svg, dark) {
  let text = svg;
  for (let pass = 0; pass < 8; pass++) {
    const next = flattenMix(resolveLightDark(resolveVars(text), dark));
    if (next === text) return text;
    text = next;
  }
  return text;
}

function bake(svg, mode) {
  const dark = mode === "dark";
  let text = bakeColors(svg, dark);
  text = text.replace(/font-family\s*:\s*[^;}"]+/g, "font-family:Inter, sans-serif");
  text = text.replace(/font-family="[^"]*"/g, 'font-family="Inter, sans-serif"');
  if (!text.includes("color-scheme:")) text = text.replace("style=\"", `style="color-scheme:${dark ? "dark" : "light"};`);
  const rect = `<rect width="100%" height="100%" fill="${CARD[mode]}" data-ck-card="1"/>`;
  const desc = text.indexOf("</desc>");
  const title = text.indexOf("</title>");
  const at = desc >= 0 ? desc + "</desc>".length : title >= 0 ? title + "</title>".length : -1;
  if (at >= 0) text = text.slice(0, at) + rect + text.slice(at);
  if (!text.endsWith("\n")) text += "\n";
  return text;
}

function svgSize(svg) {
  const width = Number(/^<svg\b[^>]*\bwidth="([0-9.]+)"/.exec(svg)?.[1]);
  const height = Number(/^<svg\b[^>]*\bheight="([0-9.]+)"/.exec(svg)?.[1]);
  return { width, height };
}

function errorText(svg) {
  const text = svg?.match(/<text[^>]*>([^<]*)<\/text>/)?.[1] ?? "did not draw";
  return text.replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

async function loadRenderers() {
  const outdir = join(tmpdir(), "ck-visual-pack");
  mkdirSync(outdir, { recursive: true });
  await build({
    stdin: {
      contents: [
        'export { render } from "./packages/core/src/extra.ts";',
        'export { renderBarList } from "./packages/core/src/charts/bar-list.ts";',
        'export { render as renderGeo } from "./packages/geo/src/render.ts";',
        "",
      ].join("\n"),
      resolveDir: root,
      sourcefile: "visual-pack-entry.ts",
      loader: "ts",
    },
    bundle: true,
    splitting: true,
    format: "esm",
    platform: "node",
    outdir,
    entryNames: "render",
    chunkNames: "chunk-[hash]",
    logLevel: "warning",
    legalComments: "none",
  });
  return import(pathToFileURL(join(outdir, "render.js")).href);
}

async function loadRaster() {
  try {
    const png = await import(pathToFileURL(join(root, "apps/cloud/src/png.ts")).href);
    if (typeof png.rasterize !== "function") return null;
    return png.rasterize;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`PNG skipped: ${message}`);
    return null;
  }
}

async function draw(mod, spec) {
  let svg;
  if (spec.type === "bar-list") svg = mod.renderBarList(spec);
  else if (spec.type === "choropleth" || spec.type === "map-points") svg = await mod.renderGeo(spec);
  else svg = mod.render(spec);
  if (typeof svg !== "string" || !svg.includes("<svg") || svg.includes("ck-chart-error")) {
    throw new Error(errorText(svg));
  }
  if (!svg.includes(`data-ck-type="${spec.type}"`)) throw new Error("rendered svg has no type marker");
  const size = svgSize(svg);
  if (size.width !== WIDTH || size.height !== HEIGHT) {
    throw new Error(`rendered ${size.width}×${size.height}, expected ${WIDTH}×${HEIGHT}`);
  }
  return svg;
}

function clean(dir, keep) {
  for (const name of readdirSync(dir)) {
    if (name === "README.md") continue;
    if (!keep.has(name)) unlinkSync(join(dir, name));
  }
}

function sheetSvg(rows) {
  const pad = 24;
  const labelW = 168;
  const gap = 16;
  const header = 36;
  const width = pad + labelW + gap + WIDTH + gap + WIDTH + pad;
  const height = pad + header + rows.length * (HEIGHT + gap) + pad - gap;
  const lightX = pad + labelW + gap;
  const darkX = lightX + WIDTH + gap;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="100%" height="100%" fill="#e4e4e9"/>`,
    `<text x="${lightX}" y="${pad + 16}" font-family="Inter, sans-serif" font-size="14" fill="#1d1d1f">soft-light</text>`,
    `<text x="${darkX}" y="${pad + 16}" font-family="Inter, sans-serif" font-size="14" fill="#1d1d1f">soft-dark</text>`,
  ];
  rows.forEach((row, index) => {
    const y = pad + header + index * (HEIGHT + gap);
    const labelY = y + HEIGHT / 2;
    parts.push(`<text x="${pad}" y="${labelY}" font-family="Inter, sans-serif" font-size="14" fill="#1d1d1f">${row.type}</text>`);
    parts.push(`<image x="${lightX}" y="${y}" width="${WIDTH}" height="${HEIGHT}" href="data:image/png;base64,${row.light.toString("base64")}"/>`);
    parts.push(`<image x="${darkX}" y="${y}" width="${WIDTH}" height="${HEIGHT}" href="data:image/png;base64,${row.dark.toString("base64")}"/>`);
  });
  parts.push("</svg>");
  return parts.join("");
}

function contactHtml(types) {
  const rows = types
    .map(
      (type) => `  <section class="row">
    <h2>${type}</h2>
    <img src="soft-light/${type}.svg" width="640" height="360" alt="${type}, Soft light">
    <img src="soft-dark/${type}.svg" width="640" height="360" alt="${type}, Soft dark">
  </section>`,
    )
    .join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Soft visual pack</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; background: #e4e4e9; color: #1d1d1f; font: 14px/1.3 Inter, sans-serif; }
  header { padding: 24px 24px 8px; }
  h1 { margin: 0 0 6px; font-size: 20px; font-weight: 600; }
  p { margin: 0; }
  .columns, .row { display: grid; grid-template-columns: 168px 640px 640px; gap: 16px; align-items: center; margin: 0 24px 16px; }
  .columns { margin-top: 16px; font-weight: 600; }
  h2 { margin: 0; font-size: 14px; font-weight: 500; }
  img { display: block; width: 640px; height: 360px; }
</style>
</head>
<body>
<header>
  <h1>Soft visual pack</h1>
  <p>640×360. One frozen spec per chart type. Light card #f5f5f7, dark card #1c1c1e.</p>
</header>
<div class="columns"><span></span><span>soft-light</span><span>soft-dark</span></div>
${rows}
</body>
</html>
`;
}

async function main() {
  const list = specs();
  const types = list.map((spec) => spec.type);
  if (new Set(types).size !== types.length) throw new Error("duplicate chart type in the pack");
  const catalog = catalogTypes();
  const missing = catalog.filter((type) => !types.includes(type));
  if (missing.length) throw new Error(`catalog chart types missing from the pack: ${missing.join(", ")}`);

  const mod = await loadRenderers();
  const rasterize = await loadRaster();
  mkdirSync(specDir, { recursive: true });
  const lightDir = join(renderDir, "soft-light");
  const darkDir = join(renderDir, "soft-dark");
  mkdirSync(lightDir, { recursive: true });
  mkdirSync(darkDir, { recursive: true });

  const rendered = [];
  const skipped = [];
  const sheetRows = [];
  const specKeep = new Set();
  const lightKeep = new Set();
  const darkKeep = new Set();

  for (const spec of list) {
    const type = spec.type;
    try {
      const raw = await draw(mod, spec);
      const light = bake(raw, "light");
      const dark = bake(raw, "dark");
      if (light.includes("light-dark(") || dark.includes("light-dark(")) {
        throw new Error("light-dark() remained after baking");
      }
      writeFileSync(join(specDir, `${type}.json`), jsonText(spec));
      writeFileSync(join(lightDir, `${type}.svg`), light);
      writeFileSync(join(darkDir, `${type}.svg`), dark);
      specKeep.add(`${type}.json`);
      lightKeep.add(`${type}.svg`);
      darkKeep.add(`${type}.svg`);
      let lightPng = null;
      let darkPng = null;
      if (rasterize) {
        lightPng = Buffer.from(await rasterize(light, 2));
        darkPng = Buffer.from(await rasterize(dark, 2));
        writeFileSync(join(lightDir, `${type}.png`), lightPng);
        writeFileSync(join(darkDir, `${type}.png`), darkPng);
        lightKeep.add(`${type}.png`);
        darkKeep.add(`${type}.png`);
        sheetRows.push({ type, light: lightPng, dark: darkPng });
      }
      rendered.push(type);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      skipped.push({ type, reason: message });
      console.warn(`skip ${type}: ${message}`);
    }
  }

  if (!rasterize) {
    for (const name of readdirSync(lightDir)) if (name.endsWith(".png")) lightKeep.add(name);
    for (const name of readdirSync(darkDir)) if (name.endsWith(".png")) darkKeep.add(name);
  }
  clean(specDir, specKeep);
  clean(lightDir, lightKeep);
  clean(darkDir, darkKeep);

  const html = contactHtml(rendered);
  writeFileSync(join(renderDir, "contact-sheet.html"), html);
  const renderKeep = new Set(["contact-sheet.html", "soft-light", "soft-dark"]);
  if (rasterize && sheetRows.length === rendered.length && rendered.length > 0) {
    const png = Buffer.from(await rasterize(sheetSvg(sheetRows), 1));
    writeFileSync(join(renderDir, "contact-sheet.png"), png);
    renderKeep.add("contact-sheet.png");
  } else {
    const stale = join(renderDir, "contact-sheet.png");
    try {
      unlinkSync(stale);
    } catch {
      /* no previous sheet */
    }
  }
  for (const name of readdirSync(renderDir)) {
    if (name === "soft-light" || name === "soft-dark") continue;
    if (!renderKeep.has(name)) unlinkSync(join(renderDir, name));
  }

  const summary = {
    png: Boolean(rasterize),
    rendered,
    skipped,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (skipped.length) process.exitCode = 1;
}

await main();
