# Volcano watch

Jolts at Ashmere, a fictional peak. A short trace with zoom and export, then sequential and diverging colour.

## Forty-eight hours at Ashmere

Two stations. The legend sits on the right, and export is on the chart. LTTB is set; a series this short is still drawn in full.

```json
{
  "version": "1",
  "id": "ashmere-trace",
  "type": "line",
  "theme": "soft",
  "data": [
    {
      "hour": 1,
      "ridge": 24,
      "cinder": 7
    },
    {
      "hour": 2,
      "ridge": 7,
      "cinder": 7
    },
    {
      "hour": 3,
      "ridge": 8,
      "cinder": 7
    },
    {
      "hour": 4,
      "ridge": 9,
      "cinder": 7
    },
    {
      "hour": 5,
      "ridge": 10,
      "cinder": 17
    },
    {
      "hour": 6,
      "ridge": 10,
      "cinder": 6
    },
    {
      "hour": 7,
      "ridge": 11,
      "cinder": 5
    },
    {
      "hour": 8,
      "ridge": 11,
      "cinder": 5
    },
    {
      "hour": 9,
      "ridge": 11,
      "cinder": 4
    },
    {
      "hour": 10,
      "ridge": 11,
      "cinder": 4
    },
    {
      "hour": 11,
      "ridge": 10,
      "cinder": 3
    },
    {
      "hour": 12,
      "ridge": 27,
      "cinder": 3
    },
    {
      "hour": 13,
      "ridge": 8,
      "cinder": 2
    },
    {
      "hour": 14,
      "ridge": 7,
      "cinder": 13
    },
    {
      "hour": 15,
      "ridge": 6,
      "cinder": 2
    },
    {
      "hour": 16,
      "ridge": 5,
      "cinder": 1
    },
    {
      "hour": 17,
      "ridge": 4,
      "cinder": 1
    },
    {
      "hour": 18,
      "ridge": 3,
      "cinder": 1
    },
    {
      "hour": 19,
      "ridge": 2,
      "cinder": 1
    },
    {
      "hour": 20,
      "ridge": 2,
      "cinder": 1
    },
    {
      "hour": 21,
      "ridge": 1,
      "cinder": 1
    },
    {
      "hour": 22,
      "ridge": 1,
      "cinder": 2
    },
    {
      "hour": 23,
      "ridge": 19,
      "cinder": 13
    },
    {
      "hour": 24,
      "ridge": 1,
      "cinder": 2
    },
    {
      "hour": 25,
      "ridge": 2,
      "cinder": 3
    },
    {
      "hour": 26,
      "ridge": 3,
      "cinder": 4
    },
    {
      "hour": 27,
      "ridge": 4,
      "cinder": 4
    },
    {
      "hour": 28,
      "ridge": 5,
      "cinder": 5
    },
    {
      "hour": 29,
      "ridge": 6,
      "cinder": 5
    },
    {
      "hour": 30,
      "ridge": 7,
      "cinder": 6
    },
    {
      "hour": 31,
      "ridge": 8,
      "cinder": 6
    },
    {
      "hour": 32,
      "ridge": 9,
      "cinder": 17
    },
    {
      "hour": 33,
      "ridge": 10,
      "cinder": 7
    },
    {
      "hour": 34,
      "ridge": 28,
      "cinder": 7
    },
    {
      "hour": 35,
      "ridge": 11,
      "cinder": 7
    },
    {
      "hour": 36,
      "ridge": 11,
      "cinder": 7
    },
    {
      "hour": 37,
      "ridge": 11,
      "cinder": 7
    },
    {
      "hour": 38,
      "ridge": 11,
      "cinder": 7
    },
    {
      "hour": 39,
      "ridge": 10,
      "cinder": 6
    },
    {
      "hour": 40,
      "ridge": 9,
      "cinder": 6
    },
    {
      "hour": 41,
      "ridge": 9,
      "cinder": 17
    },
    {
      "hour": 42,
      "ridge": 8,
      "cinder": 5
    },
    {
      "hour": 43,
      "ridge": 6,
      "cinder": 5
    },
    {
      "hour": 44,
      "ridge": 5,
      "cinder": 4
    },
    {
      "hour": 45,
      "ridge": 22,
      "cinder": 4
    },
    {
      "hour": 46,
      "ridge": 3,
      "cinder": 3
    },
    {
      "hour": 47,
      "ridge": 2,
      "cinder": 3
    },
    {
      "hour": 48,
      "ridge": 2,
      "cinder": 2
    }
  ],
  "encoding": {
    "x": {
      "field": "hour",
      "type": "quantitative",
      "title": "Hour"
    },
    "y": [
      {
        "field": "ridge",
        "title": "Ridge"
      },
      {
        "field": "cinder",
        "title": "Cinder"
      }
    ]
  },
  "mark": {
    "sampling": "lttb",
    "glow": true
  },
  "axes": {
    "x": {
      "title": "Hour"
    },
    "y": {
      "title": "Jolts"
    }
  },
  "legend": {
    "position": "right",
    "orient": "vertical",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "crosshair": true
  },
  "interaction": {
    "zoom": "x",
    "pan": true,
    "export": [
      "png",
      "svg",
      "csv"
    ]
  },
  "size": {
    "width": 980,
    "height": 440
  },
  "a11y": {
    "alt": "Ridge jolts spike every few hours and stay above Cinder across the two days."
  }
}
```

## Ridge, as spikes

The same first day, one spike per hour.

```json
{
  "version": "1",
  "id": "ashmere-spikes",
  "type": "spike",
  "theme": "soft",
  "data": [
    {
      "hour": 1,
      "jolts": 24
    },
    {
      "hour": 2,
      "jolts": 7
    },
    {
      "hour": 3,
      "jolts": 8
    },
    {
      "hour": 4,
      "jolts": 9
    },
    {
      "hour": 5,
      "jolts": 10
    },
    {
      "hour": 6,
      "jolts": 10
    },
    {
      "hour": 7,
      "jolts": 11
    },
    {
      "hour": 8,
      "jolts": 11
    },
    {
      "hour": 9,
      "jolts": 11
    },
    {
      "hour": 10,
      "jolts": 11
    },
    {
      "hour": 11,
      "jolts": 10
    },
    {
      "hour": 12,
      "jolts": 27
    },
    {
      "hour": 13,
      "jolts": 8
    },
    {
      "hour": 14,
      "jolts": 7
    },
    {
      "hour": 15,
      "jolts": 6
    },
    {
      "hour": 16,
      "jolts": 5
    }
  ],
  "encoding": {
    "x": {
      "field": "hour",
      "type": "quantitative"
    },
    "y": "jolts"
  },
  "mark": {
    "baseline": 0
  },
  "axes": {
    "x": {
      "title": "Hour"
    },
    "y": {
      "title": "Jolts"
    }
  },
  "size": {
    "width": 640,
    "height": 280
  },
  "a11y": {
    "alt": "Ridge stays in single digits, then jumps above twenty once in the first sixteen hours."
  }
}
```

## How big the jolts were

Eight bins.

```json
{
  "version": "1",
  "id": "ashmere-sizes",
  "type": "histogram",
  "theme": "soft",
  "data": [
    {
      "size": 4
    },
    {
      "size": 7
    },
    {
      "size": 9
    },
    {
      "size": 11
    },
    {
      "size": 12
    },
    {
      "size": 14
    },
    {
      "size": 15
    },
    {
      "size": 16
    },
    {
      "size": 18
    },
    {
      "size": 19
    },
    {
      "size": 22
    },
    {
      "size": 24
    },
    {
      "size": 27
    },
    {
      "size": 31
    },
    {
      "size": 36
    },
    {
      "size": 8
    },
    {
      "size": 13
    },
    {
      "size": 17
    },
    {
      "size": 21
    },
    {
      "size": 28
    },
    {
      "size": 6
    },
    {
      "size": 10
    },
    {
      "size": 20
    },
    {
      "size": 33
    }
  ],
  "encoding": {
    "x": {
      "field": "size",
      "title": "Size"
    }
  },
  "mark": {
    "bins": 8
  },
  "axes": {
    "x": {
      "title": "Size"
    },
    "y": {
      "title": "Jolts"
    }
  },
  "size": {
    "width": 640,
    "height": 280
  },
  "a11y": {
    "alt": "Most jolts are mid-sized. A few pass thirty."
  }
}
```

## Counts by station

A sequential teal ramp. Missing watches stay hatched.

```json
{
  "version": "1",
  "id": "ashmere-counts",
  "type": "heatmap",
  "theme": "soft",
  "data": [
    {
      "station": "Ridge",
      "watch": "Dawn",
      "jolts": 4
    },
    {
      "station": "Ridge",
      "watch": "Noon",
      "jolts": 9
    },
    {
      "station": "Ridge",
      "watch": "Dusk",
      "jolts": 6
    },
    {
      "station": "Ridge",
      "watch": "Night",
      "jolts": 3
    },
    {
      "station": "Cinder",
      "watch": "Dawn",
      "jolts": 7
    },
    {
      "station": "Cinder",
      "watch": "Noon",
      "jolts": 14
    },
    {
      "station": "Cinder",
      "watch": "Dusk",
      "jolts": 11
    },
    {
      "station": "Cinder",
      "watch": "Night",
      "jolts": 5
    },
    {
      "station": "Vent",
      "watch": "Noon",
      "jolts": 8
    },
    {
      "station": "Vent",
      "watch": "Dusk",
      "jolts": 12
    },
    {
      "station": "Vent",
      "watch": "Night",
      "jolts": 4
    }
  ],
  "encoding": {
    "x": "watch",
    "y": "station",
    "color": {
      "field": "jolts",
      "title": "Jolts",
      "scale": {
        "type": "sequential",
        "scheme": "teal"
      }
    }
  },
  "mark": {
    "layout": "grid"
  },
  "size": {
    "width": 640,
    "height": 320
  },
  "a11y": {
    "alt": "Cinder at noon is the busiest cell. Vent at dawn has no reading, so that cell stays hatched."
  }
}
```

## Swing from a quiet hour

Diverging around zero. Orange is above the quiet hour, the other end is below.

```json
{
  "version": "1",
  "id": "ashmere-swing",
  "type": "heatmap",
  "theme": "soft",
  "data": [
    {
      "station": "Ridge",
      "watch": "Dawn",
      "swing": -4
    },
    {
      "station": "Ridge",
      "watch": "Noon",
      "swing": 1
    },
    {
      "station": "Ridge",
      "watch": "Dusk",
      "swing": -1
    },
    {
      "station": "Ridge",
      "watch": "Night",
      "swing": -6
    },
    {
      "station": "Cinder",
      "watch": "Dawn",
      "swing": 2
    },
    {
      "station": "Cinder",
      "watch": "Noon",
      "swing": 8
    },
    {
      "station": "Cinder",
      "watch": "Dusk",
      "swing": 5
    },
    {
      "station": "Cinder",
      "watch": "Night",
      "swing": -2
    },
    {
      "station": "Vent",
      "watch": "Dawn",
      "swing": -5
    },
    {
      "station": "Vent",
      "watch": "Noon",
      "swing": 3
    },
    {
      "station": "Vent",
      "watch": "Dusk",
      "swing": 6
    },
    {
      "station": "Vent",
      "watch": "Night",
      "swing": -3
    }
  ],
  "encoding": {
    "x": "watch",
    "y": "station",
    "color": {
      "field": "swing",
      "title": "Swing",
      "scale": {
        "type": "diverging",
        "midpoint": 0
      }
    }
  },
  "mark": {
    "layout": "grid"
  },
  "size": {
    "width": 640,
    "height": 320
  },
  "a11y": {
    "alt": "Cinder at noon sits well above a quiet hour. Vent at dawn sits below it."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Downsampling / decimation](https://chartkit.dev/features/data.decimation) (`data.decimation`)
- [Data export (CSV/XLSX)](https://chartkit.dev/features/export.csv) (`export.csv`)
- [Built-in export menu / toolbar](https://chartkit.dev/features/export.menu) (`export.menu`)
- [PNG export](https://chartkit.dev/features/export.png) (`export.png`)
- [SVG export](https://chartkit.dev/features/export.svg) (`export.svg`)
- [Pan](https://chartkit.dev/features/interaction.pan) (`interaction.pan`)
- [Zoom (wheel / pinch / drag)](https://chartkit.dev/features/interaction.zoom) (`interaction.zoom`)
- [Continuous colour legend / colour bar](https://chartkit.dev/features/legend.continuous) (`legend.continuous`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Glow / shadow effects](https://chartkit.dev/features/mark.glow) (`mark.glow`)
- [Sequential / diverging colour scale](https://chartkit.dev/features/scale.color.sequential) (`scale.color.sequential`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Crosshair / guide line](https://chartkit.dev/features/tooltip.crosshair) (`tooltip.crosshair`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Heatmap (matrix)](https://chartkit.dev/features/type.heatmap) (`type.heatmap`)
- [Histogram](https://chartkit.dev/features/type.histogram) (`type.histogram`)
- [Line chart](https://chartkit.dev/features/type.line) (`type.line`)

https://chartkit.dev/showcase/volcano
