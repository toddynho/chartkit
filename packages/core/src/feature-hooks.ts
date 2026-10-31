import type { ColorScale } from "./color-scale";
import type { DataTable } from "./data";
import type { Bag } from "./glyphs";
import type { Headline, Layers, PlotModel, Series, TipChrome, XScale } from "./renderers/cartesian";
import type { PresetGeometry, PresetTokens } from "./theme";

/**
 * One copy of the optional painters. Chart bundles and `@chartkitdev/core/features`
 * both import this file. tsup leaves it external so those builds share it.
 * A line-only bundle reads null slots and does not include the painters.
 */
type Plot = { left: number; top: number; right: number; bottom: number };
type YScale = (value: number) => number;

export const slots: {
  notes: ((model: PlotModel, plot: Plot, xScale: XScale, yScale: YScale, y2Scale: YScale, horizontal: boolean, count: number) => { under: string; over: string }) | null;
  colors: ((spec: Record<string, unknown>, table: DataTable, encoding: Record<string, unknown>, mark: Record<string, unknown>, preset: PresetTokens, series: Series[], labels: string[], useScale: boolean) => { scale: ColorScale | null; rules: NonNullable<PlotModel["ruleLegend"]>; swatches?: { name: string; color: string }[] }) | null;
  chromeRead: ((spec: Record<string, unknown>) => { headline?: Headline; tip?: TipChrome }) | null;
  chromePaint: ((model: PlotModel) => string) | null;
  chromeTip: ((model: PlotModel) => string) | null;
  stacks: ((series: Series[], mode: "none" | "stack" | "percent") => { layers: Layers | null; barSlot: number[]; barSlots: number }) | null;
  stackFold: ((series: Series[], mode: "stack" | "percent") => Layers) | null;
  labels: ((model: PlotModel, layers: Layers | null, xScale: XScale, yScale: YScale, y2Scale: YScale, held: Bag) => string) | null;
  markPad: ((model: PlotModel, horizontal: boolean) => { top: number; right: number; bottom: number; left: number; gutter: number }) | null;
  scale: ((table: DataTable, encoding: Record<string, unknown>, preset: PresetTokens, series: Series[], useScale: boolean) => ColorScale | null) | null;
  colorScale: ((channel: unknown, preset: PresetTokens, values: ArrayLike<number>, fallback: boolean) => ColorScale | null) | null;
} = {
  notes: null,
  colors: null,
  chromeRead: null,
  chromePaint: null,
  chromeTip: null,
  stacks: null,
  stackFold: null,
  labels: null,
  markPad: null,
  scale: null,
  colorScale: null,
};

/** Shared preset tables. Chart bundles and feature modules must see the same maps. */
export const presets = new Map<string, PresetTokens>();
export const geometries = new Map<string, PresetGeometry>();

/**
 * Set by @chartkitdev/core/themes/brand. Null in the line bundle, so theme.brand
 * keeps the named preset until that module is imported.
 */
export type BrandThemeFn = (brand: readonly string[], mode: "light" | "dark" | "auto") => PresetTokens;
export let brandTheme: BrandThemeFn | null = null;

export function registerBrandTheme(fn: BrandThemeFn): void {
  brandTheme = fn;
  bump();
}

export function registerPreset(name: string, tokens: PresetTokens): PresetTokens {
  presets.set(name, tokens);
  revision += 1;
  return tokens;
}

export function registerGeometry(name: string, geometry: PresetGeometry): void {
  geometries.set(name, geometry);
}

/** Bumps when a painter or preset is registered, so a cached chart shell rebuilds. */
export let revision = 0;
export function bump(): void {
  revision += 1;
}
