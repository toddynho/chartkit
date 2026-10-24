import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createApp } from "./app.ts";

const port = Number(process.env.PORT || 8787);
const app = createApp();

const server = createServer(async (req, res) => {
  try {
    const response = await app.handle(await toRequest(req));
    await writeResponse(res, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: message }));
  }
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`ChartKit Cloud listening on http://127.0.0.1:${port}\n`);
});

async function toRequest(req: IncomingMessage): Promise<Request> {
  const host = req.headers.host || `127.0.0.1:${port}`;
  const url = `http://${host}${req.url || "/"}`;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const body = Buffer.concat(chunks);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  const method = req.method || "GET";
  return new Request(url, { method, headers, body: method === "GET" || method === "HEAD" ? undefined : body });
}

async function writeResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.end(Buffer.from(await response.arrayBuffer()));
}
