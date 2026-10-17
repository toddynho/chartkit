import type { ChartRenderer } from "./render";

/**
 * Load one phase-3 chart.
 * Each branch is its own module so a bundler can fetch `@chartkitdev/core/charts/<type>` on demand.
 */
export function load(type: string): Promise<ChartRenderer | undefined> {
  switch (type) {
    case "histogram":
      return import("./charts/histogram").then((mod) => mod.histogram);
    case "boxplot":
      return import("./charts/boxplot").then((mod) => mod.boxplot);
    case "radar":
      return import("./charts/radar").then((mod) => mod.radar);
    case "funnel":
      return import("./charts/funnel").then((mod) => mod.funnel);
    case "treemap":
      return import("./charts/treemap").then((mod) => mod.treemap);
    case "sankey":
      return import("./charts/sankey").then((mod) => mod.sankey);
    case "bullet":
      return import("./charts/bullet").then((mod) => mod.bullet);
    case "waterfall":
      return import("./charts/waterfall").then((mod) => mod.waterfall);
    default:
      return Promise.resolve(undefined);
  }
}
