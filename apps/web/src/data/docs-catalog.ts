import { SITE } from "./site";
import articlesJson from "./mock-articles.json";
import chartsJson from "./mock-charts.json";
import { articleSections } from "./article-copy";
import { withTruth } from "./chart-truth";
import { chartTypes } from "./chart-types";
import { heroTypes } from "./hero-catalog";
import schemaJson from "../../../../packages/core/schema/chartkit.schema.json";
import { docsSpecForType, trySamples, type LiveSpec } from "./live-specs";

export type DocSection = {
  title: string;
  paragraphs: string[];
  list: string[];
  code: string[];
};

export type DocArticle = {
  slug: string;
  group: "Start" | "Concepts" | "Reference" | "Agents" | "Legacy";
  title: string;
  lede: string;
  description: string;
  tryIntro: string;
  sections: DocSection[];
  aliases: string[];
  nav?: boolean;
};

export type ChartFact = { k: string; v: string };
export type ChartOption = { path: string; role: string; status: string };

export type ChartDoc = {
  type: string;
  label: string;
  family: "Core" | "Statistical" | "Planning" | "Library" | "Geo";
  title: string;
  lede: string;
  description: string;
  facts: ChartFact[];
  options: ChartOption[];
  anatomy: string[];
  notes: DocSection[];
};

export type ChipOption = { label: string; value: string; swatch?: string };
export type ChipGroup = { label: string; key: string; options: ChipOption[] };

type NavLink = { href: string; label: string; hint?: string; quiet?: boolean };
export type NavBlock = { label: string; items: NavLink[] };
export type NavGroup = { label: string; blocks: NavBlock[] };

const fromMocks = articlesJson as DocArticle[];

const extras: DocArticle[] = [
  {
    slug: "install",
    group: "Legacy",
    title: "Install",
    lede: "Core has no runtime dependencies. Each adapter depends on core and its framework.",
    description: "Install ChartKit core and the framework adapters from npm.",
    tryIntro: "",
    aliases: [],
    nav: false,
    sections: [
      {
        title: "Packages",
        paragraphs: [
          "Install core, then the adapter for the framework you render in. `@chartkitdev/element` is `<chart-kit>`. `@chartkitdev/geo` is maps and is not part of the line or all bundles. `@derpdaderp/chartkit` is a compatibility shim, not the package for a new app.",
        ],
        list: [],
        code: [
          "npm install @chartkitdev/core\nnpm install @chartkitdev/react\nnpm install @chartkitdev/vue\nnpm install @chartkitdev/svelte\nnpm install @chartkitdev/astro\nnpm install @chartkitdev/solid\nnpm install @chartkitdev/qwik\nnpm install @chartkitdev/angular\nnpm install @chartkitdev/vanilla\nnpm install @chartkitdev/element\nnpm install @chartkitdev/markdown\nnpm install @chartkitdev/geo\nnpm install @chartkitdev/mcp",
        ],
      },
      {
        title: "One chart",
        paragraphs: [
          "A page that only needs one chart can build a renderer with `createRenderer` instead of importing every chart from `@chartkitdev/core/all`.",
        ],
        list: [],
        code: [],
      },
    ],
  },
  {
    slug: "concepts/adapters",
    group: "Legacy",
    title: "Adapters",
    lede: "React, Vue, Svelte, Astro, Solid, Qwik, Angular, and vanilla DOM take the same spec. Adapters do not add a second chart API.",
    description: "Framework adapters pass one JSON spec through to core.",
    tryIntro: "",
    aliases: [],
    nav: false,
    sections: [
      {
        title: "Where to read",
        paragraphs: [
          "The Show code for menu picks React, Vue, Svelte, Astro, Solid, Qwik, Angular, or JS. /docs/react, /docs/solid, and the other stack URLs open Overview with that framework selected.",
        ],
        list: [],
        code: [],
      },
      {
        title: "Other hosts",
        paragraphs: [
          "Preact aliases react and react-dom to preact/compat, then uses @chartkitdev/react. Next.js App Router and Remix or React Router use that same component. Nuxt uses @chartkitdev/vue. SvelteKit uses @chartkitdev/svelte and already includes the SVG during SSR. htmx and Eleventy print renderToString from @chartkitdev/vanilla. When an htmx swap should take pointers, use <chart-kit> from @chartkitdev/element, or call mount().",
        ],
        list: [],
        code: [
          'resolve: {\n  alias: {\n    react: "preact/compat",\n    "react-dom": "preact/compat",\n  },\n}',
          'import { renderToString } from "react-dom/server";\nimport { Chart } from "@chartkitdev/react";\n\nconst html = renderToString(<Chart spec={spec} />);',
          'import { renderToString } from "@chartkitdev/vue/ssr";\n\nconst html = await renderToString(spec);',
          '<script>\n  import { Chart } from "@chartkitdev/svelte";\n</script>\n\n<Chart {spec} />',
          'import { renderToString } from "@chartkitdev/vanilla";\n\nconst svg = renderToString(spec);\neleventyConfig.addShortcode("chart", (spec) => renderToString(spec));',
        ],
      },
    ],
  },
];

const honestLedes: Record<string, string> = {
  "": `ChartKit ${SITE.version} is a JSON spec plus @chartkitdev/core. Core has zero dependencies. It validates the spec and renders SVG. Adapters pass that spec through. They do not add chart logic.`,
  react: "Pass spec to Chart. The same JSON renders in the other adapters. LineChart, KpiCard, and the other dashboard components still exist. Their props are not spec keys.",
  vue: "Vue 3 binds the spec with :spec. Server rendering uses renderToString from @chartkitdev/vue/ssr.",
  svelte: "The component uses export let, so Svelte 4 and Svelte 5 both compile it. SvelteKit SSR includes the SVG.",
  vanilla: "mount writes the SVG into an element you already have. update keeps that element. renderToString is the SVG string from core.",
  markdown: "A chartkit fence is a v1 spec. The markdown package renders it with core. It does not invent a second chart language.",
  "spec-anatomy": "The schema is https://chartkit.dev/schema/v1.json. validate() checks the schema and the data. render() does not validate. Unknown types return an error SVG and do not throw.",
  "themes-tokens": "Soft is the default. Omit theme, or set auto or soft. refined and editorial are built in. midnight is the opt-in dark card. Other names need @chartkitdev/core/themes/all, which this site's renderer loads. Hosts override tokens with --ck-*.",
  themes: "Chips on this site: soft, refined, midnight, and emerald. Soft is the default. Emerald and the other named presets resolve because the renderer imports @chartkitdev/core/all.",
  options: "Paths are schema fields: mark.curve, mark.points, mark.area, axes.x.title. mark.markers and mark.fill are not fields. soft, refined, editorial, and midnight are real theme names.",
  errors: "Codes are stable: CK1xxx structure, CK2xxx data, CK3xxx semantics, CK4xxx design. CK1001 is invalid JSON. This rail shows those codes and does not draw a chart when validate() fails.",
  validate: "validate() returns every diagnostic in one pass. repair() applies the safe JSON Patch fixes and does not mutate the input. render() does not validate.",
  repair: "repair() applies the safe JSON Patch on each error and revalidates. It does not invent data. A missing or unknown type is reported first.",
  render: "render() from @chartkitdev/core/all draws the core charts. @chartkitdev/core/extra adds histogram through rose and the planning charts. render() does not validate and does not throw.",
  "llms-txt": "/llms.txt is the short agent index: the rules, the repair loop, and one spec per chart type. /llms-full.txt is the long file. This site serves both.",
  data: "data is an array of row objects, not { \"values\": [...] }. Sparkline, mini-area, and spike may use a number array. Wide tables may use columns.",
  encoding: "encoding binds field names to channels. x is the category or time. y is the measure. The same names work across chart types.",
  scales: "A scale maps values to position. It lives on encoding, not on the axis. Set it only to override the inferred type.",
  axes: "axes is titles, ticks, format, grid, and side. Domain and scale type stay on encoding.",
  bundles: "@chartkitdev/core/all is the core set. @chartkitdev/core/extra adds histogram through the planning charts. createRenderer keeps a page to the charts you pass.",
  mcp: "npx -y @chartkitdev/mcp starts the server. It speaks stdio and calls validate, repair, and render in-process. render_chart is the one tool that calls Cloud.",
};

function scrubText(value: string): string {
  return value
    .replaceAll(/mock-plausible\s*/gi, "")
    .replaceAll("mark.markers", "mark.points")
    .replaceAll(/mark\.fill(?![A-Za-z])/g, "mark.area")
    .replaceAll("axis.x.label", "axes.x.title")
    .replaceAll("axis.y.label", "axes.y.title")
    .replaceAll("Soft = docs mock accent.", "")
    .replaceAll(
      "Soft in docs mocks is an accent shorthand — schema Soft = built-in `soft`.",
      '`theme: "soft"` is the built-in Soft preset, the same as omitting theme.',
    )
    .replaceAll(/\s{2,}/g, " ")
    .trim();
}

function presentArticle(article: DocArticle): DocArticle {
  const lede = honestLedes[article.slug] ?? scrubText(article.lede);
  const written = articleSections[article.slug];
  const sections = written
    ? written
    : article.sections.map((section) => ({
        title: scrubText(section.title),
        paragraphs: section.paragraphs.map(scrubText).filter(Boolean),
        list: section.list.map(scrubText).filter(Boolean),
        code: section.code.map(scrubText),
      }));
  return {
    ...article,
    lede,
    description: lede.slice(0, 180),
    tryIntro: written ? "" : scrubText(article.tryIntro),
    sections,
  };
}

export const docArticles: DocArticle[] = [...fromMocks, ...extras].map(presentArticle);

export const chartDocs = chartsJson as ChartDoc[];

const chartById = new Map(chartDocs.map((chart) => [chart.type, chart]));

export function articleBySlug(slug: string): DocArticle | undefined {
  return docArticles.find((article) => article.slug === slug || article.aliases.includes(slug));
}

/** Canonical doc URL. Alias slugs redirect; they are not pages. */
export function articleHref(article: DocArticle): string {
  if (article.slug === "themes" || article.slug === "themes-tokens") return "/docs/theming";
  if (article.slug === "spec-anatomy") return "/docs/concepts/spec";
  return article.slug ? `/docs/${article.slug}` : "/docs";
}

/** Nav highlight for a URL, including legacy aliases such as `/docs/agents`. */
export function activeDocsHref(path: string): string {
  if (path.startsWith("/docs/charts/")) return path;
  const slug = path === "/docs" ? "" : path.startsWith("/docs/") ? path.slice("/docs/".length) : null;
  if (slug == null) return path;
  const article = articleBySlug(slug);
  return article ? articleHref(article) : path;
}

export function chartPage(type: string): ChartDoc {
  const known = chartById.get(type);
  if (known) return withTruth(known);
  const fallback = chartTypes.find((chart) => chart.type === type);
  const geoLabel = type === "choropleth" ? "Choropleth" : type === "map-points" ? "Map points" : "";
  return withTruth({
    type,
    label: geoLabel || fallback?.title || type,
    family: geoLabel ? "Geo" : "Library",
    title: geoLabel || fallback?.title || type,
    lede: fallback?.summary ?? "A ChartKit chart type.",
    description: fallback?.summary ?? "A ChartKit chart type.",
    facts: [
      { k: "Import", v: `@chartkitdev/core` },
      { k: "Status", v: "in the library" },
    ],
    options: [],
    anatomy: [],
    notes: [
      {
        title: "This URL",
        paragraphs: [
          `\`type\` is \`${type}\`. The left nav lists Core, Statistical, and Planning. This type keeps its production URL and is not a separate group there.`,
        ],
        list: [],
        code: [],
      },
    ],
  });
}

export function specForChart(chart: ChartDoc): LiveSpec {
  return docsSpecForType(chart.type);
}

const themeChips: ChipGroup = {
  label: "Theme",
  key: "theme",
  options: [
    { label: "Soft", value: "soft", swatch: "#0a63e6" },
    { label: "Refined", value: "refined", swatch: "#17181a" },
    { label: "Midnight", value: "midnight", swatch: "#9ecbff" },
    { label: "Emerald", value: "emerald", swatch: "#137333" },
  ],
};

const lineChips: ChipGroup[] = [
  themeChips,
  {
    label: "Curve",
    key: "mark.curve",
    options: [
      { label: "Smooth", value: "monotone" },
      { label: "Linear", value: "linear" },
    ],
  },
  {
    label: "Points",
    key: "mark.points",
    options: [
      { label: "On", value: "always" },
      { label: "Off", value: "none" },
    ],
  },
  {
    label: "Area fill",
    key: "mark.area",
    options: [
      { label: "On", value: "true" },
      { label: "Off", value: "false" },
    ],
  },
];

export function chipsForChart(type: string): ChipGroup[] {
  if (type === "line" || type === "area") return lineChips;
  if (type === "gauge" || type === "kpi" || type === "progress-ring" || type === "sparkline" || type === "mini-area") {
    return [themeChips];
  }
  return [
    themeChips,
    {
      label: "Legend",
      key: "legend",
      options: [
        { label: "On", value: "true" },
        { label: "Off", value: "false" },
      ],
    },
  ];
}

/** Overview try-it. Short on purpose so the rail is not an 80-point scribble. */
export const articleSpec: LiveSpec = trySamples.line;

export const articleChips: ChipGroup[] = [
  themeChips,
  {
    label: "Chart",
    key: "type",
    options: [
      { label: "Line", value: "line" },
      { label: "Bar", value: "bar" },
      { label: "Donut", value: "donut" },
    ],
  },
];

const catalogTypes = new Set(chartDocs.map((chart) => chart.type));

/**
 * Chart types the library accepts. Schema enum plus the deferred types listed
 * beside it in packages/core/src/walker.ts (planning charts and the two geo types).
 * Atlas files (world, US, cities) are examples of those types, not extra types.
 */
const DEFERRED_TYPES = ["gantt", "timeline", "quadrant", "venn", "journey", "choropleth", "map-points"] as const;
const schemaTypes = (schemaJson as { properties: { type: { enum: string[] } } }).properties.type.enum;
export const registryChartTypes = [...new Set([...schemaTypes, ...DEFERRED_TYPES])];

const heroIds = heroTypes.map((chart) => chart.type).sort();
const registryIds = [...registryChartTypes].sort();
if (heroIds.join() !== registryIds.join()) {
  throw new Error(`Chart registry has ${registryIds.length} types; the hero catalog has ${heroIds.length}.`);
}

/** One card per registry type. This is the gallery count. */
export const galleryChartCount = registryChartTypes.length;

/** Docs chart pages: registry types, plus the filled-line note at `/docs/charts/area`. */
export const chartPageTypes = [...new Set([...chartTypes.map((chart) => chart.type), ...chartDocs.map((chart) => chart.type), ...registryChartTypes])];

export type SidebarChartLink = { type: string; href: string; label: string };

const SIDEBAR_FAMILIES = ["Core", "Statistical", "Planning", "Library", "Geo"] as const;

function sidebarFamily(type: string): (typeof SIDEBAR_FAMILIES)[number] {
  if (type === "choropleth" || type === "map-points") return "Geo";
  const family = chartById.get(type)?.family;
  if (family === "Core" || family === "Statistical" || family === "Planning") return family;
  return "Library";
}

function sidebarLabel(type: string, heroLabel: string): string {
  if (type === "map-points") return "Map points";
  return chartById.get(type)?.label ?? chartTypes.find((chart) => chart.type === type)?.title ?? heroLabel;
}

function sidebarHref(type: string): string {
  return `/docs/charts/${type}`;
}

/** Chart types in the hero catalog, grouped the way the docs families read. */
export const sidebarChartGroups: { label: string; items: SidebarChartLink[] }[] = SIDEBAR_FAMILIES.flatMap((label) => {
  const items = heroTypes
    .filter((chart) => sidebarFamily(chart.type) === label)
    .map((chart) => ({ type: chart.type, href: sidebarHref(chart.type), label: sidebarLabel(chart.type, chart.label) }));
  return items.length ? [{ label, items }] : [];
});

export const sidebarChartCount = sidebarChartGroups.reduce((total, group) => total + group.items.length, 0);

if (sidebarChartCount !== heroTypes.length) {
  throw new Error(`Sidebar lists ${sidebarChartCount} chart types; the hero registry has ${heroTypes.length}.`);
}

/** Rows shown before the fade and the "Show all" control. */
export const sidebarChartPreview = 5;

const conceptArticles = fromMocks.filter((article) => article.group === "Concepts");
const specSlugs = new Set(["spec-anatomy", "data", "encoding", "scales", "axes"]);

export const docsNav: NavGroup[] = [
  {
    label: "Start",
    blocks: [
      {
        label: "Start",
        items: [
          { href: "/docs", label: "Overview" },
          { href: "/playground", label: "Playground" },
          { href: "/gallery", label: "Gallery" },
          { href: "/docs/markdown", label: "MD fences" },
          { href: "/docs/install", label: "Install notes" },
          { href: "/docs/migrate", label: "Upgrading from v0" },
        ],
      },
      {
        label: "Charts",
        items: [
          ...sidebarChartGroups.flatMap((group) => group.items).slice(0, sidebarChartPreview).map((item) => ({
            href: item.href,
            label: item.label,
          })),
          { href: "/gallery", label: "Gallery" },
        ],
      },
      {
        label: "Agents",
        items: [
          { href: "/docs/validate", label: "Validate" },
          { href: "/docs/repair", label: "Repair" },
          { href: "/docs/render", label: "Render" },
          { href: "/docs/llms-txt", label: "llms.txt" },
          { href: "/docs/mcp", label: "MCP" },
        ],
      },
    ],
  },
  {
    label: "Concepts",
    blocks: [
      {
        label: "Spec",
        items: conceptArticles
          .filter((article) => specSlugs.has(article.slug))
          .map((article) => ({ href: articleHref(article), label: article.title })),
      },
      {
        label: "Rendering",
        items: [
          ...conceptArticles
            .filter((article) => !specSlugs.has(article.slug) && article.slug !== "themes-tokens")
            .map((article) => ({ href: articleHref(article), label: article.title })),
          { href: "/docs/concepts/interaction", label: "Interaction" },
          { href: "/docs/concepts/layouts", label: "Layouts" },
          { href: "/docs/concepts/large-data", label: "Large data" },
          { href: "/docs/theming", label: "Theming" },
          { href: "/docs/themes/tape", label: "Tape" },
          { href: "/docs/themes/kite", label: "Kite" },
          { href: "/docs/themes/mustard", label: "Mustard" },
          { href: "/docs/themes/violet", label: "Violet" },
          { href: "/docs/themes/from-brand", label: "From a brand" },
          { href: "/docs/themes/from-drawing", label: "From a drawing" },
          { href: "/docs/motion", label: "Motion" },
          { href: "/race", label: "Line chart race" },
          { href: "/race?type=odds", label: "Odds replay" },
          { href: "/docs/mermaid", label: "Mermaid" },
          { href: "/docs/web-component", label: "Web component" },
          { href: "/docs/spec", label: "Spec" },
          { href: "/docs/cloud", label: "Cloud render" },
        ],
      },
    ],
  },
  {
    label: "Lookup",
    blocks: [
      {
        label: "Reference",
        items: [
          ...fromMocks
            .filter((article) => article.group === "Reference" && article.slug !== "themes")
            .map((article) => ({
              href: articleHref(article),
              label: article.title,
              hint: article.slug === "errors" ? "CK codes" : undefined,
            })),
          { href: "/schema/v1.json", label: "Schema v1" },
          { href: "/docs/concepts/adapters", label: "Adapters" },
        ],
      },
    ],
  },
];

export type Crumb = { href: string; label: string };

const sequence: Crumb[] = docsNav.flatMap((group) =>
  group.blocks.flatMap((block) => block.items.map((item) => ({ href: item.href, label: item.label }))),
);

const chartCrumbs: Crumb[] = [
  ...(["Core", "Statistical", "Planning"] as const).flatMap((family) =>
    chartDocs.filter((chart) => chart.family === family).map((chart) => ({ href: `/docs/charts/${chart.type}`, label: chart.label })),
  ),
  ...chartTypes
    .filter((chart) => !catalogTypes.has(chart.type))
    .map((chart) => ({ href: `/docs/charts/${chart.type}`, label: chart.title })),
];

export function neighbors(href: string): { prev?: Crumb; next?: Crumb } {
  const index = sequence.findIndex((item) => item.href === href);
  if (index >= 0) return { prev: sequence[index - 1], next: sequence[index + 1] };
  const chartIndex = chartCrumbs.findIndex((item) => item.href === href);
  if (chartIndex >= 0) {
    return {
      prev: chartCrumbs[chartIndex - 1] ?? { href: "/gallery", label: "Gallery" },
      next: chartCrumbs[chartIndex + 1],
    };
  }
  return {};
}

export function crumbsFor(href: string): Crumb[] {
  const canonical = activeDocsHref(href);
  for (const group of docsNav) {
    for (const block of group.blocks) {
      const item = block.items.find((link) => link.href === canonical);
      if (!item) continue;
      const trail: Crumb[] = [{ href: "/docs", label: "Docs" }];
      if (!(group.label === "Start" && item.href === "/docs")) trail.push({ href: "", label: group.label });
      if (block.label) trail.push({ href: "", label: block.label });
      trail.push({ href: canonical, label: item.label });
      return trail;
    }
  }
  if (canonical.startsWith("/docs/charts/")) {
    const chart = chartPage(canonical.slice("/docs/charts/".length));
    return [
      { href: "/docs", label: "Docs" },
      { href: "/gallery", label: "Gallery" },
      { href: "", label: chart.family },
      { href: canonical, label: chart.label },
    ];
  }
  const slug = canonical === "/docs" ? "" : canonical.startsWith("/docs/") ? canonical.slice("/docs/".length) : "";
  const article = canonical.startsWith("/docs") ? articleBySlug(slug) : undefined;
  if (article) {
    return [
      { href: "/docs", label: "Docs" },
      { href: articleHref(article), label: article.title },
    ];
  }
  return [
    { href: "/docs", label: "Docs" },
    { href: canonical, label: "Docs" },
  ];
}

export const agentHrefs = [
  "/docs/validate",
  "/docs/repair",
  "/docs/render",
  "/docs/llms-txt",
  "/docs/mcp",
  "/docs/agents",
];

export function isAgentPath(path: string): boolean {
  return agentHrefs.some((href) => path === href || path.startsWith(`${href}/`));
}
