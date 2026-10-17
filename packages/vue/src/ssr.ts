import { createSSRApp, h } from "vue";
import { renderToString as vueRenderToString } from "vue/server-renderer";
import type { ChartSpec } from "@chartkitdev/core";
import { Chart } from "./Chart";

/** Vue SSR HTML for a spec. The SVG inside the wrapper is core's render output. */
export function renderToString(spec: ChartSpec, render?: (spec: ChartSpec) => string): Promise<string> {
  const app = createSSRApp({
    name: "ChartKitSsr",
    render: () => h(Chart, render ? { spec, render } : { spec }),
  });
  return vueRenderToString(app);
}
