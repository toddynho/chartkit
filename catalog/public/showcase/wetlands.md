# Accessibility tour

Bird counts at three fictional wetland hides. Each hide has its own marker, one line is dashed, and the keyboard and a data table sit on the same spec.

## Birds at three hides

Circle, square, and triangle markers. Mire is dashed. Arrow keys walk the points. Click a marker to mark it, or a legend name to hide a hide.

```json
{
  "version": "1",
  "id": "wetland-counts",
  "type": "line",
  "theme": "soft",
  "data": [
    {
      "morning": "Mon",
      "reed": 12,
      "sedge": 8,
      "mire": 5
    },
    {
      "morning": "Tue",
      "reed": 14,
      "sedge": 9,
      "mire": 6
    },
    {
      "morning": "Wed",
      "reed": 11,
      "sedge": 7,
      "mire": 8
    },
    {
      "morning": "Thu",
      "reed": 18,
      "sedge": 11,
      "mire": 7
    },
    {
      "morning": "Fri",
      "reed": 16,
      "sedge": 10,
      "mire": 9
    },
    {
      "morning": "Sat",
      "reed": 22,
      "sedge": 13,
      "mire": 8
    },
    {
      "morning": "Sun",
      "reed": 19,
      "sedge": 12,
      "mire": 11
    },
    {
      "morning": "Mon 2",
      "reed": 15,
      "sedge": 9,
      "mire": 10
    }
  ],
  "encoding": {
    "x": "morning",
    "y": [
      {
        "field": "reed",
        "title": "Reed",
        "pointShape": "circle",
        "pointSize": 6
      },
      {
        "field": "sedge",
        "title": "Sedge",
        "pointShape": "square",
        "pointSize": 6
      },
      {
        "field": "mire",
        "title": "Mire",
        "pointShape": "triangle",
        "pointSize": 6,
        "dash": "dashed"
      }
    ]
  },
  "mark": {
    "points": "always",
    "labelEnds": "ends"
  },
  "axes": {
    "x": {
      "title": "Morning"
    },
    "y": {
      "title": "Birds",
      "ticks": [
        5,
        10,
        15,
        20
      ]
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
  "a11y": {
    "alt": "Reed counts the most birds and peaks on Saturday. Sedge stays in the middle. Mire, drawn dashed with triangles, rises toward the second Monday.",
    "description": "Counts are from one watcher at each hide. The table lists the same eight mornings.",
    "keyboard": true,
    "dataTable": true
  },
  "size": {
    "width": 980,
    "height": 440,
    "padding": {
      "left": 64
    }
  }
}
```

## Saturday at Reed

Value labels on the bars. Click a bar to mark a bird.

```json
{
  "version": "1",
  "id": "wetland-species",
  "type": "bar",
  "theme": "soft",
  "data": [
    {
      "bird": "Heron",
      "count": 4
    },
    {
      "bird": "Knot",
      "count": 9
    },
    {
      "bird": "Pipit",
      "count": 6
    },
    {
      "bird": "Teal",
      "count": 3
    }
  ],
  "encoding": {
    "x": "bird",
    "y": "count"
  },
  "mark": {
    "labels": true,
    "labelPosition": "top"
  },
  "axes": {
    "x": {
      "title": "Bird"
    },
    "y": {
      "title": "Count",
      "ticks": [
        0,
        5,
        10
      ]
    }
  },
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "count",
        "title": "Count"
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 560,
    "height": 340
  },
  "a11y": {
    "alt": "On Saturday at Reed, knot outnumber the other birds. Teal is the smallest count."
  }
}
```

## Week totals

One bar per hide, labelled.

```json
{
  "version": "1",
  "id": "wetland-hides",
  "type": "bar",
  "theme": "soft",
  "data": [
    {
      "hide": "Reed",
      "birds": 127
    },
    {
      "hide": "Sedge",
      "birds": 79
    },
    {
      "hide": "Mire",
      "birds": 64
    }
  ],
  "encoding": {
    "x": "hide",
    "y": "birds",
    "color": "hide"
  },
  "mark": {
    "labels": true,
    "labelPosition": "top"
  },
  "axes": {
    "x": {
      "title": "Hide"
    },
    "y": {
      "title": "Birds"
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "birds",
        "title": "Birds"
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 560,
    "height": 340
  },
  "a11y": {
    "alt": "Reed totals 127 birds, Sedge 79, and Mire 64. Each hide has its own colour."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Accessible data table](https://chartkit.dev/features/a11y.datatable) (`a11y.datatable`)
- [Long description](https://chartkit.dev/features/a11y.description.long) (`a11y.description.long`)
- [Keyboard navigation of data points](https://chartkit.dev/features/a11y.keyboard) (`a11y.keyboard`)
- [Explicit tick values](https://chartkit.dev/features/axis.ticks.values) (`axis.ticks.values`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Click events on marks](https://chartkit.dev/features/interaction.click) (`interaction.click`)
- [Selection (point / multi / series)](https://chartkit.dev/features/interaction.select) (`interaction.select`)
- [Data label position](https://chartkit.dev/features/label.position) (`label.position`)
- [Data labels on marks](https://chartkit.dev/features/label.show) (`label.show`)
- [Margins / padding](https://chartkit.dev/features/layout.margin) (`layout.margin`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Per-point / per-category colour](https://chartkit.dev/features/mark.color.point) (`mark.color.point`)
- [Point marker shapes](https://chartkit.dev/features/mark.point.shape) (`mark.point.shape`)
- [Show markers always / on hover / never](https://chartkit.dev/features/mark.point.visibility) (`mark.point.visibility`)
- [Dashed / dotted lines](https://chartkit.dev/features/mark.stroke.dash) (`mark.stroke.dash`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Crosshair / guide line](https://chartkit.dev/features/tooltip.crosshair) (`tooltip.crosshair`)
- [Custom tooltip fields](https://chartkit.dev/features/tooltip.fields) (`tooltip.fields`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Column / vertical bar](https://chartkit.dev/features/type.bar.vertical) (`type.bar.vertical`)
- [Line chart](https://chartkit.dev/features/type.line) (`type.line`)

https://chartkit.dev/showcase/wetlands
