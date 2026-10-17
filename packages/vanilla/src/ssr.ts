import type { ChartSpec } from "@chartkitdev/core";
import { render } from "@chartkitdev/core/extra";

/** Server HTML for a spec. This entry imports histogram through waterfall statically. */
export function renderToString(spec: ChartSpec): string {
  return render(spec);
}
