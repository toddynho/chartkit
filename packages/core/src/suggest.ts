/** One-sentence alt text an agent can drop in when `a11y.alt` is missing. */
export function suggestAlt(spec: unknown): string {
  const root = isRecord(spec) ? spec : {};
  const type = typeof root.type === "string" ? root.type : "chart";
  const label = chartLabel(type);
  const title = typeof root.title === "string" ? root.title.trim() : "";
  const encoding = isRecord(root.encoding) ? root.encoding : undefined;
  const x = channelField(encoding?.x);
  const yFields = yFieldNames(encoding?.y);
  const metric = isRecord(root.metric) ? root.metric : undefined;
  const metricLabel = typeof metric?.label === "string" ? metric.label : "";
  const metricValue = typeof metric?.value === "number" ? String(metric.value) : "";

  let sentence: string;
  if (title && yFields.length > 0) {
    sentence = `${label} of ${yFields.join(", ")} — ${title}.`;
  } else if (yFields.length > 0 && x) {
    sentence = `${label} of ${yFields.join(", ")} by ${x}.`;
  } else if (yFields.length > 0) {
    sentence = `${label} of ${yFields.join(", ")}.`;
  } else if (metricLabel || metricValue) {
    const bits = [metricLabel, metricValue].filter(Boolean).join(" ");
    sentence = `${label} showing ${bits}.`;
  } else if (title) {
    sentence = `${label} titled ${title}.`;
  } else {
    sentence = `${label}. Add the key takeaway in one sentence.`;
  }

  sentence = sentence.replace(/\s+/g, " ").trim();
  if (sentence.length < 10) sentence = `${sentence} Overview.`;
  return sentence.slice(0, 500);
}

function chartLabel(type: string): string {
  const names: Record<string, string> = {
    line: "Line chart",
    bar: "Bar chart",
    donut: "Donut chart",
    "stacked-area": "Stacked area chart",
    scatter: "Scatter chart",
    combo: "Combo chart",
    heatmap: "Heatmap",
    gauge: "Gauge",
    kpi: "KPI",
    sparkline: "Sparkline",
    "mini-area": "Mini area chart",
    "progress-ring": "Progress ring",
    spike: "Spike chart",
    candlestick: "Candlestick chart",
    area: "Area chart",
    pie: "Pie chart",
  };
  return names[type] ?? `${type} chart`;
}

function yFieldNames(y: unknown): string[] {
  if (typeof y === "string") return [y];
  if (Array.isArray(y)) {
    return y.map(channelField).filter((name): name is string => Boolean(name));
  }
  const one = channelField(y);
  return one ? [one] : [];
}

function channelField(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (isRecord(value) && typeof value.field === "string" && value.field.length > 0) return value.field;
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
