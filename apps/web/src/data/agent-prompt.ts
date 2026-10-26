/** Homepage paste block. The chart stays a JavaScript library; the agent ships a spec. */
export const agentSwitchPrompt = `Switch the charts in this project to ChartKit.

ChartKit is a JavaScript library. Install @chartkitdev/core and the adapter for this framework (React, Vue, Svelte, or vanilla). Keep the rest of the app in JavaScript.

Replace hand-rolled chart implementation with a ChartSpec:
- version is "1"
- data is an array of rows
- encoding maps fields to axes
- a11y.alt is one factual sentence

Pass that spec to the chart component. Call validate(). repair() fixes the safe mistakes and does not call a model.`;
