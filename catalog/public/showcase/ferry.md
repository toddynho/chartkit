# Ferry network

Crossings among five fictional harbours. Every boat that leaves Brine comes back, and the return ribbons bow over the columns.

## Where the boats go, and come back

Brine feeds Kelp and Cairn. Kelp sends some boats straight back, and Skiff and Dock return the rest. Those three bows cross above the columns.

```json
{
  "version": "1",
  "id": "ferry-flows",
  "type": "sankey",
  "theme": "soft",
  "data": [
    {
      "from": "Brine",
      "to": "Kelp",
      "crossings": 180
    },
    {
      "from": "Brine",
      "to": "Cairn",
      "crossings": 100
    },
    {
      "from": "Kelp",
      "to": "Skiff",
      "crossings": 120
    },
    {
      "from": "Kelp",
      "to": "Brine",
      "crossings": 60
    },
    {
      "from": "Cairn",
      "to": "Dock",
      "crossings": 70
    },
    {
      "from": "Cairn",
      "to": "Skiff",
      "crossings": 30
    },
    {
      "from": "Skiff",
      "to": "Brine",
      "crossings": 150
    },
    {
      "from": "Dock",
      "to": "Brine",
      "crossings": 70
    }
  ],
  "encoding": {
    "source": "from",
    "target": "to",
    "y": "crossings"
  },
  "size": {
    "width": 980,
    "height": 560
  },
  "a11y": {
    "alt": "280 crossings leave Brine. Kelp returns 60 directly. Skiff returns 150 and Dock returns 70, so every boat comes back."
  }
}
```

## Crossings by route

Click a bar to mark that route.

```json
{
  "version": "1",
  "id": "ferry-routes",
  "type": "bar",
  "theme": "soft",
  "data": [
    {
      "route": "Brine–Kelp",
      "crossings": 180
    },
    {
      "route": "Skiff–Brine",
      "crossings": 150
    },
    {
      "route": "Kelp–Skiff",
      "crossings": 120
    },
    {
      "route": "Brine–Cairn",
      "crossings": 100
    },
    {
      "route": "Cairn–Dock",
      "crossings": 70
    },
    {
      "route": "Dock–Brine",
      "crossings": 70
    },
    {
      "route": "Kelp–Brine",
      "crossings": 60
    },
    {
      "route": "Cairn–Skiff",
      "crossings": 30
    }
  ],
  "encoding": {
    "x": "route",
    "y": "crossings"
  },
  "mark": {
    "labels": true,
    "labelPosition": "top"
  },
  "axes": {
    "x": {
      "title": "Route",
      "rotate": -28
    },
    "y": {
      "title": "Crossings"
    }
  },
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "crossings",
        "title": "Crossings"
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 760,
    "height": 400
  },
  "a11y": {
    "alt": "Brine to Kelp has the most crossings. Cairn to Skiff has the fewest."
  }
}
```

## This week's boats

A count and the shape of the week.

```json
{
  "version": "1",
  "id": "ferry-week",
  "type": "kpi",
  "theme": "soft",
  "locale": "en-GB",
  "metric": {
    "label": "Left Brine",
    "value": 280,
    "delta": 0.04,
    "format": {
      "style": "number"
    }
  },
  "data": [
    22,
    28,
    24,
    30,
    26,
    34,
    22
  ],
  "size": {
    "width": 420,
    "height": 240
  },
  "a11y": {
    "alt": "280 boats left Brine, up 4 percent on last week."
  }
}
```

## Weekly crossings

Square markers. Click a point to mark a week, or a legend name to hide a series.

```json
{
  "version": "1",
  "id": "ferry-season",
  "type": "line",
  "theme": "soft",
  "data": [
    {
      "week": "W1",
      "brine": 70,
      "skiff": 40
    },
    {
      "week": "W2",
      "brine": 74,
      "skiff": 42
    },
    {
      "week": "W3",
      "brine": 68,
      "skiff": 48
    },
    {
      "week": "W4",
      "brine": 80,
      "skiff": 44
    },
    {
      "week": "W5",
      "brine": 86,
      "skiff": 51
    },
    {
      "week": "W6",
      "brine": 82,
      "skiff": 55
    },
    {
      "week": "W7",
      "brine": 90,
      "skiff": 52
    },
    {
      "week": "W8",
      "brine": 88,
      "skiff": 58
    }
  ],
  "encoding": {
    "x": "week",
    "y": [
      {
        "field": "brine",
        "title": "Out of Brine",
        "pointShape": "square",
        "pointSize": 5
      },
      {
        "field": "skiff",
        "title": "Into Skiff",
        "pointShape": "triangle",
        "pointSize": 5
      }
    ]
  },
  "mark": {
    "points": "always"
  },
  "axes": {
    "x": {
      "title": "Week"
    },
    "y": {
      "title": "Crossings",
      "position": "left"
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "crosshair": true,
    "crosshairLabel": true
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 980,
    "height": 380
  },
  "a11y": {
    "alt": "Crossings out of Brine stay above crossings into Skiff, and both rise across the eight weeks."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Axis position (top/bottom/left/right)](https://chartkit.dev/features/axis.position) (`axis.position`)
- [Tick label rotation](https://chartkit.dev/features/axis.ticks.rotate) (`axis.ticks.rotate`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Number formatting options](https://chartkit.dev/features/format.number) (`format.number`)
- [Click events on marks](https://chartkit.dev/features/interaction.click) (`interaction.click`)
- [Selection (point / multi / series)](https://chartkit.dev/features/interaction.select) (`interaction.select`)
- [Data label position](https://chartkit.dev/features/label.position) (`label.position`)
- [Data labels on marks](https://chartkit.dev/features/label.show) (`label.show`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Point marker shapes](https://chartkit.dev/features/mark.point.shape) (`mark.point.shape`)
- [Show markers always / on hover / never](https://chartkit.dev/features/mark.point.visibility) (`mark.point.visibility`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Crosshair / guide line](https://chartkit.dev/features/tooltip.crosshair) (`tooltip.crosshair`)
- [Custom tooltip fields](https://chartkit.dev/features/tooltip.fields) (`tooltip.fields`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Column / vertical bar](https://chartkit.dev/features/type.bar.vertical) (`type.bar.vertical`)
- [KPI / big number card](https://chartkit.dev/features/type.kpi) (`type.kpi`)
- [Line chart](https://chartkit.dev/features/type.line) (`type.line`)
- [Sankey](https://chartkit.dev/features/type.sankey) (`type.sankey`)

https://chartkit.dev/showcase/ferry
