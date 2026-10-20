# Benchmarks, drawn by ChartKit

The measured line bundles and the published round of browser timings, drawn as charts. Losses stay on the page.

Bundle bytes are from docs/data/measured-sizes.json, size script measured 2026-10-20 on `3a59d27e1bde0382939e2fac3c7a298d6967896b`, bench bundles measured 2026-10-20. Timings are older round 13, measured 2026-10-18 on `d8dcc5a`, from benchmarks.json.

## Line chart, gzip

Log scale. ChartKit is the size script. The other bars are the bench line, using the React-external gzip when that row has one. uPlot’s CSS is a separate measured file and is not added to its bar.

```json
{
  "version": "1",
  "id": "bench-bundles",
  "type": "bar",
  "theme": "soft",
  "data": [
    {
      "name": "ChartKit",
      "bytes": 31251
    },
    {
      "name": "CK bench",
      "bytes": 30694
    },
    {
      "name": "uPlot",
      "bytes": 23276
    },
    {
      "name": "Chart.js",
      "bytes": 49374
    },
    {
      "name": "Plot",
      "bytes": 97723
    },
    {
      "name": "Recharts",
      "bytes": 96213
    },
    {
      "name": "Nivo",
      "bytes": 96583
    },
    {
      "name": "ECharts",
      "bytes": 162991
    }
  ],
  "encoding": {
    "x": "name",
    "y": {
      "field": "bytes",
      "title": "Bytes",
      "scale": {
        "type": "log"
      }
    }
  },
  "mark": {
    "orientation": "horizontal"
  },
  "axes": {
    "x": {
      "title": "Library"
    },
    "y": {
      "title": "Gzip bytes"
    }
  },
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "bytes",
        "title": "Gzip bytes"
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 980,
    "height": 460,
    "padding": {
      "left": 72
    }
  },
  "a11y": {
    "alt": "ChartKit’s measured line is the smallest bar. ECharts is the largest on this log scale."
  }
}
```

## Aligned update, ChartKit and uPlot

Grouped bars from the round 13 browser rows. A taller uPlot bar is a loss. Click a legend name to hide that library.

```json
{
  "version": "1",
  "id": "bench-updates",
  "type": "bar",
  "theme": "soft",
  "data": [
    {
      "cell": "even 1k",
      "library": "ChartKit",
      "ms": 1.5
    },
    {
      "cell": "even 10k",
      "library": "ChartKit",
      "ms": 1.9
    },
    {
      "cell": "even 100k",
      "library": "ChartKit",
      "ms": 2.3
    },
    {
      "cell": "even 1M",
      "library": "ChartKit",
      "ms": 10.7
    },
    {
      "cell": "jittered 1k",
      "library": "ChartKit",
      "ms": 1.6
    },
    {
      "cell": "jittered 10k",
      "library": "ChartKit",
      "ms": 1.9
    },
    {
      "cell": "jittered 100k",
      "library": "ChartKit",
      "ms": 2.7
    },
    {
      "cell": "jittered 1M",
      "library": "ChartKit",
      "ms": 11.7
    },
    {
      "cell": "gapped 1k",
      "library": "ChartKit",
      "ms": 1.6
    },
    {
      "cell": "gapped 10k",
      "library": "ChartKit",
      "ms": 1.9
    },
    {
      "cell": "gapped 100k",
      "library": "ChartKit",
      "ms": 3.5
    },
    {
      "cell": "gapped 1M",
      "library": "ChartKit",
      "ms": 11.5
    },
    {
      "cell": "even 1k",
      "library": "uPlot",
      "ms": 1.2
    },
    {
      "cell": "even 10k",
      "library": "uPlot",
      "ms": 1.7
    },
    {
      "cell": "even 100k",
      "library": "uPlot",
      "ms": 2.9
    },
    {
      "cell": "even 1M",
      "library": "uPlot",
      "ms": 11.2
    },
    {
      "cell": "jittered 1k",
      "library": "uPlot",
      "ms": 1.4
    },
    {
      "cell": "jittered 10k",
      "library": "uPlot",
      "ms": 2.2
    },
    {
      "cell": "jittered 100k",
      "library": "uPlot",
      "ms": 3.4
    },
    {
      "cell": "jittered 1M",
      "library": "uPlot",
      "ms": 13
    },
    {
      "cell": "gapped 1k",
      "library": "uPlot",
      "ms": 1.4
    },
    {
      "cell": "gapped 10k",
      "library": "uPlot",
      "ms": 1.6
    },
    {
      "cell": "gapped 100k",
      "library": "uPlot",
      "ms": 3.4
    },
    {
      "cell": "gapped 1M",
      "library": "uPlot",
      "ms": 11.8
    }
  ],
  "encoding": {
    "x": "cell",
    "y": "ms",
    "series": "library"
  },
  "axes": {
    "x": {
      "title": "Cell",
      "rotate": -32
    },
    "y": {
      "title": "Milliseconds"
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "crosshair": true
  },
  "interaction": {
    "select": "series"
  },
  "size": {
    "width": 980,
    "height": 440,
    "padding": {
      "left": 88
    }
  },
  "a11y": {
    "alt": "uPlot’s aligned update is faster than ChartKit’s in several of the twelve cells, including the smaller point counts."
  }
}
```

## Update gap

ChartKit minus uPlot. The band below zero is a loss. The band above zero is a lead.

```json
{
  "version": "1",
  "id": "bench-gap",
  "type": "bar",
  "theme": "soft",
  "data": [
    {
      "cell": "even 1k",
      "gap": 0.3
    },
    {
      "cell": "even 10k",
      "gap": 0.2
    },
    {
      "cell": "even 100k",
      "gap": -0.6
    },
    {
      "cell": "even 1M",
      "gap": -0.5
    },
    {
      "cell": "jittered 1k",
      "gap": 0.2
    },
    {
      "cell": "jittered 10k",
      "gap": -0.3
    },
    {
      "cell": "jittered 100k",
      "gap": -0.7
    },
    {
      "cell": "jittered 1M",
      "gap": -1.3
    },
    {
      "cell": "gapped 1k",
      "gap": 0.2
    },
    {
      "cell": "gapped 10k",
      "gap": 0.3
    },
    {
      "cell": "gapped 100k",
      "gap": 0.1
    },
    {
      "cell": "gapped 1M",
      "gap": -0.3
    }
  ],
  "encoding": {
    "x": "cell",
    "y": {
      "field": "gap",
      "title": "ms"
    }
  },
  "axes": {
    "x": {
      "title": "Cell",
      "rotate": -32
    },
    "y": {
      "title": "Gap (ms)"
    }
  },
  "annotations": [
    {
      "type": "band",
      "axis": "y",
      "from": -1.3,
      "to": 0,
      "label": "uPlot faster",
      "opacity": 0.2
    },
    {
      "type": "band",
      "axis": "y",
      "from": 0,
      "to": 0.3,
      "label": "ChartKit faster",
      "opacity": 0.12
    }
  ],
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "gap",
        "title": "Gap (ms)"
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 980,
    "height": 400,
    "padding": {
      "left": 84
    }
  },
  "a11y": {
    "alt": "Bars below zero are cells where uPlot’s aligned update is faster. Bars above zero are cells where ChartKit is faster."
  }
}
```

## Steady hover at 100k

Painted median from the same round 13 file. uPlot is ahead of ChartKit here.

```json
{
  "version": "1",
  "id": "bench-hover",
  "type": "bar",
  "theme": "soft",
  "data": [
    {
      "lib": "ChartKit",
      "ms": 16.5
    },
    {
      "lib": "uPlot",
      "ms": 16.2
    },
    {
      "lib": "Chart.js",
      "ms": 20.3
    },
    {
      "lib": "Observable Plot",
      "ms": 28.3
    },
    {
      "lib": "Recharts",
      "ms": 28.9
    },
    {
      "lib": "ECharts",
      "ms": 2881.4
    }
  ],
  "encoding": {
    "x": "lib",
    "y": {
      "field": "ms",
      "scale": {
        "type": "log"
      }
    }
  },
  "mark": {
    "orientation": "horizontal"
  },
  "axes": {
    "x": {
      "title": "Library"
    },
    "y": {
      "title": "Milliseconds"
    }
  },
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "ms",
        "title": "Painted ms"
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 980,
    "height": 380,
    "padding": {
      "left": 72
    }
  },
  "a11y": {
    "alt": "At 100,000 points, uPlot’s painted hover is slightly faster than ChartKit’s. ECharts is far slower."
  }
}
```

## Losses

- **even 1k.** Aligned update: ChartKit 1.5 ms, uPlot 1.2 ms.
- **even 10k.** Aligned update: ChartKit 1.9 ms, uPlot 1.7 ms.
- **jittered 1k.** Aligned update: ChartKit 1.6 ms, uPlot 1.4 ms.
- **gapped 1k.** Aligned update: ChartKit 1.6 ms, uPlot 1.4 ms.
- **gapped 10k.** Aligned update: ChartKit 1.9 ms, uPlot 1.6 ms.
- **gapped 100k.** Aligned update: ChartKit 3.5 ms, uPlot 3.4 ms.
- **Hover 100k.** Painted median: ChartKit 16.5 ms, uPlot 16.2 ms.

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Shaded band / region](https://chartkit.dev/features/annotation.band) (`annotation.band`)
- [Tick label rotation](https://chartkit.dev/features/axis.ticks.rotate) (`axis.ticks.rotate`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Click events on marks](https://chartkit.dev/features/interaction.click) (`interaction.click`)
- [Selection (point / multi / series)](https://chartkit.dev/features/interaction.select) (`interaction.select`)
- [Margins / padding](https://chartkit.dev/features/layout.margin) (`layout.margin`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Logarithmic scale](https://chartkit.dev/features/scale.log) (`scale.log`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Crosshair / guide line](https://chartkit.dev/features/tooltip.crosshair) (`tooltip.crosshair`)
- [Custom tooltip fields](https://chartkit.dev/features/tooltip.fields) (`tooltip.fields`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Grouped bar](https://chartkit.dev/features/type.bar.grouped) (`type.bar.grouped`)
- [Horizontal bar](https://chartkit.dev/features/type.bar.horizontal) (`type.bar.horizontal`)
- [Column / vertical bar](https://chartkit.dev/features/type.bar.vertical) (`type.bar.vertical`)

https://chartkit.dev/showcase/benchmarks-drawn
