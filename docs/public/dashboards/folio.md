# Robinhood-style portfolio

A fictional holding for 15 September–4 October.

Range: 15 Sep–4 Oct.

Styled after Robinhood and Coinbase to show ChartKit's styling flexibility. Not affiliated with or endorsed by Robinhood or Coinbase.

Default theme: soft.

## Price

Daily open, high, low, and close.

type candlestick. Rising sessions use the positive token. Falling sessions use the negative token. headline draws the last close.

```json
{
  "version": "1",
  "type": "candlestick",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#111111",
      "muted": "#6b6b6b",
      "grid": "#ececec",
      "axis": "#d0d0d0",
      "accent": "#00c805",
      "positive": "#00c805",
      "negative": "#ff5000",
      "series": [
        "#00c805",
        "#111111"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-09-15",
      "open": 126.87,
      "high": 129.47,
      "low": 125.77,
      "close": 128.07
    },
    {
      "date": "2025-09-16",
      "open": 128.07,
      "high": 132.8,
      "low": 126.97,
      "close": 131.4
    },
    {
      "date": "2025-09-17",
      "open": 131.4,
      "high": 133.81,
      "low": 130.3,
      "close": 132.41
    },
    {
      "date": "2025-09-18",
      "open": 132.41,
      "high": 135.8,
      "low": 131.31,
      "close": 134.4
    },
    {
      "date": "2025-09-19",
      "open": 134.4,
      "high": 135.8,
      "low": 128.07,
      "close": 129.17000000000002
    },
    {
      "date": "2025-09-20",
      "open": 129.17,
      "high": 134.1,
      "low": 128.07,
      "close": 132.7
    },
    {
      "date": "2025-09-21",
      "open": 132.7,
      "high": 136.9,
      "low": 131.6,
      "close": 135.5
    },
    {
      "date": "2025-09-22",
      "open": 135.5,
      "high": 138.88,
      "low": 134.4,
      "close": 137.48
    },
    {
      "date": "2025-09-23",
      "open": 137.48,
      "high": 143.94,
      "low": 136.38,
      "close": 142.54
    },
    {
      "date": "2025-09-24",
      "open": 142.54,
      "high": 146.48,
      "low": 141.44,
      "close": 145.08
    },
    {
      "date": "2025-09-25",
      "open": 145.08,
      "high": 149.68,
      "low": 143.98,
      "close": 148.28
    },
    {
      "date": "2025-09-26",
      "open": 148.28,
      "high": 152.94,
      "low": 147.18,
      "close": 151.54
    },
    {
      "date": "2025-09-27",
      "open": 151.54,
      "high": 152.94,
      "low": 145.7,
      "close": 146.8
    },
    {
      "date": "2025-09-28",
      "open": 146.8,
      "high": 148.2,
      "low": 144.29,
      "close": 145.39000000000001
    },
    {
      "date": "2025-09-29",
      "open": 145.39,
      "high": 149.39,
      "low": 144.29,
      "close": 147.99
    },
    {
      "date": "2025-09-30",
      "open": 147.99,
      "high": 157.27,
      "low": 146.89,
      "close": 155.87
    },
    {
      "date": "2025-10-01",
      "open": 155.87,
      "high": 157.27,
      "low": 153.75,
      "close": 154.85
    },
    {
      "date": "2025-10-02",
      "open": 154.85,
      "high": 156.29,
      "low": 153.75,
      "close": 154.89000000000001
    },
    {
      "date": "2025-10-03",
      "open": 154.89,
      "high": 156.29,
      "low": 151.32,
      "close": 152.42000000000002
    },
    {
      "date": "2025-10-04",
      "open": 152.42,
      "high": 153.82,
      "low": 149.3,
      "close": 150.4
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "open": "open",
    "high": "high",
    "low": "low",
    "close": "close"
  },
  "axes": {
    "x": {
      "grid": false,
      "ticks": "ends"
    },
    "y": {
      "title": "",
      "grid": true
    }
  },
  "legend": {
    "show": false
  },
  "headline": {
    "label": "Last close",
    "value": "$156",
    "compare": "$128",
    "delta": "+22%",
    "tone": "positive"
  },
  "size": {
    "width": 720,
    "height": 320
  },
  "a11y": {
    "alt": "The close rises from 128 to 156 across the twenty sessions."
  }
}
```

## Volume

Daily volume, fictional units.

type bar. One series in the ink token. No axis title.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#111111",
      "muted": "#6b6b6b",
      "grid": "#ececec",
      "axis": "#d0d0d0",
      "accent": "#00c805",
      "positive": "#00c805",
      "negative": "#ff5000",
      "series": [
        "#111111"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-09-15",
      "volume": 47
    },
    {
      "date": "2025-09-16",
      "volume": 47
    },
    {
      "date": "2025-09-17",
      "volume": 50
    },
    {
      "date": "2025-09-18",
      "volume": 43
    },
    {
      "date": "2025-09-19",
      "volume": 38
    },
    {
      "date": "2025-09-20",
      "volume": 41
    },
    {
      "date": "2025-09-21",
      "volume": 46
    },
    {
      "date": "2025-09-22",
      "volume": 69
    },
    {
      "date": "2025-09-23",
      "volume": 68
    },
    {
      "date": "2025-09-24",
      "volume": 56
    },
    {
      "date": "2025-09-25",
      "volume": 46
    },
    {
      "date": "2025-09-26",
      "volume": 48
    },
    {
      "date": "2025-09-27",
      "volume": 57
    },
    {
      "date": "2025-09-28",
      "volume": 60
    },
    {
      "date": "2025-09-29",
      "volume": 70
    },
    {
      "date": "2025-09-30",
      "volume": 73
    },
    {
      "date": "2025-10-01",
      "volume": 70
    },
    {
      "date": "2025-10-02",
      "volume": 64
    },
    {
      "date": "2025-10-03",
      "volume": 63
    },
    {
      "date": "2025-10-04",
      "volume": 55
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": {
      "field": "volume"
    }
  },
  "axes": {
    "x": {
      "grid": false,
      "ticks": 4
    },
    "y": {
      "title": "",
      "labels": false,
      "grid": false
    }
  },
  "legend": {
    "show": false
  },
  "mark": {
    "gap": 0.35,
    "cornerRadius": 2
  },
  "size": {
    "width": 320,
    "height": 320
  },
  "a11y": {
    "alt": "Volume is uneven and higher toward the end of the period."
  }
}
```

## Value

Portfolio value.

type kpi.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#111111",
      "muted": "#6b6b6b",
      "grid": "transparent",
      "axis": "#d0d0d0",
      "accent": "#00c805",
      "positive": "#00c805",
      "negative": "#ff5000",
      "series": [
        "#00c805",
        "#111111"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    128.07,
    131.4,
    132.41,
    134.4,
    129.17000000000002,
    132.7,
    135.5,
    137.48,
    142.54,
    145.08,
    148.28,
    151.54,
    146.8,
    145.39000000000001,
    147.99,
    155.87,
    154.85,
    154.89000000000001,
    152.42000000000002,
    150.4
  ],
  "metric": {
    "label": "Value",
    "value": 18420,
    "delta": 0.06,
    "format": {
      "style": "compact",
      "prefix": "$"
    }
  },
  "mark": {
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 320,
    "height": 96
  },
  "a11y": {
    "alt": "Portfolio value is 18.4 thousand dollars, up 6 percent."
  }
}
```

## Cash

Cash balance.

type kpi.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#111111",
      "muted": "#6b6b6b",
      "grid": "transparent",
      "axis": "#d0d0d0",
      "accent": "#00c805",
      "positive": "#00c805",
      "negative": "#ff5000",
      "series": [
        "#00c805",
        "#111111"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    4200,
    4100,
    4300,
    4000,
    3900,
    4050
  ],
  "metric": {
    "label": "Cash",
    "value": 4050,
    "delta": -0.02,
    "format": {
      "style": "compact",
      "prefix": "$"
    }
  },
  "mark": {
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 320,
    "height": 96
  },
  "a11y": {
    "alt": "Cash is 4,050 dollars, down 2 percent."
  }
}
```

## Today

Day change.

type kpi. The delta is the day change.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#111111",
      "muted": "#6b6b6b",
      "grid": "transparent",
      "axis": "#d0d0d0",
      "accent": "#00c805",
      "positive": "#00c805",
      "negative": "#ff5000",
      "series": [
        "#00c805",
        "#111111"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    146.8,
    145.39000000000001,
    147.99,
    155.87,
    154.85,
    154.89000000000001,
    152.42000000000002,
    150.4
  ],
  "metric": {
    "label": "Today",
    "value": 2.4,
    "delta": 0.016,
    "format": {
      "style": "number",
      "prefix": "$",
      "decimals": 2
    }
  },
  "mark": {
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 320,
    "height": 96
  },
  "a11y": {
    "alt": "Today is up 2.40 dollars, 1.6 percent."
  }
}
```

## Holdings

Share of the portfolio.

type bar-list, mark.track row. Names are generic. The label and amount use the text token: near-black on Soft, white on Midnight.

```json
{
  "version": "1",
  "type": "bar-list",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#0a0a0a",
      "muted": "#6b6b6b",
      "grid": "#ececec",
      "axis": "#d0d0d0",
      "accent": "#00c805",
      "positive": "#00c805",
      "negative": "#ff5000",
      "series": [
        "#00c805",
        "#111111"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "name": "Broad fund",
      "amount": 8200
    },
    {
      "name": "North index",
      "amount": 5400
    },
    {
      "name": "Cash",
      "amount": 4050
    },
    {
      "name": "Bond sleeve",
      "amount": 770
    }
  ],
  "encoding": {
    "x": "name",
    "y": {
      "field": "amount",
      "format": {
        "style": "compact",
        "prefix": "$"
      }
    }
  },
  "mark": {
    "track": "row"
  },
  "size": {
    "width": 640,
    "height": 148
  },
  "a11y": {
    "alt": "The broad fund is the largest holding, then the north index, cash, and a bond sleeve."
  }
}
```

## What produces this look

- **Price.** A candlestick uses positive #00c805 and negative #ff5000. headline shows the last close. Volume is a separate bar chart, because a volume subplot under the candles is not one spec.
- **Type.** fontFamily is Inter. The shell is white with black ink. Midnight swaps to #1c1c1e. No wordmark and no mark icon.
- **Data.** The sessions and holdings are generated. They are not a market.

https://chartkit.dev/dashboards/folio
