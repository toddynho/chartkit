/**
 * Teach demos are painted into the docs rail chart pane.
 * The pane height is 60% of the rail width, and the SVG fills that pane.
 * A square viewBox used to follow height:auto, grow past the pane, and scroll.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { chromium, type Page } from "playwright";
import { paintSpec } from "../../lib/chartkit.ts";
import { isGeoSpec, paintGeo } from "../../lib/paint-geo.ts";
import { withPreviewSize } from "../preview-size.ts";
import { teachModules } from "./registry.ts";

const css = ["global.css", "docs.css", "teach.css"]
  .map((name) => readFileSync(new URL(`../../styles/${name}`, import.meta.url), "utf8"))
  .join("\n");

/** Default rail, the narrow stop, and a wide drag. docs-split rounds the pane to 60%. */
const RAIL_WIDTHS = [380, 280, 720];

type Fit = {
  scrolls: boolean;
  inside: boolean;
  svgW: number;
  svgH: number;
  chartW: number;
  chartH: number;
};

async function paint(spec: Record<string, unknown>) {
  const sized = withPreviewSize(spec);
  return isGeoSpec(sized) ? paintGeo(sized) : paintSpec(sized);
}

async function mount(page: Page): Promise<void> {
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>${css}</style>
    <div class="docs-try-slot">
      <div class="docs-try chart-demo">
        <div id="response-chart" class="chart-demo__chart"></div>
      </div>
    </div>`);
}

async function fitAt(page: Page, svg: string, width: number): Promise<Fit> {
  return page.evaluate(
    ({ markup, panel }) => {
      const root = document.documentElement;
      root.style.setProperty("--try", `${panel}px`);
      root.style.setProperty("--chart-h", `${Math.round(panel * 0.6)}px`);
      const chart = document.querySelector("#response-chart");
      if (!(chart instanceof HTMLElement)) throw new Error("missing chart");
      chart.innerHTML = markup;
      const svgEl = chart.querySelector("svg");
      if (!(svgEl instanceof SVGSVGElement)) throw new Error("missing svg");
      const pane = chart.getBoundingClientRect();
      const box = svgEl.getBoundingClientRect();
      const slack = 1;
      return {
        scrolls: chart.scrollHeight > chart.clientHeight + slack,
        inside:
          box.top >= pane.top - slack &&
          box.bottom <= pane.bottom + slack &&
          box.left >= pane.left - slack &&
          box.right <= pane.right + slack &&
          Math.abs(box.width - pane.width) <= slack &&
          Math.abs(box.height - pane.height) <= slack,
        svgW: box.width,
        svgH: box.height,
        chartW: pane.width,
        chartH: pane.height,
      };
    },
    { markup: svg, panel: width },
  );
}

test("each teach demo fits the rail chart section", { timeout: 120_000 }, async () => {
  const cases: { label: string; spec: Record<string, unknown> }[] = [];
  for (const module of Object.values(teachModules)) {
    for (const example of module.examples) {
      cases.push({ label: `${module.type}/${example.id}`, spec: example.spec });
    }
    if (module.type !== "progress-ring") continue;
    for (const example of module.examples) {
      for (const control of module.controls) {
        if (control.kind !== "choice") continue;
        for (const option of control.options) {
          const spec = structuredClone(example.spec);
          const restore = control.id === "tooltip" ? example.spec.tooltip : example.spec;
          module.apply(spec, { id: control.id, value: option.value, restore });
          cases.push({ label: `${module.type}/${example.id} ${control.id}=${option.value}`, spec });
        }
      }
    }
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
    await mount(page);
    for (const item of cases) {
      const painted = await paint(item.spec);
      assert.equal(painted.ok, true, `${item.label} did not render`);
      assert.equal(painted.svg.includes("<svg"), true, item.label);
      for (const width of RAIL_WIDTHS) {
        const fit = await fitAt(page, painted.svg, width);
        const where = `${item.label} at rail ${width}px (svg ${Math.round(fit.svgW)}×${Math.round(fit.svgH)}, pane ${Math.round(fit.chartW)}×${Math.round(fit.chartH)})`;
        assert.equal(fit.scrolls, false, `${where} scrolls`);
        assert.equal(fit.inside, true, `${where} is outside the chart section`);
      }
    }
  } finally {
    await browser.close();
  }
});
