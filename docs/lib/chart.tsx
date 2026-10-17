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

/** Multiply every SVG font-size. The hero uses this so axis labels stay readable when the view scales. */
export function scaleSvgText(svg: string, scale = 1): string {
  if (scale === 1) return svg;
  return svg.replace(/font-size="([\d.]+)"/g, (_, size: string) => {
    const next = Math.round(Number(size) * scale * 10) / 10;
    return `font-size="${next}"`;
  });
}

export function ChartView({ spec, className, labelScale = 1 }: { spec: unknown; className?: string; labelScale?: number }) {
  const svg = scaleSvgText(chartSvg(spec), labelScale);
  const preset = usesPreset(spec);
  const classes = ["chart-host", preset ? "chart-preset" : "", className].filter(Boolean).join(" ");
  return <div className={classes} dangerouslySetInnerHTML={{ __html: svg }} />;
}
