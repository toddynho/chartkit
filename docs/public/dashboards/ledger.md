# Stripe-style payments

Payments for 1–21 October.

Range: 1–21 Oct.

Styled after Stripe's dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by Stripe.

Default theme: soft.

## Gross volume

Daily gross against the previous period. The total sits above the chart.

type combo. headline draws $261K, the comparison, and a positive delta pill. The area fades toward the baseline. The prior series is a dashed line. legend.show is false. axes.y.title is empty, y labels and grids are off. axes.x.ticks is ends.

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
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-10-01",
      "gross": 7500,
      "prior": 7961
    },
    {
      "date": "2025-10-02",
      "gross": 8620,
      "prior": 7944
    },
    {
      "date": "2025-10-03",
      "gross": 9081,
      "prior": 7096
    },
    {
      "date": "2025-10-04",
      "gross": 8349,
      "prior": 7638
    },
    {
      "date": "2025-10-05",
      "gross": 9104,
      "prior": 8690
    },
    {
      "date": "2025-10-06",
      "gross": 9577,
      "prior": 9803
    },
    {
      "date": "2025-10-07",
      "gross": 9304,
      "prior": 10456
    },
    {
      "date": "2025-10-08",
      "gross": 11710,
      "prior": 10760
    },
    {
      "date": "2025-10-09",
      "gross": 11749,
      "prior": 10190
    },
    {
      "date": "2025-10-10",
      "gross": 12269,
      "prior": 9735
    },
    {
      "date": "2025-10-11",
      "gross": 12951,
      "prior": 9728
    },
    {
      "date": "2025-10-12",
      "gross": 11780,
      "prior": 11267
    },
    {
      "date": "2025-10-13",
      "gross": 12182,
      "prior": 11938
    },
    {
      "date": "2025-10-14",
      "gross": 13356,
      "prior": 12841
    },
    {
      "date": "2025-10-15",
      "gross": 15447,
      "prior": 13164
    },
    {
      "date": "2025-10-16",
      "gross": 17614,
      "prior": 12561
    },
    {
      "date": "2025-10-17",
      "gross": 16635,
      "prior": 12708
    },
    {
      "date": "2025-10-18",
      "gross": 16040,
      "prior": 12002
    },
    {
      "date": "2025-10-19",
      "gross": 15859,
      "prior": 13143
    },
    {
      "date": "2025-10-20",
      "gross": 15665,
      "prior": 14109
    },
    {
      "date": "2025-10-21",
      "gross": 16208,
      "prior": 14611
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
      "ticks": "ends"
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
    "mode": "index",
    "background": "light-dark(#ffffff,#0f2942)",
    "radius": 6,
    "shadow": "0 2px 5px rgba(50,50,93,.18)",
    "crosshairColor": "#635bff"
  },
  "headline": {
    "label": "Gross volume",
    "value": "$261K",
    "compare": "$228K",
    "delta": "+14%",
    "tone": "positive"
  },
  "mark": {
    "strokeWidth": 2,
    "fillOpacity": 0.18,
    "curve": "linear",
    "points": "none",
    "gradient": true
  },
  "size": {
    "width": 1100,
    "height": 340
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
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    7.5,
    8.62,
    9.081,
    8.349,
    9.104,
    9.577,
    9.304,
    11.71,
    11.749,
    12.269,
    12.951,
    11.78,
    12.182,
    13.356,
    15.447,
    17.614,
    16.635,
    16.04,
    15.859,
    15.665,
    16.208
  ],
  "metric": {
    "label": "Gross",
    "value": 261000,
    "delta": 0.14,
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
    "alt": "Gross volume this month is 261 thousand dollars, up 14 percent."
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
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    6.944444444444445,
    7.981481481481482,
    8.408333333333333,
    7.730555555555555,
    8.42962962962963,
    8.867592592592592,
    8.614814814814816,
    10.842592592592593,
    10.878703703703703,
    11.360185185185186,
    11.991666666666667,
    10.907407407407407,
    11.27962962962963,
    12.366666666666667,
    14.302777777777777,
    16.30925925925926,
    15.402777777777779,
    14.851851851851851,
    14.684259259259258,
    14.50462962962963,
    15.007407407407408
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
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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

- **Gross volume.** combo draws a blurple area and a grey dashed prior-period line. headline draws the total, the comparison, and the delta pill. axes.x.ticks is ends. theme.tokens.fontFamily is Inter.
- **Metrics.** Six kpi specs sit in a 2×3 grid. Each is a label, a value, and a short spark. surface and grid are transparent.
- **Methods.** bar-list mark.track is row. Amounts use the text token. Soft and Midnight are two SVGs from the two theme objects.
- **Palette.** theme.tokens: blurple #635bff, navy text #0a2540, comparison #8898aa, negative #df1b41. Midnight swaps those tokens. The page CSS does not paint the marks.

https://chartkit.dev/dashboards/ledger
