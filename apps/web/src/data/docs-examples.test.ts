/**
 * The examples on /docs/markdown, /docs/render, /docs/llms-txt, and /docs/scales work.
 *
 * Each Node script the pages print is run as written, in a temporary directory, with
 * `@chartkitdev/*` resolved to this workspace's source (the remark and rehype packages
 * come from node_modules). Each spec validates with zero errors and renders. The
 * "Show all N types" count equals the chart pages that are chart types.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  astroConfig,
  docScripts,
  docSpecExamples,
  fenceSpec,
  llmsClaudeMd,
  llmsCursorRules,
  llmsFiles,
  llmsSystemPrompt,
  markdownPost,
  mermaidFence,
  mermaidKinds,
  mermaidPieSource,
  mermaidUnsupported,
  repairDraft,
  repairOutput,
  scaleSpecs,
} from "./docs-examples.ts";

const root = fileURLToPath(new URL("../../../../", import.meta.url));

/** Package entries the printed snippets import, mapped to workspace source. */
const SOURCE: Record<string, string> = {
  "@chartkitdev/markdown": "packages/markdown/src/index.ts",
  "@chartkitdev/vanilla/ssr": "packages/vanilla/src/ssr.ts",
  "@chartkitdev/core": "packages/core/src/index.ts",
  "@chartkitdev/core/all": "packages/core/src/all.ts",
  "@chartkitdev/core/extra": "packages/core/src/extra.ts",
  "@chartkitdev/core/features": "packages/core/src/features.ts",
  "@chartkitdev/core/validate": "packages/core/src/validate.ts",
  "@chartkitdev/core/mermaid": "packages/core/src/mermaid.ts",
  "@chartkitdev/core/mermaid/phase4": "packages/core/src/mermaid-phase4.ts",
  "@chartkitdev/core/charts/line": "packages/core/src/charts/line.ts",
};

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

async function bundle(entry: string, outfile: string): Promise<void> {
  const { build } = await import("esbuild");
  await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
    nodePaths: [join(root, "node_modules")],
    banner: { js: 'import { createRequire as __ckRequire } from "node:module"; const require = __ckRequire(import.meta.url);' },
    plugins: [
      {
        name: "chartkit-source",
        setup(build) {
          build.onResolve({ filter: /^@chartkitdev\// }, (args) => {
            const source = SOURCE[args.path];
            if (!source) return { errors: [{ text: `docs-examples.test.ts has no source mapping for ${args.path}` }] };
            return { path: join(root, source) };
          });
        },
      },
    ],
  });
}

type Diagnostic = { code: string; path: string; message: string };
type Runtime = {
  validate: (spec: unknown) => { ok: boolean; errors: Diagnostic[] };
  repair: (spec: unknown) => { ok: boolean; spec: unknown; applied: { op: string; path: string; value?: unknown }[]; errors: Diagnostic[] };
  render: (spec: unknown) => string;
  renderFence: (source: string, lang: string, options?: { mermaid?: boolean }) => string | null;
};

async function loadRuntime(): Promise<Runtime> {
  const dir = mkdtempSync(join(tmpdir(), "ck-docs-rt-"));
  const entry = join(dir, "entry.ts");
  writeFileSync(
    entry,
    [
      `export { validate, repair } from "@chartkitdev/core/validate";`,
      `export { render } from "@chartkitdev/core/extra";`,
      `export { renderFence } from "@chartkitdev/markdown";`,
    ].join("\n"),
  );
  const outfile = join(dir, "runtime.mjs");
  await bundle(entry, outfile);
  return import(pathToFileURL(outfile).href) as Promise<Runtime>;
}

const runtime = await loadRuntime();

function isChart(svg: string, type?: string): void {
  assert.match(svg, /<svg[\s>]/);
  assert.equal(svg.includes("ck-chart-error"), false, "the output is the error card");
  if (type) assert.ok(svg.includes(`data-ck-type="${type}"`), `expected a ${type} chart`);
}

/** Run one printed script as written. Returns the directory it ran in and what it printed. */
async function runScript(file: string, code: string, files: Record<string, string> = {}): Promise<{ dir: string; stdout: string }> {
  const dir = mkdtempSync(join(tmpdir(), "ck-docs-run-"));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  const entry = join(dir, file);
  writeFileSync(entry, code);
  const outfile = join(dir, `bundled-${file}`);
  await bundle(entry, outfile);
  const stdout = execFileSync(process.execPath, [outfile], { cwd: dir, encoding: "utf8" });
  return { dir, stdout };
}

test("the /docs/markdown fence is the spec the page draws", () => {
  const match = markdownPost.match(/```chartkit\n([\s\S]*?)\n```/);
  assert.ok(match, "post.md has a chartkit fence");
  assert.deepEqual(JSON.parse(match[1]), fenceSpec);
  const svg = runtime.renderFence(match[1], "chartkit");
  assert.ok(svg);
  isChart(svg, "bar");
  for (const row of fenceSpec.data as { day: string }[]) assert.ok(svg.includes(`>${row.day}<`), `${row.day} is a full tick label`);
});

test("the /docs/markdown remark and rehype pipelines turn post.md into HTML with an SVG", async () => {
  for (const { page, script } of docScripts) {
    if (page !== "markdown" || !script.writes.includes("post.html")) continue;
    const { dir } = await runScript(script.file, script.code, { "post.md": `${markdownPost}\n${mermaidFence}\n\`\`\`mermaid\nflowchart TD\n  A --> B\n\`\`\`\n` });
    const html = readFileSync(join(dir, "post.html"), "utf8");
    assert.match(html, /<h1>Weekly orders<\/h1>/, script.file);
    isChart(html, "bar");
    assert.ok(html.includes('data-ck-type="pie"'), `${script.file} converts the Mermaid pie`);
    assert.equal(html.includes("&#x3C;svg"), false, `${script.file} prints the SVG, not escaped text`);
    assert.equal(html.includes("language-chartkit"), false, `${script.file} leaves no chartkit code block`);
    assert.match(html, /<pre><code class="language-mermaid">flowchart TD/, `${script.file} leaves the flowchart as a code block`);
    assert.equal((html.match(/<svg[\s>]/g) ?? []).length, 2);
  }
});

test("remark-rehype without allowDangerousHtml drops the chart, as the page says", async () => {
  const remark = docScripts.find(({ script }) => script.file === "build.mjs")?.script;
  assert.ok(remark);
  assert.equal((remark.code.match(/allowDangerousHtml: true/g) ?? []).length, 2);
  const dropped = remark.code.replace(".use(remarkRehype, { allowDangerousHtml: true })", ".use(remarkRehype)");
  assert.notEqual(dropped, remark.code);
  const first = await runScript("dropped.mjs", dropped, { "post.md": markdownPost });
  assert.equal(readFileSync(join(first.dir, "post.html"), "utf8").includes("svg"), false);
  const escaped = remark.code.replace(".use(rehypeStringify, { allowDangerousHtml: true })", ".use(rehypeStringify)");
  assert.notEqual(escaped, remark.code);
  const second = await runScript("escaped.mjs", escaped, { "post.md": markdownPost });
  const html = readFileSync(join(second.dir, "post.html"), "utf8");
  assert.ok(html.includes("&#x3C;svg"));
  assert.equal(html.includes("<svg"), false);
});

test("every other printed script runs and writes an SVG", async () => {
  for (const { script } of docScripts) {
    if (script.writes.includes("post.html")) continue;
    const { dir, stdout } = await runScript(script.file, script.code);
    for (const name of script.writes) {
      assert.ok(existsSync(join(dir, name)), `${script.file} writes ${name}`);
      isChart(readFileSync(join(dir, name), "utf8"));
    }
    if (script.file === "fence.mjs") assert.equal(stdout.trim(), "null");
    if (script.file === "render-checked.mjs") {
      assert.ok(stdout.includes("CK1004 /a11y a11y.alt is required"));
      assert.ok(stdout.includes("CK1007 /mark/curve"));
    }
  }
});

test("the repair output printed on /docs/render is what validate and repair return", () => {
  const before = JSON.stringify(repairDraft);
  const checked = runtime.validate(repairDraft);
  const lines = checked.errors.map((error) => `${error.code} ${error.path} ${error.message}`);
  assert.equal(lines.length, 2);
  for (const line of lines) assert.ok(repairOutput.includes(line), line);
  const fixed = runtime.repair(repairDraft);
  assert.equal(fixed.ok, true);
  assert.deepEqual(fixed.applied, [
    { op: "add", path: "/a11y", value: { alt: "Line chart of signups by week." } },
    { op: "replace", path: "/mark/curve", value: "monotone" },
  ]);
  for (const patch of fixed.applied) assert.ok(repairOutput.includes(`path: '${patch.path}'`));
  assert.equal(JSON.stringify(repairDraft), before, "repair does not mutate its input");
  isChart(runtime.render(fixed.spec), "line");
  const missing = runtime.repair({ version: "1", type: "line", data: [{ week: "W1", signups: 1 }], encoding: { x: "week", y: "sales" } });
  assert.equal(missing.ok, false);
  assert.ok(missing.errors.some((error) => error.path === "/encoding/y"));
});

test("render returns the error card and does not throw", () => {
  const svg = runtime.render({ version: "1", type: "nope", data: [] });
  assert.ok(svg.includes("ck-chart-error"));
  assert.ok(svg.includes("CK1010"));
  assert.doesNotThrow(() => runtime.render(null));
});

test("every spec on the four pages validates with no errors and renders", () => {
  assert.ok(docSpecExamples.length >= 10);
  for (const { id, spec } of docSpecExamples) {
    const checked = runtime.validate(spec);
    assert.deepEqual(checked.errors, [], id);
    isChart(runtime.render(spec), spec.type as string);
  }
});

function tickTexts(svg: string): string[] {
  return [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((match) => match[1]);
}

function linePoints(svg: string): { x: number; y: number }[] {
  const path = svg.match(/ d="(M[^"]+)"/)?.[1] ?? "";
  const numbers = path.replace(/[A-Za-z,]/g, " ").trim().split(/\s+/).map(Number);
  const points: { x: number; y: number }[] = [];
  // M x y, then C c1x c1y c2x c2y x y per segment.
  points.push({ x: numbers[0], y: numbers[1] });
  for (let i = 2; i + 5 < numbers.length + 1; i += 6) points.push({ x: numbers[i + 4], y: numbers[i + 5] });
  return points;
}

test("the scales page describes what the renderer draws", () => {
  const svg = (id: keyof typeof scaleSpecs) => runtime.render(scaleSpecs[id]);

  // Log: ticks are powers of ten, and the four points are close to evenly spaced in y.
  const logTicks = tickTexts(svg("log"));
  for (const tick of ["100", "1,000", "10,000", "100,000"]) assert.ok(logTicks.includes(tick), tick);
  const logY = linePoints(svg("log")).map((point) => point.y);
  const steps = logY.slice(1).map((y, index) => logY[index] - y);
  assert.ok(Math.max(...steps) / Math.min(...steps) < 1.25, "a log line of tenfold growth is nearly straight");
  const linearY = linePoints(svg("linear")).map((point) => point.y);
  assert.ok(linearY[0] - linearY[2] < (linearY[0] - linearY[3]) * 0.1, "on a linear axis the first three years sit near the baseline");

  // Time: the gap between Jan 3 and Mar 1 is a gap on the axis. Categories are evenly spaced.
  const timeX = linePoints(svg("time")).map((point) => point.x);
  assert.ok(timeX[3] - timeX[2] > (timeX[2] - timeX[0]) * 10);
  const categoryX = linePoints(svg("category")).map((point) => point.x);
  const gaps = categoryX.slice(1).map((x, index) => x - categoryX[index]);
  assert.ok(Math.max(...gaps) - Math.min(...gaps) < 1);

  // Domain and nice.
  const auto = tickTexts(svg("auto"));
  assert.ok(auto.includes("210") && auto.includes("260") && !auto.includes("0"));
  const fromZero = tickTexts(svg("fromZero"));
  assert.ok(fromZero.includes("0") && fromZero.includes("250"));
  const fixed = tickTexts(svg("fixed"));
  assert.ok(fixed.includes("200") && fixed.includes("300") && !fixed.includes("0"));
  const exact = tickTexts(svg("exact"));
  assert.ok(!exact.includes("210") && !exact.includes("260") && exact.includes("220") && exact.includes("250"));

  // Reverse: a larger rank is lower on the page.
  const rank = linePoints(svg("reversed")).map((point) => point.y);
  assert.ok(rank[0] > rank[3], "rank 14 is drawn below rank 3");

  // The sentences about validate().
  const categorical = runtime.validate({ ...scaleSpecs.auto, encoding: { x: "hour", y: { field: "ms", type: "categorical" } } });
  assert.ok(categorical.errors.some((error) => error.code === "CK1007"));
  const zero = runtime.validate({ ...scaleSpecs.log, data: [{ year: "2021", users: 0 }, { year: "2022", users: 10 }] });
  assert.ok(zero.errors.some((error) => error.code === "CK3001"));

  // Labels are whole.
  for (const id of Object.keys(scaleSpecs) as (keyof typeof scaleSpecs)[]) {
    for (const text of tickTexts(svg(id))) assert.equal(text.includes("…"), false, `${id} shortens a label`);
  }
});

test("the Mermaid kinds listed on /docs/markdown convert, and the diagrams it rules out stay as source", () => {
  assert.deepEqual(
    mermaidKinds.map((kind) => kind.draws),
    ["bar", "pie", "sankey", "radar", "treemap", "quadrant", "gantt", "timeline", "journey", "venn"],
  );
  for (const kind of mermaidKinds) {
    assert.ok(kind.source.startsWith(kind.keyword), kind.keyword);
    const svg = runtime.renderFence(kind.source, "mermaid");
    assert.ok(svg, `${kind.keyword} did not convert`);
    isChart(svg, kind.draws);
  }
  const pie = runtime.renderFence(mermaidPieSource, "mermaid");
  assert.ok(pie);
  isChart(pie, "pie");
  assert.equal(mermaidUnsupported[0].name, "flowchart");
  for (const diagram of mermaidUnsupported) assert.equal(runtime.renderFence(diagram.source, "mermaid"), null, diagram.name);
  assert.equal(runtime.renderFence(mermaidPieSource, "mermaid", { mermaid: false }), null);
  assert.equal(runtime.renderFence("{ not json", "chartkit"), null);
  assert.ok(runtime.renderFence('{"version":"1","type":"nope","data":[]}', "chartkit")?.includes("CK1010"));
});

test("the four pages print these examples and keep the reserved section", () => {
  const pages = {
    markdown: read("apps/web/src/pages/docs/markdown.astro"),
    render: read("apps/web/src/pages/docs/render.astro"),
    "llms-txt": read("apps/web/src/pages/docs/llms-txt.astro"),
    scales: read("apps/web/src/pages/docs/scales.astro"),
  };
  for (const [slug, source] of Object.entries(pages)) {
    assert.match(source, /from "\.\.\/\.\.\/data\/docs-examples"/, slug);
    assert.match(source, new RegExp(`href="/docs/${slug}"`), slug);
  }
  for (const name of ["remarkScript", "rehypeScript", "renderFenceScript", "astroConfig", "markdownPost", "mermaidKinds"]) {
    assert.ok(pages.markdown.includes(`{${name}`) || pages.markdown.includes(`${name}.map`), `/docs/markdown prints ${name}`);
  }
  for (const word of ["remarkChartkit", "rehypeChartkit", "renderFence", "allowDangerousHtml", "Flowcharts are not supported"]) {
    assert.ok(pages.markdown.includes(word), word);
  }
  assert.equal(pages.markdown.includes("Mermaid or Markdown"), false);
  assert.equal(read("apps/web/src/components/DocArticle.astro").includes("is the converter"), false);
  assert.match(astroConfig, /remarkPlugins: \[remarkChartkit\]/);
  for (const name of ["renderScript", "extraScript", "oneChartScript", "ssrScript", "repairScript"]) {
    assert.ok(pages.render.includes(`{${name}.code}`), `/docs/render prints ${name}`);
  }
  assert.match(pages.scales, /<h2 id="time-zones-and-tick-labels">/);
  assert.match(pages.scales, /PLACEHOLDER \(temporal-axes session\)/);
  assert.match(pages["llms-txt"], /href="\/docs\/mcp"/);
  for (const file of llmsFiles) {
    assert.ok(existsSync(join(root, "apps/web/src/pages", `${file.path.slice(1)}.ts`)), `${file.path} is a route`);
    assert.equal(file.url, `https://chartkit.dev${file.path}`);
  }
  for (const text of [llmsSystemPrompt, llmsClaudeMd, llmsCursorRules]) {
    assert.match(text, /https:\/\/chartkit\.dev\/llms\.txt/);
    assert.match(text, /a11y\.alt/);
  }
  assert.ok(Buffer.byteLength(read("catalog/public/llms.txt")) < 6400 + 1);
});

type Catalog = {
  chartPageTypes: string[];
  chartNotePages: string[];
  sidebarChartCount: number;
  galleryChartCount: number;
  sidebarChartGroups: { items: { type: string; href: string }[] }[];
  docArticlePages: () => { slug: string }[];
};

async function loadCatalog(): Promise<Catalog> {
  const dir = mkdtempSync(join(tmpdir(), "ck-docs-catalog-"));
  const outfile = join(dir, "catalog.mjs");
  await bundle(join(root, "apps/web/src/data/docs-catalog.ts"), outfile);
  return import(pathToFileURL(outfile).href) as Promise<Catalog>;
}

test('"Show all N types" equals the chart pages that are chart types', async () => {
  const catalog = await loadCatalog();
  const listed = catalog.sidebarChartGroups.flatMap((group) => group.items);

  // The sitemap and the chart route both build from chartPageTypes.
  assert.match(read("apps/web/src/pages/sitemap.xml.ts"), /for \(const type of chartPageTypes\) paths\.add\(`\/docs\/charts\/\$\{type\}`\)/);
  assert.match(read("apps/web/src/pages/docs/charts/[type].astro"), /return chartPageTypes\.map\(\(type\) => \(\{ params: \{ type \} \}\)\)/);

  // One chart page is not a chart type: the filled-line note. Every other page is a row in the sidebar.
  assert.deepEqual(catalog.chartNotePages, ["area"]);
  assert.equal(catalog.sidebarChartCount, catalog.chartPageTypes.length - catalog.chartNotePages.length);
  assert.equal(listed.length, catalog.sidebarChartCount);
  assert.deepEqual(
    listed.map((item) => item.type).sort(),
    catalog.chartPageTypes.filter((type) => !catalog.chartNotePages.includes(type)).sort(),
  );
  for (const item of listed) assert.equal(item.href, `/docs/charts/${item.type}`);
  assert.equal(catalog.sidebarChartCount, catalog.galleryChartCount);

  // The button prints the derived number, and the README states the same one.
  const sidebar = read("apps/web/src/components/SidebarCharts.astro");
  assert.match(sidebar, /`Show all \$\{sidebarChartCount\} types`/);
  assert.equal(/Show all \d+ types/.test(sidebar), false, "the count is not written as a literal");
  assert.match(read("README.md"), new RegExp(`The site catalog has ${catalog.sidebarChartCount} types`));
});

test("the four rewritten pages are built once, from their own files", async () => {
  const catalog = await loadCatalog();
  const slugs = catalog.docArticlePages().map((page) => page.slug);
  for (const slug of ["markdown", "render", "llms-txt", "scales", "mcp"]) {
    assert.equal(slugs.includes(slug), false, `[...slug].astro also builds /docs/${slug}`);
    assert.ok(existsSync(join(root, "apps/web/src/pages/docs", `${slug}.astro`)), `${slug}.astro exists`);
  }
});
