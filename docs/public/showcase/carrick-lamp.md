# Carrick lamp, overnight

Lamp current at a fictional lighthouse. Points are the hourly reading, coloured when the lamp runs dim or bright. The glow line is a three-hour mean. A callout marks the dip at 03:00. A host slides this window with mount().append.

## Current through the night

Under 40 is the dim token. 70 and over is the bright token. The mean waits until three readings exist.

```json
{
  "version": "1",
  "id": "carrick-lamp",
  "type": "line",
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
        "title": "Reading"
      },
      {
        "field": "mean",
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
        "gte": 70
      },
      {
        "color": "negative",
        "lt": 40
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Hour"
    },
    "y": {
      "title": "Milliamps"
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
      "dx": 16,
      "dy": -36
    }
  ],
  "size": {
    "width": 1040,
    "height": 460
  },
  "a11y": {
    "alt": "Carrick lamp current stays near 70 milliamps, dips to 28 at 03:00, then recovers by 07:00. The line is a three-hour mean."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Point marker / callout](https://chartkit.dev/features/annotation.marker) (`annotation.marker`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Built-in data transforms](https://chartkit.dev/features/data.transform) (`data.transform`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Conditional / threshold colouring](https://chartkit.dev/features/mark.color.conditional) (`mark.color.conditional`)
- [Glow / shadow effects](https://chartkit.dev/features/mark.glow) (`mark.glow`)
- [Show markers always / on hover / never](https://chartkit.dev/features/mark.point.visibility) (`mark.point.visibility`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Line chart](https://chartkit.dev/features/type.line) (`type.line`)
- [Smoothed / spline line](https://chartkit.dev/features/type.line.smooth) (`type.line.smooth`)

https://chartkit.dev/showcase/carrick-lamp
