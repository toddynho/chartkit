import { fromChartJs } from "./chartjs";
import { coverage as coverageTable } from "./coverage";
import { fromECharts } from "./echarts";
import { parseLiteral } from "./literal";
import { isRecord, warn, type ConvertResult, type Source } from "./model";
import { fromRecharts } from "./recharts";

export { coverageTable as coverage };
export { samples } from "./samples";
export type { ConvertResult, ConvertWarning, Source } from "./model";

export { fromChartJs, fromECharts, fromRecharts };
export { parseJsx, parseLiteral } from "./literal";
export type { JsxNode, JsxParse, ParseResult } from "./literal";

const RECHARTS = /<(?:LineChart|AreaChart|BarChart|PieChart|ScatterChart|ComposedChart|RadialBarChart)\b/;

/** Chart.js config, Recharts JSX or props, or an ECharts option. Source is detected when omitted. */
export function convert(input: unknown, source?: Source): ConvertResult {
  const detected = source ?? detect(input);
  if (detected === "recharts") return fromRecharts(input);
  if (detected === "echarts") return fromECharts(input);
  if (detected === "chartjs") return fromChartJs(input);
  return {
    source: null,
    spec: null,
    warnings: [warn("CK8103", "Could not tell Chart.js, Recharts, and ECharts apart.", "")],
    mapped: [],
  };
}

export function detect(input: unknown): Source | null {
  if (typeof input === "string") {
    if (RECHARTS.test(input)) return "recharts";
    const parsed = parseLiteral(input);
    if (parsed.value === undefined) return null;
    return detect(parsed.value);
  }
  if (!isRecord(input)) return null;
  if (typeof input.chart === "string" && RECHARTS.test(`<${input.chart}`)) return "recharts";
  if (Array.isArray(input.series) && (input.xAxis != null || input.yAxis != null || input.legend != null)) return "echarts";
  const root = isRecord(input.config) ? input.config : input;
  if (isRecord(root) && isRecord(root.data) && Array.isArray(root.data.datasets)) return "chartjs";
  if (isRecord(root) && typeof root.type === "string" && isRecord(root.data)) return "chartjs";
  return null;
}
