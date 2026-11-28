/**
 * Mid-tween screenshots of the three label repros, at 2x, with the page clock paused.
 *   node scripts/motion-labels/capture.mjs <out dir> <tag>
 *   CK_SRC=<other checkout>/packages/core/src node scripts/motion-labels/capture.mjs <out dir> before
 * Not part of npm test. The pull request's before and after pictures came from this.
 */
import { chromium } from "playwright";
import { join } from "node:path";
import * as H from "./harness.mjs";
const out = process.argv[2];
const tag = process.argv[3] || "before";
const src = await H.bundle(process.env.CK_SRC || undefined);
const browser = await chromium.launch();
async function shoot(name, first, steps, times, patch = (s) => s) {
  for (const at of times) {
    const page = await H.open(browser, src, patch(first), { scale: 2 });
    let last;
    for (const s of steps.slice(0, -1)) { await H.update(page, patch(s)); await H.advance(page, 1000); }
    await H.update(page, patch(steps[steps.length - 1]));
    await H.advance(page, at);
    const f = await H.frame(page);
    await page.locator("#host").screenshot({ path: join(out, `${tag}-${name}-${at}ms.png`) });
    console.log(name, at, "bars", f.bars.map(b => `${b.key}@${b.x.toFixed(0)},${b.y.toFixed(0)} w${b.w.toFixed(0)}`).join(" | "));
    console.log("  cats", f.cats.map(b => `${b.text}@${b.x.toFixed(1)},${b.y.toFixed(0)}`).join(" | "));
    console.log("  values", f.values.map(b => `${b.text}@${b.x.toFixed(0)},${b.y.toFixed(0)}`).join(" | "));
    console.log("  deltas", f.deltas.map(b => `${b.text}@${b.x.toFixed(0)},${b.y.toFixed(0)} ${b.fontSize}`).join(" | "));
    console.log("  chrome", f.chrome.map(b => `${b.text}@${b.x.toFixed(0)},${b.y.toFixed(0)},${b.w.toFixed(0)}x${b.h.toFixed(0)}`).join(" | "));
    await page.context().close();
  }
}
const vert = (s) => ({ ...s, mark: { ...s.mark, orientation: "vertical" } });
await shoot("A-value", H.BASE, [H.NEXT], [100, 576]);
await shoot("A-sort", H.BASE, [H.NEXT, H.SORTED], [100, 576]);
await shoot("B-sort", H.X, [{ ...H.X, sort: H.DESC }], [150, 300, 450, 576, 650]);
await shoot("B-sort-vertical", H.X, [{ ...H.X, sort: H.DESC }], [150, 300, 450, 576, 650], vert);
await shoot("C-delta", H.BASE, [H.NEXT], [100]);
await browser.close();
