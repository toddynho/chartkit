import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRenderer } from "../../packages/core/src/render.ts";
import { line } from "../../packages/core/src/charts/line.ts";
import { makeSeries } from "../lib/series.mjs";
import { timeSync } from "../lib/time.mjs";

const renderLine = createRenderer([line]);
const series = makeSeries(1000, 1);

function chartkitSpec() {
  return {
    version: "1",
    type: "line",
    data: { columns: { x: series.xs, y: series.ys } },
    encoding: { x: "x", y: "y" },
    mark: { curve: "linear", points: "none" },
    size: { width: 640, height: 360 },
    locale: "en-US",
    a11y: { alt: "One thousand indexed points." },
  };
}

export const probes = [
  {
    library: "ChartKit minimal",
    renderer: "svg",
    run() {
      const svg = renderLine(chartkitSpec());
      if (!svg.includes('data-ck-type="line"') || svg.includes("ck-chart-error")) {
        throw new Error("ChartKit did not return a line SVG");
      }
      return svg.length;
    },
  },
  {
    library: "uPlot",
    renderer: "canvas",
    async load() {
      const uPlot = (await import("uplot")).default;
      return () => {
        const el = globalThis.document?.createElement?.("div");
        if (!el) throw new Error("uPlot requires a DOM element. Node has no document.");
        return new uPlot({ width: 640, height: 360, series: [{}, { stroke: "red" }] }, [series.xs, series.ys], el);
      };
    },
  },
  {
    library: "Chart.js",
    renderer: "canvas",
    async load() {
      const { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } = await import("chart.js");
      Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);
      return () => {
        throw new Error("Chart.js renders to a canvas element. This probe does not load a DOM or node-canvas.");
      };
    },
  },
  {
    library: "Recharts",
    renderer: "svg",
    async load() {
      const { LineChart, Line, XAxis, YAxis } = await import("recharts");
      const data = Array.from(series.ys, (y, x) => ({ x, y }));
      return () => {
        const html = renderToStaticMarkup(
          createElement(LineChart, { width: 640, height: 360, data },
            createElement(XAxis, { dataKey: "x" }),
            createElement(YAxis),
            createElement(Line, { dataKey: "y", dot: false, isAnimationActive: false })),
        );
        if (!html.includes("<svg")) {
          throw new Error(`Recharts renderToStaticMarkup returned ${html.length} characters and no <svg>: ${html.slice(0, 220)}`);
        }
        return html.length;
      };
    },
  },
  {
    library: "ECharts",
    renderer: "svg",
    async load() {
      const echarts = await import("echarts/core");
      const { LineChart } = await import("echarts/charts");
      const { GridComponent } = await import("echarts/components");
      const { SVGRenderer } = await import("echarts/renderers");
      echarts.use([LineChart, GridComponent, SVGRenderer]);
      const data = Array.from(series.ys);
      return () => {
        const chart = echarts.init(null, null, { renderer: "svg", ssr: true, width: 640, height: 360 });
        chart.setOption({
          animation: false,
          xAxis: { type: "value" },
          yAxis: { type: "value" },
          series: [{ type: "line", showSymbol: false, data }],
        });
        const svg = chart.renderToSVGString();
        chart.dispose();
        if (!svg.includes("<svg")) throw new Error("ECharts SSR did not return an svg");
        return svg.length;
      };
    },
  },
  {
    library: "Nivo",
    renderer: "svg",
    async load() {
      const { Line } = await import("@nivo/line");
      const data = [{
        id: "y",
        data: Array.from(series.ys, (y, x) => ({ x, y })),
      }];
      return () => {
        const html = renderToStaticMarkup(createElement(Line, {
          width: 640,
          height: 360,
          data,
          enablePoints: false,
          animate: false,
          isInteractive: false,
        }));
        if (!html.includes("<svg")) throw new Error("Nivo SSR did not return an svg");
        return html.length;
      };
    },
  },
  {
    library: "Observable Plot",
    renderer: "svg",
    async load() {
      const Plot = await import("@observablehq/plot");
      const rows = Array.from(series.ys, (y, x) => ({ x, y }));
      return () => {
        const node = Plot.plot({
          width: 640,
          height: 360,
          marks: [Plot.line(rows, { x: "x", y: "y" })],
        });
        const html = node?.outerHTML ?? String(node);
        if (!html.includes("<svg")) throw new Error("Observable Plot did not return an svg");
        return html.length;
      };
    },
  },
];

export async function measureSsr() {
  const rows = [];
  for (const probe of probes) {
    try {
      const fn = probe.load ? await probe.load() : probe.run;
      const timing = timeSync(() => fn(), { warmup: 2, iterations: 8 });
      rows.push({
        library: probe.library,
        renderer: probe.renderer,
        status: "ok",
        points: 1000,
        ...timing,
        note: "Node, no jsdom and no node-canvas. 2 warmup calls, then 8 timed calls. The series is makeSeries(1000, 1).",
      });
    } catch (error) {
      rows.push({
        library: probe.library,
        renderer: probe.renderer,
        status: "unsupported",
        points: 1000,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return {
    method: "Same 1,000-point line (x[i] = i) for every library. Success means a chart was produced in Node without a DOM implementation. Timing is mean/median/min of 8 calls after 2 warmup calls.",
    rows,
  };
}
