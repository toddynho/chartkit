/**
 * Teaching copy and curated specs for /docs/charts/choropleth.
 * The two examples are the maps already published for this type:
 * renewable share of electricity, and population change, 2020–2023.
 * Atlas, scale, legend, and tooltip are the first controls.
 * Projection is written with the atlas, because each built-in atlas has one default.
 * Mercator, thresholds, and nodata fill stay in the playground.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyAtlas, applyGeoLegend, applyScale, atlasChoice, atlasMode, geoLegendChoiceControl, geoLegendMode, scaleChoice, scaleMode } from "./geo.ts";
import { isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const choroplethPageTitle = "Choropleth";

export const choroplethPageDescription =
  "How to build a ChartKit choropleth: regions shaded by a value, when to use it instead of a heatmap or a point map, the data shape, a spec that renders, and the options that define the map.";

/** README choropleth. Two countries, world atlas, sequential scale because mark.scale is omitted. */
export const smallestChoroplethSpec: Record<string, unknown> = {
  version: "1",
  type: "choropleth",
  data: [
    { country: "Norway", share: 98 },
    { country: "France", share: 26 },
  ],
  encoding: { region: "country", color: "share" },
  mark: { atlas: "world" },
  a11y: { alt: "Norway is higher than France." },
};

/** Approximate figures. The same rows as the world map on the gallery and the maps pages. */
const renewable: [string, number][] = [
  ["ISL", 100], ["NOR", 98], ["PRY", 100], ["CRI", 98], ["ETH", 98], ["COD", 99], ["NPL", 100],
  ["URY", 90], ["KEN", 90], ["UGA", 90], ["BRA", 89], ["NZL", 84], ["DNK", 81], ["AUT", 78],
  ["ECU", 75], ["COL", 70], ["CHE", 70], ["LAO", 70], ["PAN", 70], ["NAM", 70], ["CAN", 66],
  ["VEN", 65], ["PRT", 63], ["HRV", 60], ["GTM", 60], ["SWE", 69], ["CHL", 55], ["PER", 55],
  ["LVA", 55], ["DEU", 52], ["ESP", 51], ["FIN", 48], ["GBR", 46], ["GRC", 45], ["ROU", 45],
  ["KHM", 45], ["TUR", 42], ["ITA", 42], ["IRL", 40], ["NLD", 40], ["VNM", 40], ["EST", 40],
  ["GHA", 40], ["LKA", 40], ["MMR", 40], ["AUS", 35], ["TZA", 35], ["SVN", 35], ["CHN", 31],
  ["ARG", 30], ["BOL", 30], ["PAK", 28], ["BEL", 28], ["FRA", 26], ["POL", 26], ["JPN", 24],
  ["USA", 23], ["PHL", 22], ["NGA", 22], ["SVK", 22], ["IND", 21], ["MEX", 20], ["IDN", 20],
  ["MAR", 20], ["BGR", 20], ["RUS", 18], ["MYS", 18], ["HUN", 18], ["THA", 15], ["CZE", 15],
  ["MNG", 15], ["LUX", 15], ["ZAF", 12], ["EGY", 12], ["KAZ", 12], ["UKR", 10], ["ISR", 10],
  ["KOR", 8], ["IRN", 6], ["ARE", 5], ["IRQ", 4], ["BGD", 2], ["SGP", 2], ["SAU", 1], ["DZA", 1],
];

/** Approximate percent change in state population, 2020 to 2023. Includes the District of Columbia. */
const stateChange: [string, number][] = [
  ["AL", 1.9], ["AK", 0.3], ["AZ", 3.8], ["AR", 2.0], ["CA", -0.5], ["CO", 2.2], ["CT", 0.6],
  ["DE", 3.7], ["DC", -0.1], ["FL", 4.7], ["GA", 2.9], ["HI", -0.3], ["ID", 6.2], ["IL", -1.2],
  ["IN", 1.2], ["IA", 0.7], ["KS", 0.4], ["KY", 1.0], ["LA", -0.7], ["ME", 2.4], ["MD", 0.7],
  ["MA", 0.3], ["MI", 0.0], ["MN", 1.0], ["MS", -0.2], ["MO", 0.8], ["MT", 3.5], ["NE", 1.3],
  ["NV", 3.1], ["NH", 2.0], ["NJ", 0.8], ["NM", 0.5], ["NY", -2.1], ["NC", 3.8], ["ND", 1.6],
  ["OH", 0.2], ["OK", 2.0], ["OR", 0.5], ["PA", 0.2], ["RI", 0.5], ["SC", 5.0], ["SD", 3.6],
  ["TN", 3.1], ["TX", 4.3], ["UT", 4.5], ["VT", 0.6], ["VA", 1.3], ["WA", 1.5], ["WV", -1.3],
  ["WI", 0.9], ["WY", 1.0],
];

export const choroplethExamples: TeachExample[] = [
  {
    id: "renewable",
    title: "Renewable share of electricity",
    blurb: "World atlas. One sequential ramp for the renewable share of electricity.",
    meta: `${renewable.length} countries`,
    spec: {
      version: "1",
      type: "choropleth",
      title: "Renewable share of electricity",
      theme: "soft",
      data: renewable.map(([country, share]) => ({ country, share })),
      encoding: { region: "country", color: { field: "share", format: "%", title: "Share" } },
      mark: { atlas: "world", projection: "equalEarth", scale: "sequential" },
      size: { width: 880, height: 520 },
      a11y: {
        alt: "Approximate renewable share of electricity. Norway, Iceland, and Paraguay are near 100 percent. Saudi Arabia and Algeria are near zero. Countries with no row are hatched as no data. Malta and other small states missing from the 110m atlas are points.",
      },
    },
  },
  {
    id: "population",
    title: "Population change, 2020–2023",
    blurb: "US atlas. A diverging scale, because the change is signed.",
    meta: `${stateChange.length} regions`,
    spec: {
      version: "1",
      type: "choropleth",
      title: "Population change, 2020–2023",
      theme: "midnight",
      data: stateChange.map(([id, change]) => ({ id, change })),
      encoding: { region: "id", color: { field: "change", format: "%", title: "Change" } },
      mark: { atlas: "us", projection: "albersUsa", scale: "diverging" },
      size: { width: 880, height: 560 },
      a11y: {
        alt: "Approximate percent change in population from 2020 to 2023. Idaho, Florida, and Texas grew. New York, West Virginia, and Illinois shrank. Alaska and Hawaii sit in insets.",
      },
    },
  },
];

export function applyChoroplethAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "atlas" && (value === "world" || value === "us" || value === "canada" || value === "eu")) {
    applyAtlas(spec, value);
    return;
  }
  if (id === "scale" && (value === "sequential" || value === "diverging" || value === "threshold")) {
    applyScale(spec, value);
    return;
  }
  if (id === "legend" && (value === "off" || value === "right" || value === "bottom")) {
    applyGeoLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function choroplethControlState(spec: Record<string, unknown>): TeachState {
  return {
    atlas: atlasMode(spec),
    scale: scaleMode(spec),
    legend: geoLegendMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const choroplethTeach: TeachModule = {
  type: "choropleth",
  title: choroplethPageTitle,
  description: choroplethPageDescription,
  examples: choroplethExamples,
  smallestSpec: smallestChoroplethSpec,
  controls: [
    atlasChoice(),
    scaleChoice(),
    geoLegendChoiceControl(),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyChoroplethAction,
  controlState: choroplethControlState,
};

for (const example of choroplethExamples) {
  if (example.spec.type !== "choropleth") throw new Error(`${example.id} is not a choropleth`);
  if (!isRecord(example.spec.mark)) throw new Error(`${example.id} is missing mark`);
}
