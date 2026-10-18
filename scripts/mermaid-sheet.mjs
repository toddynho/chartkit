import { spawnSync } from "node:child_process";
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "packages/core/src");
const entry = join(tmpdir(), "chartkit-mermaid-sheet-entry.ts");
const outfile = join(tmpdir(), "chartkit-mermaid-sheet.mjs");
const htmlPath = join(tmpdir(), "chartkit-mermaid-sheet.html");
const pngPath = join(root, "docs/public/mermaid-sheet.png");

writeFileSync(
  entry,
  `import { readFileSync } from "node:fs";
import { fromMermaid } from ${JSON.stringify(join(src, "mermaid-phase4.ts"))};
import { render } from ${JSON.stringify(join(src, "extra.ts"))};
const dir = ${JSON.stringify(join(src, "__tests__/fixtures/mermaid"))};
const kinds = [
  ["xychart.mmd", "xychart bar and line"],
  ["xychart-horizontal.mmd", "horizontal xychart"],
  ["pie.mmd", "pie showData"],
  ["sankey.mmd", "sankey"],
  ["radar.mmd", "radar"],
  ["treemap.mmd", "treemap"],
  ["quadrant.mmd", "quadrantChart"],
  ["gantt.mmd", "gantt"],
  ["timeline.mmd", "timeline"],
  ["venn.mmd", "venn-beta"],
  ["journey.mmd", "journey"],
];
const rows = kinds.map(([file, label]) => {
  const source = readFileSync(dir + "/" + file, "utf8").trim();
  const result = fromMermaid(source);
  if (!result.spec) throw new Error(label + " " + JSON.stringify(result.warnings));
  return { label, source, svg: render(result.spec) };
});
process.stdout.write(JSON.stringify(rows));
`,
);

await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  logLevel: "silent",
});

const rendered = spawnSync(process.execPath, [outfile], { encoding: "utf8" });
if (rendered.status !== 0) {
  console.error(rendered.stderr);
  process.exit(rendered.status ?? 1);
}
const rows = JSON.parse(rendered.stdout);
const escape = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const html = `<!doctype html>
<html lang="en" style="color-scheme: light">
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="light" />
  <title>Mermaid to ChartKit</title>
  <style>
    html, body { margin: 0; background: #fff; color: #1c1917; color-scheme: light; }
    body { font: 14px/1.45 ui-sans-serif, system-ui, sans-serif; padding: 28px 32px 40px; }
    h1 { font-size: 22px; margin: 0 0 8px; }
    p.lead { margin: 0 0 20px; color: #44403c; }
    section { display: grid; grid-template-columns: minmax(280px, 0.9fr) minmax(420px, 1.2fr); gap: 18px; align-items: start; margin: 0 0 28px; }
    h2 { font-size: 15px; margin: 0 0 8px; }
    pre { margin: 0; padding: 12px 14px; background: #f5f5f4; border-radius: 8px; white-space: pre-wrap; font: 12px/1.45 ui-monospace, monospace; }
    .out { background: #fff; border: 1px solid #e7e5e4; border-radius: 8px; overflow: hidden; }
    .out svg { display: block; width: 100%; height: auto; }
  </style>
</head>
<body>
  <h1>Mermaid in, ChartKit out</h1>
  <p class="lead">Light mode. Each row is the Mermaid source and the SVG from fromMermaid.</p>
  ${rows
    .map(
      (row) => `<section>
        <div><h2>${escape(row.label)}</h2><pre>${escape(row.source)}</pre></div>
        <div class="out">${row.svg}</div>
      </section>`,
    )
    .join("\n")}
</body>
</html>`;
writeFileSync(htmlPath, html);
mkdirSync(dirname(pngPath), { recursive: true });
const chrome = spawnSync(
  "google-chrome",
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1280,6400",
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`,
  ],
  { encoding: "utf8", timeout: 20000 },
);
if (chrome.status !== 0) {
  console.error(chrome.stdout, chrome.stderr);
  process.exit(chrome.status ?? 1);
}
console.log(pngPath);
