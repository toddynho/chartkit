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

function gap(box, x, y) {
  const dx = x < box.x ? box.x - x : x > box.x + box.width ? x - (box.x + box.width) : 0;
  const dy = y < box.y ? box.y - y : y > box.y + box.height ? y - (box.y + box.height) : 0;
  return Math.hypot(dx, dy);
}

async function tipLocator(page, root) {
  const local = root.locator("[data-ck-tip]");
  if ((await local.count()) > 0) return local.first();
  return page.locator("[data-ck-extra-tip]").first();
}

async function hoveredPoint(root, fallback) {
  const dot = root.locator("[data-ck-dot]").first();
  if ((await dot.count()) > 0) {
    const box = await dot.boundingBox();
    if (box) return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }
  return fallback;
}

async function assertTipNear(page, root, point) {
  const tip = await tipLocator(page, root);
  await tip.waitFor({ state: "visible", timeout: 8_000 });
  const tipBox = await tip.boundingBox();
  const hostBox = await root.locator("[data-ck-mounted='1']").first().boundingBox();
  assert(tipBox && hostBox, "tooltip or chart has no box");
  const distance = gap(tipBox, point.x, point.y);
  const inside =
    tipBox.x >= hostBox.x - 2 &&
    tipBox.y >= hostBox.y - 2 &&
    tipBox.x + tipBox.width <= hostBox.x + hostBox.width + 2 &&
    tipBox.y + tipBox.height <= hostBox.y + hostBox.height + 2;
  assert(
    distance <= 24 || inside,
    `tooltip is ${distance.toFixed(1)}px from the hovered point and outside the chart`,
  );
  const text = (await tip.textContent()) ?? "";
  assert(text.trim().length > 0, "tooltip was empty");
  return text;
}

async function hoverSvg(page, svg) {
  const box = await svg.boundingBox();
  assert(box, "chart svg has no box");
  const point = { x: box.x + box.width * 0.84, y: box.y + box.height * 0.62 };
  await page.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.58);
  await page.mouse.move(point.x, point.y);
  return point;
}

async function scrollChart(page, root) {
  await root.locator("[data-ck-mounted='1']").first().evaluate((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, top - 160));
  });
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
    let heroPoint = await hoverSvg(page, hero.locator("svg"));
    let heroTip = await assertTipNear(page, hero, await hoveredPoint(hero, heroPoint));
    assert(/(42|46|44|51|58|55|63|61|70|74|72|81)/.test(heroTip), `home tooltip missed the revenue series: ${heroTip}`);
    assert(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(heroTip), `home tooltip missed the month: ${heroTip}`);
    await scrollChart(page, hero);
    heroPoint = await hoverSvg(page, hero.locator("svg"));
    heroTip = await assertTipNear(page, hero, await hoveredPoint(hero, heroPoint));
    assert(/(42|46|44|51|58|55|63|61|70|74|72|81)/.test(heroTip), `scrolled home tooltip missed the revenue series: ${heroTip}`);
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
    let examplePoint = await hoverSvg(page, example.locator("svg"));
    let exampleTip = await assertTipNear(page, example, await hoveredPoint(example, examplePoint));
    assert(/(40|55|48|62)/.test(exampleTip), `example tooltip missed a quarterly value: ${exampleTip}`);
    assert(/Q[1-4]/.test(exampleTip), `example tooltip missed the quarter: ${exampleTip}`);
    await scrollChart(page, example);
    examplePoint = await hoverSvg(page, example.locator("svg"));
    exampleTip = await assertTipNear(page, example, await hoveredPoint(example, examplePoint));
    assert(/Q[1-4]/.test(exampleTip), `scrolled example tooltip missed the quarter: ${exampleTip}`);

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
    assert(!specTip.includes("100% of previous"), `first funnel stage still says 100% of previous: ${specTip}`);
    const markBox = await spec.locator("[data-ck-mark]").first().boundingBox();
    assert(markBox, "funnel stage has no box");
    await assertTipNear(page, spec, { x: markBox.x + markBox.width / 2, y: markBox.y + markBox.height / 2 });
    await scrollChart(page, spec);
    await hoverMark(page, spec);
    const scrolledMark = await spec.locator("[data-ck-mark]").first().boundingBox();
    await assertTipNear(page, spec, { x: scrolledMark.x + scrolledMark.width / 2, y: scrolledMark.y + scrolledMark.height / 2 });

    await page.goto(`${base}/playground`, { waitUntil: "networkidle" });
    const play = page.locator(".editor-full");
    await play.locator("[data-ck-mounted='1']").waitFor();
    let playPoint = await hoverSvg(page, play.locator("svg"));
    let playTip = await assertTipNear(page, play, await hoveredPoint(play, playPoint));
    assert(/(42|46|44|51|58|55|63|61|70|74|72|81)/.test(playTip), `playground tooltip missed the revenue series: ${playTip}`);
    await scrollChart(page, play);
    playPoint = await hoverSvg(page, play.locator("svg"));
    playTip = await assertTipNear(page, play, await hoveredPoint(play, playPoint));
    assert(/(42|46|44|51|58|55|63|61|70|74|72|81)/.test(playTip), `scrolled playground tooltip missed the revenue series: ${playTip}`);

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
