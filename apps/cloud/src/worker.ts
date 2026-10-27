import { Buffer } from "node:buffer";
import interFont from "../fonts/Inter-Regular.ttf";
import robotoFont from "../fonts/Roboto-Regular.ttf";
import wasm from "@resvg/resvg-wasm/index_bg.wasm";
import { handleFetch, type EdgeCache } from "./edge.ts";
import { installRasterAssets } from "./png.ts";

const scope = globalThis as typeof globalThis & { Buffer?: typeof Buffer };
if (!scope.Buffer) scope.Buffer = Buffer;

installRasterAssets({
  wasm,
  fonts: [interFont, robotoFont],
});

interface WorkerContext {
  waitUntil(promise: Promise<unknown>): void;
}

export default {
  async fetch(request: Request, env: Record<string, unknown>, ctx: WorkerContext): Promise<Response> {
    const cache = (globalThis as { caches?: { default?: EdgeCache } }).caches?.default;
    return handleFetch(request, {
      env,
      cache,
      waitUntil: (promise) => ctx.waitUntil(promise),
    });
  },
};
