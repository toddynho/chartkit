/**
 * Heading the playground paints when a renderer leaves the card title or
 * subtitle off the SVG. Charts that already draw the line are left alone.
 * The added line sits above the chart, and the chart moves down by that band.
 */

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function decode(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

function textNodes(svg: string): string[] {
  return [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map((match) => decode(match[1] ?? ""));
}

function num(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type Line = { text: string; size: number; weight: string; fill: string };

/**
 * SVG the playground shows for a spec.
 * A heading the renderer already drew is kept. A missing subtitle is placed under the title.
 */
export function ensurePlayHeading(svg: string, spec: Record<string, unknown>): string {
  const title = typeof spec.title === "string" ? spec.title : "";
  const subtitle = typeof spec.subtitle === "string" ? spec.subtitle : "";
  const nodes = textNodes(svg);
  const needTitle = Boolean(title) && !nodes.includes(title);
  const needSubtitle = Boolean(subtitle) && !nodes.includes(subtitle);
  if (!needTitle && !needSubtitle) return svg;
  const open = svg.match(/^<svg\b[^>]*>/);
  const closeAt = svg.lastIndexOf("</svg>");
  if (!open || closeAt < open[0].length) return svg;
  let body = svg.slice(open[0].length, closeAt);
  // A chart that already paints the title keeps that line in the plot. Lift it
  // into the heading band so the subtitle can sit under it, in card order.
  if (!needTitle && title && needSubtitle) {
    body = body.replace(new RegExp(`<text\\b[^>]*>${escapeRegExp(esc(title))}</text>`), "");
  }
  const lines: Line[] = [];
  if (title && (needTitle || needSubtitle)) {
    lines.push({ text: title, size: 15, weight: "650", fill: "var(--ck-text, currentColor)" });
  }
  if (subtitle && needSubtitle) {
    lines.push({ text: subtitle, size: 12, weight: "400", fill: "var(--ck-muted, currentColor)" });
  }
  if (!lines.length) return svg;
  const attrs = open[0].slice(4, -1);
  const view = /viewBox="0 0 ([0-9.]+) ([0-9.]+)"/.exec(attrs);
  const height = /height="([0-9.]+)"/.exec(attrs);
  if (!view || !height) return svg;
  const band = lines.reduce((sum, line) => sum + line.size + 8, 6);
  const width = view[1] ?? "0";
  const nextHeight = Number(height[1]) + band;
  const nextView = Number(view[2]) + band;
  const nextAttrs = attrs
    .replace(/height="[0-9.]+"/, `height="${num(nextHeight)}"`)
    .replace(/viewBox="0 0 [0-9.]+ [0-9.]+"/, `viewBox="0 0 ${width} ${num(nextView)}"`);
  let y = 4;
  const heading = lines
    .map((line) => {
      y += line.size;
      const at = y;
      y += 6;
      return `<text x="12" y="${at}" fill="${line.fill}" font-size="${line.size}" font-weight="${line.weight}">${esc(line.text)}</text>`;
    })
    .join("");
  return `<svg${nextAttrs}>${heading}<g transform="translate(0 ${num(band)})">${body}</g></svg>`;
}
