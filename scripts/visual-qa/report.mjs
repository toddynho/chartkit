/**
 * Report folder. Image paths are relative to index.html so the folder can be zipped.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const RANK = { high: 3, medium: 2, low: 1 };

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

export function shotSeverity(shot) {
  const levels = [
    ...(shot.checks || []).map((finding) => finding.severity),
    ...(shot.model?.issues || []).map((issue) => issue.severity),
  ].filter((level) => RANK[level]);
  if (!levels.length) return null;
  levels.sort((a, b) => RANK[b] - RANK[a]);
  return levels[0];
}

export function summarize(shots, extra = {}) {
  const bySeverity = { high: 0, medium: 0, low: 0 };
  const byCheck = {};
  let flagged = 0;
  let images = 0;
  for (const shot of shots) {
    images += shot.images?.length || 0;
    for (const finding of shot.checks || []) byCheck[finding.type] = (byCheck[finding.type] || 0) + 1;
    const severity = shotSeverity(shot);
    if (!severity) continue;
    flagged += 1;
    bySeverity[severity] += 1;
  }
  return {
    shots: shots.length,
    flagged,
    clear: shots.length - flagged,
    bySeverity,
    byCheck,
    imagesCaptured: images,
    ...extra,
  };
}

function railLabel(rail) {
  if (!rail) return "rail n/a";
  return rail.store ? `rail ${rail.px}` : `rail ${rail.px} default`;
}

function card(shot) {
  const thumb = shot.images?.find((image) => image.role === "chart") || shot.images?.[0];
  const page = shot.images?.find((image) => image.role === "page");
  const title = [shot.label, shot.demoTitle || shot.demo, shot.viewport, railLabel(shot.rail)].filter(Boolean).join(" · ");
  const checks = (shot.checks || [])
    .map((finding) => `<li><b>${esc(finding.severity)}</b> ${esc(finding.type)} — ${esc(finding.detail)}</li>`)
    .join("");
  const issues = shot.model?.issues?.length
    ? shot.model.issues
        .map(
          (issue) =>
            `<li><b>${esc(issue.severity)}</b> ${esc(issue.type)} — ${esc(issue.reason)} <span class="conf">${esc(issue.confidence)}</span></li>`,
        )
        .join("")
    : "";
  const modelBlock = shot.model
    ? `<h4>Model</h4>${shot.model.error ? `<p class="err">${esc(shot.model.error)}</p>` : ""}${issues ? `<ul>${issues}</ul>` : "<p>No issue reported.</p>"}`
    : "";
  return `<article class="card">
    <h3>${esc(title)}</h3>
    <p class="meta">${esc(shot.page)}</p>
    ${thumb ? `<a href="${esc(thumb.file)}"><img class="thumb" src="${esc(thumb.file)}" alt=""></a>` : ""}
    ${page ? `<img class="full" src="${esc(page.file)}" alt="">` : ""}
    ${modelBlock}
    <h4>Deterministic</h4>
    ${checks ? `<ul>${checks}</ul>` : "<p>None.</p>"}
  </article>`;
}

export function renderHtml({ summary, shots, meta }) {
  const groups = { high: [], medium: [], low: [] };
  const clear = [];
  for (const shot of shots) {
    const severity = shotSeverity(shot);
    if (!severity) clear.push(shot);
    else groups[severity].push(shot);
  }
  const section = (severity) => {
    const items = groups[severity];
    if (!items.length) return "";
    return `<section><h2>${severity} <span>${items.length}</span></h2>${items.map(card).join("\n")}</section>`;
  };
  const clearList = clear
    .slice(0, 400)
    .map((shot) => `<li>${esc(shot.page)} ${esc(shot.demo || "")} ${esc(shot.viewport)} ${esc(railLabel(shot.rail))}</li>`)
    .join("");
  const checkRows = Object.entries(summary.byCheck)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `<li>${esc(name)} <b>${count}</b></li>`)
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>ChartKit visual QA</title>
  <style>
    :root { color-scheme: light; }
    body { margin: 0; font: 15px/1.45 ui-sans-serif, system-ui, sans-serif; background: #f5f5f7; color: #17181a; }
    header, section { max-width: 1100px; margin: 0 auto; padding: 24px; }
    h1 { font-size: 28px; margin: 0 0 8px; }
    h2 { font-size: 20px; margin: 0 0 12px; text-transform: capitalize; }
    h2 span, .conf { color: #8b8d93; font-weight: 500; }
    h3 { font-size: 16px; margin: 0 0 4px; }
    h4 { margin: 12px 0 4px; font-size: 13px; }
    .stats, .checks { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; list-style: none; }
    .stats li, .checks li { background: #fff; border: 1px solid #e6e6e2; border-radius: 999px; padding: 4px 10px; }
    .card { background: #fff; border: 1px solid #e6e6e2; border-radius: 14px; padding: 16px; margin: 0 0 16px; }
    .meta, .note { color: #55575c; }
    .thumb { width: 320px; max-width: 100%; height: auto; background: #f1f1ef; border-radius: 8px; }
    .full { display: block; width: 100%; height: auto; margin-top: 12px; border-radius: 8px; background: #f1f1ef; }
    .err { color: #9f1239; }
    ul { margin: 0; padding-left: 18px; }
    a { color: inherit; }
  </style>
</head>
<body>
  <header>
    <h1>Visual QA</h1>
    <p class="note">${esc(meta.site)} · ${esc(meta.when)} · ${esc(meta.elapsed)}. Image paths are relative to this file. Zip this folder to share it. The model does not gate CI.</p>
    <ul class="stats">
      <li>${summary.shots} shots</li>
      <li>${summary.flagged} flagged</li>
      <li>${summary.clear} clear</li>
      <li>${summary.imagesCaptured} images</li>
      <li>${esc(meta.modelLine)}</li>
    </ul>
    ${checkRows ? `<ul class="checks">${checkRows}</ul>` : ""}
  </header>
  ${section("high")}
  ${section("medium")}
  ${section("low")}
  <section>
    <h2>Clear <span>${clear.length}</span></h2>
    <ul>${clearList || "<li>None.</li>"}</ul>
  </section>
</body>
</html>
`;
}

export async function writeReport(outDir, payload) {
  await mkdir(outDir, { recursive: true });
  const html = renderHtml(payload);
  await writeFile(join(outDir, "index.html"), html);
  await writeFile(join(outDir, "report.json"), `${JSON.stringify(payload, null, 2)}\n`);
  return { html: join(outDir, "index.html"), json: join(outDir, "report.json") };
}
