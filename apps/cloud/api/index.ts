import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../src/app.ts";

const app = createApp();

/** Vercel Node function. Also accepts a Web Request when the platform calls it that way. */
export default async function handler(req: IncomingMessage | Request, res?: ServerResponse): Promise<Response | void> {
  if (res) {
    const request = await nodeRequest(req as IncomingMessage);
    const response = await app.handle(request);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.end(Buffer.from(await response.arrayBuffer()));
    return;
  }
  return app.handle(req as Request);
}

async function nodeRequest(req: IncomingMessage): Promise<Request> {
  const host = req.headers.host || "cloud.chartkit.dev";
  const proto = header(req, "x-forwarded-proto") || "https";
  const url = `${proto}://${host}${req.url || "/"}`;
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

function header(req: IncomingMessage, name: string): string {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] || "" : value || "";
}
