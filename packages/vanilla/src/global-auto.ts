import { bootBrowser } from "./global-charts";
import { mermaidScriptUrl, type FenceResult } from "./mount-fences";

interface MermaidApi {
  fromMermaid: (text: string, options?: { maxSource?: number; maxPoints?: number }) => FenceResult;
  toSpec: (text: string, options?: { maxSource?: number; maxPoints?: number }) => FenceResult;
  ready?: Promise<unknown>;
}

const root = globalThis as { ChartKit?: Record<string, unknown>; ChartKitMermaid?: MermaidApi };

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
const scriptSrc = script instanceof HTMLScriptElement ? script.src : null;
const wantMermaid = script instanceof HTMLScriptElement && script.hasAttribute("data-chartkit-mermaid");

function whenReady(api: MermaidApi): Promise<MermaidApi> {
  const ready = api.ready;
  if (!ready) return Promise.resolve(root.ChartKitMermaid ?? api);
  return ready.then(() => root.ChartKitMermaid ?? api);
}

function loadMermaid(): Promise<MermaidApi> {
  if (root.ChartKitMermaid) return whenReady(root.ChartKitMermaid);
  const src = scriptSrc ? mermaidScriptUrl(scriptSrc) : "chartkit.mermaid.global.js";
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => {
      const api = root.ChartKitMermaid;
      if (!api) {
        reject(new Error("ChartKit Mermaid parser did not register"));
        return;
      }
      whenReady(api).then(resolve, reject);
    };
    el.onerror = () => reject(new Error("ChartKit Mermaid parser failed to load"));
    document.head.appendChild(el);
  });
}

function autoRender(scope: ParentNode = document, options: { mermaid?: boolean; maxSource?: number; maxPoints?: number } = {}): number {
  const parser = root.ChartKitMermaid;
  return bootBrowser(scope, {
    ...options,
    scriptSrc,
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
