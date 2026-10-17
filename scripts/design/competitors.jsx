import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import * as echarts from "echarts";
import Chart from "chart.js/auto";
import { donut, rows } from "./sample.mjs";

const W = 250;
const H = 188;

const tremorBlue = "#3b82f6";

function frame(node, child) {
  flushSync(() => {
    createRoot(node).render(child);
  });
}

function axes(extra) {
  return [
    <CartesianGrid key="g" strokeDasharray="3 3" />,
    <XAxis key="x" dataKey="month" {...extra} />,
    <YAxis key="y" {...extra} />,
    <Legend key="l" />,
  ];
}

function mountRecharts(prefix) {
  const common = { width: W, height: H, data: rows };
  frame(
    document.getElementById(prefix + "-line"),
    <LineChart {...common}>
      {axes()}
      <Line dataKey="Starter" isAnimationActive={false} />
      <Line dataKey="Pro" isAnimationActive={false} />
      <Line dataKey="Enterprise" isAnimationActive={false} />
    </LineChart>,
  );
  frame(
    document.getElementById(prefix + "-bar"),
    <BarChart {...common}>
      {axes()}
      <Bar dataKey="Starter" isAnimationActive={false} />
      <Bar dataKey="Pro" isAnimationActive={false} />
      <Bar dataKey="Enterprise" isAnimationActive={false} />
    </BarChart>,
  );
  frame(
    document.getElementById(prefix + "-donut"),
    <PieChart width={W} height={H}>
      <Pie data={donut} dataKey="revenue" nameKey="plan" innerRadius={42} outerRadius={68} isAnimationActive={false} />
      <Legend />
    </PieChart>,
  );
  frame(
    document.getElementById(prefix + "-area"),
    <AreaChart {...common}>
      {axes()}
      <Area dataKey="Starter" isAnimationActive={false} />
      <Area dataKey="Pro" isAnimationActive={false} />
      <Area dataKey="Enterprise" isAnimationActive={false} />
    </AreaChart>,
  );
}

function tremorAxes() {
  const tick = { fill: "#6b7280", fontSize: 12 };
  return [
    <CartesianGrid key="g" stroke="#e5e7eb" vertical={false} />,
    <XAxis key="x" dataKey="month" tick={tick} axisLine={false} tickLine={false} />,
    <YAxis key="y" tick={tick} axisLine={false} tickLine={false} />,
    <Legend key="l" />,
  ];
}

function mountTremor() {
  const common = { width: W, height: H, data: rows };
  frame(
    document.getElementById("tremor-line"),
    <LineChart {...common}>
      {tremorAxes()}
      <Line dataKey="Starter" stroke={tremorBlue} dot={false} strokeWidth={2} isAnimationActive={false} />
      <Line dataKey="Pro" stroke={tremorBlue} dot={false} strokeWidth={2} isAnimationActive={false} />
      <Line dataKey="Enterprise" stroke={tremorBlue} dot={false} strokeWidth={2} isAnimationActive={false} />
    </LineChart>,
  );
  frame(
    document.getElementById("tremor-bar"),
    <BarChart {...common}>
      {tremorAxes()}
      <Bar dataKey="Starter" fill={tremorBlue} radius={[4, 4, 0, 0]} isAnimationActive={false} />
      <Bar dataKey="Pro" fill={tremorBlue} radius={[4, 4, 0, 0]} isAnimationActive={false} />
      <Bar dataKey="Enterprise" fill={tremorBlue} radius={[4, 4, 0, 0]} isAnimationActive={false} />
    </BarChart>,
  );
  frame(
    document.getElementById("tremor-donut"),
    <PieChart width={W} height={H}>
      <Pie data={donut} dataKey="revenue" nameKey="plan" innerRadius={42} outerRadius={68} isAnimationActive={false}>
        {donut.map((row) => (
          <Cell key={row.plan} fill={tremorBlue} />
        ))}
      </Pie>
      <Legend />
    </PieChart>,
  );
  frame(
    document.getElementById("tremor-area"),
    <AreaChart {...common}>
      {tremorAxes()}
      <Area dataKey="Starter" stroke={tremorBlue} fill={tremorBlue} fillOpacity={0.2} isAnimationActive={false} />
      <Area dataKey="Pro" stroke={tremorBlue} fill={tremorBlue} fillOpacity={0.2} isAnimationActive={false} />
      <Area dataKey="Enterprise" stroke={tremorBlue} fill={tremorBlue} fillOpacity={0.2} isAnimationActive={false} />
    </AreaChart>,
  );
}

function mountEcharts() {
  const months = rows.map((row) => row.month);
  const seriesOf = (type, stack) =>
    ["Starter", "Pro", "Enterprise"].map((name) => ({
      name,
      type,
      stack,
      data: rows.map((row) => row[name]),
      ...(type === "line" ? { showSymbol: true } : {}),
    }));
  const base = {
    animation: false,
    legend: { bottom: 0 },
    grid: { left: 36, right: 12, top: 16, bottom: 36 },
    xAxis: { type: "category", data: months },
    yAxis: { type: "value" },
  };
  const draw = (id, option) => {
    const node = document.getElementById(id);
    const chart = echarts.init(node, null, { renderer: "svg", width: W, height: H });
    chart.setOption(option);
  };
  draw("echarts-line", { ...base, series: seriesOf("line") });
  draw("echarts-bar", { ...base, series: seriesOf("bar") });
  draw("echarts-donut", {
    animation: false,
    legend: { bottom: 0 },
    series: [
      {
        type: "pie",
        radius: ["42%", "68%"],
        data: donut.map((row) => ({ name: row.plan, value: row.revenue })),
      },
    ],
  });
  draw("echarts-area", { ...base, series: seriesOf("line").map((item) => ({ ...item, areaStyle: {} })) });
}

function mountChartjs() {
  const labels = rows.map((row) => row.month);
  const sets = (fill) =>
    ["Starter", "Pro", "Enterprise"].map((name) => ({
      label: name,
      data: rows.map((row) => row[name]),
      fill,
    }));
  const draw = (id, type, data, extra = {}) => {
    const canvas = document.getElementById(id);
    return new Chart(canvas, {
      type,
      data,
      options: {
        animation: false,
        responsive: false,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 10 } } },
        ...extra,
      },
    });
  };
  draw("chartjs-line", "line", { labels, datasets: sets(false) });
  draw("chartjs-bar", "bar", { labels, datasets: sets(true) });
  draw("chartjs-donut", "doughnut", {
    labels: donut.map((row) => row.plan),
    datasets: [{ data: donut.map((row) => row.revenue) }],
  });
  draw("chartjs-area", "line", { labels, datasets: sets(true) });
}

mountRecharts("recharts");
mountTremor();
mountEcharts();
mountChartjs();
