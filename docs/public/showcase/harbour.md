# Harbour freight desk

A synthetic container index for the port of Greywick, then the pounds of one voyage from open to close. Hover a step, or click it to mark it.

## Greywick container index

Twelve sessions of a fictional index, with volume underneath. Not a listed ticker.

```json
{
  "version": "1",
  "id": "harbour-index",
  "type": "candlestick",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "day": "2026-03-02",
      "open": 102,
      "high": 108,
      "low": 99,
      "close": 106,
      "volume": 420
    },
    {
      "day": "2026-03-03",
      "open": 106,
      "high": 110,
      "low": 104,
      "close": 105,
      "volume": 380
    },
    {
      "day": "2026-03-04",
      "open": 105,
      "high": 107,
      "low": 98,
      "close": 100,
      "volume": 510
    },
    {
      "day": "2026-03-05",
      "open": 100,
      "high": 104,
      "low": 96,
      "close": 103,
      "volume": 460
    },
    {
      "day": "2026-03-06",
      "open": 103,
      "high": 112,
      "low": 102,
      "close": 111,
      "volume": 540
    },
    {
      "day": "2026-03-09",
      "open": 111,
      "high": 114,
      "low": 107,
      "close": 109,
      "volume": 390
    },
    {
      "day": "2026-03-10",
      "open": 109,
      "high": 111,
      "low": 101,
      "close": 102,
      "volume": 610
    },
    {
      "day": "2026-03-11",
      "open": 102,
      "high": 106,
      "low": 100,
      "close": 105,
      "volume": 440
    },
    {
      "day": "2026-03-12",
      "open": 105,
      "high": 109,
      "low": 103,
      "close": 108,
      "volume": 400
    },
    {
      "day": "2026-03-13",
      "open": 108,
      "high": 116,
      "low": 107,
      "close": 115,
      "volume": 580
    },
    {
      "day": "2026-03-16",
      "open": 115,
      "high": 117,
      "low": 110,
      "close": 112,
      "volume": 470
    },
    {
      "day": "2026-03-17",
      "open": 112,
      "high": 113,
      "low": 106,
      "close": 107,
      "volume": 520
    }
  ],
  "encoding": {
    "x": {
      "field": "day",
      "type": "temporal"
    },
    "open": "open",
    "high": "high",
    "low": "low",
    "close": "close",
    "volume": "volume"
  },
  "axes": {
    "x": {
      "title": "Session"
    },
    "y": {
      "title": "Index"
    }
  },
  "tooltip": {
    "position": "top"
  },
  "size": {
    "width": 980,
    "height": 460
  },
  "a11y": {
    "alt": "The fictional Greywick index rises from about 102 to a high near 117, then closes the last session lower."
  }
}
```

## One voyage, step by step

Hover a bar for the amount. Click it to mark that step.

```json
{
  "version": "1",
  "id": "harbour-voyage",
  "type": "waterfall",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "step": "Open",
      "amount": 8400,
      "total": true
    },
    {
      "step": "Crane",
      "amount": 2100
    },
    {
      "step": "Berth",
      "amount": 1600
    },
    {
      "step": "Cloth",
      "amount": -900
    },
    {
      "step": "Close",
      "amount": 11200,
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
      "title": "Step"
    },
    "y": {
      "title": "Pounds"
    }
  },
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "amount",
        "title": "Amount",
        "format": {
          "style": "currency",
          "currency": "GBP",
          "decimals": 0
        }
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 720,
    "height": 380
  },
  "a11y": {
    "alt": "The voyage opens at 8,400 pounds. Crane and berth add, cloth subtracts, and the close is 11,200."
  }
}
```

## Close

The last step, as a figure.

```json
{
  "version": "1",
  "id": "harbour-close",
  "type": "kpi",
  "theme": "soft",
  "locale": "en-GB",
  "metric": {
    "label": "Close",
    "value": 11200,
    "delta": 0.33,
    "format": {
      "style": "currency",
      "currency": "GBP",
      "decimals": 0
    }
  },
  "data": [
    8.4,
    10.5,
    12.1,
    11.2,
    11.2
  ],
  "size": {
    "width": 420,
    "height": 240
  },
  "a11y": {
    "alt": "The voyage closes at 11,200 pounds, up 33 percent from the open."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Number formatting options](https://chartkit.dev/features/format.number) (`format.number`)
- [Click events on marks](https://chartkit.dev/features/interaction.click) (`interaction.click`)
- [Selection (point / multi / series)](https://chartkit.dev/features/interaction.select) (`interaction.select`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Custom tooltip fields](https://chartkit.dev/features/tooltip.fields) (`tooltip.fields`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Waterfall](https://chartkit.dev/features/type.bar.waterfall) (`type.bar.waterfall`)
- [Candlestick](https://chartkit.dev/features/type.candlestick) (`type.candlestick`)
- [Volume pane / multiple panes](https://chartkit.dev/features/type.finance.volume) (`type.finance.volume`)
- [KPI / big number card](https://chartkit.dev/features/type.kpi) (`type.kpi`)

https://chartkit.dev/showcase/harbour
