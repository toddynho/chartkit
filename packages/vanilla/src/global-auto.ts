import type { ChartSpec } from "@chartkitdev/core";
import { render } from "@chartkitdev/core/extra";
import { mermaidScriptUrl, mountFences, type FenceResult } from "./mount-fences";

interface MermaidApi {
  fromMermaid: (text: string, options?: { maxSource?: number; maxPoints?: number }) => FenceResult;
  toSpec: (text: string, options?: { maxSource?: number; maxPoints?: number }) => FenceResult;
}

const root = globalThis as { ChartKit?: Record<string, unknown>; ChartKitMermaid?: MermaidApi };
const draw = render as (spec: ChartSpec) => string;

function chartkitJson(text: string): FenceResult {
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  if (!trimmed.startsWith("{")) return { spec: null };
  try {
    const value = JSON.parse(trimmed) as unknown;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const spec = value as Record<string, unknown>;
      if (typeof spec.type === "string" || typeof spec.version === "string") return { spec };
    }
  } catch {
    return { spec: null };
  }
  return { spec: null };
}

const script = typeof document === "undefined" ? null : document.currentScript;
const wantMermaid = script instanceof HTMLScriptElement && script.hasAttribute("data-chartkit-mermaid");

function loadMermaid(): Promise<MermaidApi> {
  if (root.ChartKitMermaid) return Promise.resolve(root.ChartKitMermaid);
  const src = script instanceof HTMLScriptElement && script.src ? mermaidScriptUrl(script.src) : "chartkit.mermaid.global.js";
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => (root.ChartKitMermaid ? resolve(root.ChartKitMermaid) : reject(new Error("ChartKit Mermaid parser did not register")));
    el.onerror = () => reject(new Error("ChartKit Mermaid parser failed to load"));
    document.head.appendChild(el);
  });
}

function autoRender(scope: ParentNode = document, options: { mermaid?: boolean; maxSource?: number; maxPoints?: number } = {}): number {
  const parser = root.ChartKitMermaid;
  return mountFences(scope, {
    ...options,
    render: draw,
    toSpec: parser?.toSpec ?? chartkitJson,
    fromMermaid: parser?.fromMermaid,
  });
}

root.ChartKit = { autoRender, loadMermaid };

function boot(): void {
  autoRender(document);
  if (!wantMermaid || !document.querySelector("pre.mermaid, code.language-mermaid")) return;
  loadMermaid()
    .then(() => {
      if (root.ChartKit) {
        root.ChartKit.fromMermaid = root.ChartKitMermaid?.fromMermaid;
        root.ChartKit.toSpec = root.ChartKitMermaid?.toSpec;
      }
      autoRender(document, { mermaid: true });
    })
    .catch(() => undefined);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
}
