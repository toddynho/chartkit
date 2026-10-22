#!/usr/bin/env python3
"""Crop each reference to its chart plot and score a silhouette fixture.

The specs this file builds are test-only. The dashboard pages do not import them.
A "before" spec draws the same silhouette on an index scale with automatic padding.
An "after" spec places that silhouette on the reference's pixel grid.
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from PIL import Image, ImageChops, ImageEnhance

ROOT = Path("/workspace")
ART = Path("/opt/cursor/artifacts")
OUT = Path("/tmp/dash10-fixtures")
RENDER = ROOT / "docs/dashboards/fixtures/render-spec.mjs"

# Automatic chart padding when the matching chrome is on. size.padding cannot go under this.
FLOOR = {"top": 14, "right": 16, "bottom": 12, "left": 12}


def render_svg(spec: dict) -> str:
    proc = subprocess.run(
        ["node", str(RENDER)],
        input=json.dumps(spec).encode(),
        check=True,
        capture_output=True,
    )
    return proc.stdout.decode()


def raster_all(jobs: list[tuple[str, int, int, Path]]) -> None:
    """jobs: (svg, width, height, dest). One browser for the whole set."""
    payload = []
    for index, (svg, width, height, dest) in enumerate(jobs):
        html = OUT / f"frame-{index}.html"
        html.write_text(
            "<!doctype html><style>html,body{margin:0;background:#fff}</style>" + svg,
            encoding="utf-8",
        )
        payload.append({"html": str(html), "width": width, "height": height, "dest": str(dest)})
    list_path = OUT / "jobs.json"
    list_path.write_text(json.dumps(payload))
    subprocess.run(
        [
            "node",
            "--input-type=module",
            "-e",
            f"""
import fs from 'node:fs';
import playwright from '{ROOT}/node_modules/playwright/index.js';
const jobs = JSON.parse(fs.readFileSync('{list_path}', 'utf8'));
const browser = await playwright.chromium.launch({{args:['--no-sandbox']}});
for (const job of jobs) {{
  const page = await browser.newPage({{viewport:{{width:job.width,height:job.height}}, deviceScaleFactor:1}});
  await page.goto('file://' + job.html);
  await page.screenshot({{path:job.dest, clip:{{x:0,y:0,width:job.width,height:job.height}}}});
  await page.close();
}}
await browser.close();
""",
        ],
        check=True,
    )


def score(ref: Image.Image, ours: Image.Image) -> dict:
    ref = ref.convert("RGB")
    ours = ours.convert("RGB").resize(ref.size, Image.Resampling.NEAREST)
    diff = ImageChops.difference(ref, ours)
    hist = diff.histogram()
    total = 0
    hot = 0
    pixels = ref.size[0] * ref.size[1]
    for channel in range(3):
        bins = hist[channel * 256 : (channel + 1) * 256]
        for value, count in enumerate(bins):
            total += value * count
            if value > 24:
                hot += count
    return {
        "mae": round(total / (pixels * 3), 2),
        "mismatch": round(hot / (pixels * 3), 4),
    }


def stroke_overlap(ref: Image.Image, ours: Image.Image, pred, radius: int = 1) -> float:
    ref = ref.convert("RGB")
    ours = ours.convert("RGB").resize(ref.size, Image.Resampling.NEAREST)
    rp, op = ref.load(), ours.load()
    width, height = ref.size
    total = 0
    hit = 0
    for y in range(height):
        for x in range(width):
            if not pred(rp[x, y]):
                continue
            total += 1
            matched = False
            for dy in range(-radius, radius + 1):
                yy = y + dy
                if yy < 0 or yy >= height:
                    continue
                if pred(op[x, yy]):
                    matched = True
                    break
            if matched:
                hit += 1
    return round(hit / total, 3) if total else 0.0


def centers(im: Image.Image, pred, box) -> list[tuple[int, float]]:
    x0, y0, x1, y1 = box
    px = im.load()
    out = []
    for x in range(x0, x1):
        ys = [y for y in range(y0, y1) if pred(px[x, y])]
        if len(ys) >= 1:
            out.append((x, (min(ys) + max(ys)) / 2))
    return out


def expand(crop: Image.Image, floor: dict) -> tuple[Image.Image, dict]:
    """Pad a plot crop so automatic padding lands on the crop's edges."""
    extra = {side: floor[side] for side in floor}
    width = crop.size[0] + extra["left"] + extra["right"]
    height = crop.size[1] + extra["top"] + extra["bottom"]
    canvas = Image.new("RGB", (width, height), (255, 255, 255))
    canvas.paste(crop, (extra["left"], extra["top"]))
    return canvas, extra


def line_spec(points: list[dict], size, padding, color, font, grid, stroke, ticks, ygrid, plot_width, dashed_color=None):
    fields = [{"field": "value", "mark": "line", "scale": {"domain": [0, 100], "nice": False, "zero": False}}]
    if dashed_color:
        fields.append(
            {
                "field": "prior",
                "mark": "line",
                "scale": {"domain": [0, 100], "nice": False, "zero": False},
            }
        )
    series = [color] + ([dashed_color] if dashed_color else [])
    xs = [row["x"] for row in points]
    span = (max(xs) - min(xs)) if xs else 1
    span = span or 1
    # Domain is the plot width, which is the crop width. Pixel x then lands on that pixel.
    x_pad = {"min": max(0, min(xs) / span), "max": max(0, (plot_width - max(xs)) / span)}
    spec = {
        "version": "1",
        "type": "line",
        "data": points,
        "encoding": {
            "x": {
                "field": "x",
                "type": "quantitative",
                "scale": {"padding": x_pad or 0, "nice": False, "zero": False},
            },
            "y": fields[0] if len(fields) == 1 else fields,
        },
        "axes": {
            "x": {"grid": False, "ticks": ticks, "labels": False, "tickMarks": "none", "line": False},
            "y": {"title": "", "labels": False, "grid": ygrid, "ticks": 2, "line": False, "tickMarks": "none"},
        },
        "legend": {"show": False},
        "mark": {"strokeWidth": stroke, "fillOpacity": 0, "curve": "linear", "points": "none", "gradient": False},
        "size": {"width": size[0], "height": size[1], "padding": padding},
        "theme": {
            "preset": "soft",
            "tokens": {
                "background": "#ffffff",
                "surface": "#ffffff",
                "text": "#6b7280",
                "muted": "#6b7280",
                "grid": grid,
                "axis": grid,
                "series": series,
                "fontFamily": font,
                "fontSize": 11,
            },
        },
        "a11y": {"alt": "Plot silhouette traced from the reference screenshot."},
    }
    return spec


def index_before(spec: dict) -> dict:
    """Stretch the silhouette to the plot box. That is the unaligned overlay."""
    before = json.loads(json.dumps(spec))
    rows = before["data"]
    vals = [row["value"] for row in rows]
    lo, hi = min(vals), max(vals)
    span = hi - lo or 1
    for index, row in enumerate(rows):
        row["x"] = index
        row["value"] = round((row["value"] - lo) / span * 100, 3)
    before["encoding"]["x"]["scale"] = {"nice": False, "zero": False}
    y = before["encoding"]["y"]
    channels = y if isinstance(y, list) else [y]
    for channel in channels:
        channel["scale"] = {"nice": True}
    before["size"].pop("padding", None)
    return before


def values_on_crop(samples: list[tuple[int, float]], origin: tuple[int, int], crop_h: int, prior=None) -> list[dict]:
    ox, oy = origin
    rows = []
    for index, (x, y) in enumerate(samples):
        row = {"x": x - ox, "value": round((crop_h - (y - oy)) / crop_h * 100, 3)}
        if prior is not None:
            py = prior.get(x)
            row["prior"] = round((crop_h - (py - oy)) / crop_h * 100, 3) if py is not None else row["value"]
        rows.append(row)
    return rows


def bars_spec(heights: list[float], size, padding, color, gap):
    return {
        "version": "1",
        "type": "bar",
        "data": [{"i": str(index + 1), "events": value} for index, value in enumerate(heights)],
        "encoding": {
            "x": "i",
            "y": {"field": "events", "scale": {"domain": [0, 100], "nice": False, "zero": True}},
        },
        "axes": {"x": False, "y": False},
        "legend": {"show": False},
        "mark": {"gap": gap, "cornerRadius": 0},
        "size": {"width": size[0], "height": size[1], "padding": padding},
        "theme": {
            "preset": "soft",
            "tokens": {
                "background": "#ffffff",
                "surface": "#ffffff",
                "text": "#6a6275",
                "grid": "transparent",
                "axis": "transparent",
                "series": [color],
                "fontFamily": "Inter, sans-serif",
                "fontSize": 11,
            },
        },
        "a11y": {"alt": "Trend bars traced from one reference row."},
    }


def paint(name, canvas, before_png, after_png, pred) -> dict:
    before = Image.open(before_png)
    after = Image.open(after_png)
    scores = {"before": score(canvas, before), "after": score(canvas, after)}
    scores["after"]["overlap"] = stroke_overlap(canvas, after, pred)
    scores["before"]["overlap"] = stroke_overlap(canvas, before, pred)
    overlay = Image.blend(canvas.convert("RGB"), after.convert("RGB"), 0.5)
    diff = ImageEnhance.Brightness(ImageChops.difference(canvas.convert("RGB"), after.convert("RGB"))).enhance(3)
    overlay.save(ART / f"dash10-overlay-{name}.png")
    diff.save(ART / f"dash10-diff-{name}.png")
    canvas.save(ART / f"dash10-crop-{name}.png")
    after.save(ART / f"dash10-chart-{name}.png")
    return scores


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    prepared = []

    stripe = Image.open("/tmp/dash8-refs/stripe.png").convert("RGB")
    sbox = (50, 310, 990, 536)
    scrop = stripe.crop(sbox)

    def sblue(p):
        return 50 < p[0] < 150 and 60 < p[1] < 170 and p[2] > 185

    def sgray(p):
        return 145 < p[0] < 190 and 155 < p[1] < 205 and 165 < p[2] < 215 and abs(p[0] - p[1]) < 28

    sline = centers(stripe, sblue, (sbox[0] + 4, sbox[1] + 4, sbox[2] - 4, sbox[3] - 4))
    sline = sline[::2]
    gray_at = {x: y for x, y in centers(stripe, sgray, (sbox[0], 460, sbox[2], sbox[3]))}
    srows = values_on_crop(sline, (sbox[0], sbox[1]), scrop.size[1], gray_at)
    scanvas, spad = expand(scrop, FLOOR)
    sspec = line_spec(
        srows,
        scanvas.size,
        spad,
        "#5469d4",
        "Inter, sans-serif",
        "#e3e8ee",
        5,
        "ends",
        False,
        scrop.size[0],
        "#a3acb9",
    )
    prepared.append(("stripe", scanvas, sspec, sblue))

    plausible = Image.open("/tmp/dash8-refs/plausible.png").convert("RGB")
    pbox = (160, 210, 1490, 520)
    pcrop = plausible.crop(pbox)

    def pindigo(p):
        return p[2] > 170 and p[0] < 190 and p[2] > p[0] + 40 and p[2] > p[1] + 20 and p[1] < 200

    pline = centers(plausible, pindigo, (pbox[0] + 8, pbox[1] + 8, pbox[2] - 8, 470))
    pline = [pt for pt in pline if pt[1] < 470][::3]
    prows = values_on_crop(pline, (pbox[0], pbox[1]), pcrop.size[1])
    pcanvas, ppad = expand(pcrop, FLOOR)
    # Gridlines measured at image y 224 and 280. 496 is the axis, outside this crop's lower grid.
    crop_h = pcrop.size[1]
    gticks = [round((crop_h - (gy - pbox[1])) / crop_h * 100, 2) for gy in (224, 280) if pbox[1] < gy < pbox[3]]
    pspec = line_spec(prows, pcanvas.size, ppad, "#5850ec", "Inter, sans-serif", "#f1f5f9", 2, "ends", True, pcrop.size[0])
    pspec["axes"]["y"]["ticks"] = gticks
    prepared.append(("plausible", pcanvas, pspec, pindigo))

    ga = Image.open("/opt/cursor/artifacts/dash5-ref-ga.png").convert("RGB")
    gbox = (174, 84, 572, 306)
    gcrop = ga.crop(gbox)

    def gblue(p):
        return p[2] > 160 and p[0] < 140 and p[2] > p[0] + 60 and p[1] < 210

    gline = centers(ga, gblue, (215, 140, 545, 240))
    gline = [pt for pt in gline if 150 < pt[1] < 230][::2]
    grows = values_on_crop(gline, (gbox[0], gbox[1]), gcrop.size[1])
    gcanvas, gpad = expand(gcrop, FLOOR)
    gspec = line_spec(grows, gcanvas.size, gpad, "#1a73e8", "Roboto, sans-serif", "#e8eaed", 1.5, "ends", True, gcrop.size[0])
    prepared.append(("ga", gcanvas, gspec, gblue))

    sentry = Image.open("/opt/cursor/artifacts/dash5-ref-sentry.png").convert("RGB")

    def sbar(p):
        return 160 < p[0] < 220 and 155 < p[1] < 215 and 175 < p[2] < 230 and abs(p[0] - p[1]) < 25 and p[2] + 8 >= p[0]

    columns = []
    for x in range(1288, 1440):
        ys = [y for y in range(348, 390) if sbar(sentry.getpixel((x, y)))]
        if len(ys) > 2:
            columns.append((x, min(ys), max(ys)))
    bars = []
    if columns:
        cur = [columns[0]]
        for col in columns[1:]:
            if col[0] <= cur[-1][0] + 1:
                cur.append(col)
            else:
                bars.append(cur)
                cur = [col]
        bars.append(cur)
    bars = [bar for bar in bars if 4 <= (bar[-1][0] - bar[0][0] + 1) <= 8]
    baseline = max(col[2] for bar in bars for col in bar)
    left = bars[0][0][0]
    right = bars[-1][-1][0] + 1
    top = min(col[1] for bar in bars for col in bar) - 2
    sbox = (left, top, right, baseline + 1)
    scrop_b = sentry.crop(sbox)
    crop_h = scrop_b.size[1]
    heights = []
    for bar in bars:
        bar_top = min(col[1] for col in bar)
        heights.append(round((baseline - bar_top) / crop_h * 100, 2))
    span = scrop_b.size[0]
    band = span / max(1, len(heights))
    width = sum(bar[-1][0] - bar[0][0] + 1 for bar in bars) / len(bars)
    gap = max(0.05, min(0.8, 1 - (width / band)))
    scanvas_b, sbpad = expand(scrop_b, FLOOR)
    bspec = bars_spec(heights, scanvas_b.size, sbpad, "#c7c2cc", round(gap, 3))
    prepared.append(("sentry", scanvas_b, bspec, sbar))

    jobs = []
    metas = []
    for name, canvas, spec, pred in prepared:
        before = index_before(spec) if name != "sentry" else json.loads(json.dumps(spec))
        if name == "sentry":
            before["size"].pop("padding", None)
            before["mark"]["gap"] = 0.08
            for row in before["data"]:
                row["events"] = 100
            before["encoding"]["y"]["scale"] = {"nice": True}
        before_svg = render_svg(before)
        after_svg = render_svg(spec)
        (OUT / f"{name}-before.svg").write_text(before_svg)
        (OUT / f"{name}-after.svg").write_text(after_svg)
        w, h = canvas.size
        jobs.append((before_svg, w, h, OUT / f"{name}-before.png"))
        jobs.append((after_svg, w, h, OUT / f"{name}-after.png"))
        metas.append((name, canvas, pred))
    raster_all(jobs)
    scores = {}
    for name, canvas, pred in metas:
        scores[name] = paint(name, canvas, OUT / f"{name}-before.png", OUT / f"{name}-after.png", pred)
        print(name, json.dumps(scores[name]))

    fixture = {
        "note": "Test-only silhouettes. Approximate values read off the reference plot. Not used by the pages.",
        "scores": scores,
    }
    (ROOT / "docs/dashboards/fixtures/scores.json").write_text(json.dumps(fixture, indent=2) + "\n")
    print(json.dumps(scores, indent=2))


if __name__ == "__main__":
    main()
