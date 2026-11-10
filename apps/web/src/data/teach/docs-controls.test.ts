/**
 * Docs control sweep.
 * Every teach-page chart type and every focused control is applied to the first
 * example. Each control id has a claim checker. A new id fails until it is
 * checked or named in CLAIM_ALLOWLIST with a reason.
 * Legend position, tooltip on/off, and the docs rail scroll are explicit claims.
 * Range sliders are sampled at the minimum, the midpoint, and the maximum.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { pathToFileURL, fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";
import { docsNavLinks } from "../nav.ts";
import { withPreviewSize } from "../preview-size.ts";
import { demoTip, type DemoTip } from "./demo-tip.ts";
import { teachModules } from "./registry.ts";
import type { TeachControl, TeachModule } from "./types.ts";

const css = ["global.css", "docs.css", "teach.css"]
  .map((name) => readFileSync(new URL(`../../styles/${name}`, import.meta.url), "utf8"))
  .join("\n");

/**
 * A control with no checker has to be listed here. Keep this list small.
 * Type is omitted when the skip is the control itself.
 */
const CLAIM_ALLOWLIST: { type?: string; id: string; reason: string }[] = [];

const EFFECT_IDS = [
  "anchor",
  "area",
  "atlas",
  "band",
  "bands",
  "bandwidth",
  "baseline",
  "bin",
  "bins",
  "curve",
  "dash",
  "depth",
  "direction",
  "format",
  "gradient",
  "innerRadius",
  "jitter",
  "labels",
  "layout",
  "line",
  "lineAxis",
  "linecap",
  "link",
  "normalize",
  "offset",
  "order",
  "orient",
  "orientation",
  "padAngle",
  "palette",
  "points",
  "ranges",
  "readout",
  "rug",
  "scale",
  "scheme",
  "seriesMark",
  "shape",
  "size",
  "sort",
  "span",
  "sparkline",
  "stack",
  "startAngle",
  "summary",
  "sweep",
  "target",
  "thresholds",
  "track",
  "volume",
] as const;

type Fail = string;

type Measure = {
  overlaps: string[];
  outside: string[];
  legend: null | {
    pos: string;
    x: number;
    y: number;
    w: number;
    h: number;
    marks: number;
    insideView: boolean;
    screenInside: boolean;
    plot: { x: number; y: number; w: number; h: number } | null;
    markBox: { x: number; y: number; w: number; h: number } | null;
    swatches: number;
    texts: string[];
  };
};

type Runtime = {
  render: (spec: Record<string, unknown>) => string | null;
  renderGeo: (spec: Record<string, unknown>) => Promise<string>;
  renderBarList: (spec: Record<string, unknown>) => string | null;
};

const root = fileURLToPath(new URL("../../../../../", import.meta.url));

async function bundle(entrySource: string, platform: "node" | "browser", outfile: string): Promise<void> {
  const { build } = await import("esbuild");
  const dir = mkdtempSync(join(tmpdir(), "ck-docs-"));
  const entry = join(dir, "entry.ts");
  writeFileSync(entry, entrySource);
  await build({
    entryPoints: [entry],
    bundle: true,
    format: platform === "browser" ? "iife" : "esm",
    platform,
    outfile,
    logLevel: "silent",
  });
}

const runtime: Runtime = await loadRuntime();

async function loadRuntime(): Promise<Runtime> {
  const dir = mkdtempSync(join(tmpdir(), "ck-docs-rt-"));
  const outfile = join(dir, "runtime.mjs");
  const core = join(root, "packages/core/src/extra.ts");
  const geo = join(root, "packages/geo/src/index.ts");
  const barList = join(root, "packages/core/src/charts/bar-list.ts");
  await bundle(
    `export { render } from ${JSON.stringify(core)};\nexport { render as renderGeo } from ${JSON.stringify(geo)};\nexport { renderBarList } from ${JSON.stringify(barList)};\n`,
    "node",
    outfile,
  );
  return import(pathToFileURL(outfile).href) as Promise<Runtime>;
}

function allowReason(type: string, id: string): string | undefined {
  return CLAIM_ALLOWLIST.find((item) => item.id === id && (item.type == null || item.type === type))?.reason;
}

function valuesOf(control: TeachControl): (string | number)[] {
  if (control.kind === "choice") return control.options.map((option) => option.value);
  const mid = control.min + Math.round((control.max - control.min) / 2 / control.step) * control.step;
  const clamped = Math.min(control.max, Math.max(control.min, Number(mid.toFixed(6))));
  return [...new Set([control.min, clamped, control.max])];
}

function applied(module: TeachModule, example: TeachModule["examples"][number], control: TeachControl, value: string | number): Record<string, unknown> {
  const spec = structuredClone(example.spec);
  const restore = control.id === "tooltip" ? example.spec.tooltip : example.spec;
  module.apply(spec, { id: control.id, value, restore });
  return spec;
}

/** Use the published example where this control actually changes the drawing. Tooltip stays on the opening example. */
async function chooseExample(module: TeachModule, control: TeachControl): Promise<TeachModule["examples"][number]> {
  const first = module.examples[0];
  if (!first) throw new Error(`${module.type} has no example`);
  if (control.id === "tooltip") return first;
  const values = valuesOf(control);
  for (const example of module.examples) {
    const fingerprints: string[] = [];
    let legend = 0;
    for (const value of values) {
      try {
        const svg = await paint(applied(module, example, control, value));
        fingerprints.push(normalize(svg));
        if (control.id === "legend" && value !== "off" && (svg.includes("data-ck-legend=") || svg.includes('width="10"'))) legend += 1;
      } catch {
        fingerprints.push("");
      }
    }
    if (control.id === "legend" && legend > 0) return example;
    if (control.id !== "legend" && new Set(fingerprints.filter(Boolean)).size >= 2) return example;
  }
  return first;
}

async function paint(spec: Record<string, unknown>): Promise<string> {
  const sized = withPreviewSize(spec);
  if (sized.type === "choropleth" || sized.type === "map-points") return runtime.renderGeo(sized);
  const svg = sized.type === "bar-list" ? runtime.renderBarList(sized) : runtime.render(sized);
  if (!svg) throw new Error("renderer returned nothing");
  return svg;
}

function xml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function normalize(svg: string): string {
  return svg.replace(/\s+id="[^"]*"/g, "").replace(/url\(#[^)]+\)/g, "url(#)").replace(/\s+clip-path="[^"]*"/g, "");
}

async function mountChart(page: Page): Promise<void> {
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>${css}
    body{margin:0;background:#fff}
    </style>
    <div class="docs-try-slot"><div class="docs-try chart-demo"><div id="response-chart" class="chart-demo__chart"></div></div></div>`);
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--try", "720px");
    document.documentElement.style.setProperty("--chart-h", "432px");
  });
}

async function measure(page: Page, markup: string): Promise<Measure> {
  return page.evaluate((svg) => {
    const host = document.querySelector("#response-chart");
    if (!(host instanceof HTMLElement)) throw new Error("missing chart");
    host.innerHTML = svg;
    const svgEl = host.querySelector("svg");
    if (!(svgEl instanceof SVGSVGElement)) throw new Error("missing svg");
    const view = svgEl.viewBox.baseVal;
    const pane = host.getBoundingClientRect();
    const texts = [...svgEl.querySelectorAll("text")]
      .map((node) => {
        const box = node.getBoundingClientRect();
        const local = node.getBBox();
        const label = (node.textContent || "").replace(/\s+/g, " ").trim();
        return { label, box, local };
      })
      .filter((item) => item.label && item.box.width > 1 && item.box.height > 1);
    const overlaps: string[] = [];
    const outside: string[] = [];
    for (let i = 0; i < texts.length; i++) {
      const item = texts[i];
      if (!item) continue;
      const slack = 8;
      const over = Math.max(-item.local.x, -item.local.y, item.local.x + item.local.width - view.width, item.local.y + item.local.height - view.height);
      if (over > slack) outside.push(`"${item.label}" by ${over.toFixed(1)}px`);
      for (let j = i + 1; j < texts.length; j++) {
        const other = texts[j];
        if (!other) continue;
        const ix = Math.min(item.box.x + item.box.width, other.box.x + other.box.width) - Math.max(item.box.x, other.box.x);
        const iy = Math.min(item.box.y + item.box.height, other.box.y + other.box.height) - Math.max(item.box.y, other.box.y);
        if (ix > 2 && iy > 2) {
          const area = ix * iy;
          const smaller = Math.min(item.box.width * item.box.height, other.box.width * other.box.height);
          if (smaller > 0 && area >= smaller * 0.2) overlaps.push(`"${item.label}" overlaps "${other.label}"`);
        }
      }
    }
    const clip = svgEl.querySelector("clipPath rect");
    const plot = clip
      ? {
          x: Number(clip.getAttribute("x")) || 0,
          y: Number(clip.getAttribute("y")) || 0,
          w: Number(clip.getAttribute("width")) || 0,
          h: Number(clip.getAttribute("height")) || 0,
        }
      : null;
    const legendEl = svgEl.querySelector("[data-ck-legend]");
    let local = { x: 0, y: 0, width: 0, height: 0 };
    let screen = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
    let marks = 0;
    let pos = "";
    if (legendEl instanceof SVGGraphicsElement) {
      const box = legendEl.getBBox();
      local = { x: box.x, y: box.y, width: box.width, height: box.height };
      const seen = legendEl.getBoundingClientRect();
      screen = { left: seen.left, top: seen.top, right: seen.right, bottom: seen.bottom, width: seen.width, height: seen.height };
      pos = legendEl.getAttribute("data-ck-legend") || "";
      marks = [...legendEl.querySelectorAll("text,rect,circle,path")].filter((node) => {
        if (!(node instanceof SVGGraphicsElement)) return false;
        const mark = node.getBoundingClientRect();
        return mark.width > 0.5 && mark.height > 0.5;
      }).length;
    } else {
      const swatches = [...svgEl.querySelectorAll("rect")].filter((node) => {
        const w = Number(node.getAttribute("width"));
        const h = Number(node.getAttribute("height"));
        if (!(w >= 8 && w <= 14 && h >= 8 && h <= 14)) return false;
        const next = node.nextElementSibling;
        if (!(next instanceof SVGGraphicsElement) || next.localName !== "text") return false;
        const x = Number(node.getAttribute("x"));
        const y = Number(node.getAttribute("y"));
        if (!plot || plot.w <= 0) return true;
        const cx = x + w / 2;
        const cy = y + h / 2;
        const outsidePlot = cx < plot.x - 2 || cx > plot.x + plot.w + 2 || cy < plot.y - 2 || cy > plot.y + plot.h + 2;
        const inTopBand = cy < plot.y + 40;
        const inBottomBand = cy > plot.y + plot.h - 40;
        return outsidePlot || inTopBand || inBottomBand;
      });
      if (swatches.length) {
        let x0 = Infinity;
        let y0 = Infinity;
        let x1 = -Infinity;
        let y1 = -Infinity;
        for (const node of swatches) {
          const box = node.getBBox();
          x0 = Math.min(x0, box.x);
          y0 = Math.min(y0, box.y);
          x1 = Math.max(x1, box.x + box.width);
          y1 = Math.max(y1, box.y + box.height);
          const next = node.nextElementSibling;
          if (next instanceof SVGGraphicsElement && next.localName === "text") {
            const text = next.getBBox();
            x0 = Math.min(x0, text.x);
            y0 = Math.min(y0, text.y);
            x1 = Math.max(x1, text.x + text.width);
            y1 = Math.max(y1, text.y + text.height);
          }
        }
        local = { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
        const seen = swatches[0].getBoundingClientRect();
        screen = { left: seen.left, top: seen.top, right: seen.right, bottom: seen.bottom, width: seen.width, height: seen.height };
        marks = swatches.length;
        const midY = local.y + local.height / 2;
        const midX = local.x + local.width / 2;
        if (plot && midY < plot.y + 8) pos = "top";
        else if (plot && midY > plot.y + plot.h - 2) pos = "bottom";
        else if (plot && midX > plot.x + plot.w - 2) pos = "right";
        else if (plot && local.x + local.width < plot.x + 16) pos = "left";
        else pos = "top";
      }
    }
    const slack = 1.5;
    const legendElNow = svgEl.querySelector("[data-ck-legend]");
    const swatches = legendElNow
      ? [...legendElNow.querySelectorAll("rect")].filter((node) => {
          const w = Number(node.getAttribute("width"));
          const h = Number(node.getAttribute("height"));
          return w >= 8 && w <= 14 && h >= 8 && h <= 14;
        }).length
      : 0;
    const legendTexts = legendElNow
      ? [...legendElNow.querySelectorAll("text")]
          .map((node) => (node.textContent || "").replace(/\s+/g, " ").trim())
          .filter(Boolean)
      : [];
    let markBox: { x: number; y: number; w: number; h: number } | null = null;
    const markNodes = [...svgEl.querySelectorAll("[data-ck-mark]")].filter((node) => !node.closest("[data-ck-legend]"));
    if (markNodes.length) {
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const node of markNodes) {
        if (!(node instanceof SVGGraphicsElement)) continue;
        const box = node.getBBox();
        if (box.width < 0.5 && box.height < 0.5) continue;
        x0 = Math.min(x0, box.x);
        y0 = Math.min(y0, box.y);
        x1 = Math.max(x1, box.x + box.width);
        y1 = Math.max(y1, box.y + box.height);
      }
      if (x1 > x0 && y1 > y0) markBox = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }
    const legend =
      marks > 0
        ? {
            pos,
            x: local.x,
            y: local.y,
            w: local.width,
            h: local.height,
            marks,
            insideView: local.x >= -1 && local.y >= -1 && local.x + local.width <= view.width + 1 && local.y + local.height <= view.height + 1,
            screenInside:
              screen.width > 1 &&
              screen.height > 1 &&
              screen.left >= pane.left - slack &&
              screen.top >= pane.top - slack &&
              screen.right <= pane.right + slack &&
              screen.bottom <= pane.bottom + slack,
            plot,
            markBox,
            swatches,
            texts: legendTexts,
          }
        : null;
    return { overlaps, outside, legend };
  }, markup);
}

function frameProblems(spec: Record<string, unknown>, svg: string, measured: Measure): string[] {
  const problems: string[] = [];
  if (typeof spec.title === "string" && spec.title && !svg.includes(xml(spec.title)) && !svg.includes(spec.title)) {
    problems.push(`title "${spec.title}" is missing`);
  }
  if (typeof spec.subtitle === "string" && spec.subtitle && !svg.includes(xml(spec.subtitle)) && !svg.includes(spec.subtitle)) {
    problems.push(`subtitle "${spec.subtitle}" is missing`);
  }
  if (measured.overlaps.length) problems.push(`text overlap: ${measured.overlaps.slice(0, 4).join("; ")}`);
  if (measured.outside.length) problems.push(`outside the frame: ${measured.outside.slice(0, 4).join("; ")}`);
  return problems;
}

function legendProblems(value: string | number, measured: Measure, type = ""): string[] {
  const legend = measured.legend;
  if (value === "off") {
    return legend ? [`legend off still paints data-ck-legend="${legend.pos}"`] : [];
  }
  if (!legend) return ["legend marks are missing"];
  const problems: string[] = [];
  if (legend.marks < 1) problems.push("legend has no visible marks");
  if (legend.w < 2 || legend.h < 2) problems.push("legend box is zero-size");
  if (!legend.insideView) problems.push(`legend sits outside the viewBox (${legend.x.toFixed(1)},${legend.y.toFixed(1)} ${legend.w.toFixed(1)}×${legend.h.toFixed(1)})`);
  if (!legend.screenInside) problems.push("legend is clipped by the chart frame");
  if (legend.pos !== String(value)) problems.push(`legend position attribute is ${legend.pos}, expected ${value}`);
  const plot = legend.plot;
  if (plot && plot.w > 0 && plot.h > 0) {
    const midY = legend.y + legend.h / 2;
    const midX = legend.x + legend.w / 2;
    if (value === "bottom" && midY < plot.y + plot.h - 2) problems.push("bottom legend is not below the plot");
    if (value === "top" && legend.y + legend.h > plot.y + 16) problems.push("top legend is not above the plot");
    if (value === "right" && midX < plot.x + plot.w - 2) problems.push("right legend is not to the right of the plot");
    if (value === "left" && legend.x + legend.w > plot.x + 16) problems.push("left legend is not left of the plot");
  }
  const drawn = legend.markBox;
  const placed = type === "sunburst" || type === "rose" || type === "strip";
  if (placed && drawn && drawn.w > 0 && drawn.h > 0) {
    if (value === "bottom" && legend.y < drawn.y + drawn.h - 8) problems.push("bottom legend is not below the marks");
    if (value === "top" && legend.y + legend.h > drawn.y + 8) problems.push("top legend is not above the marks");
    if (value === "right" && legend.x < drawn.x + drawn.w - 4) problems.push("right legend is not to the right of the marks");
    if (value === "left" && legend.x + legend.w > drawn.x + 8) problems.push("left legend is not left of the marks");
  }
  return problems;
}

async function hoverPoints(page: Page): Promise<{ x: number; y: number }[]> {
  return page.evaluate(() => {
    const svg = document.querySelector("#response-chart svg");
    if (!(svg instanceof SVGSVGElement)) return [];
    const box = svg.getBoundingClientRect();
    const marks = [...svg.querySelectorAll("[data-ck-mark], .ck-geo-point, .ck-geo-region[data-ck-value]")];
    const points: { x: number; y: number }[] = [];
    for (const mark of marks) {
      const b = mark.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) continue;
      points.push({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
      if (points.length >= 4) break;
    }
    points.push({ x: box.x + box.width * 0.42, y: box.y + box.height * 0.48 });
    points.push({ x: box.x + box.width * 0.62, y: box.y + box.height * 0.55 });
    return points.slice(0, 6);
  });
}

async function visibleTip(page: Page): Promise<string> {
  return page.evaluate(() => {
    const nodes = [...document.querySelectorAll("[data-ck-tip], [data-ck-geo-tip], [data-ck-extra-tip]")];
    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue;
      const style = getComputedStyle(node);
      const hidden = node.hidden || style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0;
      const text = (node.textContent || "").replace(/\s+/g, " ").trim();
      if (!hidden && text) return text;
    }
    return "";
  });
}

async function armTip(page: Page, mode: DemoTip, spec: Record<string, unknown>, svg: string): Promise<void> {
  await page.evaluate(
    ({ mode: tipMode, spec: next, svg: markup }) => {
      const stop = (globalThis as { __stop?: () => void }).__stop;
      stop?.();
      document.querySelectorAll("[data-ck-tip], [data-ck-geo-tip], [data-ck-extra-tip]").forEach((node) => node.remove());
      const host = document.querySelector("#response-chart");
      if (!(host instanceof HTMLElement)) throw new Error("missing chart");
      host.innerHTML = markup;
      const rt = globalThis as {
        attach?: (host: Element, spec: unknown, options: { render: () => string }) => { destroy(): void };
        attachGeo?: (svg: SVGSVGElement) => () => void;
        attachExtra?: (host: Element, spec: unknown) => { destroy(): void };
        __stop?: () => void;
      };
      if (tipMode === "geo") {
        const svgEl = host.querySelector("svg");
        if (!(svgEl instanceof SVGSVGElement) || !rt.attachGeo) throw new Error("missing geo attach");
        const detach = rt.attachGeo(svgEl);
        rt.__stop = detach;
        return;
      }
      if (tipMode === "extra") {
        if (!rt.attachExtra) throw new Error("missing extra attach");
        const ctrl = rt.attachExtra(host, next);
        rt.__stop = () => ctrl.destroy();
        return;
      }
      if (!rt.attach) throw new Error("missing interact attach");
      const ctrl = rt.attach(host, next, { render: () => markup });
      rt.__stop = () => ctrl.destroy();
    },
    { mode, spec, svg },
  );
}

function channelField(channel: unknown): string {
  if (typeof channel === "string") return channel;
  if (channel && typeof channel === "object" && "field" in channel) {
    const field = (channel as { field?: unknown }).field;
    if (typeof field === "string") return field;
  }
  return "";
}

function categoryNames(spec: Record<string, unknown>): string[] {
  const encoding = spec.encoding;
  const field = encoding && typeof encoding === "object" ? channelField((encoding as { x?: unknown }).x) : "";
  if (!field || !Array.isArray(spec.data)) return [];
  const names: string[] = [];
  for (const row of spec.data) {
    if (!row || typeof row !== "object") continue;
    const value = (row as Record<string, unknown>)[field];
    if (typeof value === "string" && value && !names.includes(value)) names.push(value);
  }
  return names;
}

function treeLeaves(svg: string): { id: string; x: number; y: number }[] {
  const nodes: { id: string; parent: string; x: number; y: number }[] = [];
  for (const match of svg.matchAll(/data-ck-id="([^"]*)" data-ck-parent="([^"]*)" data-ck-path="[^"]*" cx="([^"]+)" cy="([^"]+)"/g)) {
    nodes.push({ id: match[1] ?? "", parent: match[2] ?? "", x: Number(match[3]), y: Number(match[4]) });
  }
  const parents = new Set(nodes.map((node) => node.parent).filter(Boolean));
  return nodes.filter((node) => node.id && !parents.has(node.id));
}

async function labelsOutsidePane(page: Page, svg: string, width: number): Promise<string[]> {
  return page.evaluate(
    ({ markup, paneWidth }) => {
      const host = document.querySelector("#response-chart");
      if (!(host instanceof HTMLElement)) return ["missing chart"];
      host.style.width = `${paneWidth}px`;
      host.innerHTML = markup;
      const pane = host.getBoundingClientRect();
      const stuck: string[] = [];
      for (const node of host.querySelectorAll("text")) {
        const box = node.getBoundingClientRect();
        const label = (node.textContent || "").replace(/\s+/g, " ").trim();
        if (!label || box.width < 1 || box.height < 1) continue;
        const over = Math.max(pane.left - box.left, pane.top - box.top, box.right - pane.right, box.bottom - pane.bottom);
        if (over > 1) stuck.push(`"${label}" by ${over.toFixed(1)}px`);
      }
      return stuck;
    },
    { markup: svg, paneWidth: width },
  );
}

function galleryAnchors(source: string): string {
  return [...source.matchAll(/<a\b[^>]*href="\/gallery"[^>]*>[\s\S]*?<\/a>/g)].map((match) => `<li>${match[0]}</li>`).join("");
}

/** docs-catalog.ts is imported by the site with extensionless paths, so the test reads the nav it publishes. */
function docsNavItems(): { href: string; label: string }[] {
  const source = readFileSync(new URL("../docs-catalog.ts", import.meta.url), "utf8");
  const start = source.indexOf("export const docsNav");
  const end = source.indexOf("export type Crumb");
  const body = source.slice(start, end);
  return [...body.matchAll(/href:\s*"([^"]+)"\s*,\s*label:\s*"([^"]+)"/g)].map((match) => ({
    href: match[1] ?? "",
    label: match[2] ?? "",
  }));
}

test("docs controls paint a claim for every teach control", { timeout: 600_000 }, async () => {
  const seen = new Set<string>();
  for (const module of Object.values(teachModules)) {
    for (const control of module.controls) seen.add(control.id);
  }
  const known = new Set<string>([...EFFECT_IDS, "legend", "tooltip"]);
  const missing = [...seen].filter((id) => !known.has(id) && !CLAIM_ALLOWLIST.some((item) => item.id === id && item.type == null));
  assert.deepEqual(missing, [], `controls without a checker: ${missing.join(", ")}`);

  const dir = mkdtempSync(join(tmpdir(), "ck-docs-ui-"));
  const browserFile = join(dir, "ui.js");
  const core = join(root, "packages/core/src");
  const geo = join(root, "packages/geo/src/index.ts");
  await bundle(
    `import { render as renderGeo, attach as attachGeo } from ${JSON.stringify(geo)};
import { attach } from ${JSON.stringify(join(core, "interact.ts"))};
import { attach as attachExtra } from ${JSON.stringify(join(core, "extra-tip.ts"))};
Object.assign(globalThis, { renderGeo, attachGeo, attach, attachExtra });`,
    "browser",
    browserFile,
  );

  const browser = await chromium.launch({ headless: true });
  const failures: Fail[] = [];
  const consoleErrors: string[] = [];
  let claims = 0;
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    await mountChart(page);
    await page.addScriptTag({ path: browserFile });
    await page.waitForFunction(() => typeof (globalThis as { attach?: unknown }).attach === "function");

    for (const module of Object.values(teachModules)) {
      const example = module.examples[0];
      if (!example) {
        failures.push(`${module.type} has no example`);
        continue;
      }
      for (const control of module.controls) {
        if (allowReason(module.type, control.id)) continue;
        const values = valuesOf(control);
        const example = await chooseExample(module, control);
        const painted: { value: string | number; spec: Record<string, unknown>; svg: string; measured: Measure }[] = [];
        for (const value of values) {
          claims += 1;
          const spec = applied(module, example, control, value);
          let svg = "";
          try {
            svg = await paint(spec);
          } catch (error) {
            failures.push(`${module.type} ${control.id}=${value} did not render: ${error instanceof Error ? error.message : error}`);
            continue;
          }
          if (!svg.includes(`data-ck-type="${module.type}"`)) {
            failures.push(`${module.type} ${control.id}=${value} painted a different chart`);
            continue;
          }
          const measured = await measure(page, svg);
          for (const problem of frameProblems(spec, svg, measured)) {
            failures.push(`${module.type} ${control.id}=${value}: ${problem}`);
          }
          painted.push({ value, spec, svg, measured });
        }
        if (control.id === "legend") {
          for (const item of painted) {
            for (const problem of legendProblems(item.value, item.measured, module.type)) {
              failures.push(`${module.type} legend=${item.value}: ${problem}`);
            }
            if ((module.type === "rose" || module.type === "strip") && item.value !== "off" && (item.measured.legend?.swatches ?? 0) < 1) {
              failures.push(`${module.type} legend=${item.value}: legend has no swatches`);
            }
            if (module.type === "rose" && item.value !== "off") {
              for (const name of categoryNames(item.spec)) {
                const texts = item.measured.legend?.texts ?? [];
                const full = texts.some((text) => text === name || text.startsWith(`${name} `));
                if (!full) failures.push(`${module.type} legend=${item.value}: legend label is not the full name "${name}"`);
              }
            }
          }
          continue;
        }
        if (control.id === "tooltip") {
          for (const item of painted) {
            await armTip(page, demoTip(module.type), withPreviewSize(item.spec), item.svg);
            const points = await hoverPoints(page);
            let shown = "";
            for (const point of points) {
              await page.mouse.move(point.x, point.y);
              shown = await visibleTip(page);
              if (item.value === "off" && shown) break;
              if (item.value !== "off" && shown) break;
            }
            if (item.value === "off" && shown) failures.push(`${module.type} tooltip off still shows "${shown}"`);
            if (item.value !== "off" && !shown) failures.push(`${module.type} tooltip on shows no tooltip`);
            const valueCard = module.type === "gauge" || module.type === "kpi" || module.type === "progress-ring";
            if (valueCard && item.value !== "off" && shown && !/\d/.test(shown)) {
              failures.push(`${module.type} tooltip on card has no value ("${shown}")`);
            }
          }
          continue;
        }
        if (module.type === "radial-bar") {
          for (const item of painted) {
            for (const name of categoryNames(item.spec)) {
              if (!item.svg.includes(`>${xml(name)}<`) && !item.svg.includes(`>${name}<`)) {
                failures.push(`radial-bar ${control.id}=${item.value}: label "${name}" was shortened`);
              }
            }
            for (const width of [280, 380, 720, 390]) {
              const stuck = await labelsOutsidePane(page, item.svg, width);
              const where = width === 390 ? "phone" : `${width}px`;
              if (stuck.length) failures.push(`radial-bar ${control.id}=${item.value} at ${where}: ${stuck.slice(0, 3).join("; ")}`);
            }
          }
        }
        if (module.type === "tree" && control.id === "layout") {
          const tidy = painted.find((item) => item.value === "tidy");
          const cluster = painted.find((item) => item.value === "cluster");
          if (tidy && cluster) {
            const tidyLeaves = treeLeaves(tidy.svg);
            const clusterLeaves = treeLeaves(cluster.svg);
            const moved = tidyLeaves.some((leaf) => {
              const other = clusterLeaves.find((item) => item.id === leaf.id);
              return other !== undefined && (Math.abs(other.x - leaf.x) > 1 || Math.abs(other.y - leaf.y) > 1);
            });
            if (!moved) failures.push("tree layout geometry is the same for tidy and cluster");
            const xs = clusterLeaves.map((leaf) => leaf.x);
            const ys = clusterLeaves.map((leaf) => leaf.y);
            const aligned = xs.length > 1 && (Math.max(...xs) - Math.min(...xs) < 1.5 || Math.max(...ys) - Math.min(...ys) < 1.5);
            if (!aligned) failures.push("cluster leaves are not aligned at one depth");
          }
        }
        const distinct = new Set(painted.map((item) => normalize(item.svg)));
        if (painted.length > 1 && distinct.size < 2) {
          failures.push(`${module.type} ${control.id} does not change the painted chart`);
        }
      }
    }
  } finally {
    await browser.close();
  }

  assert.ok(claims >= 300, `expected the full control matrix, measured ${claims} claims`);
  const noise = consoleErrors.filter((line) => !/favicon|Failed to load resource/i.test(line));
  if (noise.length) failures.push(`console errors: ${[...new Set(noise)].slice(0, 6).join(" | ")}`);
  assert.equal(failures.length, 0, `${failures.length} control claims failed:\n${failures.join("\n")}\n(${claims} type×control claims checked)`);
});

test("docs rail scrolls on its own and the left nav has no Gallery link", { timeout: 60_000 }, async () => {
  const sidebarSource = readFileSync(new URL("../../components/SidebarCharts.astro", import.meta.url), "utf8");
  const injected = galleryAnchors(sidebarSource);
  const items = docsNavItems()
    .map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
    .join("");
  const blocks = `<ul class="side-nav">${items}${injected}</ul>`;
  const header = docsNavLinks.map((item) => `<a href="${item.href}">${item.label}</a>`).join("");
  const dir = mkdtempSync(join(tmpdir(), "ck-rail-"));
  const splitFile = join(dir, "split.js");
  await bundle(
    `import { mountDocsSplit } from ${JSON.stringify(join(root, "apps/web/src/scripts/docs-split.ts"))};
Object.assign(globalThis, { mountDocsSplit });`,
    "browser",
    splitFile,
  );

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.setContent(`<!doctype html><meta charset="utf-8"><style>${css} body{margin:0}</style>
      <header class="site-header">${header}</header>
      <div class="docs-frame">
        <aside class="docs-sidebar" id="docs-sidebar">${blocks}</aside>
        <article class="docs-main"><h1>Chart</h1><p style="min-height:2200px">The article is long enough that the page itself can scroll.</p></article>
        <aside class="docs-rail" id="docs-rail">
          <div class="rail-stack">
            <div class="docs-try-slot">
              <div class="docs-handle" id="docs-handle" role="separator" aria-orientation="vertical" aria-label="Resize try-it panel" tabindex="0"></div>
              <div class="docs-try chart-demo" id="docs-response">
                <div id="response-chart" class="chart-demo__chart" style="height:240px"></div>
                <div style="height:1400px">Focused controls and the spec sit under the chart.</div>
              </div>
            </div>
          </div>
        </aside>
      </div>`);
    await page.addScriptTag({ path: splitFile });
    await page.waitForFunction(() => typeof (globalThis as { mountDocsSplit?: unknown }).mountDocsSplit === "function");
    await page.evaluate(() => (globalThis as unknown as { mountDocsSplit: () => void }).mountDocsSplit());

    const gallery = await page.locator("#docs-sidebar a").evaluateAll((links) =>
      links
        .filter((link) => link.getAttribute("href") === "/gallery" || (link.textContent || "").trim() === "Gallery")
        .map((link) => (link.textContent || "").trim()),
    );
    assert.deepEqual(gallery, []);
    const headerGallery = await page.locator(".site-header a[href='/gallery']").count();
    assert.equal(headerGallery, 1);

    const rail = page.locator("#docs-rail");
    const railBox = await rail.boundingBox();
    assert.ok(railBox);
    await page.mouse.move(railBox.x + railBox.width / 2, railBox.y + Math.min(180, railBox.height / 2));
    const before = await page.evaluate(() => ({ y: window.scrollY, top: document.querySelector("#docs-rail")!.scrollTop }));
    await page.mouse.wheel(0, 480);
    const after = await page.evaluate(() => ({ y: window.scrollY, top: document.querySelector("#docs-rail")!.scrollTop }));
    assert.ok(after.top > before.top, `rail scrollTop stayed ${after.top}`);
    assert.equal(after.y, before.y);

    await page.evaluate(() => {
      const railEl = document.querySelector("#docs-rail");
      if (railEl) railEl.scrollTop = 0;
    });
    const handle = page.locator("#docs-handle");
    const chart = page.locator("#response-chart");
    const handleBox = await handle.boundingBox();
    const chartBox = await chart.boundingBox();
    assert.ok(handleBox && chartBox);
    assert.ok(handleBox.y < chartBox.y + chartBox.height && handleBox.y + handleBox.height > chartBox.y, "resize handle is not anchored to the chart");
    const beforeTry = await page.evaluate(() => document.querySelector(".docs-try")!.getBoundingClientRect().width);
    await page.mouse.move(handleBox.x + handleBox.width / 2, chartBox.y + chartBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox.x - 70, chartBox.y + chartBox.height / 2);
    await page.mouse.up();
    const afterTry = await page.evaluate(() => document.querySelector(".docs-try")!.getBoundingClientRect().width);
    assert.ok(afterTry > beforeTry + 20, `drag did not widen the rail (${beforeTry} → ${afterTry})`);

    await page.setViewportSize({ width: 390, height: 844 });
    await rail.evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.mouse.move(180, 320);
    const narrowBefore = await page.evaluate(() => ({ y: window.scrollY, top: (document.querySelector("#docs-rail") as HTMLElement).scrollTop }));
    await page.mouse.wheel(0, 400);
    const narrowAfter = await page.evaluate(() => ({ y: window.scrollY, top: (document.querySelector("#docs-rail") as HTMLElement).scrollTop }));
    assert.equal(narrowAfter.top, narrowBefore.top);
    assert.ok(narrowAfter.y > narrowBefore.y, "stacked layout should keep page scroll");
  } finally {
    await browser.close();
  }
});
