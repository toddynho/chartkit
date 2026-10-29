import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { fromMermaid } from "@chartkitdev/core/mermaid/phase4";
import { repair, validate } from "@chartkitdev/core/validate";
import { validatePhase4 } from "@chartkitdev/core/validate/phase4";
import { snippetsFor } from "./snippets.ts";
import { benchSources, benchmarkCharts } from "./showcase-benchmarks.ts";
import { bikeCharts, mermaidBoards, repairCases, roasteryCharts, stacks, tide, type ChartSlot, type ShowcaseSpec } from "./showcase-data.ts";
import { nextBoardMeta } from "./showcase-next.ts";
import { fifthBoards } from "./showcase-fifth.ts";
import { visualBoards } from "./showcase-visual.ts";
import { polarBoards } from "./showcase-polar.ts";
import { fourthBoards } from "./showcase-fourth.ts";
import { sheetMeta, thirdBoardMeta } from "./showcase-third.ts";
import { optionById, optionsIn, type OptionLink } from "./showcase-options.ts";

const PHASE4 = new Set(["gantt", "timeline", "quadrant", "venn", "journey"]);

type Diagnostic = ReturnType<typeof validate>["errors"][number];

export interface ReadyChart {
  id: string;
  title: string;
  caption: string;
  span: "board-4" | "board-6" | "board-8" | "board-12";
  spec: ShowcaseSpec;
  svg: string;
  options: OptionLink[];
}

export interface StackSnippet {
  id: string;
  label: string;
  code: string;
  feature: string;
}

export interface RepairCard {
  id: string;
  title: string;
  caption: string;
  broken: Record<string, unknown>;
  errors: Diagnostic[];
  warnings: Diagnostic[];
  applied: { op: string; path: string; value?: unknown; from?: string }[];
  repaired: Record<string, unknown> | null;
  svg: string | null;
  options: OptionLink[];
}

export interface MermaidCard {
  id: string;
  title: string;
  caption: string;
  span: "board-12";
  source: string;
  warnings: { code?: string; message: string }[];
  chart: ReadyChart;
}

export interface Board {
  slug: string;
  number: number;
  title: string;
  lede: string;
  charts: ReadyChart[];
  options: OptionLink[];
  stacks?: StackSnippet[];
  mermaid?: MermaidCard[];
  repairs?: RepairCard[];
  losses?: { label: string; detail: string }[];
  sources?: ReturnType<typeof benchSources>;
}

function chartType(spec: unknown): string {
  if (typeof spec !== "object" || spec === null) return "";
  const type = (spec as { type?: unknown }).type;
  return typeof type === "string" ? type : "";
}

export function renderSpec(spec: unknown): string {
  const type = chartType(spec);
  const svg = isExtra(type) ? renderExtra(spec as never) : renderCore(spec as never);
  if (!svg.includes("<svg") || svg.includes("ck-chart-error")) {
    throw new Error(`${type || "chart"} render failed`);
  }
  return svg;
}

function ready(slot: ChartSlot): ReadyChart {
  const checked = PHASE4.has(chartType(slot.spec)) ? validatePhase4(slot.spec) : validate(slot.spec);
  if (!checked.ok) {
    throw new Error(`${slot.id} ${checked.errors.map((error) => `${error.code} ${error.path} ${error.message}`).join("; ")}`);
  }
  return { ...slot, svg: renderSpec(slot.spec), options: optionsIn(slot.spec) };
}

function union(charts: { options: OptionLink[] }[], extra: string[] = []): OptionLink[] {
  const map = new Map<string, OptionLink>();
  for (const chart of charts) for (const option of chart.options) map.set(option.id, option);
  for (const id of extra) {
    if (map.has(id)) continue;
    const known = optionById(id);
    if (!known) throw new Error(`showcase option ${id} is not in features.json`);
    map.set(id, known);
  }
  return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id));
}

function tideStacks(): StackSnippet[] {
  const snippets = snippetsFor(tide as never);
  const json = JSON.stringify(tide, null, 2);
  const markdown = "```chartkit\n" + json + "\n```";
  const cdn = `<script src="chartkit.global.js"></script>\n<pre class="chartkit"><code>${json}</code></pre>`;
  const node = `import { renderToString } from "@chartkitdev/vanilla";\n\nconst spec = ${json};\n\nconst svg = renderToString(spec);\n`;
  const next = `import { render } from "@chartkitdev/core/all";\n\nconst spec = ${json};\n\nexport default function Page() {\n  const svg = render(spec);\n  return <div dangerouslySetInnerHTML={{ __html: svg }} />;\n}\n`;
  return [
    { id: "next", label: "Next.js", code: next, feature: "framework.react" },
    { id: "react", label: "React", code: snippets.react, feature: "framework.react" },
    { id: "vue", label: "Vue", code: snippets.vue, feature: "framework.vue" },
    { id: "svelte", label: "Svelte", code: snippets.svelte, feature: "framework.svelte" },
    { id: "vanilla", label: "Vanilla ESM", code: snippets.vanilla, feature: "framework.vanilla" },
    { id: "cdn", label: "CDN", code: cdn, feature: "framework.vanilla" },
    { id: "markdown", label: "Markdown", code: markdown, feature: "type.xychart.text" },
    { id: "node", label: "renderToString", code: node, feature: "framework.vanilla" },
  ];
}

type MermaidSource = (typeof mermaidBoards)[number] & { width?: number };

function mermaidCards(source: MermaidSource[] = mermaidBoards): MermaidCard[] {
  return source.map((board) => {
    const converted = fromMermaid(board.source);
    if (!converted.spec) throw new Error(`${board.id} mermaid produced no spec`);
    const spec = { ...converted.spec, theme: "soft", size: { width: board.width ?? 880, height: board.height ?? 440 } } as unknown as ShowcaseSpec;
    const checked = validatePhase4(spec);
    if (!checked.ok) {
      throw new Error(`${board.id} ${checked.errors.map((error) => `${error.code} ${error.message}`).join("; ")}`);
    }
    const chart = ready({ id: board.id, title: board.title, caption: board.caption, span: "board-12", spec });
    return {
      ...board,
      warnings: (converted.warnings ?? []).map((warning) => ({
        code: "code" in warning ? String(warning.code) : undefined,
        message: "message" in warning ? String(warning.message) : String(warning),
      })),
      chart,
    };
  });
}

function repairCards(): RepairCard[] {
  return repairCases.map((item) => {
    const before = validate(item.spec);
    const fixed = repair(item.spec);
    const warnings = fixed.warnings ?? [];
    const svg = fixed.ok || warnings.length > 0 ? renderSpec(fixed.spec) : null;
    if (!svg) throw new Error(`${item.id} repair did not render`);
    return {
      id: item.id,
      title: item.title,
      caption: item.caption,
      broken: item.spec,
      errors: before.errors,
      warnings: before.warnings,
      applied: fixed.applied as RepairCard["applied"],
      repaired: fixed.spec as Record<string, unknown>,
      svg,
      options: optionsIn(fixed.spec),
    };
  });
}

function board(partial: Omit<Board, "options"> & { extraOptions?: string[] }): Board {
  const options = union(
    [...partial.charts, ...(partial.mermaid?.map((card) => card.chart) ?? []), ...(partial.repairs ?? [])],
    partial.extraOptions,
  );
  return { ...partial, options };
}

export function boards(): Board[] {
  const tideChart = ready({
    id: "tide",
    title: "Greywick harbour",
    caption: "One spec. The SVG in this page is rendered on the server. Hover for the tooltip, click a point to mark it, or click a legend name to hide that line.",
    span: "board-12",
    spec: tide,
  });
  const roastery = roasteryCharts.map(ready);
  const bike = bikeCharts.map(ready);
  const mermaid = mermaidCards();
  const repairs = repairCards();
  const benchmarks = benchmarkCharts().map(ready);
  const stacksForTide = tideStacks();
  return [
    board({
      slug: "one-spec",
      number: 11,
      title: "One spec, every stack",
      lede: "Tide heights at the fictional harbour of Greywick. The same JSON renders in React, Vue, Svelte, vanilla, a CDN script, a Markdown fence, and Node. The SVG is rendered on the server.",
      charts: [tideChart],
      stacks: stacksForTide,
      extraOptions: stacks.map((stack) => stack.feature),
    }),
    board({
      slug: "roastery",
      number: 1,
      title: "Roastery P&L cockpit",
      lede: "A small coffee roaster. Bags, the green-bean bill, and how much stayed in the café, with a second axis, a target rule, a bullet, and a receipts bridge.",
      charts: roastery,
    }),
    board({
      slug: "bike-share",
      number: 3,
      title: "City bike-share flows",
      lede: "Trips through four fictional neighbourhoods, one way from Lantern to Moth, then sixteen weeks of days and the shift from classic bikes to e-bikes.",
      charts: bike,
    }),
    board({
      slug: "game-launch",
      number: 5,
      title: "Indie game launch, from Mermaid",
      lede: "A two-person studio shipping a game called Paper Kite. The Mermaid on the left is what fromMermaid reads. The chart on the right is the spec it returns, checked with validatePhase4.",
      charts: [],
      mermaid,
      extraOptions: ["type.xychart.text", "validate.runtime"],
    }),
    board({
      slug: "repair-loop",
      number: 13,
      title: "The repair loop, live",
      lede: "Broken specs about a fictional bakery. validate() names the code and the JSON Pointer. repair() applies the safe patches. A line that asks for labels warns CK3012 and still draws the line.",
      charts: [],
      repairs,
      extraOptions: ["validate.repair", "validate.codes", "validate.unknown.keys", "validate.runtime"],
    }),
    board({
      slug: "benchmarks-drawn",
      number: 16,
      title: "Benchmarks, drawn by ChartKit",
      lede: "The measured line bundles and the published round of browser timings, drawn as charts.",
      charts: benchmarks,
      sources: benchSources(),
    }),
    ...[
      ...nextBoardMeta.map((item) =>
        board({
          slug: item.slug,
          number: item.number,
          title: item.title,
          lede: item.lede,
          charts: item.charts.map(ready),
        }),
      ),
      ...thirdBoardMeta
        .filter((item) => item.slug !== "garden")
        .map((item) =>
          board({
            slug: item.slug,
            number: item.number,
            title: item.title,
            lede: item.lede,
            charts: item.charts.map(ready),
          }),
        ),
      board({
        slug: sheetMeta.slug,
        number: sheetMeta.number,
        title: sheetMeta.title,
        lede: sheetMeta.lede,
        charts: [],
        mermaid: mermaidCards(sheetMeta.sources),
        extraOptions: ["type.xychart.text"],
      }),
      ...thirdBoardMeta
        .filter((item) => item.slug === "garden")
        .map((item) =>
          board({
            slug: item.slug,
            number: item.number,
            title: item.title,
            lede: item.lede,
            charts: item.charts.map(ready),
          }),
        ),
      ...fourthBoards.map((item) =>
        board({
          slug: item.slug,
          number: item.number,
          title: item.title,
          lede: item.lede,
          charts: item.charts.map(ready),
          stacks: item.stacks,
          extraOptions: item.extraOptions,
        }),
      ),
      ...fifthBoards.map((item) =>
        board({
          slug: item.slug,
          number: item.number,
          title: item.title,
          lede: item.lede,
          charts: item.charts.map(ready),
        }),
      ),
      ...visualBoards.map((item) =>
        board({
          slug: item.slug,
          number: item.number,
          title: item.title,
          lede: item.lede,
          charts: item.charts.map(ready),
        }),
      ),
      ...polarBoards.map((item) =>
        board({
          slug: item.slug,
          number: item.number,
          title: item.title,
          lede: item.lede,
          charts: item.charts.map(ready),
        }),
      ),
    ].sort((a, b) => a.number - b.number),
  ];
}

export function boardBySlug(slug: string): Board | undefined {
  return showcaseBoards().find((item) => item.slug === slug);
}

let cached: Board[] | null = null;

export function showcaseBoards(): Board[] {
  if (!cached) cached = boards();
  return cached;
}
