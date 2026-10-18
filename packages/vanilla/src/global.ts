import { fromMermaid, toSpec } from "@chartkitdev/core/mermaid";
import { bootBrowser } from "./global-charts";
import { mermaidPhase4ScriptUrl, pageNeedsMermaidPhase4 } from "./mermaid-phase4-url";

const script = typeof document === "undefined" ? null : document.currentScript;
const scriptSrc = script instanceof HTMLScriptElement ? script.src : null;
const mermaidOn = script instanceof HTMLElement && script.hasAttribute("data-chartkit-mermaid");

function liveParser(): { fromMermaid: typeof fromMermaid; toSpec: typeof toSpec } {
  const kit = (globalThis as { ChartKit?: { fromMermaid?: typeof fromMermaid; toSpec?: typeof toSpec } }).ChartKit;
  return { fromMermaid: kit?.fromMermaid ?? fromMermaid, toSpec: kit?.toSpec ?? toSpec };
}

function autoRender(root: ParentNode = document, options: { mermaid?: boolean; maxSource?: number; maxPoints?: number } = {}): number {
  const live = liveParser();
  return bootBrowser(root, { ...options, fromMermaid: live.fromMermaid, toSpec: live.toSpec, scriptSrc });
}

const api = { autoRender, fromMermaid, toSpec };
(globalThis as { ChartKit?: typeof api }).ChartKit = api;

function loadPhase4(): Promise<void> {
  if (!mermaidOn || typeof document === "undefined" || !pageNeedsMermaidPhase4(document)) return Promise.resolve();
  return new Promise((resolve) => {
    const el = document.createElement("script");
    el.src = scriptSrc ? mermaidPhase4ScriptUrl(scriptSrc) : "chartkit.mermaid-phase4.global.js";
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => resolve();
    document.head.appendChild(el);
  });
}

function boot(): void {
  if (typeof document === "undefined") return;
  void loadPhase4().then(() => autoRender(document, { mermaid: mermaidOn }));
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
