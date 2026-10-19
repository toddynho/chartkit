import { render } from "@chartkitdev/core/extra";
import { repair, validate } from "@chartkitdev/core/validate";
import { getExample, listChartTypes } from "./examples.js";
import { lookupFeature } from "./features.js";

export { getExample, listChartTypes, lookupFeature };

const PNG_SKIPPED =
  "PNG is not implemented. Rasterizing SVG would add a native or wasm dependency, and this server does not include one. format must be \"svg\".";

export function validateSpec(spec: unknown): ReturnType<typeof validate> {
  return validate(spec);
}

export function repairSpec(spec: unknown): ReturnType<typeof repair> {
  return repair(spec);
}

export interface RenderResult {
  format: "svg";
  svg: string;
  width: number;
  height: number;
}

export function renderSpec(spec: unknown, format?: string): RenderResult | { error: string } {
  if (format !== undefined && format !== "svg") return { error: PNG_SKIPPED };
  const parsed = typeof spec === "string" ? parseJson(spec) : spec;
  if (typeof spec === "string" && parsed instanceof Error) {
    return { error: `spec string is not JSON: ${parsed.message}` };
  }
  const svg = render(parsed);
  const size = svgSize(svg);
  return { format: "svg", svg, width: size.width, height: size.height };
}

function parseJson(text: string): unknown | Error {
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

function svgSize(svg: string): { width: number; height: number } {
  const open = svg.match(/<svg\b[^>]*>/)?.[0] ?? "";
  const viewBox = open.match(/\bviewBox="([^"]+)"/)?.[1]?.trim().split(/[\s,]+/).map(Number) ?? [];
  const vbWidth = viewBox.length === 4 ? viewBox[2] : undefined;
  const vbHeight = viewBox.length === 4 ? viewBox[3] : undefined;
  return {
    width: numericLength(open.match(/\bwidth="([^"]+)"/)?.[1]) ?? finite(vbWidth),
    height: numericLength(open.match(/\bheight="([^"]+)"/)?.[1]) ?? finite(vbHeight),
  };
}

/** Pixel length from an SVG attribute. Percentages fall through to the viewBox. */
function numericLength(value: string | undefined): number | undefined {
  if (!value || value.endsWith("%")) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function finite(value: number | undefined): number {
  return value !== undefined && Number.isFinite(value) ? value : 0;
}
