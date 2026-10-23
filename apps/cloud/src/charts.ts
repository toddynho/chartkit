import { createHash } from "node:crypto";
import type { KvConfig } from "./keys.ts";

export interface StoredChart {
  id: string;
  spec: unknown;
}

export interface ChartStore {
  put(spec: unknown): Promise<StoredChart>;
  get(id: string): Promise<StoredChart | null>;
}

export function chartId(spec: unknown): string {
  return createHash("sha256").update(canonical(spec)).digest("base64url").slice(0, 16);
}

export function memoryCharts(): ChartStore {
  const charts = new Map<string, StoredChart>();
  return {
    async put(spec) {
      const id = chartId(spec);
      const stored = charts.get(id) ?? { id, spec };
      charts.set(id, stored);
      return stored;
    },
    async get(id) {
      return charts.get(id) ?? null;
    },
  };
}

export function kvCharts(config: KvConfig): ChartStore {
  const endpoint = config.url.replace(/\/$/, "");
  const fetcher = config.fetch ?? fetch;
  const call = async (command: unknown[]) => {
    const response = await fetcher(endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${config.token}`, "content-type": "application/json" },
      body: JSON.stringify(command),
    });
    if (!response.ok) throw new Error(`chart store HTTP ${response.status}`);
    const body = (await response.json()) as { result?: unknown };
    return body.result;
  };
  return {
    async put(spec) {
      const id = chartId(spec);
      const existing = await call(["GET", `ck:chart:${id}`]);
      if (typeof existing === "string" && existing) {
        try {
          return { id, spec: JSON.parse(existing) as unknown };
        } catch {
          /* replace a corrupt row */
        }
      }
      await call(["SET", `ck:chart:${id}`, JSON.stringify(spec)]);
      return { id, spec };
    },
    async get(id) {
      if (!/^[A-Za-z0-9_-]{8,32}$/.test(id)) return null;
      const value = await call(["GET", `ck:chart:${id}`]);
      if (typeof value !== "string" || !value) return null;
      try {
        return { id, spec: JSON.parse(value) as unknown };
      } catch {
        return null;
      }
    },
  };
}

export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => canonical(item)).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
