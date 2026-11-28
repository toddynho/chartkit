import { paintSpec } from "./chartkit";

/**
 * Server SVG for a spec printed on a docs page.
 * The build stops when the spec has a validate() error or draws the error card,
 * so a page cannot print an example that does not render.
 */
export function drawDocSpec(spec: Record<string, unknown>): { spec: Record<string, unknown>; svg: string; alt: string } {
  const painted = paintSpec(spec);
  const type = typeof spec.type === "string" ? spec.type : "";
  if (!painted.ok || painted.svg.includes("ck-chart-error") || !painted.svg.includes(`data-ck-type="${type}"`)) {
    const detail = painted.issues.map((issue) => `${issue.code} ${issue.message}`).join("; ");
    throw new Error(`Docs example ${JSON.stringify(spec.title ?? type)} did not render. ${detail}`);
  }
  const a11y = spec.a11y as { alt?: unknown } | undefined;
  return { spec, svg: painted.svg, alt: typeof a11y?.alt === "string" ? a11y.alt : "" };
}
