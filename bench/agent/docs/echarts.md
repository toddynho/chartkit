# Get Started

## Getting Apache ECharts

Apache ECharts supports several Installation methods, which are explained in detail in the next [Installation](${lang}/basics/download) tutorial. Here, we'll use [jsDelivr](https://www.jsdelivr.com/package/npm/echarts) CDN as an example to quickly set up ECharts.

At [https://www.jsdelivr.com/package/npm/echarts](https://www.jsdelivr.com/package/npm/echarts) select `dist/echarts.js`, click and save it as `echarts.js` file.

> More information about these files can be found in the next tutorial [Installation](${lang}/basics/download).

## Including ECharts

Create a new `index.html` file in the directory where you just saved `echarts.js`, with the following content:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <!-- Include the ECharts file you just downloaded -->
    <script src="echarts.js"></script>
  </head>
</html>
```

When you open `index.html` the page will appear blank. But don't worry. Open the console and make sure that no error message is reported, then you can proceed to the next step.

## Plotting a Simple Chart

Before rendering a chart we need to prepare a DOM container for ECharts with a defined height and width. Add the following code immediately after the closing `</head>` tag.

```html
<body>
  <!-- Prepare a DOM with a defined width and height for ECharts -->
  <div id="main" style="width: 600px;height:400px;"></div>
</body>
```

Next, initialize an ECharts instance using [echarts.init](${mainSitePath}api.html#echarts.init) method and configure it with [setOption](${mainSitePath}api.html#echartsInstance.setOption) method to generate a simple bar chart. Here is the complete code.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>ECharts</title>
    <!-- Include the ECharts file you just downloaded -->
    <script src="echarts.js"></script>
  </head>
  <body>
    <!-- Prepare a DOM with a defined width and height for ECharts -->
    <div id="main" style="width: 600px;height:400px;"></div>
    <script type="text/javascript">
      // Initialize the echarts instance based on the prepared dom
      var myChart = echarts.init(document.getElementById('main'));

      // Specify the configuration items and data for the chart
      var option = {
        title: {
          text: 'ECharts Getting Started Example'
        },
        tooltip: {},
        legend: {
          data: ['sales']
        },
        xAxis: {
          data: ['Shirts', 'Cardigans', 'Chiffons', 'Pants', 'Heels', 'Socks']
        },
        yAxis: {},
        series: [
          {
            name: 'sales',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      };

      // Display the chart using the configuration and the data defined above.
      myChart.setOption(option);
    </script>
  </body>
</html>
```

And this is your first chart with Apache ECharts!

<md-example src="doc-example/getting-started&reset=1&edit=1"></md-example>

# Using ECharts as an NPM Package

There are two approaches to using ECharts as a package. The simplest approach is to make all functionality immediately available by importing from `echarts`. However, it is encouraged to substantially decrease bundle size by only importing as necessary such as `echarts/core` and `echarts/charts`.

## Install ECharts via NPM

You can install ECharts via npm using the following command

```shell
npm install echarts
```

## Import All ECharts Functionality

To include all of ECharts, we simply need to import `echarts`.

```js
import * as echarts from 'echarts';

// Create the echarts instance
var myChart = echarts.init(document.getElementById('main'));

// Draw the chart
myChart.setOption({
  title: {
    text: 'ECharts Getting Started Example'
  },
  tooltip: {},
  xAxis: {
    data: ['shirt', 'cardigan', 'chiffon', 'pants', 'heels', 'socks']
  },
  yAxis: {},
  series: [
    {
      name: 'sales',
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20]
    }
  ]
});
```

## Shrinking Bundle Size

The above code will import all the charts and components in ECharts, but if you don't want to bring in all the components, you can use the tree-shakeable interface provided by ECharts to bundle the required components and get a minimal bundle.

```js
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';

// Import bar charts, all suffixed with Chart
import { BarChart } from 'echarts/charts';

// Import the title, tooltip, rectangular coordinate system, dataset and transform components
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components';

// Features like Universal Transition and Label Layout
import { LabelLayout, UniversalTransition } from 'echarts/features';

// Import the Canvas renderer
// Note that including the CanvasRenderer or SVGRenderer is a required step
import { CanvasRenderer } from 'echarts/renderers';

// Register the required components
echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);

// The chart is initialized and configured in the same manner as before
var myChart = echarts.init(document.getElementById('main'));
myChart.setOption({
  // ...
});
```

> Note that in order to keep the size of the package to a minimum, ECharts does not provide any renderer in the tree-shakeable interface, so you need to choose to import `CanvasRenderer` or `SVGRenderer` as the renderer. The advantage of this is that if you only need to use the SVG rendering mode, the bundle will not include the `CanvasRenderer` module, which is not needed.

The "Full Code" tab on our sample editor page provides a very convenient way to generate a tree-shakable code. It will generate tree-shakable code based on the current option dynamically to use it directly in your project.

## Creating an Option Type in TypeScript
