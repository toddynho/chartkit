# Getting started

> Build your first chart with Recharts in minutes

Recharts is a composable charting library built with React and D3. This guide walks you through creating your first chart.

## Installation

Install Recharts via npm or yarn:

<CodeGroup>
  ```bash npm theme={null}
  npm install recharts
  ```

  ```bash yarn theme={null}
  yarn add recharts
  ```

  ```bash pnpm theme={null}
  pnpm add recharts
  ```
</CodeGroup>

## Your first chart

Let's create a simple line chart that visualizes monthly revenue data.

<Steps>
  <Step title="Prepare your data">
    Recharts works with plain JavaScript arrays of objects:

    ```jsx theme={null}
    const data = [
      { month: 'Jan', revenue: 4000 },
      { month: 'Feb', revenue: 3000 },
      { month: 'Mar', revenue: 5000 },
      { month: 'Apr', revenue: 4500 },
      { month: 'May', revenue: 6000 },
      { month: 'Jun', revenue: 5500 },
    ];
    ```
  </Step>

  <Step title="Import components">
    Import the chart container and components you need:

    ```jsx theme={null}
    import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
    ```
  </Step>

  <Step title="Build your chart">
    Compose your chart using declarative components:

    ```jsx theme={null}
    function RevenueChart() {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    ```
  </Step>
</Steps>

## Understanding the structure

Every Recharts chart follows a consistent pattern:

### Chart container

The outer container defines the chart type:

```jsx theme={null}
<LineChart data={data}>
  {/* Chart components go here */}
</LineChart>
```

Available chart types: `LineChart`, `BarChart`, `AreaChart`, `ComposedChart`, `PieChart`, `RadarChart`, `ScatterChart`.

### Axes

Axes define how data maps to visual coordinates:

```jsx theme={null}
<XAxis dataKey="month" />  {/* Horizontal axis */}
<YAxis />                   {/* Vertical axis */}
```

The `dataKey` prop tells the axis which field from your data to use.

### Data series

Data series components visualize your data:

```jsx theme={null}
<Line dataKey="revenue" stroke="#8884d8" />
```

Each series needs a `dataKey` that matches a field in your data.

### Interactive components

Add interactivity with Tooltip and Legend:

```jsx theme={null}
<Tooltip />  {/* Shows data on hover */}
<Legend />   {/* Shows series labels */}
```

## Multiple data series

Add multiple series to compare data:

```jsx theme={null}
const data = [
  { month: 'Jan', revenue: 4000, profit: 2400 },
  { month: 'Feb', revenue: 3000, profit: 1398 },
  { month: 'Mar', revenue: 5000, profit: 3800 },
];

function MultiSeriesChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
        <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

## Bar chart example

Switch to a bar chart by changing the container and series component:

```jsx theme={null}
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function BarChartExample() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="revenue" fill="#8884d8" />
        <Bar dataKey="profit" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

## Common pitfalls

<Warning>
  **Data keys must match your data structure**

  If your data has a field called `sales`, use `dataKey="sales"`, not `dataKey="revenue"`.
</Warning>

<Tip>
  **Always wrap charts in ResponsiveContainer**

  This ensures your chart adapts to different screen sizes. Set width to `"100%"` to fill the parent container.
</Tip>

## Next steps

* Learn about [tooltips and legends](/guides/tooltips-and-legends) for better interactivity
* Configure [axes and grids](/guides/axes-and-grids) for precise control
* Add [animations](/guides/animations) to make your charts engaging
* Explore [responsive containers](/guides/responsive-containers) for adaptive layouts


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.

# Quickstart

> Get started with Recharts in minutes by creating your first interactive chart

Get up and running with Recharts by building your first chart in just a few steps.

## Prerequisites

Before you begin, make sure you have:

* Node.js 18 or higher installed
* A React application set up (React 16.8+)
* Basic understanding of React components

## Create your first chart

<Steps>
  <Step title="Install Recharts">
    Install Recharts and its peer dependency `react-is`:

    <CodeGroup>
      ```bash npm theme={null}
      npm install recharts react-is
      ```

      ```bash yarn theme={null}
      yarn add recharts react-is
      ```

      ```bash pnpm theme={null}
      pnpm add recharts react-is
      ```
    </CodeGroup>

    <Note>
      The `react-is` version should match your installed React version.
    </Note>
  </Step>

  <Step title="Prepare your data">
    Create a data array with objects. Each object represents a data point:

    ```jsx theme={null}
    const data = [
      { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
      { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
      { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
      { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
      { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
      { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
      { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
    ];
    ```
