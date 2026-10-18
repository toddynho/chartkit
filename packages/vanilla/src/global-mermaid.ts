import { fromMermaid, toSpec } from "@chartkitdev/core/mermaid";
import { mermaidPhase4ScriptUrl, pageNeedsMermaidPhase4 } from "./mermaid-phase4-url";

const api = {
  fromMermaid,
  toSpec,
  ready: Promise.resolve() as Promise<void>,
};
const root = globalThis as {
  ChartKit?: Record<string, unknown>;
  ChartKitMermaid?: { fromMermaid: typeof fromMermaid; toSpec: typeof toSpec; ready?: Promise<void> };
};
root.ChartKitMermaid = api;
if (root.ChartKit) {
  root.ChartKit.fromMermaid = fromMermaid;
  root.ChartKit.toSpec = toSpec;
}

const script = typeof document === "undefined" ? null : document.currentScript;
const scriptSrc = script instanceof HTMLScriptElement ? script.src : null;

function injectPhase4(resolve: () => void): void {
  if (!pageNeedsMermaidPhase4(document)) {
    resolve();
    return;
  }
  const el = document.createElement("script");
  el.src = scriptSrc ? mermaidPhase4ScriptUrl(scriptSrc) : "chartkit.mermaid-phase4.global.js";
  el.async = true;
  el.onload = () => resolve();
  el.onerror = () => resolve();
  document.head.appendChild(el);
}

if (typeof document !== "undefined") {
  api.ready = new Promise((resolve) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => injectPhase4(resolve));
    else injectPhase4(resolve);
  });
}
