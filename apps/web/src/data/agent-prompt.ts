/** Homepage paste block. The chart stays a JavaScript library; the agent ships a spec. */
export const agentSwitchPrompt = `Switch the charts in this project to ChartKit.

Install @chartkitdev/core plus the adapter for this framework (@chartkitdev/react, @chartkitdev/vue, @chartkitdev/svelte, @chartkitdev/vanilla, or @chartkitdev/element). Replace each hand-rolled chart with a ChartSpec: version "1", data as an array of rows, encoding maps fields to x and y, and a11y.alt is one factual sentence. Run validate() before render. Vanilla JS draws it with mount(element, spec) from @chartkitdev/vanilla. The custom element sets spec on <chart-kit>.`;
