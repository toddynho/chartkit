# Robinhood-style portfolio

A fictional holding for 15 September–4 October.

Range: 15 Sep–4 Oct.

Styled after Robinhood and Coinbase to show ChartKit's styling flexibility. Not affiliated with or endorsed by Robinhood or Coinbase.

Default theme: soft.

## Price

Daily open, high, low, and close.

type candlestick. Rising sessions use the positive token. Falling sessions use the negative token. encoding.volume draws the bars under the candles. headline draws the last close.

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
      "close": 128.07,
      "volume": 47
    },
    {
      "date": "2025-09-16",
      "open": 128.07,
      "high": 132.8,
      "low": 126.97,
      "close": 131.4,
      "volume": 47
    },
    {
      "date": "2025-09-17",
      "open": 131.4,
      "high": 133.81,
      "low": 130.3,
      "close": 132.41,
      "volume": 50
    },
    {
      "date": "2025-09-18",
      "open": 132.41,
      "high": 135.8,
      "low": 131.31,
      "close": 134.4,
      "volume": 43
    },
    {
      "date": "2025-09-19",
      "open": 134.4,
      "high": 135.8,
      "low": 128.07,
      "close": 129.17000000000002,
      "volume": 38
    },
    {
      "date": "2025-09-20",
      "open": 129.17,
      "high": 134.1,
      "low": 128.07,
      "close": 132.7,
      "volume": 41
    },
    {
      "date": "2025-09-21",
      "open": 132.7,
      "high": 136.9,
      "low": 131.6,
      "close": 135.5,
      "volume": 46
    },
    {
      "date": "2025-09-22",
      "open": 135.5,
      "high": 138.88,
      "low": 134.4,
      "close": 137.48,
      "volume": 69
    },
    {
      "date": "2025-09-23",
      "open": 137.48,
      "high": 143.94,
      "low": 136.38,
      "close": 142.54,
      "volume": 68
    },
    {
      "date": "2025-09-24",
      "open": 142.54,
      "high": 146.48,
      "low": 141.44,
      "close": 145.08,
      "volume": 56
    },
    {
      "date": "2025-09-25",
      "open": 145.08,
      "high": 149.68,
      "low": 143.98,
      "close": 148.28,
      "volume": 46
    },
    {
      "date": "2025-09-26",
      "open": 148.28,
      "high": 152.94,
      "low": 147.18,
      "close": 151.54,
      "volume": 48
    },
    {
      "date": "2025-09-27",
      "open": 151.54,
      "high": 152.94,
      "low": 145.7,
      "close": 146.8,
      "volume": 57
    },
    {
      "date": "2025-09-28",
      "open": 146.8,
      "high": 148.2,
      "low": 144.29,
      "close": 145.39000000000001,
      "volume": 60
    },
    {
      "date": "2025-09-29",
      "open": 145.39,
      "high": 149.39,
      "low": 144.29,
      "close": 147.99,
      "volume": 70
    },
    {
      "date": "2025-09-30",
      "open": 147.99,
      "high": 157.27,
      "low": 146.89,
      "close": 155.87,
      "volume": 73
    },
    {
      "date": "2025-10-01",
      "open": 155.87,
      "high": 157.27,
      "low": 153.75,
      "close": 154.85,
      "volume": 70
    },
    {
      "date": "2025-10-02",
      "open": 154.85,
      "high": 156.29,
      "low": 153.75,
      "close": 154.89000000000001,
      "volume": 64
    },
    {
      "date": "2025-10-03",
      "open": 154.89,
      "high": 156.29,
      "low": 151.32,
      "close": 152.42000000000002,
      "volume": 63
    },
    {
      "date": "2025-10-04",
      "open": 152.42,
      "high": 153.82,
      "low": 149.3,
      "close": 150.4,
      "volume": 55
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
    "close": "close",
    "volume": "volume"
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
    "width": 980,
    "height": 400
  },
  "a11y": {
    "alt": "The close rises from 128 to 156 across the twenty sessions. Volume sits under the candles."
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

- **Price.** A candlestick uses positive #00c805 and negative #ff5000. headline shows the last close. encoding.volume paints the daily volume under the candles.
- **Type.** fontFamily is Inter. The shell is white with black ink. Midnight swaps to #1c1c1e. No wordmark and no mark icon.
- **Data.** The sessions and holdings are generated. They are not a market.

https://chartkit.dev/dashboards/folio
