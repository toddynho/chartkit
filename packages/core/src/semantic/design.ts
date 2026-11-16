import { ruleMatchesAny, type ColorRule } from "../color";
import type { Diagnostic } from "../diagnostics";
import type { DataTable } from "../data";
import { MARK_APPLIES } from "../marks";
import { canonicalHex } from "../themes/hex";
import { columnStrings, fieldName, isRecord, plottedNumbers, readChannel } from "./util";

const SVG_BUDGET = 5000;
const DONUT_SLICE_BUDGET = 7;

export function warnDesign(
  spec: Record<string, unknown>,
  type: string,
  table: DataTable | undefined,
  diagnostics: Diagnostic[],
): void {
  if ((type === "donut" || type === "pie") && table && table.length > DONUT_SLICE_BUDGET) {
    diagnostics.push({
      code: "CK4001",
      severity: "warning",
      message: `${table.length} slices; pies and donuts are hard to read beyond ~7`,
      path: "/data",
      hint: 'Use "type": "bar" (same encoding) or set mark.other to group small slices',
    });
  }
  warnSliceNames(spec, type, table, diagnostics);
  warnColorDomain(spec, table, diagnostics);
  warnColorRules(spec, type, table, diagnostics);

  const seriesCount = countSeries(spec, table);
  const palette = paletteSize(spec);
  if (seriesCount > palette) {
    diagnostics.push({
      code: "CK4002",
      severity: "warning",
      message: `${seriesCount} series; colors repeat after ${palette}`,
      path: "/encoding/y",
      hint: "Use encoding.series with fewer groups, or set mark.palette or theme.tokens.series",
    });
  }

  if (table && table.length * Math.max(seriesCount, 1) > SVG_BUDGET) {
    const n = table.length * Math.max(seriesCount, 1);
    diagnostics.push({
      code: "CK4003",
      severity: "warning",
      message: `${n} points exceed SVG budget; switching to canvas`,
      path: "/data",
      hint: "Set size/renderer explicitly or pass columnar data for speed",
    });
  }

  warnTokenContrast(spec, diagnostics);
  const contrastIssue = textContrast(spec);
  if (contrastIssue) {
    diagnostics.push({
      code: "CK4004",
      severity: "warning",
      message: `text contrast ${contrastIssue.ratio}:1 below WCAG AA 4.5:1 for token ${JSON.stringify(contrastIssue.token)}`,
      path: `/theme/tokens/${contrastIssue.token}`,
      hint: `Suggest the nearest passing color ${contrastIssue.suggestion}`,
      fix: [{ op: "replace", path: `/theme/tokens/${contrastIssue.token}`, value: contrastIssue.suggestion }],
    });
  }
}

function countSeries(spec: Record<string, unknown>, table: DataTable | undefined): number {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  if (!encoding) return 1;
  if (Array.isArray(encoding.y)) return encoding.y.length;
  const series = readChannel(encoding.series, "/encoding/series");
  if (series?.field && table) {
    const values = table.columns[series.field];
    if (values) {
      const seen = new Set<string>();
      for (let i = 0; i < values.length; i++) seen.add(String(values[i]));
      return seen.size;
    }
  }
  return encoding.y !== undefined ? 1 : 1;
}

function paletteSize(spec: Record<string, unknown>): number {
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  if (mark && Array.isArray(mark.palette) && mark.palette.length > 0) return mark.palette.length;
  const theme = spec.theme;
  if (isRecord(theme) && isRecord(theme.tokens) && Array.isArray(theme.tokens.series) && theme.tokens.series.length > 0) {
    return theme.tokens.series.length;
  }
  return 8;
}

/** The chart keeps a spec-set color. The warning says the contrast is short. */
function warnTokenContrast(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  const theme = spec.theme;
  if (!isRecord(theme)) return;
  const tokens = isRecord(theme.tokens) ? theme.tokens : {};
  const background = typeof tokens.background === "string" ? tokens.background : "#ffffff";
  const text = typeof tokens.text === "string" ? tokens.text : "#1d1d1f";
  const pairs: Array<[string, string, string]> = [];
  if (typeof tokens.text === "string") pairs.push(["text", tokens.text, typeof tokens.background === "string" ? tokens.background : "#ffffff"]);
  if (typeof tokens.background === "string") pairs.push(["background", text, tokens.background]);
  if (typeof tokens.surface === "string") pairs.push(["surface", text, tokens.surface]);
  if (typeof tokens.muted === "string") pairs.push(["muted", tokens.muted, background]);
  if (typeof theme.brand === "string") pairs.push(["brand", theme.brand, background]);
  for (let i = 0; i < pairs.length; i++) {
    const name = pairs[i][0];
    const fg = pairs[i][1];
    const bg = pairs[i][2];
    const ratio = contrast(fg, bg);
    if (ratio === null || ratio >= 4.5) continue;
    diagnostics.push({
      code: "CK4005",
      severity: "warning",
      message: "an explicit theme color is under 4.5:1",
      path: name === "brand" ? "/theme/brand" : `/theme/tokens/${name}`,
      hint: `render keeps the spec color. Contrast is ${ratio.toFixed(2)}:1`,
    });
  }
}

function textContrast(
  spec: Record<string, unknown>,
): { token: string; ratio: string; suggestion: string } | undefined {
  const theme = spec.theme;
  if (!isRecord(theme) || !isRecord(theme.tokens)) return undefined;
  const text = theme.tokens.text;
  const background = theme.tokens.background;
  if (typeof text !== "string" || typeof background !== "string") return undefined;
  const ratio = contrast(text, background);
  if (ratio === null || ratio >= 4.5) return undefined;
  return {
    token: "text",
    ratio: ratio.toFixed(2),
    suggestion: nearestPassing(text, background),
  };
}

function warnSliceNames(
  spec: Record<string, unknown>,
  type: string,
  table: DataTable | undefined,
  diagnostics: Diagnostic[],
): void {
  if (type !== "donut" && type !== "pie") return;
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  if (!mark || !Array.isArray(mark.explode)) return;
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const names = columnStrings(table, fieldName(encoding.x));
  mark.explode.forEach((item, index) => {
    if (typeof item === "string" && names.has(item)) return;
    diagnostics.push({
      code: "CK3012",
      severity: "warning",
      message: `mark.explode[${index}] does not match a slice`,
      path: `/mark/explode/${index}`,
      hint: "use a slice label from encoding.x",
    });
  });
}

function warnColorDomain(spec: Record<string, unknown>, table: DataTable | undefined, diagnostics: Diagnostic[]): void {
  const encoding = isRecord(spec.encoding) ? spec.encoding : undefined;
  const color = encoding && isRecord(encoding.color) ? encoding.color : undefined;
  if (!color || !Array.isArray(color.domain)) return;
  const field = typeof color.field === "string" ? color.field : fieldName(encoding?.x);
  const seen = columnStrings(table, field);
  color.domain.forEach((item, index) => {
    if (typeof item === "string" && seen.has(item)) return;
    diagnostics.push({
      code: "CK3012",
      severity: "warning",
      message: `encoding.color.domain[${index}] is not in ${field ?? "the colour field"}`,
      path: `/encoding/color/domain/${index}`,
      hint: "list values that appear in the colour field, in the same order as range",
    });
  });
}

function asRule(item: Record<string, unknown>): ColorRule | null {
  if (typeof item.color !== "string") return null;
  return {
    test: typeof item.test === "string" ? item.test : undefined,
    lt: typeof item.lt === "number" ? item.lt : undefined,
    lte: typeof item.lte === "number" ? item.lte : undefined,
    gt: typeof item.gt === "number" ? item.gt : undefined,
    gte: typeof item.gte === "number" ? item.gte : undefined,
    eq: typeof item.eq === "number" ? item.eq : undefined,
    color: item.color,
  };
}

function warnColorRules(
  spec: Record<string, unknown>,
  type: string,
  table: DataTable | undefined,
  diagnostics: Diagnostic[],
): void {
  const applies = MARK_APPLIES.colorRules;
  if (!applies?.includes(type)) return;
  const mark = isRecord(spec.mark) ? spec.mark : undefined;
  if (!mark || !Array.isArray(mark.colorRules)) return;
  const numbers = plottedNumbers(spec, table);
  mark.colorRules.forEach((item, index) => {
    if (!isRecord(item)) {
      diagnostics.push({
        code: "CK3012",
        severity: "warning",
        message: `mark.colorRules[${index}] is not a colour rule`,
        path: `/mark/colorRules/${index}`,
        hint: 'use { "color": "negative", "test": "negative" } or gt, lt, or eq',
      });
      return;
    }
    const rule = asRule(item);
    if (!rule) {
      diagnostics.push({
        code: "CK3012",
        severity: "warning",
        message: `mark.colorRules[${index}] needs a color`,
        path: `/mark/colorRules/${index}/color`,
        hint: "set color to a hex colour or a theme token such as negative or accent",
      });
      return;
    }
    if (numbers.length > 0 && !ruleMatchesAny(rule, numbers)) {
      diagnostics.push({
        code: "CK3012",
        severity: "warning",
        message: `mark.colorRules[${index}] matches no values`,
        path: `/mark/colorRules/${index}`,
        hint: "widen the test, or drop the rule",
      });
    }
  });
}

function contrast(a: string, b: string): number | null {
  const left = hexToRgb(a);
  const right = hexToRgb(b);
  if (!left || !right) return null;
  const l1 = luminance(left);
  const l2 = luminance(right);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function nearestPassing(text: string, background: string): string {
  const start = hexToRgb(text) ?? [0, 0, 0];
  const bg = hexToRgb(background) ?? [255, 255, 255];
  const toward: [number, number, number] = luminance(bg) > 0.4 ? [0, 0, 0] : [255, 255, 255];
  for (let step = 0; step <= 20; step++) {
    const t = step / 20;
    const mixed: [number, number, number] = [
      Math.round(start[0] + (toward[0] - start[0]) * t),
      Math.round(start[1] + (toward[1] - start[1]) * t),
      Math.round(start[2] + (toward[2] - start[2]) * t),
    ];
    const hex = rgbToHex(mixed);
    const ratio = contrast(hex, background);
    if (ratio !== null && ratio >= 4.5) return hex;
  }
  return rgbToHex(toward);
}

function hexToRgb(value: string): [number, number, number] | null {
  const match = /^#([\da-f]{6})$/i.exec(value.trim());
  if (!match) return null;
  const n = Number.parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function luminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function checkBrand(spec: Record<string, unknown>, diagnostics: Diagnostic[]): void {
  if (!isRecord(spec.theme) || spec.theme.brand === undefined) return;
  const brand = spec.theme.brand;
  const items = typeof brand === "string" ? [brand] : Array.isArray(brand) ? brand : null;
  if (!items) return;
  items.forEach((item, index) => {
    if (typeof item !== "string") return;
    const hex = canonicalHex(item);
    const path = typeof brand === "string" ? "/theme/brand" : `/theme/brand/${index}`;
    if (!hex) {
      diagnostics.push({
        code: "CK3085",
        severity: "error",
        message: "brand colour must be a hex value",
        path,
        hint: "theme.brand is #rgb or #rrggbb. Import @chartkitdev/core/themes/brand so render derives the preset.",
      });
      return;
    }
    if (hex !== item) {
      diagnostics.push({
        code: "CK3085",
        severity: "error",
        message: "brand colour must be a hex value",
        path,
        hint: `${item.trim()} means ${hex}.`,
        fix: [{ op: "replace", path, value: hex }],
      });
    }
  });
}
