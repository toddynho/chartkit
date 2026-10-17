import { charts as base } from "./all";
import { createRenderer, register } from "./render";
import { attach } from "./extra-tip";
import { histogram } from "./charts/histogram";
import { boxplot } from "./charts/boxplot";
import { radar } from "./charts/radar";
import { funnel } from "./charts/funnel";
import { treemap } from "./charts/treemap";
import { sankey } from "./charts/sankey";
import { bullet } from "./charts/bullet";
import { waterfall } from "./charts/waterfall";

/** Phase 3 charts. Importing this module registers them on the shared registry. */
export const charts = [histogram, boxplot, radar, funnel, treemap, sankey, bullet, waterfall] as const;

register(...charts);

/**
 * Core charts plus histogram, boxplot, radar, funnel, treemap, sankey, bullet, and waterfall.
 * `@chartkitdev/core/all` does not include these, so the line and all bundles stay smaller.
 */
export const render = createRenderer([...base, ...charts]);

export { attach };
export { histogram, boxplot, radar, funnel, treemap, sankey, bullet, waterfall };
