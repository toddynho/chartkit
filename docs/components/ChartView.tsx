import { isExtra, render } from "@chartkitdev/core/all";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { scaleSvgText, usesPreset } from "@/lib/chart";
import { ChartHost } from "./ChartHost";

function chartType(spec: unknown): string {
  if (typeof spec !== "object" || spec === null) return "";
  const type = (spec as { type?: unknown }).type;
  return typeof type === "string" ? type : "";
}

/** Server-rendered SVG, then the vanilla mount path on the client. */
export function ChartView({ spec, className, labelScale = 1 }: { spec: unknown; className?: string; labelScale?: number }) {
  const svg = scaleSvgText(isExtra(chartType(spec)) ? renderExtra(spec) : render(spec), labelScale);
  const classes = ["chart-host", usesPreset(spec) ? "chart-preset" : "", className].filter(Boolean).join(" ");
  return <ChartHost spec={spec} svg={svg} className={classes} />;
}
