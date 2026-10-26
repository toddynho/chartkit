import {
  chart,
  disclaimer,
  isoDays,
  organic,
  rounds,
  sitBelow,
  spec,
  themesFor,
  type Dashboard,
  type DashTheme,
  type Ink,
} from "./dashboards.ts";

const quietY = { title: "", labels: false, grid: false };
const openY = { title: "", grid: true };
const money = { style: "compact", prefix: "$" };

export interface OverlayTarget {
  slug: string;
  kind: "line" | "bar";
  color: string;
  values: number[];
}

const targets: OverlayTarget[] = [];

function pair(light: Ink, dark: Ink, family = "Inter, sans-serif") {
  return themesFor(light, dark, undefined, false, family);
}

function bare(light: Ink, dark: Ink, family = "Inter, sans-serif") {
  return themesFor(light, dark, undefined, true, family);
}

function signal(): Dashboard {
  const mode: DashTheme = "midnight";
  const family = "Roboto, sans-serif";
  const light: Ink = {
    card: "#f4f5f5",
    ink: "#1f2328",
    muted: "#6e7681",
    grid: "#e6e8ea",
    axis: "#c6ccd2",
    accent: "#37872d",
    positive: "#37872d",
    negative: "#e02f44",
    series: ["#37872d", "#f2cc0c", "#5794f2", "#ff9830"],
  };
  const dark: Ink = {
    card: "#181b1f",
    ink: "#d8d9da",
    muted: "#8e8e8e",
    grid: "#2c3235",
    axis: "#444c52",
    accent: "#73bf69",
    positive: "#73bf69",
    negative: "#f2495c",
    series: ["#73bf69", "#f2cc0c", "#8ab8ff", "#ff9830"],
  };
  const themes = pair(light, dark, family);
  const kpis = bare(light, dark, family);
  const days = isoDays("2025-10-01", 24);
  const requests = rounds(organic(24, { seed: 21, start: 820, end: 1460, season: 180, noise: 90, phase: 0.2, spike: { at: 16, height: 420 } }), 1);
  const prior = sitBelow(requests, rounds(organic(24, { seed: 22, start: 700, end: 1100, season: 120, noise: 70, phase: 1.7 }), 1));
  targets.push({ slug: "signal", kind: "line", color: "#73bf69", values: requests });
  const errors = rounds(organic(24, { seed: 23, start: 12, end: 8, season: 3, noise: 2, phase: 0.8 }), 1);
  const p50 = rounds(organic(24, { seed: 24, start: 42, end: 38, season: 6, noise: 3, phase: 0.4 }), 1);
  const p95 = p50.map((value, index) => value + 28 + (index % 5));
  return {
    slug: "signal",
    product: "Datadog and Grafana",
    title: "Datadog-style monitors",
    lede: "Request rate, errors, and latency for 1–24 October. The figures are fictional.",
    disclaimer: "Styled after Datadog and Grafana dashboards to show ChartKit's styling flexibility. Not affiliated with or endorsed by Datadog or Grafana.",
    range: "1–24 Oct",
    defaultTheme: mode,
    charts: [
      chart({
        id: "signal-req",
        title: "Requests",
        caption: "Requests per minute.",
        note: "type kpi. The spark is the request series. surface and grid are transparent.",
        span: "dash-4",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: requests, metric: { label: "Requests", value: 1284, delta: 0.18, format: { style: "compact", suffix: "/m" } }, mark: { fillOpacity: 0.2, strokeWidth: 1.5 }, size: { width: 280, height: 96 } }, "Requests are 1,284 per minute, up 18 percent."),
      }),
      chart({
        id: "signal-err",
        title: "Errors",
        caption: "Error count.",
        note: "type kpi. goodDirection down, so a falling error count is the positive tone.",
        span: "dash-4",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: errors, metric: { label: "Errors", value: 8, delta: -0.22, format: "compact", goodDirection: "down" }, mark: { fillOpacity: 0.2, strokeWidth: 1.5 }, size: { width: 280, height: 96 } }, "Errors are 8, down 22 percent."),
      }),
      chart({
        id: "signal-p95",
        title: "p95",
        caption: "Tail latency.",
        note: "type kpi. The value is milliseconds.",
        span: "dash-4",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: p95, metric: { label: "p95", value: 86, delta: 0.04, format: { style: "number", suffix: " ms" } }, mark: { fillOpacity: 0.2, strokeWidth: 1.5 }, size: { width: 280, height: 96 } }, "p95 latency is 86 milliseconds, up 4 percent."),
      }),
      chart({
        id: "signal-sat",
        title: "Saturation",
        caption: "CPU saturation.",
        note: "type gauge. min 0, max 100, target 70.",
        span: "dash-4",
        place: "metric",
        themes: kpis,
        spec: spec("gauge", kpis, mode, { metric: { label: "Saturation", value: 64, min: 0, max: 100, target: 70, format: { style: "number", suffix: "%" } }, size: { width: 280, height: 120 } }, "Saturation is 64 percent, under a target of 70."),
      }),
      chart({
        id: "signal-rate",
        title: "Request rate",
        caption: "This period against the previous one.",
        note: "type combo. The current series is a solid green line. The prior series is dashed. legend.show is false. axes.y.title is empty. fontFamily is Roboto.",
        span: "dash-8",
        place: "hero",
        themes,
        spec: spec(
          "combo",
          themes,
          mode,
          {
            data: days.map((date, index) => ({ date, requests: requests[index], prior: prior[index] })),
            encoding: { x: { field: "date", type: "temporal" }, y: [{ field: "requests", mark: "line" }, { field: "prior", mark: "line", dash: "dashed" }] },
            axes: { x: { grid: false, ticks: "ends" }, y: openY },
            legend: { show: false },
            mark: { strokeWidth: 2, curve: "linear", points: "none", fillOpacity: 0, gradient: false },
            size: { width: 720, height: 280 },
          },
          "Request rate rises across October and spikes on the 17th.",
        ),
      }),
      chart({
        id: "signal-errors",
        title: "Error rate",
        caption: "Errors per minute.",
        note: "type line. The series token is the negative colour.",
        span: "dash-4",
        place: "side",
        themes: themesFor(light, dark, { soft: [light.negative], midnight: [dark.negative] }, false, family),
        spec: spec(
          "line",
          themesFor(light, dark, { soft: [light.negative], midnight: [dark.negative] }, false, family),
          mode,
          {
            data: days.map((date, index) => ({ date, errors: errors[index] })),
            encoding: { x: { field: "date", type: "temporal" }, y: { field: "errors" } },
            axes: { x: { grid: false, ticks: 4 }, y: openY },
            legend: { show: false },
            mark: { strokeWidth: 1.75, curve: "linear", points: "none" },
            size: { width: 360, height: 280 },
          },
          "Errors drift down from 12 to 8 across the period.",
        ),
      }),
      chart({
        id: "signal-latency",
        title: "Latency",
        caption: "p50 and p95.",
        note: "type line. Two series, p50 and p95. No gradient.",
        span: "dash-6",
        place: "side",
        themes,
        spec: spec(
          "line",
          themes,
          mode,
          {
            data: days.map((date, index) => ({ date, p50: p50[index], p95: p95[index] })),
            encoding: { x: { field: "date", type: "temporal" }, y: [{ field: "p50", title: "p50" }, { field: "p95", title: "p95" }] },
            axes: { x: { grid: false, ticks: "ends" }, y: openY },
            legend: { show: true },
            mark: { strokeWidth: 1.75, curve: "linear", points: "none" },
            size: { width: 520, height: 220 },
          },
          "p95 stays above p50. Both are in milliseconds.",
        ),
      }),
      chart({
        id: "signal-services",
        title: "Services",
        caption: "Requests by service.",
        note: "type bar-list, mark.track row. The wash is series[0].",
        span: "dash-6",
        place: "list",
        themes,
        spec: spec(
          "bar-list",
          themes,
          mode,
          {
            data: [
              { service: "edge", requests: 48200 },
              { service: "api", requests: 36100 },
              { service: "worker", requests: 21400 },
              { service: "auth", requests: 9800 },
            ],
            encoding: { x: "service", y: { field: "requests", format: "compact" } },
            mark: { track: "row" },
            size: { width: 520, height: 140 },
          },
          "Edge serves the most requests, then api, worker, and auth.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "Panels", detail: "A dark panel grid: four scorecards, a request-rate line with a dashed prior period, an error line in the negative token, p50 and p95, and a service list. fontFamily is Roboto, which Grafana uses. Datadog's own face is not shipped." },
      { label: "Palette", detail: "Midnight tokens: green #73bf69, yellow #f2cc0c, blue #8ab8ff, orange #ff9830, card #181b1f, grid #2c3235. The page background is #111217. Marks come from theme.tokens, not from page CSS." },
      { label: "Data", detail: "Every series is generated. No customer names, hosts, or live metrics." },
    ],
  };
}

function folio(): Dashboard {
  const mode: DashTheme = "soft";
  const light: Ink = {
    card: "#ffffff",
    ink: "#111111",
    muted: "#6b6b6b",
    grid: "#ececec",
    axis: "#d0d0d0",
    accent: "#00c805",
    positive: "#00c805",
    negative: "#ff5000",
    series: ["#00c805", "#111111"],
  };
  const dark: Ink = {
    card: "#1c1c1e",
    ink: "#f5f5f7",
    muted: "#a1a1a6",
    grid: "#2c2c2e",
    axis: "#3a3a3c",
    accent: "#30d158",
    positive: "#30d158",
    negative: "#ff6b2c",
    series: ["#30d158", "#f5f5f7"],
  };
  const themes = pair(light, dark);
  const kpis = bare(light, dark);
  const days = isoDays("2025-09-15", 20);
  const close = rounds(organic(20, { seed: 31, start: 128, end: 156, season: 4, noise: 2.2, phase: 0.3, spike: { at: 11, height: 8 } }), 0.01);
  targets.push({ slug: "folio", kind: "line", color: "#00c805", values: close });
  const volume = rounds(organic(20, { seed: 32, start: 40, end: 70, season: 12, noise: 8, phase: 1.1 }), 1);
  const candles = close.map((price, index) => {
    const open = index === 0 ? price - 1.2 : close[index - 1] ?? price;
    const high = Math.max(open, price) + 1.4;
    const low = Math.min(open, price) - 1.1;
    return {
      date: days[index],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: price,
      volume: volume[index],
    };
  });
  return {
    slug: "folio",
    product: "Robinhood and Coinbase",
    title: "Robinhood-style portfolio",
    lede: "A fictional holding for 15 September–4 October.",
    disclaimer: "Styled after Robinhood and Coinbase to show ChartKit's styling flexibility. Not affiliated with or endorsed by Robinhood or Coinbase.",
    range: "15 Sep–4 Oct",
    defaultTheme: mode,
    charts: [
      chart({
        id: "folio-price",
        title: "Price",
        caption: "Daily open, high, low, and close.",
        note: "type candlestick. Rising sessions use the positive token. Falling sessions use the negative token. encoding.volume draws the bars under the candles. headline draws the last close.",
        span: "dash-12",
        place: "hero",
        themes,
        spec: spec(
          "candlestick",
          themes,
          mode,
          {
            data: candles,
            encoding: { x: { field: "date", type: "temporal" }, open: "open", high: "high", low: "low", close: "close", volume: "volume" },
            axes: { x: { grid: false, ticks: "ends" }, y: openY },
            legend: { show: false },
            headline: { label: "Last close", value: "$156", compare: "$128", delta: "+22%", tone: "positive" },
            size: { width: 980, height: 400 },
          },
          "The close rises from 128 to 156 across the twenty sessions. Volume sits under the candles.",
        ),
      }),
      chart({
        id: "folio-value",
        title: "Value",
        caption: "Portfolio value.",
        note: "type kpi.",
        span: "dash-3",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: close, metric: { label: "Value", value: 18420, delta: 0.06, format: money }, mark: { fillOpacity: 0.16, strokeWidth: 1.5 }, size: { width: 320, height: 96 } }, "Portfolio value is 18.4 thousand dollars, up 6 percent."),
      }),
      chart({
        id: "folio-cash",
        title: "Cash",
        caption: "Cash balance.",
        note: "type kpi.",
        span: "dash-3",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: [4200, 4100, 4300, 4000, 3900, 4050], metric: { label: "Cash", value: 4050, delta: -0.02, format: money }, mark: { fillOpacity: 0.16, strokeWidth: 1.5 }, size: { width: 320, height: 96 } }, "Cash is 4,050 dollars, down 2 percent."),
      }),
      chart({
        id: "folio-day",
        title: "Today",
        caption: "Day change.",
        note: "type kpi. The delta is the day change.",
        span: "dash-3",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: close.slice(-8), metric: { label: "Today", value: 2.4, delta: 0.016, format: { style: "number", prefix: "$", decimals: 2 } }, mark: { fillOpacity: 0.16, strokeWidth: 1.5 }, size: { width: 320, height: 96 } }, "Today is up 2.40 dollars, 1.6 percent."),
      }),
      chart({
        id: "folio-holdings",
        title: "Holdings",
        caption: "Share of the portfolio.",
        note: "type bar-list, mark.track row. Names are generic. The label and amount use the text token: near-black on Soft, white on Midnight.",
        span: "dash-12",
        place: "list",
        themes: themesFor({ ...light, ink: "#0a0a0a" }, { ...dark, ink: "#ffffff" }),
        spec: spec(
          "bar-list",
          themesFor({ ...light, ink: "#0a0a0a" }, { ...dark, ink: "#ffffff" }),
          mode,
          {
            data: [
              { name: "Broad fund", amount: 8200 },
              { name: "North index", amount: 5400 },
              { name: "Cash", amount: 4050 },
              { name: "Bond sleeve", amount: 770 },
            ],
            encoding: { x: "name", y: { field: "amount", format: money } },
            mark: { track: "row" },
            size: { width: 640, height: 148 },
          },
          "The broad fund is the largest holding, then the north index, cash, and a bond sleeve.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "Price", detail: "A candlestick uses positive #00c805 and negative #ff5000. headline shows the last close. encoding.volume paints the daily volume under the candles." },
      { label: "Type", detail: "fontFamily is Inter. The shell is white with black ink. Midnight swaps to #1c1c1e. No wordmark and no mark icon." },
      { label: "Data", detail: "The sessions and holdings are generated. They are not a market." },
    ],
  };
}

function cycle(): Dashboard {
  const mode: DashTheme = "soft";
  const light: Ink = {
    card: "#ffffff",
    ink: "#1b1b1f",
    muted: "#6b6f76",
    grid: "#ececee",
    axis: "#d5d5d8",
    accent: "#5e6ad2",
    positive: "#1f8a4c",
    negative: "#e5484d",
    series: ["#5e6ad2", "#9a9ea6"],
  };
  const dark: Ink = {
    card: "#1c1c21",
    ink: "#f2f2f4",
    muted: "#9a9ea6",
    grid: "#2a2a31",
    axis: "#3a3a44",
    accent: "#8b93e8",
    positive: "#4cc38a",
    negative: "#ff6369",
    series: ["#8b93e8", "#9a9ea6"],
  };
  const themes = pair(light, dark);
  const kpis = bare(light, dark);
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
  const cycleDays = rounds(organic(8, { seed: 41, start: 6.2, end: 3.4, season: 0.4, noise: 0.35, phase: 0.2 }), 0.1);
  const shipped = rounds(organic(8, { seed: 42, start: 18, end: 32, season: 3, noise: 2, phase: 1 }), 1);
  targets.push({ slug: "cycle", kind: "line", color: "#5e6ad2", values: cycleDays });
  return {
    slug: "cycle",
    product: "Linear",
    title: "Linear-style insights",
    lede: "Cycle time and throughput for eight fictional weeks.",
    disclaimer: disclaimer("Linear"),
    range: "8 weeks",
    defaultTheme: mode,
    charts: [
      chart({
        id: "cycle-time",
        title: "Cycle time",
        caption: "Median days.",
        note: "type kpi. goodDirection down.",
        span: "dash-3",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: cycleDays, metric: { label: "Cycle time", value: 3.4, delta: -0.19, format: { style: "number", decimals: 1, suffix: "d" }, goodDirection: "down" }, mark: { fillOpacity: 0.16, strokeWidth: 1.5 }, size: { width: 300, height: 96 } }, "Median cycle time is 3.4 days, down 19 percent."),
      }),
      chart({
        id: "cycle-ship",
        title: "Shipped",
        caption: "Issues shipped.",
        note: "type kpi.",
        span: "dash-3",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: shipped, metric: { label: "Shipped", value: 32, delta: 0.28, format: "compact" }, mark: { fillOpacity: 0.16, strokeWidth: 1.5 }, size: { width: 300, height: 96 } }, "32 issues shipped in the last week, up 28 percent."),
      }),
      chart({
        id: "cycle-open",
        title: "Open",
        caption: "Open issues.",
        note: "type kpi.",
        span: "dash-3",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: [40, 38, 36, 34, 33, 31, 30, 28], metric: { label: "Open", value: 28, delta: -0.12, format: "compact", goodDirection: "down" }, mark: { fillOpacity: 0.16, strokeWidth: 1.5 }, size: { width: 300, height: 96 } }, "28 issues are open, down 12 percent."),
      }),
      chart({
        id: "cycle-line",
        title: "Cycle time",
        caption: "Median days to ship.",
        note: "type line. One series in #5e6ad2. axes.y.title is empty.",
        span: "dash-8",
        place: "hero",
        themes,
        spec: spec(
          "line",
          themes,
          mode,
          {
            data: weeks.map((week, index) => ({ week, days: cycleDays[index] })),
            encoding: { x: "week", y: { field: "days" } },
            axes: { x: { grid: false }, y: openY },
            legend: { show: false },
            mark: { strokeWidth: 2, curve: "linear", points: "always" },
            size: { width: 720, height: 260 },
          },
          "Median cycle time falls from 6.2 days to 3.4 days.",
        ),
      }),
      chart({
        id: "cycle-state",
        title: "By state",
        caption: "Open issues by state.",
        note: "type donut. Four fictional states.",
        span: "dash-4",
        place: "side",
        themes: themesFor(light, dark, { soft: ["#5e6ad2", "#8b93e8", "#c4c8f0", "#e4e5ea"], midnight: ["#8b93e8", "#5e6ad2", "#3a3a44", "#9a9ea6"] }),
        spec: spec(
          "donut",
          themesFor(light, dark, { soft: ["#5e6ad2", "#8b93e8", "#c4c8f0", "#e4e5ea"], midnight: ["#8b93e8", "#5e6ad2", "#3a3a44", "#9a9ea6"] }),
          mode,
          {
            data: [
              { state: "Started", n: 11 },
              { state: "Unstarted", n: 9 },
              { state: "Review", n: 5 },
              { state: "Blocked", n: 3 },
            ],
            encoding: { x: "state", y: "n" },
            legend: { show: true },
            size: { width: 320, height: 260 },
          },
          "Started is the largest open state, then unstarted, review, and blocked.",
        ),
      }),
      chart({
        id: "cycle-bars",
        title: "Throughput",
        caption: "Issues shipped each week.",
        note: "type bar. One series. cornerRadius 3.",
        span: "dash-12",
        place: "side",
        themes,
        spec: spec(
          "bar",
          themes,
          mode,
          {
            data: weeks.map((week, index) => ({ week, shipped: shipped[index] })),
            encoding: { x: "week", y: { field: "shipped" } },
            axes: { x: { grid: false }, y: openY },
            legend: { show: false },
            mark: { gap: 0.35, cornerRadius: 3 },
            size: { width: 980, height: 200 },
          },
          "Weekly throughput rises from 18 to 32.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "Insights", detail: "Three scorecards, a cycle-time line, a state donut, and weekly throughput bars. The accent is #5e6ad2. fontFamily is Inter." },
      { label: "Shell", detail: "The page background is #f5f5f6 and cards are white with a 1px line. No project icons." },
      { label: "Data", detail: "Weeks and counts are generated." },
    ],
  };
}

function edge(): Dashboard {
  const mode: DashTheme = "soft";
  const light: Ink = {
    card: "#ffffff",
    ink: "#171717",
    muted: "#666666",
    grid: "#ebebeb",
    axis: "#d4d4d4",
    accent: "#171717",
    positive: "#0070f3",
    negative: "#e00",
    series: ["#171717", "#0070f3"],
  };
  const dark: Ink = {
    card: "#111111",
    ink: "#ededed",
    muted: "#a1a1a1",
    grid: "#2a2a2a",
    axis: "#3a3a3a",
    accent: "#ededed",
    positive: "#3291ff",
    negative: "#ff6166",
    series: ["#ededed", "#3291ff"],
  };
  const themes = pair(light, dark);
  const kpis = bare(light, dark);
  const days = isoDays("2025-09-20", 14);
  const visitors = rounds(organic(14, { seed: 51, start: 2400, end: 4100, season: 280, noise: 160, phase: 0.5 }), 1);
  targets.push({ slug: "edge", kind: "line", color: "#171717", values: visitors });
  return {
    slug: "edge",
    product: "Vercel",
    title: "Vercel-style analytics",
    lede: "Visitors for 20 September–3 October. The paths are fictional.",
    disclaimer: disclaimer("Vercel"),
    range: "14 days",
    defaultTheme: mode,
    charts: [
      chart({
        id: "edge-vis",
        title: "Visitors",
        caption: "Unique visitors.",
        note: "type kpi.",
        span: "dash-3",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: visitors, metric: { label: "Visitors", value: 4100, delta: 0.21, format: "compact" }, mark: { fillOpacity: 0.12, strokeWidth: 1.5 }, size: { width: 300, height: 96 } }, "Visitors are 4,100, up 21 percent."),
      }),
      chart({
        id: "edge-views",
        title: "Views",
        caption: "Page views.",
        note: "type kpi.",
        span: "dash-3",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: visitors.map((value) => Math.round(value * 2.4)), metric: { label: "Views", value: 9840, delta: 0.16, format: "compact" }, mark: { fillOpacity: 0.12, strokeWidth: 1.5 }, size: { width: 300, height: 96 } }, "Page views are 9,840, up 16 percent."),
      }),
      chart({
        id: "edge-bounce",
        title: "Bounce",
        caption: "Bounce rate.",
        note: "type kpi. goodDirection down.",
        span: "dash-3",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: [48, 46, 47, 44, 42, 41, 39], metric: { label: "Bounce", value: 39, delta: -0.08, format: { style: "number", suffix: "%" }, goodDirection: "down" }, mark: { fillOpacity: 0.12, strokeWidth: 1.5 }, size: { width: 300, height: 96 } }, "Bounce rate is 39 percent, down 8 percent."),
      }),
      chart({
        id: "edge-line",
        title: "Visitors",
        caption: "Daily visitors. The last segment is dashed.",
        note: "type area line. mark.partial dashes the last segment and mark.partialOpacity fades its fill. The series token is #171717.",
        span: "dash-8",
        place: "hero",
        themes,
        spec: spec(
          "line",
          themes,
          mode,
          {
            data: days.map((date, index) => ({ date, visitors: visitors[index] })),
            encoding: { x: { field: "date", type: "temporal" }, y: { field: "visitors" } },
            axes: { x: { grid: false, ticks: "ends" }, y: quietY },
            legend: { show: false },
            mark: { area: true, strokeWidth: 1.75, curve: "linear", points: "none", fillOpacity: 0.12, gradient: false, partial: "dashed", partialOpacity: 0.05 },
            size: { width: 720, height: 280 },
          },
          "Visitors rise across the fortnight. The last segment is dashed.",
        ),
      }),
      chart({
        id: "edge-device",
        title: "Devices",
        caption: "Visits by device.",
        note: "type donut.",
        span: "dash-4",
        place: "side",
        themes: themesFor(light, dark, { soft: ["#171717", "#0070f3", "#d4d4d4"], midnight: ["#ededed", "#3291ff", "#3a3a3a"] }),
        spec: spec(
          "donut",
          themesFor(light, dark, { soft: ["#171717", "#0070f3", "#d4d4d4"], midnight: ["#ededed", "#3291ff", "#3a3a3a"] }),
          mode,
          {
            data: [
              { device: "Desktop", n: 58 },
              { device: "Phone", n: 34 },
              { device: "Tablet", n: 8 },
            ],
            encoding: { x: "device", y: "n" },
            legend: { show: true },
            size: { width: 320, height: 280 },
          },
          "Desktop is 58 percent of visits, phone 34, tablet 8.",
        ),
      }),
      chart({
        id: "edge-paths",
        title: "Paths",
        caption: "Top paths.",
        note: "type bar-list, mark.track row.",
        span: "dash-12",
        place: "list",
        themes,
        spec: spec(
          "bar-list",
          themes,
          mode,
          {
            data: [
              { path: "/", visits: 4200 },
              { path: "/docs", visits: 2100 },
              { path: "/pricing", visits: 980 },
              { path: "/blog", visits: 640 },
            ],
            encoding: { x: "path", y: { field: "visits", format: "compact" } },
            mark: { track: "row" },
            size: { width: 980, height: 140 },
          },
          "The home path has the most visits, then docs, pricing, and blog.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "Visitors", detail: "A black area line on white. mark.partial dashes the last day. axes.y is hidden. fontFamily is Inter." },
      { label: "Lists", detail: "Paths are a bar-list with a row track. Devices are a donut. No favicon and no deployment mark." },
      { label: "Data", detail: "Paths and counts are fictional." },
    ],
  };
}

function pulse(): Dashboard {
  const mode: DashTheme = "soft";
  const light: Ink = {
    card: "#ffffff",
    ink: "#1d1d1f",
    muted: "#6e6e73",
    grid: "#e8e8ed",
    axis: "#d2d2d7",
    accent: "#ff375f",
    positive: "#30d158",
    negative: "#ff375f",
    series: ["#ff375f", "#30d158", "#0a84ff"],
  };
  const dark: Ink = {
    card: "#1c1c1e",
    ink: "#f5f5f7",
    muted: "#98989d",
    grid: "#2c2c2e",
    axis: "#3a3a3c",
    accent: "#ff375f",
    positive: "#30d158",
    negative: "#ff453a",
    series: ["#ff375f", "#30d158", "#0a84ff"],
  };
  const themes = pair(light, dark);
  const kpis = bare(light, dark);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const move = [420, 510, 380, 640, 590, 470, 530];
  const exercise = [22, 35, 18, 44, 40, 28, 32];
  const stand = [8, 10, 7, 12, 11, 9, 10];
  const heart = rounds(organic(24, { seed: 61, start: 62, end: 78, season: 8, noise: 4, phase: 0.6 }), 1);
  targets.push({ slug: "pulse", kind: "bar", color: "#ff375f", values: move });
  return {
    slug: "pulse",
    product: "Apple Fitness and Apple Health",
    title: "Fitness-style activity",
    lede: "A fictional week of activity and a day of heart rate.",
    disclaimer: "Styled after Apple Fitness and Apple Health to show ChartKit's styling flexibility. Not affiliated with or endorsed by Apple.",
    range: "This week",
    defaultTheme: mode,
    charts: [
      chart({
        id: "pulse-rings",
        title: "Activity",
        caption: "Move, exercise, and stand.",
        note: "type progress-ring. mark.rings draws three concentric rings: move #ff375f, exercise #30d158, stand #0a84ff. The first ring is the outside.",
        span: "dash-6",
        place: "metric",
        themes: themesFor(light, dark, { soft: ["#ff375f", "#30d158", "#0a84ff"], midnight: ["#ff375f", "#30d158", "#0a84ff"] }, true),
        spec: spec(
          "progress-ring",
          themesFor(light, dark, { soft: ["#ff375f", "#30d158", "#0a84ff"], midnight: ["#ff375f", "#30d158", "#0a84ff"] }, true),
          mode,
          {
            metric: { label: "Today", value: 530, min: 0, max: 600 },
            mark: {
              rings: [
                { value: 530, max: 600, color: "#ff375f", label: "Move" },
                { value: 32, max: 45, color: "#30d158", label: "Exercise" },
                { value: 10, max: 12, color: "#0a84ff", label: "Stand" },
              ],
            },
            size: { width: 460, height: 320 },
          },
          "Move is 530 of 600, exercise is 32 of 45 minutes, and stand is 10 of 12 hours.",
        ),
      }),
      chart({
        id: "pulse-week",
        title: "Week",
        caption: "Move, exercise, and stand by day.",
        note: "type bar. Exercise minutes and stand hours are grouped. Move stays on its ring so its larger unit does not flatten these two.",
        span: "dash-6",
        place: "side",
        themes,
        spec: spec(
          "bar",
          themes,
          mode,
          {
            data: days.map((day, index) => ({ day, exercise: exercise[index], stand: stand[index] })),
            encoding: { x: "day", y: [{ field: "exercise", title: "Exercise" }, { field: "stand", title: "Stand" }] },
            axes: { x: { grid: false }, y: openY },
            legend: { show: true },
            mark: { gap: 0.3, cornerRadius: 3 },
            size: { width: 520, height: 280 },
          },
          "Exercise minutes and stand hours across seven days.",
        ),
      }),
      chart({
        id: "pulse-heart",
        title: "Heart rate",
        caption: "Beats per minute across a day.",
        note: "type line. The series token is #ff375f.",
        span: "dash-4",
        place: "side",
        themes: themesFor(light, dark, { soft: ["#ff375f"], midnight: ["#ff375f"] }),
        spec: spec(
          "line",
          themesFor(light, dark, { soft: ["#ff375f"], midnight: ["#ff375f"] }),
          mode,
          {
            data: heart.map((bpm, index) => ({ hour: index, bpm })),
            encoding: { x: "hour", y: { field: "bpm" } },
            axes: { x: { grid: false, ticks: 4 }, y: openY },
            legend: { show: false },
            mark: { strokeWidth: 1.75, curve: "monotone", points: "none" },
            size: { width: 320, height: 240 },
          },
          "Heart rate varies through the day and peaks in the afternoon.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "Rings", detail: "One progress-ring. mark.rings draws move #ff375f, exercise #30d158, and stand #0a84ff. The first ring is the outside." },
      { label: "Week", detail: "Grouped bars for exercise minutes and stand hours. Move stays on its ring so the larger unit does not flatten the other two." },
      { label: "Type", detail: "fontFamily is Inter. The system face used by the reference products is not shipped. The page background is #f5f5f7." },
    ],
  };
}

function retain(): Dashboard {
  const mode: DashTheme = "soft";
  const light: Ink = {
    card: "#ffffff",
    ink: "#1a1a1a",
    muted: "#667085",
    grid: "#eef0f3",
    axis: "#d0d5dd",
    accent: "#1f8a70",
    positive: "#1f8a70",
    negative: "#d92d20",
    series: ["#1f8a70", "#7dcea0", "#f4b183", "#7856ff"],
  };
  const dark: Ink = {
    card: "#1b1e27",
    ink: "#f2f4f7",
    muted: "#98a2b3",
    grid: "#2a3142",
    axis: "#3a4258",
    accent: "#3dbea3",
    positive: "#3dbea3",
    negative: "#f97066",
    series: ["#3dbea3", "#7dcea0", "#f4b183", "#b9a6ff"],
  };
  const themes = pair(light, dark);
  const kpis = bare(light, dark);
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const added = [18, 22, 19, 26, 24, 28];
  const expansion = [4, 5, 6, 5, 7, 8];
  const contraction = [3, 2, 4, 3, 3, 2];
  const mrr = months.map((_, index) => 80 + added.slice(0, index + 1).reduce((sum, value) => sum + value, 0));
  targets.push({ slug: "retain", kind: "line", color: "#1f8a70", values: mrr });
  const cohorts = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const cells: { cohort: string; period: string; kept: number | null }[] = [];
  cohorts.forEach((cohort, row) => {
    for (let column = 0; column < 6; column++) {
      const period = `M${column}`;
      cells.push({ cohort, period, kept: column > 5 - row ? null : Math.max(20, 100 - column * 14 - row * 2) });
    }
  });
  return {
    slug: "retain",
    product: "ChartMogul and Mixpanel",
    title: "ChartMogul-style revenue",
    lede: "Fictional monthly recurring revenue, a cohort triangle, and a product funnel.",
    disclaimer: "Styled after ChartMogul and Mixpanel to show ChartKit's styling flexibility. Not affiliated with or endorsed by ChartMogul or Mixpanel.",
    range: "Apr–Sep",
    defaultTheme: mode,
    charts: [
      chart({
        id: "retain-mrr",
        title: "MRR",
        caption: "Monthly recurring revenue.",
        note: "type kpi. format compact with a dollar prefix. metric.thresholds colours the surface: red under 120 thousand, sand from there, teal from 180 thousand.",
        span: "dash-3",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: mrr, metric: { label: "MRR", value: 197000, delta: 0.11, format: money, thresholds: [{ value: 0, color: "#d92d20" }, { value: 120000, color: "#f4b183" }, { value: 180000, color: "#1f8a70" }] }, mark: { fillOpacity: 0.16, strokeWidth: 1.5 }, size: { width: 300, height: 96 } }, "MRR is 197 thousand dollars, up 11 percent."),
      }),
      chart({
        id: "retain-customers",
        title: "Customers",
        caption: "Paying customers.",
        note: "type kpi. metric.thresholds colours the surface teal from 450 customers.",
        span: "dash-3",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: [420, 438, 451, 470, 488, 510], metric: { label: "Customers", value: 510, delta: 0.05, format: "compact", thresholds: [{ value: 0, color: "#d92d20" }, { value: 300, color: "#f4b183" }, { value: 450, color: "#1f8a70" }] }, mark: { fillOpacity: 0.16, strokeWidth: 1.5 }, size: { width: 300, height: 96 } }, "510 customers, up 5 percent."),
      }),
      chart({
        id: "retain-churn",
        title: "Churn",
        caption: "Logo churn.",
        note: "type kpi. goodDirection down. metric.thresholds colours the surface teal under 3 percent, sand from 3, and red from 5.",
        span: "dash-3",
        place: "metric",
        themes: kpis,
        spec: spec("kpi", kpis, mode, { data: [3.4, 3.1, 2.9, 2.7, 2.6, 2.4], metric: { label: "Churn", value: 2.4, delta: -0.08, format: { style: "number", decimals: 1, suffix: "%" }, goodDirection: "down", thresholds: [{ value: 0, color: "#1f8a70" }, { value: 3, color: "#f4b183" }, { value: 5, color: "#d92d20" }] }, mark: { fillOpacity: 0.16, strokeWidth: 1.5 }, size: { width: 300, height: 96 } }, "Logo churn is 2.4 percent, down 8 percent."),
      }),
      chart({
        id: "retain-area",
        title: "MRR movement",
        caption: "New, expansion, and contraction.",
        note: "type stacked-area. Three series. New is #1f8a70.",
        span: "dash-8",
        place: "hero",
        themes,
        spec: spec(
          "stacked-area",
          themes,
          mode,
          {
            data: months.map((month, index) => ({ month, added: added[index], expansion: expansion[index], contraction: contraction[index] })),
            encoding: { x: "month", y: [{ field: "added", title: "New" }, { field: "expansion", title: "Expansion" }, { field: "contraction", title: "Contraction" }] },
            axes: { x: { grid: false }, y: openY },
            legend: { show: true },
            mark: { curve: "linear", fillOpacity: 0.85 },
            size: { width: 720, height: 280 },
          },
          "New revenue is the largest movement each month.",
        ),
      }),
      chart({
        id: "retain-funnel",
        title: "Funnel",
        caption: "From visit to paid.",
        note: "type funnel. The series token is #7856ff.",
        span: "dash-4",
        place: "side",
        themes: themesFor(light, dark, { soft: ["#7856ff"], midnight: ["#b9a6ff"] }),
        spec: spec(
          "funnel",
          themesFor(light, dark, { soft: ["#7856ff"], midnight: ["#b9a6ff"] }),
          mode,
          {
            data: [
              { stage: "Visit", n: 8200 },
              { stage: "Signup", n: 2100 },
              { stage: "Activate", n: 940 },
              { stage: "Paid", n: 280 },
            ],
            encoding: { x: "stage", y: { field: "n", format: "compact" } },
            size: { width: 320, height: 280 },
          },
          "8,200 visits, 2,100 signups, 940 activations, and 280 paid.",
        ),
      }),
      chart({
        id: "retain-cohort",
        title: "Cohort",
        caption: "Customers remaining by month.",
        note: "type heatmap. Later cohorts leave unfinished months null, so the grid is a triangle. color.range is a teal ramp.",
        span: "dash-12",
        place: "cohort",
        themes,
        spec: spec(
          "heatmap",
          themes,
          mode,
          {
            data: cells,
            encoding: { x: "period", y: "cohort", color: { field: "kept", title: "Remaining", range: ["#e6f4ef", "#7dcea0", "#1f8a70"] } },
            mark: { gap: 0.16, cornerRadius: 2 },
            size: { width: 980, height: 240 },
          },
          "Each cohort fades across later months. Unfinished months are empty.",
        ),
      }),
    ],
    sparks: [],
    notes: [
      { label: "Revenue", detail: "MRR movement is a stacked area in teal #1f8a70, a lighter green, and sand. Scorecards use compact dollars, a customer count, and percent churn. metric.thresholds paints each card from the value." },
      { label: "Product", detail: "The funnel uses #7856ff. The cohort heatmap is a triangle: later months are null. fontFamily is Inter." },
      { label: "Data", detail: "Months, customers, and stages are fictional." },
    ],
  };
}

export function round2(): Dashboard[] {
  targets.length = 0;
  return [signal(), folio(), cycle(), edge(), pulse(), retain()];
}

export function overlayTargets(): OverlayTarget[] {
  return targets;
}
