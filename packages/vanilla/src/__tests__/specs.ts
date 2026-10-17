import type { ChartSpec } from "@chartkitdev/core";
import { render as coreRender } from "@chartkitdev/core/all";

export const lineSpec = {
  version: "1",
  type: "line",
  data: [
    { quarter: "Q1", units: 40 },
    { quarter: "Q2", units: 55 },
  ],
  encoding: { x: "quarter", y: "units" },
  a11y: { alt: "Units rose from Q1 to Q2." },
} as const satisfies ChartSpec;

export const comboSpec = {
  version: "1",
  type: "combo",
  data: [
    { month: "Jan", units: 10, rate: 0.2 },
    { month: "Feb", units: 14, rate: 0.4 },
  ],
  encoding: {
    x: "month",
    y: [
      { field: "units", mark: "bar" },
      { field: "rate", mark: "line", axis: "y2" },
    ],
  },
  axes: { y2: { title: "Rate" } },
  a11y: { alt: "Units and rate both rose." },
} as const satisfies ChartSpec;

export const heatmapSpec = {
  version: "1",
  type: "heatmap",
  data: [
    { col: "c1", row: "r1", n: 1 },
    { col: "c2", row: "r1", n: 4 },
    { col: "c1", row: "r2", n: 2 },
  ],
  encoding: { x: "col", y: "row", color: "n" },
  a11y: { alt: "The busiest cell is r1 c2." },
} as const satisfies ChartSpec;

export const specs = [lineSpec, comboSpec, heatmapSpec];

export function coreSvg(spec: ChartSpec): string {
  return coreRender(spec);
}
