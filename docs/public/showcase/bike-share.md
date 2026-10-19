# City bike-share flows

Trips through four fictional neighbourhoods, one way from Lantern to Moth, then sixteen weeks of days and the shift from classic bikes to e-bikes.

## Neighbourhood flows

One direction, left to right. Lantern feeds the other three docks.

```json
{
  "version": "1",
  "id": "bike-flows",
  "type": "sankey",
  "theme": "soft",
  "data": [
    {
      "from": "Lantern",
      "to": "Quay",
      "trips": 240
    },
    {
      "from": "Lantern",
      "to": "Kiln",
      "trips": 150
    },
    {
      "from": "Lantern",
      "to": "Moth",
      "trips": 80
    },
    {
      "from": "Quay",
      "to": "Kiln",
      "trips": 70
    },
    {
      "from": "Quay",
      "to": "Moth",
      "trips": 160
    },
    {
      "from": "Kiln",
      "to": "Moth",
      "trips": 110
    }
  ],
  "encoding": {
    "source": "from",
    "target": "to",
    "y": "trips"
  },
  "size": {
    "width": 980,
    "height": 560
  },
  "a11y": {
    "alt": "Lantern sends the most trips to Quay. Quay and Kiln both feed Moth, and nothing rides back upstream."
  }
}
```

## Trip calendar

One cell per day. Colour is the trip count.

```json
{
  "version": "1",
  "id": "bike-calendar",
  "type": "heatmap",
  "theme": "soft",
  "data": [
    {
      "day": "2026-04-06",
      "trips": 6
    },
    {
      "day": "2026-04-07",
      "trips": 26
    },
    {
      "day": "2026-04-08",
      "trips": 17
    },
    {
      "day": "2026-04-09",
      "trips": 8
    },
    {
      "day": "2026-04-10",
      "trips": 28
    },
    {
      "day": "2026-04-11",
      "trips": 13
    },
    {
      "day": "2026-04-12",
      "trips": 33
    },
    {
      "day": "2026-04-13",
      "trips": 24
    },
    {
      "day": "2026-04-14",
      "trips": 15
    },
    {
      "day": "2026-04-15",
      "trips": 6
    },
    {
      "day": "2026-04-16",
      "trips": 20
    },
    {
      "day": "2026-04-17",
      "trips": 11
    },
    {
      "day": "2026-04-18",
      "trips": 31
    },
    {
      "day": "2026-04-19",
      "trips": 22
    },
    {
      "day": "2026-04-20",
      "trips": 13
    },
    {
      "day": "2026-04-21",
      "trips": 27
    },
    {
      "day": "2026-04-22",
      "trips": 18
    },
    {
      "day": "2026-04-23",
      "trips": 9
    },
    {
      "day": "2026-04-24",
      "trips": 29
    },
    {
      "day": "2026-04-25",
      "trips": 20
    },
    {
      "day": "2026-04-26",
      "trips": 34
    },
    {
      "day": "2026-04-27",
      "trips": 25
    },
    {
      "day": "2026-04-28",
      "trips": 16
    },
    {
      "day": "2026-04-29",
      "trips": 7
    },
    {
      "day": "2026-04-30",
      "trips": 27
    },
    {
      "day": "2026-05-01",
      "trips": 12
    },
    {
      "day": "2026-05-02",
      "trips": 32
    },
    {
      "day": "2026-05-03",
      "trips": 23
    },
    {
      "day": "2026-05-04",
      "trips": 14
    },
    {
      "day": "2026-05-05",
      "trips": 34
    },
    {
      "day": "2026-05-06",
      "trips": 19
    },
    {
      "day": "2026-05-07",
      "trips": 10
    },
    {
      "day": "2026-05-08",
      "trips": 30
    },
    {
      "day": "2026-05-09",
      "trips": 21
    },
    {
      "day": "2026-05-10",
      "trips": 12
    },
    {
      "day": "2026-05-11",
      "trips": 26
    },
    {
      "day": "2026-05-12",
      "trips": 17
    },
    {
      "day": "2026-05-13",
      "trips": 8
    },
    {
      "day": "2026-05-14",
      "trips": 28
    },
    {
      "day": "2026-05-15",
      "trips": 19
    },
    {
      "day": "2026-05-16",
      "trips": 33
    },
    {
      "day": "2026-05-17",
      "trips": 24
    },
    {
      "day": "2026-05-18",
      "trips": 15
    },
    {
      "day": "2026-05-19",
      "trips": 6
    },
    {
      "day": "2026-05-20",
      "trips": 26
    },
    {
      "day": "2026-05-21",
      "trips": 11
    },
    {
      "day": "2026-05-22",
      "trips": 31
    },
    {
      "day": "2026-05-23",
      "trips": 22
    },
    {
      "day": "2026-05-24",
      "trips": 13
    },
    {
      "day": "2026-05-25",
      "trips": 33
    },
    {
      "day": "2026-05-26",
      "trips": 18
    },
    {
      "day": "2026-05-27",
      "trips": 9
    },
    {
      "day": "2026-05-28",
      "trips": 29
    },
    {
      "day": "2026-05-29",
      "trips": 20
    },
    {
      "day": "2026-05-30",
      "trips": 11
    },
    {
      "day": "2026-05-31",
      "trips": 25
    },
    {
      "day": "2026-06-01",
      "trips": 16
    },
    {
      "day": "2026-06-02",
      "trips": 7
    },
    {
      "day": "2026-06-03",
      "trips": 27
    },
    {
      "day": "2026-06-04",
      "trips": 18
    },
    {
      "day": "2026-06-05",
      "trips": 32
    },
    {
      "day": "2026-06-06",
      "trips": 23
    },
    {
      "day": "2026-06-07",
      "trips": 14
    },
    {
      "day": "2026-06-08",
      "trips": 34
    },
    {
      "day": "2026-06-09",
      "trips": 25
    },
    {
      "day": "2026-06-10",
      "trips": 10
    },
    {
      "day": "2026-06-11",
      "trips": 30
    },
    {
      "day": "2026-06-12",
      "trips": 21
    },
    {
      "day": "2026-06-13",
      "trips": 12
    },
    {
      "day": "2026-06-14",
      "trips": 32
    },
    {
      "day": "2026-06-15",
      "trips": 17
    },
    {
      "day": "2026-06-16",
      "trips": 8
    },
    {
      "day": "2026-06-17",
      "trips": 28
    },
    {
      "day": "2026-06-18",
      "trips": 19
    },
    {
      "day": "2026-06-19",
      "trips": 10
    },
    {
      "day": "2026-06-20",
      "trips": 24
    },
    {
      "day": "2026-06-21",
      "trips": 15
    },
    {
      "day": "2026-06-22",
      "trips": 6
    },
    {
      "day": "2026-06-23",
      "trips": 26
    },
    {
      "day": "2026-06-24",
      "trips": 17
    },
    {
      "day": "2026-06-25",
      "trips": 31
    },
    {
      "day": "2026-06-26",
      "trips": 22
    },
    {
      "day": "2026-06-27",
      "trips": 13
    },
    {
      "day": "2026-06-28",
      "trips": 33
    },
    {
      "day": "2026-06-29",
      "trips": 24
    },
    {
      "day": "2026-06-30",
      "trips": 9
    },
    {
      "day": "2026-07-01",
      "trips": 29
    },
    {
      "day": "2026-07-02",
      "trips": 20
    },
    {
      "day": "2026-07-03",
      "trips": 11
    },
    {
      "day": "2026-07-04",
      "trips": 31
    },
    {
      "day": "2026-07-05",
      "trips": 16
    },
    {
      "day": "2026-07-06",
      "trips": 7
    },
    {
      "day": "2026-07-07",
      "trips": 27
    },
    {
      "day": "2026-07-08",
      "trips": 18
    },
    {
      "day": "2026-07-09",
      "trips": 9
    },
    {
      "day": "2026-07-10",
      "trips": 23
    },
    {
      "day": "2026-07-11",
      "trips": 14
    },
    {
      "day": "2026-07-12",
      "trips": 34
    },
    {
      "day": "2026-07-13",
      "trips": 25
    },
    {
      "day": "2026-07-14",
      "trips": 16
    },
    {
      "day": "2026-07-15",
      "trips": 30
    },
    {
      "day": "2026-07-16",
      "trips": 21
    },
    {
      "day": "2026-07-17",
      "trips": 12
    },
    {
      "day": "2026-07-18",
      "trips": 32
    },
    {
      "day": "2026-07-19",
      "trips": 23
    },
    {
      "day": "2026-07-20",
      "trips": 8
    },
    {
      "day": "2026-07-21",
      "trips": 28
    },
    {
      "day": "2026-07-22",
      "trips": 19
    },
    {
      "day": "2026-07-23",
      "trips": 10
    },
    {
      "day": "2026-07-24",
      "trips": 30
    },
    {
      "day": "2026-07-25",
      "trips": 15
    },
    {
      "day": "2026-07-26",
      "trips": 6
    }
  ],
  "encoding": {
    "x": {
      "field": "day",
      "type": "temporal",
      "title": "Day"
    },
    "color": {
      "field": "trips",
      "title": "Trips"
    }
  },
  "mark": {
    "layout": "calendar",
    "weeks": 16
  },
  "size": {
    "width": 980,
    "height": 360
  },
  "a11y": {
    "alt": "Daily trips over sixteen weeks vary between a quiet day and a busy day, with no empty week."
  }
}
```

## Classic and e-bike share

Each span sums to 100 percent. Tick labels are tilted. Click a legend name to hide a share.

```json
{
  "version": "1",
  "id": "bike-mix",
  "type": "stacked-area",
  "theme": "soft",
  "data": [
    {
      "span": "Belt",
      "classic": 80,
      "ebike": 20
    },
    {
      "span": "Cinder",
      "classic": 74,
      "ebike": 32
    },
    {
      "span": "Glass",
      "classic": 70,
      "ebike": 41
    },
    {
      "span": "Hearth",
      "classic": 66,
      "ebike": 48
    },
    {
      "span": "Iron",
      "classic": 62,
      "ebike": 55
    },
    {
      "span": "Jade",
      "classic": 58,
      "ebike": 64
    }
  ],
  "encoding": {
    "x": "span",
    "y": [
      {
        "field": "classic",
        "title": "Classic"
      },
      {
        "field": "ebike",
        "title": "E-bike"
      }
    ]
  },
  "mark": {
    "stack": "percent"
  },
  "axes": {
    "x": {
      "title": "Span",
      "rotate": -28
    },
    "y": {
      "title": "Share",
      "format": "percent"
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
    "select": "series"
  },
  "size": {
    "width": 760,
    "height": 380
  },
  "a11y": {
    "alt": "E-bike's share of trips grows from Belt to Jade, and classic shrinks to just under half."
  }
}
```

## Fleet

Slice labels and legend values. Click a slice or its legend name.

```json
{
  "version": "1",
  "id": "bike-fleet",
  "type": "donut",
  "theme": "soft",
  "data": [
    {
      "kind": "Classic",
      "trips": 1840
    },
    {
      "kind": "E-bike",
      "trips": 1260
    }
  ],
  "encoding": {
    "x": "kind",
    "y": "trips"
  },
  "mark": {
    "labels": true
  },
  "legend": {
    "values": true,
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "trips",
        "title": "Trips"
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 420,
    "height": 380
  },
  "a11y": {
    "alt": "Classic bikes take 1,840 trips and e-bikes take 1,260."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Tick label rotation](https://chartkit.dev/features/axis.ticks.rotate) (`axis.ticks.rotate`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Number formatting options](https://chartkit.dev/features/format.number) (`format.number`)
- [Click events on marks](https://chartkit.dev/features/interaction.click) (`interaction.click`)
- [Selection (point / multi / series)](https://chartkit.dev/features/interaction.select) (`interaction.select`)
- [Data labels on marks](https://chartkit.dev/features/label.show) (`label.show`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Values in legend](https://chartkit.dev/features/legend.values) (`legend.values`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Crosshair / guide line](https://chartkit.dev/features/tooltip.crosshair) (`tooltip.crosshair`)
- [Custom tooltip fields](https://chartkit.dev/features/tooltip.fields) (`tooltip.fields`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [100% stacked area](https://chartkit.dev/features/type.area.percent) (`type.area.percent`)
- [Donut chart](https://chartkit.dev/features/type.donut) (`type.donut`)
- [Calendar heatmap](https://chartkit.dev/features/type.heatmap.calendar) (`type.heatmap.calendar`)
- [Sankey](https://chartkit.dev/features/type.sankey) (`type.sankey`)

https://chartkit.dev/showcase/bike-share
