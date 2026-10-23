import { performance } from "node:perf_hooks";
import { createApp } from "./app.ts";
import { memoryCharts } from "./charts.ts";
import { memoryKeys } from "./keys.ts";
import { memoryLimiter } from "./limit.ts";

const spec = {
  version: "1",
  type: "bar",
  data: [
    { lane: "A", stops: 12 },
    { lane: "C", stops: 15 },
  ],
  encoding: { x: "lane", y: "stops" },
  a11y: { alt: "Lane C has more." },
  size: { width: 640, height: 320 },
};

const app = createApp({
  keys: memoryKeys(),
  charts: memoryCharts(),
  limiter: memoryLimiter(10_000),
  stripe: { secretKey: "", priceId: "", webhookSecret: "", mode: "payment" },
});

async function once(format: "svg" | "png", stops: number): Promise<number> {
  const body = {
    spec: {
      ...spec,
      data: [
        { lane: "A", stops },
        { lane: "C", stops: stops + 3 },
      ],
    },
    format,
    w: 640,
    h: 320,
  };
  const started = performance.now();
  const response = await app.handle(
    new Request("http://cloud.local/render", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
  await response.arrayBuffer();
  if (!response.ok) throw new Error(`${format} HTTP ${response.status}`);
  return performance.now() - started;
}

async function time(format: "svg" | "png", runs: number): Promise<{ cold: number; cache: number; render: number[] }> {
  const cold = await once(format, 12);
  const cache = await once(format, 12);
  const render: number[] = [];
  for (let i = 0; i < runs; i++) render.push(await once(format, 20 + i));
  return { cold, cache, render };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] ?? 0 : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

const svg = await time("svg", 20);
const png = await time("png", 10);
const report = {
  svgColdMs: round(svg.cold),
  svgWarmCacheMs: round(svg.cache),
  svgWarmRenderMedianMs: round(median(svg.render)),
  pngColdMs: round(png.cold),
  pngWarmCacheMs: round(png.cache),
  pngWarmRenderMedianMs: round(median(png.render)),
  note: "Local handle() times on one bar chart, 640 by 320. Cold is the first call. Warm cache repeats that spec. Warm render is the median of new specs after wasm is loaded. PNG cold includes resvg wasm init.",
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
