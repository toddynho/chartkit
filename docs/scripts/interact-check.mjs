/**
 * Hover a chart on the home page, one example, one spec page, and the playground.
 * The tooltip has to show a value from that chart. Legend toggle is clicked when the legend is interactive.
 *
 * Usage: node docs/scripts/interact-check.mjs [baseUrl]
 * Starts `next start` on port 3457 when baseUrl is omitted.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const port = 3457;
const base = process.argv[2] ?? `http://127.0.0.1:${port}`;
const ownServer = !process.argv[2];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForServer(url) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // the server is still booting
    }
    await delay(250);
  }
  throw new Error(`docs server did not answer at ${url}`);
}

async function tipText(page, root) {
  const tip = root.locator("[data-ck-tip], [data-ck-extra-tip]").first();
  await tip.waitFor({ state: "visible", timeout: 8_000 });
  const text = (await tip.textContent()) ?? "";
  assert(text.trim().length > 0, "tooltip was empty");
  return text;
}

async function hoverSvg(page, svg) {
  const box = await svg.boundingBox();
  assert(box, "chart svg has no box");
  await page.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.58);
  await page.mouse.move(box.x + box.width * 0.84, box.y + box.height * 0.62);
}

async function hoverMark(page, root) {
  const mark = root.locator("[data-ck-mark]").first();
  await mark.waitFor({ state: "attached", timeout: 8_000 });
  const label = await mark.getAttribute("aria-label");
  assert(label, "phase-3 mark has no aria-label");
  await mark.hover();
  return label;
}

async function main() {
  let child;
  if (ownServer) {
    child = spawn("npm", ["run", "start", "--workspace=chartkit-docs", "--", "-p", String(port)], {
      stdio: "inherit",
      detached: true,
      cwd: new URL("../..", import.meta.url).pathname,
    });
    await waitForServer(base);
    if (child.exitCode !== null) throw new Error(`docs server exited with ${child.exitCode}`);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const failures = [];

  try {
    await page.goto(`${base}/`, { waitUntil: "networkidle" });
    const hero = page.locator(".hero-stage");
    await hero.locator("[data-ck-mounted='1']").waitFor();
    await hoverSvg(page, hero.locator("svg"));
    const heroTip = await tipText(page, hero);
    assert(/(42|46|44|51|58|55|63|61|70|74|72|81)/.test(heroTip), `home tooltip missed the revenue series: ${heroTip}`);
    assert(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(heroTip), `home tooltip missed the month: ${heroTip}`);
    const target = hero.locator("svg text", { hasText: /^Target$/ });
    if ((await target.count()) > 0) {
      await target.first().click();
      await page.waitForFunction(() => {
        const nodes = document.querySelectorAll(".hero-stage svg text");
        return Array.from(nodes).some((node) => node.textContent === "Target" && node.getAttribute("opacity") === "0.35");
      });
    }

    await page.goto(`${base}/examples/quarterly-units`, { waitUntil: "networkidle" });
    const example = page.locator(".editor");
    await example.locator("[data-ck-mounted='1']").waitFor();
    await hoverSvg(page, example.locator("svg"));
    const exampleTip = await tipText(page, example);
    assert(/(40|55|48|62)/.test(exampleTip), `example tooltip missed a quarterly value: ${exampleTip}`);
    assert(/Q[1-4]/.test(exampleTip), `example tooltip missed the quarter: ${exampleTip}`);

    await page.goto(`${base}/spec/funnel`, { waitUntil: "networkidle" });
    const spec = page.locator("article");
    await spec.locator("[data-ck-mounted='1']").waitFor();
    let specTip = "";
    let expected = "";
    for (let attempt = 0; attempt < 12; attempt++) {
      expected = await hoverMark(page, spec);
      const tip = page.locator("[data-ck-extra-tip]");
      if (await tip.isVisible().catch(() => false)) {
        specTip = (await tip.textContent()) ?? "";
        if (specTip.includes(expected)) break;
      }
      await delay(250);
    }
    assert(specTip.includes(expected), `spec tooltip ${JSON.stringify(specTip)} did not include ${JSON.stringify(expected)}`);

    await page.goto(`${base}/playground`, { waitUntil: "networkidle" });
    const play = page.locator(".editor-full");
    await play.locator("[data-ck-mounted='1']").waitFor();
    await hoverSvg(page, play.locator("svg"));
    const playTip = await tipText(page, play);
    assert(/(42|46|44|51|58|55|63|61|70|74|72|81)/.test(playTip), `playground tooltip missed the revenue series: ${playTip}`);

    const edited = await page.locator("#spec-json").inputValue();
    const next = edited.replace('"Revenue"', '"Revenue edited"');
    assert(next !== edited, "playground spec had no Revenue title to edit");
    await page.locator("#spec-json").fill(next);
    await page.waitForFunction(() => {
      const title = document.querySelector(".editor-full svg text");
      return title && title.textContent === "Revenue edited";
    });
  } catch (error) {
    failures.push(error instanceof Error ? error.stack ?? error.message : String(error));
  } finally {
    await page.close();
    await browser.close();
    if (child?.pid) {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        child.kill("SIGTERM");
      }
    }
  }

  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log("interact check passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
