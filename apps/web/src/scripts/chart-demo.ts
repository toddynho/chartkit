import { paintSpec } from "../lib/chartkit";
import { withPreviewSize } from "../data/preview-size";
import {
  applyDonutAction,
  donutControlState,
  donutExamples,
  formatDonutNumber,
  playgroundHref,
  roundDonut,
  specText,
  type DonutAction,
} from "../data/donut-teach";

function buttons(root: ParentNode, selector: string): HTMLButtonElement[] {
  return [...root.querySelectorAll<HTMLButtonElement>(selector)];
}

function setPressed(group: HTMLButtonElement[], value: string): void {
  for (const button of group) {
    const on = button.dataset.value === value;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  }
}

/** Wire the donut docs demo. The markup already shows the first example without this script. */
export function mountChartDemo(): void {
  const root = document.querySelector<HTMLElement>("[data-chart-demo]");
  if (!root || root.dataset.ready === "1") return;
  root.dataset.ready = "1";

  const chart = root.querySelector<HTMLElement>("[data-demo-chart]");
  const snippet = root.querySelector<HTMLElement>("[data-demo-snippet]");
  const play = root.querySelector<HTMLAnchorElement>("[data-demo-play]");
  const blurb = root.querySelector<HTMLElement>("[data-demo-blurb]");
  const error = root.querySelector<HTMLElement>("[data-demo-error]");
  const hole = root.querySelector<HTMLInputElement>('[data-range="innerRadius"]');
  const gap = root.querySelector<HTMLInputElement>('[data-range="padAngle"]');
  const holeOut = root.querySelector<HTMLElement>('[data-range-out="innerRadius"]');
  const gapOut = root.querySelector<HTMLElement>('[data-range-out="padAngle"]');
  const exampleButtons = buttons(root, "[data-example-id]");
  const labelButtons = buttons(root, '[data-choice="labels"]');
  const legendButtons = buttons(root, '[data-choice="legend"]');
  const paletteButtons = buttons(root, '[data-choice="palette"]');
  const sortButtons = buttons(root, '[data-choice="sort"]');
  const startButtons = buttons(root, '[data-choice="startAngle"]');
  if (!chart || !snippet || !play || !hole || !gap) return;

  const byId = new Map(donutExamples.map((example) => [example.id, example]));
  const first = byId.get(root.dataset.example ?? "") ?? donutExamples[0];
  let current = structuredClone(first.spec);

  function draw(): void {
    const painted = paintSpec(withPreviewSize(current));
    chart!.innerHTML = painted.svg;
    if (error) {
      error.hidden = painted.ok;
      error.textContent = painted.ok ? "" : painted.issues.map((issue) => `${issue.code}: ${issue.message}`).join(" ");
    }
    snippet!.textContent = specText(current);
    play!.href = playgroundHref(current);
  }

  function sync(): void {
    const state = donutControlState(current);
    hole!.value = String(state.innerRadius);
    gap!.value = String(state.padAngle);
    if (holeOut) holeOut.textContent = formatDonutNumber(state.innerRadius);
    if (gapOut) gapOut.textContent = formatDonutNumber(state.padAngle);
    setPressed(labelButtons, state.labels);
    setPressed(legendButtons, state.legend);
    setPressed(paletteButtons, state.palette);
    setPressed(sortButtons, state.sort);
    setPressed(startButtons, String(state.startAngle));
  }

  function apply(action: DonutAction): void {
    applyDonutAction(current, action);
    sync();
    draw();
  }

  hole.addEventListener("input", () => {
    const value = roundDonut(Number(hole.value), 0.01);
    if (holeOut) holeOut.textContent = formatDonutNumber(value);
    applyDonutAction(current, { type: "innerRadius", value });
    draw();
  });
  gap.addEventListener("input", () => {
    const value = roundDonut(Number(gap.value), 0.5);
    if (gapOut) gapOut.textContent = formatDonutNumber(value);
    applyDonutAction(current, { type: "padAngle", value });
    draw();
  });

  for (const button of [...labelButtons, ...legendButtons, ...paletteButtons, ...sortButtons, ...startButtons]) {
    button.addEventListener("click", () => {
      const choice = button.dataset.choice;
      const value = button.dataset.value;
      if (!choice || value == null) return;
      if (choice === "labels" && (value === "off" || value === "inside" || value === "outside")) apply({ type: "labels", value });
      else if (choice === "legend" && (value === "off" || value === "bottom" || value === "right")) apply({ type: "legend", value });
      else if (choice === "palette" && (value === "theme" || value === "set")) apply({ type: "palette", value });
      else if (choice === "sort" && (value === "none" || value === "asc" || value === "desc")) apply({ type: "sort", value });
      else if (choice === "startAngle") apply({ type: "startAngle", value: Number(value) });
    });
  }

  for (const button of exampleButtons) {
    button.addEventListener("click", () => {
      const example = byId.get(button.dataset.exampleId ?? "");
      if (!example) return;
      current = structuredClone(example.spec);
      root.dataset.example = example.id;
      if (blurb) blurb.textContent = example.blurb;
      for (const peer of exampleButtons) {
        const on = peer === button;
        peer.classList.toggle("is-on", on);
        peer.setAttribute("aria-pressed", on ? "true" : "false");
      }
      sync();
      draw();
    });
  }
}
