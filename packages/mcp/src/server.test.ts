import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createServer } from "./server.js";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(pkgRoot, "../..");

const broken = {
  version: "1",
  type: "box-plot",
  data: [
    { group: "A", value: 1 },
    { group: "A", value: 4 },
    { group: "A", value: 6 },
  ],
  encoding: { x: "group", y: "value" },
};

interface ToolText {
  content: { type: string; text?: string }[];
  isError?: boolean;
}

function payload(result: ToolText): unknown {
  const block = result.content.find((item) => item.type === "text");
  expect(block?.text).toBeTruthy();
  return JSON.parse(block?.text ?? "");
}

async function withClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "chartkit-mcp-test", version: "0.0.0" });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    return await run(client);
  } finally {
    await client.close();
    await server.close();
  }
}

const fetchSpy = vi.spyOn(globalThis, "fetch");

afterEach(() => {
  fetchSpy.mockClear();
});

describe("bundled data", () => {
  it("copies features.json, llms.txt, the schema, and the examples without edits", () => {
    expect(sha(join(pkgRoot, "data/features.json"))).toBe(sha(join(repoRoot, "catalog/public/features.json")));
    expect(readFileSync(join(pkgRoot, "data/llms.txt"), "utf8")).toBe(readFileSync(join(repoRoot, "catalog/public/llms.txt"), "utf8"));
    expect(readFileSync(join(pkgRoot, "data/schema.json"), "utf8")).toBe(
      readFileSync(join(repoRoot, "packages/core/schema/chartkit.schema.json"), "utf8"),
    );
    const bundled = readdirSync(join(pkgRoot, "data/examples")).sort();
    const source = readdirSync(join(repoRoot, "packages/core/examples")).filter((name) => name.endsWith(".json")).sort();
    expect(bundled).toEqual(source);
    expect(Buffer.byteLength(readFileSync(join(pkgRoot, "data/llms.txt")))).toBeLessThanOrEqual(6400);
  });
});

describe("MCP tools", () => {
  it("advertises JSON Schema inputs and does not offer PNG", async () => {
    await withClient(async (client) => {
      const listed = await client.listTools();
      const names = listed.tools.map((tool) => tool.name).sort();
      expect(names).toEqual(["get_example", "list_chart_types", "lookup_feature", "render", "render_chart", "repair", "validate"]);
      for (const tool of listed.tools) {
        if (tool.name === "list_chart_types") continue;
        expect(tool.inputSchema.type).toBe("object");
        expect(tool.inputSchema.properties).toBeTruthy();
      }
      const render = listed.tools.find((tool) => tool.name === "render");
      const format = render?.inputSchema.properties?.format as { enum?: string[] } | undefined;
      expect(format?.enum).toEqual(["svg"]);
      expect(render?.description).toMatch(/PNG is not implemented/);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("validates a broken spec and returns the core diagnostics with JSON Patch fixes", async () => {
    await withClient(async (client) => {
      const result = (await client.callTool({ name: "validate", arguments: { spec: broken } })) as ToolText;
      const body = payload(result) as {
        ok: boolean;
        diagnostics: { code: string; fix?: { op: string; path: string }[] }[];
        errors: { code: string }[];
      };
      expect(body.ok).toBe(false);
      expect(body.errors.length).toBeGreaterThan(0);
      expect(body.diagnostics).toEqual(expect.arrayContaining(body.errors));
      const fixed = body.diagnostics.filter((item) => item.fix && item.fix.length > 0);
      expect(fixed.length).toBeGreaterThan(0);
      expect(fixed.some((item) => item.fix?.some((op) => op.op && op.path.startsWith("/")))).toBe(true);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("repairs the broken spec, then renders the repaired chart", async () => {
    await withClient(async (client) => {
      const repaired = payload((await client.callTool({ name: "repair", arguments: { spec: broken } })) as ToolText) as {
        ok: boolean;
        spec: { type?: string; a11y?: { alt?: string } };
        diagnostics: unknown[];
        errors: unknown[];
        warnings: unknown[];
        applied: { op: string; path: string }[];
      };
      expect(repaired.ok).toBe(true);
      expect(repaired.spec.type).toBe("boxplot");
      expect(repaired.spec.a11y?.alt).toBeTruthy();
      expect(repaired.applied.length).toBeGreaterThan(0);
      expect(Array.isArray(repaired.diagnostics)).toBe(true);
      expect(repaired.errors).toEqual([]);

      const before = payload((await client.callTool({ name: "render", arguments: { spec: broken, format: "svg" } })) as ToolText) as {
        svg: string;
      };
      expect(before.svg).not.toContain('data-ck-type="boxplot"');

      const drawn = payload(
        (await client.callTool({ name: "render", arguments: { spec: repaired.spec, format: "svg" } })) as ToolText,
      ) as { format: string; svg: string; width: number; height: number };
      expect(drawn.format).toBe("svg");
      expect(drawn.svg).toContain("<svg");
      expect(drawn.svg).toContain('data-ck-type="boxplot"');
      expect(drawn.svg).not.toContain("ck-chart-error");
      expect(matchesSvgSize(drawn.svg, drawn.width, drawn.height)).toBe(true);
      expect(drawn.width).toBeGreaterThan(0);
      expect(drawn.height).toBeGreaterThan(0);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("looks up features from the bundled matrix, including synonyms and competitors", async () => {
    const matrix = JSON.parse(readFileSync(join(repoRoot, "catalog/public/features.json"), "utf8")) as {
      features: {
        id: string;
        label: string;
        spec: unknown;
        cells: Record<string, { status?: string; apiPaths?: string[]; note?: string }>;
      }[];
      libraries: { id: string }[];
    };
    const rotate = matrix.features.find((feature) => feature.id === "axis.ticks.rotate");
    const dual = matrix.features.find((feature) => feature.label === "Multiple / dual y axes");
    expect(rotate).toBeTruthy();
    expect(dual).toBeTruthy();

    await withClient(async (client) => {
      const byId = payload(
        (await client.callTool({ name: "lookup_feature", arguments: { query: "axis.ticks.rotate" } })) as ToolText,
      ) as { matches: Hit[] };
      expect(byId.matches).toHaveLength(1);
      expect(sameClaim(byId.matches[0], rotate!, matrix.libraries)).toBe(true);

      const byWords = payload(
        (await client.callTool({ name: "lookup_feature", arguments: { query: "rotate labels" } })) as ToolText,
      ) as { matches: Hit[] };
      expect(byWords.matches[0]?.id).toBe(rotate!.id);
      expect(byWords.matches[0]?.chartkit.status).toBe(rotate!.cells.chartkit?.status);

      const byLabel = payload(
        (await client.callTool({ name: "lookup_feature", arguments: { query: "tick label rotation" } })) as ToolText,
      ) as { matches: Hit[] };
      expect(byLabel.matches[0]?.id).toBe("axis.ticks.rotate");

      const bySynonym = payload(
        (await client.callTool({ name: "lookup_feature", arguments: { query: "dual axis" } })) as ToolText,
      ) as { matches: Hit[] };
      expect(bySynonym.matches[0]?.id).toBe(dual!.id);
      expect(bySynonym.matches[0]?.chartkit.status).toBe(dual!.cells.chartkit?.status);

      const missing = payload(
        (await client.callTool({ name: "lookup_feature", arguments: { query: "not-a-real-feature-zz" } })) as ToolText,
      ) as { matches: unknown[] };
      expect(missing.matches).toEqual([]);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("lists chart types and returns the example specs", async () => {
    await withClient(async (client) => {
      const listed = payload((await client.callTool({ name: "list_chart_types", arguments: {} })) as ToolText) as {
        types: { type: string; files: string[] }[];
      };
      const line = listed.types.find((item) => item.type === "line");
      const gantt = listed.types.find((item) => item.type === "gantt");
      expect(line?.files).toContain("01-minimal-line.json");
      expect(gantt?.files).toEqual(["24-gantt.json"]);

      const example = payload((await client.callTool({ name: "get_example", arguments: { type: "line" } })) as ToolText) as {
        type: string;
        examples: { file: string; spec: { type: string; a11y: { alt: string } } }[];
      };
      expect(example.type).toBe("line");
      expect(example.examples.map((item) => item.file)).toContain("01-minimal-line.json");
      const minimal = example.examples.find((item) => item.file === "01-minimal-line.json");
      expect(minimal?.spec).toEqual(JSON.parse(readFileSync(join(repoRoot, "packages/core/examples/01-minimal-line.json"), "utf8")));

      const named = payload(
        (await client.callTool({ name: "get_example", arguments: { type: "02-rich-line" } })) as ToolText,
      ) as { examples: { file: string; spec: { type: string } }[] };
      expect(named.examples).toHaveLength(1);
      expect(named.examples[0]?.spec.type).toBe("line");

      const extra = payload((await client.callTool({ name: "get_example", arguments: { type: "sankey" } })) as ToolText) as {
        examples: { spec: unknown }[];
      };
      const drawn = payload(
        (await client.callTool({ name: "render", arguments: { spec: extra.examples[0]?.spec, format: "svg" } })) as ToolText,
      ) as { svg: string; width: number; height: number };
      expect(drawn.svg).toContain('data-ck-type="sankey"');
      expect(drawn.width).toBeGreaterThan(0);
      expect(drawn.height).toBeGreaterThan(0);

      const missing = (await client.callTool({ name: "get_example", arguments: { type: "nope" } })) as ToolText;
      expect(missing.isError).toBe(true);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});

describe("MCP resources", () => {
  it("serves the bundled llms.txt and JSON Schema", async () => {
    await withClient(async (client) => {
      const listed = await client.listResources();
      const uris = listed.resources.map((resource) => resource.uri).sort();
      expect(uris).toEqual(["chartkit://llms.txt", "chartkit://schema/v1.json"]);

      const llms = await client.readResource({ uri: "chartkit://llms.txt" });
      expect(textOf(llms.contents[0])).toBe(readFileSync(join(repoRoot, "catalog/public/llms.txt"), "utf8"));
      const schema = await client.readResource({ uri: "chartkit://schema/v1.json" });
      expect(textOf(schema.contents[0])).toBe(readFileSync(join(repoRoot, "packages/core/schema/chartkit.schema.json"), "utf8"));
      expect(schema.contents[0]?.mimeType).toBe("application/json");
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});

describe("render_chart", () => {
  it("returns the cloud image URL and the repairs", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ok: true,
          url: "https://cloud.chartkit.dev/render?spec=%7B%7D&format=svg",
          watermark: true,
          applied: [{ op: "add", path: "/a11y" }],
          warnings: [],
          errors: [],
          spec: { version: "1", type: "bar" },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    await withClient(async (client) => {
      const body = payload(
        (await client.callTool({ name: "render_chart", arguments: { spec: { version: "1", type: "bar" }, format: "svg" } })) as ToolText,
      ) as { url: string; applied: { path: string }[]; watermark: boolean };
      expect(body.url).toContain("https://cloud.chartkit.dev/render");
      expect(body.applied[0]?.path).toBe("/a11y");
      expect(body.watermark).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const called = String(fetchSpy.mock.calls[0]?.[0]);
      expect(called).toBe("https://cloud.chartkit.dev/render");
    });
  });
});

describe("source", () => {
  it("keeps network calls inside render_chart", () => {
    const files = readdirSync(join(pkgRoot, "src")).filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"));
    const local = files.filter((name) => name !== "render-chart.ts");
    const combined = local.map((name) => readFileSync(join(pkgRoot, "src", name), "utf8")).join("\n");
    expect(combined).not.toMatch(/\bfetch\s*\(/);
    expect(combined).not.toMatch(/node:https|node:http|https\.request|http\.request/);
    const cloud = readFileSync(join(pkgRoot, "src/render-chart.ts"), "utf8");
    expect(cloud).toContain("https://cloud.chartkit.dev");
    expect(cloud).toContain("fetcher(`${origin}/render`");
  });
});

interface Hit {
  id: string;
  spec: unknown;
  docsUrl: string;
  chartkit: { status: string; apiPaths: string[]; note?: string };
  libraries: { id: string; status: string; apiPaths: string[] }[];
}

function sameClaim(
  hit: Hit,
  feature: {
    id: string;
    spec: unknown;
    cells: Record<string, { status?: string; apiPaths?: string[]; note?: string }>;
  },
  libraries: { id: string }[],
): boolean {
  const chartkit = feature.cells.chartkit;
  expect(hit.docsUrl).toBe(`https://chartkit.dev/features/${feature.id}`);
  expect(hit.spec).toEqual(feature.spec);
  expect(hit.chartkit.status).toBe(chartkit?.status);
  expect(hit.chartkit.apiPaths).toEqual(chartkit?.apiPaths ?? []);
  expect(hit.chartkit.note).toBe(chartkit?.note);
  const expectedIds = libraries.map((library) => library.id).filter((id) => id !== "chartkit").sort();
  expect(hit.libraries.map((library) => library.id).sort()).toEqual(expectedIds);
  for (const library of hit.libraries) {
    expect(library.status).toBe(feature.cells[library.id]?.status ?? "unknown");
    expect(library.apiPaths).toEqual(feature.cells[library.id]?.apiPaths ?? []);
  }
  return true;
}

function textOf(content: { text?: string; blob?: string } | undefined): string {
  return content && "text" in content ? (content.text ?? "") : "";
}

function matchesSvgSize(svg: string, width: number, height: number): boolean {
  const open = svg.match(/<svg\b[^>]*>/)?.[0] ?? "";
  const viewBox = open.match(/\bviewBox="0 0 ([0-9.]+) ([0-9.]+)"/);
  const widthAttr = open.match(/\bwidth="([^"]+)"/)?.[1];
  const heightAttr = open.match(/\bheight="([^"]+)"/)?.[1];
  const expectedWidth = widthAttr && !widthAttr.endsWith("%") ? Number(widthAttr) : Number(viewBox?.[1]);
  const expectedHeight = heightAttr && !heightAttr.endsWith("%") ? Number(heightAttr) : Number(viewBox?.[2]);
  expect(width).toBe(expectedWidth);
  expect(height).toBe(expectedHeight);
  return true;
}

function sha(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}
