/**
 * Client export. `toPNG` draws the serialized SVG into a canvas.
 * Cross-origin stylesheets throw SecurityError and are skipped.
 * Remote `@font-face` urls and external `<image href>` values are not embedded:
 * system fonts are referenced by the computed family, and a remote image taints the canvas.
 */

export interface PngOptions {
  /** Device-pixel multiplier. Default 2. */
  scale?: number;
  /** Filled before the SVG is drawn, so a transparent plot is not black. */
  background?: string;
}

export function toSVG(chart: SVGElement | string): string {
  if (typeof chart === "string") {
    if (chart.includes("xmlns=")) return chart;
    return chart.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const clone = chart.cloneNode(true) as SVGElement;
  if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copyFonts(chart, clone);
  embedFaces(clone);
  return new XMLSerializer().serializeToString(clone);
}

function copyFonts(source: SVGElement, clone: SVGElement): void {
  const live = source.querySelectorAll("text, tspan");
  const copy = clone.querySelectorAll("text, tspan");
  for (let i = 0; i < live.length; i++) {
    const node = live[i];
    const target = copy[i];
    if (!node || !target) continue;
    const style = getComputedStyle(node);
    if (style.fontFamily) target.setAttribute("font-family", style.fontFamily);
    if (style.fontSize) target.setAttribute("font-size", style.fontSize);
    if (style.fontWeight) target.setAttribute("font-weight", style.fontWeight);
  }
}

/** Same-origin and data/blob font faces only. A cross-origin sheet is skipped. */
function embedFaces(clone: SVGElement): void {
  if (typeof document === "undefined") return;
  let css = "";
  const sheets = document.styleSheets;
  for (let s = 0; s < sheets.length; s++) {
    const sheet = sheets[s];
    if (!sheet) continue;
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (!rule || rule.type !== CSSRule.FONT_FACE_RULE) continue;
      const text = rule.cssText;
      if (/url\(\s*(['"]?)(https?:|\/\/)/i.test(text)) continue;
      css += text;
    }
  }
  if (!css) return;
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = css;
  clone.insertBefore(style, clone.firstChild);
}

export function toCSV(spec: { data?: unknown }): string {
  const data = spec.data;
  if (Array.isArray(data)) return rowsToCsv(data);
  if (data && typeof data === "object") {
    const record = data as { columns?: unknown };
    if (Array.isArray(record.columns)) return rowsToCsv(record.columns);
    if (record.columns && typeof record.columns === "object") return columnsToCsv(record.columns as Record<string, unknown>);
  }
  return "";
}

function rowsToCsv(data: unknown[]): string {
  if (data.length === 0) return "";
  if (data.every((row) => typeof row === "number" || row == null)) return ["value", ...data.map((row) => cell(row))].join("\n");
  if (data.every((row) => Array.isArray(row))) return data.map((row) => (row as unknown[]).map((item) => cell(item)).join(",")).join("\n");
  const keys: string[] = [];
  for (const row of data) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    for (const key of Object.keys(row as Record<string, unknown>)) if (!keys.includes(key)) keys.push(key);
  }
  if (keys.length === 0) return "";
  const lines = [keys.join(",")];
  for (const row of data) {
    const record = row && typeof row === "object" && !Array.isArray(row) ? (row as Record<string, unknown>) : {};
    lines.push(keys.map((key) => cell(record[key])).join(","));
  }
  return lines.join("\n");
}

function columnsToCsv(columns: Record<string, unknown>): string {
  const names = Object.keys(columns);
  if (names.length === 0) return "";
  let length = 0;
  for (const name of names) {
    const column = columns[name];
    if (Array.isArray(column) && column.length > length) length = column.length;
  }
  const lines = [names.join(",")];
  for (let i = 0; i < length; i++) {
    lines.push(names.map((name) => cell(Array.isArray(columns[name]) ? (columns[name] as unknown[])[i] : "")).join(","));
  }
  return lines.join("\n");
}

function cell(value: unknown): string {
  if (value == null) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toPNG(chart: SVGElement | string, options: PngOptions = {}): Promise<string> {
  const svg = typeof chart === "string" ? (chart.includes("xmlns=") ? chart : chart.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"')) : toSVG(chart);
  const scale = options.scale && options.scale > 0 ? options.scale : 2;
  const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = parsed.documentElement;
  const box = (root.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number);
  const widthAttr = Number(root.getAttribute("width"));
  const heightAttr = Number(root.getAttribute("height"));
  const width = Number.isFinite(widthAttr) && widthAttr > 0 ? widthAttr : box[2] || 640;
  const height = Number.isFinite(heightAttr) && heightAttr > 0 ? heightAttr : box[3] || 360;
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  return load(url)
    .then((image) => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable in this environment.");
      if (options.background) {
        ctx.fillStyle = options.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/png");
    })
    .finally(() => URL.revokeObjectURL(url));
}

function load(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The SVG could not be drawn. A remote image or font may have blocked the canvas."));
    image.src = url;
  });
}

/** Browser download of a blob. Used by the export menu. */
export function saveBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
