import type { ChartSpec } from "@chartkitdev/core";
import { adopt, isExtra, render as renderAll } from "@chartkitdev/core/all";
import { attach, listen, patchSvg, type ClickDetail, type Controller, type Selection } from "@chartkitdev/core/interact";

export type { ChartSpec, ClickDetail, Selection };

const TAG = "chart-kit";

function isSpec(value: unknown): value is ChartSpec {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/**
 * `<chart-kit>` reads a v1 spec from the `spec` property, the `spec` attribute,
 * or a child `<script type="application/json">`. Core charts paint immediately.
 * Histogram through journey load through `@chartkitdev/core/load`.
 * An SVG already in the element is patched in place.
 */
export class ChartKitElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["spec", "theme"];
  }

  #property: ChartSpec | null = null;
  #fromProperty = false;
  #active: ChartSpec | null = null;
  #alive = false;
  #painting = false;
  #job = 0;
  #ctl: Controller | null = null;
  #bound: SVGSVGElement | null = null;
  #listening = false;
  #stop = () => {};
  #tip: { destroy(): void } | null = null;
  #observer: MutationObserver | null = null;
  #reflecting = false;

  /** The spec last drawn, or the object assigned through the property. */
  get spec(): ChartSpec | null {
    return this.#active ?? this.#property;
  }

  set spec(value: ChartSpec | null) {
    this.#fromProperty = value != null;
    this.#property = value;
    this.#render();
  }

  /** Theme name. Reflects the `theme` attribute and overrides `spec.theme` while set. */
  get theme(): string | null {
    return this.getAttribute("theme");
  }

  set theme(value: string | null) {
    if (value == null || value === "") this.removeAttribute("theme");
    else this.setAttribute("theme", value);
  }

  connectedCallback(): void {
    this.#alive = true;
    this.#watch();
    this.#render();
  }

  disconnectedCallback(): void {
    this.#alive = false;
    this.#job += 1;
    this.#stop();
    this.#stop = () => {};
    this.#listening = false;
    this.#ctl?.destroy();
    this.#ctl = null;
    this.#bound = null;
    this.#tip?.destroy();
    this.#tip = null;
    this.#observer?.disconnect();
    this.#observer = null;
  }

  attributeChangedCallback(name: string, previous: string | null, next: string | null): void {
    if (this.#reflecting || previous === next) return;
    if (name === "spec" && this.#fromProperty) return;
    this.#render();
  }

  #watch(): void {
    this.#observer?.disconnect();
    this.#observer = new MutationObserver((records) => {
      if (this.#painting || this.#fromProperty) return;
      const script = records.some((record) => {
        const target = record.target;
        if (target instanceof Element && target.closest("svg")) return false;
        if (target instanceof SVGElement) return false;
        if (record.type === "characterData") return target.parentElement instanceof HTMLScriptElement;
        for (let i = 0; i < record.addedNodes.length; i++) if (record.addedNodes[i] instanceof HTMLScriptElement) return true;
        for (let i = 0; i < record.removedNodes.length; i++) if (record.removedNodes[i] instanceof HTMLScriptElement) return true;
        return false;
      });
      if (script) this.#render();
    });
    this.#observer.observe(this, { childList: true, subtree: true, characterData: true });
  }

  #script(): HTMLScriptElement | null {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child instanceof HTMLScriptElement && child.getAttribute("type") === "application/json") return child;
    }
    return null;
  }

  #svg(): SVGSVGElement | null {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child instanceof SVGSVGElement) return child;
    }
    return null;
  }

  #readSource(): ChartSpec | null {
    if (this.#fromProperty) return isSpec(this.#property) ? this.#property : null;
    const attr = this.getAttribute("spec");
    if (attr) {
      try {
        const parsed = JSON.parse(attr) as unknown;
        return isSpec(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    const text = this.#script()?.textContent?.trim();
    if (!text) return null;
    try {
      const parsed = JSON.parse(text) as unknown;
      return isSpec(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  #resolve(): ChartSpec | null {
    const spec = this.#readSource();
    if (!spec) return null;
    const theme = this.getAttribute("theme");
    if (theme && spec.theme !== theme) return { ...spec, theme: theme as ChartSpec["theme"] };
    if (!theme && typeof spec.theme === "string" && spec.theme) {
      this.#reflecting = true;
      this.setAttribute("theme", spec.theme);
      this.#reflecting = false;
    }
    return spec;
  }

  #render(): void {
    if (!this.#alive) return;
    const spec = this.#resolve();
    if (!spec) return;
    const key = JSON.stringify(spec);
    if (key === JSON.stringify(this.#active) && this.#ctl) return;
    this.#active = spec;
    this.#kick(spec);
  }

  #paint(markup: string): void {
    this.#painting = true;
    queueMicrotask(() => {
      this.#painting = false;
    });
    if (this.#svg()) patchSvg(this, markup);
    else this.insertAdjacentHTML("beforeend", markup);
  }

  #arm(spec: ChartSpec, markup: string): void {
    if (!this.#alive) return;
    const svg = this.#svg();
    if (!svg) return;
    if (this.#ctl && svg === this.#bound) {
      this.#ctl.update(spec, markup);
      return;
    }
    this.#ctl?.destroy();
    this.#ctl = attach(this, spec, { render: (value) => renderAll(value as ChartSpec) });
    this.#bound = svg;
    if (this.#listening) return;
    this.#stop = listen(this, {
      selectionchange: (detail) => {
        this.dispatchEvent(new CustomEvent("select", { bubbles: true, composed: true, detail }));
      },
    });
    this.#listening = true;
  }

  #kick(spec: ChartSpec): void {
    const token = ++this.#job;
    const type = spec.type;
    if (typeof type === "string" && isExtra(type)) {
      void this.#loadExtra(spec, token);
      return;
    }
    this.#tip?.destroy();
    this.#tip = null;
    const markup = renderAll(spec);
    if (!this.#alive || token !== this.#job) return;
    this.#paint(markup);
    this.#arm(spec, markup);
  }

  /**
   * Same modules as `open()` in `@chartkitdev/core/all`.
   * Painting goes through `patchSvg` so a server-rendered `<svg>` and the spec `<script>` stay put.
   */
  async #loadExtra(spec: ChartSpec, token: number): Promise<void> {
    const type = spec.type;
    if (!type) return;
    const { load } = await import("@chartkitdev/core/load");
    if (!this.#alive || token !== this.#job) return;
    const chart = await load(type);
    if (!this.#alive || token !== this.#job || !chart) return;
    adopt(chart);
    const markup = renderAll(spec);
    if (!this.#alive || token !== this.#job) return;
    this.#paint(markup);
    this.#arm(spec, markup);
    if (!this.#alive || token !== this.#job) return;
    const { attach: tip } = await import("@chartkitdev/core/extra-tip");
    if (!this.#alive || token !== this.#job) return;
    this.#tip?.destroy();
    this.#tip = tip(this);
  }
}

export function defineChartKit(tag = TAG): typeof ChartKitElement {
  if (!customElements.get(tag)) customElements.define(tag, ChartKitElement);
  return ChartKitElement;
}

defineChartKit();

declare global {
  interface HTMLElementTagNameMap {
    "chart-kit": ChartKitElement;
  }
}
