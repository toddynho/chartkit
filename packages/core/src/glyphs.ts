import { esc, font, n } from "./svg";

const NAMES = ["circle", "square", "diamond", "triangle", "cross", "none"];

/** A known marker name, or "" when the value is not one. */
export function glyphOf(value: unknown): string {
  return typeof value === "string" && NAMES.includes(value) ? value : "";
}

export function named(value: unknown, names: readonly string[]): string {
  return typeof value === "string" && names.includes(value) ? value : "";
}

/** Marker centered on x,y. r is the circle radius. Hollow strokes instead of filling. */
export function marker(x: number, y: number, r: number, shape: string, color: string, hollow: boolean, extra = "", title = ""): string {
  if (!shape || shape === "none" || r < 0) return "";
  const fill = hollow ? "none" : color;
  const stroke = hollow ? ` stroke="${color}" stroke-width="1.5"` : "";
  const end = (name: string) => (title ? `><title>${esc(title)}</title></${name}>` : " />");
  if (shape === "square") return `<rect x="${n(x - r)}" y="${n(y - r)}" width="${n(r * 2)}" height="${n(r * 2)}" fill="${fill}"${stroke}${extra}${end("rect")}`;
  if (shape === "cross") {
    const arm = r * 0.75;
    return `<path d="M${n(x - arm)} ${n(y)}h${n(arm * 2)}M${n(x)} ${n(y - arm)}v${n(arm * 2)}" fill="none" stroke="${color}" stroke-width="1.5"${extra}${end("path")}`;
  }
  if (shape === "diamond" || shape === "triangle") {
    const d =
      shape === "diamond"
        ? `M${n(x)} ${n(y - r)}L${n(x + r)} ${n(y)} ${n(x)} ${n(y + r)} ${n(x - r)} ${n(y)}Z`
        : `M${n(x)} ${n(y - r)}L${n(x + r)} ${n(y + r * 0.8)} ${n(x - r)} ${n(y + r * 0.8)}Z`;
    return `<path d="${d}" fill="${fill}"${stroke}${extra}${end("path")}`;
  }
  return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill}"${stroke}${extra}${end("circle")}`;
}

export interface Bag {
  put(text: string, x: number, y: number, anchor: string, fill: string): string;
}

/** Skip a label whose box overlaps one already kept. */
export function bag(): Bag {
  const boxes: number[] = [];
  return {
    put(text, x, y, anchor, fill) {
      const w = Math.max(8, text.length * 6);
      const left = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
      const top = y - 9;
      for (let i = 0; i < boxes.length; i += 4) {
        const ox = boxes[i] ?? 0;
        const oy = boxes[i + 1] ?? 0;
        const ow = boxes[i + 2] ?? 0;
        const oh = boxes[i + 3] ?? 0;
        if (left < ox + ow && left + w > ox && top < oy + oh && top + 11 > oy) return "";
      }
      boxes.push(left, top, w, 11);
      return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" fill="${fill}" font-size="10" font-family="${font()}">${esc(text)}</text>`;
    },
  };
}

/** dx, dy, and anchor for a label around a point. */
export function nudge(position: string, r: number): [number, number, string] {
  if (position === "bottom") return [0, r + 12, "middle"];
  if (position === "left") return [-(r + 4), 3, "end"];
  if (position === "right") return [r + 4, 3, "start"];
  if (position === "center" || position === "inside") return [0, 3, "middle"];
  return [0, -(r + 8), "middle"];
}
