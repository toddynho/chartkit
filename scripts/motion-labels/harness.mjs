/**
 * Browser harness for the motion label checks.
 * Bundles `mount()` from the vanilla adapter against packages/core/src, opens it in Chromium, and
 * drives time with Playwright's clock, so a test asks for the frame at a given millisecond instead
 * of sleeping. `requestAnimationFrame` and `performance.now` both run on that clock.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

export const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

export const BASE = {
  version: "1",
  type: "bar",
  title: "US online spend, Cyber Week 2024 ($B)",
  subtitle: "2024 actuals · Adobe Analytics",
  data: [
    { day: "Thanksgiving", spend: 6.1 },
    { day: "Black Friday", spend: 10.8 },
    { day: "Saturday", spend: 5.3 },
    { day: "Sunday", spend: 5.6 },
    { day: "Cyber Monday", spend: 13.3 },
  ],
  encoding: { x: "day", y: "spend" },
  mark: { orientation: "horizontal", labels: true, labelFormat: { style: "number", decimals: 2, prefix: "$", suffix: "B" } },
  motion: { duration: 800 },
  size: { width: 640, height: 360 },
  a11y: { alt: "Horizontal bars of US online spend by Cyber Week day in 2024." },
};

export function withSpend(spec, values) {
  return { ...spec, data: spec.data.map((row, i) => ({ ...row, spend: values[i] })) };
}
export const NEXT = withSpend(BASE, [6.4, 11.8, 5.8, 6.0, 14.25]);
export const DESC = { by: "value", order: "descending" };
export const SORTED = { ...NEXT, sort: DESC };
/** Bug B's repro: closer values, so more rows trade places. */
export const X = withSpend(BASE, [7.1, 13.0, 6.1, 6.4, 15.1]);

/** Build the browser bundle from `src` (a packages/core/src directory). Returns the script text. */
export async function bundle(src = join(root, "packages/core/src"), vanilla = join(root, "packages/vanilla/src/index.ts")) {
  const work = join(tmpdir(), `chartkit-motion-labels-${process.pid}-${Math.random().toString(36).slice(2, 8)}`);
  mkdirSync(work, { recursive: true });
  const entry = join(work, "entry.mjs");
  writeFileSync(entry, `export { mount } from ${JSON.stringify(vanilla)};\nexport { render } from ${JSON.stringify(join(src, "all.ts"))};\n`);
  const outfile = join(work, "bundle.js");
  await build({
    entryPoints: [entry],
    bundle: true,
    format: "iife",
    globalName: "CK",
    platform: "browser",
    outfile,
    logLevel: "silent",
    alias: {
      "@chartkitdev/core/canvas/hydrate": join(src, "canvas/hydrate.ts"),
      "@chartkitdev/core/export-menu": join(src, "export-menu.ts"),
      "@chartkitdev/core/export": join(src, "export.ts"),
      "@chartkitdev/core/extra-tip": join(src, "extra-tip.ts"),
      "@chartkitdev/core/extra": join(src, "extra.ts"),
      "@chartkitdev/core/all": join(src, "all.ts"),
      "@chartkitdev/core/interact": join(src, "interact.ts"),
      "@chartkitdev/core": join(src, "index.ts"),
    },
  });
  return readFileSync(outfile, "utf8");
}

const HTML = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:24px;background:#fff;font-family:Arial,sans-serif}#host{width:640px}</style><div id="host"></div>`;

/**
 * A page with the clock paused and `spec` mounted in `#host` as `window.chart`.
 * `reducedMotion: "reduce"` emulates the media query.
 */
export async function open(browser, source, spec, options = {}) {
  const context = await browser.newContext({ viewport: { width: 720, height: 460 }, deviceScaleFactor: options.scale ?? 1, reducedMotion: options.reducedMotion ?? "no-preference" });
  const page = await context.newPage();
  await page.clock.install({ time: 0 });
  await page.setContent(HTML);
  await page.clock.pauseAt(1000);
  await page.addScriptTag({ content: source });
  await page.evaluate((first) => {
    window.chart = window.CK.mount(document.getElementById("host"), first);
  }, spec);
  return page;
}

/** Call `update(spec)`. The morph is armed but no time has passed. */
export async function update(page, spec) {
  await page.evaluate((next) => window.chart.update(next), spec);
}

/** Advance the page clock. Frames fire on the way. */
export async function advance(page, ms) {
  await page.clock.runFor(ms);
}

/** Painted boxes, in SVG user units (the SVG is drawn 1:1 here), read from the live DOM. */
export async function frame(page) {
  return page.evaluate(() => {
    const host = document.getElementById("host");
    const svg = host.querySelector("svg");
    const origin = svg.getBoundingClientRect();
    const box = (node) => {
      const r = node.getBoundingClientRect();
      return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height };
    };
    const shown = (node) => {
      const style = getComputedStyle(node);
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0.01;
    };
    const item = (node) => ({ key: node.getAttribute("data-ck-key") || "", text: node.textContent, opacity: Number(getComputedStyle(node).opacity), ...box(node) });
    const all = (selector) => Array.from(host.querySelectorAll(selector));
    const view = svg.viewBox.baseVal;
    const texts = all("svg text");
    const chrome = texts.filter((node) => !node.hasAttribute("data-ck-key") && !node.closest("[data-ck-key]"));
    return {
      view: { w: view.width, h: view.height },
      bars: all('svg rect[data-ck-key^="b:"]').map(item),
      cats: all('svg text[data-ck-key^="x:"]').filter(shown).map(item),
      values: all('svg text[data-ck-key^="v:"]').filter(shown).map(item),
      deltas: all("[data-ck-delta]").filter(shown).map((node) => ({ ...item(node), fontSize: getComputedStyle(node).fontSize })),
      chrome: chrome.map(item),
      markup: host.innerHTML,
    };
  });
}

export function intersects(a, b, slack = 0.5) {
  return a.x + a.w > b.x + slack && b.x + b.w > a.x + slack && a.y + a.h > b.y + slack && b.y + b.h > a.y + slack;
}
