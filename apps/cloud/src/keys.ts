/**
 * Key store. Production uses Vercel KV or Upstash (same REST API).
 * Tests and a single local process use the memory adapter.
 * CHARTKIT_DEV_KEYS is a local seed, not a hosted secret.
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
      const key = `ck_test_${crypto.randomUUID().replace(/-/g, "")}`;
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

export interface KvConfig {
  url: string;
  token: string;
  fetch?: typeof fetch;
}

/** Vercel KV and Upstash Redis share this REST shape. */
export function kvKeys(config: KvConfig): KeyStore {
  const call = kvCall(config);
  return {
    async issue(meta) {
      if (meta?.sessionId) {
        const existing = await call(["GET", `ck:session:${meta.sessionId}`]);
        if (typeof existing === "string" && existing) return { key: existing, sessionId: meta.sessionId };
      }
      const key = `ck_test_${crypto.randomUUID().replace(/-/g, "")}`;
      await call(["SET", `ck:key:${key}`, "1"]);
      if (meta?.sessionId) {
        await call(["SET", `ck:session:${meta.sessionId}`, key]);
        await call(["SET", `ck:keymeta:${key}`, meta.sessionId]);
      }
      return { key, sessionId: meta?.sessionId };
    },
    async check(key) {
      if (!key) return false;
      const value = await call(["GET", `ck:key:${key}`]);
      return value === "1" || value === 1;
    },
    async findBySession(sessionId) {
      const value = await call(["GET", `ck:session:${sessionId}`]);
      return typeof value === "string" && value ? value : null;
    },
  };
}

export function keyStoreFromEnv(env: NodeJS.ProcessEnv = process.env): KeyStore {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return kvKeys({ url, token });
  const seed = (env.CHARTKIT_DEV_KEYS ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  return memoryKeys(seed);
}

function kvCall(config: KvConfig): (command: unknown[]) => Promise<unknown> {
  const fetcher = config.fetch ?? fetch;
  const endpoint = config.url.replace(/\/$/, "");
  return async (command) => {
    const response = await fetcher(endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${config.token}`, "content-type": "application/json" },
      body: JSON.stringify(command),
    });
    if (!response.ok) throw new Error(`key store HTTP ${response.status}`);
    const body = (await response.json()) as { result?: unknown };
    return body.result;
  };
}
