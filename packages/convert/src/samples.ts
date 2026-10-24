/** Written for the converter tests and the /convert demo. Not copied from a product. */

export const chartJsSample = `const config = {
  type: 'bar',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      { label: 'Inbox', data: [14, 18, 12, 20, 16], backgroundColor: '#3b6fd8' },
      { label: 'Chat', data: [6, 9, 8, 7, 11], backgroundColor: '#8eadd4', stack: 'tickets' }
    ]
  },
  options: {
    plugins: {
      title: { display: true, text: 'Tickets opened' },
      legend: { position: 'bottom' },
      tooltip: { mode: 'index' },
      annotation: { annotations: { line1: { type: 'line', yMin: 20 } } }
    },
    scales: {
      y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Tickets' } }
    }
  }
};`;

export const rechartsSample = `const data = [
  { month: 'Jan', newSeats: 40, expansion: 12, goal: 48 },
  { month: 'Feb', newSeats: 36, expansion: 18, goal: 50 },
  { month: 'Mar', newSeats: 44, expansion: 15, goal: 52 },
  { month: 'Apr', newSeats: 51, expansion: 20, goal: 55 }
];

<ComposedChart data={data} width={640} height={320} title="Seats">
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="newSeats" name="New seats" fill="#3b6fd8" stackId="seats" />
  <Bar dataKey="expansion" name="Expansion" fill="#8eadd4" stackId="seats" />
  <Line dataKey="goal" name="Goal" stroke="#c4554a" type="monotone" />
  <ReferenceLine y={60} label="Cap" strokeDasharray="4 4" />
</ComposedChart>`;

export const echartsSample = `const option = {
  title: { text: 'Requests by tier' },
  tooltip: { trigger: 'axis' },
  legend: { orient: 'horizontal' },
  xAxis: { type: 'category', data: ['00', '04', '08', '12', '16', '20'], name: 'Hour' },
  yAxis: { type: 'value', name: 'Requests', min: 0 },
  series: [
    { name: 'Web', type: 'line', stack: 'req', areaStyle: {}, data: [120, 90, 160, 220, 180, 140], smooth: true },
    { name: 'Jobs', type: 'line', stack: 'req', areaStyle: {}, data: [40, 30, 55, 70, 60, 48], itemStyle: { color: '#c4554a' } },
    { name: 'Cap', type: 'line', data: [200, 200, 240, 280, 260, 220], lineStyle: { color: '#888' } }
  ]
};`;

export const samples = [
  { id: "chartjs", label: "Chart.js", source: chartJsSample },
  { id: "recharts", label: "Recharts", source: rechartsSample },
  { id: "echarts", label: "ECharts", source: echartsSample },
] as const;
