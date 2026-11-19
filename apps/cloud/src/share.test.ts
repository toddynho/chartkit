import { describe, expect, it, vi } from "vitest";
import { createApp } from "./app.ts";
import { memoryCharts } from "./charts.ts";
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

const REQUIRED = [
  "twitter:card",
  "twitter:site",
  "twitter:image",
  "og:title",
  "og:description",
  "og:url",
  "og:image",
  "og:image:width",
  "og:image:height",
  "og:image:alt",
] as const;

function appFor() {
  const keys = memoryKeys();
  const charts = memoryCharts();
  const app = createApp({ keys, charts, limiter: memoryLimiter(100, 60_000, () => 1_000), stripe: { secretKey: "", priceId: "", webhookSecret: "", mode: "payment" }, fetch: vi.fn() });
  return { app, keys };
}

function meta(html: string, key: string): string | null {
  const tag = new RegExp(`<meta\\b[^>]*\\b(?:name|property)="${key}"[^>]*>`).exec(html)?.[0];
  if (!tag) return null;
  const content = /content="([^"]*)"/.exec(tag)?.[1];
  return content === undefined ? null : decode(content);
}

function decode(value: string): string {
  return value.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function pngSize(bytes: Uint8Array): { width: number; height: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

describe("share pages", () => {
  it("returns every card tag with absolute URLs, and a 1200x628 card", async () => {
    const { app } = appFor();
    const created = await app.handle(
      new Request("http://cloud.local/charts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec: bar }),
      }),
    );
    const stored = (await created.json()) as { id: string; shareUrl: string; svgUrl: string };
    expect(stored.shareUrl).toBe(`http://cloud.local/s/${stored.id}`);
    expect(stored.svgUrl).toBe(`http://cloud.local/c/${stored.id}.svg`);

    const page = await app.handle(new Request(stored.shareUrl));
    expect(page.status).toBe(200);
    expect(page.headers.get("content-type")).toContain("text/html");
    expect(page.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    const html = await page.text();
    for (const key of REQUIRED) expect(meta(html, key), key).not.toBeNull();
    expect(meta(html, "twitter:card")).toBe("summary_large_image");
    expect(meta(html, "twitter:site")).toBe("@toddo");
    expect(meta(html, "og:title")).toBe("Lane stops");
    expect(meta(html, "og:description")).toBe("Lane C has more.");
    expect(meta(html, "og:image:alt")).toBe("Lane C has more.");
    expect(meta(html, "og:image:width")).toBe("1200");
    expect(meta(html, "og:image:height")).toBe("628");
    const image = meta(html, "og:image");
    const twitter = meta(html, "twitter:image");
    const pageUrl = meta(html, "og:url");
    expect(image).toBe(`http://cloud.local/c/${stored.id}/card.png`);
    expect(twitter).toBe(image);
    expect(pageUrl).toBe(stored.shareUrl);
    for (const url of [image, twitter, pageUrl]) expect(url).toMatch(/^https?:\/\//);
    expect(html).toContain('href="https://chartkit.dev"');
    expect(html).toContain("Made with ChartKit");
    expect(html).toContain("Open in playground");
    expect(html).toContain("https://chartkit.dev/playground#");
    expect(html).toContain('data-ck-watermark="1"');

    const card = await app.handle(new Request(image ?? ""));
    expect(card.status).toBe(200);
    expect(card.headers.get("content-type")).toContain("image/png");
    expect(card.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(card.headers.get("x-chartkit-watermark")).toBe("1");
    const bytes = new Uint8Array(await card.arrayBuffer());
    expect(Array.from(bytes.subarray(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
    expect(pngSize(bytes)).toEqual({ width: 1200, height: 628 });

    const forced = await app.handle(new Request(`${image}?scale=4&w=3000`));
    expect(forced.status).toBe(200);
    expect(pngSize(new Uint8Array(await forced.arrayBuffer()))).toEqual({ width: 1200, height: 628 });
  });

  it("escapes a malicious title and description", async () => {
    const { app } = appFor();
    const title = '</title><script>alert("x")</script>';
    const alt = '"><img src=x onerror=alert(1)>';
    const created = await app.handle(
      new Request("http://cloud.local/charts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec: { ...bar, title, a11y: { alt } } }),
      }),
    );
    const stored = (await created.json()) as { shareUrl: string };
    const html = await (await app.handle(new Request(stored.shareUrl))).text();
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(meta(html, "og:title")).toBe(title);
    expect(meta(html, "og:description")).toBe(alt);
    expect(meta(html, "twitter:title")).toBe(title);
  });

  it("renders an on-the-fly page whose image is the card render", async () => {
    const { app } = appFor();
    const page = await app.handle(new Request(`http://cloud.local/s?${new URLSearchParams({ spec: JSON.stringify(bar) })}`));
    expect(page.status).toBe(200);
    const html = await page.text();
    for (const key of REQUIRED) expect(meta(html, key), key).not.toBeNull();
    const image = meta(html, "og:image") ?? "";
    expect(image.startsWith("http://cloud.local/render?")).toBe(true);
    expect(image).toContain("format=png");
    expect(image).toContain("card=1");
    expect(meta(html, "og:url")).toMatch(/^http:\/\/cloud\.local\/s\?/);
    const card = await app.handle(new Request(image));
    expect(card.headers.get("content-type")).toContain("image/png");
    expect(pngSize(new Uint8Array(await card.arrayBuffer()))).toEqual({ width: 1200, height: 628 });
  });

  it("404s an unknown id with an HTML page", async () => {
    const { app } = appFor();
    const missing = await app.handle(new Request("http://cloud.local/s/unknownid"));
    expect(missing.status).toBe(404);
    expect(missing.headers.get("content-type")).toContain("text/html");
    expect(missing.headers.get("cache-control")).toBe("no-store");
    const html = await missing.text();
    expect(html).toContain("<!doctype html");
    expect(html).toContain("Unknown chart");
    expect(html).not.toContain("twitter:card");
  });

  it("leaves the mark off a keyed card and omits shareUrl when nothing is stored", async () => {
    const { app, keys } = appFor();
    const issued = await keys.issue();
    const created = await app.handle(
      new Request("http://cloud.local/charts", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${issued.key}` },
        body: JSON.stringify({ spec: bar }),
      }),
    );
    const stored = (await created.json()) as { id: string; watermark: boolean };
    expect(stored.watermark).toBe(false);
    const card = await app.handle(new Request(`http://cloud.local/c/${stored.id}/card.png`));
    expect(card.headers.get("x-chartkit-watermark")).toBe("0");
    expect(pngSize(new Uint8Array(await card.arrayBuffer()))).toEqual({ width: 1200, height: 628 });
    const page = await (await app.handle(new Request(`http://cloud.local/s/${stored.id}`))).text();
    expect(page).not.toContain("data-ck-watermark");

    const rendered = await app.handle(
      new Request("http://cloud.local/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec: bar }),
      }),
    );
    const body = (await rendered.json()) as { url: string; shareUrl?: string };
    expect(body.url).toContain("/render?");
    expect(body.shareUrl).toBeUndefined();
  });
});
