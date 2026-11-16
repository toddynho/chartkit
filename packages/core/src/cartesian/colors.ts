import { isPaintColumn, matchRule, readRules, resolveColors, ruleCaption, ruleMatchesAny, type ColorRule } from "../color";
import type { DataTable } from "../data";
import type { ColorScale } from "../color-scale";
import { readColor } from "../frame";
import { isRecord } from "../svg";
import { slots } from "../feature-hooks";
import { lineStroke, paint, type PresetTokens } from "../theme";
import type { PlotModel, Series } from "./types";
import { channelField, seriesFieldName } from "./data";

const DISTINCT = ["#ffd60a", "#5e5ce6", "#ff9f0a", "#64d2ff", "#ac8e68", "#ff6961"];
/** CIE76. Below this, a rule colour is the same colour as a series in that theme. */
const RULE_DELTA_E = 25;

function rgbOf(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function labOf(hex: string): [number, number, number] {
  const [r, g, b] = rgbOf(hex);
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const R = channel(r);
  const G = channel(g);
  const B = channel(b);
  let x = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  let y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  let z = R * 0.0193339 + G * 0.119192 + B * 0.9503041;
  x /= 0.95047;
  z /= 1.08883;
  const pivot = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = pivot(x);
  const fy = pivot(y);
  const fz = pivot(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE76(a: string, b: string): number {
  const left = labOf(a);
  const right = labOf(b);
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]);
}

/** Light and dark fallbacks, in theme order. A single hex is one theme. */
function themeSlots(color: string): string[] {
  const paired = /light-dark\(\s*(#[0-9a-fA-F]{6})\s*,\s*(#[0-9a-fA-F]{6})\s*\)/.exec(color);
  if (paired) return [paired[1].toLowerCase(), paired[2].toLowerCase()];
  const hex = /#([0-9a-fA-F]{6})/.exec(color);
  return hex ? [`#${hex[1].toLowerCase()}`] : [];
}

function tooClose(hex: string, others: string[]): boolean {
  return others.some((other) => deltaE76(hex, other) < RULE_DELTA_E);
}

/**
 * Move a rule colour off every series colour in the same theme.
 * Light is compared with light, and dark with dark. A shifted colour is the
 * new shade itself, so a host token cannot paint the collision back.
 */
function distinctPaint(painted: string, occupied: string[]): string {
  const slots = themeSlots(painted);
  if (!slots.length) return painted;
  const occupiedSlots = occupied.map(themeSlots);
  const next = slots.map((hex, index) => {
    const others: string[] = [];
    for (const row of occupiedSlots) {
      if (row.length === slots.length) {
        if (row[index]) others.push(row[index]);
      } else others.push(...row);
    }
    if (!tooClose(hex, others)) return hex;
    for (const alt of DISTINCT) {
      if (!tooClose(alt, others) && deltaE76(alt, hex) >= RULE_DELTA_E) return alt;
    }
    return hex;
  });
  if (next.every((hex, index) => hex === slots[index])) return painted;
  if (next.length === 2) return `light-dark(${next[0]}, ${next[1]})`;
  return next[0] ?? painted;
}

/** Series fills and line strokes. Rule paints are not occupied: they are what this shifts. */
function occupiedPaints(series: Series[], preset: PresetTokens): string[] {
  const occupied: string[] = [];
  for (const item of series) {
    occupied.push(item.color);
    if (item.mark !== "bar") occupied.push(lineStroke(item.color, 2, preset.lines));
  }
  return occupied;
}

function baseLabelOf(mark: Record<string, unknown>): string | undefined {
  return typeof mark.baseLabel === "string" && mark.baseLabel.trim() ? mark.baseLabel.trim() : undefined;
}

function hasUnmatched(values: ArrayLike<number | null>, rules: ColorRule[], preset: PresetTokens): boolean {
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    if (matchRule(value, rules, preset) === null) return true;
  }
  return false;
}

function repaint(item: Series, from: string, to: string): void {
  if (!item.colors || from === to) return;
  for (let i = 0; i < item.colors.length; i++) if (item.colors[i] === from) item.colors[i] = to;
}

/**
 * One swatch per rule colour. Bars and the points that share a rule use that
 * colour; the points are outlines so the bar and the dot stay distinct.
 * mark.baseLabel folds the unmatched series colour into that series' own entry.
 */
function ruleSwatches(
  series: Series[],
  rules: ColorRule[],
  preset: PresetTokens,
  baseLabel?: string,
): { name: string; color: string; symbol: "circle" | "square" }[] {
  const occupied = occupiedPaints(series, preset);
  if (baseLabel) {
    const bars = series.filter((item) => item.mark === "bar" && hasUnmatched(item.values, rules, preset));
    const item = bars[0] ?? series.find((entry) => hasUnmatched(entry.values, rules, preset));
    if (item) item.legendName = `${item.name}: ${baseLabel}`;
  }
  const out: { name: string; color: string; symbol: "circle" | "square" }[] = [];
  const seen = new Set<string>();
  for (const rule of rules) {
    if (!rule.color || seen.has(rule.color)) continue;
    const painted = paint(rule.color, preset, 0);
    const shifted = distinctPaint(painted, occupied);
    let barUsed = false;
    let pointUsed = false;
    for (const item of series) {
      if (!ruleMatchesAny(rule, item.values)) continue;
      if (item.mark === "bar") {
        barUsed = true;
        repaint(item, painted, shifted);
        continue;
      }
      if (!item.colors) continue;
      pointUsed = true;
      repaint(item, painted, shifted);
    }
    if (!barUsed && !pointUsed) continue;
    seen.add(rule.color);
    occupied.push(shifted);
    if (barUsed && pointUsed) {
      for (const item of series) {
        if (item.mark === "bar" || !item.colors) continue;
        const hollow = item.ruleHollow ?? item.colors.map(() => false);
        for (let i = 0; i < item.colors.length; i++) if (item.colors[i] === shifted) hollow[i] = true;
        item.ruleHollow = hollow;
      }
    }
    out.push({
      name: rule.label || rule.color,
      color: shifted,
      symbol: barUsed ? "square" : "circle",
    });
  }
  return out;
}

export function applyColorScale(
  table: DataTable,
  encoding: Record<string, unknown>,
  preset: PresetTokens,
  series: Series[],
  useScale: boolean,
): ColorScale | null {
  if (!useScale || !slots.colorScale) return null;
  const colorEnc = readColor(encoding.color);
  if (!colorEnc?.field) return null;
  const pivot = seriesFieldName(encoding, table);
  const column = pivot !== colorEnc.field ? table.columns[colorEnc.field] : undefined;
  if (!column || isPaintColumn(column)) return null;
  const numeric: number[] = [];
  for (let i = 0; i < column.length; i++) {
    const value = column[i];
    if (typeof value === "number" && Number.isFinite(value)) numeric.push(value);
  }
  if (!numeric.length) return null;
  const scale = slots.colorScale(encoding.color, preset, numeric, false);
  if (!scale) return null;
  let used = false;
  for (const item of series) {
    if (column.length !== item.values.length) continue;
    const colors: string[] = [];
    let hits = 0;
    for (let i = 0; i < item.values.length; i++) {
      const value = column[i];
      if (typeof value === "number" && Number.isFinite(value)) {
        hits += 1;
        colors.push(scale.paint(value));
      } else colors.push(item.color);
    }
    if (hits) {
      item.colors = colors;
      used = true;
    }
  }
  return used ? scale : null;
}

export function runColorRules(
  spec: Record<string, unknown>,
  table: DataTable,
  encoding: Record<string, unknown>,
  mark: Record<string, unknown>,
  preset: PresetTokens,
  series: Series[],
  labels: string[],
  useScale: boolean,
): { scale: ColorScale | null; rules: NonNullable<PlotModel["ruleLegend"]>; swatches?: { name: string; color: string }[] } {
  const scale = applyPointColors(table, encoding, mark, preset, series, labels, useScale);
  const rules = scale ? [] : ruleSwatches(series, readRules(mark), preset, baseLabelOf(mark));
  const swatches = scale || rules.length ? undefined : categorySwatches(spec, series, labels);
  return { scale, rules, swatches };
}

function applyPointColors(
  table: DataTable,
  encoding: Record<string, unknown>,
  mark: Record<string, unknown>,
  preset: PresetTokens,
  series: Series[],
  labels: string[],
  useScale: boolean,
): ColorScale | null {
  const scaled = applyColorScale(table, encoding, preset, series, useScale);
  if (scaled) return scaled;
  const rules = readRules(mark);
  const colorEnc = readColor(encoding.color);
  if (rules.length === 0 && !colorEnc) return null;
  const colorField = colorEnc?.field;
  const xField = channelField(encoding.x);
  const pivot = seriesFieldName(encoding, table);
  const column = colorField && pivot !== colorField ? table.columns[colorField] : undefined;
  const paintCol = column ? isPaintColumn(column) : false;
  for (const item of series) {
    const count = item.values.length;
    const aligned = column && column.length === count ? column : null;
    const categorical = Boolean(colorEnc?.domain || colorEnc?.range || (colorField && colorField === xField) || (aligned && !paintCol));
    const colors = resolveColors({
      count,
      values: item.values,
      labels: labels.length === count ? labels : Array.from({ length: count }, (_, index) => labels[index] ?? String(index)),
      raw: aligned,
      range: colorEnc?.range,
      domain: colorEnc?.domain,
      constant: colorEnc?.constant,
      rules,
      preset,
      fallback: item.color,
      categorical,
    });
    if (!colors) continue;
    if (colorEnc?.constant) item.color = paint(colorEnc.constant, preset, 0);
    if (colors.some((color) => color !== item.color)) item.colors = colors;
  }
  applyRuleLabels(series, rules);
  return null;
}

function applyRuleLabels(series: Series[], rules: ColorRule[]): void {
  if (!rules.some((rule) => rule.label)) return;
  for (const item of series) {
    const captions: string[] = [];
    let any = false;
    for (let i = 0; i < item.values.length; i++) {
      const value = item.values[i];
      const caption = typeof value === "number" ? ruleCaption(value, rules) : "";
      if (caption) any = true;
      captions.push(caption);
    }
    if (any) item.ruleLabels = captions;
  }
}

function legendAsked(spec: Record<string, unknown>): boolean {
  if (spec.legend === true) return true;
  return isRecord(spec.legend) && spec.legend.show !== false;
}

/** Category swatches when the legend is requested and one series has more than one colour. */
function categorySwatches(spec: Record<string, unknown>, series: Series[], labels: string[]): { name: string; color: string }[] | undefined {
  if (!legendAsked(spec) || series.length !== 1) return undefined;
  const colors = series[0]?.colors;
  if (!colors) return undefined;
  const out: { name: string; color: string }[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < colors.length; i++) {
    const name = labels[i] ?? String(i);
    if (seen.has(name)) continue;
    seen.add(name);
    out.push({ name, color: colors[i] ?? series[0]?.color ?? "" });
  }
  if (out.length < 2) return undefined;
  if (new Set(out.map((item) => item.color)).size < 2) return undefined;
  return out;
}
