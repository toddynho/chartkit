import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "./app.ts";
import { bindingCharts, chartStoreFromEnv, memoryCharts } from "./charts.ts";
import { handleFetch, resetEdgeApp } from "./edge.ts";
import { bindingKeys, keyStoreFromEnv, memoryKeys, storeKind, type KvNamespaceLike } from "./keys.ts";
import { bindingLimiter, limiterFrom, memoryLimiter, type RateLimitBinding } from "./limit.ts";
import { stripeFromEnv, stripeReady } from "./stripe.ts";

const stripe = { secretKey: "", priceId: "", webhookSecret: "", mode: "payment" as const };

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

/** Workers KV's get/put, backed by a Map. */
function fakeKv(): KvNamespaceLike & { rows: Map<string, string> } {
  const rows = new Map<string, string>();
  return {
    rows,
    async get(key) {
      return rows.get(key) ?? null;
    },
    async put(key, value) {
      rows.set(key, value);
    },
  };
}

function fakeLimit(allow: number): RateLimitBinding & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    async limit({ key }) {
      calls.push(key);
      return { success: calls.length <= allow };
    },
  };
}

afterEach(() => resetEdgeApp());

describe("native KV binding", () => {
  it("issues, checks, and finds keys with the same layout as the REST store", async () => {
    const kv = fakeKv();
    const keys = bindingKeys(kv);
    const issued = await keys.issue({ sessionId: "cs_test_1" });
    expect(kv.rows.get(`ck:key:${issued.key}`)).toBe("1");
    expect(kv.rows.get("ck:session:cs_test_1")).toBe(issued.key);
    expect(await keys.check(issued.key)).toBe(true);
    expect(await keys.check("ck_test_missing")).toBe(false);
    expect(await keys.findBySession("cs_test_1")).toBe(issued.key);
    expect((await keys.issue({ sessionId: "cs_test_1" })).key).toBe(issued.key);
  });

  it("accepts a key written by hand", async () => {
    const kv = fakeKv();
    kv.rows.set("ck:key:ck_live_manual", "1");
    expect(await bindingKeys(kv).check("ck_live_manual")).toBe(true);
  });

  it("stores charts by content hash", async () => {
    const kv = fakeKv();
    const charts = bindingCharts(kv);
    const stored = await charts.put(bar, true);
    expect(kv.rows.has(`ck:chart:${stored.id}`)).toBe(true);
    expect(await bindingCharts(kv).get(stored.id)).toEqual({ id: stored.id, spec: bar, clean: true });
    expect(await charts.get("not-a-real-id")).toBeNull();
  });

  it("prefers the binding over REST, and REST over memory", async () => {
    const kv = fakeKv();
    const rest = { KV_REST_API_URL: "https://kv.example", KV_REST_API_TOKEN: "token" } as NodeJS.ProcessEnv;
    expect(storeKind(rest, { kv })).toBe("kv-binding");
    expect(storeKind(rest, {})).toBe("kv-rest");
    expect(storeKind({} as NodeJS.ProcessEnv, { kv: { ignore: true } })).toBe("memory");

    const charts = chartStoreFromEnv(rest, { kv });
    const stored = await charts.put(bar);
    expect(kv.rows.has(`ck:chart:${stored.id}`)).toBe(true);
  });

  it("keeps CHARTKIT_DEV_KEYS working on top of a durable store", async () => {
    const kv = fakeKv();
    const keys = keyStoreFromEnv({ CHARTKIT_DEV_KEYS: "ck_seed_one, ck_seed_two" } as NodeJS.ProcessEnv, { kv });
    expect(await keys.check("ck_seed_two")).toBe(true);
    expect(await keys.check("ck_test_missing")).toBe(false);
    const issued = await keys.issue();
    expect(await keys.check(issued.key)).toBe(true);
    expect(kv.rows.get(`ck:key:${issued.key}`)).toBe("1");
  });
});

describe("/health storage check", () => {
  it("fails on Workers when keys and charts would only live in memory", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const app = createApp({ keys: memoryKeys(), charts: memoryCharts(), stripe, workers: true, allowMemory: false });
      const health = await app.handle(new Request("http://cloud.local/health"));
      expect(health.status).toBe(503);
      const body = (await health.json()) as { ok: boolean; storage: string; error: string };
      expect(body.ok).toBe(false);
      expect(body.storage).toBe("memory");
      expect(body.error).toContain("CHARTKIT_KV");
      await app.handle(new Request("http://cloud.local/health"));
      expect(error).toHaveBeenCalledTimes(1);

      const render = await app.handle(new Request(`http://cloud.local/render?spec=${encodeURIComponent(JSON.stringify(bar))}`));
      expect(render.status).toBe(200);
    } finally {
      error.mockRestore();
    }
  });

  it("passes on Workers with the KV binding, and with the memory override", async () => {
    const withKv = createApp({ bindings: { kv: fakeKv() }, stripe, workers: true, allowMemory: false });
    const ok = await withKv.handle(new Request("http://cloud.local/health"));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({ ok: true, storage: "kv-binding", checkout: "off" });

    const smoke = createApp({ keys: memoryKeys(), charts: memoryCharts(), stripe, workers: true, allowMemory: true });
    expect((await smoke.handle(new Request("http://cloud.local/health"))).status).toBe(200);
  });

  it("reads the bindings from the worker env through handleFetch", async () => {
    const kv = fakeKv();
    const rateLimit = fakeLimit(100);
    const env = { CHARTKIT_KV: kv, CHARTKIT_RATE_LIMIT: rateLimit };
    const health = await handleFetch(new Request("http://cloud.local/health"), { env, workers: true });
    expect(await health.json()).toMatchObject({ ok: true, storage: "kv-binding", rateLimit: "binding" });

    const stored = await handleFetch(
      new Request("http://cloud.local/charts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ spec: bar }) }),
      { env, workers: true },
    );
    const { id } = (await stored.json()) as { id: string };
    expect(kv.rows.has(`ck:chart:${id}`)).toBe(true);
    expect(rateLimit.calls.length).toBe(1);
  });
});

describe("rate-limit binding", () => {
  it("blocks when the binding says no and reports the period as Retry-After", async () => {
    const app = createApp({ keys: memoryKeys(), charts: memoryCharts(), stripe, limiter: bindingLimiter(fakeLimit(1)) });
    const request = () =>
      new Request("http://cloud.local/validate", {
        method: "POST",
        headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.9" },
        body: JSON.stringify({ spec: bar }),
      });
    expect((await app.handle(request())).status).toBe(200);
    const blocked = await app.handle(request());
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBe("60");
    expect(blocked.headers.get("x-ratelimit-limit")).toBe("120");
  });

  it("keys the binding by client IP and falls back to memory when the binding throws", async () => {
    const binding = fakeLimit(10);
    await bindingLimiter(binding).take("198.51.100.4");
    expect(binding.calls).toEqual(["198.51.100.4"]);

    const broken: RateLimitBinding = {
      async limit() {
        throw new Error("binding down");
      },
    };
    const limiter = bindingLimiter(broken, 1, 60, memoryLimiter(1, 60_000, () => 1_000));
    expect((await limiter.take("a")).ok).toBe(true);
    expect((await limiter.take("a")).ok).toBe(false);
  });

  it("uses memory when nothing is bound", () => {
    expect(limiterFrom(undefined).kind).toBe("memory");
    expect(limiterFrom({ limit: async () => ({ success: true }) }).kind).toBe("binding");
  });
});

describe("checkout off at launch", () => {
  it("stays off with no Stripe secrets", async () => {
    const config = stripeFromEnv({} as NodeJS.ProcessEnv);
    expect(stripeReady(config)).toBe(false);
    const fetchMock = vi.fn();
    const app = createApp({ keys: memoryKeys(), charts: memoryCharts(), stripe: config, fetch: fetchMock });
    const checkout = await app.handle(new Request("http://cloud.local/checkout", { method: "POST" }));
    expect(checkout.status).toBe(503);
    const webhook = await app.handle(
      new Request("http://cloud.local/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=00" },
        body: JSON.stringify({ type: "checkout.session.completed", data: { object: { id: "cs_x", payment_status: "paid" } } }),
      }),
    );
    expect(webhook.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await (await app.handle(new Request("http://cloud.local/health"))).json()).toMatchObject({ checkout: "off" });
  });
});
