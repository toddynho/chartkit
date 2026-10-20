# Carrick lamp, overnight

Lamp current at a fictional lighthouse. Bars are the hourly reading, coloured when the lamp runs dim or bright. The glow line is a three-hour mean, and its points use a distinct threshold colour. A callout marks the dip at 03:00. A host slides this window with mount().append.

## Current through the night

Under 40 is Dim. 70 and over is Bright. The mean waits until three readings exist.

```json
{
  "version": "1",
  "id": "carrick-lamp",
  "type": "combo",
  "title": "Carrick Light",
  "subtitle": "Hourly current, and a three-hour mean.",
  "theme": "soft",
  "data": [
    {
      "hour": "20:00",
      "milliamp": 62
    },
    {
      "hour": "21:00",
      "milliamp": 66
    },
    {
      "hour": "22:00",
      "milliamp": 70
    },
    {
      "hour": "23:00",
      "milliamp": 74
    },
    {
      "hour": "00:00",
      "milliamp": 71
    },
    {
      "hour": "01:00",
      "milliamp": 68
    },
    {
      "hour": "02:00",
      "milliamp": 44
    },
    {
      "hour": "03:00",
      "milliamp": 28
    },
    {
      "hour": "04:00",
      "milliamp": 39
    },
    {
      "hour": "05:00",
      "milliamp": 58
    },
    {
      "hour": "06:00",
      "milliamp": 69
    },
    {
      "hour": "07:00",
      "milliamp": 73
    }
  ],
  "transform": [
    {
      "type": "window",
      "field": "milliamp",
      "size": 3,
      "op": "mean",
      "as": "mean"
    }
  ],
  "encoding": {
    "x": {
      "field": "hour",
      "title": "Hour"
    },
    "y": [
      {
        "field": "milliamp",
        "mark": "bar",
        "title": "Reading",
        "scale": {
          "domain": [
            0,
            90
          ],
          "nice": false
        }
      },
      {
        "field": "mean",
        "mark": "line",
        "title": "Three-hour mean"
      }
    ]
  },
  "mark": {
    "glow": true,
    "curve": "monotone",
    "points": "always",
    "colorRules": [
      {
        "color": "positive",
        "gte": 70,
        "label": "Bright"
      },
      {
        "color": "negative",
        "lt": 40,
        "label": "Dim"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Hour"
    },
    "y": {
      "title": "Milliamps",
      "ticks": [
        0,
        20,
        40,
        60,
        80
      ]
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top"
  },
  "annotations": [
    {
      "type": "marker",
      "x": "03:00",
      "y": 28,
      "label": "Lamp dipped",
      "dx": -44,
      "dy": -34
    }
  ],
  "size": {
    "width": 1040,
    "height": 500
  },
  "a11y": {
    "alt": "Carrick lamp current stays near 70 milliamps, dips to 28 at 03:00, then recovers by 07:00. Bars are the reading. The glow line is a three-hour mean."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Point marker / callout](https://chartkit.dev/features/annotation.marker) (`annotation.marker`)
- [Explicit tick values](https://chartkit.dev/features/axis.ticks.values) (`axis.ticks.values`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Built-in data transforms](https://chartkit.dev/features/data.transform) (`data.transform`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Conditional / threshold colouring](https://chartkit.dev/features/mark.color.conditional) (`mark.color.conditional`)
- [Glow / shadow effects](https://chartkit.dev/features/mark.glow) (`mark.glow`)
- [Show markers always / on hover / never](https://chartkit.dev/features/mark.point.visibility) (`mark.point.visibility`)
- [Explicit domain (min/max)](https://chartkit.dev/features/scale.domain) (`scale.domain`)
- [Nice rounding](https://chartkit.dev/features/scale.nice) (`scale.nice`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Combined bar + line](https://chartkit.dev/features/type.combo) (`type.combo`)
- [Smoothed / spline line](https://chartkit.dev/features/type.line.smooth) (`type.line.smooth`)

https://chartkit.dev/showcase/carrick-lamp
