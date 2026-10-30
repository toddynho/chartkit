import { paintSpec } from "../lib/chartkit";

/**
 * Schema-valid bar spec shown on the homepage and rendered beside it.
 * Token count is o200k_base from gpt-tokenizer 3.4.0, counted on this exact string
 * (270). Line count is this string. The object parsed from it is what render() draws.
 */
export const howSpecText = `{
  "version": "1",
  "type": "bar",
  "data": [
    { "region": "NA", "revenue": 42 },
    { "region": "EU", "revenue": 31 },
    { "region": "UK", "revenue": 24 },
    { "region": "APAC", "revenue": 27 },
    { "region": "LATAM", "revenue": 12 },
    { "region": "MEA", "revenue": 9 },
    { "region": "ANZ", "revenue": 8 },
    { "region": "JP", "revenue": 14 }
  ],
  "encoding": {
    "x": "region",
    "y": { "field": "revenue", "format": { "style": "currency", "currency": "USD", "decimals": 0, "suffix": "M" } }
  },
  "sort": { "by": "value", "order": "descending" },
  "a11y": { "alt": "Q3 revenue by region, in millions of dollars. North America is highest at $42M." },
  "size": { "width": 520, "height": 220 }
}`;

/** o200k_base tokens of `howSpecText`, gpt-tokenizer 3.4.0. */
export const howSpecTokens = 270;

export const howSpecLines = howSpecText.split("\n").length;

export function howSpecRender(): { spec: Record<string, unknown>; svg: string } {
  const spec = JSON.parse(howSpecText) as Record<string, unknown>;
  const painted = paintSpec(spec);
  if (!painted.ok || !painted.svg.includes("<svg") || painted.svg.includes("ck-chart-error")) {
    throw new Error(`homepage spec did not render: ${painted.footer}`);
  }
  const svg = painted.svg.includes('class="ck-chart"')
    ? painted.svg.replace('class="ck-chart"', 'class="ck-svg ck-chart"')
    : painted.svg.replace("<svg ", '<svg class="ck-svg" ');
  return { spec, svg };
}
