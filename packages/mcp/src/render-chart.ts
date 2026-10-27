const DEFAULT_ORIGIN = "https://cloud.chartkit.dev";

export interface RenderChartInput {
  spec: unknown;
  format?: "svg" | "png";
  w?: number;
  h?: number;
  scale?: number;
  theme?: string;
  background?: string;
  key?: string;
  origin?: string;
  fetch?: typeof fetch;
}

export interface RenderChartResult {
  url: string;
  format: "svg" | "png";
  ok: boolean;
  watermark: boolean;
  applied: unknown[];
  warnings: unknown[];
  errors: unknown[];
  spec?: unknown;
}

/** Calls ChartKit Cloud. The other MCP tools stay local. */
export async function renderChart(input: RenderChartInput): Promise<RenderChartResult | { error: string }> {
  const origin = (input.origin || process.env.CHARTKIT_CLOUD_URL || DEFAULT_ORIGIN).replace(/\/$/, "");
  const format = input.format ?? "svg";
  const fetcher = input.fetch ?? fetch;
  const key = input.key || process.env.CHARTKIT_CLOUD_KEY;
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (key) headers.authorization = `Bearer ${key}`;
  let response: Response;
  try {
    response = await fetcher(`${origin}/render`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        spec: input.spec,
        format,
        w: input.w,
        h: input.h,
        scale: input.scale,
        theme: input.theme,
        background: input.background,
      }),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  let body: Partial<RenderChartResult> & { error?: string };
  try {
    body = (await response.json()) as Partial<RenderChartResult> & { error?: string };
  } catch {
    return { error: `ChartKit Cloud returned HTTP ${response.status} with a body that is not JSON.` };
  }
  if (!body.url) return { error: body.error || `ChartKit Cloud returned HTTP ${response.status}.` };
  return {
    url: body.url,
    format,
    ok: Boolean(body.ok),
    watermark: Boolean(body.watermark),
    applied: Array.isArray(body.applied) ? body.applied : [],
    warnings: Array.isArray(body.warnings) ? body.warnings : [],
    errors: Array.isArray(body.errors) ? body.errors : [],
    spec: body.spec,
  };
}
