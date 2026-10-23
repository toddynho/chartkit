/** Same ceiling with or without a key. This blocks abuse. It is not a paid quota. */

export const FREE_LIMIT = 120;
export const WINDOW_MS = 60_000;

export interface LimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
}

export interface RateLimiter {
  take(ip: string): LimitResult;
}

export function memoryLimiter(limit = FREE_LIMIT, windowMs = WINDOW_MS, now: () => number = Date.now): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
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
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  return real || "local";
}
