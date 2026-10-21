/**
 * A few bytes the line bundle can see. Facets, concatenation, breakpoints,
 * and right-to-left placement live in `./layout`. `all` and `extra` call
 * `mountLayout()` before any chart draws. `createRenderer([line])` does not.
 */
import { isRecord } from "./svg";

export type Draw = (spec: Record<string, unknown>) => string | null;

type Arrange = (spec: Record<string, unknown>, draw: Draw) => string | null;

let arrange: Arrange | null = null;

export function installLayout(fn: Arrange): void {
  arrange = fn;
}

/** rtl when layout.direction says so. ltr and anything else stay left to right. */
export function directionOf(spec: Record<string, unknown>): "ltr" | "rtl" {
  const layout = isRecord(spec.layout) ? spec.layout : undefined;
  return layout?.direction === "rtl" ? "rtl" : "ltr";
}

export function arrangeNow(spec: Record<string, unknown>, draw: Draw): string | null {
  if (!arrange || !isRecord(spec.layout)) return null;
  return arrange(spec, draw);
}

export interface CatScale {
  center(index: number): number;
  band(index: number): { start: number; size: number };
  at(value: number): number;
  min: number;
  max: number;
  live: boolean;
}

/** RTL titles, bidi anchors, and categorical placement. Null until `mountLayout`. */
export interface LayoutPaint {
  cats(spanStart: number, spanEnd: number, count: number, edge: boolean, bar: boolean): CatScale;
  /** Category indexes to draw, left to right. Null keeps the renderer's own walk. */
  order(
    count: number,
    step: number,
    center: (index: number) => number,
    reversed: boolean,
    labelWidth?: (index: number) => number,
  ): number[] | null;
  titleX(rtl: boolean, width: number, fallback: number): number;
  titleAttr(rtl: boolean): string;
  bidi(rtl: boolean): string;
}

let paint: LayoutPaint | null = null;

export function installPaint(next: LayoutPaint): void {
  paint = next;
}

export function layoutPaint(): LayoutPaint | null {
  return paint;
}
