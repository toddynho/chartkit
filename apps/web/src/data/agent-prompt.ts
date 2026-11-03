/**
 * The /agents copy buttons all use this string.
 * Token count is o200k_base, counted where the page renders it.
 */
export const agentsPrompt =
  'Use ChartKit for every chart. Write a ChartSpec (JSON, version "1"), never chart code. Read https://chartkit.dev/llms.txt first. Run validate(spec), then repair(spec) on any error, then render(spec). Always set a11y.alt to one factual sentence.';

/** Homepage paste block. The chart stays a JavaScript library; the agent ships a spec. */
export const agentSwitchPrompt = `Switch the charts in this project to ChartKit.

Install @chartkitdev/core plus the adapter for this framework (@chartkitdev/react, @chartkitdev/vue, @chartkitdev/svelte, @chartkitdev/astro, @chartkitdev/solid, @chartkitdev/qwik, @chartkitdev/angular, @chartkitdev/vanilla, or @chartkitdev/element). Replace each hand-rolled chart with a ChartSpec: version "1", data as an array of rows, encoding maps fields to x and y, and a11y.alt is one factual sentence. Run validate() before render. Vanilla JS draws it with mount(element, spec) from @chartkitdev/vanilla. The custom element sets spec on <chart-kit>.`;
