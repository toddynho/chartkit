# Printable field report

Marrow Lane, a fictional garden. Pounds on the stall, a padded line you can export, and twelve weeks of baskets in threshold colour.

## Kilos off the beds

Padding is set by hand. Export is on this chart too.

```json
{
  "version": "1",
  "id": "marrow-kilos",
  "type": "line",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "week": "W1",
      "kilos": 18
    },
    {
      "week": "W2",
      "kilos": 24
    },
    {
      "week": "W3",
      "kilos": 21
    },
    {
      "week": "W4",
      "kilos": 33
    },
    {
      "week": "W5",
      "kilos": 29
    },
    {
      "week": "W6",
      "kilos": 41
    },
    {
      "week": "W7",
      "kilos": 36
    },
    {
      "week": "W8",
      "kilos": 44
    }
  ],
  "encoding": {
    "x": "week",
    "y": {
      "field": "kilos",
      "title": "Kilos"
    }
  },
  "legend": {
    "position": "bottom"
  },
  "axes": {
    "x": {
      "title": "Week"
    },
    "y": {
      "title": "Kilos"
    }
  },
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "kilos",
        "title": "Kilos"
      }
    ]
  },
  "interaction": {
    "export": [
      "png",
      "svg",
      "csv"
    ]
  },
  "size": {
    "width": 760,
    "height": 360,
    "minHeight": 280,
    "padding": {
      "top": 28,
      "right": 24,
      "bottom": 36,
      "left": 56
    }
  },
  "a11y": {
    "alt": "Kilos off the beds rise from 18 to the mid-forties, with a dip in week 5."
  }
}
```

## Stall takings

Pounds, with whole-number ticks.

```json
{
  "version": "1",
  "id": "marrow-takings",
  "type": "kpi",
  "theme": "soft",
  "locale": "en-GB",
  "metric": {
    "label": "Takings",
    "value": 640,
    "delta": 0.12,
    "format": {
      "style": "currency",
      "currency": "GBP",
      "decimals": 0
    }
  },
  "data": [
    42,
    48,
    51,
    64
  ],
  "size": {
    "width": 420,
    "height": 240
  },
  "a11y": {
    "alt": "The stall took 640 pounds, up 12 percent."
  }
}
```

## Takings by crop

Labels use the same pound format as the axis.

```json
{
  "version": "1",
  "id": "marrow-crops",
  "type": "bar",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "crop": "Marrow",
      "pounds": 220
    },
    {
      "crop": "Beet",
      "pounds": 140
    },
    {
      "crop": "Kale",
      "pounds": 160
    },
    {
      "crop": "Leek",
      "pounds": 120
    }
  ],
  "encoding": {
    "x": "crop",
    "y": {
      "field": "pounds",
      "format": {
        "style": "currency",
        "currency": "GBP",
        "decimals": 0
      }
    }
  },
  "mark": {
    "labels": true,
    "labelPosition": "top"
  },
  "axes": {
    "x": {
      "title": "Crop"
    },
    "y": {
      "title": "Pounds",
      "format": {
        "style": "currency",
        "currency": "GBP",
        "decimals": 0
      }
    }
  },
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "pounds",
        "title": "Pounds",
        "format": {
          "style": "currency",
          "currency": "GBP",
          "decimals": 0
        }
      }
    ]
  },
  "size": {
    "width": 720,
    "height": 380
  },
  "a11y": {
    "alt": "Marrow brings in 220 pounds. Leek is the smallest stall taking, at 120."
  }
}
```

## Against the bed marks

Value, a mark, and three bands.

```json
{
  "version": "1",
  "id": "marrow-targets",
  "type": "bullet",
  "theme": "soft",
  "data": [
    {
      "crop": "Marrow",
      "kilos": 44,
      "mark": 40,
      "thin": 20,
      "fair": 36,
      "full": 50
    },
    {
      "crop": "Beet",
      "kilos": 22,
      "mark": 28,
      "thin": 12,
      "fair": 24,
      "full": 36
    },
    {
      "crop": "Kale",
      "kilos": 31,
      "mark": 30,
      "thin": 14,
      "fair": 26,
      "full": 40
    }
  ],
  "encoding": {
    "x": "crop",
    "y": "kilos",
    "target": "mark"
  },
  "mark": {
    "ranges": [
      "thin",
      "fair",
      "full"
    ]
  },
  "size": {
    "width": 880,
    "height": 240
  },
  "a11y": {
    "alt": "Marrow and kale are past their marks. Beet is still short."
  }
}
```

## Share of the baskets

Four crops.

```json
{
  "version": "1",
  "id": "marrow-share",
  "type": "donut",
  "theme": "soft",
  "data": [
    {
      "crop": "Marrow",
      "baskets": 86
    },
    {
      "crop": "Beet",
      "baskets": 40
    },
    {
      "crop": "Kale",
      "baskets": 54
    },
    {
      "crop": "Leek",
      "baskets": 32
    }
  ],
  "encoding": {
    "x": "crop",
    "y": "baskets"
  },
  "legend": {
    "position": "bottom",
    "values": true
  },
  "size": {
    "width": 520,
    "height": 340
  },
  "a11y": {
    "alt": "Marrow fills the largest share of baskets, then kale, beet, and leek."
  }
}
```

## Baskets, twelve weeks

Threshold colours: quiet under 6, busy from 12.

```json
{
  "version": "1",
  "id": "marrow-calendar",
  "type": "heatmap",
  "theme": "soft",
  "data": [
    {
      "day": "2026-04-06",
      "baskets": 1
    },
    {
      "day": "2026-04-07",
      "baskets": 9
    },
    {
      "day": "2026-04-08",
      "baskets": 1
    },
    {
      "day": "2026-04-09",
      "baskets": 9
    },
    {
      "day": "2026-04-10",
      "baskets": 5
    },
    {
      "day": "2026-04-11",
      "baskets": 13
    },
    {
      "day": "2026-04-12",
      "baskets": 5
    },
    {
      "day": "2026-04-13",
      "baskets": 13
    },
    {
      "day": "2026-04-14",
      "baskets": 9
    },
    {
      "day": "2026-04-15",
      "baskets": 1
    },
    {
      "day": "2026-04-16",
      "baskets": 9
    },
    {
      "day": "2026-04-17",
      "baskets": 1
    },
    {
      "day": "2026-04-18",
      "baskets": 13
    },
    {
      "day": "2026-04-19",
      "baskets": 5
    },
    {
      "day": "2026-04-20",
      "baskets": 13
    },
    {
      "day": "2026-04-21",
      "baskets": 5
    },
    {
      "day": "2026-04-22",
      "baskets": 1
    },
    {
      "day": "2026-04-23",
      "baskets": 9
    },
    {
      "day": "2026-04-24",
      "baskets": 1
    },
    {
      "day": "2026-04-25",
      "baskets": 9
    },
    {
      "day": "2026-04-26",
      "baskets": 5
    },
    {
      "day": "2026-04-27",
      "baskets": 13
    },
    {
      "day": "2026-04-28",
      "baskets": 5
    },
    {
      "day": "2026-04-29",
      "baskets": 13
    },
    {
      "day": "2026-04-30",
      "baskets": 9
    },
    {
      "day": "2026-05-01",
      "baskets": 1
    },
    {
      "day": "2026-05-02",
      "baskets": 9
    },
    {
      "day": "2026-05-03",
      "baskets": 1
    },
    {
      "day": "2026-05-04",
      "baskets": 13
    },
    {
      "day": "2026-05-05",
      "baskets": 5
    },
    {
      "day": "2026-05-06",
      "baskets": 13
    },
    {
      "day": "2026-05-07",
      "baskets": 5
    },
    {
      "day": "2026-05-08",
      "baskets": 1
    },
    {
      "day": "2026-05-09",
      "baskets": 9
    },
    {
      "day": "2026-05-10",
      "baskets": 1
    },
    {
      "day": "2026-05-11",
      "baskets": 9
    },
    {
      "day": "2026-05-12",
      "baskets": 5
    },
    {
      "day": "2026-05-13",
      "baskets": 13
    },
    {
      "day": "2026-05-14",
      "baskets": 5
    },
    {
      "day": "2026-05-15",
      "baskets": 13
    },
    {
      "day": "2026-05-16",
      "baskets": 9
    },
    {
      "day": "2026-05-17",
      "baskets": 1
    },
    {
      "day": "2026-05-18",
      "baskets": 9
    },
    {
      "day": "2026-05-19",
      "baskets": 1
    },
    {
      "day": "2026-05-20",
      "baskets": 13
    },
    {
      "day": "2026-05-21",
      "baskets": 5
    },
    {
      "day": "2026-05-22",
      "baskets": 13
    },
    {
      "day": "2026-05-23",
      "baskets": 5
    },
    {
      "day": "2026-05-24",
      "baskets": 1
    },
    {
      "day": "2026-05-25",
      "baskets": 9
    },
    {
      "day": "2026-05-26",
      "baskets": 1
    },
    {
      "day": "2026-05-27",
      "baskets": 9
    },
    {
      "day": "2026-05-28",
      "baskets": 5
    },
    {
      "day": "2026-05-29",
      "baskets": 13
    },
    {
      "day": "2026-05-30",
      "baskets": 5
    },
    {
      "day": "2026-05-31",
      "baskets": 13
    },
    {
      "day": "2026-06-01",
      "baskets": 9
    },
    {
      "day": "2026-06-02",
      "baskets": 1
    },
    {
      "day": "2026-06-03",
      "baskets": 9
    },
    {
      "day": "2026-06-04",
      "baskets": 1
    },
    {
      "day": "2026-06-05",
      "baskets": 13
    },
    {
      "day": "2026-06-06",
      "baskets": 5
    },
    {
      "day": "2026-06-07",
      "baskets": 13
    },
    {
      "day": "2026-06-08",
      "baskets": 5
    },
    {
      "day": "2026-06-09",
      "baskets": 1
    },
    {
      "day": "2026-06-10",
      "baskets": 9
    },
    {
      "day": "2026-06-11",
      "baskets": 1
    },
    {
      "day": "2026-06-12",
      "baskets": 9
    },
    {
      "day": "2026-06-13",
      "baskets": 5
    },
    {
      "day": "2026-06-14",
      "baskets": 13
    },
    {
      "day": "2026-06-15",
      "baskets": 5
    },
    {
      "day": "2026-06-16",
      "baskets": 13
    },
    {
      "day": "2026-06-17",
      "baskets": 9
    },
    {
      "day": "2026-06-18",
      "baskets": 1
    },
    {
      "day": "2026-06-19",
      "baskets": 9
    },
    {
      "day": "2026-06-20",
      "baskets": 1
    },
    {
      "day": "2026-06-21",
      "baskets": 13
    },
    {
      "day": "2026-06-22",
      "baskets": 5
    },
    {
      "day": "2026-06-23",
      "baskets": 13
    },
    {
      "day": "2026-06-24",
      "baskets": 5
    },
    {
      "day": "2026-06-25",
      "baskets": 1
    },
    {
      "day": "2026-06-26",
      "baskets": 9
    },
    {
      "day": "2026-06-27",
      "baskets": 1
    },
    {
      "day": "2026-06-28",
      "baskets": 9
    }
  ],
  "encoding": {
    "x": {
      "field": "day",
      "type": "temporal"
    },
    "color": {
      "field": "baskets",
      "title": "Baskets",
      "scale": {
        "type": "threshold",
        "thresholds": [
          6,
          12
        ]
      }
    }
  },
  "mark": {
    "layout": "calendar",
    "weeks": 12
  },
  "a11y": {
    "alt": "Basket counts run for twelve weeks from early April, split at 6 and 12."
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
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Number formatting options](https://chartkit.dev/features/format.number) (`format.number`)
- [Data label position](https://chartkit.dev/features/label.position) (`label.position`)
- [Data labels on marks](https://chartkit.dev/features/label.show) (`label.show`)
- [Margins / padding](https://chartkit.dev/features/layout.margin) (`layout.margin`)
- [Continuous colour legend / colour bar](https://chartkit.dev/features/legend.continuous) (`legend.continuous`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Values in legend](https://chartkit.dev/features/legend.values) (`legend.values`)
- [Quantize / threshold / quantile scales](https://chartkit.dev/features/scale.quantize) (`scale.quantize`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Custom tooltip fields](https://chartkit.dev/features/tooltip.fields) (`tooltip.fields`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Column / vertical bar](https://chartkit.dev/features/type.bar.vertical) (`type.bar.vertical`)
- [Bullet chart](https://chartkit.dev/features/type.bullet) (`type.bullet`)
- [Donut chart](https://chartkit.dev/features/type.donut) (`type.donut`)
- [Calendar heatmap](https://chartkit.dev/features/type.heatmap.calendar) (`type.heatmap.calendar`)
- [KPI / big number card](https://chartkit.dev/features/type.kpi) (`type.kpi`)
- [Line chart](https://chartkit.dev/features/type.line) (`type.line`)

https://chartkit.dev/showcase/garden
