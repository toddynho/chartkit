import { createHash } from "node:crypto";
import { backendFromEnv, bindingBackend, restBackend, type KvBackend, type KvConfig, type KvNamespaceLike, type StoreBindings } from "./keys.ts";

export interface StoredChart {
  id: string;
  spec: unknown;
  /** True when a valid key stored this chart. GET serves it without the mark and without a secret. */
  clean: boolean;
  /** True when this row is a share page. Keyed rows omit it; they do not expire. */
  share?: boolean;
  /** Unix seconds of the last share TTL write. */
  refreshedAt?: number;
}

export interface ChartStore {
  put(spec: unknown, clean?: boolean, share?: boolean): Promise<StoredChart>;
  get(id: string): Promise<StoredChart | null>;
  /**
   * Start another share TTL when this anonymous row is due.
   * A keyed row is returned unchanged. `now` is unix seconds, for tests.
   */
  touch(id: string, now?: number): Promise<StoredChart | null>;
}

/** A chart stored without a valid key, and not as a share page, is kept this long. A chart stored with a key does not expire. */
export const ANONYMOUS_CHART_TTL_SECONDS = 30 * 24 * 60 * 60;
/** POST /charts and a share-page read keep an anonymous chart for a year. */
export const SHARE_CHART_TTL_SECONDS = 365 * 24 * 60 * 60;
/** GET /s/<id> rewrites the year when the last refresh is at least this old. */
export const SHARE_REFRESH_AFTER_SECONDS = 30 * 24 * 60 * 60;

/** True when an anonymous row should be rewritten with a fresh share TTL. */
export function shareDue(stored: StoredChart, now: number): boolean {
  if (stored.clean) return false;
  if (!stored.share || typeof stored.refreshedAt !== "number") return true;
  return now - stored.refreshedAt >= SHARE_REFRESH_AFTER_SECONDS;
}

export function chartId(spec: unknown, clean = false): string {
  return createHash("sha256").update(canonical({ spec, clean })).digest("base64url").slice(0, 16);
}

export function memoryCharts(): ChartStore {
  const charts = new Map<string, StoredChart>();
  return {
    async put(spec, clean = false, share = false) {
      const id = chartId(spec, clean);
      const now = nowSeconds();
      const existing = charts.get(id);
      if (existing && !(share && shareDue(existing, now))) return existing;
      const stored = shareRow(id, spec, clean, share, now);
      charts.set(id, stored);
      return stored;
    },
    async get(id) {
      if (!/^[A-Za-z0-9_-]{8,32}$/.test(id)) return null;
      return charts.get(id) ?? null;
    },
    async touch(id, now = nowSeconds()) {
      const stored = charts.get(id);
      if (!stored || !/^[A-Za-z0-9_-]{8,32}$/.test(id) || !shareDue(stored, now)) return stored ?? null;
      const next = shareRow(stored.id, stored.spec, false, true, now);
      charts.set(id, next);
      return next;
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

/** ck:chart:<id> = {"v":1,"spec":...,"clean":...}. Ids are content hashes, so a write never changes a link. Share rows also store share and refreshedAt. */
export function backendCharts(backend: KvBackend): ChartStore {
  return {
    async put(spec, clean = false, share = false) {
      const id = chartId(spec, clean);
      const now = nowSeconds();
      const existing = await backend.get(`ck:chart:${id}`);
      if (existing) {
        const stored = decodeChart(id, existing);
        if (stored && !(share && shareDue(stored, now))) return stored;
      }
      const row = shareRow(id, spec, clean, share, now);
      await backend.set(`ck:chart:${id}`, encodeChart(row), chartTtl(row));
      return row;
    },
    async get(id) {
      if (!/^[A-Za-z0-9_-]{8,32}$/.test(id)) return null;
      const value = await backend.get(`ck:chart:${id}`);
      if (!value) return null;
      return decodeChart(id, value);
    },
    async touch(id, now = nowSeconds()) {
      if (!/^[A-Za-z0-9_-]{8,32}$/.test(id)) return null;
      const value = await backend.get(`ck:chart:${id}`);
      if (!value) return null;
      const stored = decodeChart(id, value);
      if (!stored || !shareDue(stored, now)) return stored;
      const row = shareRow(stored.id, stored.spec, false, true, now);
      await backend.set(`ck:chart:${id}`, encodeChart(row), SHARE_CHART_TTL_SECONDS);
      return row;
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

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function shareRow(id: string, spec: unknown, clean: boolean, share: boolean, now: number): StoredChart {
  if (clean || !share) return { id, spec, clean };
  return { id, spec, clean: false, share: true, refreshedAt: now };
}

function chartTtl(row: StoredChart): number | undefined {
  if (row.clean) return undefined;
  return row.share ? SHARE_CHART_TTL_SECONDS : ANONYMOUS_CHART_TTL_SECONDS;
}

function encodeChart(row: StoredChart): string {
  const body: Record<string, unknown> = { v: 1, spec: row.spec, clean: row.clean };
  if (row.share) body.share = true;
  if (typeof row.refreshedAt === "number") body.refreshedAt = row.refreshedAt;
  return JSON.stringify(body);
}

function decodeChart(id: string, raw: string): StoredChart | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isRecord(parsed) && parsed.v === 1 && "spec" in parsed && typeof parsed.clean === "boolean") {
      const stored: StoredChart = { id, spec: parsed.spec, clean: parsed.clean };
      if (parsed.share === true) stored.share = true;
      if (typeof parsed.refreshedAt === "number" && Number.isFinite(parsed.refreshedAt)) stored.refreshedAt = parsed.refreshedAt;
      return stored;
    }
    return { id, spec: parsed, clean: false };
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
