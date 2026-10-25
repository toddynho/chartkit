/**
 * Paint dashboard SVGs with @chartkitdev/core and @chartkitdev/geo.
 * Specs come from docs/lib/dashboards.ts, the same module the Next.js pages use.
 * Output is apps/web/.generated/dashboards and is not committed.
 */
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { renderBarList } from "@chartkitdev/core/charts/bar-list";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { validate } from "@chartkitdev/core/validate";
import { render as renderGeo } from "@chartkitdev/geo";
import { dashboards, type DashChart, type DashSpark, type Dashboard, type DashThemes } from "../../../docs/lib/dashboards.ts";
import type { PaintedBoard, PaintedChart, SpecBlock, StringPair, ThemeName, ThemeText } from "../src/lib/dashboard-types.ts";
import { present, type DashTheme } from "./dashboard-present.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = join(root, "apps/web/.generated/dashboards");

let rendered = 0;
let reused = 0;

function altOf(spec: Record<string, unknown>, fallback: string): string {
  const a11y = spec.a11y;
  if (typeof a11y === "object" && a11y !== null && "alt" in a11y && typeof a11y.alt === "string" && a11y.alt) return a11y.alt;
  return fallback;
}

function assertDrew(svg: string, label: string): void {
  if (!svg.includes("<svg") || svg.includes("ck-chart-error") || svg.includes("Unknown atlas") || svg.includes("Expected type")) {
    throw new Error(`${label} did not draw`);
  }
  if (!/<(?:path|rect|circle|polygon|polyline|line)\b/.test(svg)) throw new Error(`${label} drew no mark`);
}

async function renderSpec(spec: Record<string, unknown>, label: string): Promise<string> {
  rendered += 1;
  const type = typeof spec.type === "string" ? spec.type : "";
  if (type === "choropleth" || type === "map-points") {
    const svg = await renderGeo(spec);
    assertDrew(svg, label);
    return svg;
  }
  const checked = validate(spec);
  if (!checked.ok) {
    throw new Error(`${label} ${checked.errors.map((error) => `${error.code} ${error.path} ${error.message}`).join("; ")}`);
  }
  const svg = type === "bar-list" ? (renderBarList(spec) ?? "") : isExtra(type) ? renderExtra(spec) : renderCore(spec);
  assertDrew(svg, label);
  return svg;
}

function emptyText(): ThemeText {
  const blank = (): StringPair => ({ wide: "", narrow: "" });
  return { soft: blank(), midnight: blank() };
}

async function paintFrames(
  authored: Record<string, unknown>,
  themes: DashThemes,
  themed: DashThemes | undefined,
  label: string,
  knownWide: (theme: DashTheme) => string,
  knownNarrow: (theme: DashTheme) => string,
): Promise<{ frames: ThemeText; specs: ThemeText }> {
  const frames = emptyText();
  const specs = emptyText();
  const authoredJson = JSON.stringify(authored);
  for (const theme of ["soft", "midnight"] as const) {
    const wideSpec = present(authored, theme, themes, false, themed);
    const narrowSpec = present(authored, theme, themes, true, themed);
    const wideJson = JSON.stringify(wideSpec);
    const narrowJson = JSON.stringify(narrowSpec);
    specs[theme] = {
      wide: JSON.stringify(wideSpec, null, 2),
      narrow: narrowJson === wideJson ? JSON.stringify(wideSpec, null, 2) : JSON.stringify(narrowSpec, null, 2),
    };
    const known = knownWide(theme);
    const canReuseWide = known.includes("<svg") && !known.includes("ck-chart-error") && (authored.type === "bar-list" || wideJson === authoredJson);
    let wideSvg: string;
    if (canReuseWide && !themed) {
      reused += 1;
      wideSvg = known;
    } else {
      wideSvg = await renderSpec(wideSpec, `${label} ${theme}`);
    }
    let narrowSvg = wideSvg;
    if (narrowJson !== wideJson) {
      const phone = knownNarrow(theme);
      if (!themed && authored.type === "bar-list" && phone.includes("<svg") && !phone.includes("ck-chart-error")) {
        reused += 1;
        narrowSvg = phone;
      } else {
        narrowSvg = await renderSpec(narrowSpec, `${label} ${theme} narrow`);
      }
    }
    frames[theme] = { wide: wideSvg, narrow: narrowSvg };
  }
  return { frames, specs };
}

function knownChartWide(chart: DashChart, theme: ThemeName, fallback: ThemeName): string {
  if (chart.svgs?.[theme]) return chart.svgs[theme];
  if (theme === fallback && chart.svg) return chart.svg;
  return "";
}

async function paintChart(chart: DashChart, fallback: ThemeName, blocks: SpecBlock[]): Promise<PaintedChart> {
  const base = await paintFrames(
    chart.spec,
    chart.themes,
    chart.themed,
    chart.id,
    (theme) => knownChartWide(chart, theme, fallback),
    (theme) => chart.phone?.[theme] ?? "",
  );
  blocks.push({ heading: chart.title, specs: base.specs });
  const variants = [];
  for (const variant of chart.variants ?? []) {
    if (variant.spec !== chart.spec) {
      const painted = await paintFrames(
        variant.spec,
        chart.themes,
        undefined,
        `${chart.id}:${variant.id}`,
        (theme) => (theme === fallback ? variant.svg : ""),
        () => "",
      );
      blocks.push({ heading: `${chart.title} · ${variant.label}`, specs: painted.specs });
      variants.push({ id: variant.id, label: variant.label, alt: altOf(variant.spec, variant.label), frames: painted.frames });
    } else {
      variants.push({ id: variant.id, label: variant.label, alt: altOf(variant.spec, chart.title), frames: base.frames });
    }
  }
  return {
    id: chart.id,
    title: chart.title,
    caption: chart.caption,
    type: typeof chart.spec.type === "string" ? chart.spec.type : "",
    span: chart.span,
    place: chart.place,
    alt: altOf(chart.spec, chart.title),
    ...(chart.tab ? { tab: chart.tab } : {}),
    frames: base.frames,
    variants,
  };
}

async function paintBoard(board: Dashboard): Promise<PaintedBoard> {
  const specBlocks: SpecBlock[] = [];
  const charts: PaintedChart[] = [];
  for (const chart of board.charts) charts.push(await paintChart(chart, board.defaultTheme, specBlocks));
  const sparks = [];
  for (const spark of board.sparks) sparks.push(await paintSpark(spark, board.defaultTheme, specBlocks));
  return {
    slug: board.slug,
    product: board.product,
    title: board.title,
    lede: board.lede,
    disclaimer: board.disclaimer,
    range: board.range,
    defaultTheme: board.defaultTheme,
    charts,
    sparks,
    notes: board.notes,
    specBlocks,
  };
}

async function paintSpark(spark: DashSpark, fallback: ThemeName, blocks: SpecBlock[]) {
  const painted = await paintFrames(
    spark.spec,
    spark.themes,
    undefined,
    spark.id,
    (theme) => (theme === fallback ? spark.svg : ""),
    () => "",
  );
  blocks.push({ heading: spark.name, specs: painted.specs });
  return {
    id: spark.id,
    name: spark.name,
    detail: spark.detail,
    seen: spark.seen,
    age: spark.age,
    events: spark.events,
    users: spark.users,
    tags: spark.tags,
    priority: spark.priority,
    assignee: spark.assignee,
    alt: altOf(spark.spec, spark.name),
    frames: painted.frames,
  };
}

const started = Date.now();
const boards = dashboards();
const mdSlugs = readdirSync(join(root, "docs/public/dashboards"))
  .filter((name) => name.endsWith(".md"))
  .map((name) => name.slice(0, -3))
  .sort();
const slugs = boards.map((board) => board.slug).sort();
if (JSON.stringify(slugs) !== JSON.stringify(mdSlugs)) {
  throw new Error(`Dashboard slugs ${slugs.join(",")} do not match markdown files ${mdSlugs.join(",")}`);
}

mkdirSync(outDir, { recursive: true });
const index = [];
for (const board of boards) {
  const painted = await paintBoard(board);
  writeFileSync(join(outDir, `${painted.slug}.json`), JSON.stringify(painted));
  const cover = painted.charts.find((chart) => chart.type !== "kpi") ?? painted.charts[0];
  if (!cover) throw new Error(`${painted.slug} has no charts`);
  const coverSvg = cover.frames[painted.defaultTheme].wide;
  assertDrew(coverSvg, `${painted.slug} cover`);
  index.push({
    slug: painted.slug,
    product: painted.product,
    title: painted.title,
    lede: painted.lede,
    disclaimer: painted.disclaimer,
    range: painted.range,
    defaultTheme: painted.defaultTheme,
    coverAlt: cover.alt,
    coverSvg,
  });
  console.log(`painted ${painted.slug} (${painted.charts.length} charts, ${painted.sparks.length} sparks)`);
}

writeFileSync(
  join(outDir, "index.json"),
  JSON.stringify({ source: "docs/lib/dashboards.ts", boards: index }),
);
console.log(`dashboards painted in ${((Date.now() - started) / 1000).toFixed(1)}s, rendered ${rendered}, reused ${reused}`);
