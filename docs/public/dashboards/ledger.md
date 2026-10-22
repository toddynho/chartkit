# Harbor Ledger

A payments overview: four scorecards, a sparkline on each, and gross volume against the prior period.

Inspired by common SaaS dashboard styles. ChartKit is not affiliated with any product.

Default theme: soft.

## Gross

Scorecard with the eight-month series drawn under the value.

type kpi. data draws the sparkline. metric.format is compact, metric.delta is the chip, and goodDirection down flips the refund colour.

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
  "size": {
    "width": 240,
    "height": 148
  },
  "a11y": {
    "alt": "Gross volume this month is 261 thousand dollars, up 8 percent."
  }
}
```

## Net

Scorecard with the eight-month series drawn under the value.

type kpi. data draws the sparkline. metric.format is compact, metric.delta is the chip, and goodDirection down flips the refund colour.

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
  "size": {
    "width": 240,
    "height": 148
  },
  "a11y": {
    "alt": "Net of fees is 248 thousand dollars, up 7 percent."
  }
}
```

## Refunds

Scorecard with the eight-month series drawn under the value.

type kpi. data draws the sparkline. metric.format is compact, metric.delta is the chip, and goodDirection down flips the refund colour.

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
  "size": {
    "width": 240,
    "height": 148
  },
  "a11y": {
    "alt": "Refunds are 12.6 thousand dollars, down 11 percent."
  }
}
```

## Accounts

Scorecard with the eight-month series drawn under the value.

type kpi. data draws the sparkline. metric.format is compact, metric.delta is the chip, and goodDirection down flips the refund colour.

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
  "size": {
    "width": 240,
    "height": 148
  },
  "a11y": {
    "alt": "840 new accounts, up 4 percent."
  }
}
```

## Gross volume

This period is an area. The prior period is a dashed line on the same axis.

type combo. The first y series is mark area. The second is mark line and dash dashed. axes.y.format is compact. Theme tokens recolor both series.

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
  "size": {
    "width": 760,
    "height": 300
  },
  "a11y": {
    "alt": "Gross volume peaks in October at 261 thousand, above the prior period."
  }
}
```

## Options

- **Scorecards.** type kpi. A number array in data is the sparkline under the value. metric.delta is the chip.
- **Comparison.** combo puts an area and a dashed line on one x axis. dash dashed is the prior period.
- **Tokens.** The page sets --ck-series-1, --ck-series-2, and --ck-area-opacity. Soft and Midnight swap those variables. No preset is added to the bundle.

https://chartkit.dev/dashboards/ledger
