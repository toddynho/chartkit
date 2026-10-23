import { createHmac } from "node:crypto";
import { repair } from "@chartkitdev/core/validate";
import { render } from "@chartkitdev/core/extra";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app.ts";
import { chartBody } from "./watermark.ts";
import { memoryCharts } from "./charts.ts";
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
    const open = svg.match(/<svg\b[^>]*>/)?.[0] ?? "";
    const box = open.match(/viewBox="0 0 ([0-9.]+) ([0-9.]+)"/);
    expect(Number(box?.[2])).toBe(library.height + 16);
    expect(response.headers.get("x-chartkit-watermark")).toBe("1");
    expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(response.headers.get("etag")).toMatch(/^"[0-9a-f]+"$/);
  });

  it("drops the mark for a valid key and keeps it for a bad key", async () => {
    const { app, keys } = appFor();
    const issued = await keys.issue();
    const clean = await app.handle(get(bar, { key: issued.key }));
    const svg = await clean.text();
    expect(clean.headers.get("x-chartkit-watermark")).toBe("0");
    expect(clean.headers.get("x-chartkit-key")).toBe("valid");
    expect(svg).toBe(render(bar));
    const bearer = await app.handle(
      new Request("http://cloud.local/render", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${issued.key}` },
        body: JSON.stringify({ spec: bar, format: "svg" }),
      }),
    );
    const body = (await bearer.json()) as { watermark: boolean; svg: string; url: string };
    expect(body.watermark).toBe(false);
    expect(body.svg).toBe(render(bar));
    expect(body.url).toContain(`key=${issued.key}`);
    const bad = await app.handle(get(bar, { key: "ck_test_nope" }));
    expect(bad.headers.get("x-chartkit-key")).toBe("invalid");
    expect(await bad.text()).toContain("data-ck-watermark");
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
    expect((await app.handle(get(bar, { key: issued.key }))).status).toBe(200);
    const blocked = await app.handle(get(bar, { key: issued.key }));
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
    const image = await app.handle(get(bar, { key }));
    expect(await image.text()).toBe(render(bar));
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
    expect(body.error).toContain("STRIPE_PRICE_ID");
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
