import { createHash } from "node:crypto";
import { backendFromEnv, bindingBackend, restBackend, type KvBackend, type KvConfig, type KvNamespaceLike, type StoreBindings } from "./keys.ts";

export interface StoredChart {
  id: string;
  spec: unknown;
  /** True when a valid key stored this chart. GET serves it without the mark and without a secret. */
  clean: boolean;
}

export interface ChartStore {
  put(spec: unknown, clean?: boolean): Promise<StoredChart>;
  get(id: string): Promise<StoredChart | null>;
}

export function chartId(spec: unknown, clean = false): string {
  return createHash("sha256").update(canonical({ spec, clean })).digest("base64url").slice(0, 16);
}

export function memoryCharts(): ChartStore {
  const charts = new Map<string, StoredChart>();
  return {
    async put(spec, clean = false) {
      const id = chartId(spec, clean);
      const stored = charts.get(id) ?? { id, spec, clean };
      charts.set(id, stored);
      return stored;
    },
    async get(id) {
      return charts.get(id) ?? null;
    },
  };
}

export function kvCharts(config: KvConfig): ChartStore {
  return backendCharts(restBackend(config, "chart store"));
}

/** Native Workers KV. */
export function bindingCharts(namespace: KvNamespaceLike): ChartStore {
  return backendCharts(bindingBackend(namespace));
}

/** ck:chart:<id> = {"v":1,"spec":...,"clean":...}. Ids are content hashes, so a write never changes a link. */
export function backendCharts(backend: KvBackend): ChartStore {
  return {
    async put(spec, clean = false) {
      const id = chartId(spec, clean);
      const existing = await backend.get(`ck:chart:${id}`);
      if (existing) {
        const stored = decodeChart(id, existing);
        if (stored) return stored;
      }
      const row: StoredChart = { id, spec, clean };
      await backend.set(`ck:chart:${id}`, JSON.stringify({ v: 1, spec, clean }));
      return row;
    },
    async get(id) {
      if (!/^[A-Za-z0-9_-]{8,32}$/.test(id)) return null;
      const value = await backend.get(`ck:chart:${id}`);
      if (!value) return null;
      return decodeChart(id, value);
    },
  };
}

/** Uses the same store as the keys: the CHARTKIT_KV binding, then REST, then memory. */
export function chartStoreFromEnv(env: NodeJS.ProcessEnv = process.env, bindings: StoreBindings = {}): ChartStore {
  const backend = backendFromEnv(env, bindings, "chart store");
  return backend ? backendCharts(backend) : memoryCharts();
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

function decodeChart(id: string, raw: string): StoredChart | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isRecord(parsed) && parsed.v === 1 && "spec" in parsed && typeof parsed.clean === "boolean") {
      return { id, spec: parsed.spec, clean: parsed.clean };
    }
    return { id, spec: parsed, clean: false };
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
