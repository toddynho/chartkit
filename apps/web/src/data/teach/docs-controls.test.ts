/**
 * Docs control sweep.
 * Every teach-page chart type, every focused control, and every example is painted.
 * Combo also applies every combination of its controls to every combo example.
 * Each control id has a claim checker. A new id fails until it is checked.
 * A value that paints the same picture as another fails, unless CLAIM_ALLOWLIST
 * names that value and says why. A waiver that omits values excuses every value
 * of a control on the page, and that fails. The checker reads the painted SVG, not the spec.
 * Legend position compares the legend box to the plot or mark box. Top means the
 * legend's bottom edge is at or above the plot's top. Bottom, right, and left
 * mirror that. The legend also has to sit inside the frame and off the marks.
 * A legend that only exists, or that moves a few pixels, fails.
 * Every painted control state has to validate and draw a chart.
 * Every text node, including a rotated axis title, has to sit inside the view box.
 * The box is the painted glyphs, after rotation. A label that ends in an ellipsis,
 * or that is a prefix of a longer data label, fails.
 * A treemap at depth 2 or greater must paint different fills inside a group and
 * separate each child from its parent. That claim is not allowlisted.
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
import { CLAIM_ALLOWLIST, effectProblems, legendProblems, legendWaived, truncationProblems, type LegendRead } from "./docs-claims.ts";
import { treemapShadeProblems } from "../../../../../scripts/render-harness/treemap-shade.mjs";
import { demoTip, type DemoTip } from "./demo-tip.ts";
import { teachModules } from "./registry.ts";
import type { TeachControl, TeachModule } from "./types.ts";

const css = ["global.css", "docs.css", "teach.css"]
  .map((name) => readFileSync(new URL(`../../styles/${name}`, import.meta.url), "utf8"))
  .join("\n");

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
  legend: LegendRead | null;
};

type DiagnosticResult = { ok: boolean; errors: { code: string; message: string }[] };

type Runtime = {
  render: (spec: Record<string, unknown>) => string | null;
  renderGeo: (spec: Record<string, unknown>) => Promise<string>;
  renderBarList: (spec: Record<string, unknown>) => string | null;
  validate: (spec: unknown) => DiagnosticResult;
  validatePhase4: (spec: unknown) => DiagnosticResult;
  validateGeo: (spec: unknown) => DiagnosticResult;
};

const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);

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
  const validate = join(root, "packages/core/src/validate.ts");
  const phase4 = join(root, "packages/core/src/validate-phase4.ts");
  await bundle(
    [
      `export { render } from ${JSON.stringify(core)};`,
      `export { render as renderGeo, validate as validateGeo } from ${JSON.stringify(geo)};`,
      `export { renderBarList } from ${JSON.stringify(barList)};`,
      `export { validate } from ${JSON.stringify(validate)};`,
      `export { validatePhase4 } from ${JSON.stringify(phase4)};`,
    ].join("\n"),
    "node",
    outfile,
  );
  return import(pathToFileURL(outfile).href) as Promise<Runtime>;
}

function valuesOf(control: TeachControl): (string | number)[] {
  if (control.kind === "choice") return control.options.map((option) => option.value);
  const mid = control.min + Math.round((control.max - control.min) / 2 / control.step) * control.step;
  const clamped = Math.min(control.max, Math.max(control.min, Number(mid.toFixed(6))));
  return [...new Set([control.min, clamped, control.max])];
}

function ckErrors(type: string, spec: Record<string, unknown>): string[] {
  const sized = withPreviewSize(spec);
  const result =
    type === "choropleth" || type === "map-points"
      ? runtime.validateGeo(sized)
      : PHASE4.has(type)
        ? runtime.validatePhase4(sized)
        : runtime.validate(sized);
  return result.errors.map((item) => `${item.code}: ${item.message}`);
}

/** A blank rail is an error SVG, or a chart frame with no series geometry. */
function emptyChart(svg: string): boolean {
  if (!svg.trim() || svg.includes("ck-chart-error")) return true;
  if (svg.includes("data-ck-mark=")) return false;
  if (/data-ck-key="[abp]:/.test(svg)) return false;
  const body = svg.replace(/<defs[\s\S]*?<\/defs>/g, "");
  return !/<path\b[^>]*\bstroke=/.test(body);
}

function controlStates(controls: TeachControl[]): { id: string; value: string | number }[][] {
  let states: { id: string; value: string | number }[][] = [[]];
  for (const control of controls) {
    const next: { id: string; value: string | number }[][] = [];
    for (const state of states) {
      for (const value of valuesOf(control)) next.push([...state, { id: control.id, value }]);
    }
    states = next;
  }
  return states;
}

function applied(module: TeachModule, example: TeachModule["examples"][number], control: TeachControl, value: string | number): Record<string, unknown> {
  const spec = structuredClone(example.spec);
  const restore = control.id === "tooltip" ? example.spec.tooltip : example.spec;
  module.apply(spec, { id: control.id, value, restore });
  return spec;
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
    const svgScreen = svgEl.getBoundingClientRect();
    const sx = view.width > 0 && svgScreen.width > 0 ? view.width / svgScreen.width : 1;
    const sy = view.height > 0 && svgScreen.height > 0 ? view.height / svgScreen.height : 1;
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
      const x = (item.box.left - svgScreen.left) * sx;
      const y = (item.box.top - svgScreen.top) * sy;
      const w = item.box.width * sx;
      const h = item.box.height * sy;
      const slack = 1;
      const over = Math.max(-x, -y, x + w - view.width, y + h - view.height);
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
    const shown = (node: Element) => {
      let el: Element | null = node;
      while (el && el !== svgEl) {
        const style = el.getAttribute("style") || "";
        if (/display\s*:\s*none/.test(style)) return false;
        el = el.parentElement;
      }
      return true;
    };
    const viewW = view.width || Number(svgEl.getAttribute("width")) || 0;
    const viewH = view.height || Number(svgEl.getAttribute("height")) || 0;
    const markBoxes: { x: number; y: number; w: number; h: number }[] = [];
    let mx0 = Infinity;
    let my0 = Infinity;
    let mx1 = -Infinity;
    let my1 = -Infinity;
    for (const node of svgEl.querySelectorAll("[data-ck-mark], .ck-geo-region, .ck-geo-point")) {
      if (!(node instanceof SVGGraphicsElement) || !shown(node) || node.closest("[data-ck-legend]")) continue;
      const box = node.getBBox();
      if (box.width < 0.5 && box.height < 0.5) continue;
      if (viewW > 0 && box.width > viewW * 0.95 && box.height > viewH * 0.95) continue;
      markBoxes.push({ x: box.x, y: box.y, w: box.width, h: box.height });
      mx0 = Math.min(mx0, box.x);
      my0 = Math.min(my0, box.y);
      mx1 = Math.max(mx1, box.x + box.width);
      my1 = Math.max(my1, box.y + box.height);
    }
    let markBox = markBoxes.length ? { x: mx0, y: my0, w: mx1 - mx0, h: my1 - my0 } : null;
    const clips = [...svgEl.querySelectorAll("clipPath rect")]
      .map((clip) => ({
        x: Number(clip.getAttribute("x")) || 0,
        y: Number(clip.getAttribute("y")) || 0,
        w: Number(clip.getAttribute("width")) || 0,
        h: Number(clip.getAttribute("height")) || 0,
      }))
      .filter((box) => box.w > 8 && box.h > 8 && (viewW <= 0 || box.w * box.h < viewW * viewH * 0.92));
    let plot: { x: number; y: number; w: number; h: number } | null = null;
    let best = 0;
    for (const box of clips) {
      let hits = 0;
      for (const mark of markBoxes) {
        const cx = mark.x + mark.w / 2;
        const cy = mark.y + mark.h / 2;
        if (cx >= box.x && cx <= box.x + box.w && cy >= box.y && cy <= box.y + box.h) hits += 1;
      }
      if (hits > best) {
        best = hits;
        plot = box;
      }
    }
    if (!plot && clips.length === 1 && markBoxes.length === 0) plot = clips[0] ?? null;
    if (plot && plot.w > 0 && plot.h > 0) {
      const clipped: { x: number; y: number; w: number; h: number }[] = [];
      for (const mark of markBoxes) {
        const x0 = Math.max(mark.x, plot.x);
        const y0 = Math.max(mark.y, plot.y);
        const x1 = Math.min(mark.x + mark.w, plot.x + plot.w);
        const y1 = Math.min(mark.y + mark.h, plot.y + plot.h);
        if (x1 - x0 < 0.5 || y1 - y0 < 0.5) continue;
        clipped.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
      }
      markBoxes.length = 0;
      let cx0 = Infinity;
      let cy0 = Infinity;
      let cx1 = -Infinity;
      let cy1 = -Infinity;
      for (const mark of clipped) {
        markBoxes.push(mark);
        cx0 = Math.min(cx0, mark.x);
        cy0 = Math.min(cy0, mark.y);
        cx1 = Math.max(cx1, mark.x + mark.w);
        cy1 = Math.max(cy1, mark.y + mark.h);
      }
      if (clipped.length) markBox = { x: cx0, y: cy0, w: cx1 - cx0, h: cy1 - cy0 };
      else markBox = null;
    }
    const legendEl = svgEl.querySelector("[data-ck-legend]");
    const legendNodes: SVGGraphicsElement[] = [];
    if (legendEl) {
      for (const node of legendEl.querySelectorAll("text,rect,circle,path,line,polygon")) {
        if (node instanceof SVGGraphicsElement && shown(node)) legendNodes.push(node);
      }
    } else {
      const keyed = [...svgEl.querySelectorAll("[data-ck-key]")].filter((node) => {
        const key = node.getAttribute("data-ck-key") || "";
        return key.startsWith("leg:") || key.startsWith("legt:");
      });
      if (keyed.length) {
        for (const node of keyed) if (node instanceof SVGGraphicsElement && shown(node)) legendNodes.push(node);
      } else {
        for (const node of svgEl.querySelectorAll("rect,circle,path,polygon")) {
          if (!(node instanceof SVGGraphicsElement) || node.closest("[data-ck-mark]")) continue;
          const next = node.nextElementSibling;
          if (!(next instanceof SVGGraphicsElement) || next.localName !== "text") continue;
          const box = node.getBBox();
          if (box.width < 2 || box.height < 2 || box.width > 16 || box.height > 16) continue;
          legendNodes.push(node, next);
        }
      }
    }
    let local: { x: number; y: number; w: number; h: number } | null = null;
    let screen = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
    if (legendNodes.length) {
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      let sx0 = Infinity;
      let sy0 = Infinity;
      let sx1 = -Infinity;
      let sy1 = -Infinity;
      let counted = 0;
      for (const node of legendNodes) {
        const box = node.getBBox();
        const seen = node.getBoundingClientRect();
        if (seen.width < 0.5 && seen.height < 0.5) continue;
        counted += 1;
        x0 = Math.min(x0, box.x);
        y0 = Math.min(y0, box.y);
        x1 = Math.max(x1, box.x + box.width);
        y1 = Math.max(y1, box.y + box.height);
        sx0 = Math.min(sx0, seen.left);
        sy0 = Math.min(sy0, seen.top);
        sx1 = Math.max(sx1, seen.right);
        sy1 = Math.max(sy1, seen.bottom);
      }
      if (counted > 0) {
        local = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
        screen = { left: sx0, top: sy0, right: sx1, bottom: sy1, width: sx1 - sx0, height: sy1 - sy0 };
      }
    }
    const slack = 1.5;
    const swatches = legendNodes.filter((node) => {
      if (node.localName !== "rect") return false;
      const w = Number(node.getAttribute("width"));
      const h = Number(node.getAttribute("height"));
      return w >= 8 && w <= 14 && h >= 8 && h <= 14;
    }).length;
    const legendTexts = legendNodes
      .filter((node) => node.localName === "text")
      .map((node) => (node.textContent || "").replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const legend = local
      ? {
          x: local.x,
          y: local.y,
          w: local.w,
          h: local.h,
          insideView: local.x >= -1 && local.y >= -1 && local.x + local.w <= viewW + 1 && local.y + local.h <= viewH + 1,
          screenInside:
            screen.width > 1 &&
            screen.height > 1 &&
            screen.left >= pane.left - slack &&
            screen.top >= pane.top - slack &&
            screen.right <= pane.right + slack &&
            screen.bottom <= pane.bottom + slack,
          plot,
          markBox,
          marks: markBoxes,
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

async function hoverPoints(page: Page): Promise<{ x: number; y: number }[]> {
  return page.evaluate(() => {
    const svg = document.querySelector("#response-chart svg");
    if (!(svg instanceof SVGSVGElement)) return [];
    const box = svg.getBoundingClientRect();
    const marks = [...svg.querySelectorAll("[data-ck-mark], .ck-geo-point, .ck-geo-region[data-ck-value]")];
    const points: { x: number; y: number }[] = [];
    const push = (x: number, y: number) => {
      if (x < box.x || y < box.y || x > box.x + box.width || y > box.y + box.height) return;
      points.push({ x, y });
    };
    for (const mark of marks) {
      const b = mark.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) continue;
      push(b.x + b.width / 2, b.y + b.height / 2);
      for (const inset of [3, 6, 12]) {
        push(b.x + b.width / 2, b.y + inset);
        push(b.x + b.width / 2, b.y + b.height - inset);
        push(b.x + inset, b.y + b.height / 2);
        push(b.x + b.width - inset, b.y + b.height / 2);
      }
      if (points.length >= 16) break;
    }
    push(box.x + box.width * 0.42, box.y + box.height * 0.48);
    push(box.x + box.width * 0.62, box.y + box.height * 0.55);
    push(box.x + box.width * 0.5, box.y + box.height * 0.32);
    return points.slice(0, 18);
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

test("treemap nested shading is not an allowlisted claim", () => {
  assert.equal(
    CLAIM_ALLOWLIST.some((item) => item.id === "shade" || item.id === "treemap-shade"),
    false,
  );
});

test("claim allowlist does not excuse a no-op docs control", () => {
  const hits: string[] = [];
  for (const item of CLAIM_ALLOWLIST) {
    if (item.values && item.values.length > 0) continue;
    const modules = Object.values(teachModules).filter((module) => item.type == null || module.type === item.type);
    const rendered = modules.some(
      (module) =>
        module.controls.some((control) => control.id === item.id) &&
        module.examples.some((example) => item.example == null || example.id === item.example),
    );
    if (rendered) hits.push(`${item.type ?? "*"} ${item.example ?? "*"} ${item.id}`);
  }
  assert.deepEqual(hits, []);
});

test("docs controls paint a claim for every teach control", { timeout: 900_000 }, async () => {
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

  const failures: Fail[] = [];
  const combo = teachModules.combo;
  if (combo) {
    for (const example of combo.examples) {
      for (const state of controlStates(combo.controls)) {
        const spec = structuredClone(example.spec);
        for (const action of state) {
          const restore = action.id === "tooltip" ? example.spec.tooltip : example.spec;
          combo.apply(spec, { ...action, restore });
        }
        const where = `combo ${example.id} ${state.map((action) => `${action.id}=${action.value}`).join(" ")}`;
        let svg = "";
        try {
          svg = await paint(spec);
        } catch (error) {
          failures.push(`${where} did not render: ${error instanceof Error ? error.message : error}`);
          continue;
        }
        for (const issue of ckErrors("combo", spec)) failures.push(`${where}: ${issue}`);
        if (!svg.includes('data-ck-type="combo"') || emptyChart(svg)) failures.push(`${where}: empty chart`);
        for (const problem of truncationProblems(spec, svg)) failures.push(`${where}: ${problem}`);
      }
    }
  }

  const browser = await chromium.launch({ headless: true });
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
      if (!module.examples.length) {
        failures.push(`${module.type} has no example`);
        continue;
      }
      for (const control of module.controls) {
        const values = valuesOf(control);
        for (const example of module.examples) {
          const painted: { value: string | number; spec: Record<string, unknown>; svg: string; measured: Measure }[] = [];
          for (const value of values) {
            claims += 1;
            const where = `${module.type} ${example.id} ${control.id}=${value}`;
            const spec = applied(module, example, control, value);
            let svg = "";
            try {
              svg = await paint(spec);
            } catch (error) {
              failures.push(`${where} did not render: ${error instanceof Error ? error.message : error}`);
              continue;
            }
            if (!svg.includes(`data-ck-type="${module.type}"`)) {
              failures.push(`${where} painted a different chart`);
              continue;
            }
            for (const issue of ckErrors(module.type, spec)) failures.push(`${where}: ${issue}`);
            if (emptyChart(svg)) failures.push(`${where}: empty chart`);
            const measured = await measure(page, svg);
            const frameWaived = CLAIM_ALLOWLIST.some(
              (item) => item.id === "frame" && item.type === module.type && (item.example == null || item.example === example.id),
            );
            if (!frameWaived) {
              for (const problem of frameProblems(spec, svg, measured)) {
                failures.push(`${where}: ${problem}`);
              }
            }
            for (const problem of truncationProblems(spec, svg)) {
              failures.push(`${where}: ${problem}`);
            }
            if (module.type === "treemap") {
              for (const problem of treemapShadeProblems(svg)) failures.push(`${where}: ${problem}`);
            }
            painted.push({ value, spec, svg, measured });
          }
          if (control.id === "legend" && !legendWaived(module.type, example.id)) {
            for (const item of painted) {
              for (const problem of legendProblems(item.value, item.measured)) {
                failures.push(`${module.type} ${example.id} legend=${item.value}: ${problem}`);
              }
              if ((module.type === "rose" || module.type === "strip") && item.value !== "off" && (item.measured.legend?.swatches ?? 0) < 1) {
                failures.push(`${module.type} ${example.id} legend=${item.value}: legend has no swatches`);
              }
              if (module.type === "rose" && item.value !== "off") {
                for (const name of categoryNames(item.spec)) {
                  const texts = item.measured.legend?.texts ?? [];
                  const full = texts.some((text) => text === name || text.startsWith(`${name} `));
                  if (!full) failures.push(`${module.type} ${example.id} legend=${item.value}: legend label is not the full name "${name}"`);
                }
              }
            }
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
              if (item.value !== "off" && !shown) {
                const hit = await page.evaluate(() => {
                  const host = document.querySelector("#response-chart");
                  if (!(host instanceof HTMLElement)) return null;
                  const box = host.getBoundingClientRect();
                  for (let y = box.top + 2; y < box.bottom; y += 6) {
                    for (let x = box.left + 2; x < box.right; x += 8) {
                      const el = document.elementFromPoint(x, y);
                      const mark = el instanceof Element ? el.closest("[data-ck-mark], .ck-geo-region, .ck-geo-point") : null;
                      if (mark?.getAttribute("aria-label")) return { x, y };
                    }
                  }
                  return null;
                });
                if (hit) {
                  await page.mouse.move(hit.x, hit.y);
                  shown = await visibleTip(page);
                }
              }
              if (item.value === "off" && shown) failures.push(`${module.type} ${example.id} tooltip off still shows "${shown}"`);
              if (item.value !== "off" && !shown) failures.push(`${module.type} ${example.id} tooltip on shows no tooltip`);
              const valueCard = module.type === "gauge" || module.type === "kpi" || module.type === "progress-ring";
              if (valueCard && item.value !== "off" && shown && !/\d/.test(shown)) {
                failures.push(`${module.type} ${example.id} tooltip on card has no value ("${shown}")`);
              }
            }
            continue;
          }
          if (module.type === "radial-bar") {
            for (const item of painted) {
              for (const name of categoryNames(item.spec)) {
                if (!item.svg.includes(`>${xml(name)}<`) && !item.svg.includes(`>${name}<`)) {
                  failures.push(`radial-bar ${example.id} ${control.id}=${item.value}: label "${name}" was shortened`);
                }
              }
              for (const width of [280, 380, 720, 390]) {
                const stuck = await labelsOutsidePane(page, item.svg, width);
                const where = width === 390 ? "phone" : `${width}px`;
                if (stuck.length) failures.push(`radial-bar ${example.id} ${control.id}=${item.value} at ${where}: ${stuck.slice(0, 3).join("; ")}`);
              }
            }
          }
          const layoutWaived = CLAIM_ALLOWLIST.some(
            (item) => item.id === "layout" && item.type === module.type && (item.example == null || item.example === example.id) && item.values == null,
          );
          if (module.type === "tree" && control.id === "layout" && !layoutWaived) {
            const tidy = painted.find((item) => item.value === "tidy");
            const cluster = painted.find((item) => item.value === "cluster");
            if (tidy && cluster) {
              const tidyLeaves = treeLeaves(tidy.svg);
              const clusterLeaves = treeLeaves(cluster.svg);
              const moved = tidyLeaves.some((leaf) => {
                const other = clusterLeaves.find((item) => item.id === leaf.id);
                return other !== undefined && (Math.abs(other.x - leaf.x) > 12 || Math.abs(other.y - leaf.y) > 12);
              });
              if (!moved) failures.push("tree layout geometry is the same for tidy and cluster");
              const xs = clusterLeaves.map((leaf) => leaf.x);
              const ys = clusterLeaves.map((leaf) => leaf.y);
              const aligned = xs.length > 1 && (Math.max(...xs) - Math.min(...xs) < 1.5 || Math.max(...ys) - Math.min(...ys) < 1.5);
              if (!aligned) failures.push("cluster leaves are not aligned at one depth");
            }
          }
          for (const problem of effectProblems(module.type, example.id, control.id, painted)) {
            failures.push(`${module.type} ${example.id} ${problem}`);
          }
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
