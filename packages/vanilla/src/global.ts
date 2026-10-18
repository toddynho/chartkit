import { fromMermaid, toSpec } from "@chartkitdev/core/mermaid";
import { autoRender } from "./auto";

const api = { autoRender, fromMermaid, toSpec };
(globalThis as { ChartKit?: typeof api }).ChartKit = api;

const current = typeof document === "undefined" ? null : document.currentScript;
const mermaid = current instanceof HTMLElement && current.hasAttribute("data-chartkit-mermaid");

function boot(): void {
  if (typeof document === "undefined") return;
  autoRender(document, { mermaid });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
