/**
 * Rose and choropleth labels in the docs rail.
 * Text boxes follow the visual QA sweep: a pair overlaps when the intersection
 * is more than 2px on both axes and at least a fifth of the smaller box.
 * A gap under 2px counts too, so a title that only touches the top tick fails.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { pathToFileURL, fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";
import { withPreviewSize } from "../preview-size.ts";
import { choroplethExamples } from "./choropleth.ts";
import { radarExamples } from "./radar.ts";
import { radialBarExamples } from "./radial-bar.ts";
import { roseExamples } from "./rose.ts";

const css = ["global.css", "docs.css", "teach.css"]
  .map((name) => readFileSync(new URL(`../../styles/${name}`, import.meta.url), "utf8"))
  .join("\n");

type Runtime = {
  render: (spec: Record<string, unknown>) => string | null;
  renderGeo: (spec: Record<string, unknown>) => Promise<string>;
};

const runtime: Runtime = await loadRuntime();

async function loadRuntime(): Promise<Runtime> {
  const { build } = await import("esbuild");
  const root = fileURLToPath(new URL("../../../../../", import.meta.url));
  const dir = mkdtempSync(join(tmpdir(), "ck-label-"));
  const entry = join(dir, "entry.ts");
  const outfile = join(dir, "runtime.mjs");
  const core = join(root, "packages/core/src/extra.ts");
  const geo = join(root, "packages/geo/src/index.ts");
  writeFileSync(entry, `export { render } from ${JSON.stringify(core)};\nexport { render as renderGeo } from ${JSON.stringify(geo)};\n`);
  await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
  });
  return import(pathToFileURL(outfile).href) as Promise<Runtime>;
}

function paint(spec: Record<string, unknown>): Promise<string> | string {
  const sized = withPreviewSize(spec);
  return sized.type === "choropleth" || sized.type === "map-points" ? runtime.renderGeo(sized) : runtime.render(sized) ?? "";
}

async function mount(page: Page): Promise<void> {
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>${css} body{margin:0}</style>
    <div class="docs-try-slot"><div class="docs-try chart-demo"><div id="response-chart" class="chart-demo__chart"></div></div></div>`);
}

type Measure = {
  paneW: number;
  paneH: number;
  slotW: number;
  screen: string[];
  boxes: string[];
  outside: string[];
};

async function measure(page: Page, svg: string, panel: number | null): Promise<Measure> {
  return page.evaluate(
    ({ markup, width }) => {
      const root = document.documentElement;
      if (width == null) {
        root.style.removeProperty("--try");
        root.style.removeProperty("--chart-h");
      } else {
        root.style.setProperty("--try", `${width}px`);
        root.style.setProperty("--chart-h", `${Math.round(width * 0.6)}px`);
      }
      const chart = document.querySelector("#response-chart");
      if (!(chart instanceof HTMLElement)) throw new Error("missing chart");
      chart.innerHTML = markup;
      const svgEl = chart.querySelector("svg");
      if (!(svgEl instanceof SVGSVGElement)) throw new Error("missing svg");
      const pane = chart.getBoundingClientRect();
      const slot = chart.closest(".docs-try-slot");
      const slotBox = slot instanceof HTMLElement ? slot.getBoundingClientRect() : pane;
      const view = svgEl.viewBox.baseVal;
      const texts = [...svgEl.querySelectorAll("text")]
        .map((node) => {
          const box = node.getBoundingClientRect();
          const local = node.getBBox();
          const label = (node.textContent || "").replace(/\s+/g, " ").trim();
          return { label, x: box.x, y: box.y, w: box.width, h: box.height, lx: local.x, ly: local.y, lw: local.width, lh: local.height };
        })
        .filter((item) => item.label && item.w > 1 && item.h > 1);
      const screen: string[] = [];
      const boxes: string[] = [];
      const outside: string[] = [];
      const gap = (a0: number, a1: number, b0: number, b1: number) => Math.max(a0, b0) - Math.min(a1, b1);
      for (let i = 0; i < texts.length; i++) {
        const item = texts[i];
        if (!item) continue;
        if (item.lx < -0.5 || item.ly < -0.5 || item.lx + item.lw > view.width + 0.5 || item.ly + item.lh > view.height + 0.5) {
          outside.push(`"${item.label}"`);
        }
        for (let j = i + 1; j < texts.length; j++) {
          const a = texts[i];
          const b = texts[j];
          if (!a || !b) continue;
          const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
          const iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
          if (ix > 2 && iy > 2) {
            const area = ix * iy;
            const smaller = Math.min(a.w * a.h, b.w * b.h);
            if (smaller > 0 && area >= smaller * 0.2) screen.push(`"${a.label}" overlaps "${b.label}"`);
          }
          const xGap = gap(a.lx, a.lx + a.lw, b.lx, b.lx + b.lw);
          const yGap = gap(a.ly, a.ly + a.lh, b.ly, b.ly + b.lh);
          if (xGap < 2 && yGap < 2) boxes.push(`"${a.label}" meets "${b.label}"`);
        }
      }
      return { paneW: pane.width, paneH: pane.height, slotW: slotBox.width, screen, boxes, outside };
    },
    { markup: svg, width: panel },
  );
}

test("rose and choropleth rail labels do not overlap", { timeout: 120_000 }, async () => {
  const audience = await paint(roseExamples[0]!.spec);
  const population = await paint(choroplethExamples.find((item) => item.id === "population")!.spec);
  const renewable = await paint(choroplethExamples.find((item) => item.id === "renewable")!.spec);
  const radial = await Promise.all(radialBarExamples.map((item) => paint(item.spec)));
  const radar = await Promise.all(radarExamples.map((item) => paint(item.spec)));
  assert.equal(String(audience).includes('data-ck-type="rose"'), true);
  assert.equal(String(population).includes('data-ck-type="choropleth"'), true);

  const browser = await chromium.launch({ headless: true });
  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await mount(desktop);
    const strict: { name: string; svg: string; widths: number[] }[] = [
      { name: "rose audience", svg: String(audience), widths: [280, 380, 720] },
      { name: "choropleth population", svg: String(population), widths: [720] },
      { name: "choropleth renewable", svg: String(renewable), widths: [280, 380, 720] },
    ];
    const guards: { name: string; svg: string; widths: number[] }[] = [
      ...radialBarExamples.map((item, index) => ({ name: `radial-bar ${item.id}`, svg: String(radial[index]), widths: [280, 380, 720] })),
      ...radarExamples.map((item, index) => ({ name: `radar ${item.id}`, svg: String(radar[index]), widths: [280, 380, 720] })),
    ];
    for (const item of [...strict, ...guards]) {
      for (const width of item.widths) {
        const found = await measure(desktop, item.svg, width);
        const where = `${item.name} at rail ${width}px (slot ${Math.round(found.slotW)}, pane ${Math.round(found.paneW)}×${Math.round(found.paneH)})`;
        assert.ok(Math.abs(found.slotW - width) < 4, `${where} did not use the rail width`);
        assert.deepEqual(found.screen, [], `${where} screen ${found.screen.join("; ")}`);
        if (!strict.includes(item)) continue;
        assert.deepEqual(found.boxes, [], `${where} boxes ${found.boxes.join("; ")}`);
        assert.deepEqual(found.outside, [], `${where} outside ${found.outside.join("; ")}`);
      }
    }

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mount(mobile);
    const narrow = await measure(mobile, String(audience), null);
    assert.ok(narrow.paneW < 420, `mobile pane is ${narrow.paneW}px`);
    assert.deepEqual(narrow.screen, [], `rose mobile screen ${narrow.screen.join("; ")}`);
    assert.deepEqual(narrow.boxes, [], `rose mobile boxes ${narrow.boxes.join("; ")}`);
    assert.deepEqual(narrow.outside, [], `rose mobile outside ${narrow.outside.join("; ")}`);
  } finally {
    await browser.close();
  }
});
