/**
 * Labels during a motion morph, checked in painted output in Chromium.
 *
 *   node --test scripts/motion-labels/motion-labels.test.mjs
 *   CK_SRC=<other checkout>/packages/core/src node --test scripts/motion-labels/motion-labels.test.mjs   # an older build, to see it fail
 *
 * Time is Playwright's page clock, paused. `advance(page, ms)` runs the frames up to that
 * millisecond, so every frame below is the same on every run. The motion curve is read back from
 * the bars: `progress()` is how far the first bar has travelled, 0 to 1.
 */
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { chromium } from "playwright";
import { BASE, DESC, NEXT, SORTED, X, advance, bundle, frame, intersects, open, update } from "./harness.mjs";

/** 576 ms into an 800 ms morph is half way along the curve as painted today. `assertMid` fails loudly if the curve changes. */
const MID = 576;
const FRAMES = [96, 192, 288, 384, 480, 576, 672, 752];
const vertical = (spec) => ({ ...spec, mark: { ...spec.mark, orientation: "vertical" } });
const dayOf = (key) => key.slice(key.lastIndexOf(":") + 1);
const byDay = (list) => new Map(list.map((item) => [dayOf(item.key), item]));

let browser;
let source;
before(async () => {
  source = await bundle(process.env.CK_SRC || undefined);
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
});

async function session(spec, options) {
  const page = await open(browser, source, spec, options);
  return { page, close: () => page.context().close() };
}

/** Bar geometry of a spec at rest, from a second mount on a fresh page. */
async function rest(spec) {
  const { page, close } = await session(spec);
  const shot = await frame(page);
  await close();
  return shot;
}

function progress(shot, from, to, side = "w") {
  const pick = (list, key) => list.bars.find((bar) => bar.key === key)[side];
  const key = from.bars.find((bar) => Math.abs(pick(to, bar.key) - bar[side]) > 2).key;
  return (pick(shot, key) - pick(from, key)) / (pick(to, key) - pick(from, key));
}
function assertMid(value) {
  assert.ok(value > 0.3 && value < 0.7, `expected a mid-tween frame, got progress ${value.toFixed(3)}`);
}

test("A: a value label rides its bar end and counts from the old value to the new one", async () => {
  const from = await rest(BASE);
  const to = await rest(NEXT);
  const { page, close } = await session(BASE);
  await update(page, NEXT);
  await advance(page, MID);
  const shot = await frame(page);
  assertMid(progress(shot, from, to));
  const bars = byDay(shot.bars);
  const labels = byDay(shot.values);
  assert.equal(labels.size, 5, "five value labels are keyed to their bars during the morph");
  BASE.data.forEach((row, i) => {
    const bar = bars.get(row.day);
    const label = labels.get(row.day);
    const gap = label.x - (bar.x + bar.w);
    assert.ok(Math.abs(gap - 4) <= 2, `${row.day}: label starts ${gap.toFixed(2)} px past the bar end, expected 4 ± 2`);
    const shown = Number(label.text.replace(/[$B]/g, ""));
    assert.match(label.text, /^\$\d+\.\d\dB$/, `${row.day}: "${label.text}" keeps the label format`);
    assert.ok(shown > row.spend && shown < NEXT.data[i].spend, `${row.day}: ${label.text} is between $${row.spend} and $${NEXT.data[i].spend}`);
  });
  await close();
});

test("A: on a sort the value label stays in its bar's row", async () => {
  const from = await rest(NEXT);
  const to = await rest(SORTED);
  const { page, close } = await session(NEXT);
  await update(page, SORTED);
  await advance(page, MID);
  const shot = await frame(page);
  assertMid(progress(shot, from, to, "y"));
  const bars = byDay(shot.bars);
  const labels = byDay(shot.values);
  assert.equal(labels.size, 5);
  for (const [day, label] of labels) {
    const bar = bars.get(day);
    const mid = label.y + label.h / 2;
    assert.ok(mid > bar.y && mid < bar.y + bar.h, `${day}: label centre y ${mid.toFixed(1)} is inside its bar's row ${bar.y.toFixed(1)}–${(bar.y + bar.h).toFixed(1)}`);
    assert.ok(Math.abs(label.x - (bar.x + bar.w) - 4) <= 2, `${day}: label is at its bar end`);
  }
  await close();
});

test("A: the last frame is the settled render(), for a value change and then a sort", async () => {
  const { page, close } = await session(BASE);
  for (const spec of [NEXT, SORTED]) {
    await update(page, spec);
    await advance(page, 1000);
    const got = await page.evaluate((next) => {
      const host = document.getElementById("host");
      const still = document.createElement("div");
      still.innerHTML = window.CK.render(next);
      const live = host.querySelector("svg").cloneNode(true);
      live.removeAttribute("tabindex");
      return { live: live.outerHTML, still: still.querySelector("svg").outerHTML, extras: host.querySelectorAll("[data-ck-delta],[data-ck-motion-live],[data-ck-key^='v:']").length };
    }, spec);
    assert.equal(got.live, got.still);
    assert.equal(got.extras, 0, "no percent label, live region or tween-only key is left behind");
  }
  await close();
});

test("A: reduced motion snaps", async () => {
  const { page, close } = await session(BASE, { reducedMotion: "reduce" });
  await update(page, SORTED);
  const shot = await frame(page);
  const to = await rest(SORTED);
  assert.deepEqual(shot.bars, to.bars, "bars are at the new spec with no time passed");
  assert.equal(shot.deltas.length, 0);
  assert.equal(shot.values.length, 0, "no label is mid-tween");
  await close();
});

for (const [name, turn] of [["horizontal", (spec) => spec], ["vertical", vertical]]) {
  test(`B: category labels never overlap or leave the canvas on a ${name} re-sort`, async () => {
    const first = turn(X);
    const next = turn({ ...X, sort: DESC });
    const days = new Set(X.data.map((row) => row.day));
    const { page, close } = await session(first);
    await update(page, next);
    let clock = 0;
    let sawMoving = false;
    for (const at of FRAMES) {
      await advance(page, at - clock);
      clock = at;
      const shot = await frame(page);
      if (shot.cats.some((label) => label.opacity < 1)) sawMoving = true;
      for (const label of shot.cats) {
        assert.ok(days.has(label.text), `${at} ms: "${label.text}" is a whole category name`);
        assert.ok(
          label.x >= 0 && label.y >= 0 && label.x + label.w <= shot.view.w && label.y + label.h <= shot.view.h,
          `${at} ms: "${label.text}" box ${label.x.toFixed(1)},${label.y.toFixed(1)} ${label.w.toFixed(1)}×${label.h.toFixed(1)} is inside the ${shot.view.w}×${shot.view.h} viewBox`,
        );
      }
      for (let i = 0; i < shot.cats.length; i++) {
        for (let j = i + 1; j < shot.cats.length; j++) {
          assert.ok(!intersects(shot.cats[i], shot.cats[j]), `${at} ms: "${shot.cats[i].text}" and "${shot.cats[j].text}" overlap`);
        }
      }
    }
    assert.ok(sawMoving, "the frames were sampled mid-tween");
    await advance(page, 1000);
    const done = await frame(page);
    assert.equal(done.cats.length, 5, "all five labels are back at full opacity");
    assert.ok(done.cats.every((label) => label.opacity === 1));
    await close();
  });
}

test("C: a horizontal bar's percent label sits past the bar end on the bar's own row", async () => {
  const { page, close } = await session(BASE);
  await update(page, NEXT);
  let clock = 0;
  for (const at of [96, 288, MID]) {
    await advance(page, at - clock);
    clock = at;
    const shot = await frame(page);
    assert.equal(shot.deltas.length, 5, `${at} ms: five percent labels`);
    const used = new Set();
    for (const delta of shot.deltas) {
      const mid = delta.y + delta.h / 2;
      const rows = shot.bars.filter((bar) => mid > bar.y && mid < bar.y + bar.h);
      assert.equal(rows.length, 1, `${at} ms: ${delta.text} centre y ${mid.toFixed(1)} is inside one bar's row`);
      const bar = rows[0];
      assert.ok(!used.has(bar.key), `${at} ms: one percent label per bar`);
      used.add(bar.key);
      assert.ok(delta.x >= bar.x + bar.w, `${at} ms: ${delta.text} starts at ${delta.x.toFixed(1)}, at or past the bar end ${(bar.x + bar.w).toFixed(1)}`);
      assert.ok(delta.x + delta.w <= shot.view.w, `${at} ms: ${delta.text} is inside the canvas`);
      assert.equal(delta.fontSize, "11px", "with no theme size the percent label is the 11px tick size");
    }
    const others = [...shot.chrome, ...shot.values];
    assert.equal(shot.chrome.length, 2, "title and subtitle are measured");
    for (const delta of shot.deltas) {
      for (const box of others) assert.ok(!intersects(delta, box), `${at} ms: ${delta.text} overlaps "${box.text}"`);
      for (const other of shot.deltas) if (other !== delta) assert.ok(!intersects(delta, other), `${at} ms: two percent labels overlap`);
    }
  }
  await close();
});

test("C: the percent label takes the theme font size", async () => {
  const themed = (spec) => ({ ...spec, theme: { tokens: { fontSize: 15 } } });
  const { page, close } = await session(themed(BASE));
  await update(page, themed(NEXT));
  await advance(page, 96);
  const shot = await frame(page);
  assert.ok(shot.deltas.length > 0);
  for (const delta of shot.deltas) assert.equal(delta.fontSize, "15px");
  for (const delta of shot.deltas) for (const box of [...shot.chrome, ...shot.values]) assert.ok(!intersects(delta, box), `${delta.text} overlaps "${box.text}"`);
  await close();
});

test("C: a vertical bar's percent label stays above the bar top, clear of the value label", async () => {
  const { page, close } = await session(vertical(BASE));
  await update(page, vertical(NEXT));
  await advance(page, 288);
  const shot = await frame(page);
  assert.equal(shot.deltas.length, 5);
  for (const delta of shot.deltas) {
    const mid = delta.x + delta.w / 2;
    const bar = shot.bars.find((item) => mid > item.x && mid < item.x + item.w);
    assert.ok(bar, `${delta.text} is centred over a bar`);
    assert.ok(delta.y + delta.h <= bar.y, `${delta.text} is above the bar top`);
    for (const box of [...shot.chrome, ...shot.values]) assert.ok(!intersects(delta, box), `${delta.text} overlaps "${box.text}"`);
  }
  await close();
});
