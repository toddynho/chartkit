import { paintSpec } from "../lib/chartkit";
import { loadMaps } from "../lib/batch3";
import { chartTypes } from "./chart-types";
import { chartDocs } from "./docs-catalog";
import { carouselSpecForType, docsSpecForType } from "./live-specs";
import { brandTheme, galleryTheme, SERIES } from "./marketing-theme";

export type Slide = {
  label: string;
  title: string;
  subtitle: string;
  bytes: string;
  html: string;
  svg: string;
  /** Spec the client mounts for tooltips. Maps stay on the painted SVG. */
  spec: Record<string, unknown>;
  geo?: boolean;
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

function bytesOf(spec: unknown): string {
  const n = new TextEncoder().encode(JSON.stringify(spec)).length;
  return `${n} B`;
}

function highlight(spec: unknown): string {
  const json = JSON.stringify(spec, null, 2)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return json
    .replaceAll(/("(?:\\.|[^"\\])*")(\s*:)/g, '<span class="tok-key">$1</span>$2')
    .replaceAll(/: ("(?:\\.|[^"\\])*")/g, ': <span class="tok-str">$1</span>')
    .replaceAll(/: (-?\d+(?:\.\d+)?)/g, ': <span class="tok-num">$1</span>');
}

function themed(spec: Record<string, unknown>, accent = 0): Record<string, unknown> {
  const series = accent === 0 ? [...SERIES] : [...SERIES.slice(accent), ...SERIES.slice(0, accent)];
  return {
    ...spec,
    theme: {
      ...brandTheme,
      tokens: { ...brandTheme.tokens, accent: series[0], series },
    },
  };
}

function paint(spec: Record<string, unknown>, size: { width: number; height: number }, accent = 0): string {
  const next = {
    ...themed(spec, accent),
    size,
    legend: spec.legend ?? false,
    tooltip: spec.tooltip ?? true,
  };
  const result = paintSpec(next);
  if (!result.ok || !result.svg.includes("<svg") || result.svg.includes("ck-chart-error")) {
    throw new Error(`${String(spec.type)} render failed: ${result.footer} ${result.issues.map((issue) => issue.message).join("; ")}`);
  }
  if (result.svg.includes('class="ck-chart"')) return result.svg.replace('class="ck-chart"', 'class="ck-svg ck-chart"');
  return result.svg.replace("<svg ", '<svg class="ck-svg" ');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Categories pick series colors. A single-series bar would otherwise stay one blue. */
function colorCategories(spec: Record<string, unknown>): Record<string, unknown> {
  const type = spec.type;
  if (type !== "bar" && type !== "funnel" && type !== "radial-bar" && type !== "rose") return spec;
  const encoding = isRecord(spec.encoding) ? { ...spec.encoding } : {};
  if (encoding.color || encoding.series) return spec;
  const x = encoding.x;
  const field = typeof x === "string" ? x : isRecord(x) && typeof x.field === "string" ? x.field : "";
  if (!field) return spec;
  encoding.color = field;
  return { ...spec, encoding };
}

function heatOrange(spec: Record<string, unknown>): Record<string, unknown> {
  if (spec.type !== "heatmap") return spec;
  const encoding = isRecord(spec.encoding) ? { ...spec.encoding } : {};
  const color = encoding.color;
  const field = typeof color === "string" ? color : isRecord(color) && typeof color.field === "string" ? color.field : "";
  if (!field) return spec;
  encoding.color = { field, scale: { type: "sequential", scheme: "orange" } };
  return { ...spec, encoding };
}

function slideFrom(label: string, title: string, subtitle: string, spec: Record<string, unknown>, geo = false, svg = ""): Slide {
  const display: Record<string, unknown> = { ...spec, tooltip: spec.tooltip ?? true };
  const size =
    display.type === "sparkline" || display.type === "mini-area" || display.type === "spike"
      ? { width: 640, height: 160 }
      : { width: 640, height: 300 };
  // Client mount has to use the same theme as the painted SVG, or hydration snaps back to one blue.
  const shown: Record<string, unknown> = geo ? display : { ...themed(display), size, legend: spec.legend ?? false };
  const drawn: Record<string, unknown> = { ...shown };
  delete drawn.title;
  delete drawn.subtitle;
  return {
    label,
    title,
    subtitle,
    bytes: bytesOf(display),
    html: highlight(display),
    svg: geo ? svg : paint(drawn, size),
    spec: shown,
    geo,
  };
}

const signups = [72, 98, 86, 128, 114, 158, 148, 188];

function row(month: string, signups: number) {
  return { month, signups };
}

export function homeSlides(): Slide[] {
  const families = ["Core", "Statistical", "Planning"] as const;
  const inCatalog = new Set(chartDocs.map((chart) => chart.type));
  const ordered = [
    ...families.flatMap((family) => chartDocs.filter((chart) => chart.family === family)),
    ...chartTypes
      .filter((chart) => !inCatalog.has(chart.type))
      .map((chart) => ({ type: chart.type, label: chart.title, lede: chart.summary })),
  ];
  const slides = ordered.map((chart) => {
    const raw = colorCategories(heatOrange(structuredClone(carouselSpecForType(chart.type)) as Record<string, unknown>));
    const title = typeof raw.title === "string" && raw.title ? raw.title : chart.label;
    return slideFrom(chart.label, title, chart.lede, raw);
  });
  const maps = loadMaps();
  const geo = [
    ["World", "Renewable share of electricity", "Choropleth. Sequential scale, hatched where a country has no row.", maps.world],
    ["United States", "Population change", "2020–2023. Red is a loss, blue is a gain.", maps.us],
    ["Cities", "Largest urban areas", "Bubble area is population, in millions.", maps.cities],
  ] as const;
  for (const [label, title, subtitle, card] of geo) {
    const spec = { ...(card.spec as Record<string, unknown>) };
    slides.push(slideFrom(label, title, subtitle, spec, true, markSvg(card.svg)));
  }
  return slides;
}

function markSvg(svg: string): string {
  if (svg.includes('class="ck-chart"')) return svg.replace('class="ck-chart"', 'class="ck-svg ck-chart"');
  if (svg.includes("<svg ")) return svg.replace("<svg ", '<svg class="ck-svg" ');
  return svg;
}

export function paintMark(spec: Record<string, unknown>, size: { width: number; height: number }): string {
  return paint(spec, size);
}

const barSpec = {
  version: "1",
  type: "bar",
  title: "Signups by month",
  data: months.map((month, i) => row(month, signups[i])),
  encoding: { x: "month", y: "signups" },
  mark: { cornerRadius: 3 },
  a11y: { alt: "Signups rise from January to August." },
};

export function showcaseSvgs() {
  const line = {
    version: "1",
    type: "line",
    data: [30, 45, 40, 60, 55, 75, 70, 90].map((v, i) => ({ m: months[i], v })),
    encoding: { x: "m", y: "v" },
    mark: { curve: "monotone", points: "none", area: false },
    a11y: { alt: "The line trends up." },
  };
  return {
    cloud: paint(barSpec, { width: 520, height: 160 }, 0),
    revenue: paint(line, { width: 240, height: 72 }, 0),
    orders: paint(
      {
        version: "1",
        type: "bar",
        data: [40, 60, 50, 80, 70, 95].map((v, i) => ({ m: months[i], v })),
        encoding: { x: "m", y: "v" },
        mark: { cornerRadius: 2 },
        a11y: { alt: "Orders vary across six months and peak in the last month." },
      },
      { width: 240, height: 72 },
      1,
    ),
    sessions: paint(
      {
        ...line,
        data: [60, 50, 65, 55, 70, 62, 80, 76].map((v, i) => ({ m: months[i], v })),
        a11y: { alt: "Sessions fluctuate and finish higher." },
      },
      { width: 240, height: 72 },
      2,
    ),
    errors: paint(
      {
        version: "1",
        type: "bar",
        data: [30, 25, 35, 20, 18, 12].map((v, i) => ({ m: months[i], v })),
        encoding: { x: "m", y: "v" },
        mark: { cornerRadius: 2 },
        a11y: { alt: "Errors fall toward the last month." },
      },
      { width: 240, height: 72 },
      4,
    ),
    agent: paint(barSpec, { width: 480, height: 140 }, 0),
    email: paint(barSpec, { width: 460, height: 140 }, 1),
    readme: paint(line, { width: 460, height: 120 }, 2),
    reportA: paint(barSpec, { width: 220, height: 100 }, 0),
    reportB: paint(line, { width: 220, height: 100 }, 3),
  };
}

/** Gallery thumb. Real render. Stays on the blue gallery ramp. */
export function galleryThumb(type: string): string {
  const spec = docsSpecForType(type);
  delete spec.title;
  delete spec.subtitle;
  spec.theme = galleryTheme;
  spec.legend = false;
  if (type === "bar-list") spec.size = { width: 480, height: 200 };
  else if (type === "sparkline" || type === "mini-area") spec.size = { width: 480, height: 88 };
  else spec.size = { width: 480, height: 200 };
  const result = paintSpec(spec);
  if (!result.ok || !result.svg.includes("<svg") || result.svg.includes("ck-chart-error")) {
    throw new Error(`Gallery could not paint ${type}: ${result.footer}`);
  }
  if (result.svg.includes('class="ck-chart"')) return result.svg.replace('class="ck-chart"', 'class="ck-svg ck-chart"');
  return result.svg.replace("<svg ", '<svg class="ck-svg" ');
}
