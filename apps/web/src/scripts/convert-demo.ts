import { render } from "@chartkitdev/core/all";
import { convert, parseJsx, parseLiteral, type JsxNode } from "@chartkitdev/convert";
import { createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { lineDiff } from "../lib/line-diff";

const LABELS: Record<string, string> = { chartjs: "Chart.js", recharts: "Recharts", echarts: "ECharts" };

interface Sample {
  id: string;
  label: string;
  source: string;
}

const root = document.querySelector<HTMLElement>("[data-convert-demo]");
const sourceEl = document.querySelector<HTMLTextAreaElement>("#convert-source");
const meta = document.querySelector<HTMLElement>("[data-convert-meta]");
const original = document.querySelector<HTMLElement>("[data-original-host]");
const originalError = document.querySelector<HTMLElement>("[data-original-error]");
const chartHost = document.querySelector<HTMLElement>("[data-convert-chart]");
const warningsEl = document.querySelector<HTMLElement>("[data-convert-warnings]");
const specEl = document.querySelector<HTMLElement>("[data-convert-spec]");
const diffEl = document.querySelector<HTMLElement>("[data-convert-diff]");
const sampleNode = document.querySelector<HTMLScriptElement>("#convert-samples");

if (root && sourceEl && meta && original && chartHost && warningsEl && specEl && diffEl && sampleNode?.textContent) {
  const samples = JSON.parse(sampleNode.textContent) as Sample[];
  let sourceId = new URLSearchParams(location.search).get("source") ?? "chartjs";
  const starter = samples.find((item) => item.id === sourceId) ?? samples[0];
  if (starter && sourceEl.value !== starter.source && sourceId !== "custom") sourceEl.value = starter.source;
  let frame = { width: 640, height: 320 };
  let reactRoot: Root | null = null;
  let destroyOriginal = () => {};
  let paintToken = 0;

  const setPressed = () => {
    root.querySelectorAll<HTMLButtonElement>("[data-sample]").forEach((button) => {
      const on = button.dataset.sample === sourceId;
      button.classList.toggle("btn-primary", on);
      button.classList.toggle("btn-secondary", !on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
  };

  const paintChart = (spec: Record<string, unknown> | null) => {
    if (!spec) {
      chartHost.replaceChildren();
      const note = document.createElement("p");
      note.textContent = "No ChartKit spec for this input.";
      chartHost.append(note);
      return;
    }
    const size = spec.size;
    const previous = size && typeof size === "object" && !Array.isArray(size) ? (size as Record<string, unknown>) : {};
    const preview = { ...spec, size: { ...previous, width: frame.width, height: frame.height } };
    chartHost.innerHTML = render(preview);
  };

  const paintWarnings = (warnings: { code: string; path: string; message: string }[]) => {
    warningsEl.replaceChildren();
    if (warnings.length === 0) {
      const p = document.createElement("p");
      p.textContent = "No warnings. Every key the converter read was mapped.";
      warningsEl.append(p);
      return;
    }
    const list = document.createElement("ul");
    list.className = "convert-warnings";
    for (const warning of warnings) {
      const item = document.createElement("li");
      const code = document.createElement("code");
      code.textContent = warning.code;
      item.append(code, " ");
      if (warning.path) {
        const path = document.createElement("code");
        path.textContent = warning.path;
        item.append(path, " ");
      }
      item.append(warning.message);
      list.append(item);
    }
    warningsEl.append(list);
  };

  const paintDiff = (before: string, after: string) => {
    diffEl.replaceChildren();
    for (const row of lineDiff(before, after)) {
      const line = document.createElement("div");
      line.className = row.op === "+" ? "diff-add" : row.op === "-" ? "diff-del" : "diff-same";
      line.textContent = `${row.op === " " ? " " : row.op}${row.text}`;
      diffEl.append(line);
    }
  };

  async function paintOriginal(host: HTMLElement, source: string | null, text: string, token: number) {
    destroyOriginal();
    destroyOriginal = () => {};
    reactRoot?.unmount();
    reactRoot = null;
    host.replaceChildren();
    host.removeAttribute("data-original-ready");
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
        const ResponsiveContainer = lib.ResponsiveContainer as (props: {
          width: string;
          height: number;
          children?: ReactNode;
        }) => ReactNode;
        reactRoot = createRoot(host);
        reactRoot.render(createElement(ResponsiveContainer, { width: "100%", height: 320 }, jsxToElement(parsed.root, lib)));
        host.setAttribute("data-original-ready", "1");
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
        host.setAttribute("data-original-ready", "1");
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
        host.setAttribute("data-original-ready", "1");
        return;
      }
      fail("Paste a Chart.js config, Recharts JSX, or an ECharts option.");
    } catch (error) {
      fail(error instanceof Error ? error.message : "The original library did not render this config.");
    }
  }

  const draw = () => {
    const text = sourceEl.value;
    const result = convert(text);
    const token = ++paintToken;
    meta.textContent = `Detected source: ${result.source ? LABELS[result.source] : "none"}. Chart.js, Recharts, and ECharts load on this page only.`;
    const specText = result.spec ? JSON.stringify(result.spec, null, 2) : "";
    specEl.textContent = specText || "null";
    paintChart(result.spec as Record<string, unknown> | null);
    paintWarnings(result.warnings);
    paintDiff(text, specText || "(no spec)");
    void paintOriginal(original, result.source, text, token);
  };

  root.querySelectorAll<HTMLButtonElement>("[data-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      const sample = samples.find((item) => item.id === button.dataset.sample);
      if (!sample) return;
      sourceId = sample.id;
      sourceEl.value = sample.source;
      setPressed();
      draw();
    });
  });
  sourceEl.addEventListener("input", () => {
    sourceId = "custom";
    setPressed();
    draw();
  });
  const measure = () => {
    const width = Math.max(280, Math.round(original.clientWidth));
    if (width !== frame.width) {
      frame = { width, height: 320 };
      draw();
    }
  };
  if (starter && sourceId !== "custom") {
    sourceId = starter.id;
    sourceEl.value = starter.source;
  }
  setPressed();
  draw();
  const observer = new ResizeObserver(() => {
    const width = Math.max(280, Math.round(original.clientWidth));
    if (width !== frame.width) {
      frame = { width, height: 320 };
      draw();
    }
  });
  observer.observe(original);
  measure();
}

function jsxToElement(node: JsxNode, lib: Record<string, unknown>): ReactNode {
  const Comp = lib[node.name];
  if (typeof Comp !== "function" && (typeof Comp !== "object" || Comp === null)) return null;
  const props: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node.props)) {
    if (value && typeof value === "object" && "__dropped" in value) continue;
    if (key === "width" || key === "height") continue;
    props[key] = value;
  }
  return createElement(Comp as never, props, ...node.children.map((child) => jsxToElement(child, lib)));
}
