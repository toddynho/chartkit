import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.ts";
import { memoryCharts } from "./charts.ts";
import { memoryKeys } from "./keys.ts";
import { memoryLimiter } from "./limit.ts";
import { installRasterAssets } from "./png.ts";

const require = createRequire(import.meta.url);
const bar = {
  version: "1",
  type: "bar",
  data: [
    { lane: "A", stops: 12 },
    { lane: "C", stops: 15 },
  ],
  encoding: { x: "lane", y: "stops" },
  a11y: { alt: "Lane C has more." },
};

describe("png wasm injection", () => {
  it("rasterizes from bytes the worker installs before the first request", async () => {
    installRasterAssets({
      wasm: readFileSync(require.resolve("@resvg/resvg-wasm/index_bg.wasm")),
      fonts: [readFileSync(new URL("../fonts/Inter-Regular.ttf", import.meta.url)), readFileSync(new URL("../fonts/Roboto-Regular.ttf", import.meta.url))],
    });
    const app = createApp({
      keys: memoryKeys(),
      charts: memoryCharts(),
      limiter: memoryLimiter(10, 60_000, () => 1_000),
      stripe: { secretKey: "", priceId: "", webhookSecret: "", mode: "payment" },
    });
    const params = new URLSearchParams({ spec: JSON.stringify(bar), format: "png", scale: "1" });
    const response = await app.handle(new Request(`http://cloud.local/render?${params}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(Buffer.from(bytes.subarray(0, 8)).toString("hex")).toBe("89504e470d0a1a0a");
  });
});