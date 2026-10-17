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

export function ChartView({ spec, className }: { spec: unknown; className?: string }) {
  const svg = chartSvg(spec);
  const preset = usesPreset(spec);
  const classes = ["chart-host", preset ? "chart-preset" : "", className].filter(Boolean).join(" ");
  return <div className={classes} dangerouslySetInnerHTML={{ __html: svg }} />;
}
