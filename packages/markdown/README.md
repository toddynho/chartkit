# @chartkitdev/markdown

remark and rehype plugins that render a `chartkit` fence, and a supported Mermaid chart fence, to SVG. The SVG comes from `@chartkitdev/core`. This package does not draw charts itself.

```bash
npm install @chartkitdev/markdown
```

```js
import { rehypeChartkit, remarkChartkit, renderFence } from "@chartkitdev/markdown";

const svg = renderFence(source, "chartkit");
```

`remarkChartkit` replaces a `chartkit` or supported `mermaid` code node with an HTML node of the SVG. remark-rehype needs `allowDangerousHtml`. `rehypeChartkit` replaces the matching `pre` with a raw SVG node. A flowchart and any other unsupported Mermaid diagram stay as source. Mermaid `click` and `href` lines are dropped, not written as links.
