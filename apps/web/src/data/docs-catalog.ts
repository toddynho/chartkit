import articlesJson from "./mock-articles.json";
import chartsJson from "./mock-charts.json";
import { chartTypes } from "./chart-types";
import { samples } from "./samples";
import type { PreviewSpec } from "../lib/preview-svg";

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
  family: "Core" | "Statistical" | "Planning" | "Library";
  title: string;
  lede: string;
  description: string;
  facts: ChartFact[];
  options: ChartOption[];
  anatomy: string[];
  notes: DocSection[];
};

export type ChipOption = { label: string; value: string };
export type ChipGroup = { label: string; key: string; options: ChipOption[] };

type NavLink = { href: string; label: string; hint?: string };
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
          "Install core, then the adapter for the framework you render in. `@chartkitdev/element` (`<chart-kit>`) and `@chartkitdev/geo` are in this repo and are not on npm yet. `@derpdaderp/chartkit` is a compatibility shim, not the package for a new app.",
        ],
        list: [],
        code: [
          "npm install @chartkitdev/core\nnpm install @chartkitdev/react\nnpm install @chartkitdev/vue\nnpm install @chartkitdev/svelte\nnpm install @chartkitdev/vanilla",
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
    lede: "React, Vue, Svelte, and vanilla DOM take the same spec. Adapters do not add a second chart API.",
    description: "Framework adapters pass one JSON spec through to core.",
    tryIntro: "",
    aliases: [],
    nav: false,
    sections: [
      {
        title: "Where to read",
        paragraphs: ["The docs nav splits each adapter into its own page."],
        list: [],
        code: [],
      },
    ],
  },
];

export const docArticles: DocArticle[] = [...fromMocks, ...extras];

export const chartDocs = chartsJson as ChartDoc[];

const chartById = new Map(chartDocs.map((chart) => [chart.type, chart]));

export function articleBySlug(slug: string): DocArticle | undefined {
  return docArticles.find((article) => article.slug === slug || article.aliases.includes(slug));
}

export function articleHref(article: DocArticle): string {
  return article.slug ? `/docs/${article.slug}` : "/docs";
}

/** Nav highlight for a URL, including legacy aliases such as `/docs/agents`. */
export function activeDocsHref(path: string): string {
  if (path === "/docs/reference/try") return path;
  if (path === "/docs/charts" || path.startsWith("/docs/charts/")) return path;
  const slug = path === "/docs" ? "" : path.startsWith("/docs/") ? path.slice("/docs/".length) : null;
  if (slug == null) return path;
  const article = articleBySlug(slug);
  return article ? articleHref(article) : path;
}

export function chartPage(type: string): ChartDoc {
  const known = chartById.get(type);
  if (known) return known;
  const fallback = chartTypes.find((chart) => chart.type === type);
  return {
    type,
    label: fallback?.title ?? type,
    family: "Library",
    title: fallback?.title ?? type,
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
          `\`type\` is \`${type}\`. The locked docs mock series covers Core, Statistical, and Planning. This type keeps its production URL and is not a separate group in the left nav.`,
        ],
        list: [],
        code: [],
      },
    ],
  };
}

const weekly = [
  { week: "W1", signups: 18 },
  { week: "W2", signups: 28 },
  { week: "W3", signups: 24 },
  { week: "W4", signups: 42 },
  { week: "W5", signups: 38 },
  { week: "W6", signups: 56 },
  { week: "W7", signups: 62 },
  { week: "W8", signups: 86 },
];

export function specForChart(chart: ChartDoc): PreviewSpec {
  const base = {
    version: "1",
    type: chart.type,
    title: chart.title,
    theme: "soft",
    data: weekly,
    encoding: { x: "week", y: "signups" },
    a11y: { alt: `${chart.title} example. Illustrative data, not a live metric.` },
  };
  if (chart.type === "line" || chart.type === "area" || chart.type === "mini-area" || chart.type === "sparkline") {
    return { ...base, smooth: true, markers: true, fill: chart.type === "area" || chart.type === "mini-area" };
  }
  if (chart.type === "donut" || chart.type === "pie") {
    return {
      version: "1",
      type: chart.type,
      title: chart.title,
      theme: "soft",
      legend: true,
      data: [
        { channel: "Organic", visits: 48 },
        { channel: "Paid", visits: 27 },
        { channel: "Direct", visits: 25 },
      ],
      encoding: { x: "channel", y: "visits" },
      a11y: { alt: `${chart.title} example with three shares.` },
    };
  }
  return { ...base, legend: true };
}

const themeChips: ChipGroup = {
  label: "Theme",
  key: "theme",
  options: [
    { label: "Soft", value: "soft" },
    { label: "Midnight", value: "midnight" },
  ],
};

export function chipsForChart(type: string): ChipGroup[] {
  if (type === "line" || type === "area" || type === "mini-area" || type === "sparkline") {
    return [
      themeChips,
      {
        label: "Curve",
        key: "smooth",
        options: [
          { label: "Smooth", value: "true" },
          { label: "Linear", value: "false" },
        ],
      },
      {
        label: "Markers",
        key: "markers",
        options: [
          { label: "On", value: "true" },
          { label: "Off", value: "false" },
        ],
      },
      {
        label: "Area fill",
        key: "fill",
        options: [
          { label: "On", value: "true" },
          { label: "Off", value: "false" },
        ],
      },
    ];
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

export const articleSpec: PreviewSpec = {
  ...samples.line,
  title: "Weekly signups",
  theme: "soft",
};

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

function links(items: { slug?: string; href?: string; label: string; hint?: string }[]): NavLink[] {
  return items.map((item) => ({
    href: item.href ?? (item.slug ? `/docs/${item.slug}` : "/docs"),
    label: item.label,
    hint: item.hint,
  }));
}

export const docsNav: NavGroup[] = [
  {
    label: "Start",
    blocks: [
      {
        label: "",
        items: links([
          { label: "Overview" },
          ...fromMocks.filter((article) => article.group === "Start" && article.slug).map((article) => ({
            slug: article.slug,
            label: article.title,
          })),
        ]),
      },
    ],
  },
  {
    label: "Concepts",
    blocks: [
      {
        label: "",
        items: links(
          fromMocks
            .filter((article) => article.group === "Concepts")
            .map((article) => ({ slug: article.slug, label: article.title })),
        ),
      },
    ],
  },
  {
    label: "Chart types",
    blocks: (["Core", "Statistical", "Planning"] as const).map((family) => ({
      label: family,
      items: chartDocs
        .filter((chart) => chart.family === family)
        .map((chart) => ({ href: `/docs/charts/${chart.type}`, label: chart.label })),
    })),
  },
  {
    label: "Reference",
    blocks: [
      {
        label: "",
        items: links(
          fromMocks
            .filter((article) => article.group === "Reference")
            .map((article) => ({
              slug: article.slug,
              label: article.title,
              hint: article.slug === "errors" ? "CK codes" : undefined,
            })),
        ),
      },
    ],
  },
  {
    label: "Agents",
    blocks: [
      {
        label: "",
        items: links(
          fromMocks
            .filter((article) => article.group === "Agents")
            .map((article) => ({ slug: article.slug, label: article.title === "llms.txt" ? "llms.txt" : article.title })),
        ),
      },
    ],
  },
];

export type Crumb = { href: string; label: string };

const sequence: Crumb[] = docsNav.flatMap((group) =>
  group.blocks.flatMap((block) => block.items.map((item) => ({ href: item.href, label: item.label }))),
);

export function neighbors(href: string): { prev?: Crumb; next?: Crumb } {
  const index = sequence.findIndex((item) => item.href === href);
  if (index < 0) return {};
  return { prev: sequence[index - 1], next: sequence[index + 1] };
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
  if (canonical === "/docs/charts") {
    return [
      { href: "/docs", label: "Docs" },
      { href: "", label: "Chart types" },
      { href: canonical, label: "All types" },
    ];
  }
  if (canonical.startsWith("/docs/charts/")) {
    const chart = chartPage(canonical.slice("/docs/charts/".length));
    return [
      { href: "/docs", label: "Docs" },
      { href: "/docs/charts", label: "Chart types" },
      { href: "", label: chart.family },
      { href: canonical, label: chart.label },
    ];
  }
  if (canonical === "/docs/reference/try") {
    return [
      { href: "/docs", label: "Docs" },
      { href: canonical, label: "Playground" },
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
