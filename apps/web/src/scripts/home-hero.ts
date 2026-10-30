import { mount } from "@chartkitdev/vanilla";
import type { ChartSpec } from "@chartkitdev/core";

const INTERVAL_MS = 3200;

type Motion = "bar" | "hbar" | "line" | "area" | "fade";

type Slide = {
  title: string;
  subtitle: string;
  motion: Motion;
  extra: boolean;
  preview: string;
  svg: string;
  drawn: ChartSpec;
};

const root = document.querySelector<HTMLElement>("[data-hero]");
const raw = document.getElementById("hero-charts")?.textContent;
if (root && raw) {
  const slides = JSON.parse(raw) as Slide[];
  const title = root.querySelector<HTMLElement>("[data-hero-title]");
  const sub = root.querySelector<HTMLElement>("[data-hero-sub]");
  const specView = root.querySelector<HTMLElement>("[data-hero-spec]");
  const chartView = root.querySelector<HTMLElement>("[data-hero-chart]");
  const host = root.querySelector<HTMLElement>("[data-hero-host]");
  const pills = [...root.querySelectorAll<HTMLButtonElement>("[data-hero-pill]")];
  const viewButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-hero-view]")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let pinned = false;
  let mounted: { destroy(): void } | null = null;
  let watch: MutationObserver | null = null;

  function animate(motion: Motion): void {
    if (reduce || !host) return;
    const svg = host.querySelector("svg");
    if (!svg) return;
    if (motion === "bar" || motion === "hbar") {
      const rects = [...svg.querySelectorAll("rect")].filter((rect) => {
        const fill = rect.getAttribute("fill");
        if (!fill || fill === "none" || fill.includes("background")) return false;
        const width = rect.getAttribute("width") ?? "";
        const height = rect.getAttribute("height") ?? "";
        if (width.includes("%") || height.includes("%")) return false;
        return Number(width) > 6 && Number(height) > 8;
      });
      rects.forEach((rect, i) => {
        rect.style.transformBox = "fill-box";
        rect.style.transformOrigin = motion === "hbar" ? "left center" : "center bottom";
        rect.style.animation = "none";
        void rect.getBoundingClientRect();
        rect.style.animation = `${motion === "hbar" ? "hh-grow-x" : "hh-grow"} .5s ${i * 40}ms cubic-bezier(.2,.7,.2,1) both`;
      });
      return;
    }
    if (motion === "line" || motion === "area") {
      [...svg.querySelectorAll("path")].forEach((path, i) => {
        const stroke = path.getAttribute("stroke");
        const fill = path.getAttribute("fill");
        const stroked = Boolean(stroke && stroke !== "none" && (!fill || fill === "none"));
        if (stroked && path instanceof SVGPathElement) {
          let len = 0;
          try {
            len = path.getTotalLength();
          } catch {
            len = 0;
          }
          if (len > 1) {
            path.style.strokeDasharray = String(len);
            path.style.setProperty("--hh-len", String(len));
            path.style.animation = "none";
            void path.getBoundingClientRect();
            path.style.animation = `hh-draw 1.1s ${i * 120}ms ease-out both`;
          }
          return;
        }
        if (fill && fill !== "none") {
          path.style.animation = "none";
          void path.getBoundingClientRect();
          path.style.animation = "hh-fade .8s ease-out both";
        }
      });
      return;
    }
    svg.style.animation = "none";
    void svg.getBoundingClientRect();
    svg.style.animation = "hh-fade .6s ease-out both";
  }

  function show(next: number): void {
    if (!host || !specView || !title || !sub) return;
    index = (next + slides.length) % slides.length;
    const slide = slides[index];
    if (!slide) return;
    title.textContent = slide.title;
    sub.textContent = slide.subtitle;
    specView.innerHTML = slide.preview;
    pills.forEach((pill, i) => {
      const on = i === index;
      pill.classList.toggle("is-on", on);
      pill.setAttribute("aria-selected", on ? "true" : "false");
    });
    watch?.disconnect();
    mounted?.destroy();
    mounted = null;
    host.innerHTML = slide.svg;
    if (!reduce && slide.extra) {
      watch = new MutationObserver(() => {
        if (host.querySelector("svg")) animate(slide.motion);
      });
      watch.observe(host, { childList: true });
      window.setTimeout(() => watch?.disconnect(), 4000);
    }
    mounted = mount(host, slide.drawn);
    animate(slide.motion);
  }

  pills.forEach((pill, i) => {
    pill.addEventListener("click", () => {
      pinned = true;
      show(i);
    });
  });

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.heroView;
      const specOn = view === "spec";
      if (chartView) chartView.hidden = specOn;
      if (specView) specView.hidden = !specOn;
      viewButtons.forEach((item) => {
        const on = item === button;
        item.classList.toggle("is-on", on);
        item.setAttribute("aria-pressed", on ? "true" : "false");
      });
    });
  });

  show(0);

  if (!reduce) {
    window.setInterval(() => {
      if (!pinned && document.visibilityState !== "hidden") show(index + 1);
    }, INTERVAL_MS);
  }
}
