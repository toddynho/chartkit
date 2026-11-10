/**
 * Teaching copy and curated specs for /docs/charts/journey.
 * Steps in order, a 1–5 score drawn as a face, sections, and actor chips.
 * The chips come from the actors field. legend does not place them, so it is not a control.
 * Tooltip is on when the key is omitted. Off writes false. On puts the example's tooltip back.
 * The card text is the mark label. tooltip.fields is not read.
 */

import { TOOLTIP_OPTIONS, choice } from "./controls.ts";
import { applyTooltip, tooltipMode } from "./tooltip.ts";
import type { TeachAction, TeachExample, TeachModule, TeachState } from "./types.ts";

export const journeyPageTitle = "Journey";

export const journeyPageDescription =
  "How to build a ChartKit journey: steps with a 1–5 score and actors, when to use it instead of a funnel or a timeline, the data shape, a spec that renders, and the tooltip.";

/** Feature-doc journey. One section, one step, one score, one actor. */
export const smallestJourneySpec: Record<string, unknown> = {
  version: "1",
  type: "journey",
  data: [{ section: "Pay", step: "Card", score: 2, actors: "Shop" }],
  a11y: { alt: "Card scores 2." },
};

/**
 * The core checkout, the Paper Kite playtest, and the Quill first-note journey.
 * Titles are the spec title, or the showcase heading when the spec has no title.
 */
export const journeyExamples: TeachExample[] = [
  {
    id: "checkout",
    title: "Checkout",
    blurb: "Checkout is smooth until payment. A declined card scores 1, then confirmation recovers.",
    meta: "9 steps",
    spec: {
      version: "1",
      type: "journey",
      id: "checkout-journey",
      title: "Checkout",
      data: [
        { section: "Browse", step: "Land on the product", score: 5, actors: "Shopper" },
        { section: "Browse", step: "Compare two lamps", score: 4, actors: "Shopper" },
        { section: "Cart", step: "Add the lamp", score: 5, actors: "Shopper" },
        { section: "Cart", step: "See the shipping date", score: 3, actors: "Shopper" },
        { section: "Pay", step: "Create an account", score: 2, actors: "Shopper" },
        { section: "Pay", step: "Enter the card", score: 2, actors: "Shopper, Payments" },
        { section: "Pay", step: "Fix a declined card", score: 1, actors: "Shopper, Payments, Support" },
        { section: "Done", step: "See the confirmation", score: 4, actors: "Shopper" },
        { section: "Done", step: "Track the parcel", score: 5, actors: "Shopper" },
      ],
      encoding: { x: "step", y: "score", series: "section", color: "actors" },
      a11y: { alt: "Checkout is smooth until payment. Creating an account scores 2, and a declined card scores 1 before confirmation recovers." },
    },
  },
  {
    id: "playtest",
    title: "Paper Kite playtest",
    blurb: "Finding the tent scores 5. Losing the wind scores 2.",
    meta: "5 steps",
    spec: {
      version: "1",
      type: "journey",
      data: [
        { step: "Find the tent", score: 5, section: "Arrive", actors: "Player" },
        { step: "Read the card", score: 4, section: "Arrive", actors: "Player, Writer" },
        { step: "First throw", score: 5, section: "Fly", actors: "Player" },
        { step: "Lose the wind", score: 2, section: "Fly", actors: "Player, Writer" },
        { step: "Mark the map", score: 4, section: "Land", actors: "Player, Writer" },
      ],
      a11y: { alt: "Paper Kite playtest" },
      title: "Paper Kite playtest",
      theme: "soft",
      size: { width: 880, height: 520 },
    },
  },
  {
    id: "first-note",
    title: "First note",
    blurb: "Naming the notebook scores 5. Finding the note again drops to 2.",
    meta: "6 steps",
    spec: {
      version: "1",
      id: "quill-journey",
      type: "journey",
      theme: "soft",
      data: [
        { section: "Open", step: "Name the notebook", score: 5, actors: "Writer" },
        { section: "Open", step: "Pick a cover", score: 4, actors: "Writer" },
        { section: "Write", step: "First line", score: 5, actors: "Writer" },
        { section: "Write", step: "Find it again", score: 2, actors: "Writer" },
        { section: "Share", step: "Send a page", score: 3, actors: "Writer, Reader" },
        { section: "Share", step: "See a reply", score: 4, actors: "Writer, Reader" },
      ],
      encoding: { x: "step", y: "score", series: "section", color: "actors" },
      size: { width: 760, height: 440 },
      a11y: { alt: "Naming and the first line score 5. Finding the note again drops to 2, then a reply recovers it." },
    },
  },
];

export function applyJourneyAction(spec: Record<string, unknown>, action: TeachAction): void {
  if (action.id === "tooltip" && (action.value === "off" || action.value === "on")) {
    applyTooltip(spec, action.value, action.restore);
  }
}

export function journeyControlState(spec: Record<string, unknown>): TeachState {
  return { tooltip: tooltipMode(spec) };
}

export const journeyTeach: TeachModule = {
  type: "journey",
  title: journeyPageTitle,
  description: journeyPageDescription,
  examples: journeyExamples,
  smallestSpec: smallestJourneySpec,
  controls: [choice("tooltip", "Tooltip", "tooltip", "tooltip", TOOLTIP_OPTIONS)],
  apply: applyJourneyAction,
  controlState: journeyControlState,
};

for (const example of journeyExamples) {
  if (example.spec.type !== "journey") throw new Error(`${example.id} is not a journey`);
}
