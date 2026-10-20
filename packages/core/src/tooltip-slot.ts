/** Hover model passed to an adapter tooltip slot. The spec stays JSON. */
export interface TooltipDetail {
  title: string;
  index: number;
  x: unknown;
  rows: { name: string; text: string; color: string }[];
}

/** HTML string, a node, or null to hide the card. */
export type TooltipRender = (detail: TooltipDetail) => string | Node | null;

const KEY = "ckTooltip";

export function readTooltip(host: object): TooltipRender | undefined {
  const value = (host as Record<string, unknown>)[KEY];
  return typeof value === "function" ? (value as TooltipRender) : undefined;
}

export function writeTooltip(host: object, render: TooltipRender | undefined): void {
  const target = host as Record<string, unknown>;
  if (render) target[KEY] = render;
  else delete target[KEY];
}
