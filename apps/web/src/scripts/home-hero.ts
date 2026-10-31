import { mount } from "@chartkitdev/vanilla";
import type { ChartSpec } from "@chartkitdev/core";

const INTERVAL_MS = 3200;

type Motion = "bar" | "hbar" | "line" | "area" | "fade";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  motion: Motion;
  extra: boolean;
  preview: string;
  svg: string;
  drawn: ChartSpec;
};

type ExtraPayload = {
  type: string;
  title: string;
  subtitle: string;
  motion: Motion;
  spec: ChartSpec & { title?: string; subtitle?: string };
  /** Pre-drawn when vanilla mount cannot paint the type (maps and bar list). */
  svg?: string;
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
  const pills = [...document.querySelectorAll<HTMLButtonElement>("[data-hero-pill]")];
  const viewButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-hero-view]")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let rot = 0;
  let pinned = false;
  let generation = 0;
  let mounted: { destroy(): void } | null = null;
  let watch: MutationObserver | null = null;

  function previewHtml(spec: unknown): string {
    const json = JSON.stringify(spec, null, 2);
    return json
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll(/("(?:\\.|[^"\\])*")(\s*:)/g, '<span class="tok-key">$1</span>$2')
      .replaceAll(/: ("(?:\\.|[^"\\])*")/g, ': <span class="tok-str">$1</span>')
      .replaceAll(/: (-?\d+(?:\.\d+)?)/g, ': <span class="tok-num">$1</span>');
  }

  function drawnOf(spec: ExtraPayload["spec"]): ChartSpec {
    const copy = { ...spec };
    delete copy.title;
    delete copy.subtitle;
    return copy;
  }

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

  function mark(match: (pill: HTMLButtonElement) => boolean): void {
    pills.forEach((pill) => {
      const on = match(pill);
      pill.classList.toggle("is-on", on);
      pill.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function release(): void {
    watch?.disconnect();
    watch = null;
    mounted?.destroy();
    mounted = null;
  }

  function show(next: number): void {
    if (!host || !specView || !title || !sub) return;
    const token = ++generation;
    const slide = slides[next];
    if (!slide) return;
    title.textContent = slide.title;
    sub.textContent = slide.subtitle;
    specView.innerHTML = slide.preview;
    mark((pill) => pill.dataset.heroSlide === slide.id);
    release();
    host.innerHTML = slide.svg;
    if (!reduce && slide.extra) {
      watch = new MutationObserver(() => {
        if (token !== generation) return;
        if (host.querySelector("svg")) animate(slide.motion);
      });
      watch.observe(host, { childList: true });
      window.setTimeout(() => {
        if (token === generation) watch?.disconnect();
      }, 4000);
    }
    mounted = mount(host, slide.drawn);
    animate(slide.motion);
  }

  async function paintExtra(payload: ExtraPayload, token: number): Promise<void> {
    if (!host) return;
    if (token !== generation) return;
    if (payload.svg) {
      host.innerHTML = payload.svg;
      return;
    }
    mounted = mount(host, drawnOf(payload.spec));
  }

  async function showExtra(pick: HTMLButtonElement): Promise<void> {
    if (!host || !specView || !title || !sub) return;
    const type = pick.dataset.heroType ?? "";
    const token = ++generation;
    title.textContent = pick.dataset.heroTitle ?? pick.textContent ?? type;
    sub.textContent = pick.dataset.heroSub ?? "";
    mark((pill) => pill === pick);
    release();
    host.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(`/hero/${type}.json`);
      if (!response.ok) throw new Error(`${type} spec did not load`);
      const payload = (await response.json()) as ExtraPayload;
      if (token !== generation) return;
      title.textContent = payload.title;
      sub.textContent = payload.subtitle;
      specView.innerHTML = previewHtml(payload.spec);
      await paintExtra(payload, token);
      if (token !== generation) return;
      animate(payload.motion);
    } catch (error) {
      if (token !== generation || !host) return;
      const message = error instanceof Error ? error.message : "This chart did not render.";
      host.innerHTML = `<p class="hh-miss">${message}</p>`;
    } finally {
      if (token === generation) host.removeAttribute("aria-busy");
    }
  }

  function openPill(index: number, fromAuto: boolean): void {
    const pill = pills[index];
    if (!pill) return;
    rot = index;
    if (!fromAuto) pinned = true;
    const slide = pill.dataset.heroSlide;
    if (slide) {
      const at = slides.findIndex((item) => item.id === slide);
      if (at >= 0) show(at);
      return;
    }
    void showExtra(pill);
  }

  pills.forEach((pill, index) => {
    pill.addEventListener("click", () => openPill(index, false));
  });

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const specOn = button.dataset.heroView === "spec";
      if (chartView) chartView.hidden = specOn;
      if (specView) specView.hidden = !specOn;
      viewButtons.forEach((item) => {
        const on = item === button;
        item.classList.toggle("is-on", on);
        item.setAttribute("aria-pressed", on ? "true" : "false");
      });
    });
  });

  if (pills.length > 0) openPill(0, true);

  if (!reduce && pills.length > 1) {
    window.setInterval(() => {
      if (pinned || document.visibilityState === "hidden") return;
      rot = (rot + 1) % pills.length;
      openPill(rot, true);
    }, INTERVAL_MS);
  }
}
