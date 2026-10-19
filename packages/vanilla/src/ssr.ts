import type { ChartSpec } from "@chartkitdev/core";
import { render } from "@chartkitdev/core/extra";

/** Server HTML for a spec. This entry imports the extra charts, including gantt through journey, statically. */
export function renderToString(spec: ChartSpec): string {
  return render(spec);
}
