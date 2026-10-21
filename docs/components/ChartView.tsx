import { isExtra, render } from "@chartkitdev/core/all";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { scaleSvgText, usesPreset } from "@/lib/chart";
import { ChartHost } from "./ChartHost";
import { GeoHost } from "./GeoHost";

function chartType(spec: unknown): string {
  if (typeof spec !== "object" || spec === null) return "";
  const type = (spec as { type?: unknown }).type;
  return typeof type === "string" ? type : "";
}

/** Server-rendered SVG, then the vanilla mount path on the client. Maps use @chartkitdev/geo. */
export async function ChartView({ spec, className, labelScale = 1 }: { spec: unknown; className?: string; labelScale?: number }) {
  const type = chartType(spec);
  const classes = ["chart-host", usesPreset(spec) ? "chart-preset" : "", className].filter(Boolean).join(" ");
  if (type === "choropleth" || type === "map-points") {
    const { render: renderGeo } = await import("@chartkitdev/geo");
    return <GeoHost svg={scaleSvgText(await renderGeo(spec), labelScale)} className={classes} />;
  }
  const svg = scaleSvgText(isExtra(type) ? renderExtra(spec) : render(spec), labelScale);
  return <ChartHost spec={spec} svg={svg} className={classes} />;
}
