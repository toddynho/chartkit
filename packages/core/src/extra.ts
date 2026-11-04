import { charts as base } from "./all";
import { createRenderer, register } from "./render";
import { attach, setTreeRenderer } from "./extra-tip";
import { renderTree } from "./renderers/extra/tree";
import { histogram } from "./charts/histogram";
import { boxplot } from "./charts/boxplot";
import { radar } from "./charts/radar";
import { funnel } from "./charts/funnel";
import { treemap } from "./charts/treemap";
import { sankey } from "./charts/sankey";
import { bullet } from "./charts/bullet";
import { waterfall } from "./charts/waterfall";
import { gantt } from "./charts/gantt";
import { timeline } from "./charts/timeline";
import { quadrant } from "./charts/quadrant";
import { venn } from "./charts/venn";
import { journey } from "./charts/journey";
import { areaRange } from "./charts/area-range";
import { barRange } from "./charts/bar-range";
import { errorbar } from "./charts/errorbar";
import { sunburst } from "./charts/sunburst";
import { radialBar } from "./charts/radial-bar";
import { rose } from "./charts/rose";
import { strip } from "./charts/strip";
import { streamgraph } from "./charts/streamgraph";
import { density } from "./charts/density";
import { tree } from "./charts/tree";

/** Phase 3 and phase 4 charts. Importing this module registers them on the shared registry. */
export const charts = [histogram, boxplot, radar, funnel, treemap, sankey, bullet, waterfall, gantt, timeline, quadrant, venn, journey, areaRange, barRange, errorbar, sunburst, radialBar, rose, strip, streamgraph, density, tree] as const;

register(...charts);
setTreeRenderer(renderTree);

/**
 * Core charts plus histogram, boxplot, radar, funnel, treemap, sankey, bullet, waterfall, gantt, timeline, quadrant, venn, journey, area-range, bar-range, errorbar, sunburst, radial-bar, rose, strip, streamgraph, density, and tree.
 * `@chartkitdev/core/all` does not include these, so the line and all bundles stay smaller.
 */
export const render = createRenderer([...base, ...charts]);

export { attach };
export { histogram, boxplot, radar, funnel, treemap, sankey, bullet, waterfall, gantt, timeline, quadrant, venn, journey, areaRange, barRange, errorbar, sunburst, radialBar, rose, strip, streamgraph, density, tree };
