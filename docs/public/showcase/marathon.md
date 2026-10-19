# Marathon training block

Sixteen weeks for a fictional runner. Kilometres sit on the left, pace sits on a reversed right axis, and the early and late blocks share a radar.

## Kilometres and pace

Bars are kilometres. The diamond line is pace, on a reversed right axis, so a faster week sits higher. Click a legend name to hide a series.

```json
{
  "version": "1",
  "id": "marathon-block",
  "type": "combo",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "week": "W1",
      "km": 28,
      "pace": 6.4
    },
    {
      "week": "W2",
      "km": 32,
      "pace": 6.3
    },
    {
      "week": "W3",
      "km": 30,
      "pace": 6.3
    },
    {
      "week": "W4",
      "km": 36,
      "pace": 6.1
    },
    {
      "week": "W5",
      "km": 40,
      "pace": 6
    },
    {
      "week": "W6",
      "km": 38,
      "pace": 6
    },
    {
      "week": "W7",
      "km": 44,
      "pace": 5.8
    },
    {
      "week": "W8",
      "km": 42,
      "pace": 5.8
    },
    {
      "week": "W9",
      "km": 48,
      "pace": 5.7
    },
    {
      "week": "W10",
      "km": 46,
      "pace": 5.6
    },
    {
      "week": "W11",
      "km": 52,
      "pace": 5.5
    },
    {
      "week": "W12",
      "km": 50,
      "pace": 5.5
    },
    {
      "week": "W13",
      "km": 55,
      "pace": 5.4
    },
    {
      "week": "W14",
      "km": 48,
      "pace": 5.4
    },
    {
      "week": "W15",
      "km": 58,
      "pace": 5.2
    },
    {
      "week": "W16",
      "km": 36,
      "pace": 5.1
    }
  ],
  "encoding": {
    "x": "week",
    "y": [
      {
        "field": "km",
        "title": "Kilometres",
        "mark": "bar"
      },
      {
        "field": "pace",
        "title": "Pace",
        "mark": "line",
        "axis": "y2",
        "pointShape": "diamond",
        "pointSize": 5,
        "scale": {
          "reverse": true
        }
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Week",
      "titlePosition": "start"
    },
    "y": {
      "title": "Kilometres",
      "ticks": [
        20,
        40,
        60
      ],
      "titlePosition": "end"
    },
    "y2": {
      "title": "Minutes per km",
      "position": "right",
      "ticks": [
        5,
        5.5,
        6,
        6.5
      ],
      "titlePosition": "end"
    }
  },
  "mark": {
    "points": "always",
    "labelEnds": "ends"
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
    "width": 980,
    "height": 460,
    "padding": {
      "left": 72,
      "right": 88
    }
  },
  "a11y": {
    "alt": "Kilometres climb through the block and ease in the last week. Pace falls from 6.4 to 5.1 minutes per kilometre, drawn upward because the right axis is reversed."
  }
}
```

## Easy, steady, and hard

Stacked minutes. Click a legend name to hide a band.

```json
{
  "version": "1",
  "id": "marathon-effort",
  "type": "bar",
  "theme": "soft",
  "data": [
    {
      "week": "W1",
      "band": "Easy",
      "minutes": 70
    },
    {
      "week": "W1",
      "band": "Steady",
      "minutes": 24
    },
    {
      "week": "W1",
      "band": "Hard",
      "minutes": 8
    },
    {
      "week": "W2",
      "band": "Easy",
      "minutes": 74
    },
    {
      "week": "W2",
      "band": "Steady",
      "minutes": 28
    },
    {
      "week": "W2",
      "band": "Hard",
      "minutes": 11
    },
    {
      "week": "W3",
      "band": "Easy",
      "minutes": 78
    },
    {
      "week": "W3",
      "band": "Steady",
      "minutes": 32
    },
    {
      "week": "W3",
      "band": "Hard",
      "minutes": 14
    },
    {
      "week": "W4",
      "band": "Easy",
      "minutes": 82
    },
    {
      "week": "W4",
      "band": "Steady",
      "minutes": 24
    },
    {
      "week": "W4",
      "band": "Hard",
      "minutes": 17
    },
    {
      "week": "W5",
      "band": "Easy",
      "minutes": 86
    },
    {
      "week": "W5",
      "band": "Steady",
      "minutes": 28
    },
    {
      "week": "W5",
      "band": "Hard",
      "minutes": 8
    },
    {
      "week": "W6",
      "band": "Easy",
      "minutes": 90
    },
    {
      "week": "W6",
      "band": "Steady",
      "minutes": 32
    },
    {
      "week": "W6",
      "band": "Hard",
      "minutes": 11
    },
    {
      "week": "W7",
      "band": "Easy",
      "minutes": 94
    },
    {
      "week": "W7",
      "band": "Steady",
      "minutes": 24
    },
    {
      "week": "W7",
      "band": "Hard",
      "minutes": 14
    },
    {
      "week": "W8",
      "band": "Easy",
      "minutes": 98
    },
    {
      "week": "W8",
      "band": "Steady",
      "minutes": 28
    },
    {
      "week": "W8",
      "band": "Hard",
      "minutes": 17
    }
  ],
  "encoding": {
    "x": "week",
    "y": "minutes",
    "series": "band"
  },
  "mark": {
    "stack": "stack"
  },
  "axes": {
    "x": {
      "title": "Week"
    },
    "y": {
      "title": "Minutes",
      "ticks": [
        40,
        80,
        120
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
    "crosshair": true
  },
  "interaction": {
    "select": "series"
  },
  "size": {
    "width": 760,
    "height": 380
  },
  "a11y": {
    "alt": "Easy minutes are the largest band each week, with a smaller hard band on top."
  }
}
```

## Early block and late block

Two spokes sets. Late sits further out on hills and stride.

```json
{
  "version": "1",
  "id": "marathon-radar",
  "type": "radar",
  "theme": "soft",
  "data": [
    {
      "spoke": "Hills",
      "early": 4,
      "late": 7
    },
    {
      "spoke": "Stride",
      "early": 5,
      "late": 8
    },
    {
      "spoke": "Rest",
      "early": 6,
      "late": 7
    },
    {
      "spoke": "Fuel",
      "early": 5,
      "late": 6
    },
    {
      "spoke": "Sleep",
      "early": 7,
      "late": 7
    }
  ],
  "encoding": {
    "x": "spoke",
    "y": [
      {
        "field": "early",
        "title": "Early"
      },
      {
        "field": "late",
        "title": "Late"
      }
    ]
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "size": {
    "width": 420,
    "height": 380
  },
  "a11y": {
    "alt": "The late block scores higher on hills and stride. Sleep is level."
  }
}
```

## This week's kilometres

Seven days, no axes.

```json
{
  "version": "1",
  "id": "marathon-spark",
  "type": "sparkline",
  "theme": "soft",
  "data": [
    6,
    8,
    0,
    10,
    7,
    14,
    5
  ],
  "size": {
    "width": 960,
    "height": 120
  },
  "a11y": {
    "alt": "The week has a rest day, then a long day of 14 kilometres."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Axis position (top/bottom/left/right)](https://chartkit.dev/features/axis.position) (`axis.position`)
- [Explicit tick values](https://chartkit.dev/features/axis.ticks.values) (`axis.ticks.values`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Axis title position / alignment](https://chartkit.dev/features/axis.title.position) (`axis.title.position`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Click events on marks](https://chartkit.dev/features/interaction.click) (`interaction.click`)
- [Selection (point / multi / series)](https://chartkit.dev/features/interaction.select) (`interaction.select`)
- [Data labels on marks](https://chartkit.dev/features/label.show) (`label.show`)
- [Margins / padding](https://chartkit.dev/features/layout.margin) (`layout.margin`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Point marker shapes](https://chartkit.dev/features/mark.point.shape) (`mark.point.shape`)
- [Show markers always / on hover / never](https://chartkit.dev/features/mark.point.visibility) (`mark.point.visibility`)
- [Multiple / dual y axes](https://chartkit.dev/features/scale.multi) (`scale.multi`)
- [Reversed scale](https://chartkit.dev/features/scale.reverse) (`scale.reverse`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Crosshair / guide line](https://chartkit.dev/features/tooltip.crosshair) (`tooltip.crosshair`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Stacked bar](https://chartkit.dev/features/type.bar.stacked) (`type.bar.stacked`)
- [Column / vertical bar](https://chartkit.dev/features/type.bar.vertical) (`type.bar.vertical`)
- [Combined bar + line](https://chartkit.dev/features/type.combo) (`type.combo`)
- [Radar / spider chart](https://chartkit.dev/features/type.radar) (`type.radar`)
- [Sparkline](https://chartkit.dev/features/type.sparkline) (`type.sparkline`)

https://chartkit.dev/showcase/marathon
