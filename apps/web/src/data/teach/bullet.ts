/**
 * Teaching copy and curated specs for /docs/charts/bullet.
 * A bullet is a measure against a target and qualitative ranges, one row per measure.
 * A bar compares categories and has no target tick and no range bands.
 * A gauge is one dial. The straight form of that idea is a bullet.
 * mark.ranges names the band fields, worst to best. Each value is that band's upper edge.
 * Off removes the list and the chart uses three even bands. On puts the example's fields back.
 * encoding.target is the marker. Off removes the channel. On puts that field back.
 */

import { AREA_OPTIONS, TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const bulletPageTitle = "Bullet";

export const bulletPageDescription =
  "How to build a ChartKit bullet: a measure against a target and ranges, when to use it instead of a bar or a gauge, the data shape, a spec that renders, and the options that define the row.";

/** README bullet. One measure, one range field, and a target. */
export const smallestBulletSpec: Record<string, unknown> = {
  version: "1",
  type: "bullet",
  data: [{ name: "Revenue", value: 275, target: 250, good: 300 }],
  encoding: { x: "name", y: "value", target: "target" },
  mark: { ranges: ["good"] },
  a11y: { alt: "Revenue is past its target." },
};

/**
 * The catalog quota chart, the garden bed marks, and the roastery café aim.
 * Titles are the visual-spec title and the showcase headings.
 */
export const bulletExamples: TeachExample[] = [
  {
    id: "quota",
    title: "Quota",
    blurb: "Revenue is past its target. Profit is still short.",
    meta: "2 measures",
    spec: {
      version: "1",
      type: "bullet",
      title: "Quota",
      data: [
        { name: "Revenue", value: 275, target: 250, poor: 150, ok: 225, good: 300 },
        { name: "Profit", value: 22, target: 27, poor: 15, ok: 25, good: 40 },
      ],
      encoding: { x: "name", y: "value", target: "target" },
      mark: { ranges: ["poor", "ok", "good"] },
      a11y: { alt: "Revenue is past its target. Profit is still short." },
    },
  },
  {
    id: "beds",
    title: "Against the bed marks",
    blurb: "Marrow and kale are past their marks. Beet is still short.",
    meta: "3 crops",
    spec: {
      version: "1",
      id: "marrow-targets",
      type: "bullet",
      theme: "soft",
      data: [
        { crop: "Marrow", kilos: 44, mark: 40, thin: 20, fair: 36, full: 50 },
        { crop: "Beet", kilos: 22, mark: 28, thin: 12, fair: 24, full: 36 },
        { crop: "Kale", kilos: 31, mark: 30, thin: 14, fair: 26, full: 40 },
      ],
      encoding: { x: "crop", y: "kilos", target: "mark" },
      mark: { ranges: ["thin", "fair", "full"] },
      size: { width: 880, height: 240 },
      a11y: { alt: "Marrow and kale are past their marks. Beet is still short." },
    },
  },
  {
    id: "cafe",
    title: "Café bags against the aim",
    blurb: "Café bags are 1,880, past the aim of 1,700 and inside the wide mark of 2,400.",
    meta: "1 band",
    spec: {
      version: "1",
      id: "roastery-bullet",
      type: "bullet",
      theme: "soft",
      data: [{ desk: "Café", bags: 1880, aim: 1700, wide: 2400 }],
      encoding: { x: "desk", y: "bags", target: "aim" },
      mark: { ranges: ["wide"] },
      size: { width: 640, height: 200 },
      a11y: { alt: "Café bags are 1,880, past the aim of 1,700 and inside the wide mark of 2,400." },
    },
  },
];

function markOf(spec: Record<string, unknown>): Record<string, unknown> {
  return isRecord(spec.mark) ? spec.mark : {};
}

function encodingOf(spec: Record<string, unknown>): Record<string, unknown> {
  return isRecord(spec.encoding) ? spec.encoding : {};
}

function exampleSpec(restore: unknown): Record<string, unknown> | undefined {
  return isRecord(restore) ? restore : undefined;
}

/**
 * Off removes mark.ranges. The row then uses three even bands.
 * On puts the example's field list back.
 */
export function applyBulletRanges(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const source = exampleSpec(restore);
  const saved = source && isRecord(source.mark) ? source.mark.ranges : undefined;
  editMark(spec, (mark) => {
    if (value === "off") {
      delete mark.ranges;
      return;
    }
    if (Array.isArray(saved)) mark.ranges = structuredClone(saved);
    else delete mark.ranges;
  });
}

export function bulletRangeMode(spec: Record<string, unknown>): "off" | "on" {
  const ranges = markOf(spec).ranges;
  return Array.isArray(ranges) && ranges.length > 0 ? "on" : "off";
}

/**
 * Off removes encoding.target, so the marker goes away. The other channels stay.
 * On puts the example's target field back.
 */
export function applyBulletTarget(spec: Record<string, unknown>, value: "off" | "on", restore?: unknown): void {
  const source = exampleSpec(restore);
  const saved = source && isRecord(source.encoding) ? source.encoding.target : undefined;
  const encoding: Record<string, unknown> = isRecord(spec.encoding) ? { ...spec.encoding } : {};
  if (value === "off") delete encoding.target;
  else if (saved !== undefined) encoding.target = structuredClone(saved);
  else delete encoding.target;
  if (Object.keys(encoding).length) spec.encoding = encoding;
  else delete spec.encoding;
}

export function bulletTargetMode(spec: Record<string, unknown>): "off" | "on" {
  return encodingOf(spec).target === undefined ? "off" : "on";
}

export function applyBulletAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "ranges" && (value === "off" || value === "on")) {
    applyBulletRanges(spec, value, action.restore);
    return;
  }
  if (id === "target" && (value === "off" || value === "on")) {
    applyBulletTarget(spec, value, action.restore);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function bulletControlState(spec: Record<string, unknown>): TeachState {
  return {
    ranges: bulletRangeMode(spec),
    target: bulletTargetMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const bulletTeach: TeachModule = {
  type: "bullet",
  title: bulletPageTitle,
  description: bulletPageDescription,
  examples: bulletExamples,
  smallestSpec: smallestBulletSpec,
  controls: [
    choice("ranges", "Ranges", "mark.ranges", "mark.ranges", AREA_OPTIONS),
    choice("target", "Target", "encoding.target", "encoding.target", AREA_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyBulletAction,
  controlState: bulletControlState,
};

for (const example of bulletExamples) {
  if (example.spec.type !== "bullet") throw new Error(`${example.id} is not a bullet`);
}
