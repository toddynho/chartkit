/**
 * Spec the playground paints into the card.
 *
 * The card used to delete `title` and `subtitle`, then mirror only the title
 * in an HTML heading. The subtitle control wrote the spec, and the chart
 * never received it, so the secondary line under the title did not paint.
 * Both stay on the spec. The chart heading draws them. The card says
 * "Untitled" only when the spec has neither.
 */
export function stageSpec<T extends Record<string, unknown>>(spec: T): T {
  return structuredClone(spec);
}

/** True when the chart heading will paint a title or a subtitle. */
export function paintsHeading(spec: Record<string, unknown>): boolean {
  return nonEmpty(spec.title) || nonEmpty(spec.subtitle);
}

function nonEmpty(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
