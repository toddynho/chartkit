import { describe, expect, it } from "vitest";
import { createApp } from "./app.ts";
import { handleFetch, resetEdgeApp, type EdgeCache } from "./edge.ts";
import { memoryCharts } from "./charts.ts";
import { memoryKeys } from "./keys.ts";
import { clientIp, memoryLimiter } from "./limit.ts";

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

function testApp(limit = 100) {
  return createApp({
    keys: memoryKeys(),
    charts: memoryCharts(),
    limiter: memoryLimiter(limit, 60_000, () => 1_000),
    stripe: { secretKey: "", priceId: "", webhookSecret: "", mode: "payment" },
  });
}

function memoryCache(): EdgeCache & { puts: number } {
  const store = new Map<string, Response>();
  return {
    puts: 0,
    async match(request) {
      return store.get(request.url)?.clone();
    },
    async put(request, response) {
      this.puts += 1;
      store.set(request.url, response);
    },
  };
}

describe("worker fetch handler", () => {
  it("serves health, validate, and a cached GET render", async () => {
    const app = testApp();
    const cache = memoryCache();
    const health = await handleFetch(new Request("http://cloud.local/health"), { app, cache });
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ ok: true, service: "chartkit-cloud" });
    expect(cache.puts).toBe(0);

    const validated = await handleFetch(
      new Request("http://cloud.local/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec: bar }),
      }),
      { app, cache },
    );
    const validation = (await validated.json()) as { ok: boolean };
    expect(validated.status).toBe(200);
    expect(validation.ok).toBe(true);
    expect(cache.puts).toBe(0);

    const params = new URLSearchParams({ spec: JSON.stringify(bar), format: "svg" });
    const url = `http://cloud.local/render?${params}`;
    const first = await handleFetch(new Request(url), { app, cache });
    expect(first.status).toBe(200);
    expect(first.headers.get("content-type")).toContain("image/svg+xml");
    expect(first.headers.get("cache-control")).toContain("immutable");
    expect(await first.text()).toContain("data-ck-watermark");
    expect(cache.puts).toBe(1);

    const second = await handleFetch(new Request(url), { app, cache });
    expect(second.status).toBe(200);
    expect(second.headers.get("x-chartkit-cache")).toBe("edge");
    expect(await second.text()).toContain("data-ck-watermark");
    expect(cache.puts).toBe(1);
  });

  it("rates limits the Cloudflare connecting IP", async () => {
    const app = testApp(1);
    const headers = { "cf-connecting-ip": "203.0.113.8", "x-forwarded-for": "198.51.100.4" };
    const params = new URLSearchParams({ spec: JSON.stringify(bar) });
    const first = await handleFetch(new Request(`http://cloud.local/render?${params}`, { headers }), { app });
    expect(first.status).toBe(200);
    const second = await handleFetch(new Request(`http://cloud.local/render?${params}`, { headers }), { app });
    expect(second.status).toBe(429);
    expect(clientIp(new Request("http://cloud.local/health", { headers }))).toBe("203.0.113.8");
  });

  it("applies string worker env before the first shared app", async () => {
    const previous = process.env.CHARTKIT_DEV_KEYS;
    delete process.env.CHARTKIT_DEV_KEYS;
    resetEdgeApp();
    try {
      const response = await handleFetch(
        new Request("http://cloud.local/render", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: "Bearer ck_test_from_worker" },
          body: JSON.stringify({ spec: bar, format: "svg" }),
        }),
        { env: { CHARTKIT_DEV_KEYS: "ck_test_from_worker", CHARTKIT_KV: { ignore: true } } },
      );
      const body = (await response.json()) as { watermark: boolean; url: string };
      expect(body.watermark).toBe(false);
      expect(body.url).toMatch(/\/c\/[A-Za-z0-9_-]{16}\.svg$/);
      expect(body.url).not.toContain("ck_test_from_worker");
    } finally {
      resetEdgeApp();
      if (previous === undefined) delete process.env.CHARTKIT_DEV_KEYS;
      else process.env.CHARTKIT_DEV_KEYS = previous;
    }
  });
});
