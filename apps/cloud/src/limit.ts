/**
 * Same ceiling with or without a key. This blocks abuse. It is not a paid quota.
 * remaining is -1 when the limiter cannot say (the Workers binding only returns yes or no).
 */

export const FREE_LIMIT = 120;
export const WINDOW_MS = 60_000;

export interface LimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
}

export interface RateLimiter {
  /** Which limiter is answering. Shown on /health. */
  readonly kind?: "binding" | "memory";
  take(ip: string): LimitResult | Promise<LimitResult>;
}

/** The Workers rate-limiting binding (`[[ratelimits]]` in wrangler.toml). */
export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export function isRateLimitBinding(value: unknown): value is RateLimitBinding {
  return typeof value === "object" && value !== null && typeof (value as { limit?: unknown }).limit === "function";
}

/**
 * Uses the binding's counter, which Cloudflare shares across isolates in a location.
 * The binding only says yes or no, so a block reports the whole period as Retry-After.
 * If the binding call throws, the request is counted in memory instead of failing.
 */
export function bindingLimiter(
  binding: RateLimitBinding,
  limit = FREE_LIMIT,
  periodSeconds = WINDOW_MS / 1000,
  fallback: RateLimiter = memoryLimiter(limit, periodSeconds * 1000),
): RateLimiter {
  return {
    kind: "binding",
    async take(ip) {
      let outcome: { success: boolean };
      try {
        outcome = await binding.limit({ key: ip });
      } catch {
        return fallback.take(ip);
      }
      if (outcome.success) return { ok: true, limit, remaining: -1, retryAfter: 0 };
      return { ok: false, limit, remaining: 0, retryAfter: periodSeconds };
    },
  };
}

/** The CHARTKIT_RATE_LIMIT binding when it is bound, else a per-isolate memory counter. */
export function limiterFrom(binding: unknown): RateLimiter {
  return isRateLimitBinding(binding) ? bindingLimiter(binding) : memoryLimiter();
}

export function memoryLimiter(limit = FREE_LIMIT, windowMs = WINDOW_MS, now: () => number = Date.now): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    kind: "memory",
    take(ip) {
      const time = now();
      const recent = (hits.get(ip) ?? []).filter((stamp) => time - stamp < windowMs);
      if (recent.length >= limit) {
        const oldest = recent[0] ?? time;
        hits.set(ip, recent);
        return {
          ok: false,
          limit,
          remaining: 0,
          retryAfter: Math.max(1, Math.ceil((oldest + windowMs - time) / 1000)),
        };
      }
      recent.push(time);
      hits.set(ip, recent);
      return { ok: true, limit, remaining: limit - recent.length, retryAfter: 0 };
    },
  };
}

export function clientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  return real || "local";
}
