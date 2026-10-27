import { createHmac } from "node:crypto";
import { repair } from "@chartkitdev/core/validate";
import { render } from "@chartkitdev/core/extra";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app.ts";
import { chartBody, EMBED_PAD_BOTTOM, EMBED_PAD_TOP, EMBED_PAD_X } from "./watermark.ts";
import { kvCharts, memoryCharts } from "./charts.ts";
import { kvKeys, memoryKeys } from "./keys.ts";
import { memoryLimiter } from "./limit.ts";
import { forRaster } from "./png.ts";
import type { StripeConfig } from "./stripe.ts";

const stripe: StripeConfig = { secretKey: "", priceId: "", webhookSecret: "", mode: "payment" };

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

function appFor(limit = 100) {
  const keys = memoryKeys();
  const charts = memoryCharts();
  const app = createApp({ keys, charts, limiter: memoryLimiter(limit, 60_000, () => 1_000), stripe, fetch: vi.fn() });
  return { app, keys, charts };
}

function get(spec: unknown, query: Record<string, string> = {}) {
  const params = new URLSearchParams({ spec: JSON.stringify(spec), ...query });
  return new Request(`http://cloud.local/render?${params}`);
}

/** Keyed Cloud SVGs stay padded, and the drawing underneath still matches the library. */
function expectClean(svg: string) {
  expect(svg).toContain('data-ck-embed="1"');
  expect(svg).not.toContain("data-ck-watermark");
  const cloud = chartBody(svg);
  const library = chartBody(render(bar));
  expect(cloud.drawing).toBe(library.drawing);
  expect(cloud.width).toBe(library.width);
  expect(cloud.height).toBe(library.height);
  expect(svg).toContain(`viewBox="-${EMBED_PAD_X} -${EMBED_PAD_TOP} `);
}

describe("watermark and parity", () => {
  it("matches the library SVG aside from the reserved mark", async () => {
    const { app } = appFor();
    const response = await app.handle(get(bar));
    expect(response.status).toBe(200);
    const svg = await response.text();
    const plain = render(bar);
    expect(plain).not.toContain("data-ck-watermark");
    expect(plain).not.toContain("chartkit.dev");
    expect(svg).toContain('data-ck-watermark="1"');
    expect(svg).toContain('href="https://chartkit.dev/cloud"');
    expect(svg).toContain(">chartkit.dev</text>");
    const marked = chartBody(svg);
    const library = chartBody(plain);
    expect(marked.drawing).toBe(library.drawing);
    expect(marked.width).toBe(library.width);
    expect(marked.height).toBe(library.height);
    expect(svg).toContain('data-ck-embed="1"');
    const open = svg.match(/<svg\b[^>]*>/)?.[0] ?? "";
    const box = open.match(/viewBox="(-?[0-9.]+) (-?[0-9.]+) ([0-9.]+) ([0-9.]+)"/);
    const view = box?.slice(1, 5).map(Number) ?? [];
    // Library viewBox is 0 0 <width> <height>. Cloud used to add only the 16px watermark band
    // (0 0 640 256 for this bar, top grid 14px from the edge, 4px under the mark).
    // The embed margin is viewBox-only: 24 top, 16 each side, 12 under that band.
    expect(view).toEqual([
      -EMBED_PAD_X,
      -EMBED_PAD_TOP,
      library.width + EMBED_PAD_X * 2,
      library.height + EMBED_PAD_TOP + EMBED_PAD_BOTTOM + 16,
    ]);
    const markY = Number(svg.match(/data-ck-watermark="1"[\s\S]*?\by="([0-9.]+)"/)?.[1]);
    expect(markY).toBe(library.height + 12);
    expect((view[1] ?? 0) + (view[3] ?? 0) - markY).toBe(16);
    expect(response.headers.get("x-chartkit-watermark")).toBe("1");
    expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(response.headers.get("etag")).toMatch(/^"[0-9a-f]+"$/);
  });

  it("stores an unmarked chart behind a key-free URL", async () => {
    const { app, keys } = appFor();
    const issued = await keys.issue();
    const queryKey = await app.handle(get(bar, { key: issued.key }));
    expect(queryKey.headers.get("x-chartkit-watermark")).toBe("1");
    expect(queryKey.headers.get("x-chartkit-key")).toBe("absent");
    expect(await queryKey.text()).toContain("data-ck-watermark");
    const headerGet = await app.handle(new Request(get(bar).url, { headers: { authorization: `Bearer ${issued.key}` } }));
    expect(headerGet.headers.get("x-chartkit-watermark")).toBe("1");
    expect(await headerGet.text()).toContain("data-ck-watermark");
    const bearer = await app.handle(
      new Request("http://cloud.local/render", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${issued.key}` },
        body: JSON.stringify({ spec: bar, format: "svg" }),
      }),
    );
    const body = (await bearer.json()) as { watermark: boolean; svg: string; url: string };
    expect(body.watermark).toBe(false);
    expectClean(body.svg);
    expect(body.url).toMatch(/^http:\/\/cloud\.local\/c\/[A-Za-z0-9_-]{16}\.svg$/);
    expect(body.url).not.toContain("key=");
    expect(body.url).not.toContain(issued.key);
    const image = await app.handle(new Request(body.url));
    expect(image.headers.get("x-chartkit-watermark")).toBe("0");
    expectClean(await image.text());
    const leaked = await app.handle(new Request(`${body.url}?key=${issued.key}`));
    expectClean(await leaked.text());
    const sneaky = await app.handle(
      new Request(`http://cloud.local/charts?key=${issued.key}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec: bar, key: issued.key }),
      }),
    );
    const hidden = (await sneaky.json()) as { watermark: boolean; url: string };
    expect(hidden.watermark).toBe(true);
    expect(hidden.url).not.toContain(issued.key);
    const marked = await app.handle(new Request(hidden.url));
    expect(await marked.text()).toContain("data-ck-watermark");
    const bad = await app.handle(
      new Request("http://cloud.local/render", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer ck_test_nope" },
        body: JSON.stringify({ spec: bar }),
      }),
    );
    const badBody = (await bad.json()) as { watermark: boolean; url: string; svg: string };
    expect(bad.headers.get("x-chartkit-key")).toBe("invalid");
    expect(badBody.watermark).toBe(true);
    expect(badBody.url).not.toContain("key=");
    expect(badBody.svg).toContain("data-ck-watermark");
  });

  it("uses a light mark on Midnight and a dark mark on the default theme", async () => {
    const { app } = appFor();
    const night = await (await app.handle(get({ ...bar, theme: "midnight" }))).text();
    const day = await (await app.handle(get(bar))).text();
    expect(night).toContain('fill="#9a9a9a"');
    expect(day).toContain('fill="#6e6e73"');
    expect(night).toContain('theme' in bar ? "midnight" : 'var(--ck-background, #0c0c0c)');
  });
});

describe("repair, cache, and errors", () => {
  it("returns repair headers and the patched spec", async () => {
    const { app } = appFor();
    const broken = { version: "1", type: "bar", data: [{ lane: "A", stops: 12 }], encoding: { x: "lane", y: "stops" } };
    const response = await app.handle(get(broken));
    expect(response.status).toBe(200);
    expect(Number(response.headers.get("x-chartkit-repairs"))).toBeGreaterThan(0);
    const patch = JSON.parse(Buffer.from(response.headers.get("x-chartkit-repair-patch") || "", "base64url").toString("utf8")) as { op: string; path: string }[];
    expect(patch.some((op) => op.path.includes("a11y"))).toBe(true);
    const again = await app.handle(get(broken));
    expect(again.headers.get("x-chartkit-cache")).toBe("hit");
    expect(again.headers.get("etag")).toBe(response.headers.get("etag"));
    const posted = await app.handle(
      new Request("http://cloud.local/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec: broken }),
      }),
    );
    const body = (await posted.json()) as { ok: boolean; applied: unknown[]; spec: { a11y?: { alt?: string } } };
    expect(body.ok).toBe(true);
    expect(body.applied.length).toBeGreaterThan(0);
    expect(body.spec.a11y?.alt).toBeTruthy();
    expect(repair(broken).ok).toBe(true);
  });

  it("accepts base64url specs and returns an error image for a spec repair cannot draw", async () => {
    const { app } = appFor();
    const encoded = Buffer.from(JSON.stringify(bar)).toString("base64url");
    const ok = await app.handle(new Request(`http://cloud.local/render?spec=${encoded}&format=svg`));
    expect(ok.status).toBe(200);
    expect(await ok.text()).toContain('data-ck-type="bar"');
    const bad = await app.handle(get({ version: "1", type: "nope" }));
    expect(bad.status).toBe(422);
    expect(bad.headers.get("content-type")).toContain("image/svg+xml");
    const svg = await bad.text();
    expect(svg).toContain("CK");
    expect(svg).toContain("data-ck-watermark");
    expect(bad.headers.get("x-chartkit-errors")).toBeTruthy();
  });

  it("stores a spec and serves a short cacheable URL", async () => {
    const { app } = appFor();
    const created = await app.handle(
      new Request("http://cloud.local/charts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec: bar }),
      }),
    );
    const body = (await created.json()) as { id: string; url: string; applied: unknown[] };
    expect(body.id).toMatch(/^[A-Za-z0-9_-]{16}$/);
    expect(body.url).toBe(`http://cloud.local/c/${body.id}.svg`);
    const image = await app.handle(new Request(body.url));
    expect(image.status).toBe(200);
    expect(image.headers.get("cache-control")).toContain("immutable");
    expect(await image.text()).toContain("data-ck-watermark");
  });
});

describe("rate limit and keys", () => {
  it("limits an IP whether or not it has a key", async () => {
    const { app, keys } = appFor(2);
    const issued = await keys.issue();
    expect((await app.handle(get(bar))).status).toBe(200);
    const keyed = await app.handle(
      new Request("http://cloud.local/render", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${issued.key}` },
        body: JSON.stringify({ spec: bar }),
      }),
    );
    expect(keyed.status).toBe(200);
    const blocked = await app.handle(get(bar));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
    expect(blocked.headers.get("cache-control")).toBe("no-store");
    expect(await blocked.text()).toContain("Too many renders");
  });

  it("issues a key from a signed Stripe webhook and removes the mark with it", async () => {
    const keys = memoryKeys();
    const secret = "whsec_test";
    const stripeFetch = vi.fn(async () => new Response(JSON.stringify({ url: "https://checkout.stripe.test/session" }), { status: 200 }));
    const app = createApp({
      keys,
      charts: memoryCharts(),
      limiter: memoryLimiter(100, 60_000, () => 1_000),
      stripe: { secretKey: "sk_test_placeholder", priceId: "price_placeholder", webhookSecret: secret, mode: "payment" },
      fetch: stripeFetch,
    });
    const checkout = await app.handle(new Request("http://cloud.local/checkout", { method: "POST" }));
    const session = (await checkout.json()) as { url: string };
    expect(session.url).toContain("checkout.stripe.test");
    expect(String(stripeFetch.mock.calls[0]?.[0])).toBe("https://api.stripe.com/v1/checkout/sessions");
    expect(String(stripeFetch.mock.calls[0]?.[1] && (stripeFetch.mock.calls[0][1] as RequestInit).body)).toContain("price_placeholder");
    expect(String(stripeFetch.mock.calls[0]?.[0])).not.toContain("/products");
    const payload = JSON.stringify({
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_123", payment_status: "paid" } },
    });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
    const hook = await app.handle(
      new Request("http://cloud.local/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": `t=${timestamp},v1=${signature}`, "content-type": "application/json" },
        body: payload,
      }),
    );
    expect(hook.status).toBe(200);
    const page = await app.handle(new Request("http://cloud.local/checkout/success?session_id=cs_test_123"));
    const html = await page.text();
    const key = html.match(/ck_test_[a-z0-9]+/)?.[0] ?? "";
    expect(key).toBeTruthy();
    expect(html).not.toContain("?key=");
    const created = await app.handle(
      new Request("http://cloud.local/charts", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({ spec: bar }),
      }),
    );
    const stored = (await created.json()) as { url: string; watermark: boolean };
    expect(stored.watermark).toBe(false);
    expect(stored.url).not.toContain("key=");
    expect(stored.url).not.toContain(key);
    const image = await app.handle(new Request(stored.url));
    expectClean(await image.text());
    expect(image.headers.get("x-chartkit-watermark")).toBe("0");
  });

  it("refuses checkout when Stripe is not configured and does not create a product", async () => {
    const fetchMock = vi.fn();
    const app = createApp({
      keys: memoryKeys(),
      charts: memoryCharts(),
      limiter: memoryLimiter(10),
      stripe,
      fetch: fetchMock,
    });
    const response = await app.handle(new Request("http://cloud.local/checkout", { method: "POST" }));
    expect(response.status).toBe(503);
    const body = (await response.json()) as { price: string; error: string };
    expect(body.price).toBe("placeholder");
    expect(body.error).toBe("Pricing is not available yet.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("checks keys through the KV adapter", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const command = JSON.parse(String(init?.body)) as string[];
      if (command[0] === "GET" && command[1] === "ck:key:ck_test_known") return new Response(JSON.stringify({ result: "1" }));
      return new Response(JSON.stringify({ result: null }));
    });
    const keys = kvKeys({ url: "https://kv.example", token: "token", fetch: fetchMock });
    expect(await keys.check("ck_test_known")).toBe(true);
    expect(await keys.check("ck_test_missing")).toBe(false);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("https://kv.example");
  });

  it("stores the clean flag without the key", async () => {
    const rows = new Map<string, string>();
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const command = JSON.parse(String(init?.body)) as [string, string, string?];
      if (command[0] === "GET") return new Response(JSON.stringify({ result: rows.get(command[1]) ?? null }));
      rows.set(command[1], command[2] ?? "");
      return new Response(JSON.stringify({ result: "OK" }));
    });
    const charts = kvCharts({ url: "https://kv.example", token: "token", fetch: fetchMock });
    const clean = await charts.put(bar, true);
    expect(await charts.get(clean.id)).toEqual({ id: clean.id, spec: bar, clean: true });
    const marked = await charts.put(bar, false);
    expect(marked.id).not.toBe(clean.id);
    expect((await charts.get(marked.id))?.clean).toBe(false);
    expect([...rows.values()].join("")).not.toContain("ck_test_");
  });
});

describe("png", () => {
  it("resolves CSS fallbacks and returns a PNG", async () => {
    expect(forRaster(`<svg fill="var(--ck-text, light-dark(#111111, #eeeeee))"/>`, true)).toContain("#eeeeee");
    expect(forRaster(`<svg fill="var(--ck-series-1, var(--chart-1, #007aff))" font-family="var(--ck-font-family, Roboto)"/>`, false)).toContain('fill="#007aff"');
    const { app } = appFor();
    const response = await app.handle(get(bar, { format: "png", scale: "1" }));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(Buffer.from(bytes.subarray(0, 8)).toString("hex")).toBe("89504e470d0a1a0a");
    expect(response.headers.get("x-chartkit-watermark")).toBe("1");
  });
});
