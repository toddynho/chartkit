import { render } from "@chartkitdev/core/all";
import "@chartkitdev/core/themes/all";

export function chartSvg(spec: unknown): string {
  return render(spec);
}

export function usesPreset(spec: unknown): boolean {
  if (typeof spec !== "object" || spec === null) return false;
  const theme = (spec as { theme?: unknown }).theme;
  return typeof theme === "string" && theme.length > 0 && theme !== "auto";
}

/**
 * Multiply every SVG font-size. Positions are left alone, so a scale other than 1
 * paints wider glyphs into the same legend slots.
 */
export function scaleSvgText(svg: string, scale = 1): string {
  if (scale === 1) return svg;
  return svg.replace(/font-size="([\d.]+)"/g, (_, size: string) => {
    const next = Math.round(Number(size) * scale * 10) / 10;
    return `font-size="${next}"`;
  });
}

/** Copy a spec so size.width/height are CSS pixels. The viewBox then matches the element and type stays at the authored size. */
export function specAtSize(spec: unknown, width: number, height?: number): unknown {
  if (typeof spec !== "object" || spec === null || Array.isArray(spec)) return spec;
  const next = { ...(spec as Record<string, unknown>) };
  const size =
    typeof next.size === "object" && next.size !== null && !Array.isArray(next.size)
      ? { ...(next.size as Record<string, unknown>) }
      : {};
  size.width = Math.max(1, Math.round(width));
  if (height !== undefined) size.height = Math.max(1, Math.round(height));
  else if (typeof size.height !== "number") size.height = 320;
  next.size = size;
  return next;
}

export function ChartView({ spec, className, labelScale = 1 }: { spec: unknown; className?: string; labelScale?: number }) {
  const svg = scaleSvgText(chartSvg(spec), labelScale);
  const preset = usesPreset(spec);
  const classes = ["chart-host", preset ? "chart-preset" : "", className].filter(Boolean).join(" ");
  return <div className={classes} dangerouslySetInnerHTML={{ __html: svg }} />;
}
