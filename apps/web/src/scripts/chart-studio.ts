import type { ChartSpec } from "@chartkitdev/core";
import { resetOption, writeOption, type OptionField } from "@chartkitdev/core/options";
import { mount } from "@chartkitdev/vanilla";
import { previewSize, stripPreviewSize } from "../data/preview-size";
import { chartType, drawChart } from "../lib/paint-chart";
import { isRecord, pretty } from "../lib/spec-text";
import { bindExamplePicker, selectExample } from "./example-picker";
import { mountOptionControls } from "./option-controls";

interface StudioExample {
  slug: string;
  title: string;
  blurb: string;
  alt: string;
  spec: Record<string, unknown>;
}

interface StudioData {
  examples: StudioExample[];
  fallback: Record<string, unknown>;
}

/** Live chart on a docs page: example chips, option controls, preview, and spec. */
export function mountChartStudio(root: HTMLElement): void {
  const raw = document.getElementById("chart-studio-data")?.textContent;
  if (!raw || root.dataset.mounted === "1") return;
  root.dataset.mounted = "1";
  const data = JSON.parse(raw) as StudioData;
  const examples = data.examples.filter((item) => item.spec && typeof item.spec === "object");
  let slug = slugFromHash(examples) || examples[0]?.slug || "";
  let spec = clone(examples.find((item) => item.slug === slug)?.spec ?? data.fallback);
  let hiddenY: unknown[] = [];
  let paintGen = 0;
  let liveDestroy: (() => void) | null = null;

  const chart = root.querySelector<HTMLElement>("[data-chart]");
  const code = root.querySelector<HTMLElement>("[data-code]");
  const play = root.querySelector<HTMLAnchorElement>("[data-play]");
  const optionsRoot = root.querySelector<HTMLElement>("[data-options]");
  const picker = root.querySelector<HTMLElement>("[data-example-picker]");

  if (picker) {
    bindExamplePicker(picker, (next) => {
      const example = examples.find((item) => item.slug === next);
      if (!example) return;
      slug = next;
      spec = clone(example.spec);
      hiddenY = [];
      controls?.refresh(true);
      const caption = example.alt || example.blurb;
      if (chart && caption) chart.setAttribute("aria-label", caption);
      void paint();
    });
    if (slug) selectExample(picker, slug);
  }

  const controls = optionsRoot
    ? mountOptionControls(optionsRoot, {
        readSpec: () => spec,
        readHiddenY: () => hiddenY,
        setHiddenY: (items) => {
          hiddenY = items;
        },
        commit: (field, value) => {
          spec = applyField(spec, field, value);
          void paint();
        },
        replace: (next) => {
          spec = next;
          void paint();
        },
      })
    : null;

  syncText();
  void paint();

  function syncText(): void {
    if (code) code.textContent = pretty(spec);
    if (play) play.href = `/playground#${encodeURIComponent(JSON.stringify(spec))}`;
  }

  async function paint(): Promise<void> {
    syncText();
    const gen = ++paintGen;
    liveDestroy?.();
    liveDestroy = null;
    const view = paintView(spec);
    let svg = "";
    try {
      svg = await paintSvg(view);
    } catch (error) {
      svg = "";
      if (chart) chart.textContent = error instanceof Error ? error.message : "Render failed";
    }
    if (gen !== paintGen || !chart) return;
    if (!svg) return;
    chart.replaceChildren();
    const frame = document.createElement("div");
    frame.className = "chart-studio__svg";
    frame.innerHTML = svg;
    chart.append(frame);
    const kind = chartType(view);
    try {
      if (kind === "choropleth" || kind === "map-points") {
        const node = frame.querySelector("svg");
        if (node) {
          const { attach } = await import("@chartkitdev/geo");
          if (gen !== paintGen) return;
          const stop = attach(node);
          liveDestroy = stop;
        }
      } else if (svg.includes("<svg")) {
        const handle = mount(frame, view as ChartSpec, { render: (next) => drawChart(next) });
        if (gen !== paintGen) {
          handle.destroy();
          return;
        }
        liveDestroy = () => handle.destroy();
      }
    } catch {
      frame.innerHTML = svg;
    }
  }
}

function slugFromHash(examples: StudioExample[]): string {
  const hash = location.hash.replace(/^#/, "");
  if (!hash.startsWith("example-")) return "";
  const slug = hash.slice("example-".length);
  return examples.some((item) => item.slug === slug) ? slug : "";
}

function applyField(spec: Record<string, unknown>, field: OptionField, value: unknown): Record<string, unknown> {
  if (field.path === "type" && typeof value === "string" && value) {
    const next = clone(spec);
    next.type = value;
    stripPreviewSize(next);
    return next;
  }
  return value === undefined ? resetOption(spec, field) : writeOption(spec, field, value);
}

/** Render size: a size on the spec wins, otherwise the per-type preview default. */
function paintView(spec: Record<string, unknown>): Record<string, unknown> {
  const view = clone(spec);
  const size = previewSize(chartType(view), "card", view);
  const prev = isRecord(view.size) ? { ...view.size } : {};
  prev.width = size.width;
  if (size.height != null) prev.height = size.height;
  else delete prev.height;
  if (size.minHeight != null) prev.minHeight = size.minHeight;
  view.size = prev;
  return view;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

async function paintSvg(spec: Record<string, unknown>): Promise<string> {
  const type = chartType(spec);
  if (type === "choropleth" || type === "map-points") {
    const geo = await import("@chartkitdev/geo");
    return geo.render(spec);
  }
  return drawChart(spec);
}
