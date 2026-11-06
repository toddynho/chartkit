/**
 * Teaching copy and curated specs for /docs/charts/gantt.
 * A gantt is tasks on a calendar: start and end, sections, status, progress,
 * milestones, and dependencies. The status key is drawn by the chart.
 * legend does not hide or move it, so it is not a control.
 * Tooltip is on when the key is omitted. Off writes false. On puts the example's tooltip back.
 * The card text is the mark label. tooltip.fields is not read.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const ganttPageTitle = "Gantt";

export const ganttPageDescription =
  "How to build a ChartKit gantt: tasks on a calendar, when to use it instead of a bar or a timeline, the data shape, a spec that renders, and the tooltip.";

/** Feature-doc gantt. Two tasks, a dependency, and a milestone. Field names are the defaults, so encoding can be omitted. */
export const smallestGanttSpec: Record<string, unknown> = {
  version: "1",
  type: "gantt",
  data: [
    { id: "a", task: "A", start: "2026-03-02", end: "2026-03-13" },
    { id: "b", task: "B", start: "2026-04-06", milestone: true, depends: "a" },
  ],
  a11y: { alt: "B follows A." },
};

/**
 * The core Northstar launch, the Paper Kite showcase, and the Cinder prep lanes.
 * Titles are the spec title, or the showcase heading when the spec has no title.
 */
export const ganttExamples: TeachExample[] = [
  {
    id: "northstar",
    title: "Northstar launch",
    blurb: "The web app is critical. Beta is 6 April, and general availability is 17 April.",
    meta: "8 tasks",
    spec: {
      version: "1",
      type: "gantt",
      id: "launch-gantt",
      title: "Northstar launch",
      data: [
        { id: "spec", task: "Write the spec", section: "Plan", start: "2026-03-02", end: "2026-03-13", progress: 1, status: "done", today: "2026-03-18" },
        { id: "design", task: "Design the UI", section: "Plan", start: "2026-03-09", end: "2026-03-20", progress: 0.8, status: "active", depends: "spec" },
        { id: "copy", task: "Review the copy", section: "Plan", start: "2026-03-16", end: "2026-03-25", progress: 0.45, status: "active", depends: "spec" },
        { id: "api", task: "Build the API", section: "Build", start: "2026-03-16", end: "2026-04-03", progress: 0.55, status: "active", depends: "spec" },
        { id: "web", task: "Build the web app", section: "Build", start: "2026-03-23", end: "2026-04-10", progress: 0.3, status: "crit", depends: "design" },
        { id: "billing", task: "Wire up billing", section: "Build", start: "2026-03-30", end: "2026-04-10", progress: 0.2, status: "active", depends: "api" },
        { id: "beta", task: "Open the beta", section: "Launch", start: "2026-04-06", milestone: true, status: "crit", depends: "web" },
        { id: "ga", task: "General availability", section: "Launch", start: "2026-04-17", milestone: true, depends: "beta, billing" },
      ],
      encoding: { x: "task", y: "section", open: "start", close: "end", color: "status", source: "id", target: "depends" },
      a11y: { alt: "The Northstar launch is in build. The web app is critical, beta is 6 April, and general availability is 17 April." },
    },
  },
  {
    id: "paper-kite",
    title: "Paper Kite",
    blurb: "Beats are done. The glide depends on the kite, and first flight is a milestone.",
    meta: "4 tasks",
    spec: {
      version: "1",
      type: "gantt",
      data: [
        { task: "Write the beats", section: "Sketch", id: "beats", start: "2026-06-01", end: "2026-06-12", status: "done" },
        { task: "Paint the kite", section: "Sketch", id: "kite", start: "2026-06-08", end: "2026-06-26", status: "active" },
        { task: "Tune the glide", section: "Build", id: "glide", start: "2026-06-22", end: "2026-07-10", status: "active", depends: "kite" },
        { task: "First flight", section: "Ship", id: "flight", start: "2026-07-17", milestone: true, depends: "glide" },
      ],
      a11y: { alt: "Paper Kite" },
      title: "Paper Kite",
      theme: "soft",
      size: { width: 880, height: 440 },
    },
  },
  {
    id: "cinder",
    title: "Prep lanes for Cinder",
    blurb: "The tank is proved. Dress rehearsal is critical, and liftoff is 20 May.",
    meta: "5 tasks",
    spec: {
      version: "1",
      id: "cinder-lanes",
      type: "gantt",
      theme: "soft",
      data: [
        { id: "tank", task: "Proof the tank", section: "Prep", start: "2026-04-06", end: "2026-04-17", progress: 1, status: "done" },
        { id: "avionics", task: "Fit avionics", section: "Prep", start: "2026-04-13", end: "2026-04-28", progress: 0.7, status: "active", depends: "tank" },
        { id: "stack", task: "Stack the stages", section: "Stack", start: "2026-04-22", end: "2026-05-08", progress: 0.4, status: "active", depends: "tank" },
        { id: "dress", task: "Dress rehearsal", section: "Stack", start: "2026-05-06", end: "2026-05-15", progress: 0.15, status: "crit", depends: "stack" },
        { id: "lift", task: "Liftoff", section: "Fire", start: "2026-05-20", milestone: true, status: "crit", depends: "dress" },
      ],
      encoding: { x: "task", y: "section", open: "start", close: "end", color: "status", source: "id", target: "depends" },
      size: { width: 980, height: 420 },
      a11y: { alt: "The tank is proved. Dress rehearsal is the critical lane, and liftoff is marked for 20 May." },
    },
  },
];

export function applyGanttAction(spec: Record<string, unknown>, action: TeachAction): void {
  if (action.id === "tooltip" && (action.value === "off" || action.value === "on")) {
    applyTooltip(spec, action.value, action.restore);
  }
}

export function ganttControlState(spec: Record<string, unknown>): TeachState {
  return { tooltip: tooltipMode(spec) };
}

export const ganttTeach: TeachModule = {
  type: "gantt",
  title: ganttPageTitle,
  description: ganttPageDescription,
  examples: ganttExamples,
  smallestSpec: smallestGanttSpec,
  controls: [choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS)],
  apply: applyGanttAction,
  controlState: ganttControlState,
};

for (const example of ganttExamples) {
  if (example.spec.type !== "gantt") throw new Error(`${example.id} is not a gantt`);
}
