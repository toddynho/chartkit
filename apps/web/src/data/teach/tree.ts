/**
 * Teaching copy and curated specs for /docs/charts/tree.
 * One parent per node. tidy shares the gaps. cluster lines the leaves up.
 * mark.orient places the root. mark.link is a curve or a step. A step does not draw a box.
 * Radial, depth, and color-by-depth stay in the playground. A plain tree has no legend.
 * Tooltip is on when the key is omitted.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { editMark, isRecord } from "./spec.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const treePageTitle = "Tree";

export const treePageDescription =
  "How to build a ChartKit tree: a node-link hierarchy, tidy or cluster, when to use it instead of a treemap or a sunburst, the data shape, a spec that renders, and the options that place the nodes.";

/** README tree. One root, two children, one grandchild. tidy, left to right, curve links. */
export const smallestTreeSpec: Record<string, unknown> = {
  version: "1",
  type: "tree",
  data: [
    { id: "Root", parent: "" },
    { id: "A", parent: "Root" },
    { id: "B", parent: "Root" },
    { id: "A1", parent: "A" },
  ],
  encoding: { id: "id", parent: "parent" },
  a11y: { alt: "Root has two children. A has one child." },
};

const LAYOUT_OPTIONS = [
  { value: "tidy", label: "Tidy" },
  { value: "cluster", label: "Cluster" },
] as const;

const ORIENT_OPTIONS = [
  { value: "LR", label: "Left" },
  { value: "RL", label: "Right" },
  { value: "TB", label: "Top" },
  { value: "BT", label: "Bottom" },
] as const;

const LINK_OPTIONS = [
  { value: "curve", label: "Curve" },
  { value: "step", label: "Step" },
] as const;

/**
 * Support org is the gallery tree. Produce is the dendrogram.
 * The visual-catalog "One hierarchy" is the smallest spec, not a second chart.
 * The gallery tile calls Produce "Leaves line up". The spec title stays Produce.
 */
export const treeExamples: TeachExample[] = [
  {
    id: "support",
    title: "Support org",
    blurb: "Support splits into Inbox, Docs, and Billing. Dots and names, not boxes.",
    meta: "10 nodes",
    spec: {
      version: "1",
      type: "tree",
      title: "Support org",
      data: [
        { id: "Support", parent: "" },
        { id: "Inbox", parent: "Support" },
        { id: "Docs", parent: "Support" },
        { id: "Billing", parent: "Support" },
        { id: "Triage", parent: "Inbox" },
        { id: "Replies", parent: "Inbox" },
        { id: "Guides", parent: "Docs" },
        { id: "Reference", parent: "Docs" },
        { id: "Invoices", parent: "Billing" },
        { id: "Refunds", parent: "Invoices" },
      ],
      encoding: { id: "id", parent: "parent" },
      a11y: { alt: "Support splits into Inbox, Docs, and Billing. Each of those has its own work." },
    },
  },
  {
    id: "produce",
    title: "Produce",
    blurb: "Leaves line up. Fruit has three. Veg has two.",
    meta: "cluster",
    spec: {
      version: "1",
      type: "tree",
      title: "Produce",
      data: [
        { id: "Produce", parent: "" },
        { id: "Fruit", parent: "Produce" },
        { id: "Veg", parent: "Produce" },
        { id: "Apple", parent: "Fruit" },
        { id: "Pear", parent: "Fruit" },
        { id: "Plum", parent: "Fruit" },
        { id: "Kale", parent: "Veg" },
        { id: "Chard", parent: "Veg" },
      ],
      encoding: { id: "id", parent: "parent" },
      mark: { tree: "cluster", orient: "TB" },
      a11y: { alt: "Leaves line up. Fruit has three. Veg has two." },
    },
  },
];

function markOf(spec: Record<string, unknown>): Record<string, unknown> {
  return isRecord(spec.mark) ? spec.mark : {};
}

export function applyTreeLayout(spec: Record<string, unknown>, value: "tidy" | "cluster"): void {
  editMark(spec, (mark) => {
    mark.tree = value;
  });
}

/** Omitted layout is tidy. */
export function treeLayoutMode(spec: Record<string, unknown>): "tidy" | "cluster" | "other" {
  const layout = markOf(spec).tree;
  if (layout === undefined || layout === "tidy") return "tidy";
  if (layout === "cluster") return "cluster";
  return "other";
}

export function applyTreeOrient(spec: Record<string, unknown>, value: "LR" | "RL" | "TB" | "BT"): void {
  editMark(spec, (mark) => {
    mark.orient = value;
  });
}

/** Omitted direction is left to right. */
export function treeOrientMode(spec: Record<string, unknown>): "LR" | "RL" | "TB" | "BT" | "other" {
  const orient = markOf(spec).orient;
  if (orient === undefined || orient === "LR") return "LR";
  if (orient === "RL" || orient === "TB" || orient === "BT") return orient;
  return "other";
}

export function applyTreeLink(spec: Record<string, unknown>, value: "curve" | "step"): void {
  editMark(spec, (mark) => {
    mark.link = value;
  });
}

/** Omitted link is a curve. */
export function treeLinkMode(spec: Record<string, unknown>): "curve" | "step" | "other" {
  const link = markOf(spec).link;
  if (link === undefined || link === "curve") return "curve";
  if (link === "step") return "step";
  return "other";
}

export function applyTreeAction(spec: Record<string, unknown>, action: TeachAction): void {
  const { id, value } = action;
  if (id === "layout" && (value === "tidy" || value === "cluster")) {
    applyTreeLayout(spec, value);
    return;
  }
  if (id === "orient" && (value === "LR" || value === "RL" || value === "TB" || value === "BT")) {
    applyTreeOrient(spec, value);
    return;
  }
  if (id === "link" && (value === "curve" || value === "step")) {
    applyTreeLink(spec, value);
    return;
  }
  if (id === "tooltip" && (value === "off" || value === "on")) applyTooltip(spec, value, action.restore);
}

export function treeControlState(spec: Record<string, unknown>): TeachState {
  return {
    layout: treeLayoutMode(spec),
    orient: treeOrientMode(spec),
    link: treeLinkMode(spec),
    tooltip: tooltipMode(spec),
  };
}

export const treeTeach: TeachModule = {
  type: "tree",
  title: treePageTitle,
  description: treePageDescription,
  examples: treeExamples,
  smallestSpec: smallestTreeSpec,
  controls: [
    choice("layout", "Layout", "mark.tree", "mark.tree", LAYOUT_OPTIONS),
    choice("orient", "Direction", "mark.orient", "mark.orient", ORIENT_OPTIONS),
    choice("link", "Links", "mark.link", "mark.link", LINK_OPTIONS),
    choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS),
  ],
  apply: applyTreeAction,
  controlState: treeControlState,
};

for (const example of treeExamples) {
  if (example.spec.type !== "tree") throw new Error(`${example.id} is not a tree`);
}
