import { render } from "@chartkitdev/core/all";
import { convert, parseJsx, parseLiteral, type JsxNode } from "@chartkitdev/convert";
import { createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const LABELS: Record<string, string> = { chartjs: "Chart.js", recharts: "Recharts", echarts: "ECharts" };
const STORE = "chartkit-convert";

interface Sample {
  id: string;
  label: string;
  source: string;
}

const root = document.querySelector<HTMLElement>("[data-convert-demo]");
const sourceEl = document.querySelector<HTMLTextAreaElement>("#convert-source");
const original = document.querySelector<HTMLElement>("[data-original-host]");
const originalError = document.querySelector<HTMLElement>("[data-original-error]");
const chartHost = document.querySelector<HTMLElement>("[data-convert-chart]");
const kitHost = document.querySelector<HTMLElement>("[data-kit-host]");
const warningsEl = document.querySelector<HTMLElement>("[data-convert-warnings]");
const specEl = document.querySelector<HTMLElement>("[data-convert-spec]");
const sampleNode = document.querySelector<HTMLScriptElement>("#convert-samples");

if (root && sourceEl && original && chartHost && kitHost && warningsEl && specEl && sampleNode?.textContent) {
  const samples = JSON.parse(sampleNode.textContent) as Sample[];
  const params = new URLSearchParams(location.search);
  let sourceId = params.get("source") ?? "recharts";
  if (!samples.some((item) => item.id === sourceId)) sourceId = samples[0]?.id ?? "recharts";
  const hash = location.hash.startsWith("#code=") ? decodeURIComponent(location.hash.slice("#code=".length)) : "";
  const stored = hash ? "" : sessionStorage.getItem(STORE) ?? "";
  const starter = samples.find((item) => item.id === sourceId) ?? samples[0];
  if (hash) sourceEl.value = hash;
  else if (stored) sourceEl.value = stored;
  else if (starter) sourceEl.value = starter.source;

  let frame = { width: 640, height: 320 };
  let reactRoot: Root | null = null;
  let destroyOriginal = () => {};
  let paintToken = 0;
  let timer = 0;
  let latestSpec = "";

  const setTabs = () => {
    root.querySelectorAll<HTMLButtonElement>("[data-sample]").forEach((button) => {
      button.classList.toggle("is-on", button.dataset.sample === sourceId);
    });
  };

  const paintChart = (spec: Record<string, unknown> | null, host: HTMLElement) => {
    if (!spec) {
      host.replaceChildren();
      const note = document.createElement("p");
      note.textContent = "No ChartKit spec for this input.";
      host.append(note);
      return;
    }
    const size = spec.size;
    const previous = size && typeof size === "object" && !Array.isArray(size) ? (size as Record<string, unknown>) : {};
    const preview = { ...spec, size: { ...previous, width: frame.width, height: frame.height } };
    host.innerHTML = render(preview);
  };

  const paintWarnings = (warnings: { code: string; path: string; message: string }[]) => {
    warningsEl.replaceChildren();
    const count = root.querySelector("[data-warn-count]");
    if (count) count.textContent = String(warnings.length);
    if (warnings.length === 0) {
      const p = document.createElement("p");
      p.className = "cvt-alt";
      p.textContent = "No warnings. Every key the converter read was mapped.";
      warningsEl.append(p);
      return;
    }
    const list = document.createElement("ul");
    list.className = "cvt-warns";
    for (const warning of warnings) {
      const item = document.createElement("li");
      const code = document.createElement("code");
      code.textContent = warning.code;
      item.append(code, " ", warning.path ? `${warning.path} ` : "", warning.message);
      list.append(item);
    }
    warningsEl.append(list);
  };

  async function paintOriginal(host: HTMLElement, source: string | null, text: string, token: number) {
    destroyOriginal();
    destroyOriginal = () => {};
    reactRoot?.unmount();
    reactRoot = null;
    host.replaceChildren();
    if (originalError) originalError.hidden = true;
    const fail = (message: string) => {
      if (token !== paintToken || !originalError) return;
      originalError.hidden = false;
      originalError.textContent = message;
    };
    try {
      if (source === "recharts") {
        const lib = (await import("recharts")) as unknown as Record<string, unknown>;
        if (token !== paintToken) return;
        const parsed = parseJsx(text);
        if (!parsed.root) throw new Error("No Recharts chart tag in this snippet.");
        const bound = parsed.root.props.data;
        const missing = bound == null || (typeof bound === "object" && "__dropped" in bound);
        if (missing && Array.isArray(parsed.bindings.data)) parsed.root.props.data = parsed.bindings.data;
        const width = Math.max(280, host.clientWidth || 320);
        const height = 300;
        reactRoot = createRoot(host);
        reactRoot.render(jsxToElement(parsed.root, lib, { width, height }));
        return;
      }
      if (source === "chartjs") {
        const parsed = parseLiteral(text);
        const mod = await import("chart.js/auto");
        if (token !== paintToken) return;
        const canvas = document.createElement("canvas");
        canvas.className = "convert-canvas";
        host.append(canvas);
        const config = parsed.value as { options?: Record<string, unknown> };
        config.options = { ...(config.options ?? {}), responsive: true, maintainAspectRatio: false };
        const chart = new mod.default(canvas, config as never);
        destroyOriginal = () => chart.destroy();
        return;
      }
      if (source === "echarts") {
        const parsed = parseLiteral(text);
        const echarts = await import("echarts");
        if (token !== paintToken) return;
        const chart = echarts.init(host, undefined, { renderer: "canvas" });
        chart.setOption(parsed.value as never);
        const onResize = () => chart.resize();
        window.addEventListener("resize", onResize);
        destroyOriginal = () => {
          window.removeEventListener("resize", onResize);
          chart.dispose();
        };
        return;
      }
      fail("Paste a Chart.js config, Recharts JSX, or an ECharts option.");
    } catch (error) {
      fail(error instanceof Error ? error.message : "The original library did not render this config.");
    }
  }

  const draw = () => {
    const text = sourceEl.value;
    sessionStorage.setItem(STORE, text);
    const result = convert(text);
    const token = ++paintToken;
    const detected = root.querySelector("[data-detected]");
    if (detected) detected.textContent = `detected · ${result.source ? LABELS[result.source] : "none"}`;
    const label = root.querySelector("[data-original-label]");
    if (label) label.textContent = `original · ${result.source ? LABELS[result.source] : "unrecognized"}`;
    latestSpec = result.spec ? JSON.stringify(result.spec, null, 2) : "";
    specEl.textContent = latestSpec || "No spec.";
    const bytes = new TextEncoder().encode(latestSpec).length;
    const size = root.querySelector("[data-svg-size]");
    if (size) size.textContent = result.spec ? `spec · ${(bytes / 1000).toFixed(1)} KB` : "no spec";
    paintChart(result.spec as Record<string, unknown> | null, chartHost);
    paintChart(result.spec as Record<string, unknown> | null, kitHost);
    paintWarnings(result.warnings);
    const state = root.querySelector<HTMLElement>("[data-state]");
    if (state) {
      state.textContent = result.spec ? `● valid · ${latestSpec.split("\n").length} lines` : "● no spec";
      state.style.color = result.spec ? "#1a7f4b" : "#9a5b00";
    }
    const meta = root.querySelector("[data-paste-meta]");
    if (meta) meta.textContent = `${text.split("\n").length} lines · runs in your browser, nothing is uploaded`;
    const summary = root.querySelector("[data-summary]");
    if (summary) summary.textContent = result.spec ? `${result.warnings.length} warning${result.warnings.length === 1 ? "" : "s"}` : "No spec";
    const play = root.querySelector<HTMLAnchorElement>("[data-play]");
    if (play && result.spec) play.href = `/playground#${encodeURIComponent(JSON.stringify(result.spec))}`;
    void paintOriginal(original, result.source, text, token);
  };

  root.querySelectorAll<HTMLButtonElement>("[data-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      const sample = samples.find((item) => item.id === button.dataset.sample);
      if (!sample) return;
      sourceId = sample.id;
      sourceEl.value = sample.source;
      setTabs();
      draw();
    });
  });
  root.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;
      root.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((item) => item.classList.toggle("is-on", item === button));
      root.querySelectorAll<HTMLElement>("[data-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.panel !== view;
      });
    });
  });
  sourceEl.addEventListener("input", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(draw, 200);
  });
  root.querySelector("[data-load]")?.addEventListener("click", () => {
    const sample = samples.find((item) => item.id === sourceId) ?? samples[0];
    if (!sample) return;
    sourceEl.value = sample.source;
    draw();
  });
  root.querySelector("[data-copy]")?.addEventListener("click", () => {
    if (!latestSpec) return;
    const button = root.querySelector<HTMLButtonElement>("[data-copy]");
    void navigator.clipboard.writeText(latestSpec).then(() => {
      if (!button) return;
      button.textContent = "Copied ✓";
      window.setTimeout(() => {
        button.textContent = "Copy spec";
      }, 1300);
    });
  });
  setTabs();
  draw();
}

function jsxToElement(node: JsxNode, lib: Record<string, unknown>, size?: { width: number; height: number }): ReactNode {
  const Comp = lib[node.name];
  if (typeof Comp !== "function" && (typeof Comp !== "object" || Comp === null)) return null;
  const props: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node.props)) {
    if (value && typeof value === "object" && "__dropped" in value) continue;
    props[key] = value;
  }
  if (size) {
    props.width = size.width;
    props.height = size.height;
  }
  return createElement(Comp as never, props, ...node.children.map((child) => jsxToElement(child, lib)));
}
