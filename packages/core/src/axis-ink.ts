import { esc, n, type AxisRule, type AxisSpec } from "./svg";

/** Bottom or left spine. An omitted rule keeps the caller's historical line. */
export function spine(x1: number, y1: number, x2: number, y2: number, rule: AxisRule | undefined, fallback: string): string {
  if (rule?.on === false) return "";
  const stroke = rule?.color || fallback;
  const dash = rule?.dash === "dashed" ? ' stroke-dasharray="3 3"' : rule?.dash === "dotted" ? ' stroke-dasharray="1 3"' : "";
  const width = typeof rule?.width === "number" ? ` stroke-width="${n(rule.width)}"` : "";
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}"${width}${dash} />`;
}

/** Major ticks. Nothing until tickMarks or tickLength is set, so the default SVG stays put. */
export function majorTicks(axis: AxisSpec, horizontal: boolean, edge: number, at: number[], outward: number, stroke: string): string {
  const mode = axis.tick === "inside" || axis.tick === "outside" ? axis.tick : typeof axis.tickLen === "number" ? "outside" : "";
  if (!mode || mode === "none") return "";
  const len = axis.tickLen ?? 4;
  if (!(len > 0)) return "";
  const dir = mode === "inside" ? -outward : outward;
  return at
    .map((pos) => {
      if (horizontal) return `<line x1="${n(pos)}" y1="${n(edge)}" x2="${n(pos)}" y2="${n(edge + dir)}" stroke="${stroke}" />`;
      return `<line x1="${n(edge)}" y1="${n(pos)}" x2="${n(edge + dir)}" y2="${n(pos)}" stroke="${stroke}" />`;
    })
    .join("");
}

/** Same text node as the chart helpers, plus a rotation when the axis asks for one. */
export function turned(x: number, y: number, value: string, fill: string, size: number, anchor: string, rotate?: number, weight = "400"): string {
  const spin = rotate ? ` transform="rotate(${n(rotate)} ${n(x)} ${n(y)})"` : "";
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}"${spin}>${esc(value)}</text>`;
}

export function explicitGrid(value: unknown): false | "solid" | "dashed" | "dotted" {
  if (value === true || value === "solid") return "solid";
  if (value === "dashed" || value === "dotted") return value;
  return false;
}

export function gridLines(horizontal: boolean, edge0: number, edge1: number, at: number[], style: "solid" | "dashed" | "dotted", stroke: string): string {
  const dash = style === "dashed" ? ' stroke-dasharray="3 3"' : style === "dotted" ? ' stroke-dasharray="1 3"' : "";
  return at
    .map((pos) =>
      horizontal
        ? `<line x1="${n(edge0)}" y1="${n(pos)}" x2="${n(edge1)}" y2="${n(pos)}" stroke="${stroke}"${dash} />`
        : `<line x1="${n(pos)}" y1="${n(edge0)}" x2="${n(pos)}" y2="${n(edge1)}" stroke="${stroke}"${dash} />`,
    )
    .join("");
}
