import { paintSpec } from "../lib/chartkit";

/**
 * Schema-valid bar spec shown on the homepage and rendered beside it.
 * Token count is o200k_base from gpt-tokenizer 3.4.0, counted on this exact string
 * (102). Line count is this string. The object parsed from it is what render() draws.
 */
export const howSpecText = `{
"version":"1",
"type":"bar",
"data":{"columns":{
"region":["NA","EU","UK","APAC","LATAM","MEA","ANZ","JP"],
"revenue":[42,31,24,27,12,9,8,14]}},
"encoding":{"x":"region","y":{"field":"revenue","format":{"style":"currency","suffix":"M"}}},
"sort":{"order":"descending"},
"a11y":{"alt":"NA leads Q3."}
}`;

/** o200k_base tokens of `howSpecText`, gpt-tokenizer 3.4.0. */
export const howSpecTokens = 102;

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
