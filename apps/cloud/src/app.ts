import type { RepairResult } from "@chartkitdev/core/validate";
import type { ChartStore, StoredChart } from "./charts.ts";
import { chartStoreFromEnv } from "./charts.ts";
import { cacheKey, drawSpec, parseSpec, readFrame, repairSpec, type Frame } from "./draw.ts";
import { playgroundHref, shareDocument, shareMessage, specDescription, specTitle } from "./share.ts";
import { cardDrawingSize } from "./watermark.ts";
import { FONT_FALLBACK } from "./png.ts";
import { keyStoreFromEnv, storeKind, type KeyStore, type StoreKind } from "./keys.ts";
import { clientIp, limiterFrom, type RateLimiter } from "./limit.ts";
import { handleMcp } from "./mcp.ts";
import { createCheckout, stripeFromEnv, stripeReady, verifyStripe, type StripeConfig } from "./stripe.ts";

const EXPOSE = "ETag, X-ChartKit-Repairs, X-ChartKit-Warnings, X-ChartKit-Errors, X-ChartKit-Ok, X-ChartKit-Repair-Patch, X-ChartKit-Watermark, X-ChartKit-Cache, X-ChartKit-Key, X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After";
const LONG_CACHE = "public, max-age=31536000, immutable";
const MAX_BODY = 1_000_000;

interface Cached {
  status: number;
  contentType: string;
  body: Uint8Array;
  etag: string;
  meta: [string, string][];
  svg: string;
  width: number;
  height: number;
  result: RepairResult;
}

export interface CloudDeps {
  keys?: KeyStore;
  charts?: ChartStore;
  limiter?: RateLimiter;
  stripe?: StripeConfig;
  fetch?: typeof fetch;
  cache?: Map<string, Cached>;
  /** Native Workers bindings. Objects, so they never reach process.env. */
  bindings?: { kv?: unknown; rateLimit?: unknown };
  /** Which store backs keys and charts. Read from env and bindings when omitted. */
  storage?: StoreKind;
  /**
   * True on Cloudflare Workers. There, a memory store loses keys and /c/<id> links whenever an isolate ends,
   * so /health answers 503 and the first request logs an error. CHARTKIT_ALLOW_MEMORY=1 turns that off for a smoke test.
   */
  workers?: boolean;
  allowMemory?: boolean;
}

export interface CloudApp {
  handle(request: Request): Promise<Response>;
}

export function createApp(deps: CloudDeps = {}): CloudApp {
  const bindings = { kv: deps.bindings?.kv };
  const keys = deps.keys ?? keyStoreFromEnv(process.env, bindings);
  const charts = deps.charts ?? chartStoreFromEnv(process.env, bindings);
  const storage = deps.storage ?? (deps.keys && deps.charts ? "memory" : storeKind(process.env, bindings));
  const limiter = deps.limiter ?? limiterFrom(deps.bindings?.rateLimit);
  const stripe = deps.stripe ?? stripeFromEnv();
  const fetcher = deps.fetch ?? fetch;
  const cache = deps.cache ?? new Map<string, Cached>();
  const allowMemory = deps.allowMemory ?? process.env.CHARTKIT_ALLOW_MEMORY === "1";
  const unsafeStorage = Boolean(deps.workers) && storage === "memory" && !allowMemory;
  let warned = false;
  const health = () => ({
    ok: !unsafeStorage,
    service: "chartkit-cloud",
    storage,
    rateLimit: limiter.kind ?? "custom",
    checkout: stripeReady(stripe) ? "on" : "off",
    ...(unsafeStorage
      ? { error: "No durable store. Keys and /c/<id> links are lost when this isolate ends. Bind CHARTKIT_KV or set KV_REST_API_URL and KV_REST_API_TOKEN." }
      : {}),
  });

  return {
    async handle(request) {
      const url = new URL(request.url);
      const path = url.pathname.replace(/\/+$/, "") || "/";
      if (unsafeStorage && !warned) {
        warned = true;
        console.error(`[chartkit-cloud] ${health().error}`);
      }
      if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
      if (request.method === "GET" && path === "/health") {
        const body = health();
        return json(body.ok ? 200 : 503, body);
      }
      if (path === "/checkout" && request.method === "POST") return checkout(request, url, stripe, fetcher);
      if (path === "/stripe/webhook" && request.method === "POST") return webhook(request, stripe, keys);
      if (path === "/checkout/success" && request.method === "GET") return successPage(url, keys);
      if (path === "/checkout/cancelled" && request.method === "GET") return html(200, "<p>Checkout was cancelled. The chart still renders, with the mark.</p>");

      const limited = await limiter.take(clientIp(request));
      if (!limited.ok) return limitedResponse(request, limited.limit, limited.retryAfter);

      if (path === "/mcp") {
        return handleMcp(request, async (call) => {
          const nextUrl = new URL(call.route === "charts" ? "/charts" : "/render", url.origin);
          const next = new Request(nextUrl, { method: "POST", headers: call.headers, body: call.body });
          return call.route === "charts" ? storeChart(next, nextUrl, keys, charts) : renderPost(next, nextUrl, keys, charts, cache);
        });
      }
      if (path === "/render" && request.method === "GET") return renderGet(request, url, cache);
      if (path === "/render" && request.method === "POST") return renderPost(request, url, keys, charts, cache);
      if (path === "/charts" && request.method === "POST") return storeChart(request, url, keys, charts);
      if (path === "/validate" && request.method === "POST") return validatePost(request);
      if (path === "/s" && request.method === "GET") return shareQuery(url, cache);
      const shareId = path.match(/^\/s\/([A-Za-z0-9_-]{8,32})$/);
      if (shareId && request.method === "GET") return shareStored(url, shareId[1] ?? "", charts, cache);
      const cardPng = path.match(/^\/c\/([A-Za-z0-9_-]{8,32})\/card\.png$/);
      if (cardPng && request.method === "GET") return renderStored(request, url, cardPng[1] ?? "", "card", charts, cache);
      const stored = path.match(/^\/c\/([A-Za-z0-9_-]{8,32})(?:\.(svg|png))?$/);
      if (stored && request.method === "GET") return renderStored(request, url, stored[1] ?? "", stored[2], charts, cache);
      return json(404, { ok: false, error: "Not found." });
    },
  };
}

async function renderGet(request: Request, url: URL, cache: Map<string, Cached>): Promise<Response> {
  const raw = url.searchParams.get("spec");
  if (!raw) return imageError(400, "Missing spec.", "Pass spec as JSON or base64url on the query string, or POST /render.");
  if (raw.length > MAX_BODY) return imageError(413, "Spec is too large for a GET URL.", "POST /charts stores the spec and returns a short image URL.");
  const spec = parseSpec(raw);
  if (spec instanceof Error) return imageError(400, "Spec is not JSON.", spec.message);
  return renderMarked(request, url, spec, cache);
}

async function renderPost(request: Request, url: URL, keys: KeyStore, charts: ChartStore, cache: Map<string, Cached>): Promise<Response> {
  const body = await readBody(request);
  if (body instanceof Response) return body;
  if (!isRecord(body) || !("spec" in body)) return json(400, { ok: false, error: "POST /render expects { spec }." });
  const spec = typeof body.spec === "string" ? parseSpec(body.spec) : body.spec;
  if (spec instanceof Error) return json(400, { ok: false, error: `spec is not JSON: ${spec.message}` });
  const frame = frameFrom(url, body);
  if (typeof frame === "string") return json(400, { ok: false, error: frame });
  const access = await accessFor(request, keys);
  frame.watermark = access.watermark;
  const drawn = await cachedDraw(spec, frame, access.state, cache);
  const marked = access.watermark || !drawn.result.ok;
  const link = await publishedUrl(url.origin, drawn.result.spec, frame, marked, charts);
  return json(
    drawn.status,
    {
      ok: drawn.result.ok,
      format: frame.format,
      width: drawn.width,
      height: drawn.height,
      url: link.url,
      ...(link.shareUrl ? { shareUrl: link.shareUrl } : {}),
      watermark: marked,
      svg: frame.format === "svg" ? drawn.svg : undefined,
      png: frame.format === "png" ? Buffer.from(drawn.body).toString("base64") : undefined,
      spec: drawn.result.spec,
      applied: drawn.result.applied,
      warnings: drawn.result.warnings,
      errors: drawn.result.errors,
      diagnostics: drawn.result.diagnostics,
    },
    drawn.headers,
  );
}

async function storeChart(request: Request, url: URL, keys: KeyStore, charts: ChartStore): Promise<Response> {
  const body = await readBody(request);
  if (body instanceof Response) return body;
  if (!isRecord(body) || !("spec" in body)) return json(400, { ok: false, error: "POST /charts expects { spec }." });
  const spec = typeof body.spec === "string" ? parseSpec(body.spec) : body.spec;
  if (spec instanceof Error) return json(400, { ok: false, error: `spec is not JSON: ${spec.message}` });
  const frame = frameFrom(url, body);
  if (typeof frame === "string") return json(400, { ok: false, error: frame });
  const access = await accessFor(request, keys);
  frame.watermark = access.watermark;
  const drawn = await drawSpec(spec, { ...frame, format: "svg" });
  if (!drawn.result.ok) {
    return json(422, payload(drawn, ""), metaHeaders(drawn.result, { "X-ChartKit-Watermark": "1", "X-ChartKit-Key": access.state, "Cache-Control": "no-store" }));
  }
  const stored = await charts.put(drawn.result.spec, !access.watermark, access.watermark);
  const svgUrl = `${url.origin}/c/${stored.id}.svg`;
  const pngUrl = `${url.origin}/c/${stored.id}.png${frame.scale !== 1 ? `?scale=${frame.scale}` : ""}`;
  const shareUrl = `${url.origin}/s/${stored.id}`;
  const cardUrl = `${url.origin}/c/${stored.id}/card.png`;
  return json(200, { ...payload(drawn, svgUrl), id: stored.id, url: svgUrl, svgUrl, pngUrl, shareUrl, cardUrl, watermark: access.watermark }, metaHeaders(drawn.result, { "X-ChartKit-Watermark": access.watermark ? "1" : "0", "X-ChartKit-Key": access.state, "Cache-Control": "no-store" }));
}

async function validatePost(request: Request): Promise<Response> {
  const body = await readBody(request);
  if (body instanceof Response) return body;
  const spec = isRecord(body) && "spec" in body ? body.spec : body;
  const parsed = typeof spec === "string" ? parseSpec(spec) : spec;
  if (parsed instanceof Error) return json(400, { ok: false, error: `spec is not JSON: ${parsed.message}` });
  const result = repairSpec(parsed, {});
  return json(
    result.ok ? 200 : 422,
    {
      ok: result.ok,
      spec: result.spec,
      applied: result.applied,
      warnings: result.warnings,
      errors: result.errors,
      diagnostics: result.diagnostics,
    },
    metaHeaders(result, { "Cache-Control": "no-store" }),
  );
}

async function renderStored(
  request: Request,
  url: URL,
  id: string,
  extension: string | undefined,
  charts: ChartStore,
  cache: Map<string, Cached>,
): Promise<Response> {
  const stored = await charts.get(id);
  if (!stored) return imageError(404, "Unknown chart.", "POST /charts returns the id.");
  if (extension === "card") url.searchParams.set("card", "1");
  else if (extension) url.searchParams.set("format", extension);
  url.searchParams.delete("key");
  return renderImage(request, url, stored.spec, !stored.clean, cache, true);
}

async function shareStored(url: URL, id: string, charts: ChartStore, cache: Map<string, Cached>): Promise<Response> {
  const stored = await charts.touch(id);
  if (!stored) return htmlDocument(404, shareMessage("Unknown chart", "This share link does not match a stored chart. POST /charts returns the id."), "no-store");
  return shareResponse(url, stored.spec, !stored.clean, `${url.origin}/s/${id}`, `${url.origin}/c/${id}/card.png`, cache);
}

async function shareQuery(url: URL, cache: Map<string, Cached>): Promise<Response> {
  const raw = url.searchParams.get("spec");
  if (!raw) return htmlDocument(400, shareMessage("Missing spec", "Pass spec as JSON on the query string, or POST /charts for a short /s/<id> link."), "no-store");
  if (raw.length > MAX_BODY) return htmlDocument(413, shareMessage("Spec is too large", "POST /charts stores the spec and returns a short /s/<id> link."), "no-store");
  const spec = parseSpec(raw);
  if (spec instanceof Error) return htmlDocument(400, shareMessage("Spec is not JSON", spec.message), "no-store");
  const image = new URL("/render", url.origin);
  image.searchParams.set("format", "png");
  image.searchParams.set("card", "1");
  image.searchParams.set("spec", raw);
  return shareResponse(url, spec, true, `${url.origin}${url.pathname}${url.search}`, image.toString(), cache);
}

async function shareResponse(
  url: URL,
  spec: unknown,
  watermark: boolean,
  pageUrl: string,
  imageUrl: string,
  cache: Map<string, Cached>,
): Promise<Response> {
  const drawn = await cachedDraw(spec, { format: "svg", scale: 1, watermark }, "absent", cache);
  if (!drawn.result.ok) {
    const detail = drawn.result.errors[0]?.message ?? "The spec is not drawable.";
    return htmlDocument(422, shareMessage("ChartKit could not draw this spec", detail), "no-store");
  }
  const repaired = drawn.result.spec;
  const html = shareDocument({
    title: specTitle(repaired),
    description: specDescription(repaired),
    pageUrl,
    imageUrl,
    svg: drawn.svg,
    playgroundHref: playgroundHref(repaired),
  });
  return htmlDocument(200, html, LONG_CACHE);
}

/** GET /render is always marked. A key in the query or Authorization header is ignored. */
async function renderMarked(request: Request, url: URL, spec: unknown, cache: Map<string, Cached>): Promise<Response> {
  url.searchParams.delete("key");
  return renderImage(request, url, spec, true, cache, false);
}

async function renderImage(
  request: Request,
  url: URL,
  spec: unknown,
  watermark: boolean,
  cache: Map<string, Cached>,
  stored: boolean,
): Promise<Response> {
  if (url.searchParams.get("card") === "1") {
    url.searchParams.delete("w");
    url.searchParams.delete("h");
    url.searchParams.delete("scale");
    url.searchParams.set("format", "png");
  }
  const frame = readFrame(url.searchParams);
  if (typeof frame === "string") return imageError(400, "Bad render query.", frame);
  frame.watermark = watermark;
  if (frame.card) {
    const drawing = cardDrawingSize(watermark);
    frame.w = drawing.width;
    frame.h = drawing.height;
    frame.scale = 1;
    frame.format = "png";
  }
  const drawn = await cachedDraw(spec, frame, "absent", cache);
  if (request.headers.get("if-none-match") === `"${drawn.etag}"`) {
    return new Response(null, { status: 304, headers: drawn.headers });
  }
  const headers = new Headers(drawn.headers);
  headers.set("content-type", drawn.contentType);
  if (!stored) headers.set("content-disposition", "inline");
  return new Response(new Uint8Array(drawn.body), { status: drawn.status, headers });
}

async function cachedDraw(spec: unknown, frame: Frame, state: string, cache: Map<string, Cached>) {
  const etag = cacheKey(spec, frame, state);
  const hit = cache.get(etag);
  if (hit) {
    const headers = metaHeadersFrom(hit.meta, {
      ETag: `"${hit.etag}"`,
      "Cache-Control": LONG_CACHE,
      "X-ChartKit-Cache": "hit",
      Vary: "Authorization",
    });
    return { ...hit, headers };
  }
  const drawn = await drawSpec(spec, frame);
  const meta = repairPairs(drawn.result, frame.watermark, state);
  const headers = metaHeadersFrom(meta, {
    ETag: `"${etag}"`,
    "Cache-Control": drawn.status === 200 || drawn.status === 422 ? LONG_CACHE : "no-store",
    "X-ChartKit-Cache": "miss",
    Vary: "Authorization",
  });
  const entry: Cached = {
    status: drawn.status,
    contentType: drawn.contentType,
    body: drawn.body,
    etag,
    meta,
    svg: drawn.svg,
    width: drawn.width,
    height: drawn.height,
    result: drawn.result,
  };
  if (drawn.status === 200 || drawn.status === 422) {
    cache.set(etag, entry);
    if (cache.size > 100) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
  }
  return { ...entry, headers };
}

/** Authorization is the only key. Query and body keys are ignored so they never land in an image URL. */
async function accessFor(request: Request, keys: KeyStore): Promise<{ watermark: boolean; state: string }> {
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!bearer) return { watermark: true, state: "absent" };
  const valid = await keys.check(bearer);
  return valid ? { watermark: false, state: "valid" } : { watermark: true, state: "invalid" };
}

async function publishedUrl(
  origin: string,
  spec: unknown,
  frame: Frame,
  watermark: boolean,
  charts: ChartStore,
): Promise<{ url: string; shareUrl?: string }> {
  if (!watermark) {
    const stored = await charts.put(spec, true);
    return { url: storedUrl(origin, stored, frame), shareUrl: `${origin}/s/${stored.id}` };
  }
  const json = JSON.stringify(spec);
  if (json.length > 1800) {
    const stored = await charts.put(spec, false);
    return { url: storedUrl(origin, stored, frame), shareUrl: `${origin}/s/${stored.id}` };
  }
  const params = new URLSearchParams();
  params.set("format", frame.format);
  params.set("spec", json);
  if (frame.scale !== 1) params.set("scale", String(frame.scale));
  if (frame.w) params.set("w", String(frame.w));
  if (frame.h) params.set("h", String(frame.h));
  if (frame.theme) params.set("theme", frame.theme);
  if (frame.background) params.set("background", frame.background);
  return { url: `${origin}/render?${params}` };
}

function storedUrl(origin: string, stored: StoredChart, frame: Frame): string {
  const scale = frame.scale !== 1 ? `?scale=${frame.scale}` : "";
  return `${origin}/c/${stored.id}.${frame.format}${scale}`;
}

function payload(drawn: { result: RepairResult; width: number; height: number; svg: string }, url: string) {
  return {
    ok: drawn.result.ok,
    url,
    width: drawn.width,
    height: drawn.height,
    watermark: true,
    spec: drawn.result.spec,
    applied: drawn.result.applied,
    warnings: drawn.result.warnings,
    errors: drawn.result.errors,
    diagnostics: drawn.result.diagnostics,
  };
}

function frameFrom(url: URL, body: Record<string, unknown>): Frame | string {
  const source = new URLSearchParams(url.searchParams);
  for (const name of ["format", "w", "h", "scale", "theme", "background"] as const) {
    const value = body[name];
    if (typeof value === "string" || typeof value === "number") source.set(name, String(value));
  }
  return readFrame(source);
}

async function checkout(request: Request, url: URL, stripe: StripeConfig, fetcher: typeof fetch): Promise<Response> {
  const session = await createCheckout(stripe, url.origin, fetcher);
  if ("error" in session) return json(session.status, { ok: false, error: session.error, price: "placeholder" });
  return json(200, { ok: true, url: session.url, price: "placeholder" });
}

async function webhook(request: Request, stripe: StripeConfig, keys: KeyStore): Promise<Response> {
  const raw = await request.text();
  if (raw.length > MAX_BODY) return json(413, { ok: false, error: "Body is too large." });
  const signature = request.headers.get("stripe-signature") ?? "";
  if (!verifyStripe(stripe.webhookSecret, signature, raw)) return json(400, { ok: false, error: "Invalid Stripe signature." });
  let event: unknown;
  try {
    event = JSON.parse(raw) as unknown;
  } catch {
    return json(400, { ok: false, error: "Webhook body is not JSON." });
  }
  if (!isRecord(event) || event.type !== "checkout.session.completed" || !isRecord(event.data) || !isRecord(event.data.object)) {
    return json(200, { ok: true, ignored: true });
  }
  const session = event.data.object;
  const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required" || session.status === "complete";
  if (!paid || typeof session.id !== "string") return json(200, { ok: true, ignored: true });
  await keys.issue({ sessionId: session.id });
  return json(200, { ok: true, received: true });
}

async function successPage(url: URL, keys: KeyStore): Promise<Response> {
  const sessionId = url.searchParams.get("session_id") ?? "";
  const key = sessionId ? await keys.findBySession(sessionId) : null;
  const body = key
    ? `<h1>Your ChartKit key</h1><p>Send it as <code>Authorization: Bearer</code> on <code>POST /charts</code> or <code>POST /render</code>. The response URL is a stored chart with the mark removed. That URL has no secret. Keep this key private, and do not put it in an image address.</p><pre>${escapeHtml(key)}</pre>`
    : `<h1>Key not ready</h1><p>Stripe has not confirmed this checkout yet. The webhook issues the key, and this page reads it back.</p>`;
  return html(200, body);
}

function limitedResponse(request: Request, limit: number, retryAfter: number): Response {
  const headers = cors(new Headers());
  headers.set("retry-after", String(retryAfter));
  headers.set("x-ratelimit-limit", String(limit));
  headers.set("x-ratelimit-remaining", "0");
  headers.set("cache-control", "no-store");
  if (request.method === "GET") {
    headers.set("content-type", "image/svg+xml; charset=utf-8");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="120" viewBox="0 0 640 120" role="img"><rect width="640" height="120" fill="#ffffff"/><text x="24" y="48" font-size="16" font-family="${FONT_FALLBACK}" fill="#1d1d1f">Too many renders from this IP.</text><text x="24" y="76" font-size="14" font-family="${FONT_FALLBACK}" fill="#6e6e73">Try again in ${retryAfter}s. The limit is ${limit} a minute, with or without a key.</text></svg>`;
    return new Response(svg, { status: 429, headers });
  }
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify({ ok: false, error: "Too many requests.", limit, retryAfter }), { status: 429, headers });
}

async function imageError(status: number, title: string, detail: string): Promise<Response> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="140" viewBox="0 0 640 140" role="img"><title>${escapeHtml(title)}</title><rect width="640" height="140" fill="#ffffff"/><text x="24" y="48" font-size="16" font-family="${FONT_FALLBACK}" fill="#1d1d1f">${escapeHtml(title)}</text><text x="24" y="78" font-size="14" font-family="${FONT_FALLBACK}" fill="#6e6e73">${escapeHtml(detail)}</text></svg>`;
  const headers = cors(new Headers());
  headers.set("content-type", "image/svg+xml; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-chartkit-ok", "0");
  return new Response(svg, { status, headers });
}

function repairPairs(result: RepairResult, watermark: boolean, state: string): [string, string][] {
  const patch = Buffer.from(JSON.stringify(result.applied)).toString("base64url");
  const pairs: [string, string][] = [
    ["X-ChartKit-Repairs", String(result.applied.length)],
    ["X-ChartKit-Warnings", codes(result.warnings)],
    ["X-ChartKit-Errors", codes(result.errors)],
    ["X-ChartKit-Ok", result.ok ? "1" : "0"],
    ["X-ChartKit-Repair-Patch", patch.length <= 3500 ? patch : "truncated"],
    ["X-ChartKit-Watermark", watermark ? "1" : "0"],
  ];
  if (state) pairs.push(["X-ChartKit-Key", state]);
  return pairs;
}

function metaHeaders(result: RepairResult, extra: Record<string, string>): Headers {
  return metaHeadersFrom(repairPairs(result, extra["X-ChartKit-Watermark"] === "1", ""), extra);
}

function metaHeadersFrom(meta: [string, string][], extra: Record<string, string>): Headers {
  const headers = cors(new Headers());
  for (const [key, value] of meta) headers.set(key, value);
  for (const [key, value] of Object.entries(extra)) headers.set(key, value);
  return headers;
}

function codes(items: { code: string }[]): string {
  return [...new Set(items.map((item) => item.code))].join(",");
}

async function readBody(request: Request): Promise<unknown | Response> {
  const text = await request.text();
  if (text.length > MAX_BODY) return json(413, { ok: false, error: "Request body is over 1 MB." });
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return json(400, { ok: false, error: "Body is not JSON." });
  }
}

function json(status: number, body: unknown, headers?: Headers): Response {
  const next = headers ?? cors(new Headers());
  next.set("content-type", "application/json; charset=utf-8");
  if (!next.has("cache-control")) next.set("cache-control", "no-store");
  return new Response(JSON.stringify(body), { status, headers: next });
}

function html(status: number, body: string): Response {
  const headers = cors(new Headers());
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(`<!doctype html><meta charset="utf-8"><title>ChartKit</title><body style="font-family:${FONT_FALLBACK};margin:40px">${body}</body>`, { status, headers });
}

function htmlDocument(status: number, document: string, cacheControl: string): Response {
  const headers = cors(new Headers());
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("cache-control", cacheControl);
  return new Response(document, { status, headers });
}

function cors(input: Headers | Response): Headers | Response {
  if (input instanceof Response) {
    const headers = new Headers(input.headers);
    headers.set("access-control-allow-origin", "*");
    headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
    headers.set("access-control-allow-headers", "authorization, content-type, accept, mcp-protocol-version");
    headers.set("access-control-expose-headers", EXPOSE);
    return new Response(input.body, { status: input.status, headers });
  }
  input.set("access-control-allow-origin", "*");
  input.set("access-control-allow-methods", "GET, POST, OPTIONS");
  input.set("access-control-allow-headers", "authorization, content-type, accept, mcp-protocol-version");
  input.set("access-control-expose-headers", EXPOSE);
  input.set("x-content-type-options", "nosniff");
  return input;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const cloud = createApp;
