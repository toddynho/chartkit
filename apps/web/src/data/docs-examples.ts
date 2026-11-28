/**
 * Examples printed on /docs/markdown, /docs/render, /docs/llms-txt, and /docs/scales.
 * The pages print these strings and draw these specs. docs-examples.test.ts runs the
 * scripts and renders the specs, so an example that stops working fails CI.
 * This file has no imports, so Node can load it without the site bundler.
 */

export type DocScript = {
  /** File name the reader saves the snippet as. */
  file: string;
  code: string;
  /** Files the script writes. The test asserts each one holds an SVG. */
  writes: string[];
};

export type DocSpecExample = {
  id: string;
  /** Page the spec is printed on. */
  page: "markdown" | "render" | "scales";
  spec: Record<string, unknown>;
};

/** JSON with each flat object (a data row, an encoding) on one line, so a spec stays short on the page. */
export function specText(value: unknown, depth = 0): string {
  const pad = "  ".repeat(depth);
  const inner = "  ".repeat(depth + 1);
  const flat = (item: unknown) => typeof item !== "object" || item === null;
  if (Array.isArray(value)) {
    if (value.every(flat)) return `[${value.map((item) => JSON.stringify(item)).join(", ")}]`;
    return `[\n${value.map((item) => `${inner}${specText(item, depth + 1)}`).join(",\n")}\n${pad}]`;
  }
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    const inline = depth > 0 && entries.every(([, item]) => flat(item) || (Array.isArray(item) && item.every(flat)));
    const parts = entries.map(([key, item]) => `${JSON.stringify(key)}: ${inline ? specText(item, depth) : specText(item, depth + 1)}`);
    if (inline) return `{ ${parts.join(", ")} }`;
    return `{\n${parts.map((part) => `${inner}${part}`).join(",\n")}\n${pad}}`;
  }
  return JSON.stringify(value);
}

/* ------------------------------------------------------------------ */
/* /docs/markdown                                                      */
/* ------------------------------------------------------------------ */

export const markdownInstall = "npm install @chartkitdev/markdown unified remark-parse remark-rehype rehype-stringify";

export const fenceSpec: Record<string, unknown> = {
  version: "1",
  type: "bar",
  title: "Orders by weekday",
  data: [
    { day: "Mon", orders: 12 },
    { day: "Tue", orders: 18 },
    { day: "Wed", orders: 15 },
    { day: "Thu", orders: 22 },
    { day: "Fri", orders: 30 },
  ],
  encoding: { x: "day", y: "orders" },
  a11y: { alt: "Orders rise from 12 on Monday to 30 on Friday." },
};

const FENCE = "```";

/** The Markdown file the pipelines read. One chartkit fence. */
export const markdownPost = `# Weekly orders

${FENCE}chartkit
${specText(fenceSpec)}
${FENCE}
`;

export const remarkScript: DocScript = {
  file: "build.mjs",
  writes: ["post.html"],
  code: `import { readFileSync, writeFileSync } from "node:fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { remarkChartkit } from "@chartkitdev/markdown";

const html = await unified()
  .use(remarkParse)
  .use(remarkChartkit)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })
  .process(readFileSync("post.md", "utf8"));

writeFileSync("post.html", String(html));
`,
};

export const rehypeScript: DocScript = {
  file: "build-rehype.mjs",
  writes: ["post.html"],
  code: `import { readFileSync, writeFileSync } from "node:fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { rehypeChartkit } from "@chartkitdev/markdown";

const html = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeChartkit)
  .use(rehypeStringify, { allowDangerousHtml: true })
  .process(readFileSync("post.md", "utf8"));

writeFileSync("post.html", String(html));
`,
};

export const renderFenceScript: DocScript = {
  file: "fence.mjs",
  writes: ["fence.svg"],
  code: `import { writeFileSync } from "node:fs";
import { renderFence } from "@chartkitdev/markdown";

const source = JSON.stringify({
  version: "1",
  type: "bar",
  data: [
    { day: "Mon", orders: 12 },
    { day: "Tue", orders: 18 },
  ],
  encoding: { x: "day", y: "orders" },
  a11y: { alt: "Orders rise from 12 on Monday to 18 on Tuesday." },
});

// The SVG string, or null when the fence should stay as source.
const svg = renderFence(source, "chartkit");
if (svg) writeFileSync("fence.svg", svg);

console.log(renderFence("flowchart TD\\n  A --> B", "mermaid")); // null
`,
};

export const astroInstall = "npm install @chartkitdev/markdown @astrojs/markdown-remark";

export const astroConfig = `import { defineConfig } from "astro/config";
import { remarkChartkit } from "@chartkitdev/markdown";

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkChartkit],
  },
});
`;

export const mermaidPieSource = `pie
    title Share of workshop hours
    "Design": 42
    "Build": 35
    "Review": 23`;

export const mermaidFence = `${FENCE}mermaid
${mermaidPieSource}
${FENCE}
`;

export const mermaidOff = `.use(remarkChartkit, { mermaid: false })`;

/**
 * Mermaid diagram keywords the markdown package converts, with a source that draws.
 * The test renders each one through renderFence and checks the chart type.
 */
export const mermaidKinds: { keyword: string; draws: string; note: string; source: string }[] = [
  {
    keyword: "xychart-beta",
    draws: "bar",
    note: "`xychart` and `xychart-beta`. Bars, lines, or both. Bars and a line together are a combo chart.",
    source: `xychart-beta\n    title "Weekly orders"\n    x-axis [Mon, Tue, Wed]\n    y-axis "Orders"\n    bar [12, 18, 15]`,
  },
  { keyword: "pie", draws: "pie", note: "`pie`, including `showData`.", source: `pie\n    "Design": 42\n    "Build": 35` },
  { keyword: "sankey-beta", draws: "sankey", note: "`sankey-beta` CSV rows.", source: `sankey-beta\nSolar,Grid,10\nWind,Grid,5` },
  {
    keyword: "radar-beta",
    draws: "radar",
    note: "`radar-beta`.",
    source: `radar-beta\n  axis a["Speed"], b["Range"], c["Cost"]\n  curve x["Model X"]{1,2,3}`,
  },
  { keyword: "treemap-beta", draws: "treemap", note: "`treemap-beta`.", source: `treemap-beta\n"Root"\n    "Docs": 10\n    "Code": 20` },
  {
    keyword: "quadrantChart",
    draws: "quadrant",
    note: "`quadrantChart`.",
    source: `quadrantChart\n  x-axis Low --> High\n  y-axis Low --> High\n  Alpha: [0.3, 0.6]\n  Beta: [0.7, 0.2]`,
  },
  {
    keyword: "gantt",
    draws: "gantt",
    note: "`gantt`.",
    source: `gantt\n  dateFormat YYYY-MM-DD\n  section Build\n  Draft :a1, 2026-01-01, 5d\n  Review :after a1, 3d`,
  },
  { keyword: "timeline", draws: "timeline", note: "`timeline`.", source: `timeline\n  2021 : Start\n  2022 : Launch` },
  { keyword: "journey", draws: "journey", note: "`journey`.", source: `journey\n  section Morning\n    Wake: 3: Me\n    Work: 5: Me` },
  { keyword: "venn-beta", draws: "venn", note: "`venn-beta`, two or three sets.", source: `venn-beta\n  set A\n  set B\n  union A,B` },
];

/** Mermaid diagrams that are not charts. renderFence returns null for each. */
export const mermaidUnsupported: { name: string; source: string }[] = [
  { name: "flowchart", source: "flowchart TD\n  A --> B" },
  { name: "sequenceDiagram", source: "sequenceDiagram\n  Alice->>Bob: Hello" },
  { name: "classDiagram", source: "classDiagram\n  Animal <|-- Duck" },
  { name: "stateDiagram-v2", source: "stateDiagram-v2\n  [*] --> Idle" },
  { name: "erDiagram", source: "erDiagram\n  CUSTOMER ||--o{ ORDER : places" },
];

/* ------------------------------------------------------------------ */
/* /docs/render                                                        */
/* ------------------------------------------------------------------ */

export const renderInstall = "npm install @chartkitdev/core";

export const renderSpec: Record<string, unknown> = {
  version: "1",
  type: "line",
  title: "Weekly signups",
  data: [
    { week: "W1", signups: 120 },
    { week: "W2", signups: 180 },
    { week: "W3", signups: 150 },
    { week: "W4", signups: 240 },
  ],
  encoding: { x: "week", y: "signups" },
  a11y: { alt: "Signups rise from 120 in week 1 to 240 in week 4." },
};

/** A spec as a JavaScript object literal, so the script reads like code. */
function literal(value: unknown, depth = 0): string {
  const pad = "  ".repeat(depth);
  const inner = "  ".repeat(depth + 1);
  if (Array.isArray(value)) {
    const flat = value.every((item) => typeof item !== "object" || item === null);
    if (flat) return `[${value.map((item) => JSON.stringify(item)).join(", ")}]`;
    return `[\n${value.map((item) => `${inner}${literal(item, depth + 1)},`).join("\n")}\n${pad}]`;
  }
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    const flat = entries.every(([, item]) => typeof item !== "object" || item === null);
    const parts = entries.map(([key, item]) => `${key}: ${flat ? JSON.stringify(item) : literal(item, depth + 1)}`);
    if (flat) return `{ ${parts.join(", ")} }`;
    return `{\n${parts.map((part) => `${inner}${part},`).join("\n")}\n${pad}}`;
  }
  return JSON.stringify(value);
}

export const renderScript: DocScript = {
  file: "render.mjs",
  writes: ["chart.svg"],
  code: `import { writeFileSync } from "node:fs";
import { render } from "@chartkitdev/core/all";

const spec = ${literal(renderSpec)};

const svg = render(spec);
writeFileSync("chart.svg", svg);
`,
};

export const renderRun = "node render.mjs";

export const extraScript: DocScript = {
  file: "render-extra.mjs",
  writes: ["histogram.svg"],
  code: `import { writeFileSync } from "node:fs";
import { render } from "@chartkitdev/core/extra";

const svg = render({
  version: "1",
  type: "histogram",
  data: [{ ms: 212 }, { ms: 238 }, { ms: 225 }, { ms: 251 }, { ms: 229 }, { ms: 305 }],
  encoding: { x: "ms" },
  a11y: { alt: "Most responses take between 200 and 260 milliseconds." },
});

writeFileSync("histogram.svg", svg);
`,
};

export const oneChartScript: DocScript = {
  file: "render-line.mjs",
  writes: ["line.svg"],
  code: `import { writeFileSync } from "node:fs";
import { createRenderer } from "@chartkitdev/core";
import { line } from "@chartkitdev/core/charts/line";

const render = createRenderer([line]);

const svg = render({
  version: "1",
  type: "line",
  data: [
    { week: "W1", signups: 120 },
    { week: "W2", signups: 180 },
    { week: "W3", signups: 150 },
  ],
  encoding: { x: "week", y: "signups" },
  a11y: { alt: "Signups go from 120 to 180, then 150." },
});

writeFileSync("line.svg", svg);
`,
};

export const featuresImport = `import "@chartkitdev/core/features";`;

export const ssrInstall = "npm install @chartkitdev/vanilla";

export const ssrScript: DocScript = {
  file: "render-ssr.mjs",
  writes: ["ssr.svg"],
  code: `import { writeFileSync } from "node:fs";
import { renderToString } from "@chartkitdev/vanilla/ssr";

const svg = renderToString({
  version: "1",
  type: "bar",
  data: [
    { plan: "Free", teams: 320 },
    { plan: "Pro", teams: 140 },
  ],
  encoding: { x: "plan", y: "teams" },
  a11y: { alt: "Free has 320 teams and Pro has 140." },
});

writeFileSync("ssr.svg", svg);
`,
};

/** The draft the repair example starts from: no a11y.alt, and a curve name that does not exist. */
export const repairDraft: Record<string, unknown> = {
  version: "1",
  type: "line",
  data: [
    { week: "W1", signups: 120 },
    { week: "W2", signups: 180 },
    { week: "W3", signups: 150 },
  ],
  encoding: { x: "week", y: "signups" },
  mark: { curve: "smooth" },
};

export const repairScript: DocScript = {
  file: "render-checked.mjs",
  writes: ["checked.svg"],
  code: `import { writeFileSync } from "node:fs";
import { render } from "@chartkitdev/core/all";
import { repair, validate } from "@chartkitdev/core/validate";

const draft = ${literal(repairDraft)};

const checked = validate(draft);
for (const error of checked.errors) console.log(error.code, error.path, error.message);

const fixed = repair(draft);
console.log(fixed.applied);

if (fixed.ok) {
  writeFileSync("checked.svg", render(fixed.spec));
} else {
  for (const error of fixed.errors) console.error(error.code, error.path, error.message);
  process.exitCode = 1;
}
`,
};

export const repairOutput = `CK1004 /a11y a11y.alt is required
CK1007 /mark/curve "smooth" is not one of "linear", "monotone", "step", "step-before", "step-after"
[
  { op: 'add', path: '/a11y', value: { alt: 'Line chart of signups by week.' } },
  { op: 'replace', path: '/mark/curve', value: 'monotone' }
]`;

export const errorCheck = `const svg = render(spec);
if (svg.includes("ck-chart-error")) throw new Error("ChartKit could not draw this spec");`;

/* ------------------------------------------------------------------ */
/* /docs/llms-txt                                                      */
/* ------------------------------------------------------------------ */

export const llmsFiles: { path: string; url: string; what: string }[] = [
  {
    path: "/llms.txt",
    url: "https://chartkit.dev/llms.txt",
    what: "The short file. The spec rules and one small working spec for most chart types. It stays under 6,400 bytes so it fits in a system prompt.",
  },
  {
    path: "/llms-full.txt",
    url: "https://chartkit.dev/llms-full.txt",
    what: "The long file. The same rules in full sentences, the import lines, every option that is easy to get wrong, and a working spec per chart type.",
  },
  {
    path: "/llms.json",
    url: "https://chartkit.dev/llms.json",
    what: "Machine-readable facts: the package names, the schema URL, the import lines for render, validate, and repair, the theme names, and links to the other two files.",
  },
];

export const llmsFetch = `curl -o chartkit-llms.txt https://chartkit.dev/llms.txt`;

export const llmsSystemPrompt = `Charts in this project use ChartKit. Before you write a chart, read https://chartkit.dev/llms.txt.
Write a ChartSpec (JSON, version "1"), not chart code. Set a11y.alt to one factual sentence.
Run validate(spec) from @chartkitdev/core/validate. On an error, run repair(spec), then render the repaired spec.`;

export const llmsClaudeMd = `## Charts

Charts use ChartKit (@chartkitdev/core). A chart is a JSON spec, not chart code.

- Read https://chartkit.dev/llms.txt before writing a spec. The long version is https://chartkit.dev/llms-full.txt.
- Every spec has version "1", a type, data as an array of rows, encoding, and a11y.alt.
- Run validate() from @chartkitdev/core/validate. If it returns errors, run repair() and use the spec it returns.
`;

export const llmsCursorRules = `Charts use ChartKit (@chartkitdev/core). Write a JSON ChartSpec, not chart code.
Read https://chartkit.dev/llms.txt before writing a spec.
Every spec needs version "1", type, data (an array of rows), encoding, and a11y.alt.
Run validate() from @chartkitdev/core/validate, then repair() on any error.
`;

export const llmsVendored = `Read ./chartkit-llms.txt before writing a chart spec.`;

/* ------------------------------------------------------------------ */
/* /docs/scales                                                        */
/* ------------------------------------------------------------------ */

const growth = [
  { year: "2021", users: 120 },
  { year: "2022", users: 1400 },
  { year: "2023", users: 16000 },
  { year: "2024", users: 210000 },
];

const latency = [
  { hour: "09:00", ms: 212 },
  { hour: "10:00", ms: 238 },
  { hour: "11:00", ms: 225 },
  { hour: "12:00", ms: 251 },
];

export const scaleSpecs = {
  linear: {
    version: "1",
    type: "line",
    title: "Users, linear scale",
    data: growth,
    encoding: { x: "year", y: "users" },
    a11y: { alt: "Users grow from 120 in 2021 to 210,000 in 2024. On a linear axis the first three years sit on the baseline." },
  },
  log: {
    version: "1",
    type: "line",
    title: "Users, log scale",
    data: growth,
    encoding: { x: "year", y: { field: "users", scale: { type: "log" } } },
    a11y: { alt: "Users grow from 120 in 2021 to 210,000 in 2024. On a log axis each year is about ten times the last." },
  },
  time: {
    version: "1",
    type: "line",
    title: "Deploys per day",
    data: [
      { day: "2026-01-01", deploys: 10 },
      { day: "2026-01-02", deploys: 14 },
      { day: "2026-01-03", deploys: 12 },
      { day: "2026-03-01", deploys: 30 },
    ],
    encoding: { x: "day", y: "deploys" },
    a11y: { alt: "Deploys go from 10 on January 1 to 30 on March 1, with no rows between January 3 and March 1." },
  },
  category: {
    version: "1",
    type: "line",
    title: "Deploys per release",
    data: [
      { release: "1.0", deploys: 10 },
      { release: "1.1", deploys: 14 },
      { release: "1.2", deploys: 12 },
      { release: "2.0", deploys: 30 },
    ],
    encoding: { x: "release", y: "deploys" },
    a11y: { alt: "Deploys go from 10 at release 1.0 to 30 at release 2.0." },
  },
  auto: {
    version: "1",
    type: "line",
    title: "Response time, automatic domain",
    data: latency,
    encoding: { x: "hour", y: "ms" },
    a11y: { alt: "Response time moves between 212 and 251 milliseconds from 09:00 to 12:00." },
  },
  fromZero: {
    version: "1",
    type: "line",
    title: "Response time, domain from zero",
    data: latency,
    encoding: { x: "hour", y: { field: "ms", scale: { domain: [0, null] } } },
    a11y: { alt: "Response time stays between 212 and 251 milliseconds, drawn on an axis that starts at zero." },
  },
  fixed: {
    version: "1",
    type: "line",
    title: "Response time, fixed domain",
    data: latency,
    encoding: { x: "hour", y: { field: "ms", scale: { domain: [200, 300] } } },
    a11y: { alt: "Response time stays between 212 and 251 milliseconds on an axis fixed from 200 to 300." },
  },
  exact: {
    version: "1",
    type: "line",
    title: "Response time, nice off",
    data: latency,
    encoding: { x: "hour", y: { field: "ms", scale: { nice: false } } },
    a11y: { alt: "Response time moves between 212 and 251 milliseconds, and the axis ends at those two values." },
  },
  reversed: {
    version: "1",
    type: "line",
    title: "Search rank, reversed",
    data: [
      { week: "W1", rank: 14 },
      { week: "W2", rank: 9 },
      { week: "W3", rank: 6 },
      { week: "W4", rank: 3 },
    ],
    encoding: { x: "week", y: { field: "rank", scale: { reverse: true } } },
    a11y: { alt: "Search rank improves from 14 in week 1 to 3 in week 4. Rank 1 is at the top." },
  },
} satisfies Record<string, Record<string, unknown>>;

export const fieldTypeSnippet = `"encoding": {
  "x": { "field": "day", "type": "temporal" },
  "y": { "field": "deploys", "type": "quantitative" }
}`;

/** Every spec the four pages print, for the render test. */
export const docSpecExamples: DocSpecExample[] = [
  { id: "markdown-fence", page: "markdown", spec: fenceSpec },
  { id: "render-line", page: "render", spec: renderSpec },
  ...Object.entries(scaleSpecs).map(([id, spec]) => ({ id: `scales-${id}`, page: "scales" as const, spec })),
];

/** Every Node script the pages print, with the page it is on. */
export const docScripts: { page: "markdown" | "render"; script: DocScript }[] = [
  { page: "markdown", script: remarkScript },
  { page: "markdown", script: rehypeScript },
  { page: "markdown", script: renderFenceScript },
  { page: "render", script: renderScript },
  { page: "render", script: extraScript },
  { page: "render", script: oneChartScript },
  { page: "render", script: ssrScript },
  { page: "render", script: repairScript },
];
