/**
 * One bundle cell per gallery type for ChartKit, and for every pinned rival
 * the paint matrix treats as native. Phase 3 libraries also get a cell for
 * every other gallery type their pinned package actually ships.
 */

import { chartTypeDefs, GALLERY_TYPES } from "../browser/chart-types.mjs";
import { PHASE3_CHARTS, PHASE3_LIBS, phase3Matrix } from "../browser/phase3.mjs";
import { RIVAL_LIBS, rivalMatrix } from "../browser/rivals.mjs";
import { AMBIGUOUS_ALIASES, SSR_NONE, aliasesFor, entryFor } from "./native.mjs";

const CHARTKIT_ALL = `import { render } from "../../packages/core/src/all.ts";
export function draw(spec) {
  return render(spec);
}
`;

const LINE = {
  id: "line",
  file: "line",
  exportName: "line",
  homepageRow: "line",
};

const defs = new Map([["line", LINE], ...chartTypeDefs.map((def) => [def.id, def])]);

const libs = [...RIVAL_LIBS, ...PHASE3_LIBS];
const libById = new Map(libs.map((lib) => [lib.id, lib]));

const NOTE_OVERRIDE = {
  "victory:candlestick": "victory exports VictoryCandlestick. The phase-3 paint cell used the shared default and did not time it, so this cell stays unsupported.",
  "apexcharts:radial-bar": "apexcharts/radialBar is the progress-ring cell, a full circle. It is not the radial-bar gallery shape.",
  "plotly:progress-ring": "indicator mode gauge is a gauge, not a progress ring.",
};

function chartkitCell(def) {
  const source = `import { createRenderer } from "../../packages/core/src/render.ts";
import { ${def.exportName} } from "../../packages/core/src/charts/${def.file}.ts";
const render = createRenderer([${def.exportName}]);
export function draw(spec) {
  return render(spec);
}
`;
  return {
    id: "chartkit",
    library: "ChartKit minimal",
    chart: def.id,
    renderer: "svg",
    react: "none",
    css: false,
    group: "chartkit",
    status: "ok",
    source,
    note: null,
    ssr: "chartkit",
    ssrNote: null,
    aliases: aliasesFor(def.id),
    homepageRow: def.homepageRow ?? null,
  };
}

function finish(lib, chart, entry, status, note) {
  const resolved = entry ?? {};
  return {
    id: lib.id,
    library: lib.library,
    chart,
    renderer: resolved.renderer ?? lib.renderer,
    react: resolved.react ?? "none",
    css: Boolean(resolved.css),
    group: resolved.group ?? lib.id,
    singleBuild: Boolean(resolved.singleBuild),
    status,
    source: status === "ok" ? resolved.source ?? null : null,
    note: note ?? resolved.note ?? null,
    ssr: status === "ok" ? resolved.ssr ?? null : null,
    ssrNote: status === "ok" ? resolved.ssrNote ?? (resolved.ssr ? null : SSR_NONE[lib.id] ?? `${lib.library} has no Node string renderer.`) : null,
    aliases: [],
    homepageRow: defs.get(chart)?.homepageRow ?? null,
  };
}

export function buildMatrix() {
  const cells = [];
  for (const type of GALLERY_TYPES) {
    const def = defs.get(type);
    cells.push(chartkitCell(def));
  }
  cells.push({
    id: "chartkit-all",
    library: "ChartKit all",
    chart: "all",
    renderer: "svg",
    react: "none",
    css: false,
    group: "chartkit-all",
    status: "ok",
    source: CHARTKIT_ALL,
    note: "One /all bundle. It registers every core chart and every theme and does not include the validator. Not repeated per type.",
    ssr: null,
    ssrNote: null,
    aliases: [],
    homepageRow: null,
  });

  for (const row of rivalMatrix()) {
    const lib = libById.get(row.libraryId);
    if (row.status === "native") {
      const entry = entryFor(row.libraryId, row.chart);
      const cell = finish(lib, row.chart, entry, entry?.source ? "ok" : "error", entry?.note ?? null);
      if (!entry?.source) cell.error = "missing bundle entry";
      cells.push(cell);
    } else {
      cells.push(finish(lib, row.chart, null, "unsupported", row.method));
    }
  }

  const phase3Seen = new Set();
  for (const row of phase3Matrix()) {
    phase3Seen.add(`${row.libraryId}:${row.chart}`);
    const lib = libById.get(row.libraryId);
    if (row.libraryId === "googlecharts") {
      cells.push(finish(lib, row.chart, null, "unsupported", SSR_NONE.googlecharts));
      continue;
    }
    if (row.status !== "native") {
      const note = NOTE_OVERRIDE[`${row.libraryId}:${row.chart}`] ?? row.method;
      cells.push(finish(lib, row.chart, null, "unsupported", note));
      continue;
    }
    const entry = entryFor(row.libraryId, row.chart);
    const cell = finish(lib, row.chart, entry, entry?.source ? "ok" : "error", entry?.note ?? null);
    if (!entry?.source) cell.error = "missing bundle entry";
    cells.push(cell);
  }

  for (const lib of PHASE3_LIBS) {
    for (const chart of GALLERY_TYPES) {
      if (phase3Seen.has(`${lib.id}:${chart}`)) continue;
      if (lib.id === "googlecharts") {
        cells.push(finish(lib, chart, null, "unsupported", SSR_NONE.googlecharts));
        continue;
      }
      const entry = entryFor(lib.id, chart);
      if (entry?.source) {
        cells.push(finish(lib, chart, entry, "ok", entry.note ?? null));
        continue;
      }
      const note = NOTE_OVERRIDE[`${lib.id}:${chart}`] ?? `${lib.library} has no native ${chart} chart in the pinned package.`;
      cells.push(finish(lib, chart, null, "unsupported", note));
    }
  }

  return cells;
}

export const bundleMethod = "esbuild --bundle --minify, platform browser, NODE_ENV=production, gzip level 9, brotli quality 11. Same config for every entry. ChartKit minimal is createRenderer of one gallery chart from packages/core/src. ChartKit /all is one bundle for every core chart and every theme, without the validator. Rival entries import only the pinned module that chart needs. ECharts uses echarts/core plus one series, its components, and CanvasRenderer. A library is not tree-shakeable when its native entries' gzip sizes differ by at most 512 bytes. That full-package size is recorded once. Those per-type cells are labeled not tree-shakeable and do not repeat the number. A package with one native type keeps the number on the cell. Commercial packages are measured when npm installs them without a license key. Google Charts is not an npm package. Gallery aliases that repair to one chart type are listed on that type and are not a second bundle.";

export { AMBIGUOUS_ALIASES };
