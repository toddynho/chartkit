import { createApp, type CloudApp } from "./app.ts";

export interface EdgeCache {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}

export interface EdgeOptions {
  app?: CloudApp;
  env?: Record<string, unknown>;
  cache?: EdgeCache;
  waitUntil?: (promise: Promise<unknown>) => void;
  /** Set by worker.ts. Turns on the durable-store check on /health. */
  workers?: boolean;
}

let shared: CloudApp | undefined;

/** Tests reset the lazy app so a worker env is read on the next request. */
export function resetEdgeApp(): void {
  shared = undefined;
}

export async function handleFetch(request: Request, options: EdgeOptions = {}): Promise<Response> {
  if (options.env) applyStringEnv(options.env);
  const app = options.app ?? sharedApp(options);
  if (request.method === "GET" && options.cache) {
    const hit = await options.cache.match(request);
    if (hit) {
      const headers = new Headers(hit.headers);
      headers.set("X-ChartKit-Cache", "edge");
      return new Response(hit.body, { status: hit.status, statusText: hit.statusText, headers });
    }
  }
  let response: Response;
  try {
    response = await app.handle(request);
  } catch (error) {
    // Nothing should reach here. If something does, answer in JSON and not with the platform's error page.
    console.error("[chartkit-cloud] unhandled", error);
    return new Response(JSON.stringify({ ok: false, error: "The render failed. Nothing was drawn." }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": "*" },
    });
  }
  if (request.method === "GET" && options.cache && cacheable(response)) {
    const pending = options.cache.put(request, response.clone()).catch(() => undefined);
    if (options.waitUntil) options.waitUntil(pending);
    else await pending;
  }
  return response;
}

function sharedApp(options: EdgeOptions): CloudApp {
  if (!shared) {
    shared = createApp({
      bindings: { kv: options.env?.CHARTKIT_KV, rateLimit: options.env?.CHARTKIT_RATE_LIMIT },
      workers: options.workers,
    });
  }
  return shared;
}

function cacheable(response: Response): boolean {
  if (response.status !== 200 && response.status !== 422) return false;
  return (response.headers.get("cache-control") ?? "").includes("immutable");
}

function applyStringEnv(env: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(env)) {
    if (typeof value !== "string" || process.env[key] !== undefined) continue;
    process.env[key] = value;
  }
}
