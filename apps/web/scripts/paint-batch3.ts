/**
 * Paint compare, maps, demo, interaction, layouts, spec charts, theming,
 * convert coverage, and the when-to-use FAQ. Specs stay in catalog/lib.
 * Output is apps/web/.generated and is not committed.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { register } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderChart } from "../src/lib/paint-chart.ts";
import {
  LOOKS,
  demoKpis,
  demoServices,
  demoThroughput,
  layoutRule,
  layoutSpecs,
  lookBars,
  lookLine,
  navigatorSpec,
  salesSpec,
  syncedSpecs,
} from "./batch3-specs.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const out = join(root, "apps/web/.generated");
const scriptDir = dirname(fileURLToPath(import.meta.url));

register(pathToFileURL(join(scriptDir, "json-import-hook.mjs")).href, {
  parentURL: import.meta.url,
});

process.chdir(join(root, "catalog"));

function write(file: string, value: unknown): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value));
}

function painted(spec: unknown): { spec: unknown; svg: string; alt: string } {
  const svg = renderChart(spec);
  const alt =
    typeof spec === "object" && spec !== null && typeof (spec as { a11y?: { alt?: unknown } }).a11y?.alt === "string"
      ? (spec as { a11y: { alt: string } }).a11y.alt
      : "Chart";
  return { spec, svg, alt };
}

function preset(spec: unknown): boolean {
  if (typeof spec !== "object" || spec === null) return false;
  const theme = (spec as { theme?: unknown }).theme;
  return typeof theme === "string" && theme.length > 0 && theme !== "auto";
}

const matrixLib = await import("../../../catalog/lib/matrix.ts");
const { lineSizeRows } = await import("../../../catalog/lib/size-matrix.ts");
const geoSamples = await import("../../../catalog/lib/geo-samples.ts");
const { paintScale, render: renderGeo } = await import("@chartkitdev/geo");
const { headline, published, CORE_COMMIT, MEASURED, ROUND } = await import("../../../catalog/lib/benchmarks.ts");
const { perfBrief, sizeBrief, whenToUseFaqs } = await import("./site-copy.ts");
const { SITE } = await import("../../../catalog/lib/site.ts");
const { specPages } = await import("../../../catalog/lib/spec-charts.ts");
const { chartTypes, THEMES, TOKENS, minimalSpec } = await import("../../../catalog/lib/specs.ts");
const { snippets } = await import("../../../catalog/lib/cloud.ts");
const convertLib = await import("@chartkitdev/convert");

function paintCompare(): number {
  const data = matrixLib.matrix();
  const sizes = lineSizeRows();
  const sizeFacts = {
    commit: sizes.commit,
    coreCommit: sizes.commit,
    coreMatchesMain: false,
    command: "bench/results/bundle.json",
    measuredAt: sizes.measuredAt,
    lineBytes: sizes.lineBytes,
    benchCommand: "bench/results/bundle.json",
    benchMeasuredAt: sizes.measuredAt,
    rows: sizes.rows,
  };
  const perfFacts = {
    round: ROUND,
    measured: MEASURED,
    coreCommit: CORE_COMMIT,
    sizeCommit: sizes.commit,
    hoverSteady100k: published.hoverSteady100k.map((row) => ({ lib: row.lib, paintedMs: row.paintedMs })),
    ssrMs: published.ssr.map((row) => ({
      lib: row.lib,
      meanMs: row.meanMs,
      medianMs: row.medianMs,
      supported: row.supported,
      points: row.points,
    })),
    browserMs: published.browser.map((row) => ({
      shape: row.shape,
      points: row.points,
      chartkit: row.chartkit,
      uplot: row.uplot,
    })),
    firstHoverPainted: published.firstHoverPainted.map((row) => ({
      afterMountMs: row.afterMountMs,
      chartkit: row.chartkit,
      uplot: row.uplot,
    })),
  };
  const rivals = matrixLib.librariesExceptChartkit().map((library) => {
    const rows = matrixLib.compareRows(library.id);
    for (const row of rows) {
      const again = matrixLib.callFor(row.ours.status, row.theirs.status);
      if (again !== row.call) {
        throw new Error(`${library.id} ${row.feature.id} ranks as ${again} but the row says ${row.call}`);
      }
    }
    const sections = {
      loss: rows.filter((row) => row.call === "loss"),
      win: rows.filter((row) => row.call === "win"),
      unknown: rows.filter((row) => row.call === "unknown"),
      tie: rows.filter((row) => row.call === "tie"),
    };
    if (sections.loss.length + sections.win.length + sections.unknown.length + sections.tie.length !== rows.length) {
      throw new Error(`${library.id} compare rows do not add up`);
    }
    const slim = (row: (typeof rows)[number]) => ({
      id: row.feature.id,
      label: row.feature.label,
      badge: row.feature.badge,
      ours: row.ours.status,
      theirs: row.theirs.status,
      tier: row.theirs.tier,
      option: matrixLib.optionText(row.theirs),
      verified: row.theirs.verified,
      strength: row.theirs.strength,
      source: row.theirs.source[0] ?? "—",
    });
    const counts = matrixLib.tally(rows);
    write(join(out, "compare", `${library.id}.json`), {
      library,
      chartkitCommit: data.chartkitCommit,
      chartkitRechecked: data.chartkitRechecked,
      counts,
      size: sizeBrief(sizeFacts, library),
      perf: perfBrief(library.id, library.name, perfFacts),
      loss: sections.loss.map(slim),
      win: sections.win.map(slim),
      unknown: sections.unknown.map(slim),
      tie: sections.tie.map(slim),
    });
    return { library, ...counts };
  });
  write(join(out, "compare", "index.json"), {
    dateChecked: data.dateChecked,
    chartkitRechecked: data.chartkitRechecked,
    chartkitCommit: data.chartkitCommit,
    rivals,
  });
  return rivals.length;
}

async function paintMaps(): Promise<number> {
  const world = await renderGeo(geoSamples.worldSpec);
  const us = await renderGeo(geoSamples.usSpec);
  const cities = await renderGeo(geoSamples.citySpec);
  const board = await renderGeo(
    geoSamples.withTheme({ ...geoSamples.usSpec, title: "Click a state", size: { width: 760, height: 520 } }, "soft"),
  );
  for (const [name, svg] of Object.entries({ world, us, cities, board })) {
    if (!svg.includes("<svg") || svg.includes("ck-chart-error")) throw new Error(`geo ${name} did not paint`);
  }
  const scale = paintScale(
    "diverging",
    geoSamples.stateChange.map(([, change]) => change),
    undefined,
    { percent: true },
  );
  const bars: Record<string, string> = {};
  for (const [id] of geoSamples.stateChange) {
    const name = geoSamples.stateNames[id] ?? id;
    bars[id] = geoSamples.metroBarSvg(`${name} metros`, geoSamples.metroChanges(id), scale.domain);
    if (!bars[id]?.includes("<svg")) throw new Error(`metro bars for ${id} did not paint`);
  }
  const geoCard = (spec: { a11y: { alt: string } }, svg: string) => ({
    spec,
    svg,
    alt: spec.a11y.alt,
    preset: preset(spec),
  });
  write(join(out, "maps.json"), {
    world: geoCard(geoSamples.worldSpec, world),
    us: geoCard(geoSamples.usSpec, us),
    cities: geoCard(geoSamples.citySpec, cities),
    board,
    bars,
    initial: "CA",
  });
  return 4;
}

function paintCharts(): void {
  write(join(out, "demo.json"), {
    kpis: demoKpis.map((spec) => painted(spec)),
    throughput: painted(demoThroughput),
    services: painted(demoServices),
  });
  write(join(out, "interaction.json"), {
    navigator: painted(navigatorSpec),
    synced: syncedSpecs.map((spec) => painted(spec)),
    sales: painted(salesSpec),
  });
  write(join(out, "layouts.json"), {
    rule: layoutRule,
    facet: painted(layoutSpecs.facet),
    dashboard: painted(layoutSpecs.dashboard),
    wide: painted(layoutSpecs.wide),
    narrow: painted(layoutSpecs.narrow),
    rtl: painted(layoutSpecs.rtl),
    hebrew: painted(layoutSpecs.hebrew),
  });
}

function paintSpecPages(): number {
  const index = Object.entries(specPages).map(([type, page]) => ({
    type,
    title: page.title,
    summary: page.summary,
  }));
  write(join(out, "spec", "index.json"), { pages: index });
  for (const [type, page] of Object.entries(specPages)) {
    const spec = JSON.parse(page.example) as unknown;
    write(join(out, "spec", `${type}.json`), {
      type,
      title: page.title,
      summary: page.summary,
      fields: page.fields,
      example: page.example,
      chart: painted(spec),
    });
  }
  return index.length;
}

function paintTheming(): void {
  const swatch = { ...minimalSpec, id: "theme-swatch", size: { width: 360, height: 160 } };
  delete (swatch as { title?: unknown }).title;
  const looks = LOOKS.map((look) => ({
    ...look,
    charts: [lookLine, lookBars].map((spec) => {
      const themed = { ...spec, id: `look-${look.id}-${spec.type}`, theme: look.id };
      return { ...painted(themed), title: spec.title, preset: true };
    }),
  }));
  write(join(out, "theming.json"), {
    swatch: painted(swatch),
    looks,
    tokens: TOKENS.map(([token, role]) => ({ token, role })),
    themes: [...THEMES],
  });
}

function paintConvert(): void {
  const samples = convertLib.samples.map((item) => {
    const result = convertLib.convert(item.source);
    const spec = result.spec;
    let svg = "";
    if (spec) {
      svg = renderChart(spec);
    }
    return {
      id: item.id,
      label: item.label,
      source: item.source,
      detected: result.source,
      spec,
      svg,
      warnings: result.warnings,
    };
  });
  write(join(out, "convert.json"), {
    samples,
    coverage: convertLib.coverage,
  });
}

function paintCopy(): void {
  const chartkitAgent = published.agents[0];
  if (chartkitAgent.noDocsFirst == null || chartkitAgent.tokensOfficial == null) {
    throw new Error("ChartKit agent headline is missing");
  }
  const faqs = whenToUseFaqs({
    lineGzipBytes: headline.lineGzipBytes,
    ssrLabel: headline.ssrLabel,
    sizeCommit: headline.sizeCommit,
    sizeMeasured: headline.sizeMeasured,
    bundleLoss: headline.bundleLoss,
    harnessLineBytes: headline.harnessLineBytes,
    noDocsFirst: chartkitAgent.noDocsFirst,
    tokensOfficial: chartkitAgent.tokensOfficial,
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
      {
        "@type": "SoftwareSourceCode",
        name: "ChartKit",
        description: SITE.description,
        codeRepository: SITE.github,
        url: SITE.url,
        programmingLanguage: "TypeScript",
        runtimePlatform: "JavaScript",
        license: "https://opensource.org/licenses/MIT",
        targetProduct: {
          "@type": "SoftwareApplication",
          name: "ChartKit",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
      },
    ],
  };
  write(join(out, "when-to-use.json"), { faqs, jsonLd });
  write(join(out, "reference.json"), {
    types: chartTypes.map((item) => ({ type: item.type, summary: item.summary })),
  });
  write(join(out, "cloud-docs.json"), { snippets });
}

const libraries = paintCompare();
const maps = await paintMaps();
paintCharts();
const specs = paintSpecPages();
paintTheming();
paintConvert();
paintCopy();
console.log(`compare ${libraries}, maps ${maps}, spec pages ${specs}, demo, interaction, layouts, theming, convert, when-to-use`);
