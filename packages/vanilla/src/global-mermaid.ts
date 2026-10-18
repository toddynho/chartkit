import { fromMermaid, toSpec } from "@chartkitdev/core/mermaid";

const api = { fromMermaid, toSpec };
const root = globalThis as { ChartKit?: Record<string, unknown>; ChartKitMermaid?: typeof api };
root.ChartKitMermaid = api;
if (root.ChartKit) {
  root.ChartKit.fromMermaid = fromMermaid;
  root.ChartKit.toSpec = toSpec;
}
