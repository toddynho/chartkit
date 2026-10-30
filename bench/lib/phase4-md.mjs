import { includedGzip } from "../bundle/tree.mjs";

function countsLine(counts) {
  return ["ok", "unsupported", "license-blocked", "error"]
    .map((status) => `${status} ${counts?.[status] ?? 0}`)
    .join(", ");
}

function chartkitBundle(bundle) {
  return (bundle.cells ?? []).filter((cell) => cell.library === "ChartKit minimal" && cell.status === "ok" && cell.gzipBytes != null);
}

function statusCounts(cells) {
  const counts = { ok: 0, unsupported: 0, "license-blocked": 0, error: 0 };
  for (const cell of cells ?? []) {
    if (counts[cell.status] == null) counts[cell.status] = 0;
    counts[cell.status] += 1;
  }
  return counts;
}

/** Summaries are derived from the cells (and the package rows those cells collapsed into). A stored summary is not an input. */
export function bundleSummary(bundle) {
  const rows = chartkitBundle(bundle);
  const sorted = rows.slice().sort((a, b) => a.gzipBytes - b.gzipBytes || a.chart.localeCompare(b.chart));
  const smaller = [];
  const ours = new Map(rows.map((cell) => [cell.chart, cell]));
  for (const cell of bundle.cells ?? []) {
    if (cell.id === "chartkit" || cell.id === "chartkit-all" || cell.status !== "ok") continue;
    const ck = ours.get(cell.chart);
    if (!ck) continue;
    const rival = includedGzip(cell, bundle.packages ?? []);
    const base = includedGzip(ck, bundle.packages ?? []);
    if (rival == null || base == null || rival >= base) continue;
    smaller.push({
      chart: cell.chart,
      library: cell.library,
      gzip: rival,
      chartkitGzip: base,
      label: cell.label ?? null,
      reactExternal: cell.reactExternal?.gzipBytes ?? bundle.packages?.find((pkg) => pkg.id === cell.packageId)?.reactExternal?.gzipBytes ?? null,
    });
  }
  return {
    counts: statusCounts(bundle.cells),
    chartkitGzipMin: sorted[0] ? { chart: sorted[0].chart, gzipBytes: sorted[0].gzipBytes } : null,
    chartkitGzipMax: sorted.at(-1) ? { chart: sorted.at(-1).chart, gzipBytes: sorted.at(-1).gzipBytes } : null,
    rivalSmaller: smaller,
    notTreeShakeable: (bundle.packages ?? []).filter((pkg) => pkg.treeShakeable === false).map((pkg) => ({
      id: pkg.id,
      library: pkg.library,
      gzipBytes: pkg.gzipBytes,
      cssGzipBytes: pkg.cssGzipBytes ?? null,
    })),
  };
}

export function ssrSummary(ssr) {
  const ck = new Map();
  for (const cell of ssr.cells ?? []) {
    if (cell.id === "chartkit" && cell.status === "ok") ck.set(`${cell.chart}:${cell.points}`, cell);
  }
  const faster = [];
  for (const cell of ssr.cells ?? []) {
    if (cell.id === "chartkit" || cell.status !== "ok" || cell.medianMs == null) continue;
    const ours = ck.get(`${cell.chart}:${cell.points}`);
    if (!ours || ours.medianMs == null || cell.medianMs >= ours.medianMs) continue;
    faster.push({
      chart: cell.chart,
      points: cell.points,
      library: cell.library,
      medianMs: cell.medianMs,
      chartkitMedianMs: ours.medianMs,
    });
  }
  return { counts: statusCounts(ssr.cells), rivalFaster: faster };
}

export function bundleMarkdown(bundle, meta) {
  const lines = [bundle.method, ""];
  if (meta) lines.push(`Phase 4 measured **${meta.measuredAt}**, commit \`${meta.commit}\`, Node **${meta.node}**.`, "");
  lines.push(`Cells: ${countsLine(bundle.counts)}. Full rows: \`bench/results/bundle.json\`.`, "");
  const summary = bundleSummary(bundle);
  if (summary.chartkitGzipMin && summary.chartkitGzipMax) {
    lines.push(`ChartKit minimal gzip is smallest for **${summary.chartkitGzipMin.chart}** (${summary.chartkitGzipMin.gzipBytes}) and largest for **${summary.chartkitGzipMax.chart}** (${summary.chartkitGzipMax.gzipBytes}).`, "");
  }
  lines.push("| Chart | gzip | brotli | min | Aliases |");
  lines.push("|---|---:|---:|---:|---|");
  for (const cell of bundle.cells.filter((item) => item.library === "ChartKit minimal")) {
    lines.push(`| ${cell.chart} | ${cell.status === "ok" ? cell.gzipBytes : cell.status} | ${cell.status === "ok" ? cell.brotliBytes : "—"} | ${cell.status === "ok" ? cell.minBytes : "—"} | ${(cell.aliases ?? []).join(", ") || "—"} |`);
  }
  const all = bundle.cells.find((cell) => cell.library === "ChartKit all");
  if (all?.status === "ok") lines.push(`| /all | ${all.gzipBytes} | ${all.brotliBytes} | ${all.minBytes} | one bundle, not per type |`);
  lines.push("");
  const frozen = summary.notTreeShakeable ?? [];
  if (frozen.length) {
    lines.push(frozen.map((pkg) => {
      const css = pkg.cssGzipBytes ? ` CSS adds ${pkg.cssGzipBytes} gzip as a second response.` : "";
      return `${pkg.library} (\`${pkg.id}\`) is not tree-shakeable. Full package ${pkg.gzipBytes} gzip.${css} Per-type cells say not tree-shakeable and do not repeat that number.`;
    }).join(" "), "");
  }
  if (!summary.rivalSmaller.length) {
    lines.push("No measured rival is smaller than ChartKit minimal on the same chart type.");
  } else {
    lines.push("A rival is smaller than ChartKit minimal on these cells. The comparison uses the bundle that was actually produced, including React when that entry imports it. React-external gzip stays on the cell for an app that already ships React.", "");
    lines.push("| Chart | ChartKit gzip | Library | Rival gzip |");
    lines.push("|---|---:|---|---:|");
    for (const row of summary.rivalSmaller) {
      const note = row.label === "not tree-shakeable" ? " (full package)" : "";
      lines.push(`| ${row.chart} | ${row.chartkitGzip} | ${row.library}${note} | ${row.gzip} |`);
    }
  }
  lines.push("");
  const errors = bundle.cells.filter((cell) => cell.status === "error" || cell.status === "license-blocked");
  if (errors.length) {
    lines.push(errors.map((cell) => `${cell.library} ${cell.chart}: ${cell.status}${cell.error ? ` (${String(cell.error).replace(/\s+/g, " ").slice(0, 180)})` : ""}`).join("; ") + ".");
    lines.push("");
  }
  const heat = (bundle.cells ?? []).find((cell) => cell.id === "visx" && cell.chart === "heatmap" && cell.status === "ok");
  if (heat?.gzipBytes != null) {
    lines.push(`visx heatmap is ${heat.gzipBytes} gzip with React and ReactDOM in the bundle, and ${heat.reactExternal?.gzipBytes ?? "—"} gzip with them external. A HeatmapRect-only bundle was 1621 gzip and did not import react-dom.`);
    lines.push("");
  }
  lines.push("uPlot's published stylesheet is a second response when that package is the full build. React external is omitted when the bundle does not import React.");
  return lines.join("\n");
}

export function ssrMarkdown(ssr, meta) {
  const lines = [ssr.method, ""];
  if (meta) lines.push(`Phase 4 measured **${meta.measuredAt}**, commit \`${meta.commit}\`, Node **${meta.node}**.`, "");
  lines.push(`Cells: ${countsLine(ssr.counts)}. Median of ${ssr.samples ?? 5}. Full rows: \`bench/results/ssr.json\`.`, "");
  lines.push("| Chart | N | Median ms |");
  lines.push("|---|---:|---:|");
  for (const cell of ssr.cells.filter((item) => item.id === "chartkit")) {
    const median = cell.status === "ok" ? Number(cell.medianMs).toFixed(2) : cell.status;
    lines.push(`| ${cell.chart} | ${cell.points} | ${median} |`);
  }
  lines.push("");
  const summary = ssrSummary(ssr);
  if (!summary.rivalFaster.length) {
    lines.push("No measured rival is faster than ChartKit at SSR on the same chart and N.");
  } else {
    lines.push("A rival median is lower than ChartKit on these cells.", "");
    lines.push("| Chart | N | ChartKit ms | Library | Rival ms |");
    lines.push("|---|---:|---:|---|---:|");
    for (const row of summary.rivalFaster) {
      lines.push(`| ${row.chart} | ${row.points} | ${row.chartkitMedianMs.toFixed(2)} | ${row.library} | ${row.medianMs.toFixed(2)} |`);
    }
  }
  lines.push("");
  const errors = ssr.cells.filter((cell) => cell.status === "error" || cell.status === "license-blocked");
  if (errors.length) {
    lines.push(errors.slice(0, 40).map((cell) => `${cell.library} ${cell.chart} n=${cell.points}: ${cell.status}${cell.error ? ` (${String(cell.error).replace(/\s+/g, " ").slice(0, 140)})` : ""}`).join("; ") + (errors.length > 40 ? `; and ${errors.length - 40} more.` : "."));
    lines.push("");
  }
  lines.push("Unsupported means that library has no native chart of that shape, or no headless Node string path. The time is null.");
  return lines.join("\n");
}

export function applyPhase4(markdown, { bundle, ssr, meta }) {
  let next = markdown.replace(
    /ChartKit's minimal entry is the registry[\s\S]*?fake chart\./,
    "ChartKit's minimal entry is the registry, one gallery chart, and the Soft preset. Midnight, refined, and editorial register from @chartkitdev/core/features and /all. The `/all` entry is every core chart and every theme, measured once, without the validator. Phase 4 measures every gallery type. Rival cells are native charts only. A library that does not tree-shake records one full-package size. React libraries are measured with React included and with React external. ECharts is the modular import. uPlot's CSS is a second response. A missing headless renderer, a missing native chart, and a package that is not on npm are unsupported. A commercial package that will not install or run without a license key is license-blocked.",
  );
  next = next.replace(
    /## Bundle size\n\n[\s\S]*?\n## Browser render/,
    `## Bundle size\n\n${bundleMarkdown(bundle, { ...meta, measuredAt: bundle.measuredAt ?? meta?.measuredAt })}\n\n## Browser render`,
  );
  next = next.replace(
    /Homepage row `area` is native `stacked-area`\. `gzipBytes` and `ssrMs` are null until a later phase\./,
    "Homepage row `area` is native `stacked-area`. Paint cells leave `gzipBytes` and `ssrMs` null. Phase 4 writes `bench/results/bundle.json` and `bench/results/ssr.json`. The homepage is not wired from this file.",
  );
  next = next.replace(
    /## Server render\n\n[\s\S]*?\n## Agent first-try eval/,
    `## Server render\n\n${ssrMarkdown(ssr, { ...meta, measuredAt: ssr.measuredAt ?? meta?.measuredAt })}\n\n## Agent first-try eval`,
  );
  return next;
}
