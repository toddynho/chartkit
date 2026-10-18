import { fromMermaid, toSpec } from "@chartkitdev/core/mermaid";
import { bootBrowser } from "./global-charts";

const script = typeof document === "undefined" ? null : document.currentScript;
const scriptSrc = script instanceof HTMLScriptElement ? script.src : null;
const mermaidOn = script instanceof HTMLElement && script.hasAttribute("data-chartkit-mermaid");

function autoRender(root: ParentNode = document, options: { mermaid?: boolean; maxSource?: number; maxPoints?: number } = {}): number {
  return bootBrowser(root, { ...options, fromMermaid, toSpec, scriptSrc });
}

const api = { autoRender, fromMermaid, toSpec };
(globalThis as { ChartKit?: typeof api }).ChartKit = api;

function boot(): void {
  if (typeof document === "undefined") return;
  autoRender(document, { mermaid: mermaidOn });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
