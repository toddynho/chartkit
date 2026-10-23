import { describe, expect, it } from "vitest";
import { convert, coverage, fromChartJs, fromECharts, fromRecharts } from "../index";
import { chartJsSample, echartsSample, rechartsSample } from "../samples";

function codes(result: { warnings: { code: string; path: string; message: string }[] }): string[] {
  return result.warnings.map((item) => item.code);
}

describe("Chart.js", () => {
  it("converts a grouped bar, a stacked bar, and a horizontal bar", () => {
    const grouped = fromChartJs({
      type: "bar",
      data: {
        labels: ["Mon", "Tue"],
        datasets: [
          { label: "Desk", data: [12, 18], backgroundColor: "#3366cc" },
          { label: "Field", data: [7, 9], backgroundColor: "#88aadd" },
        ],
      },
      options: { plugins: { legend: { position: "bottom" } }, scales: { y: { beginAtZero: true, title: { text: "Count" } } } },
    });
    expect(grouped.spec?.type).toBe("bar");
    expect(grouped.spec?.mark).not.toMatchObject({ stack: "stack" });
    expect(codes(grouped)).not.toContain("CK8105");

    const stacked = fromChartJs({
      type: "bar",
      data: {
        labels: ["A", "B"],
        datasets: [
          { label: "One", data: [2, 3] },
          { label: "Two", data: [4, 1] },
        ],
      },
      options: { scales: { x: { stacked: true }, y: { stacked: true } } },
    });
    expect(stacked.spec?.mark).toMatchObject({ stack: "stack" });

    const horizontal = fromChartJs({
      type: "bar",
      data: { labels: ["A"], datasets: [{ label: "One", data: [2] }] },
      options: { indexAxis: "y" },
    });
    expect(horizontal.spec?.mark).toMatchObject({ orientation: "horizontal" });
  });

  it("converts line, area, pie, doughnut, scatter, bubble, and combo", () => {
    const line = fromChartJs({
      type: "line",
      data: { labels: ["Q1", "Q2"], datasets: [{ label: "Units", data: [40, 55], tension: 0.4, borderColor: "#224" }] },
      options: { plugins: { title: { text: "Units" } } },
    });
    expect(line.spec?.type).toBe("line");
    expect(line.spec?.title).toBe("Units");
    expect(line.spec?.mark).toMatchObject({ curve: "monotone" });

    const area = fromChartJs({
      type: "line",
      data: {
        labels: ["Q1", "Q2"],
        datasets: [
          { label: "A", data: [2, 3], fill: true },
          { label: "B", data: [1, 4], fill: true },
        ],
      },
      options: { scales: { y: { stacked: true } } },
    });
    expect(area.spec?.type).toBe("stacked-area");

    const pie = fromChartJs({
      type: "pie",
      data: { labels: ["Oak", "Pine"], datasets: [{ data: [8, 5], backgroundColor: ["#864", "#a82"] }] },
    });
    expect(pie.spec?.type).toBe("pie");

    const donut = fromChartJs({
      type: "doughnut",
      data: { labels: ["Oak", "Pine"], datasets: [{ data: [8, 5], cutout: "60%" }] },
    });
    expect(donut.spec?.type).toBe("donut");
    expect(donut.spec?.mark).toMatchObject({ innerRadius: 0.6 });

    const scatter = fromChartJs({
      type: "scatter",
      data: { datasets: [{ label: "Batch", data: [{ x: 1, y: 2 }, { x: 2, y: 3 }] }] },
    });
    expect(scatter.spec?.type).toBe("scatter");

    const bubble = fromChartJs({
      type: "bubble",
      data: { datasets: [{ label: "Batch", data: [{ x: 1, y: 2, r: 8 }] }] },
    });
    expect(bubble.spec?.encoding).toMatchObject({ size: "size" });

    const combo = fromChartJs({
      type: "bar",
      data: {
        labels: ["W1", "W2"],
        datasets: [
          { type: "bar", label: "Orders", data: [30, 36] },
          { type: "line", label: "Rate", data: [0.4, 0.55], yAxisID: "y2" },
        ],
      },
    });
    expect(combo.spec?.type).toBe("combo");
    expect(JSON.stringify(combo.spec?.encoding)).toContain('"axis":"y2"');
  });

  it("warns for radar, annotation, and a tooltip callback instead of dropping them", () => {
    const radar = fromChartJs({ type: "radar", data: { labels: ["A"], datasets: [{ data: [1] }] } });
    expect(radar.spec).toBeNull();
    expect(codes(radar)).toContain("CK8101");

    const result = convert(chartJsSample);
    expect(result.source).toBe("chartjs");
    expect(result.spec?.type).toBe("bar");
    expect(result.warnings.some((item) => item.path.includes("annotation"))).toBe(true);
    expect(result.warnings.some((item) => item.code === "CK8105")).toBe(false);

    const callback = fromChartJs({
      type: "line",
      data: { labels: ["A"], datasets: [{ label: "N", data: [1] }] },
      options: { plugins: { tooltip: { callbacks: { label: (item: unknown) => item } } } },
    });
    expect(callback.spec?.type).toBe("line");
    expect(callback.warnings.some((item) => item.code === "CK8100" || item.code === "CK8102")).toBe(true);
  });
});

describe("Recharts", () => {
  it("converts the composed sample and a pie with a hole", () => {
    const result = fromRecharts(rechartsSample);
    expect(result.spec?.type).toBe("combo");
    expect(result.spec?.mark).not.toMatchObject({ stack: "stack" });
    expect(codes(result)).toContain("CK8104");
    expect(JSON.stringify(result.spec?.encoding)).toContain('"mark":"bar"');
    expect(result.spec?.annotations).toEqual([expect.objectContaining({ type: "rule", value: 60 })]);
    expect(codes(result)).not.toContain("CK8105");

    const pie = fromRecharts(`<PieChart width={200} height={200}>
      <Pie data={[{ name: 'Oak', value: 8 }, { name: 'Pine', value: 5 }]} dataKey="value" nameKey="name" innerRadius={60} />
      <Tooltip />
    </PieChart>`);
    expect(pie.spec?.type).toBe("donut");
  });

  it("warns for RadialBarChart and a spread", () => {
    const radial = fromRecharts(`<RadialBarChart width={200} height={200}><RadialBar dataKey="v" /></RadialBarChart>`);
    expect(radial.spec).toBeNull();
    expect(codes(radial)).toContain("CK8101");

    const spread = fromRecharts(`const extra = { stroke: '#111' };
      <LineChart data={[{ m: 'Jan', v: 1 }]}><Line dataKey="v" {...extra} /></LineChart>`);
    expect(spread.spec?.type).toBe("line");
    expect(spread.warnings.some((item) => item.code === "CK8102")).toBe(true);
  });
});

describe("ECharts", () => {
  it("converts the stacked area sample, a donut, and a bubble", () => {
    const area = fromECharts(echartsSample);
    expect(area.spec?.type).toBe("combo");
    expect(area.spec?.title).toBe("Requests by tier");
    expect(codes(area)).not.toContain("CK8105");
    expect(codes(area)).toContain("CK8104");
    expect(area.warnings.some((item) => item.path.endsWith("/color") || item.path.endsWith("/type"))).toBe(false);
    const channels = (area.spec?.encoding as { y: { field: string; color?: string }[] }).y;
    expect(channels.find((item) => item.field === "jobs")?.color).toBe("#c4554a");
    expect(channels.find((item) => item.field === "cap")?.color).toBe("#888");

    const donut = fromECharts({
      series: [{ type: "pie", radius: ["40%", "70%"], data: [{ name: "Oak", value: 8 }, { name: "Pine", value: 5 }] }],
    });
    expect(donut.spec?.type).toBe("donut");

    const bubble = fromECharts({
      xAxis: {},
      yAxis: {},
      series: [{ type: "scatter", symbolSize: 12, data: [[1, 2], [2, 4]] }],
    });
    expect(bubble.spec?.encoding).toMatchObject({ size: "size" });

    const heatmap = fromECharts({ series: [{ type: "heatmap", data: [[0, 0, 1]] }] });
    expect(heatmap.spec).toBeNull();
    expect(codes(heatmap)).toContain("CK8101");
  });

  it("maps a markLine and warns for dataZoom", () => {
    const marked = fromECharts({
      xAxis: { type: "category", data: ["A", "B"] },
      yAxis: {},
      series: [{ type: "bar", data: [1, 2], markLine: { data: [{ yAxis: 1.5, name: "Mid" }] } }],
      dataZoom: [{ type: "slider" }],
    });
    expect(marked.spec?.annotations).toEqual([expect.objectContaining({ type: "rule", value: 1.5, label: "Mid" })]);
    expect(marked.warnings.some((item) => item.path === "/dataZoom")).toBe(true);
  });
});

describe("coverage", () => {
  it("lists mapped and unsupported behaviour for every source", () => {
    for (const source of ["chartjs", "recharts", "echarts"] as const) {
      expect(coverage[source].mapped.length).toBeGreaterThan(5);
      expect(coverage[source].unsupported.length).toBeGreaterThan(2);
    }
  });
});
