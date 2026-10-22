# Harrow kiln

One firing at the fictional Harrow kiln. The hearth swings from a banked night to a 2,480 kW peak, so the first chart is a signed log with the axis through zero. The second keeps a linear scale and breaks out the empty middle. The mosaic bins the four bays.

## Signed log through zero

Hearth paints over the flue. The axis crosses zero, with minor ticks. The night band sits under the lines. Tap pins the tooltip.

```json
{
  "version": "1",
  "id": "harrow-kiln-signed",
  "type": "line",
  "title": "Harrow, one firing",
  "subtitle": "Hearth over flue. Signed log, constant 10.",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "hour": 0,
      "hearth": -18,
      "flue": -6
    },
    {
      "hour": 2,
      "hearth": -26,
      "flue": -9
    },
    {
      "hour": 4,
      "hearth": -11,
      "flue": -3
    },
    {
      "hour": 6,
      "hearth": 8,
      "flue": 3
    },
    {
      "hour": 8,
      "hearth": 34,
      "flue": 12
    },
    {
      "hour": 10,
      "hearth": 86,
      "flue": 28
    },
    {
      "hour": 12,
      "hearth": 2480,
      "flue": 96
    },
    {
      "hour": 14,
      "hearth": 190,
      "flue": 44
    },
    {
      "hour": 16,
      "hearth": 62,
      "flue": 18
    },
    {
      "hour": 18,
      "hearth": 16,
      "flue": 6
    },
    {
      "hour": 20,
      "hearth": -6,
      "flue": -2
    },
    {
      "hour": 22,
      "hearth": -16,
      "flue": -5
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
        "field": "flue",
        "title": "Flue",
        "z": 0,
        "format": {
          "specifier": "+,.0f",
          "suffix": " kW"
        },
        "scale": {
          "type": "symlog",
          "constant": 10,
          "domain": [
            -40,
            2800
          ],
          "nice": false,
          "zero": false
        }
      },
      {
        "field": "hearth",
        "title": "Hearth",
        "z": 2,
        "format": {
          "specifier": "+,.0f",
          "suffix": " kW"
        },
        "scale": {
          "type": "symlog",
          "constant": 10,
          "domain": [
            -40,
            2800
          ],
          "nice": false,
          "zero": false
        }
      }
    ]
  },
  "mark": {
    "curve": "monotone",
    "points": "always",
    "pointSize": 3.5
  },
  "axes": {
    "x": {
      "title": "Hour",
      "crosses": 0,
      "line": {
        "show": true,
        "width": 1.75,
        "color": "#6b7280"
      },
      "format": {
        "specifier": ".0f"
      }
    },
    "y": {
      "title": "Kilowatts",
      "minorTicks": 2,
      "ticks": [
        -10,
        0,
        10,
        100,
        1000
      ],
      "format": {
        "specifier": "+,.0f",
        "suffix": " kW"
      }
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "pin": true,
    "hit": 28,
    "template": "{name} {value} {unit}",
    "fields": [
      {
        "field": "hearth",
        "title": "Hearth",
        "format": {
          "specifier": "+,.0f"
        },
        "unit": "kW"
      },
      {
        "field": "flue",
        "title": "Flue",
        "format": {
          "specifier": "+,.0f"
        },
        "unit": "kW"
      }
    ]
  },
  "animation": {
    "duration": 640,
    "easing": "spring"
  },
  "annotations": [
    {
      "type": "band",
      "axis": "y",
      "from": -40,
      "to": 0,
      "label": "Banked",
      "opacity": 0.45,
      "z": -1
    },
    {
      "type": "marker",
      "x": 12,
      "y": 2480,
      "label": "Hearth peak",
      "dx": -72,
      "dy": 16,
      "z": 3
    }
  ],
  "size": {
    "width": 960,
    "height": 480,
    "padding": {
      "left": 84,
      "bottom": 48
    }
  },
  "a11y": {
    "alt": "The Harrow hearth is banked overnight, near minus 26 kW at hour 2, then peaks at 2,480 kW at hour 12. The flue stays under it and peaks at 96 kW."
  }
}
```

## The empty middle, broken out

Same firing on a linear scale. The axis skips 200 to 1,800 kW, sits 12 px off the plot, and still crosses zero.

```json
{
  "version": "1",
  "id": "harrow-kiln-break",
  "type": "line",
  "title": "Linear, with a break",
  "subtitle": "The gap is 200 to 1,800 kW.",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "hour": 0,
      "hearth": -18,
      "flue": -6
    },
    {
      "hour": 2,
      "hearth": -26,
      "flue": -9
    },
    {
      "hour": 4,
      "hearth": -11,
      "flue": -3
    },
    {
      "hour": 6,
      "hearth": 8,
      "flue": 3
    },
    {
      "hour": 8,
      "hearth": 34,
      "flue": 12
    },
    {
      "hour": 10,
      "hearth": 86,
      "flue": 28
    },
    {
      "hour": 12,
      "hearth": 2480,
      "flue": 96
    },
    {
      "hour": 14,
      "hearth": 190,
      "flue": 44
    },
    {
      "hour": 16,
      "hearth": 62,
      "flue": 18
    },
    {
      "hour": 18,
      "hearth": 16,
      "flue": 6
    },
    {
      "hour": 20,
      "hearth": -6,
      "flue": -2
    },
    {
      "hour": 22,
      "hearth": -16,
      "flue": -5
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
        "field": "flue",
        "title": "Flue",
        "z": 0,
        "format": {
          "specifier": "+,.0f",
          "suffix": " kW"
        },
        "scale": {
          "type": "linear",
          "domain": [
            -40,
            2800
          ],
          "nice": false,
          "zero": false
        }
      },
      {
        "field": "hearth",
        "title": "Hearth",
        "z": 1,
        "format": {
          "specifier": "+,.0f",
          "suffix": " kW"
        },
        "scale": {
          "type": "linear",
          "domain": [
            -40,
            2800
          ],
          "nice": false,
          "zero": false
        }
      }
    ]
  },
  "mark": {
    "curve": "monotone",
    "points": "always"
  },
  "axes": {
    "x": {
      "title": "Hour",
      "crosses": 0,
      "line": {
        "show": true,
        "width": 1.75,
        "color": "#6b7280"
      },
      "minorTicks": 1,
      "format": {
        "specifier": ".0f"
      }
    },
    "y": {
      "title": "Kilowatts",
      "offset": 12,
      "minorTicks": 1,
      "ticks": [
        -20,
        0,
        100,
        2000,
        2600
      ],
      "breaks": [
        {
          "from": 200,
          "to": 1800
        }
      ],
      "line": {
        "show": true,
        "width": 1.75,
        "color": "#6b7280"
      },
      "format": {
        "specifier": "+,.0f",
        "suffix": " kW"
      }
    }
  },
  "legend": {
    "position": "bottom"
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "fields": [
      "hearth",
      "flue"
    ]
  },
  "size": {
    "width": 560,
    "height": 480,
    "padding": {
      "left": 72
    }
  },
  "a11y": {
    "alt": "On a linear scale with a break from 200 to 1,800 kW, the Harrow hearth peak at hour 12 still reads as 2,480, and the banked night stays readable below zero."
  }
}
```

## Four bays, binned

Threshold cuts at 0, 80, and 400 kW. Oak at the 14 bell is the hottest cell.

```json
{
  "version": "1",
  "id": "harrow-kiln-bays",
  "type": "heatmap",
  "title": "Bays",
  "subtitle": "Cuts at 0, 80, and 400 kW.",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "bay": "Ash",
      "bell": "02",
      "kiln": -14
    },
    {
      "bay": "Ash",
      "bell": "06",
      "kiln": -4
    },
    {
      "bay": "Ash",
      "bell": "10",
      "kiln": 22
    },
    {
      "bay": "Ash",
      "bell": "14",
      "kiln": 70
    },
    {
      "bay": "Ash",
      "bell": "18",
      "kiln": 18
    },
    {
      "bay": "Ash",
      "bell": "22",
      "kiln": -8
    },
    {
      "bay": "Elm",
      "bell": "02",
      "kiln": -6
    },
    {
      "bay": "Elm",
      "bell": "06",
      "kiln": 8
    },
    {
      "bay": "Elm",
      "bell": "10",
      "kiln": 48
    },
    {
      "bay": "Elm",
      "bell": "14",
      "kiln": 420
    },
    {
      "bay": "Elm",
      "bell": "18",
      "kiln": 36
    },
    {
      "bay": "Elm",
      "bell": "22",
      "kiln": -2
    },
    {
      "bay": "Oak",
      "bell": "02",
      "kiln": 4
    },
    {
      "bay": "Oak",
      "bell": "06",
      "kiln": 16
    },
    {
      "bay": "Oak",
      "bell": "10",
      "kiln": 90
    },
    {
      "bay": "Oak",
      "bell": "14",
      "kiln": 860
    },
    {
      "bay": "Oak",
      "bell": "18",
      "kiln": 54
    },
    {
      "bay": "Oak",
      "bell": "22",
      "kiln": 6
    },
    {
      "bay": "Yew",
      "bell": "02",
      "kiln": -20
    },
    {
      "bay": "Yew",
      "bell": "06",
      "kiln": -12
    },
    {
      "bay": "Yew",
      "bell": "10",
      "kiln": 10
    },
    {
      "bay": "Yew",
      "bell": "14",
      "kiln": 30
    },
    {
      "bay": "Yew",
      "bell": "18",
      "kiln": 8
    },
    {
      "bay": "Yew",
      "bell": "22",
      "kiln": -16
    }
  ],
  "encoding": {
    "x": {
      "field": "bell",
      "title": "Bell"
    },
    "y": {
      "field": "bay",
      "title": "Bay"
    },
    "color": {
      "field": "kiln",
      "scale": {
        "type": "threshold",
        "thresholds": [
          0,
          80,
          400
        ]
      }
    }
  },
  "legend": {
    "position": "bottom"
  },
  "tooltip": {
    "pin": true,
    "hit": 24,
    "template": "{bay} at {bell}: {value} {unit}",
    "fields": [
      {
        "field": "kiln",
        "title": "Kilowatts",
        "format": {
          "specifier": "+,.0f"
        },
        "unit": "kW"
      }
    ]
  },
  "size": {
    "width": 560,
    "height": 480
  },
  "a11y": {
    "alt": "Oak at the 14 bell is the hottest Harrow bay, at 860 kW. Ash and Yew stay near or below zero except at the 10 and 14 bells."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Duration and easing](https://chartkit.dev/features/animation.duration) (`animation.duration`)
- [Shaded band / region](https://chartkit.dev/features/annotation.band) (`annotation.band`)
- [Point marker / callout](https://chartkit.dev/features/annotation.marker) (`annotation.marker`)
- [Axis breaks](https://chartkit.dev/features/axis.breaks) (`axis.breaks`)
- [Axis offset / origin crossing](https://chartkit.dev/features/axis.offset) (`axis.offset`)
- [Minor ticks / minor grid](https://chartkit.dev/features/axis.ticks.minor) (`axis.ticks.minor`)
- [Explicit tick values](https://chartkit.dev/features/axis.ticks.values) (`axis.ticks.values`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Margins / padding](https://chartkit.dev/features/layout.margin) (`layout.margin`)
- [Continuous colour legend / colour bar](https://chartkit.dev/features/legend.continuous) (`legend.continuous`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Point marker size](https://chartkit.dev/features/mark.point.size) (`mark.point.size`)
- [Show markers always / on hover / never](https://chartkit.dev/features/mark.point.visibility) (`mark.point.visibility`)
- [Draw order / z-index](https://chartkit.dev/features/mark.zindex) (`mark.zindex`)
- [Explicit domain (min/max)](https://chartkit.dev/features/scale.domain) (`scale.domain`)
- [Linear scale](https://chartkit.dev/features/scale.linear) (`scale.linear`)
- [Nice rounding](https://chartkit.dev/features/scale.nice) (`scale.nice`)
- [Quantize / threshold / quantile scales](https://chartkit.dev/features/scale.quantize) (`scale.quantize`)
- [Symlog / signed log scale](https://chartkit.dev/features/scale.symlog) (`scale.symlog`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Custom tooltip fields](https://chartkit.dev/features/tooltip.fields) (`tooltip.fields`)
- [Tooltip value formatting](https://chartkit.dev/features/tooltip.format) (`tooltip.format`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Touch-friendly tooltip](https://chartkit.dev/features/tooltip.touch) (`tooltip.touch`)
- [Heatmap (matrix)](https://chartkit.dev/features/type.heatmap) (`type.heatmap`)
- [Line chart](https://chartkit.dev/features/type.line) (`type.line`)
- [Smoothed / spline line](https://chartkit.dev/features/type.line.smooth) (`type.line.smooth`)

https://chartkit.dev/showcase/harrow-kiln
