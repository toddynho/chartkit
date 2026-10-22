# Stripe-style payments

Payments for 1–21 October.

Range: 1–21 Oct.

Styled after Stripe's dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by Stripe.

Default theme: soft.

## Gross volume

Daily gross against the previous period. The total sits above the chart.

type combo. The first series is an area in the blurple series token, strokeWidth 1.75, fillOpacity 0.14, curve linear. The second is a dashed line in the grey series token. legend.show is false. axes.y.title is an empty string, axes.y.labels and both grids are off. axes.x.ticks is the first and last day, so only those two labels draw.

```json
{
  "version": "1",
  "type": "combo",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#0a2540",
      "muted": "#425466",
      "grid": "#e6ebf1",
      "axis": "#c1c9d2",
      "accent": "#635bff",
      "positive": "#09825d",
      "negative": "#df1b41",
      "series": [
        "#635bff",
        "#8898aa"
      ]
    }
  },
  "data": [
    {
      "date": "2025-10-01",
      "gross": 11359,
      "prior": 16225
    },
    {
      "date": "2025-10-02",
      "gross": 15852,
      "prior": 18599
    },
    {
      "date": "2025-10-03",
      "gross": 15852,
      "prior": 13851
    },
    {
      "date": "2025-10-04",
      "gross": 11359,
      "prior": 12663
    },
    {
      "date": "2025-10-05",
      "gross": 12482,
      "prior": 15038
    },
    {
      "date": "2025-10-06",
      "gross": 9112,
      "prior": 10289
    },
    {
      "date": "2025-10-07",
      "gross": 11359,
      "prior": 9498
    },
    {
      "date": "2025-10-08",
      "gross": 9112,
      "prior": 11872
    },
    {
      "date": "2025-10-09",
      "gross": 12482,
      "prior": 9498
    },
    {
      "date": "2025-10-10",
      "gross": 11359,
      "prior": 9498
    },
    {
      "date": "2025-10-11",
      "gross": 15852,
      "prior": 11872
    },
    {
      "date": "2025-10-12",
      "gross": 15852,
      "prior": 9498
    },
    {
      "date": "2025-10-13",
      "gross": 11359,
      "prior": 9498
    },
    {
      "date": "2025-10-14",
      "gross": 12482,
      "prior": 11872
    },
    {
      "date": "2025-10-15",
      "gross": 9112,
      "prior": 9498
    },
    {
      "date": "2025-10-16",
      "gross": 11359,
      "prior": 9498
    },
    {
      "date": "2025-10-17",
      "gross": 9112,
      "prior": 11872
    },
    {
      "date": "2025-10-18",
      "gross": 12482,
      "prior": 9498
    },
    {
      "date": "2025-10-19",
      "gross": 11359,
      "prior": 9498
    },
    {
      "date": "2025-10-20",
      "gross": 15852,
      "prior": 11872
    },
    {
      "date": "2025-10-21",
      "gross": 15851,
      "prior": 9493
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "gross",
        "mark": "area"
      },
      {
        "field": "prior",
        "mark": "line",
        "dash": "dashed"
      }
    ]
  },
  "axes": {
    "x": {
      "grid": false,
      "ticks": [
        1759276800000,
        1761004800000
      ]
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
  "tooltip": {
    "mode": "index"
  },
  "mark": {
    "strokeWidth": 1.75,
    "fillOpacity": 0.14,
    "curve": "linear",
    "points": "none",
    "gradient": false
  },
  "size": {
    "width": 1100,
    "height": 260
  },
  "a11y": {
    "alt": "Gross volume for 1–21 October totals 261 thousand dollars, above the previous period."
  }
}
```

## Gross

Gross

type kpi. Compact card: label, value, and a short spark. theme.tokens.surface and grid are transparent. axes are not drawn. No per-card spec toggle.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#0a2540",
      "muted": "#425466",
      "grid": "transparent",
      "axis": "#c1c9d2",
      "accent": "#635bff",
      "positive": "#09825d",
      "negative": "#df1b41",
      "series": [
        "#635bff",
        "#8898aa"
      ]
    }
  },
  "data": [
    11.359,
    15.852,
    15.852,
    11.359,
    12.482,
    9.112,
    11.359,
    9.112,
    12.482,
    11.359,
    15.852,
    15.852,
    11.359,
    12.482,
    9.112,
    11.359,
    9.112,
    12.482,
    11.359,
    15.852,
    15.851
  ],
  "metric": {
    "label": "Gross",
    "value": 261000,
    "delta": 0.08,
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
    "width": 400,
    "height": 108
  },
  "a11y": {
    "alt": "Gross volume this month is 261 thousand dollars, up 8 percent."
  }
}
```

## Net

Net

type kpi. Compact card: label, value, and a short spark. theme.tokens.surface and grid are transparent. axes are not drawn. No per-card spec toggle.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#0a2540",
      "muted": "#425466",
      "grid": "transparent",
      "axis": "#c1c9d2",
      "accent": "#635bff",
      "positive": "#09825d",
      "negative": "#df1b41",
      "series": [
        "#635bff",
        "#8898aa"
      ]
    }
  },
  "data": [
    10.517592592592592,
    14.677777777777777,
    14.677777777777777,
    10.517592592592592,
    11.557407407407407,
    8.437037037037037,
    10.517592592592592,
    8.437037037037037,
    11.557407407407407,
    10.517592592592592,
    14.677777777777777,
    14.677777777777777,
    10.517592592592592,
    11.557407407407407,
    8.437037037037037,
    10.517592592592592,
    8.437037037037037,
    11.557407407407407,
    10.517592592592592,
    14.677777777777777,
    14.676851851851852
  ],
  "metric": {
    "label": "Net",
    "value": 248400,
    "delta": 0.07,
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
    "width": 400,
    "height": 108
  },
  "a11y": {
    "alt": "Net of fees is 248 thousand dollars, up 7 percent."
  }
}
```

## Refunds

Refunds

type kpi. Compact card: label, value, and a short spark. theme.tokens.surface and grid are transparent. axes are not drawn. No per-card spec toggle.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#0a2540",
      "muted": "#425466",
      "grid": "transparent",
      "axis": "#c1c9d2",
      "accent": "#635bff",
      "positive": "#09825d",
      "negative": "#df1b41",
      "series": [
        "#635bff",
        "#8898aa"
      ]
    }
  },
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
    "format": {
      "style": "compact",
      "prefix": "$"
    },
    "goodDirection": "down"
  },
  "mark": {
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 400,
    "height": 108
  },
  "a11y": {
    "alt": "Refunds are 12.6 thousand dollars, down 11 percent."
  }
}
```

## Fees

Fees

type kpi. Compact card: label, value, and a short spark. theme.tokens.surface and grid are transparent. axes are not drawn. No per-card spec toggle.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#0a2540",
      "muted": "#425466",
      "grid": "transparent",
      "axis": "#c1c9d2",
      "accent": "#635bff",
      "positive": "#09825d",
      "negative": "#df1b41",
      "series": [
        "#635bff",
        "#8898aa"
      ]
    }
  },
  "data": [
    6.2,
    6.4,
    7.1,
    6.9,
    7.6,
    8,
    7.9,
    8.4
  ],
  "metric": {
    "label": "Fees",
    "value": 8400,
    "delta": 0.02,
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
    "width": 400,
    "height": 108
  },
  "a11y": {
    "alt": "Fees are 8.4 thousand dollars, up 2 percent."
  }
}
```

## Accounts

Accounts

type kpi. Compact card: label, value, and a short spark. theme.tokens.surface and grid are transparent. axes are not drawn. No per-card spec toggle.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#0a2540",
      "muted": "#425466",
      "grid": "transparent",
      "axis": "#c1c9d2",
      "accent": "#635bff",
      "positive": "#09825d",
      "negative": "#df1b41",
      "series": [
        "#635bff",
        "#8898aa"
      ]
    }
  },
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
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 400,
    "height": 108
  },
  "a11y": {
    "alt": "840 new accounts, up 4 percent."
  }
}
```

## Payouts

Payouts

type kpi. Compact card: label, value, and a short spark. theme.tokens.surface and grid are transparent. axes are not drawn. No per-card spec toggle.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#0a2540",
      "muted": "#425466",
      "grid": "transparent",
      "axis": "#c1c9d2",
      "accent": "#635bff",
      "positive": "#09825d",
      "negative": "#df1b41",
      "series": [
        "#635bff",
        "#8898aa"
      ]
    }
  },
  "data": [
    210,
    220,
    240,
    230,
    250,
    260,
    255,
    248
  ],
  "metric": {
    "label": "Payouts",
    "value": 240000,
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
    "width": 400,
    "height": 108
  },
  "a11y": {
    "alt": "Payouts are 240 thousand dollars, up 6 percent."
  }
}
```

## Payments by method

Card, bank, and wallet.

type bar-list with mark.track row. The wash uses series[0]. The amount uses the text token, so Midnight stays readable. The page swaps the soft and midnight SVGs.

```json
{
  "version": "1",
  "type": "bar-list",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#0a2540",
      "muted": "#425466",
      "grid": "#e6ebf1",
      "axis": "#c1c9d2",
      "accent": "#635bff",
      "positive": "#09825d",
      "negative": "#df1b41",
      "series": [
        "#635bff",
        "#8898aa"
      ]
    }
  },
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
    "width": 520,
    "height": 96
  },
  "a11y": {
    "alt": "Card is the largest method, then bank, then wallet."
  }
}
```

## Failed payments

Daily failures this period.

type line. This chart's series token is the negative colour. axes.y.title is empty so the series name is not an axis title.

```json
{
  "version": "1",
  "type": "line",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#0a2540",
      "muted": "#425466",
      "grid": "#e6ebf1",
      "axis": "#c1c9d2",
      "accent": "#635bff",
      "positive": "#09825d",
      "negative": "#df1b41",
      "series": [
        "#df1b41"
      ]
    }
  },
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
      "field": "failed"
    }
  },
  "legend": {
    "show": false
  },
  "axes": {
    "x": {
      "grid": false
    },
    "y": {
      "title": "",
      "grid": true
    }
  },
  "tooltip": {
    "mode": "index"
  },
  "mark": {
    "strokeWidth": 1.75,
    "curve": "linear",
    "points": "none"
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

- **Gross volume.** combo draws a blurple area and a grey dashed prior-period line. legend.show is false. The $261K total and the delta are page text above the chart. axes.y.title is "" so no series name becomes an axis title. axes.y.labels and the grids are off. axes.x.ticks holds the first and last timestamps.
- **Metrics.** Six kpi specs sit in a 2×3 grid. Each is a label, a value, and a short spark. surface and grid are transparent.
- **Methods.** bar-list mark.track is row. Amounts use the text token. Soft and Midnight are two SVGs from the two theme objects.
- **Palette.** theme.tokens: blurple #635bff, navy text #0a2540, comparison #8898aa, negative #df1b41. Midnight swaps those tokens. The page CSS does not paint the marks.

https://chartkit.dev/dashboards/ledger
