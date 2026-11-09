/**
 * Playwright capture. Headless unless the caller asks otherwise.
 * One browser context per job so a rail width cannot leak into the next page.
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { measureCharts } from "./checks.mjs";

const NO_MOTION = "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}";

function applyStoredRail(px) {
  try {
    if (px == null || px === "") localStorage.removeItem("ck-docs-rail-width");
    else localStorage.setItem("ck-docs-rail-width", String(px));
  } catch {
    /* about:blank */
  }
}

function shotSlug(parts) {
  return parts
    .filter((part) => part != null && part !== "")
    .join("-")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

async function settle(page) {
  await page.waitForLoadState("networkidle", { timeout: 4000 }).catch(() => {});
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function waitForChart(page) {
  await page.waitForFunction(
    () => {
      const pane = document.querySelector("#response-chart");
      if (!pane) return Boolean(document.querySelector("h1, main, body"));
      const svg = pane.querySelector("svg");
      if (!svg) return false;
      const demo = document.querySelector("[data-chart-demo]");
      if (demo && demo.dataset.ready !== "1") return false;
      const type = svg.getAttribute("data-ck-type");
      if (type === "choropleth" || type === "map-points") return svg.querySelectorAll("path").length > 2;
      return true;
    },
    { timeout: 25000 },
  );
}

async function readDemos(page) {
  return page.evaluate(() => {
    const buttons = [...document.querySelectorAll("[data-example-id]")];
    if (!buttons.length) {
      const current = document.querySelector("[data-chart-demo]")?.dataset.example || null;
      return [{ id: current, title: current }];
    }
    return buttons.map((button) => ({
      id: button.dataset.exampleId || "",
      title: button.querySelector(".ex-switch__option-name")?.textContent?.trim() || button.dataset.exampleId || "",
    }));
  });
}

async function showDemo(page, id) {
  const current = await page.evaluate(() => document.querySelector("[data-chart-demo]")?.dataset.example || "");
  if (current === id) return;
  const clicked = await page.evaluate((demoId) => {
    const button = [...document.querySelectorAll("[data-example-id]")].find((el) => el.dataset.exampleId === demoId);
    if (!button) return false;
    button.click();
    return true;
  }, id);
  if (!clicked) throw new Error(`missing demo ${id}`);
  await page.waitForFunction(
    (demoId) => {
      const demo = document.querySelector("[data-chart-demo]");
      const swapping = document.querySelector("[data-demo-chart]")?.classList.contains("is-swap");
      return demo?.dataset.example === demoId && !swapping;
    },
    id,
    { timeout: 15000 },
  );
  await waitForChart(page);
}

async function showPlayType(page, type) {
  await page.waitForSelector(".play-card__chart svg", { timeout: 25000 });
  if (!type) return;
  const switched = await page.evaluate((next) => {
    const button = [...document.querySelectorAll(".play-ex")].find((el) => {
      const meta = el.querySelector(".play-ex__copy span");
      return meta?.textContent?.startsWith(`${next} ·`);
    });
    if (button) {
      button.click();
      return "example";
    }
    const select = document.querySelector('[data-path="type"] select');
    if (select instanceof HTMLSelectElement && [...select.options].some((option) => option.value === next)) {
      select.value = next;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return "select";
    }
    return "";
  }, type);
  if (!switched) throw new Error(`playground has no ${type} example`);
  await page.waitForFunction(
    (next) => document.querySelector(".play-card__chart svg")?.getAttribute("data-ck-type") === next,
    type,
    { timeout: 20000 },
  );
  await settle(page);
}

async function shoot(page, job, demo, status, outDir) {
  const chartSel = job.kind === "play" ? ".play-card__chart" : "#response-chart";
  const chart = page.locator(chartSel).first();
  const hasChart = (await chart.count()) > 0;
  if (job.viewport === "mobile" && hasChart) await chart.scrollIntoViewIfNeeded().catch(() => {});
  else await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

  const checks = await page.evaluate(measureCharts);
  if (status >= 400) {
    checks.unshift({ type: "load-error", severity: "high", detail: `HTTP ${status}` });
  }

  const id = shotSlug([
    job.kind,
    job.type,
    demo.id || demo.title || job.label,
    job.viewport,
    job.rail ? `w${job.rail.px}` : null,
  ]);
  const images = [];
  const pageRel = `shots/${id}-page.png`;
  await page.screenshot({ path: join(outDir, pageRel), animations: "disabled" });
  images.push({ role: "page", file: pageRel, width: job.width, height: job.height });

  if (hasChart) {
    const box = await chart.boundingBox();
    if (box && box.width > 2 && box.height > 2) {
      const chartRel = `shots/${id}-chart.png`;
      await chart.screenshot({ path: join(outDir, chartRel), animations: "disabled" });
      images.push({
        role: "chart",
        file: chartRel,
        width: Math.round(box.width),
        height: Math.round(box.height),
      });
    }
  }

  return {
    id,
    kind: job.kind,
    page: job.path,
    label: job.label || job.type || job.path,
    type: job.type,
    demo: demo.id || null,
    demoTitle: demo.title || null,
    viewport: job.viewport,
    viewportSize: { width: job.width, height: job.height },
    rail: job.rail,
    status,
    checks,
    images,
    model: null,
  };
}

async function captureJob(page, job, outDir) {
  const response = await page.goto(job.url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.addStyleTag({ content: NO_MOTION }).catch(() => {});
  const status = response?.status() ?? 0;
  if (job.kind === "docs") {
    await waitForChart(page);
    await settle(page);
    const demos = await readDemos(page);
    const shots = [];
    for (const demo of demos) {
      if (demo.id) await showDemo(page, demo.id);
      shots.push(await shoot(page, job, demo, status, outDir));
    }
    return shots;
  }
  if (job.kind === "play") {
    await showPlayType(page, job.type);
    const seen = await page.evaluate(() => document.querySelector(".play-card__chart svg")?.getAttribute("data-ck-type") || "default");
    return [await shoot(page, job, { id: job.type || "default", title: seen }, status, outDir)];
  }
  await settle(page);
  return [await shoot(page, job, { id: null, title: job.label }, status, outDir)];
}

export async function runCapture({ browser, jobs, siteUrl, outDir, concurrency, onJob }) {
  await mkdir(join(outDir, "shots"), { recursive: true });
  const origin = siteUrl.replace(/\/$/, "");
  const shots = [];
  let cursor = 0;
  const workers = Math.max(1, Math.min(concurrency, jobs.length || 1));

  async function worker() {
    for (;;) {
      const index = cursor++;
      if (index >= jobs.length) return;
      const job = { ...jobs[index], url: new URL(jobs[index].path, `${origin}/`).href };
      const context = await browser.newContext({
        viewport: { width: job.width, height: job.height },
        locale: "en-US",
        reducedMotion: "reduce",
        deviceScaleFactor: 1,
      });
      try {
        const page = await context.newPage();
        page.setDefaultTimeout(20000);
        if (job.rail?.store) await page.addInitScript(applyStoredRail, String(job.rail.px));
        const pending = captureJob(page, job, outDir);
        pending.catch(() => {});
        const produced = await Promise.race([
          pending,
          new Promise((_, reject) => setTimeout(() => reject(new Error("capture timed out")), 90000)),
        ]);
        shots.push(...produced);
        onJob?.(job, produced);
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        const failed = {
          id: shotSlug([job.kind, job.type, job.viewport, job.rail ? `w${job.rail.px}` : null, "error"]),
          kind: job.kind,
          page: job.path,
          label: job.label || job.type || job.path,
          type: job.type,
          demo: null,
          demoTitle: null,
          viewport: job.viewport,
          viewportSize: { width: job.width, height: job.height },
          rail: job.rail,
          status: 0,
          checks: [{ type: "capture-error", severity: "high", detail }],
          images: [],
          model: null,
        };
        shots.push(failed);
        onJob?.(job, [failed]);
      } finally {
        await context.close().catch(() => {});
      }
    }
  }

  await Promise.all(Array.from({ length: workers }, () => worker()));
  shots.sort((a, b) => a.id.localeCompare(b.id));
  return shots;
}
