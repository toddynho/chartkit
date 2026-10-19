import type { ChartSpec } from "@chartkitdev/core";
import { isExtra, render as renderCore } from "@chartkitdev/core/all";
import { attach } from "@chartkitdev/core/extra-tip";
import { mountFences, type FenceResult } from "./mount-fences";

export interface ChartChunk {
  render: (spec: Record<string, unknown>) => string | null;
}

interface Globals {
  ChartKitCharts?: Record<string, ChartChunk>;
}

export interface BrowserMountOptions {
  mermaid?: boolean;
  maxSource?: number;
  maxPoints?: number;
  toSpec: (text: string, options?: { maxSource?: number; maxPoints?: number }) => FenceResult;
  fromMermaid?: (text: string, options?: { maxSource?: number; maxPoints?: number }) => FenceResult;
  /** Page URL of chartkit.global.js or chartkit.auto.global.js. Sibling chart files load next to it. */
  scriptSrc?: string | null;
}

const pending = new Map<string, Promise<void>>();

/** Sibling URL for one extra chart, next to the global script. */
export function chartScriptUrl(scriptSrc: string, type: string): string {
  return new URL(`chartkit.${type}.global.js`, scriptSrc).href;
}

export function renderKnown(spec: ChartSpec): string {
  const type = typeof spec.type === "string" ? spec.type : "";
  if (isExtra(type)) {
    const chunk = (globalThis as Globals).ChartKitCharts?.[type];
    return chunk?.render(spec as unknown as Record<string, unknown>) ?? "";
  }
  return renderCore(spec);
}

export function extraTypesIn(root: ParentNode): string[] {
  const found: string[] = [];
  for (const node of Array.from(root.querySelectorAll("pre.chartkit, code.language-chartkit"))) {
    const match = /"type"\s*:\s*"([a-z0-9-]+)"/.exec(node.textContent ?? "");
    if (match && isExtra(match[1]) && !found.includes(match[1])) found.push(match[1]);
  }
  return found;
}

export function loadChartScripts(types: string[], scriptSrc: string | null): Promise<void> {
  const jobs = types.filter((type, index) => isExtra(type) && types.indexOf(type) === index).map((type) => loadChart(type, scriptSrc));
  return Promise.all(jobs).then(() => undefined);
}

function loadChart(type: string, scriptSrc: string | null): Promise<void> {
  if ((globalThis as Globals).ChartKitCharts?.[type]) return Promise.resolve();
  const existing = pending.get(type);
  if (existing) return existing;
  const promise = new Promise<void>((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("ChartKit charts load in the browser"));
      return;
    }
    const el = document.createElement("script");
    el.src = scriptSrc ? chartScriptUrl(scriptSrc, type) : `chartkit.${type}.global.js`;
    el.async = true;
    el.onload = () => ((globalThis as Globals).ChartKitCharts?.[type] ? resolve() : reject(new Error(`ChartKit ${type} did not register`)));
    el.onerror = () => reject(new Error(`ChartKit ${type} failed to load`));
    document.head.appendChild(el);
  });
  pending.set(type, promise);
  return promise;
}

function mountKnown(root: ParentNode, options: BrowserMountOptions): number {
  const count = mountFences(root, { ...options, render: renderKnown });
  if (typeof root.querySelectorAll !== "function") return count;
  for (const host of Array.from(root.querySelectorAll(".chartkit"))) {
    const type = host.querySelector("svg")?.getAttribute("data-ck-type") ?? "";
    if (!isExtra(type) || host.getAttribute("data-ck-extra-tip-host")) continue;
    host.setAttribute("data-ck-extra-tip-host", "");
    attach(host);
  }
  return count;
}

/** Draw core charts now. Extra types stay in the fence until their sibling script registers. */
export function bootBrowser(root: ParentNode, options: BrowserMountOptions): number {
  const count = mountKnown(root, options);
  const types = extraTypesIn(root);
  if (types.length === 0 || typeof document === "undefined") return count;
  void loadChartScripts(types, options.scriptSrc ?? null)
    .then(() => mountKnown(root, options))
    .catch(() => undefined);
  return count;
}
