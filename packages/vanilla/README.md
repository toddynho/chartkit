# @chartkitdev/vanilla

Mount a ChartKit JSON spec into an element you already have. The SVG comes from `@chartkitdev/core`. There is no framework and no extra wrapper node.

```bash
npm install @chartkitdev/vanilla
```

```js
import { mount, renderToString } from "@chartkitdev/vanilla";

const spec = {
  version: "1",
  type: "line",
  data: [
    { quarter: "Q1", units: 40 },
    { quarter: "Q2", units: 55 },
  ],
  encoding: { x: "quarter", y: "units" },
  a11y: { alt: "Units rose from Q1 to Q2." },
};

const chart = mount(document.querySelector("#chart"), spec);
chart.update(nextSpec);
chart.destroy();
```

`update` keeps the same element. It skips the DOM write when the new SVG matches the current one. `destroy` clears the element, and later updates do nothing. `renderToString(spec)` is the SVG string core returns, for a server that writes HTML.

Pass `{ render }` from `createRenderer([...])` to ship one chart type instead of every chart.
