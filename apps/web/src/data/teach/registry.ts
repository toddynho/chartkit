import { donutTeach } from "./donut.ts";
import { lineTeach } from "./line.ts";
import { pieTeach } from "./pie.ts";
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
};

export function teachModule(type: string): TeachModule | undefined {
  return teachModules[type];
}
