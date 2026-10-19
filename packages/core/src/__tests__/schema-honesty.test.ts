import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { ValidationResult } from "../diagnostics";
import { render } from "../extra";
import { validate } from "../validate";

const schema = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../schema/chartkit.schema.json"), "utf8")) as SchemaNode;

const alt = "Revenue rose from January to March.";
const rows = [
  { month: "Jan", revenue: 1000, cost: 400, region: "NA", date: "2024-01-01", open: 10, high: 14, low: 9, close: 12, source: "a", target: "b", value: 1000 },
  { month: "Feb", revenue: 3000, cost: 1200, region: "EU", date: "2024-02-01", open: 12, high: 16, low: 11, close: 15, source: "b", target: "c", value: 3000 },
  { month: "Mar", revenue: 1800, cost: 900, region: "NA", date: "2024-03-01", open: 15, high: 18, low: 13, close: 14, source: "a", target: "c", value: 1800 },
];

interface SchemaNode {
  $ref?: string;
  type?: string | string[];
  const?: unknown;
  enum?: unknown[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
  properties?: Record<string, SchemaNode>;
  items?: SchemaNode;
  oneOf?: SchemaNode[];
  anyOf?: SchemaNode[];
  allOf?: SchemaNode[];
  $defs?: Record<string, SchemaNode>;
}

interface Leaf {
  path: string;
  enums: unknown[];
  consts: unknown[];
  types: Set<string>;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  color: boolean;
  children: boolean;
}

interface Host {
  name: string;
  spec: Record<string, unknown>;
  svg: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deref(node: SchemaNode | undefined, guard = 0): SchemaNode | undefined {
  if (!node || guard > 10) return node;
  if (!node.$ref) return node;
  const name = node.$ref.replace("#/$defs/", "");
  const base = deref(schema.$defs?.[name], guard + 1) ?? {};
  const local: SchemaNode = { ...node };
  delete local.$ref;
  return { ...base, ...local };
}

function absorb(leaf: Leaf, node: SchemaNode | undefined): void {
  const resolved = deref(node);
  if (!resolved) return;
  if (resolved.const !== undefined) leaf.consts.push(resolved.const);
  if (Array.isArray(resolved.enum)) leaf.enums.push(...resolved.enum);
  const types = Array.isArray(resolved.type) ? resolved.type : resolved.type ? [resolved.type] : [];
  for (const type of types) leaf.types.add(type);
  if (resolved.pattern) leaf.pattern = resolved.pattern;
  if (typeof resolved.minimum === "number") leaf.minimum = resolved.minimum;
  if (typeof resolved.maximum === "number") leaf.maximum = resolved.maximum;
  if (resolved.$ref?.endsWith("/color") || node?.$ref?.endsWith("/color")) leaf.color = true;
  for (const key of ["oneOf", "anyOf", "allOf"] as const) {
    const list = resolved[key];
    if (Array.isArray(list)) for (const branch of list) absorb(leaf, branch);
  }
}

function collect(): Leaf[] {
  const leaves = new Map<string, Leaf>();
  const hits = new Map<string, number>();
  const visit = (node: SchemaNode | undefined, path: string) => {
    const resolved = deref(node);
    if (!resolved) return;
    const seen = (hits.get(path) ?? 0) + 1;
    if (seen > 6 || path.split("/").length > 16) return;
    hits.set(path, seen);
    if (resolved.properties) {
      for (const [key, child] of Object.entries(resolved.properties)) {
        const childPath = `${path}/${key}`;
        const leaf = leaves.get(childPath) ?? {
          path: childPath,
          enums: [],
          consts: [],
          types: new Set<string>(),
          color: key === "color" || (key === "series" && childPath.includes("/tokens/")),
          children: false,
        };
        absorb(leaf, child);
        const childNode = deref(child);
        leaf.children = Boolean(childNode?.properties) || (childNode?.oneOf ?? childNode?.anyOf ?? []).some((branch) => deref(branch)?.properties);
        leaves.set(childPath, leaf);
        visit(child, childPath);
      }
    }
    if (resolved.items && !Array.isArray(resolved.items)) visit(resolved.items, `${path}/0`);
    for (const key of ["oneOf", "anyOf", "allOf"] as const) {
      const list = resolved[key];
      if (Array.isArray(list)) for (const branch of list) visit(branch, path);
    }
  };
  visit(schema, "");
  return [...leaves.values()];
}

function probes(leaf: Leaf): unknown[] {
  if (leaf.path === "/data") {
    return [[{ month: "Jan", revenue: 5, cost: 1, region: "NA", date: "2024-01-01", open: 8, high: 12, low: 7, close: 11, source: "a", target: "b", value: 5 }]];
  }
  if (leaf.path === "/data/columns") return [{ month: ["Jan", "Feb", "Mar"], revenue: [5, 9, 4], cost: [1, 2, 3] }];
  if (leaf.path === "/annotations") return [[{ type: "rule", axis: "y", value: 2500, label: "Goal" }]];
  const values = [...leaf.enums, ...leaf.consts];
  const out: unknown[] = [];
  const unique = new Set<string>();
  const push = (value: unknown) => {
    const key = JSON.stringify(value);
    if (unique.has(key)) return;
    unique.add(key);
    out.push(value);
  };
  for (const value of values) push(value);
  if (leaf.types.has("boolean")) {
    push(true);
    push(false);
  }
  if (leaf.types.has("integer")) push(leaf.maximum !== undefined && leaf.maximum < 3 ? leaf.maximum : 3);
  if (leaf.types.has("number")) {
    if (leaf.maximum !== undefined && leaf.maximum <= 1) push(leaf.maximum === 0 ? 0 : Math.min(leaf.maximum, 0.2));
    else push(typeof leaf.maximum === "number" ? Math.min(80, leaf.maximum) : 80);
  }
  const fieldPath = /\/encoding\/(x|y|color|size|series|open|high|low|close|volume|source|target)$/.test(leaf.path) || leaf.path.endsWith("/field");
  if (leaf.types.has("string") && values.length === 0) {
    if (leaf.pattern === "^[A-Z]{3}$") push("USD");
    else if (leaf.path.endsWith("/locale")) push("de-DE");
    else if (fieldPath) push("region");
    else if (leaf.color || leaf.path.endsWith("/value") || leaf.path.includes("/tokens/")) push("#c0ffee");
    else if (leaf.pattern) push("ProbeId");
    else push("ProbeLabel");
  }
  if (leaf.path.endsWith("/minHeight")) push(400);
  if (leaf.path === "/metric/target") push(40);
  if (leaf.types.has("array")) {
    if (leaf.path.endsWith("/ticks")) push([1234, 2500]);
    else if (leaf.path.endsWith("/bands")) push([{ from: 0, to: 40, label: "Low", color: "#c0ffee" }]);
    else if (leaf.path.endsWith("/fields")) push([{ field: "revenue", title: "ProbeLabel" }]);
    else if (leaf.path.endsWith("/ranges")) push(["cost"]);
    else if (leaf.path.includes("/color/")) push(["#c0ffee", "#111111"]);
    else if (leaf.path.endsWith("/range") || leaf.path.endsWith("/domain")) push([2, 18]);
    else if (leaf.color || leaf.path.includes("/tokens/")) push(["#c0ffee", "#111111"]);
    else push(["region"]);
  }
  if (leaf.path.endsWith("/domain")) push([500, 4000]);
  if (leaf.path.endsWith("/initialRange")) push([0, 1]);
  if (/^\/axes\/(x|y|y2)$/.test(leaf.path)) push({ title: "ProbeLabel" });
  return out;
}

function annotationSeed(path: string): Record<string, unknown> {
  if (path.endsWith("/from") || path.endsWith("/to") || path.endsWith("/opacity")) return { type: "band", axis: "y", from: 1000, to: 2200, label: "Band" };
  if (path.endsWith("/x") || (path.endsWith("/y") && path.startsWith("/annotations"))) return { type: "text", x: "Feb", y: 2000, label: "Note" };
  return { type: "rule", axis: "y", value: 2500, label: "Goal" };
}

function apply(host: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const spec = structuredClone(host);
  if (path.startsWith("/annotations/")) spec.annotations = [annotationSeed(path)];
  if (path.startsWith("/metric/bands/")) {
    const metric = isRecord(spec.metric) ? spec.metric : { value: 64, label: "Capacity used", min: 0, max: 100 };
    spec.metric = { ...metric, bands: [{ from: 0, to: 100, label: "Low", color: "#c0ffee" }] };
  }
  if (path.startsWith("/metric/deltaFormat") || path === "/metric/goodDirection") {
    const metric = isRecord(spec.metric) ? spec.metric : { value: 64, label: "Capacity used", min: 0, max: 100 };
    spec.metric = { ...metric, delta: metric.delta ?? 5 };
  }
  if (path === "/encoding/size/range" || path === "/encoding/color/range") {
    const encoding = isRecord(spec.encoding) ? spec.encoding : {};
    if (path.endsWith("size/range")) encoding.size = { ...(isRecord(encoding.size) ? encoding.size : {}), field: "revenue" };
    else encoding.color = { field: "region" };
    spec.encoding = encoding;
  }
  if (path === "/size/aspectRatio") {
    const size = isRecord(spec.size) ? spec.size : {};
    spec.size = { ...size, width: 400, height: "auto" };
  }
  const parts = path.split("/").filter(Boolean);
  let cursor: Record<string, unknown> | unknown[] = spec;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i] ?? "";
    const next = parts[i + 1] ?? "";
    const record = cursor as Record<string, unknown>;
    let here = record[key];
    if (Array.isArray(here) && !/^\d+$/.test(next)) {
      if (key === "data") {
        here = { columns: { month: ["Jan", "Feb", "Mar"], revenue: [5, 9, 4] } };
        record[key] = here;
      } else {
        if (here.length === 0) here.push({});
        if (typeof here[0] === "string" || typeof here[0] === "number") here[0] = { field: String(here[0]) };
        if (!isRecord(here[0])) here[0] = {};
        cursor = here[0] as Record<string, unknown>;
        continue;
      }
    }
    if (typeof here === "string") here = next === "value" || next === "range" ? {} : { field: here };
    else if (!isRecord(here) && !Array.isArray(here)) here = /^\d+$/.test(next) ? [] : {};
    if ((key === "format" || key.endsWith("Format")) && isRecord(here)) {
      if (next === "currency") here.style = "currency";
      if (here.style === undefined) here.style = "number";
      if (here.style === "currency" && here.currency === undefined) here.currency = "EUR";
    }
    record[key] = here;
    cursor = here as Record<string, unknown> | unknown[];
  }
  const last = parts[parts.length - 1] ?? "";
  (cursor as Record<string, unknown>)[last] = value;
  return spec;
}

function mentions(diagnosticPath: string | undefined, path: string): boolean {
  if (!diagnosticPath) return false;
  return diagnosticPath === path || diagnosticPath.startsWith(`${path}/`) || path.startsWith(`${diagnosticPath}/`);
}

function warned(result: ValidationResult, path: string): boolean {
  return result.warnings.some((warning) => mentions(warning.path, path));
}

function chart(spec: Record<string, unknown>): string | null {
  try {
    return render(spec);
  } catch {
    return null;
  }
}

function hosts(): Host[] {
  const specs: Array<[string, Record<string, unknown>]> = [
    ["line", { version: "1", type: "line", data: rows, encoding: { x: "month", y: ["revenue", "cost"] }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["number", { version: "1", type: "line", data: rows, encoding: { x: { field: "revenue", type: "quantitative" }, y: { field: "cost", type: "quantitative" } }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["bar", { version: "1", type: "bar", data: rows, encoding: { x: "month", y: ["revenue", "cost"] }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["donut", { version: "1", type: "donut", data: rows, encoding: { x: "month", y: "revenue" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["scatter", { version: "1", type: "scatter", data: rows, encoding: { x: "revenue", y: "cost", color: "region" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["combo", { version: "1", type: "combo", data: rows, encoding: { x: "month", y: [{ field: "revenue", mark: "bar" }, { field: "cost", axis: "y2", mark: "line" }] }, axes: { y2: true }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["heatmap", { version: "1", type: "heatmap", data: rows, encoding: { x: "month", y: "region", color: "revenue" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["split", { version: "1", type: "bar", data: rows, encoding: { x: "month", y: "revenue" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["gauge", { version: "1", type: "gauge", metric: { value: 64, label: "Capacity used", min: 0, max: 100, target: 80 }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["kpi", { version: "1", type: "kpi", metric: { value: 64, label: "Capacity used", min: 0, max: 100 }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["candle", { version: "1", type: "candlestick", data: rows, encoding: { x: "date", open: "open", high: "high", low: "low", close: "close" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["sankey", { version: "1", type: "sankey", data: rows, encoding: { source: "source", target: "target", y: "value" }, a11y: { alt }, size: { width: 420, height: 220 } }],
    ["histogram", { version: "1", type: "histogram", data: rows, encoding: { x: "revenue" }, a11y: { alt }, size: { width: 420, height: 220 } }],
  ];
  const ready: Host[] = [];
  for (const [name, spec] of specs) {
    const result = validate(spec);
    const svg = chart(spec);
    if (!result.ok || !svg || svg.includes("ck-chart-error")) continue;
    ready.push({ name, spec, svg });
  }
  return ready;
}

function covered(leaf: Leaf, ready: Host[]): boolean {
  const values = probes(leaf);
  if (values.length === 0) return leaf.children && !leaf.types.has("boolean") && leaf.enums.length === 0 && leaf.consts.length <= 1;
  for (const value of values) {
    for (const host of ready) {
      const spec = apply(host.spec, leaf.path, value);
      const result = validate(spec);
      if (warned(result, leaf.path)) return true;
      if (!result.ok) continue;
      const svg = chart(spec);
      if (svg && svg !== host.svg) return true;
    }
  }
  return false;
}

describe("schema honesty", () => {
  const line = {
    version: "1",
    type: "line",
    data: rows,
    encoding: { x: "month", y: { field: "revenue", scale: {} } },
    a11y: { alt },
    size: { width: 420, height: 220 },
  };

  it("draws axis titles, tick counts, rotation, side, reverse, padding, min height, and description", () => {
    const titled = render({ ...line, axes: { x: { title: "Month", rotate: -40 }, y: { title: "Revenue", ticks: 3 } } });
    expect(titled).toContain("Month");
    expect(titled).toContain("Revenue");
    expect(titled).toContain("rotate(-40");
    const base = render(line);
    const fewer = render({ ...line, axes: { y: { ticks: 2 } } });
    expect(fewer).not.toBe(base);
    const explicit = render({ ...line, axes: { y: { ticks: [1234, 2500] } } });
    expect(explicit).toContain("1,234");
    const right = render({ ...line, axes: { y: { position: "right", title: "Revenue" } } });
    expect(right).toContain('transform="rotate(90');
    const reversed = render({ ...line, encoding: { x: "month", y: { field: "revenue", scale: { reverse: true } } } });
    expect(reversed).not.toBe(base);
    const plain = render({ ...line, encoding: { x: "month", y: { field: "revenue", scale: { nice: false } } } });
    expect(plain).not.toBe(base);
    const padded = render({ ...line, size: { width: 420, height: 220, padding: { left: 80 } } });
    expect(padded).not.toBe(base);
    const tall = render({ ...line, size: { width: 420, height: 220, minHeight: 400 } });
    expect(tall).toContain('viewBox="0 0 420 400"');
    const described = render({ ...line, a11y: { alt, description: "Monthly revenue for three regions." } });
    expect(described).toContain("aria-describedby=");
    expect(described).toContain("Monthly revenue for three regions.");
    const keys = render({ ...line, a11y: { alt, keyboard: true } });
    expect(keys).toContain('data-ck-intent="keys"');
  });

  it("keeps a top x axis inside the clip and clear of its title", () => {
    const svg = render({
      version: "1",
      type: "line",
      data: [
        { month: "January", revenue: 1200 },
        { month: "February", revenue: 1800 },
        { month: "March", revenue: 1400 },
        { month: "April", revenue: 2600 },
        { month: "May", revenue: 2200 },
        { month: "June", revenue: 3100 },
      ],
      encoding: { x: "month", y: "revenue" },
      size: { width: 460, height: 250 },
      a11y: { alt: "Revenue from January to June." },
      axes: { x: { title: "Month", position: "top" }, y: { title: "Revenue", position: "right" } },
    });
    const clip = /<clipPath[^>]*>\s*<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/.exec(svg);
    expect(clip).toBeTruthy();
    const box = { x: Number(clip?.[1]), y: Number(clip?.[2]), w: Number(clip?.[3]), h: Number(clip?.[4]) };
    const path = /<path d="([^"]+)" fill="none"/.exec(svg)?.[1] ?? "";
    const nums = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    expect(nums.length).toBeGreaterThan(4);
    for (let i = 0; i < nums.length; i += 2) {
      expect(nums[i]).toBeGreaterThanOrEqual(box.x - 0.01);
      expect(nums[i]).toBeLessThanOrEqual(box.x + box.w + 0.01);
      expect(nums[i + 1]).toBeGreaterThanOrEqual(box.y + 1);
      expect(nums[i + 1]).toBeLessThanOrEqual(box.y + box.h - 1);
    }
    const tickAt = (label: string) => {
      const mark = new RegExp(`<text x="([^"]+)" y="([^"]+)" text-anchor="start"[^>]*>${label}</text>`).exec(svg);
      return mark ? Number(mark[2]) - 4 : NaN;
    };
    expect(nums[1]).toBeGreaterThan(tickAt("1,500"));
    expect(nums[1]).toBeLessThan(tickAt("1,000") + 1);
    const texts = [...svg.matchAll(/<text x="([^"]+)" y="([^"]+)"([^>]*)>([^<]*)<\/text>/g)];
    const bounds = (mark: RegExpMatchArray) => {
      const x = Number(mark[1]);
      const y = Number(mark[2]);
      const anchor = /text-anchor="([^"]+)"/.exec(mark[3])?.[1] ?? "start";
      const width = mark[4].length * 6.4;
      const left = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
      return { left, right: left + width, top: y - 9, bottom: y + 3 };
    };
    const month = texts.find((mark) => mark[4] === "Month");
    const march = texts.find((mark) => mark[4] === "March");
    expect(month && march).toBeTruthy();
    const title = bounds(month!);
    const label = bounds(march!);
    const overlaps = title.left < label.right && label.left < title.right && title.top < label.bottom && label.top < title.bottom;
    expect(overlaps).toBe(false);
  });

  it("warns for easing, select, tooltip fields, and font family", () => {
    const easing = validate({ ...line, animation: { easing: "linear" } });
    expect(easing.warnings.some((warning) => warning.code === "CK3012" && warning.path === "/animation/easing")).toBe(true);
    const select = validate({ ...line, interaction: { select: "point" } });
    expect(select.warnings.some((warning) => warning.code === "CK3012" && warning.path === "/interaction/select")).toBe(true);
    const fields = validate({ ...line, tooltip: { fields: [{ field: "revenue" }] } });
    expect(fields.warnings.some((warning) => warning.code === "CK3012" && warning.path === "/tooltip/fields")).toBe(true);
    const font = validate({ ...line, theme: { tokens: { fontFamily: "Georgia" } } });
    expect(font.warnings.some((warning) => warning.code === "CK3012" && warning.path === "/theme/tokens/fontFamily")).toBe(true);
    const labels = validate({ ...line, mark: { labels: true } });
    expect(labels.warnings.some((warning) => warning.code === "CK3010" && warning.path === "/mark/labels")).toBe(true);
  });

  it("walks every schema property", () => {
    const ready = hosts();
    expect(ready.length).toBeGreaterThan(5);
    const silent: string[] = [];
    for (const leaf of collect()) {
      const only = [...new Set([...leaf.consts, ...leaf.enums].map((value) => JSON.stringify(value)))];
      if (only.length === 1 && leaf.enums.length === 0 && !leaf.types.has("boolean") && !leaf.types.has("number") && !leaf.types.has("integer") && !leaf.types.has("array")) continue;
      if (!covered(leaf, ready)) silent.push(leaf.path);
    }
    expect(silent, silent.join("\n")).toEqual([]);
  });
});
