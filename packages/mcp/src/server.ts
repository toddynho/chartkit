import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readData, packageVersion } from "./paths.js";
import { renderChart } from "./render-chart.js";
import { getExample, listChartTypes, lookupFeature, renderSpec, repairSpec, validateSpec } from "./tools.js";

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

const specField = z
  .union([z.record(z.string(), z.unknown()), z.string()])
  .describe("ChartKit v1 spec object, or a JSON string of that spec.");

function text(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

function failure(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true as const };
}

/** stdio MCP server. Tool handlers read local files and call core. They do not use the network. */
export function createServer(): McpServer {
  const server = new McpServer(
    { name: "chartkit", version: packageVersion() },
    {
      instructions: [
        "ChartKit MCP server. Tools call @chartkitdev/core on the spec you pass.",
        "validate returns that function's diagnostics, including JSON Patch fixes.",
        "repair applies those fixes and returns the repaired spec plus whatever diagnostics remain.",
        "render returns SVG from @chartkitdev/core/extra (every chart type, including the extra types). PNG is not available from that local tool.",
        "render_chart calls ChartKit Cloud and returns the image URL plus repairs and warnings. Omit format, or pass svg. Pass png only when the host cannot display SVG, and set scale to 2 or higher for that PNG. Free images include a chartkit.dev mark. CHARTKIT_CLOUD_KEY or the key argument is sent as Authorization: Bearer and is not part of the returned URL. A valid key returns a stored chart with the mark removed. The other tools do not use the network.",
        "lookup_feature reads the bundled copy of features.json. Statuses are that file's cells. partial is not native. Every other library is listed, including none.",
        "list_chart_types and get_example return the example specs shipped with this package.",
        "Resources are the bundled llms.txt and the ChartKit v1 JSON Schema.",
      ].join(" "),
    },
  );

  server.registerTool(
    "validate",
    {
      title: "Validate a ChartKit spec",
      description:
        "Validate a ChartKit v1 spec. Returns the object from @chartkitdev/core validate(): ok, diagnostics, errors, and warnings. Each diagnostic can include a JSON Patch fix. The spec is not modified. Gantt, timeline, quadrant, venn, and journey add a CK1011 warning; their extra field rules live in validate/phase4.",
      inputSchema: { spec: specField },
      annotations: READ_ONLY,
    },
    async ({ spec }) => text(validateSpec(spec)),
  );

  server.registerTool(
    "repair",
    {
      title: "Repair a ChartKit spec",
      description:
        "Apply the safe JSON Patch fixes from @chartkitdev/core repair() and revalidate. Returns that function's result: spec, ok, diagnostics, errors, warnings, and applied. The input spec is not mutated. Fixes that the validator did not provide are not invented.",
      inputSchema: { spec: specField },
      annotations: READ_ONLY,
    },
    async ({ spec }) => text(repairSpec(spec)),
  );

  server.registerTool(
    "render",
    {
      title: "Render a ChartKit spec to SVG",
      description:
        'Render a spec with @chartkitdev/core/extra, which registers every chart type including histogram, boxplot, radar, funnel, treemap, sankey, bullet, waterfall, gantt, timeline, quadrant, venn, and journey. Returns the SVG string plus width and height in pixels (the numeric SVG attribute, or the viewBox size when that attribute is a percentage). format is "svg" only. PNG is not implemented: a rasterizer would add a native or wasm dependency, and this package does not include one.',
      inputSchema: {
        spec: specField,
        format: z
          .enum(["svg"])
          .optional()
          .describe('Output format. Only "svg". PNG is not implemented.'),
      },
      annotations: READ_ONLY,
    },
    async ({ spec, format }) => {
      const result = renderSpec(spec, format);
      if ("error" in result) return failure(result.error);
      return text(result);
    },
  );

  server.registerTool(
    "render_chart",
    {
      title: "Render a spec on ChartKit Cloud",
      description:
        "POST the spec to ChartKit Cloud and return the image URL plus the repairs and warnings from validate()+repair(). Omit format, or pass svg. SVG is the default: it skips the resvg pass and stays sharp when attached in chat. Pass png only when the host cannot display SVG, such as email, a GitHub README image, or some Slack clients. When format is png, set scale to 2 or higher for HiDPI. Free renders include a chartkit.dev mark. Pass key, or set CHARTKIT_CLOUD_KEY, to remove it. The key is sent as Authorization: Bearer. The returned URL does not contain the key. CHARTKIT_CLOUD_URL overrides the default https://cloud.chartkit.dev. This tool calls the network. The other tools do not.",
      inputSchema: {
        spec: specField,
        format: z
          .enum(["svg", "png"])
          .optional()
          .describe('Image format. Omit this or pass "svg". Pass "png" only when the host cannot display SVG (email, a GitHub README image, some Slack clients).'),
        w: z.number().optional().describe("Width in pixels."),
        h: z.number().optional().describe("Height in pixels."),
        scale: z.number().optional().describe("PNG zoom, from 1 to 4. Prefer 2 or higher when format is png. Ignored for svg."),
        theme: z.string().optional().describe('Preset name, such as "midnight".'),
        key: z.string().optional().describe("API key that removes the chartkit.dev mark."),
      },
      annotations: { ...READ_ONLY, openWorldHint: true },
    },
    async ({ spec, format, w, h, scale, theme, key }) => {
      const result = await renderChart({ spec, format, w, h, scale, theme, key });
      if ("error" in result) return failure(result.error);
      return text(result);
    },
  );

  server.registerTool(
    "lookup_feature",
    {
      title: "Look up a feature in the matrix",
      description:
        "Search the bundled copy of catalog/public/features.json, including its synonym index. Returns ChartKit's published status, the matrix spec snippet (or null), the docs URL https://chartkit.dev/features/<id>, and every other library's status from the same row. Statuses are native, partial, plugin, manual, none, or unknown. partial, plugin, and manual are not native support. Nothing in this tool is a hand-typed claim: if the file has no row, matches is empty.",
      inputSchema: {
        query: z.string().min(1).describe('Feature id, label, or words such as "rotate labels" or "dual axis".'),
      },
      annotations: READ_ONLY,
    },
    async ({ query }) => text(lookupFeature(query)),
  );

  server.registerTool(
    "list_chart_types",
    {
      title: "List chart types that have examples",
      description:
        "List chart types from the example specs shipped in this package (the repo's packages/core/examples). Each type includes the example filenames. Specs themselves come from get_example.",
      annotations: READ_ONLY,
    },
    async () => text(listChartTypes()),
  );

  server.registerTool(
    "get_example",
    {
      title: "Get example specs for a chart type",
      description:
        "Return the example specs for a chart type, an example filename, or an example id, from the specs shipped in this package. A type with several examples returns each of them.",
      inputSchema: {
        type: z.string().min(1).describe('Chart type such as "line", a filename such as "01-minimal-line", or an example id.'),
      },
      annotations: READ_ONLY,
    },
    async ({ type }) => {
      const result = getExample(type);
      if ("error" in result) return failure(`${result.error} Types: ${result.types.join(", ")}`);
      return text(result);
    },
  );

  server.registerResource(
    "llms.txt",
    "chartkit://llms.txt",
    {
      description: "Bundled copy of ChartKit llms.txt. The rules and one spec per chart type. Not fetched.",
      mimeType: "text/plain",
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "text/plain", text: readData("llms.txt") }],
    }),
  );

  server.registerResource(
    "schema",
    "chartkit://schema/v1.json",
    {
      description: "Bundled copy of the ChartKit v1 JSON Schema (packages/core/schema/chartkit.schema.json). Not fetched.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "application/json", text: readData("schema.json") }],
    }),
  );

  return server;
}
