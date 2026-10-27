import { mount } from "@chartkitdev/vanilla";
import { attach } from "@chartkitdev/geo";
import type { ChartSpec } from "@chartkitdev/core";

/** Slow enough to read the spec. Reduced motion does not autoplay. */
const INTERVAL_MS = 6200;

const root = document.querySelector<HTMLElement>("[data-carousel]");
if (root) {
  const slides = [...root.querySelectorAll<HTMLElement>("[data-slide]")];
  const pills = [...root.querySelectorAll<HTMLButtonElement>("[data-pill]")];
  let index = 0;
  let pinned = false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mounted = new WeakMap<HTMLElement, { destroy(): void }>();

  function arm(slide: HTMLElement): void {
    const live = slide.querySelector<HTMLElement>("[data-live]");
    const host = slide.querySelector<HTMLElement>(".carousel-chart__host");
    if (!live || !host || mounted.has(host)) return;
    if (live.dataset.geo === "1") {
      const svg = host.querySelector("svg");
      if (svg) mounted.set(host, { destroy: attach(svg) });
      return;
    }
    const node = live.querySelector("script[type='application/json']");
    if (!node?.textContent) return;
    const spec = JSON.parse(node.textContent) as ChartSpec;
    if (spec.type === "bar-list") return;
    const chart = mount(host, spec);
    mounted.set(host, chart);
  }

  function show(next: number): void {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const on = i === index;
      slide.hidden = !on;
      const chart = slide.querySelector(".carousel-chart");
      if (on && chart) {
        chart.classList.remove("is-in");
        if (!reduce) {
          void chart.getBoundingClientRect();
          chart.classList.add("is-in");
        }
        arm(slide);
      }
    });
    pills.forEach((pill, i) => {
      const on = i === index;
      pill.classList.toggle("is-on", on);
      pill.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  pills.forEach((pill, i) => {
    pill.addEventListener("click", () => {
      pinned = true;
      show(i);
    });
  });

  show(0);

  if (!reduce) {
    window.setInterval(() => {
      if (!pinned && document.visibilityState !== "hidden") show(index + 1);
    }, INTERVAL_MS);
  }
}
