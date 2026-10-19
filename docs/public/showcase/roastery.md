# Roastery P&L cockpit

A small coffee roaster. Bags, the green-bean bill, and how much stayed in the café, with a second axis, a target rule, a bullet, and a receipts bridge.

## Bags out

Compact count and a rising delta.

```json
{
  "version": "1",
  "id": "roastery-bags",
  "type": "kpi",
  "theme": "soft",
  "locale": "en-GB",
  "metric": {
    "label": "Bags out",
    "value": 3750,
    "delta": 0.08,
    "format": {
      "style": "compact",
      "decimals": 1
    }
  },
  "data": [
    18,
    22,
    19,
    27,
    24,
    31,
    29
  ],
  "size": {
    "width": 420,
    "height": 240
  },
  "a11y": {
    "alt": "Bags out are 3.8 thousand, up 8 percent, and the sparkline finishes higher than it starts."
  }
}
```

## Green beans

Currency, and a lower bill is the good direction.

```json
{
  "version": "1",
  "id": "roastery-beans",
  "type": "kpi",
  "theme": "soft",
  "locale": "en-GB",
  "metric": {
    "label": "Green beans",
    "value": 24600,
    "delta": -0.06,
    "format": {
      "style": "currency",
      "currency": "GBP",
      "decimals": 0
    },
    "goodDirection": "down"
  },
  "data": [
    9,
    8,
    8,
    7,
    7,
    6,
    6
  ],
  "size": {
    "width": 420,
    "height": 240
  },
  "a11y": {
    "alt": "The green-bean bill is 24,600 pounds, down 6 percent, which is the good direction."
  }
}
```

## Café share

Percent of bags that stayed in the café.

```json
{
  "version": "1",
  "id": "roastery-cafe",
  "type": "kpi",
  "theme": "soft",
  "locale": "en-GB",
  "metric": {
    "label": "Café share",
    "value": 0.54,
    "delta": -0.02,
    "format": {
      "style": "percent",
      "decimals": 0
    }
  },
  "data": [
    0.62,
    0.58,
    0.55,
    0.48,
    0.51,
    0.6,
    0.54
  ],
  "size": {
    "width": 420,
    "height": 240
  },
  "a11y": {
    "alt": "Café share is 54 percent, down 2 points."
  }
}
```

## Bags and bean cost

Bars on the left, a currency line on y2, and a target rule. Click a bar to highlight that series, or a legend name to hide it.

```json
{
  "version": "1",
  "id": "roastery-combo",
  "type": "combo",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "roast": "Frost",
      "bags": 420,
      "beans": 3100,
      "cafe": 260
    },
    {
      "roast": "Thaw",
      "bags": 510,
      "beans": 3600,
      "cafe": 300
    },
    {
      "roast": "Bloom",
      "bags": 640,
      "beans": 4200,
      "cafe": 350
    },
    {
      "roast": "Heat",
      "bags": 880,
      "beans": 5100,
      "cafe": 420
    },
    {
      "roast": "Harvest",
      "bags": 760,
      "beans": 4700,
      "cafe": 390
    },
    {
      "roast": "Cellar",
      "bags": 540,
      "beans": 3900,
      "cafe": 330
    }
  ],
  "encoding": {
    "x": "roast",
    "y": [
      {
        "field": "bags",
        "title": "Bags",
        "mark": "bar"
      },
      {
        "field": "beans",
        "title": "Bean cost",
        "mark": "line",
        "axis": "y2",
        "format": {
          "style": "currency",
          "currency": "GBP",
          "decimals": 0
        }
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Roast"
    },
    "y": {
      "title": "Bags"
    },
    "y2": {
      "title": "Bean cost"
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
    "crosshairLabel": true,
    "fields": [
      {
        "field": "bags",
        "title": "Bags"
      },
      {
        "field": "beans",
        "title": "Bean cost",
        "format": {
          "style": "currency",
          "currency": "GBP",
          "decimals": 0
        }
      }
    ]
  },
  "interaction": {
    "select": "series"
  },
  "annotations": [
    {
      "type": "rule",
      "axis": "y",
      "value": 700,
      "dash": "dashed",
      "label": "Bag target",
      "labelPosition": "start"
    }
  ],
  "size": {
    "width": 960,
    "height": 420,
    "padding": {
      "right": 96
    }
  },
  "a11y": {
    "alt": "Bags peak in Heat above the target line, and the bean bill peaks in the same roast."
  }
}
```

## Café bags against the aim

The bar is the value, the marker is the aim, and the range is the wide mark.

```json
{
  "version": "1",
  "id": "roastery-bullet",
  "type": "bullet",
  "theme": "soft",
  "data": [
    {
      "desk": "Café",
      "bags": 1880,
      "aim": 1700,
      "wide": 2400
    }
  ],
  "encoding": {
    "x": "desk",
    "y": "bags",
    "target": "aim"
  },
  "mark": {
    "ranges": [
      "wide"
    ]
  },
  "size": {
    "width": 640,
    "height": 200
  },
  "a11y": {
    "alt": "Café bags are 1,880, past the aim of 1,700 and inside the wide mark of 2,400."
  }
}
```

## Receipts bridge

Signed steps between two totals.

```json
{
  "version": "1",
  "id": "roastery-bridge",
  "type": "waterfall",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "step": "Open",
      "amount": 12000,
      "total": true
    },
    {
      "step": "Café",
      "amount": 6400
    },
    {
      "step": "Wholesale",
      "amount": 4100
    },
    {
      "step": "Beans",
      "amount": -9800
    },
    {
      "step": "Close",
      "amount": 12700,
      "total": true
    }
  ],
  "encoding": {
    "x": "step",
    "y": {
      "field": "amount",
      "format": {
        "style": "currency",
        "currency": "GBP",
        "decimals": 0
      }
    }
  },
  "axes": {
    "x": {
      "title": "Step",
      "rotate": -24
    },
    "y": {
      "title": "Pounds"
    }
  },
  "size": {
    "width": 640,
    "height": 340
  },
  "a11y": {
    "alt": "Receipts open at 12,000 pounds, café and wholesale add, beans subtract, and the close is 12,700."
  }
}
```

## This week's bags

A sparkline with no axes.

```json
{
  "version": "1",
  "id": "roastery-spark",
  "type": "sparkline",
  "theme": "soft",
  "data": [
    42,
    48,
    45,
    61,
    58,
    73,
    69
  ],
  "size": {
    "width": 960,
    "height": 140
  },
  "a11y": {
    "alt": "Daily bags rise from 42 to 69 across the week, with a dip after the fourth day."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Annotation label placement](https://chartkit.dev/features/annotation.label.position) (`annotation.label.position`)
- [Horizontal reference line](https://chartkit.dev/features/annotation.line.y) (`annotation.line.y`)
- [Annotation styling (dash, colour, opacity)](https://chartkit.dev/features/annotation.style) (`annotation.style`)
- [Tick label rotation](https://chartkit.dev/features/axis.ticks.rotate) (`axis.ticks.rotate`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Compact / SI number abbreviations](https://chartkit.dev/features/format.compact) (`format.compact`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Number formatting options](https://chartkit.dev/features/format.number) (`format.number`)
- [Click events on marks](https://chartkit.dev/features/interaction.click) (`interaction.click`)
- [Selection (point / multi / series)](https://chartkit.dev/features/interaction.select) (`interaction.select`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Multiple / dual y axes](https://chartkit.dev/features/scale.multi) (`scale.multi`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Crosshair / guide line](https://chartkit.dev/features/tooltip.crosshair) (`tooltip.crosshair`)
- [Custom tooltip fields](https://chartkit.dev/features/tooltip.fields) (`tooltip.fields`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Waterfall](https://chartkit.dev/features/type.bar.waterfall) (`type.bar.waterfall`)
- [Bullet chart](https://chartkit.dev/features/type.bullet) (`type.bullet`)
- [Combined bar + line](https://chartkit.dev/features/type.combo) (`type.combo`)
- [KPI / big number card](https://chartkit.dev/features/type.kpi) (`type.kpi`)
- [Sparkline](https://chartkit.dev/features/type.sparkline) (`type.sparkline`)

https://chartkit.dev/showcase/roastery
