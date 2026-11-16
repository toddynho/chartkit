// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { scanMarks, tipObstacles } from "../interact/tip";

const plot = { l: 40, t: 20, w: 560, h: 300 };
const view = { left: 12, top: 30, width: 320, height: 180 } as DOMRect;
const bounds = { left: 4, top: 6, width: 400, height: 240 } as DOMRect;

function svgOf(body: string): SVGSVGElement {
  const host = document.createElement("div");
  host.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">${body}</svg>`;
  document.body.append(host);
  return host.querySelector("svg") as SVGSVGElement;
}

const drawn =
  `<rect width="100%" height="100%" fill="transparent"/>` +
  `<path d="M 40 300 L 180 120 L 320 200 L 600 60" fill="none" stroke="red"/>` +
  `<path d="M 40 320 L 600 320 Z" fill="blue" stroke="blue"/>` +
  `<circle cx="100" cy="100" r="3" fill="red"/><circle cx="140" cy="130" r="3" fill="red"/><circle cx="700" cy="130" r="3" fill="red"/>` +
  `<circle cx="200" cy="90" r="3" fill="green" stroke="white"/><circle cx="240" cy="95" r="3" fill="green" stroke="white"/>` +
  `<rect x="60" y="200" width="30" height="100" fill="teal"/><rect x="60" y="200" width="4" height="100" fill="teal"/>` +
  `<text data-ck-annotation="rule" x="300" y="80" text-anchor="end">Target</text>` +
  `<rect data-ck-annotation="box" x="400" y="40" width="50" height="20"/>` +
  `<rect data-ck-annotation="band" x="100" y="20" width="50" height="300" fill="gray"/>`;

/** The boxes as sorted strings, so two reads compare as sets. */
function boxes(svg: SVGSVGElement, all: boolean): string[] {
  return tipObstacles(svg, view, bounds, 0.5, 0.5, plot, scanMarks(svg, plot, all))
    .map((box) => [box.l, box.t, box.r, box.b].join())
    .sort();
}

describe("tooltip obstacles", () => {
  it("reads marks, bars and annotations, and skips what the plot does not hold", () => {
    const svg = svgOf(drawn);
    const list = boxes(svg, false);
    // Stroke path: 4 vertices. Red circles: 2 inside the plot. Ringed circles: 2. The bar, the filled band rect, the note text, the note box.
    expect(list.length).toBe(4 + 2 + 2 + 1 + 1 + 1 + 1);
  });

  it("adds the hover's own nodes to a kept read, and gets the same boxes as a full read", () => {
    const svg = svgOf(drawn);
    const kept = scanMarks(svg, plot, false);
    const before = tipObstacles(svg, view, bounds, 0.5, 0.5, plot, kept).length;
    svg.insertAdjacentHTML(
      "beforeend",
      `<line data-ck-crosshair x1="180" x2="180" y1="20" y2="320"/>` +
        `<circle data-ck-dot cx="180" cy="120" r="3.5" fill="red" stroke="light-dark(#fff,#1c1c1e)"/>` +
        `<circle data-ck-dot cx="180" cy="210" r="3.5" fill="blue" stroke="light-dark(#fff,#1c1c1e)"/>` +
        `<circle data-ck-pick cx="320" cy="200" r="5" fill="none"/>`,
    );
    const live = tipObstacles(svg, view, bounds, 0.5, 0.5, plot, kept)
      .map((box) => [box.l, box.t, box.r, box.b].join())
      .sort();
    expect(live.length).toBe(before + 3);
    expect(live).toEqual(boxes(svg, true));
    // The kept read itself still holds only the drawn marks.
    expect(boxes(svg, false)).toEqual(live);
  });

  it("reads everything again when a hover dot shares a colour key with drawn circles", () => {
    const svg = svgOf(drawn);
    const kept = scanMarks(svg, plot, false);
    svg.insertAdjacentHTML("beforeend", `<circle data-ck-dot cx="220" cy="92" r="3.5" fill="green" stroke="white"/>`);
    const live = tipObstacles(svg, view, bounds, 0.5, 0.5, plot, kept)
      .map((box) => [box.l, box.t, box.r, box.b].join())
      .sort();
    expect(live).toEqual(boxes(svg, true));
  });

  it("places the kept boxes again when the host or the scale moves", () => {
    const svg = svgOf(drawn);
    const kept = scanMarks(svg, plot, false);
    const first = tipObstacles(svg, view, bounds, 0.5, 0.5, plot, kept);
    expect(tipObstacles(svg, view, bounds, 0.5, 0.5, plot, kept)).toBe(first);
    const moved = tipObstacles(svg, { ...view, left: 40 } as DOMRect, bounds, 0.5, 0.5, plot, kept);
    expect(moved).not.toBe(first);
    expect(moved[0].l).toBe(first[0].l + 28);
  });
});
