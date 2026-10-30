import { createHmac } from "node:crypto";
import { repair } from "@chartkitdev/core/validate";
import { render } from "@chartkitdev/core/extra";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app.ts";
import { CLOUD_PLATE } from "./draw.ts";
import { inflateSync } from "node:zlib";
import { chartBody, EMBED_PAD_BOTTOM, EMBED_PAD_TOP, EMBED_PAD_X, presentSvg } from "./watermark.ts";
import { kvCharts, memoryCharts } from "./charts.ts";
import { kvKeys, memoryKeys } from "./keys.ts";
import { memoryLimiter } from "./limit.ts";
import { auto } from "../../packages/core/src/theme.ts";
import { forRaster, rasterize } from "./png.ts";
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

/** Keyed Cloud SVGs stay padded. The plate fallback is the only drawing difference from the library. */
function expectClean(svg: string) {
  expect(svg).toContain('data-ck-embed="1"');
  expect(svg).not.toContain("data-ck-watermark");
  expectSameDrawing(svg, render(bar));
  expect(svg).toContain(`viewBox="-${EMBED_PAD_X} -${EMBED_PAD_TOP} `);
}

function expectSameDrawing(svg: string, source: string) {
  const cloud = chartBody(svg);
  const library = chartBody(source);
  const plate = `var(--ck-background, ${CLOUD_PLATE})`;
  expect(cloud.drawing.replaceAll(plate, "var(--ck-background, transparent)")).toBe(library.drawing);
  expect(cloud.width).toBe(library.width);
  expect(cloud.height).toBe(library.height);
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
    const library = chartBody(plain);
    expectSameDrawing(svg, plain);
    expect(svg).toContain('data-ck-embed="1"');
    const open = svg.match(/<svg\b[^>]*>/)?.[0] ?? "";
    const box = open.match(/viewBox="(-?[0-9.]+) (-?[0-9.]+) ([0-9.]+) ([0-9.]+)"/);
    const view = box?.slice(1, 5).map(Number) ?? [];
    // Library viewBox is 0 0 <width> <height>. Cloud used to add only the 16px watermark band
    // (0 0 640 256 for this bar, top grid 14px from the edge, 4px under the mark).
    // The embed margin is 24 top, 16 each side, 12 under that band. The plate rect covers it.
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

  it("draws a bar list that repair accepts", async () => {
    const { app } = appFor();
    const spec = {
      version: "1",
      type: "bar-list",
      data: [
        { page: "/pricing", visits: 1840 },
        { page: "/docs", visits: 1420 },
      ],
      encoding: { x: "page", y: "visits" },
      a11y: { alt: "Pricing leads the page list." },
    };
    const response = await app.handle(
      new Request("http://cloud.local/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec, format: "svg" }),
      }),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean; svg: string; errors: unknown[] };
    expect(body.ok).toBe(true);
    expect(body.errors).toEqual([]);
    expect(body.svg).toContain('data-ck-type="bar-list"');
    expect(body.svg).toContain(">/pricing<");
    expect(body.svg).not.toContain("could not draw");
    expect(body.svg).not.toContain("not drawable");
  });

  it("names a type Cloud does not load instead of a generic undrawable picture", async () => {
    const { app } = appFor();
    const spec = {
      version: "1",
      type: "choropleth",
      atlas: "us",
      data: [{ state: "CA", share: 1 }],
      encoding: { region: "state" },
      a11y: { alt: "California is marked." },
    };
    const response = await app.handle(
      new Request("http://cloud.local/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec, format: "svg" }),
      }),
    );
    expect(response.status).toBe(422);
    const body = (await response.json()) as { ok: boolean; svg: string; errors: { code: string; message: string }[] };
    expect(body.ok).toBe(false);
    expect(body.errors[0]?.code).toBe("CK1010");
    expect(body.errors[0]?.message).toContain('type "choropleth" is unsupported on Cloud');
    expect(body.svg).toContain("unsupported on Cloud");
    expect(body.svg).not.toContain("The spec is not drawable.");
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

describe("background plate", () => {
  it("paints an opaque white plate on Soft so a black lightbox can still show the labels", async () => {
    const { app } = appFor();
    const svg = await (await app.handle(get(bar))).text();
    expect(svg).toContain(`var(--ck-background, ${CLOUD_PLATE})`);
    expect(svg).not.toContain("var(--ck-background, transparent)");
    expect(forRaster(svg, false)).toContain(`fill="${CLOUD_PLATE}"`);
    expect(forRaster(svg, false)).not.toContain("transparent");
    const png = await app.handle(get(bar, { format: "png", scale: "1" }));
    expect(png.headers.get("content-type")).toBe("image/png");
    expect(Buffer.from(new Uint8Array(await png.arrayBuffer()).subarray(0, 8)).toString("hex")).toBe("89504e470d0a1a0a");
  });

  it("accepts a background query or body color and keeps midnight opaque", async () => {
    const { app } = appFor();
    const painted = await (await app.handle(get(bar, { background: "#112233" }))).text();
    expect(painted).toContain("var(--ck-background, #112233)");
    expect(forRaster(painted, false)).toContain('fill="#112233"');
    const clear = await (await app.handle(get(bar, { background: "transparent" }))).text();
    expect(clear).toContain("var(--ck-background, transparent)");
    const night = await (await app.handle(get({ ...bar, theme: "midnight" }))).text();
    expect(night).toContain("var(--ck-background, #0c0c0c)");
    expect(night).not.toContain(`var(--ck-background, ${CLOUD_PLATE})`);
    const clearSpec = await (await app.handle(get({ ...bar, theme: { tokens: { background: "transparent" } } }))).text();
    expect(clearSpec).toContain("var(--ck-background, transparent)");
    const darkMode = await (await app.handle(get({ ...bar, theme: { mode: "dark" } }))).text();
    expect(darkMode).toContain("var(--ck-background, #0c0c0c)");
    const specPlate = { ...bar, theme: { preset: "soft", tokens: { background: "#eef2ff" } } };
    const kept = await (await app.handle(get(specPlate))).text();
    expect(kept).toContain("var(--ck-background, #eef2ff)");
    const won = await (await app.handle(get(specPlate, { background: "#112233" }))).text();
    expect(won).toContain("var(--ck-background, #112233)");
    expect(won).not.toContain("#eef2ff");
    const posted = await app.handle(
      new Request("http://cloud.local/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec: bar, background: "#abcdef" }),
      }),
    );
    const body = (await posted.json()) as { svg: string };
    expect(body.svg).toContain("var(--ck-background, #abcdef)");
    const bad = await app.handle(get(bar, { background: "white" }));
    expect(bad.status).toBe(400);
    expect(await bad.text()).toContain("background must be a CSS color");
  });
});

describe("embed plate", () => {
  it("moves the percentage plate onto the padded viewBox and folds it back for parity", () => {
    const source = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="240" viewBox="0 0 640 240"><title>T</title><desc>D</desc><rect width="100%" height="100%" fill="var(--ck-background, #ffffff)" /><text y="8" font-size="12">Hi</text></svg>`;
    const svg = presentSvg(source, { watermark: true, dark: false });
    const plate = readPlate(svg);
    const view = readView(svg);
    expect(plate.kind).toBe("bleed");
    expect(plate).toMatchObject(view);
    expect(plate.fill).toBe("var(--ck-background, #ffffff)");
    expect(svg).not.toContain('width="100%" height="100%"');
    expect(chartBody(svg)).toEqual(chartBody(source));
    const marked = svg.indexOf("data-ck-watermark");
    expect(marked).toBeGreaterThan(svg.indexOf('data-ck-plate="bleed"'));
    expect(svg.endsWith("</svg>")).toBe(true);
  });

  it("underlays a chart that has no full-bleed rect", () => {
    const source = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="112" viewBox="0 0 280 112"><rect x="0.5" y="0.5" width="279" height="111" fill="#f5f5f7" /></svg>`;
    const svg = presentSvg(source, { watermark: false, dark: false, plate: "#ffffff" });
    const plate = readPlate(svg);
    expect(plate.kind).toBe("underlay");
    expect(plate).toMatchObject(readView(svg));
    expect(plate.fill).toBe("#ffffff");
    expect(svg).toContain('x="0.5"');
    expect(chartBody(svg)).toEqual(chartBody(source));
  });

  it("keeps combo, heatmap, pie, donut, kpi, and sparkline off the plate edge", async () => {
    const { app } = appFor();
    const specs: Record<string, unknown> = {
      combo: {
        version: "1",
        type: "combo",
        data: [
          { month: "Jan", revenue: 100, margin: 0.2 },
          { month: "Feb", revenue: 140, margin: 0.24 },
          { month: "Mar", revenue: 130, margin: 0.22 },
        ],
        encoding: {
          x: "month",
          y: [
            { field: "revenue", title: "Revenue", mark: "bar" },
            { field: "margin", title: "Margin", mark: "line", axis: "y2", format: "percent" },
          ],
        },
        axes: { y2: { title: "Margin", format: "percent" } },
        a11y: { alt: "Revenue and margin both finished the quarter higher than they started." },
      },
      heatmap: {
        version: "1",
        type: "heatmap",
        data: [
          { date: "2026-01-01", value: 1 },
          { date: "2026-01-02", value: 4 },
          { date: "2026-01-03", value: 2 },
        ],
        encoding: { x: { field: "date", type: "temporal" }, color: { field: "value", type: "quantitative" } },
        mark: { layout: "calendar", weeks: 12 },
        a11y: { alt: "Activity was highest on January 2 and quieter the day before and after." },
      },
      pie: {
        version: "1",
        type: "pie",
        title: "Share of revenue",
        data: [
          { label: "Search", value: 42 },
          { label: "Direct", value: 28 },
          { label: "Social", value: 18 },
        ],
        encoding: { x: "label", y: "value" },
        mark: { labels: true, labelPosition: "outside", padAngle: 1.5 },
        a11y: { alt: "Search is the largest share of revenue." },
      },
      donut: {
        version: "1",
        type: "donut",
        data: [
          { label: "Search", value: 42 },
          { label: "Direct", value: 28 },
          { label: "Social", value: 18 },
        ],
        encoding: { x: "label", y: "value" },
        mark: { innerRadius: 0.6 },
        a11y: { alt: "Search is the largest traffic source." },
      },
      kpi: {
        version: "1",
        type: "kpi",
        metric: { label: "Revenue", value: 125000, delta: 0.125, format: "compact" },
        data: [10, 12, 9, 14, 18, 17],
        a11y: { alt: "Revenue is 125,000, up 12.5 percent versus the previous period." },
      },
      sparkline: {
        version: "1",
        type: "sparkline",
        data: [10, 25, 15, 30, 22, 28],
        a11y: { alt: "The sparkline trends upward from 10 to 28, with a dip in the middle." },
      },
    };
    for (const [type, spec] of Object.entries(specs)) {
      const svg = await (await app.handle(get(spec))).text();
      const plate = readPlate(svg);
      const view = readView(svg);
      expect(plate, type).toMatchObject(view);
      expect(plate.fill, type).toContain(type === "kpi" ? CLOUD_PLATE : `var(--ck-background, ${CLOUD_PLATE})`);
      expect(svg, type).not.toContain('width="100%" height="100%"');
      const body = chartBody(svg);
      expect(body.drawing, type).not.toContain("data-ck-plate");
      if (type === "kpi") expect(body.drawing, type).not.toContain('width="100%"');
      else expect(body.drawing, type).toContain(`<rect width="100%" height="100%" fill="var(--ck-background, ${CLOUD_PLATE})" />`);
      const gap = inkGap(svg);
      // Combo swatches sit at y=8 and calendar month labels at y=11. The plate has to
      // cover the negative margin or that ink is a few pixels from the white edge.
      expect(Number.isFinite(gap.top), type).toBe(true);
      expect(gap.top, `${type} top ${gap.top}`).toBeGreaterThanOrEqual(20);
      expect(gap.left, `${type} left ${gap.left}`).toBeGreaterThanOrEqual(12);
      expect(gap.bottom, `${type} bottom ${gap.bottom}`).toBeGreaterThanOrEqual(12);
    }
  });

  it("rasters the padded corner in the plate color", async () => {
    const { app } = appFor();
    const combo = {
      version: "1",
      type: "combo",
      data: [
        { month: "Jan", revenue: 100, margin: 0.2 },
        { month: "Feb", revenue: 140, margin: 0.24 },
      ],
      encoding: {
        x: "month",
        y: [
          { field: "revenue", title: "Revenue", mark: "bar" },
          { field: "margin", title: "Margin", mark: "line", axis: "y2", format: "percent" },
        ],
      },
      a11y: { alt: "Revenue and margin both rose." },
    };
    const png = new Uint8Array(await (await app.handle(get(combo, { format: "png", scale: "1" }))).arrayBuffer());
    const image = decodePng(png);
    const view = readView(await (await app.handle(get(combo))).text());
    expect(image.width).toBe(view.w);
    expect(image.height).toBe(view.h);
    expect(sample(image, 0, 0)).toEqual([255, 255, 255, 255]);
    expect(sample(image, 8, 8)).toEqual([255, 255, 255, 255]);
    const swatch = (await (await app.handle(get(combo))).text()).match(/<rect x="([^"]+)" y="([^"]+)" width="10" height="10"/);
    expect(swatch).toBeTruthy();
    const sx = Math.round(Number(swatch?.[1]) - view.x + 5);
    const sy = Math.round(Number(swatch?.[2]) - view.y + 5);
    const ink = sample(image, sx, sy);
    expect(ink[3]).toBe(255);
    expect(ink[0] + ink[1] + ink[2]).toBeLessThan(700);
    const night = new Uint8Array(await (await app.handle(get({ ...bar, theme: "midnight" }, { format: "png", scale: "1" }))).arrayBuffer());
    expect(sample(decodePng(night), 0, 0)).toEqual([12, 12, 12, 255]);
    const clear = new Uint8Array(await (await app.handle(get(bar, { format: "png", scale: "1", background: "transparent" }))).arrayBuffer());
    expect(sample(decodePng(clear), 0, 0)[3]).toBe(0);
  });
});

function readView(svg: string): { x: number; y: number; w: number; h: number } {
  const raw = svg.match(/\bviewBox="([^"]+)"/)?.[1]?.trim().split(/[\s,]+/).map(Number) ?? [];
  return { x: raw[0] ?? 0, y: raw[1] ?? 0, w: raw[2] ?? 0, h: raw[3] ?? 0 };
}

function readPlate(svg: string): { kind: string; x: number; y: number; w: number; h: number; fill: string } {
  const tag = svg.match(/<rect\b[^>]*\bdata-ck-plate="([^"]+)"[^>]*>/)?.[0] ?? "";
  const kind = svg.match(/\bdata-ck-plate="([^"]+)"/)?.[1] ?? "";
  const num = (name: string) => Number(tag.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1]);
  const fill = tag.match(/\bfill="([^"]*)"/)?.[1] ?? "";
  return { kind, x: num("x"), y: num("y"), w: num("width"), h: num("height"), fill };
}

/** Gap from the viewBox edge to the nearest ink, ignoring the plate and defs. */
function inkGap(svg: string): { top: number; left: number; bottom: number } {
  const view = readView(svg);
  const body = svg.replace(/<defs[\s\S]*?<\/defs>/g, "").replace(/<a\b[^>]*\bdata-ck-watermark="1"[\s\S]*?<\/a>/g, "");
  let top = Infinity;
  let left = Infinity;
  let bottom = -Infinity;
  const consider = (x: number, y: number, right = x, low = y) => {
    if (Number.isFinite(y)) top = Math.min(top, y);
    if (Number.isFinite(low)) bottom = Math.max(bottom, low);
    if (Number.isFinite(x)) left = Math.min(left, x);
    if (Number.isFinite(right)) left = Math.min(left, right);
  };
  for (const tag of body.matchAll(/<(text|rect|circle)\b[^>]*>/g)) {
    const el = tag[0];
    if (el.includes("data-ck-plate=") || el.includes('width="100%"')) continue;
    const n = (name: string) => {
      const value = el.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1];
      if (!value || value.endsWith("%")) return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };
    if (tag[1] === "text") {
      const y = n("y");
      const size = n("font-size") ?? 12;
      const x = n("x");
      if (y !== undefined) consider(x ?? Infinity, y - size * 0.8, x, y);
      continue;
    }
    if (tag[1] === "rect") {
      const x = n("x") ?? 0;
      const y = n("y") ?? 0;
      const w = n("width");
      const h = n("height");
      consider(x, y, x, y + (h ?? 0));
      if (w !== undefined) left = Math.min(left, x);
      continue;
    }
    const cx = n("cx");
    const cy = n("cy");
    const r = n("r") ?? 0;
    if (cx !== undefined && cy !== undefined) consider(cx - r, cy - r, cx - r, cy + r);
  }
  for (const path of body.matchAll(/\bd="([^"]+)"/g)) {
    const d = path[1] ?? "";
    if (/[ACQSTVHacqstvh]/.test(d)) continue;
    const nums = d.match(/-?(?:\d+\.\d+|\d+|\.\d+)/g)?.map(Number) ?? [];
    for (let i = 0; i + 1 < nums.length; i += 2) consider(nums[i] ?? Infinity, nums[i + 1] ?? Infinity);
  }
  return {
    top: top - view.y,
    left: left - view.x,
    bottom: view.y + view.h - bottom,
  };
}

function sample(image: { width: number; data: Uint8Array }, x: number, y: number): [number, number, number, number] {
  const i = (y * image.width + x) * 4;
  return [image.data[i] ?? 0, image.data[i + 1] ?? 0, image.data[i + 2] ?? 0, image.data[i + 3] ?? 0];
}

function decodePng(png: Uint8Array): { width: number; height: number; data: Uint8Array } {
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 6;
  const idat: Uint8Array[] = [];
  while (offset + 8 <= png.length) {
    const length = u32(png, offset);
    const type = String.fromCharCode(png[offset + 4] ?? 0, png[offset + 5] ?? 0, png[offset + 6] ?? 0, png[offset + 7] ?? 0);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = u32(png, offset + 8);
      height = u32(png, offset + 12);
      colorType = png[offset + 17] ?? 6;
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat.map((part) => Buffer.from(part))));
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
  const stride = width * channels;
  const out = new Uint8Array(width * height * 4);
  let src = 0;
  let prev = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[src++] ?? 0;
    const row = raw.subarray(src, src + stride);
    src += stride;
    const recon = new Uint8Array(stride);
    for (let i = 0; i < stride; i++) {
      const left = i >= channels ? (recon[i - channels] ?? 0) : 0;
      const up = prev[i] ?? 0;
      const ul = i >= channels ? (prev[i - channels] ?? 0) : 0;
      const value = row[i] ?? 0;
      if (filter === 1) recon[i] = (value + left) & 255;
      else if (filter === 2) recon[i] = (value + up) & 255;
      else if (filter === 3) recon[i] = (value + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) recon[i] = (value + paeth(left, up, ul)) & 255;
      else recon[i] = value;
    }
    prev = recon;
    for (let x = 0; x < width; x++) {
      const i = x * channels;
      const o = (y * width + x) * 4;
      if (channels === 4) {
        out[o] = recon[i] ?? 0;
        out[o + 1] = recon[i + 1] ?? 0;
        out[o + 2] = recon[i + 2] ?? 0;
        out[o + 3] = recon[i + 3] ?? 0;
      } else if (channels === 3) {
        out[o] = recon[i] ?? 0;
        out[o + 1] = recon[i + 1] ?? 0;
        out[o + 2] = recon[i + 2] ?? 0;
        out[o + 3] = 255;
      } else {
        out[o] = out[o + 1] = out[o + 2] = recon[i] ?? 0;
        out[o + 3] = channels === 2 ? (recon[i + 1] ?? 255) : 255;
      }
    }
  }
  return { width, height, data: out };
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function u32(buf: Uint8Array, offset: number): number {
  return ((buf[offset] ?? 0) * 16777216 + ((buf[offset + 1] ?? 0) << 16) + ((buf[offset + 2] ?? 0) << 8) + (buf[offset + 3] ?? 0)) >>> 0;
}

describe("png", () => {
  it("resolves rgba() inside light-dark() and keeps the grid and track off black", async () => {
    const lightToken = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#f5f5f7"/>
      <line x1="0" y1="16" x2="32" y2="16" stroke="var(--ck-grid, ${auto.grid})" stroke-width="8" shape-rendering="crispEdges"/>
      <rect x="2" y="2" width="12" height="10" fill="var(--ck-track, ${auto.track})" shape-rendering="crispEdges"/>
    </svg>`;
    const lightBaked = forRaster(lightToken, false);
    expect(lightBaked).toContain("rgba(0, 0, 0, 0.05)");
    expect(lightBaked).toContain("rgba(0, 0, 0, 0.10)");
    expect(lightBaked).not.toContain("light-dark(");
    expect(lightBaked).not.toMatch(/(?:rgb|hsl)\(\s*[0-9.]+(?:\s+[0-9.]+){2}/);
    const light = decodePng(await rasterize(lightBaked, 1));
    const card = sample(light, 28, 28);
    const grid = sample(light, 16, 16);
    const track = sample(light, 6, 6);
    expect(card[0]).toBeGreaterThan(240);
    expect(grid[0]).toBeGreaterThan(180);
    expect(grid[0]).toBeLessThan(card[0]);
    expect(track[0]).toBeGreaterThan(180);
    expect(track[0]).toBeLessThan(card[0]);

    const darkToken = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#1c1c1e"/>
      <line x1="0" y1="24" x2="32" y2="24" stroke="var(--ck-grid, ${auto.grid})" stroke-width="8" shape-rendering="crispEdges"/>
      <rect x="2" y="2" width="20" height="10" fill="var(--ck-track, ${auto.track})" shape-rendering="crispEdges"/>
    </svg>`;
    const darkBaked = forRaster(darkToken, true);
    expect(darkBaked).toContain("rgba(245, 245, 247, 0.07)");
    expect(darkBaked).toContain("rgba(245, 245, 247, 0.16)");
    expect(darkBaked).not.toContain("light-dark(");
    const dark = decodePng(await rasterize(darkBaked, 1));
    const page = sample(dark, 28, 8);
    const hair = sample(dark, 16, 24);
    const band = sample(dark, 8, 6);
    expect(page[0]).toBeLessThan(40);
    expect(hair[0]).toBeGreaterThan(page[0]);
    expect(hair[0]).toBeLessThan(80);
    expect(band[0]).toBeGreaterThan(page[0] + 8);
    expect(band[0]).toBeLessThan(120);
  });

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
