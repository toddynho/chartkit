/** Fixed natural-language tasks. The runner sends `prompt` plus `data`. The checker uses `expect`. */

function task(id, type, prompt, data, expect) {
  return { id, type, prompt, data, expect: { type, ...expect } };
}

const rows = (pairs, x, y) => pairs.map(([a, b]) => ({ [x]: a, [y]: b }));

export const tasks = [
  task("line-revenue", "line", "Line chart of monthly revenue. It rose from January to February, then eased in March.", rows([["Jan", 120], ["Feb", 150], ["Mar", 132]], "month", "revenue"), { x: "month", y: "revenue", values: [120, 150, 132] }),
  task("line-users", "line", "Line chart of weekly active users for four weeks.", rows([["W1", 800], ["W2", 910], ["W3", 870], ["W4", 1020]], "week", "users"), { x: "week", y: "users", values: [800, 910, 870, 1020] }),
  task("line-temp", "line", "Line chart of daily high temperature in Celsius.", rows([["Mon", 18], ["Tue", 21], ["Wed", 19], ["Thu", 24]], "day", "celsius"), { x: "day", y: "celsius", values: [18, 21, 19, 24] }),

  task("bar-signups", "bar", "Bar chart of signups by month. February was the peak.", rows([["Jan", 100], ["Feb", 180], ["Mar", 150]], "month", "signups"), { x: "month", y: "signups", values: [100, 180, 150] }),
  task("bar-region", "bar", "Bar chart comparing sales by region.", rows([["North", 40], ["South", 55], ["East", 32], ["West", 48]], "region", "sales"), { x: "region", y: "sales", values: [40, 55, 32, 48] }),
  task("bar-priority", "bar", "Bar chart of open tickets by priority.", rows([["Low", 12], ["Medium", 27], ["High", 9]], "priority", "tickets"), { x: "priority", y: "tickets", values: [12, 27, 9] }),

  task("donut-traffic", "donut", "Donut chart of session share by source. Search is the largest slice.", [{ label: "Search", value: 42 }, { label: "Direct", value: 28 }, { label: "Social", value: 18 }, { label: "Email", value: 12 }], { x: "label", y: "value", values: [42, 28, 18, 12] }),
  task("donut-budget", "donut", "Donut chart of budget share by department.", [{ label: "Eng", value: 50 }, { label: "Sales", value: 30 }, { label: "Ops", value: 20 }], { x: "label", y: "value", values: [50, 30, 20] }),
  task("donut-survey", "donut", "Donut chart of survey answers.", [{ label: "Yes", value: 64 }, { label: "No", value: 22 }, { label: "Later", value: 14 }], { x: "label", y: "value", values: [64, 22, 14] }),

  task("stack-plans", "stacked-area", "Stacked area of subscribers by plan over three months.", [{ month: "Jan", free: 40, pro: 20 }, { month: "Feb", free: 42, pro: 28 }, { month: "Mar", free: 39, pro: 35 }], { x: "month", y: ["free", "pro"], values: [40, 20, 42, 28, 39, 35] }),
  task("stack-energy", "stacked-area", "Stacked area of energy mix in gigawatt hours.", [{ year: "2024", solar: 10, wind: 14, gas: 22 }, { year: "2025", solar: 16, wind: 15, gas: 18 }], { x: "year", y: ["solar", "wind", "gas"], values: [10, 14, 22, 16, 15, 18] }),
  task("stack-queue", "stacked-area", "Stacked area of queue items by state across a shift.", [{ hour: "9", open: 8, pending: 3 }, { hour: "10", open: 5, pending: 6 }, { hour: "11", open: 4, pending: 2 }], { x: "hour", y: ["open", "pending"], values: [8, 3, 5, 6, 4, 2] }),

  task("scatter-hw", "scatter", "Scatter plot of height in cm against weight in kg.", [{ height: 160, weight: 58 }, { height: 172, weight: 70 }, { height: 181, weight: 79 }], { x: "height", y: "weight", values: [160, 58, 172, 70, 181, 79] }),
  task("scatter-ads", "scatter", "Scatter plot of ad spend versus revenue, both in thousands.", [{ spend: 2, revenue: 8 }, { spend: 5, revenue: 14 }, { spend: 9, revenue: 21 }], { x: "spend", y: "revenue", values: [2, 8, 5, 14, 9, 21] }),
  task("scatter-latency", "scatter", "Scatter plot of payload size in KB versus latency in ms.", [{ kb: 4, ms: 20 }, { kb: 40, ms: 55 }, { kb: 120, ms: 140 }], { x: "kb", y: "ms", values: [4, 20, 40, 55, 120, 140] }),

  task("combo-margin", "combo", "Combo chart: revenue as bars and margin as a line on a second axis.", [{ month: "Jan", revenue: 100, margin: 0.2 }, { month: "Feb", revenue: 140, margin: 0.24 }, { month: "Mar", revenue: 130, margin: 0.22 }], { x: "month", y: ["revenue", "margin"], values: [100, 0.2, 140, 0.24, 130, 0.22] }),
  task("combo-orders", "combo", "Combo chart: order count as bars and conversion rate as a line.", [{ week: "W1", orders: 80, conversion: 0.03 }, { week: "W2", orders: 110, conversion: 0.04 }], { x: "week", y: ["orders", "conversion"], values: [80, 0.03, 110, 0.04] }),
  task("combo-weather", "combo", "Combo chart: rainfall as bars and temperature as a line.", [{ day: "Mon", rain: 2, temp: 18 }, { day: "Tue", rain: 8, temp: 16 }, { day: "Wed", rain: 0, temp: 22 }], { x: "day", y: ["rain", "temp"], values: [2, 18, 8, 16, 0, 22] }),

  task("heat-load", "heatmap", "Grid heatmap of load by hour and weekday.", [{ hour: "9", day: "Mon", load: 1 }, { hour: "10", day: "Mon", load: 5 }, { hour: "9", day: "Tue", load: 3 }], { x: "hour", y: "day", color: "load", values: [1, 5, 3] }),
  task("heat-commits", "heatmap", "Calendar heatmap of commits per day.", [{ date: "2026-01-01", commits: 1 }, { date: "2026-01-02", commits: 4 }, { date: "2026-01-03", commits: 2 }], { x: "date", color: "commits", values: [1, 4, 2] }),
  task("heat-sales", "heatmap", "Grid heatmap of sales by city and month.", [{ city: "Austin", month: "Jan", sales: 12 }, { city: "Austin", month: "Feb", sales: 18 }, { city: "Denver", month: "Jan", sales: 9 }], { x: "month", y: "city", color: "sales", values: [12, 18, 9] }),

  task("gauge-done", "gauge", "Gauge of project completion at 72 out of 100.", { value: 72, min: 0, max: 100 }, { metric: 72 }),
  task("gauge-cpu", "gauge", "Gauge of CPU usage at 41 percent.", { value: 41, min: 0, max: 100 }, { metric: 41 }),
  task("gauge-nps", "gauge", "Gauge of NPS score 62 on a 0 to 100 scale.", { value: 62, min: 0, max: 100 }, { metric: 62 }),

  task("kpi-revenue", "kpi", "KPI card for revenue of 125000 with a delta of 0.125 and no sparkline required.", { value: 125000, delta: 0.125, label: "Revenue" }, { metric: 125000, delta: 0.125 }),
  task("kpi-errors", "kpi", "KPI card for 14 open errors, delta -0.2.", { value: 14, delta: -0.2, label: "Errors" }, { metric: 14, delta: -0.2 }),
  task("kpi-uptime", "kpi", "KPI card for uptime 99.95 percent.", { value: 99.95, label: "Uptime" }, { metric: 99.95 }),

  task("spark-latency", "sparkline", "Sparkline of API latency samples.", [20, 22, 19, 30, 18], { values: [20, 22, 19, 30, 18] }),
  task("spark-sales", "sparkline", "Sparkline of daily sales counts.", [5, 8, 6, 11, 9], { values: [5, 8, 6, 11, 9] }),
  task("spark-queue", "sparkline", "Sparkline of queue depth.", [3, 3, 7, 4, 2], { values: [3, 3, 7, 4, 2] }),

  task("mini-balance", "mini-area", "Mini area chart of account balance.", [10, 12, 9, 14, 13], { values: [10, 12, 9, 14, 13] }),
  task("mini-cpu", "mini-area", "Mini area chart of CPU percent.", [20, 35, 28, 40], { values: [20, 35, 28, 40] }),
  task("mini-signups", "mini-area", "Mini area chart of hourly signups.", [1, 4, 2, 6, 5], { values: [1, 4, 2, 6, 5] }),

  task("ring-uptime", "progress-ring", "Progress ring for uptime of 99.2 percent.", { value: 99.2, min: 0, max: 100 }, { metric: 99.2 }),
  task("ring-storage", "progress-ring", "Progress ring showing storage 73 percent full.", { value: 73, min: 0, max: 100 }, { metric: 73 }),
  task("ring-tasks", "progress-ring", "Progress ring for 40 tasks done out of 50.", { value: 40, min: 0, max: 50 }, { metric: 40 }),

  task("spike-deploys", "spike", "Spike chart of deploys per hour.", [{ hour: "09", count: 1 }, { hour: "10", count: 4 }, { hour: "11", count: 0 }, { hour: "12", count: 2 }], { x: "hour", y: "count", values: [1, 4, 0, 2] }),
  task("spike-errors", "spike", "Spike chart of errors per minute.", [{ minute: "00", count: 0 }, { minute: "01", count: 3 }, { minute: "02", count: 1 }], { x: "minute", y: "count", values: [0, 3, 1] }),
  task("spike-alerts", "spike", "Spike chart of alerts per day.", [{ day: "Mon", count: 2 }, { day: "Tue", count: 0 }, { day: "Wed", count: 5 }], { x: "day", y: "count", values: [2, 0, 5] }),

  task("candle-up", "candlestick", "Candlestick chart for two rising sessions.", [{ date: "2026-01-02", open: 10, high: 12, low: 9, close: 11 }, { date: "2026-01-03", open: 11, high: 14, low: 11, close: 13 }], { x: "date", open: "open", high: "high", low: "low", close: "close", values: [10, 12, 9, 11, 11, 14, 13] }),
  task("candle-down", "candlestick", "Candlestick chart for a session that closed below the open.", [{ date: "2026-01-06", open: 20, high: 21, low: 16, close: 17 }], { x: "date", open: "open", high: "high", low: "low", close: "close", values: [20, 21, 16, 17] }),
  task("candle-flat", "candlestick", "Candlestick chart with a flat third session.", [{ date: "2026-02-01", open: 8, high: 9, low: 7, close: 9 }, { date: "2026-02-02", open: 9, high: 9, low: 8, close: 8 }, { date: "2026-02-03", open: 8, high: 8, low: 8, close: 8 }], { x: "date", open: "open", high: "high", low: "low", close: "close", values: [8, 9, 7, 9, 8, 8] }),
];

export const CHART_TYPES = [
  "line", "bar", "donut", "stacked-area", "scatter", "combo", "heatmap", "gauge", "kpi", "sparkline", "mini-area", "progress-ring", "spike", "candlestick",
];
