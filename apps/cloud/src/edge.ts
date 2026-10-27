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
}

let shared: CloudApp | undefined;

/** Tests reset the lazy app so a worker env is read on the next request. */
export function resetEdgeApp(): void {
  shared = undefined;
}

export async function handleFetch(request: Request, options: EdgeOptions = {}): Promise<Response> {
  if (options.env) applyStringEnv(options.env);
  const app = options.app ?? sharedApp();
  if (request.method === "GET" && options.cache) {
    const hit = await options.cache.match(request);
    if (hit) {
      const headers = new Headers(hit.headers);
      headers.set("X-ChartKit-Cache", "edge");
      return new Response(hit.body, { status: hit.status, statusText: hit.statusText, headers });
    }
  }
  const response = await app.handle(request);
  if (request.method === "GET" && options.cache && cacheable(response)) {
    const pending = options.cache.put(request, response.clone()).catch(() => undefined);
    if (options.waitUntil) options.waitUntil(pending);
    else await pending;
  }
  return response;
}

function sharedApp(): CloudApp {
  if (!shared) shared = createApp();
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
