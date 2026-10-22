# Stripe-style payments

Payments for 1–21 October.

Range: 1–21 Oct.

Styled after Stripe's dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by Stripe.

Default theme: soft.

## Gross

Gross

type kpi. theme.tokens.series is the blurple spark. surface and grid are transparent so the shell card is the only card. metric.delta is the chip. goodDirection down flips the refund colour. format compact with a dollar prefix.

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

type kpi. theme.tokens.series is the blurple spark. surface and grid are transparent so the shell card is the only card. metric.delta is the chip. goodDirection down flips the refund colour. format compact with a dollar prefix.

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

type kpi. theme.tokens.series is the blurple spark. surface and grid are transparent so the shell card is the only card. metric.delta is the chip. goodDirection down flips the refund colour. format compact with a dollar prefix.

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

type kpi. theme.tokens.series is the blurple spark. surface and grid are transparent so the shell card is the only card. metric.delta is the chip. goodDirection down flips the refund colour. format compact with a dollar prefix.

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
    "width": 280,
    "height": 132
  },
  "a11y": {
    "alt": "840 new accounts, up 4 percent."
  }
}
```

## Gross volume

This period against the previous period.

type combo. The first y series is a bar in theme.tokens.series[0]. The second is a dashed line in series[1]. axes.y.grid is solid and axes.x.grid is false, so only horizontal gridlines draw. mark.cornerRadius and mark.gap set the bar shape.

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
      "month": "Mar",
      "gross": 182000,
      "prior": 160000
    },
    {
      "month": "Apr",
      "gross": 176000,
      "prior": 171000
    },
    {
      "month": "May",
      "gross": 201000,
      "prior": 188000
    },
    {
      "month": "Jun",
      "gross": 198000,
      "prior": 190000
    },
    {
      "month": "Jul",
      "gross": 214000,
      "prior": 196000
    },
    {
      "month": "Aug",
      "gross": 248000,
      "prior": 205000
    },
    {
      "month": "Sep",
      "gross": 236000,
      "prior": 210000
    },
    {
      "month": "Oct",
      "gross": 261000,
      "prior": 218000
    }
  ],
  "encoding": {
    "x": "month",
    "y": [
      {
        "field": "gross",
        "title": "This period",
        "mark": "bar"
      },
      {
        "field": "prior",
        "title": "Previous period",
        "mark": "line",
        "dash": "dashed"
      }
    ]
  },
  "axes": {
    "x": {
      "grid": false
    },
    "y": {
      "grid": true,
      "format": {
        "style": "compact",
        "prefix": "$"
      }
    }
  },
  "legend": {
    "position": "top"
  },
  "tooltip": {
    "mode": "index"
  },
  "mark": {
    "strokeWidth": 2,
    "cornerRadius": 3,
    "gap": 0.38
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Gross volume peaks in October at 261 thousand dollars, above the previous period."
  }
}
```

## Payments by method

Card, bank, and wallet.

type bar-list. The track and the fill use theme.tokens.series[0]. The value format is compact with a dollar prefix.

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

type line. This chart's theme.tokens.series is the negative token, so the line is not the volume blurple.

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
      "field": "failed",
      "title": "Failed"
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
      "grid": true
    }
  },
  "tooltip": {
    "mode": "index"
  },
  "mark": {
    "strokeWidth": 2
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

- **Scorecards.** type kpi. A number array in data is the sparkline. theme.tokens.surface and theme.tokens.grid are transparent, so the page card is the only card. metric.delta is the chip.
- **Comparison.** combo puts bars and a dashed line on one x axis. series[0] is the blurple bar. series[1] is the slate or cyan comparison line. Only the y grid is on.
- **Methods.** bar-list is an on-demand chart. It is not in the line or all bundle. A tinted track runs behind the label and the value sits on the right.
- **Palette.** Colours are theme.tokens on each spec: blurple #635bff, navy text #0a2540, comparison #8898aa, and the negative #df1b41 for failed payments. Midnight swaps those tokens. The page CSS does not paint the marks.

https://chartkit.dev/dashboards/ledger
