/** Illustrative response art for the docs rail. Not a render from @chartkitdev/core. */

type Row = Record<string, unknown>;

export type PreviewSpec = {
  type?: string;
  title?: string;
  theme?: string;
  version?: string;
  smooth?: boolean;
  markers?: boolean;
  fill?: boolean;
  legend?: boolean;
  data?: unknown;
  encoding?: { x?: string; y?: string };
  series?: { data?: unknown }[];
  a11y?: { alt?: string };
  [key: string]: unknown;
};

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function readSeries(spec: PreviewSpec): { label: string; value: number }[] {
  const yKey = spec.encoding?.y;
  const rows = Array.isArray(spec.data)
    ? spec.data
    : Array.isArray(spec.series?.[0]?.data)
      ? spec.series[0].data
      : [];
  const points = rows
    .map((row, index) => {
      if (typeof row === "number") return { label: String(index + 1), value: row };
      if (Array.isArray(row)) {
        return { label: String(row[0] ?? index + 1), value: num(row[1]) ?? 0 };
      }
      if (row && typeof row === "object") {
        const record = row as Row;
        const value =
          (yKey ? num(record[yKey]) : null) ??
          Object.values(record).map(num).find((item) => item != null) ??
          0;
        const label = String(record[spec.encoding?.x ?? ""] ?? record.label ?? record.name ?? index + 1);
        return { label, value };
      }
      return null;
    })
    .filter((point): point is { label: string; value: number } => point != null && point.value != null);
  return points.length ? points : [
    { label: "W1", value: 18 },
    { label: "W4", value: 42 },
    { label: "W8", value: 86 },
  ];
}

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function previewSvg(spec: PreviewSpec): string {
  const points = readSeries(spec);
  const theme = spec.theme === "midnight" ? "midnight" : "soft";
  const stroke = theme === "midnight" ? "#5ac8fa" : "#0071e3";
  const label = theme === "midnight" ? "#a1a1a6" : "#86868b";
  const grid = theme === "midnight" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const type = spec.type ?? "line";
  const width = 560;
  const height = 200;

  if (type === "donut" || type === "pie") {
    const total = points.reduce((sum, point) => sum + Math.max(point.value, 0), 0) || 1;
    let offset = 0;
    const rings = points
      .map((point, index) => {
        const fraction = Math.max(point.value, 0) / total;
        const dash = `${(fraction * 302).toFixed(1)} ${(302 - fraction * 302).toFixed(1)}`;
        const color = index === 0 ? stroke : index === 1 ? "#0ea5e9" : "#86868b";
        const circle = `<circle r="48" cx="120" cy="100" fill="none" stroke="${color}" stroke-width="18" stroke-dasharray="${dash}" stroke-dashoffset="${(-offset).toFixed(1)}" transform="rotate(-90 120 100)"/>`;
        offset += fraction * 302;
        return circle;
      })
      .join("");
    const hole = type === "donut" ? `<circle cx="120" cy="100" r="32" fill="${theme === "midnight" ? "#0f1115" : "#fff"}"/>` : "";
    return `<svg class="preview-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(spec.a11y?.alt || spec.title || type)}">${rings}${hole}<text x="210" y="96" font-family="Inter,system-ui" font-size="13" fill="${label}">${esc(points.map((point) => point.label).slice(0, 4).join(" · "))}</text></svg>`;
  }

  const max = Math.max(...points.map((point) => point.value), 1);
  const min = Math.min(0, ...points.map((point) => point.value));
  const plot = (index: number, value: number) => {
    const x = 36 + (points.length === 1 ? 240 : (index / (points.length - 1)) * 480);
    const y = 24 + (1 - (value - min) / (max - min || 1)) * 140;
    return { x, y };
  };

  if (type === "bar" || type === "histogram" || type === "waterfall") {
    const gap = 480 / points.length;
    const bars = points
      .map((point, index) => {
        const heightPx = Math.max(4, (point.value / max) * 140);
        const x = 40 + index * gap;
        return `<rect x="${x.toFixed(1)}" y="${(164 - heightPx).toFixed(1)}" width="${Math.max(8, gap - 10).toFixed(1)}" height="${heightPx.toFixed(1)}" rx="4" fill="${stroke}" opacity="${(0.45 + (index === points.length - 1 ? 0.4 : 0)).toFixed(2)}"/>`;
      })
      .join("");
    return `<svg class="preview-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(spec.a11y?.alt || spec.title || type)}"><line x1="32" y1="164" x2="530" y2="164" stroke="${grid}"/>${bars}</svg>`;
  }

  const plotted = points.map((point, index) => plot(index, point.value));
  const smooth = spec.smooth !== false;
  let line = `M${plotted[0].x.toFixed(1)},${plotted[0].y.toFixed(1)}`;
  if (!smooth || plotted.length < 3) {
    line += plotted.slice(1).map((point) => ` L${point.x.toFixed(1)},${point.y.toFixed(1)}`).join("");
  } else {
    for (let index = 0; index < plotted.length - 1; index += 1) {
      const p0 = plotted[index - 1] ?? plotted[index];
      const p1 = plotted[index];
      const p2 = plotted[index + 1];
      const p3 = plotted[index + 2] ?? p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      line += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
  }
  const fill =
    spec.fill === true
      ? `<path d="${line} L${plotted.at(-1)!.x.toFixed(1)},164 L${plotted[0].x.toFixed(1)},164 Z" fill="${stroke}" opacity="0.16"/>`
      : "";
  const markers =
    spec.markers === false
      ? ""
      : plotted
          .map(
            (point) =>
              `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="3.2" fill="${theme === "midnight" ? "#0f1115" : "#fff"}" stroke="${stroke}" stroke-width="2"/>`,
          )
          .join("");
  const axis = `<g stroke="${grid}"><line x1="32" y1="20" x2="32" y2="164"/><line x1="32" y1="164" x2="530" y2="164"/></g>`;
  const labels = [0, Math.floor((points.length - 1) / 2), points.length - 1]
    .filter((index, position, list) => list.indexOf(index) === position)
    .map(
      (index) =>
        `<text x="${plotted[index].x.toFixed(1)}" y="186" text-anchor="middle" font-family="Inter,system-ui" font-size="11" fill="${label}">${esc(points[index].label)}</text>`,
    )
    .join("");
  return `<svg class="preview-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(spec.a11y?.alt || spec.title || type)}">${axis}${fill}<path d="${line}" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>${markers}${labels}</svg>`;
}
