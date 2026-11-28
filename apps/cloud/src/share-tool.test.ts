import { describe, expect, it } from "vitest";
import { createApp } from "./app.ts";
import { memoryCharts, type ChartStore } from "./charts.ts";
import { MAX_ROWS } from "./draw.ts";
import { memoryKeys } from "./keys.ts";
import { memoryLimiter } from "./limit.ts";

const bar = {
  version: "1",
  type: "bar",
  title: "Lane stops",
  data: [
    { lane: "A", stops: 12 },
    { lane: "C", stops: 15 },
  ],
  encoding: { x: "lane", y: "stops" },
  a11y: { alt: "Lane C has more." },
};

/** No a11y.alt. repair() writes one, so this spec is invalid as sent and valid as stored. */
const fixable = { version: "1", type: "bar", data: bar.data, encoding: bar.encoding };
/** No chart type repair can draw. */
const unfixable = { version: "1", type: "nope" };

interface Shared {
  ok: boolean;
  id: string;
  url: string;
  shareUrl: string;
  svgUrl: string;
  pngUrl: string;
  cardUrl: string;
  watermark: boolean;
  spec: { size?: { width?: number }; theme?: unknown; a11y?: { alt?: string } };
  applied: unknown[];
  warnings: unknown[];
  errors: { code: string; message: string }[];
  diagnostics: unknown[];
}

function appFor(limit = 100) {
  const inner = memoryCharts();
  const puts: unknown[] = [];
  const charts: ChartStore = {
    put(spec, clean, share) {
      puts.push({ spec, clean, share });
      return inner.put(spec, clean, share);
    },
    get: (id) => inner.get(id),
    touch: (id, now) => inner.touch(id, now),
  };
  const app = createApp({
    keys: memoryKeys(["ck_test_known"]),
    charts,
    limiter: memoryLimiter(limit, 60_000, () => 1_000),
    stripe: { secretKey: "", priceId: "", webhookSecret: "", mode: "payment" },
  });
  return { app, puts };
}

function rpc(method: string, params?: unknown, headers: Record<string, string> = {}) {
  return new Request("http://cloud.local/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...headers },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
}

function share(args: Record<string, unknown>, headers?: Record<string, string>) {
  return rpc("tools/call", { name: "share_chart", arguments: args }, headers);
}

async function result(response: Response): Promise<{ isError: boolean; text: string; body: Shared }> {
  const body = (await response.json()) as { result: { isError: boolean; content: { text: string }[] } };
  const text = body.result.content[0]?.text ?? "";
  let parsed = {} as Shared;
  try {
    parsed = JSON.parse(text) as Shared;
  } catch {
    // A tool error that never reached POST /charts is a sentence, not JSON.
  }
  return { isError: body.result.isError, text, body: parsed };
}

function postCharts(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://cloud.local/charts", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function meta(html: string, key: string): string | null {
  const tag = new RegExp(`<meta\\b[^>]*\\b(?:name|property)="${key}"[^>]*>`).exec(html)?.[0];
  return tag ? (/content="([^"]*)"/.exec(tag)?.[1] ?? null) : null;
}

function pngSize(bytes: Uint8Array): { width: number; height: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

describe("share_chart on POST /mcp", () => {
  it("is listed with a description and an input schema an agent can act on", async () => {
    const { app } = appFor();
    const listed = (await (await app.handle(rpc("tools/list"))).json()) as {
      result: { tools: { name: string; description: string; inputSchema: { required: string[]; additionalProperties: boolean; properties: Record<string, { type?: string; description?: string }> } }[] };
    };
    const tool = listed.result.tools.find((item) => item.name === "share_chart");
    expect(tool).toBeDefined();
    for (const word of ["shareUrl", "svgUrl", "pngUrl", "cardUrl", "POST /charts", "365 days", "Authorization: Bearer", "nothing is stored", "render_chart"]) {
      expect(tool?.description, word).toContain(word);
    }
    expect(tool?.inputSchema.required).toEqual(["spec"]);
    expect(tool?.inputSchema.additionalProperties).toBe(false);
    expect(Object.keys(tool?.inputSchema.properties ?? {})).toEqual(["spec", "w", "h", "scale", "theme", "background", "key"]);
    for (const [name, property] of Object.entries(tool?.inputSchema.properties ?? {})) {
      expect(property.description, name).toBeTruthy();
    }
  });

  it("stores the chart and returns links that serve a share page, a card, an SVG, and a PNG", async () => {
    const { app, puts } = appFor();
    const called = await result(await app.handle(share({ spec: bar })));
    expect(called.isError).toBe(false);
    const { body } = called;
    expect(body.ok).toBe(true);
    expect(body.id).toMatch(/^[A-Za-z0-9_-]{16}$/);
    expect(body.shareUrl).toBe(`http://cloud.local/s/${body.id}`);
    expect(body.svgUrl).toBe(`http://cloud.local/c/${body.id}.svg`);
    expect(body.pngUrl).toBe(`http://cloud.local/c/${body.id}.png`);
    expect(body.cardUrl).toBe(`http://cloud.local/c/${body.id}/card.png`);
    expect(body.watermark).toBe(true);
    expect(body.errors).toEqual([]);
    expect(Array.isArray(body.applied)).toBe(true);
    expect(Array.isArray(body.warnings)).toBe(true);
    expect(Array.isArray(body.diagnostics)).toBe(true);
    // Stored once, marked, as a share row: the 365-day rule POST /charts uses.
    expect(puts).toHaveLength(1);
    expect(puts[0]).toMatchObject({ clean: false, share: true });

    const page = await app.handle(new Request(body.shareUrl));
    expect(page.status).toBe(200);
    expect(page.headers.get("content-type")).toContain("text/html");
    const html = await page.text();
    expect(meta(html, "twitter:card")).toBe("summary_large_image");
    expect(meta(html, "og:image")).toBe(body.cardUrl);
    expect(meta(html, "twitter:image")).toBe(body.cardUrl);
    expect(meta(html, "og:title")).toBe("Lane stops");
    expect(meta(html, "og:url")).toBe(body.shareUrl);

    const card = await app.handle(new Request(body.cardUrl));
    expect(card.status).toBe(200);
    expect(card.headers.get("content-type")).toContain("image/png");
    const cardBytes = new Uint8Array(await card.arrayBuffer());
    expect(Array.from(cardBytes.subarray(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
    expect(pngSize(cardBytes)).toEqual({ width: 1200, height: 628 });

    const svg = await app.handle(new Request(body.svgUrl));
    expect(svg.status).toBe(200);
    expect(await svg.text()).toContain('data-ck-type="bar"');
    const png = await app.handle(new Request(body.pngUrl));
    expect(png.status).toBe(200);
    expect(png.headers.get("content-type")).toContain("image/png");
  });

  it("returns what POST /charts returns for the same body", async () => {
    const { app } = appFor();
    const args = { spec: bar, w: 800, h: 400, scale: 2, theme: "midnight", background: "#101418" };
    const tool = await result(await app.handle(share(args)));
    const http = (await (await app.handle(postCharts(args))).json()) as Shared;
    expect(tool.body).toEqual(http);
    expect(tool.body.pngUrl).toBe(`http://cloud.local/c/${tool.body.id}.png?scale=2`);
    expect(tool.body.spec.size?.width).toBe(800);
    expect(tool.body.spec.theme).toEqual({ preset: "midnight", tokens: { background: "#101418" } });
  });

  it("stores a spec that repair can fix, repaired", async () => {
    const { app, puts } = appFor();
    const called = await result(await app.handle(share({ spec: JSON.stringify(fixable) })));
    expect(called.isError).toBe(false);
    expect(called.body.ok).toBe(true);
    expect(called.body.applied.length).toBeGreaterThan(0);
    expect(called.body.spec.a11y?.alt).toBeTruthy();
    expect(puts).toHaveLength(1);
    expect((puts[0] as { spec: unknown }).spec).toEqual(called.body.spec);
    const http = (await (await app.handle(postCharts({ spec: fixable }))).json()) as Shared;
    expect(http.id).toBe(called.body.id);
    expect((await app.handle(new Request(called.body.shareUrl))).status).toBe(200);
  });

  it("returns the errors for a spec repair cannot fix, and stores nothing", async () => {
    const { app, puts } = appFor();
    const called = await result(await app.handle(share({ spec: unfixable })));
    expect(called.isError).toBe(true);
    expect(called.body.ok).toBe(false);
    expect(called.body.errors.length).toBeGreaterThan(0);
    expect(called.body.errors[0]?.code).toMatch(/^CK\d{4}$/);
    expect(called.body.id).toBeUndefined();
    expect(called.body.shareUrl).toBeUndefined();
    expect(called.body.cardUrl).toBeUndefined();
    expect(puts).toHaveLength(0);

    const http = await app.handle(postCharts({ spec: unfixable }));
    expect(http.status).toBe(422);
    expect(called.body).toEqual(await http.json());
    expect(puts).toHaveLength(0);

    const notJson = await result(await app.handle(share({ spec: "{nope" })));
    expect(notJson.isError).toBe(true);
    const missing = await result(await app.handle(share({})));
    expect(missing.isError).toBe(true);
    expect(missing.text).toContain("share_chart expects { spec }");
    expect(puts).toHaveLength(0);
  });

  it("takes a key as an argument or as Authorization: Bearer, and never returns it", async () => {
    for (const [args, headers] of [
      [{ spec: bar, key: "ck_test_known" }, {}],
      [{ spec: bar }, { authorization: "Bearer ck_test_known" }],
    ] as const) {
      const { app, puts } = appFor();
      const called = await result(await app.handle(share(args, headers)));
      expect(called.isError).toBe(false);
      expect(called.body.watermark).toBe(false);
      expect(called.text).not.toContain("ck_test_known");
      // clean: no mark and no expiry, the same row a keyed POST /charts writes.
      expect(puts[0]).toMatchObject({ clean: true });
      const card = await app.handle(new Request(called.body.cardUrl));
      expect(card.headers.get("x-chartkit-watermark")).toBe("0");
      const page = await (await app.handle(new Request(called.body.shareUrl))).text();
      expect(page).not.toContain("data-ck-watermark");
    }

    const { app, puts } = appFor();
    const wrong = await result(await app.handle(share({ spec: bar, key: "ck_test_wrong" })));
    expect(wrong.isError).toBe(false);
    expect(wrong.body.watermark).toBe(true);
    expect(puts[0]).toMatchObject({ clean: false, share: true });
  });

  it("applies the row limit, the size limit, and the rate limit of POST /charts", async () => {
    const { app, puts } = appFor(3);
    const data = Array.from({ length: MAX_ROWS + 1 }, (_, i) => ({ lane: `L${i}`, stops: i % 7 }));
    const rows = await result(await app.handle(share({ spec: { ...bar, data } })));
    expect(rows.isError).toBe(true);
    expect(rows.body.errors[0]?.message).toContain(String(MAX_ROWS));

    const side = await result(await app.handle(share({ spec: { ...bar, size: { width: 20_000, height: 300 } } })));
    expect(side.isError).toBe(true);
    expect(side.body.errors[0]?.message).toContain("4096");

    const frame = await result(await app.handle(share({ spec: bar, w: 999_999 })));
    expect(frame.isError).toBe(true);
    expect(frame.text).toContain("w, h, and scale must be numbers in range");
    expect(puts).toHaveLength(0);

    // Three calls used the limit of three. The fourth is refused before the tool runs.
    const limited = await app.handle(share({ spec: bar }));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
    expect(puts).toHaveLength(0);
  });
});
