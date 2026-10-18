import { createSSRApp, h } from "vue";
import { renderToString as vueRenderToString } from "vue/server-renderer";
import type { ChartSpec } from "@chartkitdev/core";
import { render as renderExtra } from "@chartkitdev/core/extra";
import { Chart } from "./Chart";

/**
 * Vue SSR HTML for a spec. Extra charts, including gantt through journey, are imported
 * here statically so the SVG is in the first response. The client entry loads them on demand.
 */
export function renderToString(spec: ChartSpec, render?: (spec: ChartSpec) => string): Promise<string> {
  const app = createSSRApp({
    name: "ChartKitSsr",
    render: () => h(Chart, { spec, render: render ?? renderExtra }),
  });
  return vueRenderToString(app);
}
