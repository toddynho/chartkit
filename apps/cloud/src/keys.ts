/**
 * Key store. On Workers the native CHARTKIT_KV binding is the durable store.
 * Vercel KV or Upstash (same REST API) is the store for the Node service, and a fallback on Workers.
 * Tests and a single local process use the memory adapter.
 * CHARTKIT_DEV_KEYS is a fixed list of keys that remove the mark. It works with every store,
 * so it is also the manual way to hand out a key before checkout is on.
 */

export interface IssuedKey {
  key: string;
  sessionId?: string;
}

export interface KeyStore {
  issue(meta?: { sessionId?: string }): Promise<IssuedKey>;
  check(key: string): Promise<boolean>;
  findBySession(sessionId: string): Promise<string | null>;
}

/** Where keys and stored charts live. "memory" is lost when the isolate or process ends. */
export type StoreKind = "kv-binding" | "kv-rest" | "memory";

/** The part of a Workers KV namespace this service uses. */
export interface KvNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

/** String get and set. Both durable stores reduce to this. `ttlSeconds` makes the row expire. */
export interface KvBackend {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
}

export interface KvConfig {
  url: string;
  token: string;
  fetch?: typeof fetch;
}

export interface StoreBindings {
  kv?: unknown;
}

export function memoryKeys(seed: string[] = []): KeyStore {
  const keys = new Map<string, { sessionId?: string }>();
  const sessions = new Map<string, string>();
  for (const key of seed) {
    if (key) keys.set(key, {});
  }
  return {
    async issue(meta) {
      if (meta?.sessionId) {
        const existing = sessions.get(meta.sessionId);
        if (existing) return { key: existing, sessionId: meta.sessionId };
      }
      const key = newKey();
      keys.set(key, { sessionId: meta?.sessionId });
      if (meta?.sessionId) sessions.set(meta.sessionId, key);
      return { key, sessionId: meta?.sessionId };
    },
    async check(key) {
      return keys.has(key);
    },
    async findBySession(sessionId) {
      return sessions.get(sessionId) ?? null;
    },
  };
}

/** Vercel KV and Upstash Redis share this REST shape. */
export function kvKeys(config: KvConfig): KeyStore {
  return backendKeys(restBackend(config, "key store"));
}

/** Native Workers KV. */
export function bindingKeys(namespace: KvNamespaceLike): KeyStore {
  return backendKeys(bindingBackend(namespace));
}

/**
 * Key layout, shared by both durable stores:
 * ck:key:<key> = "1", ck:session:<stripe session> = <key>, ck:keymeta:<key> = <stripe session>.
 * Writing ck:key:<key> = 1 by hand issues a key.
 */
export function backendKeys(backend: KvBackend): KeyStore {
  return {
    async issue(meta) {
      if (meta?.sessionId) {
        const existing = await backend.get(`ck:session:${meta.sessionId}`);
        if (existing) return { key: existing, sessionId: meta.sessionId };
      }
      const key = newKey();
      await backend.set(`ck:key:${key}`, "1");
      if (meta?.sessionId) {
        await backend.set(`ck:session:${meta.sessionId}`, key);
        await backend.set(`ck:keymeta:${key}`, meta.sessionId);
      }
      return { key, sessionId: meta?.sessionId };
    },
    async check(key) {
      if (!key) return false;
      return (await backend.get(`ck:key:${key}`)) === "1";
    },
    async findBySession(sessionId) {
      return (await backend.get(`ck:session:${sessionId}`)) || null;
    },
  };
}

/** Seed keys pass without a store lookup. Everything else goes to the store. */
export function withSeedKeys(store: KeyStore, seed: string[]): KeyStore {
  const fixed = new Set(seed.filter(Boolean));
  if (fixed.size === 0) return store;
  return {
    issue: (meta) => store.issue(meta),
    async check(key) {
      return fixed.has(key) || store.check(key);
    },
    findBySession: (sessionId) => store.findBySession(sessionId),
  };
}

export function keyStoreFromEnv(env: NodeJS.ProcessEnv = process.env, bindings: StoreBindings = {}): KeyStore {
  const seed = seedKeys(env);
  const backend = backendFromEnv(env, bindings, "key store");
  if (!backend) return memoryKeys(seed);
  return withSeedKeys(backendKeys(backend), seed);
}

/** Native binding first, then REST, then nothing (the caller falls back to memory). */
export function backendFromEnv(env: NodeJS.ProcessEnv, bindings: StoreBindings, label: string): KvBackend | null {
  if (isKvNamespace(bindings.kv)) return bindingBackend(bindings.kv);
  const rest = restConfig(env);
  if (rest) return restBackend(rest, label);
  return null;
}

export function storeKind(env: NodeJS.ProcessEnv = process.env, bindings: StoreBindings = {}): StoreKind {
  if (isKvNamespace(bindings.kv)) return "kv-binding";
  if (restConfig(env)) return "kv-rest";
  return "memory";
}

export function isKvNamespace(value: unknown): value is KvNamespaceLike {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { get?: unknown }).get === "function" &&
    typeof (value as { put?: unknown }).put === "function"
  );
}

export function bindingBackend(namespace: KvNamespaceLike): KvBackend {
  return {
    async get(key) {
      const value = await namespace.get(key);
      return typeof value === "string" && value ? value : null;
    },
    async set(key, value, ttlSeconds) {
      if (ttlSeconds) await namespace.put(key, value, { expirationTtl: ttlSeconds });
      else await namespace.put(key, value);
    },
  };
}

export function restBackend(config: KvConfig, label: string): KvBackend {
  const fetcher = config.fetch ?? fetch;
  const endpoint = config.url.replace(/\/$/, "");
  const call = async (command: unknown[]): Promise<unknown> => {
    const response = await fetcher(endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${config.token}`, "content-type": "application/json" },
      body: JSON.stringify(command),
    });
    if (!response.ok) throw new Error(`${label} HTTP ${response.status}`);
    const body = (await response.json()) as { result?: unknown };
    return body.result;
  };
  return {
    async get(key) {
      const value = await call(["GET", key]);
      // Redis returns "1" for SET ... 1. Some clients decode it to a number.
      if (typeof value === "number") return String(value);
      return typeof value === "string" && value ? value : null;
    },
    async set(key, value, ttlSeconds) {
      await call(ttlSeconds ? ["SET", key, value, "EX", ttlSeconds] : ["SET", key, value]);
    },
  };
}

function restConfig(env: NodeJS.ProcessEnv): KvConfig | null {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

function seedKeys(env: NodeJS.ProcessEnv): string[] {
  return (env.CHARTKIT_DEV_KEYS ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

function newKey(): string {
  return `ck_live_${crypto.randomUUID().replace(/-/g, "")}`;
}
