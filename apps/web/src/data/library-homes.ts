/**
 * Official homepage or docs for each library in the compare matrix.
 * Keys match `library.id` from the feature matrix. Not hardcoded in pages.
 */
export const libraryHomes = {
  chartjs: "https://www.chartjs.org",
  recharts: "https://recharts.github.io",
  echarts: "https://echarts.apache.org",
  highcharts: "https://www.highcharts.com",
  plotly: "https://plotly.com/javascript/",
  nivo: "https://nivo.rocks",
  victory: "https://nearform.com/open-source/victory/",
  visx: "https://visx.airbnb.tech/",
  apexcharts: "https://apexcharts.com",
  tremor: "https://npm.tremor.so",
  plot: "https://observablehq.com/plot/",
  vegalite: "https://vega.github.io/vega-lite/",
  agcharts: "https://www.ag-grid.com/charts/",
  amcharts: "https://www.amcharts.com",
  googlecharts: "https://developers.google.com/chart",
  uplot: "https://github.com/leeoniya/uPlot",
  lightweight: "https://tradingview.github.io/lightweight-charts/",
  muix: "https://mui.com/x/react-charts/",
  mermaid: "https://mermaid.js.org",
  g2: "https://g2.antv.antgroup.com",
} as const;

export function libraryHome(id: string): string {
  const href = libraryHomes[id as keyof typeof libraryHomes];
  if (!href) throw new Error(`No official homepage for compare library ${id}`);
  return href;
}
