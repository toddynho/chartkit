/** Same default as catalog/lib/cloud.ts. Unset does not fail the site build. */
export const DEFAULT_CHARTKIT_CLOUD_URL = "https://cloud.chartkit.dev";

export function cloudOriginFrom(env: { PUBLIC_CHARTKIT_CLOUD_URL?: string; NEXT_PUBLIC_CHARTKIT_CLOUD_URL?: string }): string {
  const raw = env.PUBLIC_CHARTKIT_CLOUD_URL?.trim() || env.NEXT_PUBLIC_CHARTKIT_CLOUD_URL?.trim() || DEFAULT_CHARTKIT_CLOUD_URL;
  return raw.replace(/\/+$/, "");
}

/** Astro inlines PUBLIC_CHARTKIT_CLOUD_URL. NEXT_PUBLIC_CHARTKIT_CLOUD_URL still works. */
export function chartkitCloudUrl(): string {
  const nodePublic = typeof process === "undefined" ? undefined : process.env.PUBLIC_CHARTKIT_CLOUD_URL;
  const nodeLegacy = typeof process === "undefined" ? undefined : process.env.NEXT_PUBLIC_CHARTKIT_CLOUD_URL;
  return cloudOriginFrom({
    PUBLIC_CHARTKIT_CLOUD_URL: import.meta.env.PUBLIC_CHARTKIT_CLOUD_URL || nodePublic,
    NEXT_PUBLIC_CHARTKIT_CLOUD_URL: import.meta.env.NEXT_PUBLIC_CHARTKIT_CLOUD_URL || nodeLegacy,
  });
}