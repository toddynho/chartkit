#!/usr/bin/env python3
"""Score each round-2 hero against a silhouette of its own series.

The silhouette is drawn from the fictional series on the page. It is not a
product screenshot. The pages do not import this file.
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw

from overlay import FLOOR, bars_spec, index_before, line_spec, raster_all, render_svg, score, stroke_overlap

ROOT = Path("/workspace")
OUT = Path("/tmp/dash-round2")


def targets() -> list[dict]:
    proc = subprocess.run(
        [
            "node",
            "--experimental-strip-types",
            "--input-type=module",
            "-e",
            "import { dashboards } from './catalog/lib/dashboards.ts'; import { overlayTargets } from './catalog/lib/dashboards-round2.ts'; dashboards(); process.stdout.write(JSON.stringify(overlayTargets()));",
        ],
        cwd=ROOT,
        check=True,
        capture_output=True,
    )
    return json.loads(proc.stdout.decode())


def draw_line(values: list[float], color: str) -> Image.Image:
    width, height = 520, 200
    image = Image.new("RGB", (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(image)
    lo, hi = min(values), max(values)
    span = hi - lo or 1
    left, right, top, bottom = FLOOR["left"], width - FLOOR["right"], FLOOR["top"], height - FLOOR["bottom"]
    points = []
    for index, value in enumerate(values):
        x = left + (0 if len(values) == 1 else index / (len(values) - 1) * (right - left))
        y = bottom - ((value - lo) / span) * (bottom - top)
        points.append((x, y))
    rgb = tuple(int(color[i : i + 2], 16) for i in (1, 3, 5))
    draw.line(points, fill=rgb, width=3)
    return image


def draw_bars(values: list[float], color: str) -> Image.Image:
    width, height = 520, 180
    image = Image.new("RGB", (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(image)
    hi = max(values) or 1
    left, right, top, bottom = FLOOR["left"], width - FLOOR["right"], FLOOR["top"], height - FLOOR["bottom"]
    band = (right - left) / len(values)
    gap = band * 0.28
    rgb = tuple(int(color[i : i + 2], 16) for i in (1, 3, 5))
    for index, value in enumerate(values):
        x0 = left + index * band + gap / 2
        x1 = x0 + band - gap
        y0 = bottom - (value / hi) * (bottom - top)
        draw.rectangle((x0, y0, x1, bottom), fill=rgb)
    return image


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    Path("/tmp/dash10-fixtures").mkdir(parents=True, exist_ok=True)
    jobs = []
    metas = []
    for item in targets():
        values = [float(value) for value in item["values"]]
        if item["kind"] == "bar":
            canvas = draw_bars(values, item["color"])
            hi = max(values) or 1
            heights = [round(value / hi * 100, 2) for value in values]
            spec = bars_spec(heights, canvas.size, FLOOR, item["color"], 0.28)
            before = index_before(spec) if False else json.loads(json.dumps(spec))
            before["size"].pop("padding", None)
            before["mark"]["gap"] = 0.08
            for row in before["data"]:
                row["events"] = 100
            before["encoding"]["y"]["scale"] = {"nice": True}
            pred = lambda _pixel, color=item["color"]: True
        else:
            canvas = draw_line(values, item["color"])
            lo, hi = min(values), max(values)
            span = hi - lo or 1
            rows = [{"x": index, "value": round((value - lo) / span * 100, 3)} for index, value in enumerate(values)]
            spec = line_spec(rows, canvas.size, FLOOR, item["color"], "Inter, sans-serif", "#ffffff", 3, 2, False, canvas.size[0] - FLOOR["left"] - FLOOR["right"])
            spec["encoding"]["x"] = {"field": "x", "type": "quantitative", "scale": {"nice": False, "zero": False, "domain": [0, len(values) - 1]}}
            before = index_before(spec)
            pred = None
        before_svg = render_svg(before)
        after_svg = render_svg(spec)
        jobs.append((before_svg, canvas.size[0], canvas.size[1], OUT / f"{item['slug']}-before.png"))
        jobs.append((after_svg, canvas.size[0], canvas.size[1], OUT / f"{item['slug']}-after.png"))
        metas.append((item["slug"], canvas, item["color"], item["kind"]))
    raster_all(jobs)
    fresh = {}
    for slug, canvas, color, kind in metas:
        rgb = tuple(int(color[i : i + 2], 16) for i in (1, 3, 5))

        def pred(pixel, rgb=rgb, kind=kind):
            if kind == "bar":
                return abs(pixel[0] - rgb[0]) < 40 and abs(pixel[1] - rgb[1]) < 40 and abs(pixel[2] - rgb[2]) < 40
            return abs(pixel[0] - rgb[0]) < 50 and abs(pixel[1] - rgb[1]) < 50 and abs(pixel[2] - rgb[2]) < 50 and sum(abs(pixel[i] - rgb[i]) for i in range(3)) < 80

        before = score(canvas, Image.open(OUT / f"{slug}-before.png"))
        after = score(canvas, Image.open(OUT / f"{slug}-after.png"))
        before["overlap"] = stroke_overlap(canvas, Image.open(OUT / f"{slug}-before.png"), pred)
        after["overlap"] = stroke_overlap(canvas, Image.open(OUT / f"{slug}-after.png"), pred)
        fresh[slug] = {"before": before, "after": after}
        print(slug, json.dumps(fresh[slug]))
    path = ROOT / "catalog/dashboards/fixtures/scores.json"
    current = json.loads(path.read_text())
    current["scores"].update(fresh)
    current["page"] = current.get("page", {})
    current["page"]["note"] = (
        "Whole-page side-by-side MAE for the first four boards. Round 2 scores are hero silhouettes: "
        "a line or bar drawn from the fictional series, then a ChartKit spec of that series. "
        "They are not product screenshots."
    )
    for slug, item in fresh.items():
        current["page"][slug] = {"mae": item["after"]["mae"], "mismatch": item["after"]["mismatch"]}
    path.write_text(json.dumps(current, indent=2) + "\n")


if __name__ == "__main__":
    main()
