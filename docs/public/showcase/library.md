# Library lending year

A fictional town library. Shelf loans are a pie with leader lines, branch names wrap, and sixteen weeks of holds fill a calendar.

## Loans by shelf

A real pie. Names sit outside the slices on leader lines, in a palette set on this chart.

```json
{
  "version": "1",
  "id": "library-shelves",
  "type": "pie",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "shelf": "Folio",
      "loans": 840
    },
    {
      "shelf": "Atlas",
      "loans": 310
    },
    {
      "shelf": "Verse",
      "loans": 460
    },
    {
      "shelf": "Cookery",
      "loans": 520
    },
    {
      "shelf": "Scores",
      "loans": 190
    },
    {
      "shelf": "Maps",
      "loans": 260
    }
  ],
  "encoding": {
    "x": "shelf",
    "y": "loans"
  },
  "mark": {
    "labels": true,
    "labelPosition": "outside",
    "palette": [
      "#0f6e56",
      "#c45c26",
      "#1d4e89",
      "#a15c38",
      "#5b4b8a",
      "#8a6a2f"
    ]
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "loans",
        "title": "Loans"
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 560,
    "height": 440
  },
  "a11y": {
    "alt": "Folio is the largest shelf of loans, then cookery and verse. Scores is the smallest."
  }
}
```

## Loans by branch

Long branch names wrap instead of colliding. The number sits at the end of each bar.

```json
{
  "version": "1",
  "id": "library-branches",
  "type": "bar",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "branch": "Old Quay Reading Room",
      "loans": 980
    },
    {
      "branch": "Hill School Cupboard",
      "loans": 640
    },
    {
      "branch": "Lantern Annex",
      "loans": 720
    },
    {
      "branch": "Mill Lane Stacks",
      "loans": 540
    }
  ],
  "encoding": {
    "x": "branch",
    "y": "loans"
  },
  "mark": {
    "orientation": "horizontal",
    "labels": true,
    "labelPosition": "right"
  },
  "axes": {
    "x": {
      "title": "Branch",
      "labelWidth": 96,
      "labelLines": 2
    },
    "y": {
      "title": "Loans"
    }
  },
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "loans",
        "title": "Loans"
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 560,
    "height": 440,
    "padding": {
      "left": 120
    }
  },
  "a11y": {
    "alt": "The Old Quay Reading Room lent the most. Mill Lane Stacks lent the least of the four branches."
  }
}
```

## Holds across sixteen weeks

One cell per day.

```json
{
  "version": "1",
  "id": "library-holds",
  "type": "heatmap",
  "theme": "soft",
  "data": [
    {
      "day": "2026-01-05",
      "holds": 4
    },
    {
      "day": "2026-01-06",
      "holds": 12
    },
    {
      "day": "2026-01-07",
      "holds": 20
    },
    {
      "day": "2026-01-08",
      "holds": 10
    },
    {
      "day": "2026-01-09",
      "holds": 18
    },
    {
      "day": "2026-01-10",
      "holds": 8
    },
    {
      "day": "2026-01-11",
      "holds": 16
    },
    {
      "day": "2026-01-12",
      "holds": 6
    },
    {
      "day": "2026-01-13",
      "holds": 14
    },
    {
      "day": "2026-01-14",
      "holds": 4
    },
    {
      "day": "2026-01-15",
      "holds": 12
    },
    {
      "day": "2026-01-16",
      "holds": 20
    },
    {
      "day": "2026-01-17",
      "holds": 10
    },
    {
      "day": "2026-01-18",
      "holds": 18
    },
    {
      "day": "2026-01-19",
      "holds": 8
    },
    {
      "day": "2026-01-20",
      "holds": 16
    },
    {
      "day": "2026-01-21",
      "holds": 6
    },
    {
      "day": "2026-01-22",
      "holds": 14
    },
    {
      "day": "2026-01-23",
      "holds": 4
    },
    {
      "day": "2026-01-24",
      "holds": 12
    },
    {
      "day": "2026-01-25",
      "holds": 20
    },
    {
      "day": "2026-01-26",
      "holds": 10
    },
    {
      "day": "2026-01-27",
      "holds": 18
    },
    {
      "day": "2026-01-28",
      "holds": 8
    },
    {
      "day": "2026-01-29",
      "holds": 16
    },
    {
      "day": "2026-01-30",
      "holds": 6
    },
    {
      "day": "2026-01-31",
      "holds": 14
    },
    {
      "day": "2026-02-01",
      "holds": 4
    },
    {
      "day": "2026-02-02",
      "holds": 12
    },
    {
      "day": "2026-02-03",
      "holds": 20
    },
    {
      "day": "2026-02-04",
      "holds": 10
    },
    {
      "day": "2026-02-05",
      "holds": 18
    },
    {
      "day": "2026-02-06",
      "holds": 8
    },
    {
      "day": "2026-02-07",
      "holds": 16
    },
    {
      "day": "2026-02-08",
      "holds": 6
    },
    {
      "day": "2026-02-09",
      "holds": 14
    },
    {
      "day": "2026-02-10",
      "holds": 4
    },
    {
      "day": "2026-02-11",
      "holds": 12
    },
    {
      "day": "2026-02-12",
      "holds": 20
    },
    {
      "day": "2026-02-13",
      "holds": 10
    },
    {
      "day": "2026-02-14",
      "holds": 18
    },
    {
      "day": "2026-02-15",
      "holds": 8
    },
    {
      "day": "2026-02-16",
      "holds": 16
    },
    {
      "day": "2026-02-17",
      "holds": 6
    },
    {
      "day": "2026-02-18",
      "holds": 14
    },
    {
      "day": "2026-02-19",
      "holds": 4
    },
    {
      "day": "2026-02-20",
      "holds": 12
    },
    {
      "day": "2026-02-21",
      "holds": 20
    },
    {
      "day": "2026-02-22",
      "holds": 10
    },
    {
      "day": "2026-02-23",
      "holds": 18
    },
    {
      "day": "2026-02-24",
      "holds": 8
    },
    {
      "day": "2026-02-25",
      "holds": 16
    },
    {
      "day": "2026-02-26",
      "holds": 6
    },
    {
      "day": "2026-02-27",
      "holds": 14
    },
    {
      "day": "2026-02-28",
      "holds": 4
    },
    {
      "day": "2026-03-01",
      "holds": 12
    },
    {
      "day": "2026-03-02",
      "holds": 20
    },
    {
      "day": "2026-03-03",
      "holds": 10
    },
    {
      "day": "2026-03-04",
      "holds": 18
    },
    {
      "day": "2026-03-05",
      "holds": 8
    },
    {
      "day": "2026-03-06",
      "holds": 16
    },
    {
      "day": "2026-03-07",
      "holds": 6
    },
    {
      "day": "2026-03-08",
      "holds": 14
    },
    {
      "day": "2026-03-09",
      "holds": 4
    },
    {
      "day": "2026-03-10",
      "holds": 12
    },
    {
      "day": "2026-03-11",
      "holds": 20
    },
    {
      "day": "2026-03-12",
      "holds": 10
    },
    {
      "day": "2026-03-13",
      "holds": 18
    },
    {
      "day": "2026-03-14",
      "holds": 8
    },
    {
      "day": "2026-03-15",
      "holds": 16
    },
    {
      "day": "2026-03-16",
      "holds": 6
    },
    {
      "day": "2026-03-17",
      "holds": 14
    },
    {
      "day": "2026-03-18",
      "holds": 4
    },
    {
      "day": "2026-03-19",
      "holds": 12
    },
    {
      "day": "2026-03-20",
      "holds": 20
    },
    {
      "day": "2026-03-21",
      "holds": 10
    },
    {
      "day": "2026-03-22",
      "holds": 18
    },
    {
      "day": "2026-03-23",
      "holds": 8
    },
    {
      "day": "2026-03-24",
      "holds": 16
    },
    {
      "day": "2026-03-25",
      "holds": 6
    },
    {
      "day": "2026-03-26",
      "holds": 14
    },
    {
      "day": "2026-03-27",
      "holds": 4
    },
    {
      "day": "2026-03-28",
      "holds": 12
    },
    {
      "day": "2026-03-29",
      "holds": 20
    },
    {
      "day": "2026-03-30",
      "holds": 10
    },
    {
      "day": "2026-03-31",
      "holds": 18
    },
    {
      "day": "2026-04-01",
      "holds": 8
    },
    {
      "day": "2026-04-02",
      "holds": 16
    },
    {
      "day": "2026-04-03",
      "holds": 6
    },
    {
      "day": "2026-04-04",
      "holds": 14
    },
    {
      "day": "2026-04-05",
      "holds": 4
    },
    {
      "day": "2026-04-06",
      "holds": 12
    },
    {
      "day": "2026-04-07",
      "holds": 20
    },
    {
      "day": "2026-04-08",
      "holds": 10
    },
    {
      "day": "2026-04-09",
      "holds": 18
    },
    {
      "day": "2026-04-10",
      "holds": 8
    },
    {
      "day": "2026-04-11",
      "holds": 16
    },
    {
      "day": "2026-04-12",
      "holds": 6
    },
    {
      "day": "2026-04-13",
      "holds": 14
    },
    {
      "day": "2026-04-14",
      "holds": 4
    },
    {
      "day": "2026-04-15",
      "holds": 12
    },
    {
      "day": "2026-04-16",
      "holds": 20
    },
    {
      "day": "2026-04-17",
      "holds": 10
    },
    {
      "day": "2026-04-18",
      "holds": 18
    },
    {
      "day": "2026-04-19",
      "holds": 8
    },
    {
      "day": "2026-04-20",
      "holds": 16
    },
    {
      "day": "2026-04-21",
      "holds": 6
    },
    {
      "day": "2026-04-22",
      "holds": 14
    },
    {
      "day": "2026-04-23",
      "holds": 4
    },
    {
      "day": "2026-04-24",
      "holds": 12
    },
    {
      "day": "2026-04-25",
      "holds": 20
    },
    {
      "day": "2026-04-26",
      "holds": 10
    }
  ],
  "encoding": {
    "x": {
      "field": "day",
      "type": "temporal",
      "title": "Day"
    },
    "color": {
      "field": "holds",
      "title": "Holds"
    }
  },
  "mark": {
    "layout": "calendar",
    "weeks": 16
  },
  "size": {
    "width": 980,
    "height": 340
  },
  "a11y": {
    "alt": "Daily holds over sixteen weeks stay in a band from a quiet day to a busy day, with no empty week."
  }
}
```

## Out now

A count and a short sparkline.

```json
{
  "version": "1",
  "id": "library-out",
  "type": "kpi",
  "theme": "soft",
  "locale": "en-GB",
  "metric": {
    "label": "Out now",
    "value": 1280,
    "delta": 0.04,
    "format": {
      "style": "compact",
      "decimals": 1
    }
  },
  "data": [
    40,
    42,
    38,
    44,
    41,
    46,
    45
  ],
  "size": {
    "width": 420,
    "height": 240
  },
  "a11y": {
    "alt": "1.3 thousand items are out, up 4 percent, and the week ends higher than it starts."
  }
}
```

## Holds this week

A mini area, still with axes.

```json
{
  "version": "1",
  "id": "library-daily",
  "type": "mini-area",
  "theme": "soft",
  "data": [
    18,
    22,
    16,
    25,
    21,
    14,
    19
  ],
  "size": {
    "width": 640,
    "height": 200
  },
  "a11y": {
    "alt": "Holds peak midweek and dip before the last day."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Tick label wrapping / truncation](https://chartkit.dev/features/axis.ticks.wrap) (`axis.ticks.wrap`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Compact / SI number abbreviations](https://chartkit.dev/features/format.compact) (`format.compact`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Click events on marks](https://chartkit.dev/features/interaction.click) (`interaction.click`)
- [Selection (point / multi / series)](https://chartkit.dev/features/interaction.select) (`interaction.select`)
- [Pie slice labels / leader lines](https://chartkit.dev/features/label.pie) (`label.pie`)
- [Data label position](https://chartkit.dev/features/label.position) (`label.position`)
- [Data labels on marks](https://chartkit.dev/features/label.show) (`label.show`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Custom colour palette](https://chartkit.dev/features/theme.palette) (`theme.palette`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Custom tooltip fields](https://chartkit.dev/features/tooltip.fields) (`tooltip.fields`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Area chart](https://chartkit.dev/features/type.area) (`type.area`)
- [Horizontal bar](https://chartkit.dev/features/type.bar.horizontal) (`type.bar.horizontal`)
- [Calendar heatmap](https://chartkit.dev/features/type.heatmap.calendar) (`type.heatmap.calendar`)
- [KPI / big number card](https://chartkit.dev/features/type.kpi) (`type.kpi`)
- [Pie chart](https://chartkit.dev/features/type.pie) (`type.pie`)

https://chartkit.dev/showcase/library
