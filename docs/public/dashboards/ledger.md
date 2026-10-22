# Harbor Ledger

Payments for 1–21 October.

Range: 1–21 Oct.

Inspired by common SaaS dashboard styles. ChartKit is not affiliated with any product.

Default theme: soft.

## Gross

Gross

type kpi. data is the sparkline. mark.fillOpacity 0.14 and mark.strokeWidth 1.25 keep it a thin line with a light fill. metric.delta is the chip. goodDirection down flips the refund colour.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "data": [
    182,
    176,
    201,
    198,
    214,
    248,
    236,
    261
  ],
  "metric": {
    "label": "Gross",
    "value": 261000,
    "delta": 0.08,
    "format": "compact"
  },
  "mark": {
    "fillOpacity": 0.14,
    "strokeWidth": 1.25
  },
  "size": {
    "width": 280,
    "height": 132
  },
  "a11y": {
    "alt": "Gross volume this month is 261 thousand dollars, up 8 percent."
  }
}
```

## Net

Net

type kpi. data is the sparkline. mark.fillOpacity 0.14 and mark.strokeWidth 1.25 keep it a thin line with a light fill. metric.delta is the chip. goodDirection down flips the refund colour.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "data": [
    174,
    168,
    190,
    188,
    202,
    236,
    224,
    248
  ],
  "metric": {
    "label": "Net",
    "value": 248400,
    "delta": 0.07,
    "format": "compact"
  },
  "mark": {
    "fillOpacity": 0.14,
    "strokeWidth": 1.25
  },
  "size": {
    "width": 280,
    "height": 132
  },
  "a11y": {
    "alt": "Net of fees is 248 thousand dollars, up 7 percent."
  }
}
```

## Refunds

Refunds

type kpi. data is the sparkline. mark.fillOpacity 0.14 and mark.strokeWidth 1.25 keep it a thin line with a light fill. metric.delta is the chip. goodDirection down flips the refund colour.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "data": [
    18,
    16,
    15,
    17,
    14,
    13,
    14,
    12
  ],
  "metric": {
    "label": "Refunds",
    "value": 12600,
    "delta": -0.11,
    "format": "compact",
    "goodDirection": "down"
  },
  "mark": {
    "fillOpacity": 0.14,
    "strokeWidth": 1.25
  },
  "size": {
    "width": 280,
    "height": 132
  },
  "a11y": {
    "alt": "Refunds are 12.6 thousand dollars, down 11 percent."
  }
}
```

## Accounts

Accounts

type kpi. data is the sparkline. mark.fillOpacity 0.14 and mark.strokeWidth 1.25 keep it a thin line with a light fill. metric.delta is the chip. goodDirection down flips the refund colour.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "data": [
    620,
    640,
    710,
    690,
    760,
    800,
    790,
    840
  ],
  "metric": {
    "label": "Accounts",
    "value": 840,
    "delta": 0.04,
    "format": "compact"
  },
  "mark": {
    "fillOpacity": 0.14,
    "strokeWidth": 1.25
  },
  "size": {
    "width": 280,
    "height": 132
  },
  "a11y": {
    "alt": "840 new accounts, up 4 percent."
  }
}
```

## Gross volume

This period against the prior period.

type combo. The first y series is mark area with a light fill from --ck-area-opacity. The second is mark line and dash dashed, in a contrasting token. tooltip.mode index.

```json
{
  "version": "1",
  "type": "combo",
  "theme": "soft",
  "data": [
    {
      "month": "Mar",
      "gross": 182,
      "prior": 160
    },
    {
      "month": "Apr",
      "gross": 176,
      "prior": 171
    },
    {
      "month": "May",
      "gross": 201,
      "prior": 188
    },
    {
      "month": "Jun",
      "gross": 198,
      "prior": 190
    },
    {
      "month": "Jul",
      "gross": 214,
      "prior": 196
    },
    {
      "month": "Aug",
      "gross": 248,
      "prior": 205
    },
    {
      "month": "Sep",
      "gross": 236,
      "prior": 210
    },
    {
      "month": "Oct",
      "gross": 261,
      "prior": 218
    }
  ],
  "encoding": {
    "x": "month",
    "y": [
      {
        "field": "gross",
        "title": "This period",
        "mark": "area"
      },
      {
        "field": "prior",
        "title": "Prior period",
        "mark": "line",
        "dash": "dashed"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Month"
    },
    "y": {
      "title": "Thousand USD",
      "format": "compact"
    }
  },
  "legend": {
    "position": "top"
  },
  "tooltip": {
    "mode": "index"
  },
  "mark": {
    "strokeWidth": 2.25
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Gross volume peaks in October at 261 thousand, above the prior period."
  }
}
```

## Payments by method

Card, bank, and wallet.

type bar-list, loaded from @chartkitdev/core/charts/bar-list. No axes. A tinted track sits behind the label and the value is right-aligned.

```json
{
  "version": "1",
  "type": "bar-list",
  "theme": "soft",
  "data": [
    {
      "method": "Card",
      "amount": 168400
    },
    {
      "method": "Bank",
      "amount": 64200
    },
    {
      "method": "Wallet",
      "amount": 28400
    }
  ],
  "encoding": {
    "x": "method",
    "y": {
      "field": "amount",
      "format": "compact"
    }
  },
  "size": {
    "width": 520,
    "height": 108
  },
  "a11y": {
    "alt": "Card is the largest method, then bank, then wallet."
  }
}
```

## Failed payments

Daily failures this period.

type line. The card overrides --ck-series-1 with a warning colour so failures are not the indigo volume series.

```json
{
  "version": "1",
  "type": "line",
  "theme": "soft",
  "data": [
    {
      "day": "14",
      "failed": 18
    },
    {
      "day": "15",
      "failed": 22
    },
    {
      "day": "16",
      "failed": 16
    },
    {
      "day": "17",
      "failed": 14
    },
    {
      "day": "18",
      "failed": 19
    },
    {
      "day": "19",
      "failed": 11
    },
    {
      "day": "20",
      "failed": 9
    },
    {
      "day": "21",
      "failed": 8
    }
  ],
  "encoding": {
    "x": "day",
    "y": {
      "field": "failed",
      "title": "Failed"
    }
  },
  "legend": {
    "show": false
  },
  "axes": {
    "x": {
      "title": "October"
    },
    "y": {
      "title": "Failed"
    }
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 520,
    "height": 180
  },
  "a11y": {
    "alt": "Failed payments peak at 22 on the 15th and fall to 8 on the 21st."
  }
}
```

## What produces this look

- **Scorecards.** type kpi. A number array in data is the sparkline. mark.fillOpacity 0.14 and mark.strokeWidth 1.25 keep the line thin and the fill light. metric.delta is the chip.
- **Comparison.** combo puts an area and a dashed line on one x axis. The prior series uses a warm second token so the dash stays visible on the area.
- **Methods.** bar-list is an on-demand chart. It is not in the line or all bundle. A tinted track runs behind the label and the value sits on the right.
- **Tokens.** The page sets --ck-series-1 and --ck-series-2 from --dash-series-*. Soft and Midnight swap those variables. The accent is an indigo chosen for this page.

https://chartkit.dev/dashboards/ledger
