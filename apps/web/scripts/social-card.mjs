/**
 * Default Open Graph card for chartkit.dev.
 * 1200×630 PNG. The chart is ChartKit SSR. Rasterizing uses the Cloud
 * resvg-wasm path: apps/cloud/src/png.ts (forRaster + rasterize) and the
 * Inter and Roboto files in apps/cloud/fonts. The wordmark is the committed
 * brand lockup, so the title is the same face as the site header.
 *
 *   node apps/web/scripts/social-card.mjs
 *
 * Re-running writes the same bytes. X shows a large card in a 2:1 center
 * crop, which on this canvas is y 15–615. The wordmark and the tagline sit
 * inside that band.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

process.env.TZ = "UTC";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const root = join(webRoot, "../..");
const outPath = join(webRoot, "public/og/chartkit.png");

const WIDTH = 1200;
const HEIGHT = 630;
/** Center 2:1 of a 1200×630 card. X crops the 15px above and below this band. */
const SAFE_TOP = (HEIGHT - WIDTH / 2) / 2;
const SAFE_BOTTOM = HEIGHT - SAFE_TOP;

const BG = "#f5f5f7";
const CARD = "#ffffff";
const LINE = "#e6e6e2";
const TAG = "#55575c";
const TAGLINE = "Charts an agent can write and a server can render";

const wordmark = { x: 64, y: 36, scale: 2 };
const TAG_SIZE = 26;
const tagX = wordmark.x + 16 * wordmark.scale;
const wordBaseline = wordmark.y + 34.7 * wordmark.scale;
const tagBaseline = Math.round(wordBaseline + TAG_SIZE + 22);

const panel = {
  x: 56,
  y: tagBaseline + 32,
  w: WIDTH - 112,
  r: 18,
};
panel.h = 586 - panel.y;
const chartBox = {
  x: panel.x + 8,
  y: panel.y + 4,
  w: panel.w - 16,
  h: panel.h - 12,
};

const spec = {
  version: "1",
  id: "social-card",
  type: "line",
  theme: { preset: "soft", tokens: { fontFamily: "Inter", background: CARD } },
  locale: "en-US",
  data: [
    { month: "Jan", revenue: 42, target: 40 },
    { month: "Feb", revenue: 46, target: 43 },
    { month: "Mar", revenue: 44, target: 46 },
    { month: "Apr", revenue: 51, target: 49 },
    { month: "May", revenue: 58, target: 52 },
    { month: "Jun", revenue: 55, target: 55 },
    { month: "Jul", revenue: 63, target: 58 },
    { month: "Aug", revenue: 61, target: 61 },
    { month: "Sep", revenue: 70, target: 64 },
    { month: "Oct", revenue: 74, target: 67 },
    { month: "Nov", revenue: 72, target: 70 },
    { month: "Dec", revenue: 81, target: 73 },
  ],
  encoding: {
    x: "month",
    y: [
      { field: "revenue", title: "Revenue", area: true },
      { field: "target", title: "Target", dash: "dashed" },
    ],
  },
  mark: { curve: "monotone", points: "none" },
  legend: { position: "top" },
  axes: { y: { grid: "dashed" } },
  size: { width: chartBox.w, height: chartBox.h },
  a11y: {
    alt: "Revenue stays near the target and finishes the year above it, at 81 against a target of 73.",
  },
};

function assertSafe() {
  const wordTop = wordmark.y;
  const wordBottom = wordmark.y + 56 * wordmark.scale;
  const tagTop = tagBaseline - TAG_SIZE;
  const tagBottom = tagBaseline + 8;
  const titleTop = Math.min(wordTop, tagTop);
  const titleBottom = Math.max(wordBottom, tagBottom);
  if (titleTop < SAFE_TOP + 12 || titleBottom > SAFE_BOTTOM - 12) {
    throw new Error(`title sits outside the 2:1 crop (${titleTop}–${titleBottom}, safe ${SAFE_TOP}–${SAFE_BOTTOM})`);
  }
  if (panel.y < SAFE_TOP || panel.y + panel.h > SAFE_BOTTOM) {
    throw new Error(`chart panel leaves the 2:1 crop (${panel.y}–${panel.y + panel.h})`);
  }
}

function flattenCalc(input) {
  return input.replace(/calc\(\s*([0-9.]+)\s*\*\s*([0-9.]+)\s*\)/g, (_, a, b) => {
    const value = Number(a) * Number(b);
    return String(Math.round(value * 1000) / 1000);
  });
}

function xml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function loadRender() {
  const outfile = join(tmpdir(), "ck-social-card.mjs");
  await build({
    stdin: {
      contents: 'export { render } from "./packages/core/src/extra.ts";\n',
      resolveDir: root,
      sourcefile: "social-card-entry.ts",
      loader: "ts",
    },
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "warning",
    legalComments: "none",
  });
  return import(pathToFileURL(outfile).href);
}

function chartSvg(svg) {
  if (typeof svg !== "string" || !svg.includes("<svg") || svg.includes("ck-chart-error")) {
    throw new Error("ChartKit did not draw the social chart");
  }
  if (!svg.includes('data-ck-type="line"')) throw new Error("social chart is not a line");
  const width = Number(/\bwidth="([0-9.]+)"/.exec(svg)?.[1]);
  const height = Number(/\bheight="([0-9.]+)"/.exec(svg)?.[1]);
  if (width !== chartBox.w || height !== chartBox.h) {
    throw new Error(`chart rendered ${width}×${height}, expected ${chartBox.w}×${chartBox.h}`);
  }
  return svg;
}

function cardSvg(chartPng, wordmarkPng) {
  const chartHref = `data:image/png;base64,${chartPng.toString("base64")}`;
  const wordHref = `data:image/png;base64,${wordmarkPng.toString("base64")}`;
  const wordW = 280 * wordmark.scale;
  const wordH = 56 * wordmark.scale;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">`,
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>`,
    `<image x="${wordmark.x}" y="${wordmark.y}" width="${wordW}" height="${wordH}" href="${wordHref}"/>`,
    `<text x="${tagX}" y="${tagBaseline}" fill="${TAG}" font-family="Inter, sans-serif" font-size="${TAG_SIZE}" letter-spacing="-0.3">${xml(TAGLINE)}</text>`,
    `<rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" rx="${panel.r}" fill="${CARD}" stroke="${LINE}" stroke-width="1"/>`,
    `<image x="${chartBox.x}" y="${chartBox.y}" width="${chartBox.w}" height="${chartBox.h}" href="${chartHref}"/>`,
    `</svg>`,
  ].join("");
}

async function main() {
  assertSafe();
  const { render } = await loadRender();
  const png = await import(pathToFileURL(join(root, "apps/cloud/src/png.ts")).href);
  const baked = flattenCalc(png.forRaster(chartSvg(render(spec)), false, "Inter"));
  if (baked.includes("light-dark(") || baked.includes("var(") || baked.includes("calc(")) {
    throw new Error("chart SVG still has unresolved CSS");
  }
  const chartPng = Buffer.from(await png.rasterize(baked, 1));
  const wordmarkPng = readFileSync(join(webRoot, "public/brand/wordmark-light.png"));
  const { Resvg } = await import("@resvg/resvg-wasm");
  const fonts = ["Inter-Regular.ttf", "Roboto-Regular.ttf"].map((name) => readFileSync(join(root, "apps/cloud/fonts", name)));
  const renderer = new Resvg(cardSvg(chartPng, wordmarkPng), {
    fitTo: { mode: "width", value: WIDTH },
    background: BG,
    font: {
      fontBuffers: fonts,
      defaultFontFamily: "Inter",
      sansSerifFamily: "Inter",
    },
  });
  let image;
  try {
    image = renderer.render();
    if (image.width !== WIDTH || image.height !== HEIGHT) {
      throw new Error(`card raster is ${image.width}×${image.height}`);
    }
    const bytes = Buffer.from(image.asPng());
    if (bytes.length > 300 * 1024) {
      throw new Error(`card is ${bytes.length} bytes, over the 300 KB cap`);
    }
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, bytes);
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    console.log(`${outPath} ${WIDTH}×${HEIGHT} ${bytes.length} bytes ${hash}`);
  } finally {
    image?.free();
    renderer.free();
  }
}

await main();
