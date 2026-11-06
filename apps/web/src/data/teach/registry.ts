import { barTeach } from "./bar.ts";
import { comboTeach } from "./combo.ts";
import { donutTeach } from "./donut.ts";
import { funnelTeach } from "./funnel.ts";
import { lineTeach } from "./line.ts";
import { pieTeach } from "./pie.ts";
import { radialBarTeach } from "./radial-bar.ts";
import { roseTeach } from "./rose.ts";
import { scatterTeach } from "./scatter.ts";
import { stackedAreaTeach } from "./stacked-area.ts";
import { sunburstTeach } from "./sunburst.ts";
import { treemapTeach } from "./treemap.ts";
import type { TeachModule } from "./types.ts";

/**
 * Chart types that use the teaching kit.
 * A later type adds its module here. [type].astro renders the kit when this lookup hits.
 * Area is not a module: /docs/charts/area stays the filled-line note.
 */
export const teachModules: Record<string, TeachModule> = {
  donut: donutTeach,
  pie: pieTeach,
  line: lineTeach,
  bar: barTeach,
  scatter: scatterTeach,
  combo: comboTeach,
  "stacked-area": stackedAreaTeach,
  funnel: funnelTeach,
  treemap: treemapTeach,
  sunburst: sunburstTeach,
  rose: roseTeach,
  "radial-bar": radialBarTeach,
};

export function teachModule(type: string): TeachModule | undefined {
  return teachModules[type];
}
