/**
 * Teaching copy and curated spec for /docs/charts/map-points.
 * The example is Largest urban areas, the cities map already published for this type.
 * Atlas, size, labels, legend, and tooltip are the first controls.
 * A second color field and labelCount stay in the playground: labelCount is a cap on the label field.
 */

import { AREA_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyAtlas, applyGeoLegend, atlasChoice, atlasMode, geoLegendChoiceControl, geoLegendMode } from "./geo.ts";
import { isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const mapPointsPageTitle = "Map points";

export const mapPointsPageDescription =
  "How to build a ChartKit point map: marks at latitude and longitude, when to use it instead of a choropleth or a scatter, the data shape, a spec that renders, and the options that define the points.";

/** Two cities from the published cities list. Latitude and longitude are enough. Size is omitted, so the radius is shared. */
export const smallestMapPointsSpec: Record<string, unknown> = {
  version: "1",
  type: "map-points",
  data: [
    { name: "Tokyo", lat: 35.7, lon: 139.7 },
    { name: "Sydney", lat: -33.9, lon: 151.2 },
  ],
  encoding: { latitude: "lat", longitude: "lon", label: "name" },
  mark: { atlas: "world" },
  a11y: { alt: "Tokyo and Sydney are marked on a world map." },
};

const cities = [
  { name: "Tokyo", lat: 35.7, lon: 139.7, pop: 37.4 },
  { name: "Delhi", lat: 28.6, lon: 77.2, pop: 32.9 },
  { name: "Shanghai", lat: 31.2, lon: 121.5, pop: 29.2 },
  { name: "Dhaka", lat: 23.8, lon: 90.4, pop: 23.2 },
  { name: "São Paulo", lat: -23.6, lon: -46.6, pop: 22.6 },
  { name: "Cairo", lat: 30.0, lon: 31.2, pop: 22.2 },
  { name: "Mexico City", lat: 19.4, lon: -99.1, pop: 22.3 },
  { name: "Beijing", lat: 39.9, lon: 116.4, pop: 21.3 },
  { name: "Mumbai", lat: 19.1, lon: 72.9, pop: 21.3 },
  { name: "Osaka", lat: 34.7, lon: 135.5, pop: 19.0 },
  { name: "New York", lat: 40.7, lon: -74.0, pop: 18.9 },
  { name: "Karachi", lat: 24.9, lon: 67.0, pop: 17.6 },
  { name: "Lagos", lat: 6.5, lon: 3.4, pop: 16.5 },
  { name: "Istanbul", lat: 41.0, lon: 29.0, pop: 16.0 },
  { name: "Buenos Aires", lat: -34.6, lon: -58.4, pop: 15.5 },
  { name: "Kolkata", lat: 22.6, lon: 88.4, pop: 15.3 },
  { name: "Los Angeles", lat: 34.1, lon: -118.2, pop: 12.5 },
  { name: "Moscow", lat: 55.8, lon: 37.6, pop: 12.6 },
  { name: "London", lat: 51.5, lon: -0.1, pop: 9.6 },
  { name: "Paris", lat: 48.9, lon: 2.3, pop: 11.1 },
  { name: "Johannesburg", lat: -26.2, lon: 28.0, pop: 6.1 },
  { name: "Sydney", lat: -33.9, lon: 151.2, pop: 5.3 },
];

const citySize = {
  field: "pop",
  format: { suffix: " million" },
  title: "Population",
};

export const mapPointsExamples: TeachExample[] = [
  {
    id: "cities",
    title: "Largest urban areas",
    blurb: "World atlas. Bubble size and the legend both read population, in millions.",
    meta: `${cities.length} cities`,
    spec: {
      version: "1",
      type: "map-points",
      title: "Largest urban areas",
      theme: "soft",
      data: cities,
      encoding: {
        latitude: "lat",
        longitude: "lon",
        size: citySize,
        color: "pop",
        label: "name",
      },
      mark: { atlas: "world", projection: "equalEarth", labelCount: 18 },
      size: { width: 880, height: 520 },
      a11y: {
        alt: "Approximate urban-area population in millions. The largest cities are labelled. Land is a neutral fill. One accent colour, sized by population.",
      },
    },
  },
];

function encodingOf(spec: Record<string, unknown>): Record<string, unknown> | undefined {
  return isRecord(spec.encoding) ? spec.encoding : undefined;
}

function restoredSize(restore: unknown): Record<string, unknown> | string | undefined {
  if (!isRecord(restore)) return undefined;
  if (typeof restore.field === "string") return restore;
  if (typeof restore.size === "string") return restore.size;
  const encoding = isRecord(restore.encoding) ? restore.encoding : undefined;
  if (!encoding) return undefined;
  if (typeof encoding.size === "string") return encoding.size;
  if (isRecord(encoding.size) && typeof encoding.size.field === "string") return encoding.size;
  return undefined;
}

function restoredLabel(restore: unknown): unknown {
  if (!isRecord(restore)) return undefined;
  if (typeof restore.label === "string" || (isRecord(restore.label) && typeof restore.label.field === "string")) return restore.label;
  const encoding = isRecord(restore.encoding) ? restore.encoding : undefined;
  if (!encoding || encoding.label == null) return undefined;
  return encoding.label;
}

/** Off deletes encoding.size. On puts the example's size channel back. A spec with no size field stays one radius. */
export function applyMapPointSize(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const encoding = encodingOf(spec);
  if (!encoding) return;
  if (value === "off") {
    delete encoding.size;
    return;
  }
  const size = restoredSize(restore);
  if (size == null) return;
  encoding.size = typeof size === "string" ? size : structuredClone(size);
}

export function mapPointSizeMode(spec: Record<string, unknown>): "off" | "on" {
  const encoding = encodingOf(spec);
  if (!encoding) return "off";
  if (typeof encoding.size === "string" && encoding.size) return "on";
  return isRecord(encoding.size) && typeof encoding.size.field === "string" ? "on" : "off";
}

export function applyMapPointLabels(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const encoding = encodingOf(spec);
  if (!encoding) return;
  if (value === "off") {
    delete encoding.label;
    return;
  }
  const label = restoredLabel(restore);
  if (label == null) return;
  encoding.label = typeof label === "string" ? label : structuredClone(label);
}

export function mapPointLabelMode(spec: Record<string, unknown>): "off" | "on" {
  const encoding = encodingOf(spec);
  if (!encoding || encoding.label == null) return "off";
  if (typeof encoding.label === "string") return encoding.label ? "on" : "off";
  return isRecord(encoding.label) && typeof encoding.label.field === "string" ? "on" : "off";
}

export function applyMapPointsAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "atlas" && (value === "world" || value === "us" || value === "canada" || value === "eu")) {
    applyAtlas(spec, value);
    return;
  }
  if (id === "size" && (value === "off" || value === "on")) {
    applyMapPointSize(spec, value, action.restore);
    return;
  }
  if (id === "labels" && (value === "off" || value === "on")) {
    applyMapPointLabels(spec, value, action.restore);
    return;
  }
  if (id === "legend" && (value === "off" || value === "right" || value === "bottom")) {
    applyGeoLegend(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function mapPointsControlState(spec: Record<string, unknown>): TeachState {
  return {
    atlas: atlasMode(spec),
    size: mapPointSizeMode(spec),
    labels: mapPointLabelMode(spec),
    legend: geoLegendMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const mapPointsTeach: TeachModule = {
  type: "map-points",
  title: mapPointsPageTitle,
  description: mapPointsPageDescription,
  examples: mapPointsExamples,
  smallestSpec: smallestMapPointsSpec,
  controls: [
    atlasChoice(),
    choice("size", "Size", "encoding.size", "encoding.size", AREA_OPTIONS),
    choice("labels", "Labels", "encoding.label", "encoding.label", AREA_OPTIONS),
    geoLegendChoiceControl(),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyMapPointsAction,
  controlState: mapPointsControlState,
};

for (const example of mapPointsExamples) {
  if (example.spec.type !== "map-points") throw new Error(`${example.id} is not map-points`);
}
