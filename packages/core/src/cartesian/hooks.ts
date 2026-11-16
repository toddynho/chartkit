import type { DataTable } from "../data";
import type { AxisHooks, Series, TotalHook } from "./types";

export let hooks: AxisHooks | null = null;
export let totalHook: TotalHook | null = null;
export let rangePainter: ((series: Series, index: number, xAt: (index: number) => number, yAt: (value: number) => number) => string) | null = null;
export let rangePrepare:
  | ((table: DataTable, encoding: Record<string, unknown>, series: Series[], labels: string[]) => { series: Series[]; labels: string[] } | null)
  | null = null;

/** Combo mounts this. Line does not, so a lo/hi band stays out of createRenderer([line]). */
export function mountRange(
  painter: (series: Series, index: number, xAt: (index: number) => number, yAt: (value: number) => number) => string,
  prepare: (table: DataTable, encoding: Record<string, unknown>, series: Series[], labels: string[]) => { series: Series[]; labels: string[] } | null,
): void {
  rangePainter = painter;
  rangePrepare = prepare;
}

/** Stack-total labels. Bar and stacked-area entries call this so the line bundle can omit them. */
export function mountTotals(hook: TotalHook): void {
  totalHook = hook;
}

/** Position, rotation, explicit ticks, and legend values. Chart entries call `mountAxes`. */
export function installAxes(next: AxisHooks): void {
  hooks = next;
}
