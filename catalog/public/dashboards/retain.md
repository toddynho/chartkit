# ChartMogul-style revenue

Fictional monthly recurring revenue, a cohort triangle, and a product funnel.

Range: Apr–Sep.

Styled after ChartMogul and Mixpanel to show ChartKit's styling flexibility. Not affiliated with or endorsed by ChartMogul or Mixpanel.

Default theme: soft.

## MRR

Monthly recurring revenue.

type kpi. format compact with a dollar prefix. metric.thresholds colours the surface: red under 120 thousand, sand from there, teal from 180 thousand.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#1a1a1a",
      "muted": "#667085",
      "grid": "transparent",
      "axis": "#d0d5dd",
      "accent": "#1f8a70",
      "positive": "#1f8a70",
      "negative": "#d92d20",
      "series": [
        "#1f8a70",
        "#7dcea0",
        "#f4b183",
        "#7856ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    98,
    120,
    139,
    165,
    189,
    217
  ],
  "metric": {
    "label": "MRR",
    "value": 197000,
    "delta": 0.11,
    "format": {
      "style": "compact",
      "prefix": "$"
    },
    "thresholds": [
      {
        "value": 0,
        "color": "#d92d20"
      },
      {
        "value": 120000,
        "color": "#f4b183"
      },
      {
        "value": 180000,
        "color": "#1f8a70"
      }
    ]
  },
  "mark": {
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 300,
    "height": 96
  },
  "a11y": {
    "alt": "MRR is 197 thousand dollars, up 11 percent."
  }
}
```

## Customers

Paying customers.

type kpi. metric.thresholds colours the surface teal from 450 customers.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#1a1a1a",
      "muted": "#667085",
      "grid": "transparent",
      "axis": "#d0d5dd",
      "accent": "#1f8a70",
      "positive": "#1f8a70",
      "negative": "#d92d20",
      "series": [
        "#1f8a70",
        "#7dcea0",
        "#f4b183",
        "#7856ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    420,
    438,
    451,
    470,
    488,
    510
  ],
  "metric": {
    "label": "Customers",
    "value": 510,
    "delta": 0.05,
    "format": "compact",
    "thresholds": [
      {
        "value": 0,
        "color": "#d92d20"
      },
      {
        "value": 300,
        "color": "#f4b183"
      },
      {
        "value": 450,
        "color": "#1f8a70"
      }
    ]
  },
  "mark": {
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 300,
    "height": 96
  },
  "a11y": {
    "alt": "510 customers, up 5 percent."
  }
}
```

## Churn

Logo churn.

type kpi. goodDirection down. metric.thresholds colours the surface teal under 3 percent, sand from 3, and red from 5.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#1a1a1a",
      "muted": "#667085",
      "grid": "transparent",
      "axis": "#d0d5dd",
      "accent": "#1f8a70",
      "positive": "#1f8a70",
      "negative": "#d92d20",
      "series": [
        "#1f8a70",
        "#7dcea0",
        "#f4b183",
        "#7856ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    3.4,
    3.1,
    2.9,
    2.7,
    2.6,
    2.4
  ],
  "metric": {
    "label": "Churn",
    "value": 2.4,
    "delta": -0.08,
    "format": {
      "style": "number",
      "decimals": 1,
      "suffix": "%"
    },
    "goodDirection": "down",
    "thresholds": [
      {
        "value": 0,
        "color": "#1f8a70"
      },
      {
        "value": 3,
        "color": "#f4b183"
      },
      {
        "value": 5,
        "color": "#d92d20"
      }
    ]
  },
  "mark": {
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 300,
    "height": 96
  },
  "a11y": {
    "alt": "Logo churn is 2.4 percent, down 8 percent."
  }
}
```

## MRR movement

New, expansion, and contraction.

type stacked-area. Three series. New is #1f8a70.

```json
{
  "version": "1",
  "type": "stacked-area",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1a1a1a",
      "muted": "#667085",
      "grid": "#eef0f3",
      "axis": "#d0d5dd",
      "accent": "#1f8a70",
      "positive": "#1f8a70",
      "negative": "#d92d20",
      "series": [
        "#1f8a70",
        "#7dcea0",
        "#f4b183",
        "#7856ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "month": "Apr",
      "added": 18,
      "expansion": 4,
      "contraction": 3
    },
    {
      "month": "May",
      "added": 22,
      "expansion": 5,
      "contraction": 2
    },
    {
      "month": "Jun",
      "added": 19,
      "expansion": 6,
      "contraction": 4
    },
    {
      "month": "Jul",
      "added": 26,
      "expansion": 5,
      "contraction": 3
    },
    {
      "month": "Aug",
      "added": 24,
      "expansion": 7,
      "contraction": 3
    },
    {
      "month": "Sep",
      "added": 28,
      "expansion": 8,
      "contraction": 2
    }
  ],
  "encoding": {
    "x": "month",
    "y": [
      {
        "field": "added",
        "title": "New"
      },
      {
        "field": "expansion",
        "title": "Expansion"
      },
      {
        "field": "contraction",
        "title": "Contraction"
      }
    ]
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
  "legend": {
    "show": true
  },
  "mark": {
    "curve": "linear",
    "fillOpacity": 0.85
  },
  "size": {
    "width": 720,
    "height": 280
  },
  "a11y": {
    "alt": "New revenue is the largest movement each month."
  }
}
```

## Funnel

From visit to paid.

type funnel. The series token is #7856ff.

```json
{
  "version": "1",
  "type": "funnel",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1a1a1a",
      "muted": "#667085",
      "grid": "#eef0f3",
      "axis": "#d0d5dd",
      "accent": "#1f8a70",
      "positive": "#1f8a70",
      "negative": "#d92d20",
      "series": [
        "#7856ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "stage": "Visit",
      "n": 8200
    },
    {
      "stage": "Signup",
      "n": 2100
    },
    {
      "stage": "Activate",
      "n": 940
    },
    {
      "stage": "Paid",
      "n": 280
    }
  ],
  "encoding": {
    "x": "stage",
    "y": {
      "field": "n",
      "format": "compact"
    }
  },
  "size": {
    "width": 320,
    "height": 280
  },
  "a11y": {
    "alt": "8,200 visits, 2,100 signups, 940 activations, and 280 paid."
  }
}
```

## Cohort

Customers remaining by month.

type heatmap. Later cohorts leave unfinished months null, so the grid is a triangle. color.range is a teal ramp.

```json
{
  "version": "1",
  "type": "heatmap",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1a1a1a",
      "muted": "#667085",
      "grid": "#eef0f3",
      "axis": "#d0d5dd",
      "accent": "#1f8a70",
      "positive": "#1f8a70",
      "negative": "#d92d20",
      "series": [
        "#1f8a70",
        "#7dcea0",
        "#f4b183",
        "#7856ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "cohort": "Apr",
      "period": "M0",
      "kept": 100
    },
    {
      "cohort": "Apr",
      "period": "M1",
      "kept": 86
    },
    {
      "cohort": "Apr",
      "period": "M2",
      "kept": 72
    },
    {
      "cohort": "Apr",
      "period": "M3",
      "kept": 58
    },
    {
      "cohort": "Apr",
      "period": "M4",
      "kept": 44
    },
    {
      "cohort": "Apr",
      "period": "M5",
      "kept": 30
    },
    {
      "cohort": "May",
      "period": "M0",
      "kept": 98
    },
    {
      "cohort": "May",
      "period": "M1",
      "kept": 84
    },
    {
      "cohort": "May",
      "period": "M2",
      "kept": 70
    },
    {
      "cohort": "May",
      "period": "M3",
      "kept": 56
    },
    {
      "cohort": "May",
      "period": "M4",
      "kept": 42
    },
    {
      "cohort": "May",
      "period": "M5",
      "kept": null
    },
    {
      "cohort": "Jun",
      "period": "M0",
      "kept": 96
    },
    {
      "cohort": "Jun",
      "period": "M1",
      "kept": 82
    },
    {
      "cohort": "Jun",
      "period": "M2",
      "kept": 68
    },
    {
      "cohort": "Jun",
      "period": "M3",
      "kept": 54
    },
    {
      "cohort": "Jun",
      "period": "M4",
      "kept": null
    },
    {
      "cohort": "Jun",
      "period": "M5",
      "kept": null
    },
    {
      "cohort": "Jul",
      "period": "M0",
      "kept": 94
    },
    {
      "cohort": "Jul",
      "period": "M1",
      "kept": 80
    },
    {
      "cohort": "Jul",
      "period": "M2",
      "kept": 66
    },
    {
      "cohort": "Jul",
      "period": "M3",
      "kept": null
    },
    {
      "cohort": "Jul",
      "period": "M4",
      "kept": null
    },
    {
      "cohort": "Jul",
      "period": "M5",
      "kept": null
    },
    {
      "cohort": "Aug",
      "period": "M0",
      "kept": 92
    },
    {
      "cohort": "Aug",
      "period": "M1",
      "kept": 78
    },
    {
      "cohort": "Aug",
      "period": "M2",
      "kept": null
    },
    {
      "cohort": "Aug",
      "period": "M3",
      "kept": null
    },
    {
      "cohort": "Aug",
      "period": "M4",
      "kept": null
    },
    {
      "cohort": "Aug",
      "period": "M5",
      "kept": null
    },
    {
      "cohort": "Sep",
      "period": "M0",
      "kept": 90
    },
    {
      "cohort": "Sep",
      "period": "M1",
      "kept": null
    },
    {
      "cohort": "Sep",
      "period": "M2",
      "kept": null
    },
    {
      "cohort": "Sep",
      "period": "M3",
      "kept": null
    },
    {
      "cohort": "Sep",
      "period": "M4",
      "kept": null
    },
    {
      "cohort": "Sep",
      "period": "M5",
      "kept": null
    }
  ],
  "encoding": {
    "x": "period",
    "y": "cohort",
    "color": {
      "field": "kept",
      "title": "Remaining",
      "range": [
        "#e6f4ef",
        "#7dcea0",
        "#1f8a70"
      ]
    }
  },
  "mark": {
    "gap": 0.16,
    "cornerRadius": 2
  },
  "size": {
    "width": 980,
    "height": 240
  },
  "a11y": {
    "alt": "Each cohort fades across later months. Unfinished months are empty."
  }
}
```

## What produces this look

- **Revenue.** MRR movement is a stacked area in teal #1f8a70, a lighter green, and sand. Scorecards use compact dollars, a customer count, and percent churn. metric.thresholds paints each card from the value.
- **Product.** The funnel uses #7856ff. The cohort heatmap is a triangle: later months are null. fontFamily is Inter.
- **Data.** Months, customers, and stages are fictional.

https://chartkit.dev/dashboards/retain
