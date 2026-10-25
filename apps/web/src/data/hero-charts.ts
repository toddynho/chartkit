/**
 * Hero carousel metadata. SVGs are painted from these types by `hero-slides.ts`.
 * Icons are the type-rail glyphs, not charts.
 */

export type HeroChartMeta = {
  id: string;
  label: string;
  /** Key for `specForType`. Area is a filled line. */
  type: string;
  delta: string;
  icon: string;
};

export const heroChartMeta: HeroChartMeta[] = [
  {
    id: "area",
    label: "Area",
    type: "area",
    delta: "Filled line · mark.area",
    icon: '<path d="M2 16 L6 12 L10 13 L14 7 L18 5 L22 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M2 16 L6 12 L10 13 L14 7 L18 5 L22 3 V18 H2 Z" fill="currentColor" opacity="0.2"/>',
  },
  {
    id: "line",
    label: "Line",
    type: "line",
    delta: "Example · three months",
    icon: '<path d="M2 14 L7 10 L12 12 L17 5 L22 7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="22" cy="7" r="1.6" fill="currentColor"/>',
  },
  {
    id: "bar",
    label: "Bar",
    type: "bar",
    delta: "Example · categories",
    icon: '<rect x="3" y="10" width="3.5" height="8" rx="0.8" fill="currentColor"/><rect x="9" y="6" width="3.5" height="12" rx="0.8" fill="currentColor"/><rect x="15" y="3" width="3.5" height="15" rx="0.8" fill="currentColor"/><rect x="21" y="8" width="3.5" height="10" rx="0.8" fill="currentColor" opacity="0.45"/>',
  },
  {
    id: "donut",
    label: "Donut",
    type: "donut",
    delta: "Example · shares",
    icon: '<circle cx="12" cy="11" r="7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="28 20" stroke-linecap="round" transform="rotate(-90 12 11)"/>',
  },
  {
    id: "combo",
    label: "Combo",
    type: "combo",
    delta: "Bars and a line",
    icon: '<rect x="3" y="9" width="3" height="9" rx="0.6" fill="currentColor" opacity="0.45"/><rect x="8" y="6" width="3" height="12" rx="0.6" fill="currentColor" opacity="0.45"/><rect x="13" y="4" width="3" height="14" rx="0.6" fill="currentColor" opacity="0.45"/><path d="M4 8 L9 11 L14 7 L19 9 L23 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  },
  {
    id: "gauge",
    label: "Gauge",
    type: "gauge",
    delta: "Value lives in metric",
    icon: '<path d="M4 15 A8 8 0 0 1 20 15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M12 15 L17 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  },
  {
    id: "heatmap",
    label: "Heatmap",
    type: "heatmap",
    delta: "Color is the measure",
    icon: '<rect x="3" y="3" width="4" height="4" rx="0.6" fill="currentColor" opacity="0.35"/><rect x="8" y="3" width="4" height="4" rx="0.6" fill="currentColor" opacity="0.55"/><rect x="13" y="3" width="4" height="4" rx="0.6" fill="currentColor" opacity="0.85"/><rect x="18" y="3" width="4" height="4" rx="0.6" fill="currentColor" opacity="0.45"/><rect x="3" y="8" width="4" height="4" rx="0.6" fill="currentColor" opacity="0.5"/><rect x="8" y="8" width="4" height="4" rx="0.6" fill="currentColor"/><rect x="13" y="8" width="4" height="4" rx="0.6" fill="currentColor" opacity="0.7"/><rect x="18" y="8" width="4" height="4" rx="0.6" fill="currentColor" opacity="0.3"/><rect x="3" y="13" width="4" height="4" rx="0.6" fill="currentColor" opacity="0.25"/><rect x="8" y="13" width="4" height="4" rx="0.6" fill="currentColor" opacity="0.6"/><rect x="13" y="13" width="4" height="4" rx="0.6" fill="currentColor" opacity="0.4"/><rect x="18" y="13" width="4" height="4" rx="0.6" fill="currentColor" opacity="0.75"/>',
  },
  {
    id: "candle",
    label: "Candle",
    type: "candlestick",
    delta: "Open, high, low, close",
    icon: '<line x1="6" y1="3" x2="6" y2="18" stroke="currentColor" stroke-width="1.2"/><rect x="4" y="7" width="4" height="7" rx="0.5" fill="currentColor"/><line x1="14" y1="4" x2="14" y2="17" stroke="currentColor" stroke-width="1.2"/><rect x="12" y="6" width="4" height="5" rx="0.5" fill="currentColor" opacity="0.4"/><line x1="22" y1="5" x2="22" y2="16" stroke="currentColor" stroke-width="1.2"/><rect x="20" y="8" width="4" height="6" rx="0.5" fill="currentColor"/>',
  },
  {
    id: "histogram",
    label: "Histogram",
    type: "histogram",
    delta: "One field, binned",
    icon: '<rect x="2" y="12" width="2.5" height="6" fill="currentColor" opacity="0.35"/><rect x="5.5" y="8" width="2.5" height="10" fill="currentColor" opacity="0.5"/><rect x="9" y="4" width="2.5" height="14" fill="currentColor"/><rect x="12.5" y="6" width="2.5" height="12" fill="currentColor" opacity="0.85"/><rect x="16" y="9" width="2.5" height="9" fill="currentColor" opacity="0.55"/><rect x="19.5" y="12" width="2.5" height="6" fill="currentColor" opacity="0.35"/>',
  },
  {
    id: "funnel",
    label: "Funnel",
    type: "funnel",
    delta: "Stages in order",
    icon: '<path d="M3 3 H21 L18 8 H6 Z" fill="currentColor" opacity="0.9"/><path d="M6 9 H18 L15.5 14 H8.5 Z" fill="currentColor" opacity="0.6"/><path d="M9 15 H15 L13.5 19 H10.5 Z" fill="currentColor" opacity="0.35"/>',
  },
  {
    id: "treemap",
    label: "Treemap",
    type: "treemap",
    delta: "Area is the value",
    icon: '<rect x="2" y="3" width="12" height="10" rx="1" fill="currentColor"/><rect x="15" y="3" width="7" height="5" rx="1" fill="currentColor" opacity="0.55"/><rect x="15" y="9" width="7" height="4" rx="1" fill="currentColor" opacity="0.35"/><rect x="2" y="14" width="7" height="4" rx="1" fill="currentColor" opacity="0.45"/><rect x="10" y="14" width="12" height="4" rx="1" fill="currentColor" opacity="0.25"/>',
  },
  {
    id: "sankey",
    label: "Sankey",
    type: "sankey",
    delta: "Source to target",
    icon: '<path d="M2 5 C10 5, 10 9, 18 9" fill="none" stroke="currentColor" stroke-width="2.2" opacity="0.7"/><path d="M2 12 C10 12, 10 9, 18 9" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.4"/><path d="M2 16 C10 16, 10 15, 18 15" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.3"/>',
  },
  {
    id: "radar",
    label: "Radar",
    type: "radar",
    delta: "One polygon per series",
    icon: '<polygon points="12,2 20,8 17,18 7,18 4,8" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.3"/>',
  },
  {
    id: "spark",
    label: "Spark",
    type: "sparkline",
    delta: "No axes",
    icon: '<path d="M2 14 L6 10 L10 12 L14 6 L18 8 L22 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="22" cy="4" r="1.5" fill="currentColor"/>',
  },
  {
    id: "waterfall",
    label: "Waterfall",
    type: "waterfall",
    delta: "Signed steps",
    icon: '<rect x="2" y="4" width="4" height="14" rx="0.6" fill="currentColor"/><rect x="8" y="8" width="4" height="6" rx="0.6" fill="currentColor" opacity="0.45"/><rect x="14" y="6" width="4" height="8" rx="0.6" fill="currentColor" opacity="0.7"/><rect x="20" y="10" width="4" height="8" rx="0.6" fill="currentColor"/>',
  },
];
