# Brine market, twelve mornings

A fictional quayside market. Twelve mornings of crates, split by row, stall, and good in the treemap. The lines are those same mornings, one series per row.

## Where the crates sat

Quay is 640 crates, Hill 560, Lane 480. Oats is the largest single good.

```json
{
  "version": "1",
  "id": "brine-market-stalls",
  "type": "treemap",
  "title": "Crates in the market",
  "subtitle": "Row, stall, then good.",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "name": "Quay",
      "children": [
        {
          "name": "Salt",
          "children": [
            {
              "name": "Oats",
              "value": 200
            },
            {
              "name": "Honey",
              "value": 160
            }
          ]
        },
        {
          "name": "Kelp",
          "children": [
            {
              "name": "Bread",
              "value": 160
            },
            {
              "name": "Cheese",
              "value": 120
            }
          ]
        }
      ]
    },
    {
      "name": "Hill",
      "children": [
        {
          "name": "Wool",
          "children": [
            {
              "name": "Yarn",
              "value": 180
            },
            {
              "name": "Felt",
              "value": 140
            }
          ]
        },
        {
          "name": "Tin",
          "children": [
            {
              "name": "Spoons",
              "value": 140
            },
            {
              "name": "Lamps",
              "value": 100
            }
          ]
        }
      ]
    },
    {
      "name": "Lane",
      "children": [
        {
          "name": "Paper",
          "children": [
            {
              "name": "Cards",
              "value": 150
            },
            {
              "name": "Maps",
              "value": 120
            }
          ]
        },
        {
          "name": "Ink",
          "children": [
            {
              "name": "Black",
              "value": 120
            },
            {
              "name": "Red",
              "value": 90
            }
          ]
        }
      ]
    }
  ],
  "encoding": {
    "x": "name",
    "y": {
      "field": "value",
      "title": "Crates",
      "format": {
        "style": "number"
      }
    }
  },
  "legend": {
    "position": "bottom"
  },
  "size": {
    "width": 560,
    "height": 620
  },
  "a11y": {
    "alt": "1,680 crates across Quay, Hill, and Lane. Oats at the Salt stall is the largest good, at 200 crates."
  }
}
```

## The same crates, by morning

Morning 6 is Quay's busiest, at 72. Lane climbs toward the end of the twelve.

```json
{
  "version": "1",
  "id": "brine-market-mornings",
  "type": "line",
  "title": "Crates each morning",
  "subtitle": "Quay, Hill, and Lane.",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "morning": "1",
      "quay": 48,
      "hill": 36,
      "lane": 28
    },
    {
      "morning": "2",
      "quay": 52,
      "hill": 40,
      "lane": 32
    },
    {
      "morning": "3",
      "quay": 44,
      "hill": 38,
      "lane": 30
    },
    {
      "morning": "4",
      "quay": 60,
      "hill": 48,
      "lane": 36
    },
    {
      "morning": "5",
      "quay": 58,
      "hill": 44,
      "lane": 40
    },
    {
      "morning": "6",
      "quay": 72,
      "hill": 56,
      "lane": 48
    },
    {
      "morning": "7",
      "quay": 66,
      "hill": 52,
      "lane": 44
    },
    {
      "morning": "8",
      "quay": 50,
      "hill": 42,
      "lane": 34
    },
    {
      "morning": "9",
      "quay": 46,
      "hill": 46,
      "lane": 38
    },
    {
      "morning": "10",
      "quay": 54,
      "hill": 50,
      "lane": 42
    },
    {
      "morning": "11",
      "quay": 42,
      "hill": 58,
      "lane": 52
    },
    {
      "morning": "12",
      "quay": 48,
      "hill": 50,
      "lane": 56
    }
  ],
  "encoding": {
    "x": {
      "field": "morning",
      "title": "Morning"
    },
    "y": [
      {
        "field": "quay",
        "title": "Quay",
        "scale": {
          "domain": [
            0,
            90
          ],
          "nice": false
        }
      },
      {
        "field": "hill",
        "title": "Hill"
      },
      {
        "field": "lane",
        "title": "Lane"
      }
    ]
  },
  "mark": {
    "curve": "monotone",
    "points": "always"
  },
  "axes": {
    "x": {
      "title": "Morning"
    },
    "y": {
      "title": "Crates",
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
    "position": "top",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top"
  },
  "annotations": [
    {
      "type": "marker",
      "x": "6",
      "y": 72,
      "label": "Quay peak",
      "dx": 12,
      "dy": -28
    }
  ],
  "size": {
    "width": 560,
    "height": 480
  },
  "a11y": {
    "alt": "Quay leads most mornings and peaks at 72 on morning 6. Hill stays in the middle. Lane starts near 28 and finishes at 56."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Point marker / callout](https://chartkit.dev/features/annotation.marker) (`annotation.marker`)
- [Explicit tick values](https://chartkit.dev/features/axis.ticks.values) (`axis.ticks.values`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Hierarchical data input](https://chartkit.dev/features/data.hierarchy) (`data.hierarchy`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Number formatting options](https://chartkit.dev/features/format.number) (`format.number`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Show markers always / on hover / never](https://chartkit.dev/features/mark.point.visibility) (`mark.point.visibility`)
- [Explicit domain (min/max)](https://chartkit.dev/features/scale.domain) (`scale.domain`)
- [Nice rounding](https://chartkit.dev/features/scale.nice) (`scale.nice`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Line chart](https://chartkit.dev/features/type.line) (`type.line`)
- [Smoothed / spline line](https://chartkit.dev/features/type.line.smooth) (`type.line.smooth`)
- [Treemap](https://chartkit.dev/features/type.treemap) (`type.treemap`)

https://chartkit.dev/showcase/brine-market
