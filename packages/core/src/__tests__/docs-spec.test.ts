import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render } from "../extra";
import { validate } from "../validate";
import { validatePhase4 } from "../validate-phase4";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

const CHART_TYPES = [
  "line",
  "bar",
  "donut",
  "pie",
  "stacked-area",
  "scatter",
  "combo",
  "heatmap",
  "gauge",
  "kpi",
  "sparkline",
  "mini-area",
  "progress-ring",
  "spike",
  "candlestick",
  "histogram",
  "boxplot",
  "radar",
  "funnel",
  "treemap",
  "sankey",
  "bullet",
  "waterfall",
  "gantt",
  "timeline",
  "quadrant",
  "venn",
  "journey",
  "area-range",
  "bar-range",
  "errorbar",
  "sunburst",
];

const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);

function fencedSpecs(relativePath: string): unknown[] {
  const text = readFileSync(join(repoRoot, relativePath), "utf8");
  const specs: unknown[] = [];
  const pattern = /```json\n([\s\S]*?)```/g;
  for (const match of text.matchAll(pattern)) {
    specs.push(JSON.parse(match[1] ?? "") as unknown);
  }
  return specs;
}

describe("published JSON examples", () => {
  for (const file of ["docs/public/llms.txt", "docs/public/llms-full.txt", "packages/core/README.md"]) {
    it(`${file} has one valid, drawable spec per chart type`, () => {
      const specs = fencedSpecs(file);
      const types = specs.map((spec) => (spec as { type?: string }).type);
      const expected = file === "docs/public/llms.txt" ? CHART_TYPES.filter((type) => type !== "pie") : CHART_TYPES;
      expect([...types].sort()).toEqual([...expected].sort());
      if (file === "docs/public/llms.txt") {
        const text = readFileSync(join(repoRoot, file), "utf8");
        expect(text).toContain("navigator");
        expect(text).toContain("drilldown");
        expect(text).toContain("breakpoints");
        expect(text).toContain("100000");
        expect(Buffer.byteLength(text)).toBeLessThanOrEqual(6400);
      }
      for (const spec of specs) {
        const type = (spec as { type?: string }).type ?? "";
        const result = PHASE4.has(type) ? validatePhase4(spec) : validate(spec);
        expect(result.ok, JSON.stringify(result.errors)).toBe(true);
        const svg = render(spec);
        expect(svg).not.toContain("ck-chart-error");
        expect(svg).toContain(`data-ck-type="${(spec as { type: string }).type}"`);
      }
    });
  }
});
