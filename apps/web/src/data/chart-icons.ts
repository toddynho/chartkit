/**
 * Chart glyphs for the docs rail.
 * Homepage hero icons are reused where a type already has one.
 * Extra glyphs follow that same 24×20, currentColor family.
 */
import { heroChartMeta } from "./hero-charts";

const fromHero = new Map(heroChartMeta.map((chart) => [chart.type, chart.icon]));

const extra: Record<string, string> = {
  scatter:
    '<circle cx="6" cy="14" r="1.6" fill="currentColor"/><circle cx="11" cy="8" r="1.6" fill="currentColor"/><circle cx="16" cy="12" r="1.6" fill="currentColor" opacity="0.7"/><circle cx="20" cy="5" r="1.6" fill="currentColor" opacity="0.45"/>',
  pie: '<circle cx="12" cy="10" r="7" fill="currentColor" opacity="0.28"/><path d="M12 10 L12 3 A7 7 0 0 1 18.6 13.2 Z" fill="currentColor"/>',
  kpi: '<rect x="3" y="3" width="11" height="3.2" rx="0.7" fill="currentColor"/><path d="M3 16 L8 12 L12 13 L17 8 L21 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  "mini-area":
    '<path d="M3 15 L7 12 L11 13 L15 8 L19 6 L22 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M3 15 L7 12 L11 13 L15 8 L19 6 L22 5 V17 H3 Z" fill="currentColor" opacity="0.2"/>',
  "progress-ring":
    '<circle cx="12" cy="10" r="6.2" fill="none" stroke="currentColor" stroke-width="2.3" opacity="0.25"/><circle cx="12" cy="10" r="6.2" fill="none" stroke="currentColor" stroke-width="2.3" stroke-dasharray="24 18" stroke-linecap="round" transform="rotate(-90 12 10)"/>',
  spike:
    '<path d="M4 16 V9 M8 16 V4 M12 16 V11 M16 16 V6 M20 16 V13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  boxplot:
    '<line x1="4" y1="10" x2="20" y2="10" stroke="currentColor" stroke-width="1.2"/><line x1="4" y1="7.5" x2="4" y2="12.5" stroke="currentColor" stroke-width="1.3"/><line x1="20" y1="7.5" x2="20" y2="12.5" stroke="currentColor" stroke-width="1.3"/><rect x="8" y="6" width="8" height="8" rx="0.7" fill="none" stroke="currentColor" stroke-width="1.4"/><line x1="12" y1="6" x2="12" y2="14" stroke="currentColor" stroke-width="1.4"/>',
  bullet:
    '<rect x="2" y="7" width="20" height="6" rx="1" fill="currentColor" opacity="0.18"/><rect x="2" y="7" width="12" height="6" rx="1" fill="currentColor" opacity="0.8"/><line x1="16.5" y1="5" x2="16.5" y2="15" stroke="currentColor" stroke-width="1.5"/>',
  gantt:
    '<rect x="3" y="3" width="12" height="3.2" rx="0.7" fill="currentColor"/><rect x="7" y="8.4" width="14" height="3.2" rx="0.7" fill="currentColor" opacity="0.62"/><rect x="5" y="13.8" width="8" height="3.2" rx="0.7" fill="currentColor" opacity="0.38"/>',
  timeline:
    '<line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" stroke-width="1.3"/><circle cx="6" cy="10" r="1.7" fill="currentColor"/><circle cx="12" cy="10" r="1.7" fill="currentColor" opacity="0.7"/><circle cx="18" cy="10" r="1.7" fill="currentColor" opacity="0.42"/>',
  quadrant:
    '<rect x="3" y="3" width="18" height="14" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.3"/><line x1="12" y1="3" x2="12" y2="17" stroke="currentColor" stroke-width="1"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="1"/><circle cx="16" cy="6.5" r="1.4" fill="currentColor"/>',
  venn: '<circle cx="9.2" cy="10" r="5.4" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="1.3"/><circle cx="14.8" cy="10" r="5.4" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="1.3"/>',
  journey:
    '<circle cx="4" cy="14" r="1.7" fill="currentColor"/><circle cx="12" cy="8" r="1.7" fill="currentColor" opacity="0.72"/><circle cx="20" cy="5" r="1.7" fill="currentColor" opacity="0.45"/><path d="M5.6 13.1 L10.4 8.9 M13.6 7.5 L18.4 5.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  "stacked-area":
    '<path d="M2 15 L7 11 L12 12 L17 8 L22 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M2 18 L7 15 L12 16 L17 13 L22 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.55"/>',
  "area-range":
    '<path d="M2 7 C8 3, 14 9, 22 5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M2 14 C8 10, 14 16, 22 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  "bar-range":
    '<path d="M5 15 V7 M12 16 V4 M19 13 V8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  errorbar:
    '<path d="M6 4 V16 M3.5 4 H8.5 M3.5 16 H8.5 M16 6 V15 M13.5 6 H18.5 M13.5 15 H18.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="6" cy="10" r="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="16" cy="10.5" r="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  "radial-bar":
    '<path d="M12 4 A8 8 0 0 1 20 12 M12 7 A5 5 0 0 1 17 12 M12 10 A2 2 0 0 1 14 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  rose:
    '<path d="M12 12 L12 3 A9 9 0 0 1 19.5 8 Z M12 12 L19.5 8 A9 9 0 0 1 16 18 Z M12 12 L16 18 A9 9 0 0 1 6 16 Z" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>',
  sunburst:
    '<circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" stroke-width="1.35"/><circle cx="12" cy="10" r="6.4" fill="none" stroke="currentColor" stroke-width="1.35"/><path d="M12 3.6 V16.4 M5.6 10 H18.4" fill="none" stroke="currentColor" stroke-width="1.15"/>',
  "bar-list":
    '<path d="M3 5 H18 M3 10 H14 M3 15 H9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
};

const fallback = '<circle cx="12" cy="10" r="2.1" fill="currentColor"/>';

/** Inner SVG for a chart type. Same family as the homepage type rail. */
export function chartIcon(type: string): string {
  return fromHero.get(type) ?? extra[type] ?? fallback;
}

export const mapIcon =
  '<path d="M3 5.2 L8 3.2 L14 6.2 L21 4.2 V15.2 L14 17.2 L8 14.2 L3 16.2 Z" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M8 3.2 V14.2 M14 6.2 V17.2" stroke="currentColor" stroke-width="1.15"/>';
