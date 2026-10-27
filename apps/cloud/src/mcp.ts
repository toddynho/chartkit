/**
 * Stateless Streamable HTTP MCP at POST /mcp.
 * One tool, render_chart, which calls the same POST /render path as the HTTP API.
 * This is not the stdio server in @chartkitdev/mcp.
 */

const PROTOCOL = "2025-03-26";
const SUPPORTED = new Set(["2024-11-05", "2025-03-26", "2025-06-18"]);

const TOOL = {
  name: "render_chart",
  description:
    "Render a ChartKit spec on this Cloud service. Returns the image URL plus repairs, warnings, and errors. Omit format, or pass svg. SVG is the default: it skips the resvg pass and stays sharp when attached in chat. Pass png only when the host cannot display SVG, such as email, a GitHub README image, or some Slack clients. When format is png, set scale to 2 or higher for HiDPI. Free renders include a chartkit.dev mark. Pass key, or send Authorization: Bearer, to remove it. The key is not part of the image URL.",
  inputSchema: {
    type: "object",
    properties: {
      spec: { description: "ChartKit spec object or JSON string." },
      format: {
        type: "string",
        enum: ["svg", "png"],
        default: "svg",
        description:
          "Image format. Omit this or pass svg. SVG is the default and the format to attach in chat. Pass png only when the host cannot display SVG (email, a GitHub README image, some Slack clients).",
      },
      w: { type: "number" },
      h: { type: "number" },
      scale: {
        type: "number",
        description: "PNG zoom from 1 to 4. Prefer 2 or higher when format is png so the raster stays sharp on HiDPI. Ignored for svg.",
      },
      theme: { type: "string" },
      key: { type: "string", description: "Sent as Authorization: Bearer. Omitted from the image URL." },
    },
    required: ["spec"],
    additionalProperties: false,
  },
} as const;

type JsonRpcId = string | number | null;

interface ToolCall {
  headers?: HeadersInit;
  body: string;
}

export async function handleMcp(request: Request, render: (call: ToolCall) => Promise<Response>): Promise<Response> {
  if (request.method === "GET" || request.method === "DELETE") {
    return reply(request, 405, rpcError(null, -32600, "POST a single JSON-RPC message to /mcp. This server is stateless and does not open an SSE stream."));
  }
  if (request.method !== "POST") {
    return reply(request, 405, rpcError(null, -32600, "POST a single JSON-RPC message to /mcp."));
  }
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().includes("application/json")) {
    return reply(request, 415, rpcError(null, -32700, "Content-Type must be application/json."));
  }
  let message: unknown;
  try {
    message = JSON.parse(await request.text()) as unknown;
  } catch {
    return reply(request, 400, rpcError(null, -32700, "Body is not JSON."));
  }
  if (Array.isArray(message)) {
    return reply(request, 400, rpcError(null, -32600, "JSON-RPC batches are not supported."));
  }
  if (!isRecord(message) || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return reply(request, 400, rpcError(null, -32600, "Expected a JSON-RPC 2.0 request."));
  }
  const method = message.method;
  const id = message.id;
  const hasId = "id" in message && id !== undefined;
  if (!hasId) return empty(202);
  if (typeof id !== "string" && typeof id !== "number" && id !== null) {
    return reply(request, 400, rpcError(null, -32600, "id must be a string, number, or null."));
  }
  try {
    if (method === "initialize") return reply(request, 200, { jsonrpc: "2.0", id, result: initializeResult(message.params) });
    if (method === "ping") return reply(request, 200, { jsonrpc: "2.0", id, result: {} });
    if (method === "tools/list") return reply(request, 200, { jsonrpc: "2.0", id, result: { tools: [TOOL] } });
    if (method === "tools/call") return reply(request, 200, await callTool(id, message.params, request, render));
    return reply(request, 200, rpcError(id, -32601, `Unknown method ${method}.`));
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    return reply(request, 200, rpcError(id, -32603, text));
  }
}

function initializeResult(params: unknown): { protocolVersion: string; capabilities: { tools: Record<string, never> }; serverInfo: { name: string; version: string } } {
  const requested = isRecord(params) && typeof params.protocolVersion === "string" ? params.protocolVersion : "";
  return {
    protocolVersion: SUPPORTED.has(requested) ? requested : PROTOCOL,
    capabilities: { tools: {} },
    serverInfo: { name: "chartkit-cloud", version: "0.0.0" },
  };
}

async function callTool(id: JsonRpcId, params: unknown, request: Request, render: (call: ToolCall) => Promise<Response>): Promise<unknown> {
  if (!isRecord(params) || params.name !== "render_chart") {
    return toolError(id, "Unknown tool. render_chart is the only tool.");
  }
  const args = isRecord(params.arguments) ? params.arguments : null;
  if (!args || !("spec" in args)) return toolError(id, "render_chart expects { spec }.");
  const body: Record<string, unknown> = { spec: args.spec };
  for (const name of ["format", "w", "h", "scale", "theme"] as const) {
    const value = args[name];
    if (typeof value === "string" || typeof value === "number") body[name] = value;
  }
  const header = request.headers.get("authorization") ?? "";
  const key = typeof args.key === "string" ? args.key.trim() : "";
  const authorization = header || (key ? `Bearer ${key}` : "");
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (authorization) headers.authorization = authorization;
  const response = await render({ headers, body: JSON.stringify(body) });
  let payload: unknown;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    return toolError(id, `Render returned HTTP ${response.status} with a body that is not JSON.`);
  }
  const failed = !response.ok || (isRecord(payload) && payload.ok === false);
  return {
    jsonrpc: "2.0",
    id,
    result: {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      isError: failed,
    },
  };
}

function toolError(id: JsonRpcId, message: string): unknown {
  return {
    jsonrpc: "2.0",
    id,
    result: {
      content: [{ type: "text", text: message }],
      isError: true,
    },
  };
}

function rpcError(id: JsonRpcId, code: number, message: string): unknown {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function reply(request: Request, status: number, payload: unknown): Response {
  const headers = corsHeaders();
  const accept = request.headers.get("accept") ?? "";
  const json = !accept || accept.includes("application/json") || accept.includes("*/*");
  if (!json && accept.includes("text/event-stream")) {
    headers.set("content-type", "text/event-stream; charset=utf-8");
    headers.set("cache-control", "no-store");
    return new Response(`event: message\ndata: ${JSON.stringify(payload)}\n\n`, { status, headers });
  }
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(payload), { status, headers });
}

function empty(status: number): Response {
  const headers = corsHeaders();
  headers.set("cache-control", "no-store");
  return new Response(null, { status, headers });
}

function corsHeaders(): Headers {
  const headers = new Headers();
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  headers.set("access-control-allow-headers", "authorization, content-type, accept, mcp-protocol-version");
  headers.set("access-control-expose-headers", "ETag, X-ChartKit-Repairs, X-ChartKit-Warnings, X-ChartKit-Errors, X-ChartKit-Ok, X-ChartKit-Repair-Patch, X-ChartKit-Watermark, X-ChartKit-Cache, X-ChartKit-Key, X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After");
  headers.set("x-content-type-options", "nosniff");
  return headers;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
