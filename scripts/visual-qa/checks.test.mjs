/**
 * The progress-ring rail bug was a square SVG with height:auto inside a short pane.
 * #156 sizes the SVG to the pane. This loads that CSS and the rule it replaced.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { measureCharts } from "./checks.mjs";
import { repoRootFrom } from "./targets.mjs";

const root = repoRootFrom(dirname(fileURLToPath(import.meta.url)));
const styles = join(root, "apps/web/src/styles");

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220" class="ck-chart" data-ck-type="progress-ring"><rect width="100%" height="100%" fill="#fff"/><circle cx="110" cy="110" r="80" fill="none" stroke="#111" stroke-width="8"/><text x="110" y="116" text-anchor="middle" font-size="20">99%</text></svg>`;

function sheet() {
  return ["global.css", "docs.css", "teach.css"].map((name) => readFileSync(join(styles, name), "utf8")).join("\n");
}

function beforeRailFit(css) {
  const next = css.replace(
    /\.docs-try #response-chart svg \{[^}]*\}/,
    `.docs-try #response-chart svg { width: 100%; height: auto; min-height: 100%; }`,
  );
  if (next === css) throw new Error("did not find the rail SVG rule");
  return next;
}

function has(findings, type) {
  return findings.some((finding) => finding.type === type);
}

async function sample(page, css, widths) {
  const safe = css.replaceAll("</", "<\\/");
  await page.setContent(
    `<!doctype html><meta charset="utf-8"><style>${safe}</style>
    <div class="docs-try-slot"><div class="docs-try chart-demo"><div id="response-chart" class="chart-demo__chart">${SVG}</div></div></div>`,
    { waitUntil: "domcontentloaded" },
  );
  const rows = [];
  for (const width of widths) {
    await page.evaluate((panel) => {
      const root = document.documentElement;
      root.style.setProperty("--try", `${panel}px`);
      root.style.setProperty("--chart-h", `${Math.round(panel * 0.6)}px`);
      document.querySelector("#response-chart").getBoundingClientRect();
    }, width);
    rows.push({ width, findings: await page.evaluate(measureCharts) });
  }
  return rows;
}

test("progress-ring rail overflow is flagged before #156 and clear with that CSS", { timeout: 60000 }, async () => {
  const current = sheet();
  assert.match(current, /\.docs-try #response-chart svg \{[^}]*height:\s*100%[^}]*max-height:\s*100%/s);
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const fixed = await sample(page, current, [280, 380, 720]);
    for (const row of fixed) {
      assert.equal(has(row.findings, "pane-scrollbar"), false, `${row.width} ${JSON.stringify(row.findings)}`);
      assert.equal(has(row.findings, "svg-overflow"), false, `${row.width} ${JSON.stringify(row.findings)}`);
    }

    const broken = await sample(page, beforeRailFit(current), [280, 380, 720]);
    for (const row of broken) {
      assert.equal(has(row.findings, "pane-scrollbar"), true, `${row.width} ${JSON.stringify(row.findings)}`);
    }

    await page.setContent(
      `<!doctype html><style>
        svg { width: 200px; height: 80px; }
        text { font: 16px sans-serif; }
        .wide { width: 2400px; height: 20px; }
      </style>
      <svg class="ck-chart" data-ck-type="line"><text x="10" y="20">April</text><text x="12" y="22">April</text></svg>
      <div class="wide"></div>`,
      { waitUntil: "domcontentloaded" },
    );
    const other = await page.evaluate(measureCharts);
    assert.equal(has(other, "text-overlap"), true, JSON.stringify(other));
    assert.equal(has(other, "page-overflow"), true, JSON.stringify(other));

    await page.setContent(
      `<div hidden><svg class="ck-chart" data-ck-type="strip" width="220" height="80"></svg></div>`,
      { waitUntil: "domcontentloaded" },
    );
    const hidden = await page.evaluate(measureCharts);
    assert.deepEqual(hidden, []);
  } finally {
    await browser.close();
  }
});
