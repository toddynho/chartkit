# Installation

## npm

[![npm](https://img.shields.io/npm/v/chart.js.svg?style=flat-square&maxAge=600)](https://npmjs.com/package/chart.js)
[![npm](https://img.shields.io/npm/dm/chart.js.svg?style=flat-square&maxAge=600)](https://npmjs.com/package/chart.js)

```sh
npm install chart.js
```

## CDN

### CDNJS

[![cdnjs](https://img.shields.io/cdnjs/v/Chart.js.svg?style=flat-square&maxAge=600)](https://cdnjs.com/libraries/Chart.js)

Chart.js built files are available on [CDNJS](https://cdnjs.com/):

<https://cdnjs.com/libraries/Chart.js>

### jsDelivr

[![jsdelivr](https://img.shields.io/npm/v/chart.js.svg?label=jsdelivr&style=flat-square&maxAge=600)](https://cdn.jsdelivr.net/npm/chart.js@latest/dist/) [![jsdelivr hits](https://data.jsdelivr.com/v1/package/npm/chart.js/badge)](https://www.jsdelivr.com/package/npm/chart.js)

Chart.js built files are also available through [jsDelivr](https://www.jsdelivr.com/):

<https://www.jsdelivr.com/package/npm/chart.js?path=dist>

## GitHub

[![github](https://img.shields.io/github/release/chartjs/Chart.js.svg?style=flat-square&maxAge=600)](https://github.com/chartjs/Chart.js/releases/latest)

You can download the latest version of [Chart.js on GitHub](https://github.com/chartjs/Chart.js/releases/latest).

If you download or clone the repository, you must [build](../developers/contributing.md#building-and-testing) Chart.js to generate the dist files. Chart.js no longer comes with prebuilt release versions, so an alternative option to downloading the repo is **strongly** advised.

# Step-by-step guide

Follow this guide to get familiar with all major concepts of Chart.js: chart types and elements, datasets, customization, plugins, components, and tree-shaking. Don't hesitate to follow the links in the text.

We'll build a Chart.js data visualization with a couple of charts from scratch:

![result](./usage-8.png)

## Build a new application with Chart.js

In a new folder, create the `package.json` file with the following contents:

```json
{
  "name": "chartjs-example",
  "version": "1.0.0",
  "license": "MIT",
  "scripts": {
    "dev": "parcel src/index.html",
    "build": "parcel build src/index.html"
  },
  "devDependencies": {
    "parcel": "^2.6.2"
  },
  "dependencies": {
    "@cubejs-client/core": "^0.31.0",
    "chart.js": "^4.0.0"
  }
}
```

Modern front-end applications often use JavaScript module bundlers, so we’ve picked [Parcel](https://parceljs.org) as a nice zero-configuration build tool. We’re also installing Chart.js v4 and a JavaScript client for [Cube](https://cube.dev/?ref=eco-chartjs), an open-source API for data apps we’ll use to fetch real-world data (more on that later).

Run `npm install`, `yarn install`, or `pnpm install` to install the dependencies, then create the `src` folder. Inside that folder, we’ll need a very simple `index.html` file:

```html
<!doctype html>
<html lang="en">
  <head>
    <title>Chart.js example</title>
  </head>
  <body>
    <!-- <div style="width: 500px;"><canvas id="dimensions"></canvas></div><br/> -->
    <div style="width: 800px;"><canvas id="acquisitions"></canvas></div>

    <!-- <script type="module" src="dimensions.js"></script> -->
    <script type="module" src="acquisitions.js"></script>
  </body>
</html>
```

As you can see, Chart.js requires minimal markup: a `canvas` tag with an `id` by which we’ll reference the chart later. By default, Chart.js charts are [responsive](../configuration/responsive.md) and take the whole enclosing container. So, we set the width of the `div` to control chart width.

Lastly, let’s create the `src/acquisitions.js` file with the following contents:

```jsx
import Chart from 'chart.js/auto'

(async function() {
  const data = [
    { year: 2010, count: 10 },
    { year: 2011, count: 20 },
    { year: 2012, count: 15 },
    { year: 2013, count: 25 },
    { year: 2014, count: 22 },
    { year: 2015, count: 30 },
    { year: 2016, count: 28 },
  ];

  new Chart(
    document.getElementById('acquisitions'),
    {
      type: 'bar',
      data: {
        labels: data.map(row => row.year),
        datasets: [
          {
            label: 'Acquisitions by year',
            data: data.map(row => row.count)
          }
        ]
      }
    }
  );
})();
```

Let’s walk through this code:

- We import `Chart`, the main Chart.js class, from the special `chart.js/auto` path. It loads [all available Chart.js components](./integration) (which is very convenient) but disallows tree-shaking. We’ll address that later.
- We instantiate a new `Chart` instance and provide two arguments: the canvas element where the chart would be rendered and the options object.
- We just need to provide a chart type (`bar`) and provide `data` which consists of `labels` (often, numeric or textual descriptions of data points) and an array of `datasets` (Chart.js supports multiple datasets for most chart types). Each dataset is designated with a `label` and contains an array of data points.
- For now, we only have a few entries of dummy data. So, we extract `year` and `count` properties to produce the arrays of `labels` and data points within the only dataset.

Time to run the example with `npm run dev`, `yarn dev`, or `pnpm dev` and navigate to [localhost:1234](http://localhost:1234) in your web browser:

![result](./usage-1.png)

With just a few lines of code, we’ve got a chart with a lot of features: a [legend](../configuration/legend.md), [grid lines](../samples/scale-options/grid.md), [ticks](../samples/scale-options/ticks.md), and [tooltips](../configuration/tooltip.md) shown on hover. Refresh the web page a few times to see that the chart is also [animated](../configuration/animations.md#animations). Try clicking on the “Acquisitions by year” label to see that you’re also able to toggle datasets visibility (especially useful when you have multiple datasets). 

### Simple customizations

Let’s see how Chart.js charts can be customized. First, let’s turn off the animations so the chart appears instantly. Second, let’s hide the legend and tooltips since we have only one dataset and pretty trivial data.

Replace the `new Chart(...);` invocation in `src/acquisitions.js` with the following snippet:

```jsx
  new Chart(
    document.getElementById('acquisitions'),
    {
      type: 'bar',
