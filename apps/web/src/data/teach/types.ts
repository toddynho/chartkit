/**
 * A chart type plugs into the docs kit by exporting one TeachModule.
 * The page chassis, the example switcher, and the control widgets are shared.
 * The module owns the examples, the smallest spec, and what each control writes.
 */

export type TeachExample = {
  id: string;
  title: string;
  /** One line under the title. */
  blurb: string;
  /** Short fact in the example menu. */
  meta: string;
  spec: Record<string, unknown>;
};

export type TeachRangeControl = {
  kind: "range";
  id: string;
  label: string;
  code: string;
  min: number;
  max: number;
  step: number;
  aria: string;
};

export type TeachChoiceControl = {
  kind: "choice";
  id: string;
  label: string;
  code: string;
  aria: string;
  options: { value: string; label: string }[];
};

export type TeachControl = TeachRangeControl | TeachChoiceControl;

/**
 * A control id plus the value the widget sent.
 * For tooltip, `restore` is the example's original tooltip.
 * For every other control, `restore` is the original example spec, so a toggle can put a channel or a mark key back.
 */
export type TeachAction = {
  id: string;
  value: string | number;
  restore?: unknown;
};

export type TeachState = Record<string, string | number>;

export type TeachModule = {
  type: string;
  title: string;
  description: string;
  examples: TeachExample[];
  smallestSpec: Record<string, unknown>;
  controls: TeachControl[];
  apply: (spec: Record<string, unknown>, action: TeachAction) => void;
  controlState: (spec: Record<string, unknown>) => TeachState;
};
