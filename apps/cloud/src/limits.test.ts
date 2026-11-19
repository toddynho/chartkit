import { describe, expect, it, vi } from "vitest";
import { createApp, type CloudApp } from "./app.ts";
import { ANONYMOUS_CHART_TTL_SECONDS, SHARE_CHART_TTL_SECONDS, SHARE_REFRESH_AFTER_SECONDS, backendCharts, memoryCharts } from "./charts.ts";
import { MAX_PNG_PIXELS, MAX_ROWS, MAX_SIDE } from "./draw.ts";
import { handleFetch } from "./edge.ts";
import { bindingBackend, memoryKeys, restBackend, type KvBackend } from "./keys.ts";
import { memoryLimiter } from "./limit.ts";
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

function app(): CloudApp {
  return createApp({ keys: memoryKeys(), charts: memoryCharts(), limiter: memoryLimiter(1000, 60_000, () => 1_000), stripe, fetch: vi.fn() });
}

function post(body: unknown): Request {
  return new Request("http://cloud.local/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

function get(spec: unknown, query: Record<string, string> = {}): Request {
  return new Request(`http://cloud.local/render?${new URLSearchParams({ spec: JSON.stringify(spec), ...query })}`);
}

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];

describe("render limits", () => {
  it("refuses a spec whose own size is past the longest side, as SVG and as PNG", async () => {
    const spec = { ...bar, size: { width: 20_000, height: 20_000 } };
    for (const format of ["svg", "png"]) {
      const response = await app().handle(post({ spec, format }));
      expect(response.status).toBe(422);
      const body = (await response.json()) as { ok: boolean; errors: { path: string; message: string }[] };
      expect(body.ok).toBe(false);
      expect(body.errors[0].path).toBe("/size/width");
      expect(body.errors[0].message).toContain(String(MAX_SIDE));
    }
  });

  it("refuses a PNG over the pixel budget and still returns a small PNG that says why", async () => {
    // 2400 x 2400 is inside the side limit, and 5.76M pixels is past the budget.
    expect(2400 * 2400).toBeGreaterThan(MAX_PNG_PIXELS);
    const response = await app().handle(get(bar, { format: "png", w: "2400", h: "2400" }));
    expect(response.status).toBe(422);
    expect(response.headers.get("content-type")).toBe("image/png");
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect([...bytes.slice(0, 4)]).toEqual(PNG_MAGIC);
    // The error picture is 640 x 240, so it is far smaller than the PNG that was asked for.
    expect(bytes.length).toBeLessThan(200_000);
  });

  it("counts scale in the pixel budget", async () => {
    // 1200 x 1000 is 1.2M pixels at scale 1 and 19.2M at scale 4.
    const fine = await app().handle(get(bar, { format: "png", w: "1200", h: "1000" }));
    expect(fine.status).toBe(200);
    const over = await app().handle(get(bar, { format: "png", w: "1200", h: "1000", scale: "4" }));
    expect(over.status).toBe(422);
  });

  it("leaves SVG alone at a size that is too large for a PNG", async () => {
    const response = await app().handle(get(bar, { format: "svg", w: "4096", h: "4096" }));
    expect(response.status).toBe(200);
  });

  it("refuses more rows than the row limit", async () => {
    const data = Array.from({ length: MAX_ROWS + 1 }, (_, i) => ({ lane: `L${i}`, stops: i % 7 }));
    const response = await app().handle(post({ spec: { ...bar, data }, format: "svg" }));
    expect(response.status).toBe(422);
    const body = (await response.json()) as { errors: { path: string }[] };
    expect(body.errors[0].path).toBe("/data");
  });
});

describe("unhandled errors", () => {
  it("answers 500 JSON with CORS and does not throw to the platform", async () => {
    const broken: CloudApp = {
      async handle() {
        throw new Error("boom");
      },
    };
    const quiet = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await handleFetch(new Request("http://cloud.local/render"), { app: broken });
    quiet.mockRestore();
    expect(response.status).toBe(500);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(((await response.json()) as { ok: boolean }).ok).toBe(false);
  });
});

describe("stored chart expiry", () => {
  function recording(): KvBackend & { sets: { key: string; ttl?: number }[] } {
    const rows = new Map<string, string>();
    const sets: { key: string; ttl?: number }[] = [];
    return {
      sets,
      async get(key) {
        return rows.get(key) ?? null;
      },
      async set(key, value, ttl) {
        rows.set(key, value);
        sets.push({ key, ttl });
      },
    };
  }

  it("expires a chart stored without a key after 30 days and keeps one stored with a key", async () => {
    const backend = recording();
    const charts = backendCharts(backend);
    await charts.put(bar, false);
    await charts.put(bar, true);
    expect(ANONYMOUS_CHART_TTL_SECONDS).toBe(30 * 24 * 60 * 60);
    expect(backend.sets.map((row) => row.ttl)).toEqual([ANONYMOUS_CHART_TTL_SECONDS, undefined]);
  });

  it("does not write again for a chart that is already stored", async () => {
    const backend = recording();
    const charts = backendCharts(backend);
    await charts.put(bar, false);
    await charts.put(bar, false);
    expect(backend.sets).toHaveLength(1);
  });

  it("keeps a share chart for a year and refreshes that year on a later read", async () => {
    const backend = recording();
    const charts = backendCharts(backend);
    const shared = await charts.put(bar, false, true);
    expect(backend.sets.map((row) => row.ttl)).toEqual([SHARE_CHART_TTL_SECONDS]);
    expect(shared.share).toBe(true);
    await charts.touch(shared.id);
    expect(backend.sets).toHaveLength(1);
    await charts.touch(shared.id, (shared.refreshedAt ?? 0) + SHARE_REFRESH_AFTER_SECONDS);
    expect(backend.sets).toHaveLength(2);
    expect(backend.sets[1]?.ttl).toBe(SHARE_CHART_TTL_SECONDS);

    const image = await charts.put({ ...bar, title: "Image only" }, false);
    expect(backend.sets.at(-1)?.ttl).toBe(ANONYMOUS_CHART_TTL_SECONDS);
    const promoted = await charts.touch(image.id);
    expect(promoted?.share).toBe(true);
    expect(backend.sets.at(-1)?.ttl).toBe(SHARE_CHART_TTL_SECONDS);

    const keyed = await charts.put(bar, true);
    await charts.touch(keyed.id, (keyed.refreshedAt ?? 0) + SHARE_REFRESH_AFTER_SECONDS);
    expect(backend.sets.filter((row) => row.key.endsWith(keyed.id)).map((row) => row.ttl)).toEqual([undefined]);
  });

  it("stores a POST /charts row with the share TTL", async () => {
    const backend = recording();
    const app = createApp({
      keys: memoryKeys(),
      charts: backendCharts(backend),
      limiter: memoryLimiter(100, 60_000, () => 1_000),
      stripe,
      fetch: vi.fn(),
    });
    const response = await app.handle(
      new Request("http://cloud.local/charts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec: bar }),
      }),
    );
    const body = (await response.json()) as { shareUrl: string; id: string };
    expect(response.status).toBe(200);
    expect(body.shareUrl).toBe(`http://cloud.local/s/${body.id}`);
    expect(backend.sets.map((row) => row.ttl)).toEqual([SHARE_CHART_TTL_SECONDS]);
  });

  it("passes the expiry to Workers KV as expirationTtl and to the REST store as EX", async () => {
    const put = vi.fn(async () => undefined);
    await bindingBackend({ get: async () => null, put }).set("k", "v", 60);
    expect(put).toHaveBeenCalledWith("k", "v", { expirationTtl: 60 });
    await bindingBackend({ get: async () => null, put }).set("k", "v");
    expect(put).toHaveBeenLastCalledWith("k", "v");

    const fetcher = vi.fn(async () => new Response(JSON.stringify({ result: "OK" }), { status: 200 }));
    await restBackend({ url: "https://kv.local", token: "t", fetch: fetcher as unknown as typeof fetch }, "test").set("k", "v", 60);
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toEqual(["SET", "k", "v", "EX", 60]);
  });
});
