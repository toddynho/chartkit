import { paintSpec } from "../lib/chartkit";
import { docsSpecForType, specForType, type LiveSpec } from "./live-specs";
import { heroChartMeta, type HeroChartMeta } from "./hero-charts";
import { brandTheme } from "./marketing-theme";

export type HeroSlide = HeroChartMeta & {
  title: string;
  kpi: string;
  chrome: string;
  /** Highlighted HTML for the JSON card. */
  json: string;
  svg: string;
};

const stageSize = { width: 640, height: 280 };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stageSpec(type: string): LiveSpec {
  const spec = structuredClone(specForType(type));
  spec.theme = brandTheme;
  spec.tooltip = true;
  spec.size = type === "sparkline" ? { width: 640, height: 180 } : stageSize;
  return spec;
}

/** Share link for the short hero spec, the chart the homepage actually draws. */
export function heroEditHref(type: string): string {
  const spec = stageSpec(type);
  return `/examples#${encodeURIComponent(JSON.stringify(spec))}`;
}

function kpiOf(spec: LiveSpec, label: string): string {
  const metric = spec.metric;
  if (isRecord(metric) && (typeof metric.value === "number" || typeof metric.value === "string")) {
    return String(metric.value);
  }
  const data = spec.data;
  if (Array.isArray(data) && data.length > 0 && data.every((item) => typeof item === "number")) {
    return String(data[data.length - 1]);
  }
  const type = spec.type;
  if ((type === "line" || type === "bar") && Array.isArray(data) && isRecord(data.at(-1))) {
    const num = Object.values(data.at(-1) as Record<string, unknown>).find((value) => typeof value === "number");
    if (typeof num === "number") return String(num);
  }
  return label;
}

function previewSpec(spec: LiveSpec): LiveSpec {
  const copy = structuredClone(spec);
  if (Array.isArray(copy.data) && copy.data.length > 3) copy.data = copy.data.slice(0, 3);
  delete copy.size;
  return copy;
}

function highlight(spec: LiveSpec): string {
  const json = JSON.stringify(previewSpec(spec), null, 2)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return json
    .replaceAll(/("(?:\\.|[^"\\])*")(\s*:)/g, '<span class="k">$1</span>$2')
    .replaceAll(/: ("(?:\\.|[^"\\])*")/g, ': <span class="s">$1</span>')
    .replaceAll(/: (-?\d+(?:\.\d+)?)/g, ': <span class="n">$1</span>');
}

function withChartClass(svg: string): string {
  return svg.replace("<svg ", '<svg class="chart-svg" ');
}

export function heroSlides(): HeroSlide[] {
  return heroChartMeta.map((meta) => {
    const spec = stageSpec(meta.type);
    const painted = paintSpec(spec);
    const type = typeof spec.type === "string" ? spec.type : meta.type;
    const title = typeof spec.title === "string" && spec.title ? spec.title : meta.label;
    return {
      ...meta,
      title,
      kpi: kpiOf(spec, meta.label),
      chrome: `spec.json → ${type}`,
      json: highlight(spec),
      svg: withChartClass(painted.svg),
    };
  });
}

export function peekSparkline(): string {
  const spec = stageSpec("sparkline");
  spec.size = { width: 260, height: 72 };
  delete spec.title;
  return withChartClass(paintSpec(spec).svg);
}

export function gallerySvg(type: string): string {
  const spec = stageSpec(type);
  spec.size = { width: 480, height: 200 };
  return paintSpec(spec).svg;
}

/** Compact gallery tile. Uses the dense docs series, not the short hero example. */
export function galleryTileSvg(type: string): string {
  const spec = docsSpecForType(type);
  delete spec.title;
  delete spec.subtitle;
  if (type === "bar-list") spec.size = { width: 480 };
  else if (type === "sparkline" || type === "mini-area") spec.size = { width: 480, height: 88 };
  else if (type === "candlestick") spec.size = { width: 560, height: 240 };
  else spec.size = { width: 480, height: 168 };
  return paintSpec(spec).svg;
}
