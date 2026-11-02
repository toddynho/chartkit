/**
 * Cover and Open Graph screenshots from the built dashboard pages.
 * 1280×840 CSS pixels at 2x, and 1200×630 at 2x.
 *
 *   npm run preview
 *   node scripts/dashboard-covers.mjs
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.DASH_URL ?? "http://127.0.0.1:4321";
const slugs = ["stripe", "plausible", "ga", "sentry", "datadog", "robinhood", "linear", "vercel", "shopify", "grafana"];

const browser = await chromium.launch();

const cover = await browser.newContext({ viewport: { width: 1280, height: 840 }, deviceScaleFactor: 2 });
const coverPage = await cover.newPage();
mkdirSync(join(root, "public/dashboards/og"), { recursive: true });
for (const slug of slugs) {
  await coverPage.goto(`${base}/dashboards/${slug}?cover=1`, { waitUntil: "networkidle" });
  await coverPage.evaluate(() => document.fonts.ready);
  await coverPage.waitForSelector(".dash-chart svg");
  await coverPage.screenshot({
    path: join(root, "public/dashboards", `${slug}.png`),
    clip: { x: 0, y: 0, width: 1280, height: 840 },
  });
  console.log(`cover ${slug}`);
}
await cover.close();

const og = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
const ogPage = await og.newPage();
for (const slug of slugs) {
  await ogPage.goto(`${base}/dashboards/${slug}?cover=1`, { waitUntil: "networkidle" });
  await ogPage.evaluate(() => document.fonts.ready);
  await ogPage.waitForSelector(".dash-chart svg");
  await ogPage.screenshot({ path: join(root, "public/dashboards/og", `${slug}.png`) });
  console.log(`og ${slug}`);
}
await og.close();
await browser.close();
