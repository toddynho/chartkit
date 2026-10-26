export type InlinePart = string | { code: string } | { href: string; label: string };

export type Block =
  | { type: "p"; parts: InlinePart[] }
  | { type: "ul"; items: InlinePart[][] }
  | { type: "code"; label: string; code: string }
  | { type: "links"; items: { href: string; label: string }[] };

export type DocPage = {
  slug: string;
  title: string;
  description: string;
  lede: string;
  /** Absolute URL for this topic, when one exists. */
  current?: string;
  blocks: Block[];
};

const install = `npm install @chartkitdev/core
npm install @chartkitdev/react
npm install @chartkitdev/vue
npm install @chartkitdev/svelte
npm install @chartkitdev/vanilla`;

export const docPages: DocPage[] = [
  {
    slug: "install",
    title: "Install",
    description: "Install ChartKit core and the framework adapters from npm.",
    lede: "Core has no runtime dependencies. Each adapter depends on core and its framework.",
    current: "https://chartkit.dev/docs",
    blocks: [
      { type: "code", label: "shell", code: install },
      {
        type: "ul",
        items: [
          [
            { code: "@chartkitdev/element" },
            " (",
            { code: "<chart-kit>" },
            ") is in this repo and is not on npm yet.",
          ],
          [{ code: "@chartkitdev/geo" }, " is in this repo and is not on npm. There is no tile layer."],
          [
            { code: "@derpdaderp/chartkit" },
            " is a compatibility shim and is not the package to install for a new app.",
          ],
        ],
      },
      {
        type: "p",
        parts: [
          "A page that only needs one chart can build a renderer with ",
          { code: "createRenderer" },
          " instead of importing every chart from ",
          { code: "@chartkitdev/core/all" },
          ".",
        ],
      },
    ],
  },
  {
    slug: "concepts",
    title: "Concepts",
    description: "The spec, the adapters, and the themes.",
    lede: "The spec is the interface. Adapters only draw it. Theme tokens restyle every chart that shares it.",
    blocks: [
      {
        type: "links",
        items: [
          { href: "/docs/concepts/spec", label: "The spec" },
          { href: "/docs/concepts/adapters", label: "Adapters" },
          { href: "/docs/concepts/themes", label: "Themes" },
        ],
      },
    ],
  },
  {
    slug: "concepts/spec",
    title: "The spec",
    description: "ChartKit v1 is one JSON object. The chart type, the rows, and the encodings live there.",
    lede: "Version is \"1\". The chart type goes in type. An agent that can write this object can write a chart.",
    current: "https://chartkit.dev/docs/spec",
    blocks: [
      {
        type: "ul",
        items: [
          [{ code: "a11y.alt" }, " is one sentence and is required."],
          [
            { code: "data" },
            " is an array of row objects, not ",
            { code: "{ values: [...] }" },
            ". Sparkline, mini-area, and spike may use a number array.",
          ],
          [{ code: "mark" }, " is an options object, not a string."],
          ["Gauge, KPI, and progress ring put the number in ", { code: "metric" }, "."],
          ["Donut uses ", { code: "encoding.x" }, " for the slice label and ", { code: "encoding.y" }, " for the value."],
          [
            "A list of fields goes on ",
            { code: "encoding.y" },
            ". On a combo, bar, line, and area go in ",
            { code: "mark" },
            ", not in ",
            { code: "type" },
            ".",
          ],
        ],
      },
      {
        type: "p",
        parts: [
          "The editable shell for this object is on ",
          { href: "/docs/reference/try", label: "Try it" },
          ". It does not render yet.",
        ],
      },
    ],
  },
  {
    slug: "concepts/adapters",
    title: "Adapters",
    description: "React, Vue, Svelte, vanilla DOM, and a custom element all take the same spec.",
    lede: "None of the adapters add chart logic. Pass a renderer built with createRenderer when a page should ship one chart instead of every chart.",
    current: "https://chartkit.dev/docs",
    blocks: [
      {
        type: "ul",
        items: [
          ["React: ", { code: "Chart" }, " from ", { code: "@chartkitdev/react" }, " takes ", { code: "spec" }, "."],
          ["Vue: the same component, bound as ", { code: ":spec" }, ". SSR uses ", { code: "renderToString" }, " from ", { code: "@chartkitdev/vue/ssr" }, "."],
          ["Svelte: ", { code: "export let spec" }, ", so Svelte 4 and 5 both compile it. SvelteKit SSR includes the SVG."],
          [
            "Vanilla: ",
            { code: "mount" },
            " writes the SVG into an element you already have. ",
            { code: "update" },
            " skips the DOM write when the SVG is unchanged. ",
            { code: "destroy" },
            " clears it.",
          ],
          [
            "Dashboard components in ",
            { code: "@chartkitdev/react" },
            " (",
            { code: "LineChart" },
            ", ",
            { code: "KpiCard" },
            ", and the rest) take their own props. Those props are not spec keys.",
          ],
        ],
      },
    ],
  },
  {
    slug: "concepts/themes",
    title: "Themes",
    description: "Soft is the default look. The plot is transparent. A gray card is opt-in.",
    lede: "Omit theme, or set auto or soft. Colours follow the page scheme. Refined, editorial, and midnight are built in.",
    current: "https://chartkit.dev/docs/theming",
    blocks: [
      {
        type: "p",
        parts: [
          "The optional card is ",
          { code: "#f5f5f7" },
          " in light and ",
          { code: "#1c1c1e" },
          " in dark. Set ",
          { code: "--ck-background" },
          " or wrap the chart. Painting that rectangle inside the SVG covers the page, so the built-in plot fill stays transparent.",
        ],
      },
      {
        type: "p",
        parts: [
          "Other presets are opt-in imports from ",
          { code: "@chartkitdev/core/themes/<name>" },
          ". A brand palette stays out of the default bundle.",
        ],
      },
    ],
  },
  {
    slug: "reference",
    title: "Reference",
    description: "The spec reference, the try-it rail, and validate().",
    lede: "Try it edits a spec. Validate and repair report CK codes and a JSON Patch.",
    blocks: [
      {
        type: "links",
        items: [
          { href: "/docs/reference/try", label: "Try it" },
          { href: "/docs/reference/validate", label: "Validate and repair" },
          { href: "/docs/concepts/spec", label: "The spec" },
        ],
      },
    ],
  },
  {
    slug: "reference/validate",
    title: "Validate and repair",
    description: "validate() reports CK codes. repair() returns a spec and a JSON Patch, with no model call.",
    lede: "validate() reports CK codes. repair() returns a spec and a JSON Patch, with no model call.",
    blocks: [
      {
        type: "p",
        parts: [
          { code: "validate" },
          " and ",
          { code: "repair" },
          " come from ",
          { code: "@chartkitdev/core/validate" },
          ". Cloud ",
          { code: "POST /render" },
          " and ",
          { code: "POST /validate" },
          " return the same warnings and the repaired spec. The ",
          { href: "/docs/reference/try", label: "try-it rail" },
          " runs validate() and render() in the page. It does not call Cloud.",
        ],
      },
    ],
  },
  {
    slug: "agents",
    title: "The agent loop",
    description: "The spec is the agent interface. Docs in the prompt, then repair() when the spec is wrong.",
    lede: "With the docs in the prompt, a measured run wrote a valid chart on 42 of 42 tasks, at a mean of 132.4 output tokens. repair() took a no-docs run from 21/42 to 42/42 with no model call.",
    current: "https://chartkit.dev/agents",
    blocks: [
      {
        type: "p",
        parts: [
          "That measurement is round 6, 2026-10-16. It was not re-run for round 13. Losses for the other benchmarks stay in the table. ",
          { href: "https://chartkit.dev/benchmarks#agents", label: "Benchmarks, losses included" },
          ".",
        ],
      },
      {
        type: "links",
        items: [
          { href: "/docs/agents/llms", label: "llms.txt" },
          { href: "/docs/agents/mcp", label: "MCP" },
          { href: "/docs/reference/validate", label: "Validate and repair" },
        ],
      },
    ],
  },
  {
    slug: "agents/mcp",
    title: "MCP",
    description: "The ChartKit MCP server exposes chart tools, including render_chart, to an agent.",
    lede: "@chartkitdev/mcp is not on npm yet. The server speaks stdio. render_chart is the tool that calls Cloud.",
    current: "https://chartkit.dev/docs/mcp",
    blocks: [
      {
        type: "p",
        parts: [
          "Tool names and install steps are on ",
          { href: "/docs/mcp", label: "MCP" },
          ". Cloud renders from an agent use the same spec as the library.",
        ],
      },
    ],
  },
  {
    slug: "agents/llms",
    title: "llms.txt",
    description: "The prompt file agents read. This site serves it at /llms.txt.",
    lede: "llms.txt is the short context. llms-full.txt is the long one. Both are files in catalog/public.",
    current: "https://chartkit.dev/llms.txt",
    blocks: [
      {
        type: "ul",
        items: [
          [{ href: "/llms.txt", label: "llms.txt" }],
          [{ href: "/llms-full.txt", label: "llms-full.txt" }],
          [{ href: "/schema/v1.json", label: "schema/v1.json" }],
        ],
      },
      {
        type: "p",
        parts: ["This app serves those files at /llms.txt, /llms-full.txt, and /schema/v1.json."],
      },
    ],
  },
];

export function docPageBySlug(slug: string): DocPage | undefined {
  return docPages.find((page) => page.slug === slug);
}
