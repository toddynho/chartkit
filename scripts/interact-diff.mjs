/**
 * Differential check for interact changes that must not change behaviour.
 * Drives the same pointer, legend, click, keyboard, wheel, drag, update and selection steps through
 * two builds of packages/core/src in Chromium and compares host.innerHTML (and the custom tooltip's
 * calls) after every step. Exits 1 on the first difference per case, with the text around it.
 *
 *   node scripts/interact-diff.mjs <other checkout>/packages/core/src            # that build against this checkout
 *   node scripts/interact-diff.mjs <srcA> <srcB>                                 # any two builds
 *   ONLY=bar,line-multi node scripts/interact-diff.mjs <srcA>                    # some cases
 *   TOUCH=1 node scripts/interact-diff.mjs <srcA>                                # the sweep as touch taps
 *   MOTION=1 node scripts/interact-diff.mjs <srcA>                               # motion and animation on, with waits
 *
 * Run a build against itself first: it must report 0 differences, or a step is not deterministic.
 * Not part of npm test. Uses the root install of esbuild and Playwright.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const given = process.argv.slice(2);
if (!given.length) {
  console.error("usage: node scripts/interact-diff.mjs <srcA> [srcB]");
  process.exit(2);
}
const srcA = resolve(given[0]);
const srcB = resolve(given[1] ?? join(root, "packages/core/src"));
const work = join(tmpdir(), `chartkit-interact-diff-${process.pid}`);
mkdirSync(work, { recursive: true });
async function bundleOf(src, id) {
  const entry = join(work, `${id}.mjs`);
  writeFileSync(entry, `import { render } from ${JSON.stringify(join(src, "all.ts"))};\nimport { attach } from ${JSON.stringify(join(src, "interact.ts"))};\nexport { render, attach };\n`);
  const outfile = join(work, `${id}.js`);
  await build({ entryPoints: [entry], bundle: true, format: "iife", globalName: "CK", platform: "browser", outfile, logLevel: "silent" });
  return readFileSync(outfile, "utf8");
}
const MOTION = !!process.env.MOTION;
const PAUSE = MOTION ? 700 : 60;
const A = await bundleOf(srcA, "a");
const B = await bundleOf(srcB, "b");

function setup() {
  const wave = (i, k) => Math.round((50 + 30 * Math.sin(i / (7 + k * 3)) + ((i * (13 + k * 4)) % 17)) * 10) / 10;
  const names = ["alpha", "beta", "gamma", "delta", "epsilon"];
  const wide = (n, k, key = "t", cat = false) => {
    const rows = [];
    for (let i = 0; i < n; i++) {
      const row = { [key]: cat ? `C${i + 1}` : i };
      for (let s = 0; s < k; s++) row[names[s]] = wave(i, s);
      rows.push(row);
    }
    return rows;
  };
  const long = (n, k) => {
    const rows = [];
    for (let i = 0; i < n; i++) for (let s = 0; s < k; s++) rows.push({ label: `C${i + 1}`, team: names[s], value: wave(i, s) });
    return rows;
  };
  const base = { version: "1", size: { width: 640, height: 360 }, a11y: { alt: "x" } };
  const y3 = names.slice(0, 3);
  window.SPECS = {
    line: { ...base, type: "line", data: wide(300, 1), encoding: { x: "t", y: "alpha" } },
    "line-big": { ...base, type: "line", data: wide(20000, 2), encoding: { x: "t", y: ["alpha", "beta"] } },
    "line-points": { ...base, type: "line", data: wide(24, 3, "label", true), encoding: { x: "label", y: y3 }, mark: { points: "always", curve: "monotone" }, legend: { interactive: true } },
    "line-multi": { ...base, type: "line", data: wide(400, 5), encoding: { x: "t", y: names }, legend: { interactive: true, position: "top" } },
    "line-long": { ...base, type: "line", data: long(40, 4), encoding: { x: "label", y: "value", series: "team" }, legend: { interactive: true } },
    "line-notes": { ...base, type: "line", data: wide(60, 2), encoding: { x: "t", y: ["alpha", "beta"] }, annotations: [{ type: "rule", axis: "y", value: 60, label: "Target" }, { type: "band", axis: "x", from: 10, to: 20, label: "Launch" }] },
    "line-select": { ...base, type: "line", data: wide(30, 3, "label", true), encoding: { x: "label", y: y3 }, mark: { points: "always" }, interaction: { select: "point" } },
    "line-series-select": { ...base, type: "line", data: wide(30, 3), encoding: { x: "t", y: y3 }, interaction: { select: "series" } },
    "line-zoom": { ...base, type: "line", data: wide(500, 2), encoding: { x: "t", y: ["alpha", "beta"] }, interaction: { zoom: "x", brush: "x" } },
    "line-nearest": { ...base, type: "line", data: wide(80, 3), encoding: { x: "t", y: y3 }, tooltip: { mode: "nearest", crosshairLabel: true, position: "bottom" } },
    "line-fields": { ...base, type: "line", data: wide(80, 3), encoding: { x: "t", y: y3 }, tooltip: { fields: ["t", { field: "alpha", title: "A" }], position: "left" } },
    "line-right": { ...base, type: "line", data: wide(80, 3), encoding: { x: "t", y: y3 }, tooltip: { position: "right", template: "{name}: {value}" } },
    "line-unsorted": { ...base, type: "line", data: wide(50, 2).reverse(), encoding: { x: "t", y: ["alpha", "beta"] } },
    "line-canvas": { ...base, type: "line", render: "canvas", data: wide(3000, 2), encoding: { x: "t", y: ["alpha", "beta"] } },
    area: { ...base, type: "stacked-area", data: wide(200, 3), encoding: { x: "t", y: y3 }, legend: { interactive: true } },
    bar: { ...base, type: "bar", data: wide(12, 1, "label", true), encoding: { x: "label", y: "alpha" } },
    "bar-grouped": { ...base, type: "bar", data: wide(10, 3, "label", true), encoding: { x: "label", y: y3 }, legend: { interactive: true } },
    "bar-stacked": { ...base, type: "bar", data: wide(10, 3, "label", true), encoding: { x: "label", y: y3 }, mark: { stack: "normal" } },
    "bar-horizontal": { ...base, type: "bar", data: wide(9, 2, "label", true), encoding: { x: "label", y: ["alpha", "beta"] }, mark: { orientation: "horizontal" } },
    "bar-sorted": { ...base, type: "bar", data: wide(12, 1, "label", true), encoding: { x: "label", y: "alpha" }, sort: { field: "alpha", order: "descending" } },
    "bar-long": { ...base, type: "bar", data: long(8, 3), encoding: { x: "label", y: "value", series: "team" } },
    "bar-cross": { ...base, type: "bar", data: wide(12, 2, "label", true), encoding: { x: "label", y: ["alpha", "beta"] }, tooltip: { crosshair: true } },
    "bar-select": { ...base, type: "bar", data: wide(8, 2, "label", true), encoding: { x: "label", y: ["alpha", "beta"] }, interaction: { select: "point" } },
    "bar-many": { ...base, type: "bar", data: wide(120, 1, "label", true), encoding: { x: "label", y: "alpha" } },
    scatter: { ...base, type: "scatter", data: wide(60, 2), encoding: { x: "alpha", y: "beta" } },
    combo: { ...base, type: "combo", data: wide(12, 2, "label", true), encoding: { x: "label", y: ["alpha", "beta"] } },
    donut: { ...base, type: "donut", data: wide(5, 1, "label", true), encoding: { x: "label", y: "alpha" }, legend: { interactive: true } },
    heatmap: { ...base, type: "heatmap", data: long(6, 4), encoding: { x: "label", y: "team", color: "value" } },
    candlestick: { ...base, type: "candlestick", data: Array.from({ length: 40 }, (_, i) => ({ d: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`, open: 50 + (i % 7), high: 60 + (i % 5), low: 40 + (i % 3), close: 52 + (i % 6) })), encoding: { x: "d", open: "open", high: "high", low: "low", close: "close" } },
    waterfall: { ...base, type: "waterfall", data: wide(6, 1, "label", true), encoding: { x: "label", y: "alpha" } },
    midnight: { ...base, type: "line", theme: "midnight", data: wide(40, 2), encoding: { x: "t", y: ["alpha", "beta"] } },
    "line-pin": { ...base, type: "line", data: wide(60, 2), encoding: { x: "t", y: ["alpha", "beta"] }, tooltip: { pin: true } },
    "line-columns": { ...base, type: "line", data: { columns: { t: Float64Array.from({ length: 5000 }, (_, i) => i), alpha: Float64Array.from({ length: 5000 }, (_, i) => wave(i, 0)) } }, encoding: { x: "t", y: "alpha" } },
    "line-ringed": { ...base, type: "scatter", data: wide(40, 2), encoding: { x: "alpha", y: "beta" }, mark: { stroke: "light-dark(#fff,#1c1c1e)" } },
    "line-custom": { ...base, type: "line", data: wide(60, 2), encoding: { x: "t", y: ["alpha", "beta"] } },
    "scatter-pick": { ...base, type: "scatter", data: long(14, 3), encoding: { x: "value", y: "value", series: "team" }, interaction: { select: "point", zoom: "x" }, legend: { interactive: true } },
    "scatter-wide-pick": { ...base, type: "scatter", data: wide(40, 2), encoding: { x: "t", y: ["alpha", "beta"] }, interaction: { select: "point", zoom: "x" }, legend: { interactive: true } },
    "points-pick": { ...base, type: "line", data: wide(30, 3, "label", true), encoding: { x: "label", y: y3 }, mark: { points: "always" }, interaction: { select: "point", zoom: "x" }, legend: { interactive: true } },
    "bar-pick": { ...base, type: "bar", data: wide(10, 3, "label", true), encoding: { x: "label", y: y3 }, interaction: { select: "point", zoom: "x" }, legend: { interactive: true } },
    "sync-a": { ...base, type: "line", data: wide(60, 1), encoding: { x: "t", y: "alpha" }, interaction: { sync: "g" } },
  };
  window.UPDATES = {
    line: { ...base, type: "line", data: wide(350, 1), encoding: { x: "t", y: "alpha" } },
    "line-multi": { ...base, type: "line", data: wide(300, 4), encoding: { x: "t", y: names.slice(0, 4) }, legend: { interactive: true, position: "top" } },
    bar: { ...base, type: "bar", data: wide(9, 1, "label", true), encoding: { x: "label", y: "beta" } },
    "scatter-pick": { ...base, type: "scatter", data: long(9, 3), encoding: { x: "value", y: "value", series: "team" }, interaction: { select: "point", zoom: "x" }, legend: { interactive: true } },
    "scatter-wide-pick": { ...base, type: "scatter", data: wide(25, 2), encoding: { x: "t", y: ["beta", "alpha"] }, interaction: { select: "point", zoom: "x" }, legend: { interactive: true } },
    "points-pick": { ...base, type: "line", data: wide(18, 3, "label", true), encoding: { x: "label", y: ["gamma", "alpha", "beta"] }, mark: { points: "always" }, interaction: { select: "point", zoom: "x" }, legend: { interactive: true } },
    "bar-pick": { ...base, type: "bar", data: wide(6, 3, "label", true), encoding: { x: "label", y: ["gamma", "alpha", "beta"] }, interaction: { select: "point", zoom: "x" }, legend: { interactive: true } },
    "bar-grouped": { ...base, type: "bar", data: wide(7, 3, "label", true), encoding: { x: "label", y: y3 }, legend: { interactive: true } },
  };
  window.mountCase = (name, small, motion) => {
    if (motion) for (const set of [window.SPECS, window.UPDATES]) for (const key of Object.keys(set)) set[key] = { ...set[key], motion: "auto", animation: { duration: 200 } };
    const host = document.getElementById("host");
    if (small) host.style.width = "420px";
    const spec = window.SPECS[name];
    host.innerHTML = window.CK.render(spec);
    window.calls = [];
    window.ctl = window.CK.attach(host, spec, { render: (next) => window.CK.render(next), ...(name === "line-custom" ? { tooltip: (d) => (window.calls.push(JSON.stringify(d)), d.index % 7 === 0 ? null : `<b>${d.title}</b> ${d.rows.length}`) } : {}) });
    if (name === "sync-a") {
      const other = document.getElementById("host2");
      const twin = { ...spec, interaction: { sync: "g" } };
      other.innerHTML = window.CK.render(twin);
      window.ctl2 = window.CK.attach(other, twin, { render: (next) => window.CK.render(next) });
    }
    return window.ctl.ready;
  };
  window.snap = () => {
    // Opacity and dash offsets are mid-transition values; everything else is settled state.
    const html = document.getElementById("host").innerHTML + "\n@@\n" + document.getElementById("host2").innerHTML;
    return html.replace(/ id="ck-[^"]*"/g, "") + "\n@@calls\n" + window.calls.join("\n");
  };
}

const HTML = `<!doctype html><meta charset="utf-8"><style>html{color-scheme:light}body{margin:0;font-family:system-ui,sans-serif;overflow:hidden}#host{position:absolute;left:80px;top:80px;width:640px}#host svg{width:100%;height:auto;display:block}#host2{position:absolute;left:80px;top:700px;width:640px}</style><body><div id="host"></div><div id="host2"></div>`;

const browser = await chromium.launch();
async function run(source, name, small) {
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 }, hasTouch: !!process.env.TOUCH });
  if (!MOTION) await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(HTML);
  await page.addScriptTag({ content: source });
  await page.evaluate(setup);
  await page.evaluate(([id, s, m]) => window.mountCase(id, s, m), [name, small, MOTION]);
  await page.waitForTimeout(MOTION ? 900 : 150);
  const out = [];
  const snap = async (label) => out.push([label, await page.evaluate(() => window.snap())]);
  const W = small ? 420 : 640;
  const H = Math.round((W * 360) / 640);
  const at = (fx, fy) => [80 + fx * W, 80 + fy * H];
  await snap("mounted");
  if (name.endsWith("-pick")) {
    await page.evaluate(() => window.ctl.setSelection({ points: [{ series: "alpha", index: 3 }, { series: "beta", index: 5 }, { series: "gamma", index: 2 }], series: [] }));
    await snap("setSelection first");
  }
  // Pointer sweep across the plot, edges included.
  const xs = [0.5, 0.52, 0.12, 0.08, 0.95, 0.99, 0.3, 0.31, 0.7, 0.45, 0.02, 0.6];
  const ys = [0.5, 0.3, 0.7, 0.2, 0.8, 0.5, 0.15, 0.6, 0.9, 0.4, 0.5, 0.25];
  for (let i = 0; i < xs.length; i++) {
    if (process.env.TOUCH) await page.touchscreen.tap(...at(xs[i], ys[i]));
    else await page.mouse.move(...at(xs[i], ys[i]));
    await snap(`move ${xs[i]},${ys[i]}`);
  }
  await page.mouse.move(5, 5);
  await snap("leave");
  // Legend highlight and toggle.
  const spots = await page.evaluate(() => {
    const out = [];
    for (const text of document.querySelectorAll("#host svg text")) {
      const prev = text.previousElementSibling;
      if (!prev || prev.localName !== "rect" || prev.getAttribute("width") !== "10") continue;
      const box = text.getBoundingClientRect();
      out.push([box.left + box.width / 2, box.top + box.height / 2]);
    }
    return out;
  });
  for (let i = 0; i < Math.min(3, spots.length); i++) {
    await page.mouse.move(...spots[i]);
    await snap(`legend hover ${i}`);
  }
  if (spots.length > 1) {
    await page.mouse.click(...spots[1]);
    await page.waitForTimeout(PAUSE);
    await snap("legend click");
    await page.mouse.move(...at(0.4, 0.5));
    await snap("move after toggle");
    await page.mouse.move(...at(0.75, 0.3));
    await snap("move after toggle 2");
    const again = await page.evaluate(() => {
      const out = [];
      for (const text of document.querySelectorAll("#host svg text")) {
        const prev = text.previousElementSibling;
        if (!prev || prev.localName !== "rect" || prev.getAttribute("width") !== "10") continue;
        const box = text.getBoundingClientRect();
        out.push([box.left + box.width / 2, box.top + box.height / 2]);
      }
      return out;
    });
    if (again[1]) {
      await page.mouse.click(...again[1]);
      await page.waitForTimeout(PAUSE);
      await snap("legend click back");
    }
  }
  // Click marks (selection, events).
  for (const [fx, fy] of [[0.3, 0.5], [0.6, 0.4], [0.3, 0.5]]) {
    await page.mouse.click(...at(fx, fy));
    await page.waitForTimeout(30);
    await snap(`click ${fx}`);
    await page.mouse.move(...at(fx + 0.1, fy));
    await snap(`move after click ${fx}`);
  }
  // Keyboard.
  await page.mouse.move(5, 5);
  await page.evaluate(() => document.querySelector("#host svg").focus());
  for (const key of ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "End", "Home", "Enter", "ArrowRight", "Escape"]) {
    await page.keyboard.press(key);
    await snap(`key ${key}`);
  }
  // Pointer after keyboard.
  await page.mouse.move(...at(0.55, 0.5));
  await snap("move after keys");
  // Wheel zoom and brush drag.
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(PAUSE);
  await snap("wheel");
  await page.mouse.move(...at(0.35, 0.5));
  await snap("move after wheel");
  await page.mouse.move(...at(0.3, 0.5));
  await page.mouse.down();
  await page.mouse.move(...at(0.5, 0.55));
  await snap("drag mid");
  await page.mouse.move(...at(0.6, 0.5));
  await page.mouse.up();
  await page.waitForTimeout(PAUSE);
  await snap("drag end");
  await page.mouse.move(...at(0.45, 0.4));
  await snap("move after drag");
  await page.mouse.dblclick(...at(0.5, 0.5));
  await page.waitForTimeout(PAUSE);
  await snap("dblclick");
  // Scroll, then hover.
  await page.evaluate(() => { document.getElementById("host").style.top = "117px"; });
  await page.mouse.move(...at(0.42, 0.55));
  await snap("move after shift");
  await page.evaluate(() => { document.getElementById("host").style.top = "80px"; });
  await page.mouse.move(...at(0.44, 0.5));
  await snap("move after shift back");
  // Update with a new spec, then hover with no idle time, then again later.
  const updated = await page.evaluate((id) => {
    const next = window.UPDATES[id];
    if (!next) return false;
    window.ctl.update(next, window.CK.render(next));
    return true;
  }, name);
  if (updated) {
    await page.mouse.move(...at(0.5, 0.5));
    if (!MOTION) await snap("move right after update");
    await page.waitForTimeout(MOTION ? 900 : 80);
    await page.mouse.move(...at(0.2, 0.3));
    await snap("move after update");
    await page.mouse.move(...at(0.8, 0.6));
    await snap("move after update 2");
  }
  // Selection API.
  await page.evaluate(() => window.ctl.setSelection({ points: [{ series: "alpha", index: 3 }], series: ["beta"] }));
  await snap("setSelection");
  await page.mouse.move(...at(0.33, 0.5));
  await snap("move after setSelection");
  await page.evaluate(() => window.ctl.destroy());
  await snap("destroyed");
  await page.close();
  return out;
}

const names = await (async () => {
  const page = await browser.newPage();
  await page.setContent(HTML);
  await page.addScriptTag({ content: A });
  await page.evaluate(setup);
  const list = await page.evaluate(() => Object.keys(window.SPECS));
  await page.close();
  return list;
})();

let bad = 0;
let steps = 0;
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
for (const name of names) {
  if (only && !only.includes(name)) continue;
  for (const small of [false, true]) {
    const [a, b] = [await run(A, name, small), await run(B, name, small)];
    let first = "";
    for (let i = 0; i < a.length; i++) {
      steps++;
      if (a[i][1] !== b[i]?.[1]) {
        bad++;
        if (!first) {
          first = a[i][0];
          const x = a[i][1];
          const y = b[i]?.[1] ?? "";
          let at = 0;
          while (at < x.length && x[at] === y[at]) at++;
          console.log(`DIFF ${name}${small ? " (small)" : ""} at "${first}"\n  A: …${x.slice(Math.max(0, at - 120), at + 160)}\n  B: …${y.slice(Math.max(0, at - 120), at + 160)}`);
        }
      }
    }
    if (!first) console.log(`same ${name}${small ? " (small)" : ""}  ${a.length} steps`);
  }
}
await browser.close();
console.log(`${steps} steps, ${bad} differ`);
process.exit(bad ? 1 : 0);
