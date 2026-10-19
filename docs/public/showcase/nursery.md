# Nursery theme studio

Low Fern, a fictional yard. The switcher restyles the board. One legend pages, one sits inside the plot, and the donut keeps its own palette.

## Eight beds, one row at a time

The legend pages. Export sits above the chart.

```json
{
  "version": "1",
  "id": "low-fern-beds",
  "type": "line",
  "theme": "soft",
  "data": [
    {
      "week": "W1",
      "fern": 4,
      "ivy": 6,
      "moss": 8,
      "sage": 10,
      "rue": 12,
      "yarrow": 5,
      "nettle": 7,
      "cress": 9
    },
    {
      "week": "W2",
      "fern": 7,
      "ivy": 9,
      "moss": 11,
      "sage": 4,
      "rue": 6,
      "yarrow": 8,
      "nettle": 10,
      "cress": 12
    },
    {
      "week": "W3",
      "fern": 10,
      "ivy": 12,
      "moss": 5,
      "sage": 7,
      "rue": 9,
      "yarrow": 11,
      "nettle": 4,
      "cress": 6
    },
    {
      "week": "W4",
      "fern": 4,
      "ivy": 6,
      "moss": 8,
      "sage": 10,
      "rue": 12,
      "yarrow": 5,
      "nettle": 7,
      "cress": 9
    },
    {
      "week": "W5",
      "fern": 7,
      "ivy": 9,
      "moss": 11,
      "sage": 4,
      "rue": 6,
      "yarrow": 8,
      "nettle": 10,
      "cress": 12
    },
    {
      "week": "W6",
      "fern": 10,
      "ivy": 12,
      "moss": 5,
      "sage": 7,
      "rue": 9,
      "yarrow": 11,
      "nettle": 4,
      "cress": 6
    }
  ],
  "encoding": {
    "x": "week",
    "y": [
      {
        "field": "fern",
        "title": "Fern"
      },
      {
        "field": "ivy",
        "title": "Ivy"
      },
      {
        "field": "moss",
        "title": "Moss"
      },
      {
        "field": "sage",
        "title": "Sage"
      },
      {
        "field": "rue",
        "title": "Rue"
      },
      {
        "field": "yarrow",
        "title": "Yarrow"
      },
      {
        "field": "nettle",
        "title": "Nettle"
      },
      {
        "field": "cress",
        "title": "Cress"
      }
    ]
  },
  "legend": {
    "position": "right",
    "orient": "vertical",
    "maxRows": 1,
    "title": "Beds",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top"
  },
  "interaction": {
    "select": "series",
    "export": [
      "png",
      "svg",
      "csv"
    ]
  },
  "axes": {
    "x": {
      "title": "Week"
    },
    "y": {
      "title": "Trays"
    }
  },
  "size": {
    "width": 980,
    "height": 420
  },
  "a11y": {
    "alt": "Eight beds of trays over six weeks. The legend shows one bed at a time."
  }
}
```

## Cuttings this week

The legend sits inside the plot, at the top right.

```json
{
  "version": "1",
  "id": "low-fern-cuttings",
  "type": "bar",
  "theme": "soft",
  "data": [
    {
      "week": "W4",
      "fern": 12,
      "ivy": 9
    },
    {
      "week": "W5",
      "fern": 15,
      "ivy": 11
    },
    {
      "week": "W6",
      "fern": 14,
      "ivy": 13
    }
  ],
  "encoding": {
    "x": "week",
    "y": [
      {
        "field": "fern",
        "title": "Fern"
      },
      {
        "field": "ivy",
        "title": "Ivy"
      }
    ]
  },
  "legend": {
    "position": "inside",
    "anchor": "top-right",
    "orient": "vertical"
  },
  "axes": {
    "x": {
      "title": "Week"
    },
    "y": {
      "title": "Cuttings"
    }
  },
  "size": {
    "width": 640,
    "height": 360
  },
  "a11y": {
    "alt": "Fern cuttings lead in week 5. Ivy catches up in week 6."
  }
}
```

## What left the yard

A palette on the slices, so the theme switch keeps these colours.

```json
{
  "version": "1",
  "id": "low-fern-mix",
  "type": "donut",
  "theme": "soft",
  "data": [
    {
      "kind": "Fern",
      "trays": 86
    },
    {
      "kind": "Ivy",
      "trays": 54
    },
    {
      "kind": "Sage",
      "trays": 41
    },
    {
      "kind": "Rue",
      "trays": 28
    }
  ],
  "encoding": {
    "x": "kind",
    "y": "trays"
  },
  "mark": {
    "palette": [
      "#0f6e56",
      "#c45c26",
      "#1d4e89",
      "#5b4b8a"
    ]
  },
  "legend": {
    "position": "bottom",
    "values": true,
    "interactive": true
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 560,
    "height": 360
  },
  "a11y": {
    "alt": "Fern is the largest share of trays that left the yard, then ivy, sage, and rue."
  }
}
```

## Pot size and leaf count

Each point is one bench.

```json
{
  "version": "1",
  "id": "low-fern-pots",
  "type": "scatter",
  "theme": "soft",
  "data": [
    {
      "pot": 9,
      "leaves": 14,
      "bench": "North"
    },
    {
      "pot": 12,
      "leaves": 22,
      "bench": "North"
    },
    {
      "pot": 15,
      "leaves": 18,
      "bench": "South"
    },
    {
      "pot": 11,
      "leaves": 11,
      "bench": "South"
    },
    {
      "pot": 18,
      "leaves": 27,
      "bench": "North"
    },
    {
      "pot": 8,
      "leaves": 9,
      "bench": "South"
    }
  ],
  "encoding": {
    "x": {
      "field": "pot",
      "title": "Pot, cm"
    },
    "y": {
      "field": "leaves",
      "title": "Leaves"
    },
    "color": "bench"
  },
  "legend": {
    "position": "bottom"
  },
  "axes": {
    "x": {
      "title": "Pot, cm"
    },
    "y": {
      "title": "Leaves"
    }
  },
  "size": {
    "width": 720,
    "height": 360
  },
  "a11y": {
    "alt": "Larger pots tend to carry more leaves. The north bench holds the fullest pot."
  }
}
```

## Water used

Litres against a mark of 80.

```json
{
  "version": "1",
  "id": "low-fern-water",
  "type": "gauge",
  "theme": "soft",
  "metric": {
    "label": "Litres",
    "value": 64,
    "min": 0,
    "max": 100,
    "target": 80,
    "format": {
      "style": "number",
      "decimals": 0
    }
  },
  "size": {
    "width": 420,
    "height": 280
  },
  "a11y": {
    "alt": "The yard used 64 litres, under the mark of 80."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Data export (CSV/XLSX)](https://chartkit.dev/features/export.csv) (`export.csv`)
- [Built-in export menu / toolbar](https://chartkit.dev/features/export.menu) (`export.menu`)
- [PNG export](https://chartkit.dev/features/export.png) (`export.png`)
- [SVG export](https://chartkit.dev/features/export.svg) (`export.svg`)
- [Number formatting options](https://chartkit.dev/features/format.number) (`format.number`)
- [Click events on marks](https://chartkit.dev/features/interaction.click) (`interaction.click`)
- [Selection (point / multi / series)](https://chartkit.dev/features/interaction.select) (`interaction.select`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Paginated / scrolling legend](https://chartkit.dev/features/legend.scroll) (`legend.scroll`)
- [Legend item styling](https://chartkit.dev/features/legend.style) (`legend.style`)
- [Values in legend](https://chartkit.dev/features/legend.values) (`legend.values`)
- [Custom colour palette](https://chartkit.dev/features/theme.palette) (`theme.palette`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Grouped bar](https://chartkit.dev/features/type.bar.grouped) (`type.bar.grouped`)
- [Column / vertical bar](https://chartkit.dev/features/type.bar.vertical) (`type.bar.vertical`)
- [Donut chart](https://chartkit.dev/features/type.donut) (`type.donut`)
- [Gauge / dial](https://chartkit.dev/features/type.gauge) (`type.gauge`)
- [Line chart](https://chartkit.dev/features/type.line) (`type.line`)
- [Scatter plot](https://chartkit.dev/features/type.scatter) (`type.scatter`)

https://chartkit.dev/showcase/nursery
