import { describe, expect, it } from "vitest";
import { createApp } from "./app.ts";
import { memoryCharts } from "./charts.ts";
import { memoryKeys } from "./keys.ts";
import { memoryLimiter } from "./limit.ts";

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

function appFor() {
  return createApp({
    keys: memoryKeys(["ck_test_known"]),
    charts: memoryCharts(),
    limiter: memoryLimiter(100, 60_000, () => 1_000),
    stripe: { secretKey: "", priceId: "", webhookSecret: "", mode: "payment" },
  });
}

function rpc(method: string, params?: unknown, id: number | null = 1, accept = "application/json, text/event-stream") {
  return new Request("http://cloud.local/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
}

describe("POST /mcp", () => {
  it("lists render_chart and renders through the same path", async () => {
    const app = appFor();
    const listed = await app.handle(rpc("tools/list"));
    const tools = (await listed.json()) as {
      result: { tools: { name: string; description: string; inputSchema: { properties: { format: { default?: string; description?: string; enum?: string[] }; scale: { description?: string } } } }[] };
    };
    expect(listed.headers.get("content-type")).toContain("application/json");
    expect(tools.result.tools.map((tool) => tool.name)).toEqual(["render_chart"]);
    const tool = tools.result.tools[0];
    expect(tool?.description).toMatch(/Omit format, or pass svg/);
    expect(tool?.description).toMatch(/GitHub README image/);
    expect(tool?.description).toMatch(/scale to 2 or higher/);
    expect(tool?.inputSchema.properties.format.enum).toEqual(["svg", "png"]);
    expect(tool?.inputSchema.properties.format.default).toBe("svg");
    expect(tool?.inputSchema.properties.format.description).toMatch(/cannot display SVG/);
    expect(tool?.inputSchema.properties.scale.description).toMatch(/Prefer 2 or higher/);
    expect(tool?.description).toMatch(/#ffffff/);
    expect(tool?.description).toMatch(/background/);
    const background = tool?.inputSchema.properties as { background?: { description?: string } };
    expect(background.background?.description).toMatch(/#ffffff/);
    expect(background.background?.description).toMatch(/transparent/);

    const called = await app.handle(
      rpc("tools/call", { name: "render_chart", arguments: { spec: bar, format: "svg", key: "ck_test_known" } }),
    );
    const body = (await called.json()) as { result: { isError: boolean; content: { text: string }[] } };
    expect(body.result.isError).toBe(false);
    const rendered = JSON.parse(body.result.content[0]?.text ?? "") as { watermark: boolean; url: string; svg: string };
    expect(rendered.watermark).toBe(false);
    expect(rendered.svg).not.toContain("data-ck-watermark");
    expect(rendered.url).toMatch(/^http:\/\/cloud\.local\/c\/[A-Za-z0-9_-]{16}\.svg$/);
    expect(rendered.url).not.toContain("ck_test_known");
    expect(body.result.content[0]?.text).not.toContain("ck_test_known");
  });

  it("answers initialize and a streamable-only accept as one SSE event", async () => {
    const app = appFor();
    const ready = await app.handle(rpc("initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "test", version: "0" } }));
    const init = (await ready.json()) as { result: { protocolVersion: string; serverInfo: { name: string } } };
    expect(init.result.protocolVersion).toBe("2025-03-26");
    expect(init.result.serverInfo.name).toBe("chartkit-cloud");

    const note = await app.handle(
      new Request("http://cloud.local/mcp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
      }),
    );
    expect(note.status).toBe(202);
    expect(await note.text()).toBe("");

    const stream = await app.handle(rpc("ping", {}, 7, "text/event-stream"));
    expect(stream.headers.get("content-type")).toContain("text/event-stream");
    expect(await stream.text()).toContain('data: {"jsonrpc":"2.0","id":7,"result":{}}');

    const get = await app.handle(new Request("http://cloud.local/mcp"));
    expect(get.status).toBe(405);
  });
});
