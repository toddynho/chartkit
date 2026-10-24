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
    case "gantt":
      return import("./charts/gantt").then((mod) => mod.gantt);
    case "timeline":
      return import("./charts/timeline").then((mod) => mod.timeline);
    case "quadrant":
      return import("./charts/quadrant").then((mod) => mod.quadrant);
    case "venn":
      return import("./charts/venn").then((mod) => mod.venn);
    case "journey":
      return import("./charts/journey").then((mod) => mod.journey);
    case "area-range":
      return import("./charts/area-range").then((mod) => mod.areaRange);
    case "bar-range":
      return import("./charts/bar-range").then((mod) => mod.barRange);
    case "errorbar":
      return import("./charts/errorbar").then((mod) => mod.errorbar);
    case "sunburst":
      return import("./charts/sunburst").then((mod) => mod.sunburst);
    case "radial-bar":
      return import("./charts/radial-bar").then((mod) => mod.radialBar);
    case "rose":
      return import("./charts/rose").then((mod) => mod.rose);
    default:
      return Promise.resolve(undefined);
  }
}
