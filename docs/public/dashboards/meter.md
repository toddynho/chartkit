# Plausible-style analytics

Audience for the last 30 days.

Range: Last 30 days.

Styled after Plausible's dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by Plausible.

Default theme: soft.

## Visitors

Daily series. The last segment is dotted.

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16. mark.partial is dotted and mark.partialOpacity is 0.06, so the last segment is a dotted stroke over a lighter fill. axes.y.title is empty.

```json
{
  "version": "1",
  "type": "combo",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#111827",
      "muted": "#6b7280",
      "grid": "#f3f4f6",
      "axis": "#e5e7eb",
      "accent": "#615fff",
      "positive": "#16a34a",
      "negative": "#ef4444",
      "series": [
        "#615fff",
        "#615fff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-09-22",
      "value": 1422
    },
    {
      "date": "2025-09-23",
      "value": 1832
    },
    {
      "date": "2025-09-24",
      "value": 1712
    },
    {
      "date": "2025-09-25",
      "value": 1639
    },
    {
      "date": "2025-09-26",
      "value": 1287
    },
    {
      "date": "2025-09-27",
      "value": 1046
    },
    {
      "date": "2025-09-28",
      "value": 1229
    },
    {
      "date": "2025-09-29",
      "value": 1480
    },
    {
      "date": "2025-09-30",
      "value": 1704
    },
    {
      "date": "2025-10-01",
      "value": 1950
    },
    {
      "date": "2025-10-02",
      "value": 1482
    },
    {
      "date": "2025-10-03",
      "value": 1305
    },
    {
      "date": "2025-10-04",
      "value": 1534
    },
    {
      "date": "2025-10-05",
      "value": 2253
    },
    {
      "date": "2025-10-06",
      "value": 1909
    },
    {
      "date": "2025-10-07",
      "value": 2100
    },
    {
      "date": "2025-10-08",
      "value": 1902
    },
    {
      "date": "2025-10-09",
      "value": 1635
    },
    {
      "date": "2025-10-10",
      "value": 1457
    },
    {
      "date": "2025-10-11",
      "value": 1092
    },
    {
      "date": "2025-10-12",
      "value": 1490
    },
    {
      "date": "2025-10-13",
      "value": 1643
    },
    {
      "date": "2025-10-14",
      "value": 2026
    },
    {
      "date": "2025-10-15",
      "value": 2002
    },
    {
      "date": "2025-10-16",
      "value": 1757
    },
    {
      "date": "2025-10-17",
      "value": 1407
    },
    {
      "date": "2025-10-18",
      "value": 1408
    },
    {
      "date": "2025-10-19",
      "value": 1403
    },
    {
      "date": "2025-10-20",
      "value": 1747
    },
    {
      "date": "2025-10-21",
      "value": 1940
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "value",
        "mark": "area",
        "scale": {
          "domain": [
            0,
            2700
          ]
        }
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "points": "always",
    "pointSize": 2.5,
    "fillOpacity": 0.16,
    "partial": "dotted",
    "partialOpacity": 0.06,
    "strokeWidth": 1.75,
    "gradient": false
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
    "mode": "index",
    "background": "light-dark(#ffffff,#1f2937)",
    "radius": 8,
    "shadow": "0 4px 16px rgba(17,24,39,.12)",
    "crosshairColor": "#615fff"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Visitors over 30 days, with one tall day in the middle and the last day still open."
  }
}
```

## Visits

Daily series. The last segment is dotted.

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16. mark.partial is dotted and mark.partialOpacity is 0.06, so the last segment is a dotted stroke over a lighter fill. axes.y.title is empty.

```json
{
  "version": "1",
  "type": "combo",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#111827",
      "muted": "#6b7280",
      "grid": "#f3f4f6",
      "axis": "#e5e7eb",
      "accent": "#615fff",
      "positive": "#16a34a",
      "negative": "#ef4444",
      "series": [
        "#615fff",
        "#615fff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-09-22",
      "value": 1998
    },
    {
      "date": "2025-09-23",
      "value": 1934
    },
    {
      "date": "2025-09-24",
      "value": 1940
    },
    {
      "date": "2025-09-25",
      "value": 1398
    },
    {
      "date": "2025-09-26",
      "value": 1115
    },
    {
      "date": "2025-09-27",
      "value": 1576
    },
    {
      "date": "2025-09-28",
      "value": 1871
    },
    {
      "date": "2025-09-29",
      "value": 2028
    },
    {
      "date": "2025-09-30",
      "value": 2097
    },
    {
      "date": "2025-10-01",
      "value": 1985
    },
    {
      "date": "2025-10-02",
      "value": 1516
    },
    {
      "date": "2025-10-03",
      "value": 1469
    },
    {
      "date": "2025-10-04",
      "value": 1442
    },
    {
      "date": "2025-10-05",
      "value": 2130
    },
    {
      "date": "2025-10-06",
      "value": 2369
    },
    {
      "date": "2025-10-07",
      "value": 2731
    },
    {
      "date": "2025-10-08",
      "value": 3166
    },
    {
      "date": "2025-10-09",
      "value": 2146
    },
    {
      "date": "2025-10-10",
      "value": 1453
    },
    {
      "date": "2025-10-11",
      "value": 1658
    },
    {
      "date": "2025-10-12",
      "value": 2118
    },
    {
      "date": "2025-10-13",
      "value": 2299
    },
    {
      "date": "2025-10-14",
      "value": 2286
    },
    {
      "date": "2025-10-15",
      "value": 2165
    },
    {
      "date": "2025-10-16",
      "value": 1656
    },
    {
      "date": "2025-10-17",
      "value": 1640
    },
    {
      "date": "2025-10-18",
      "value": 1715
    },
    {
      "date": "2025-10-19",
      "value": 2051
    },
    {
      "date": "2025-10-20",
      "value": 2618
    },
    {
      "date": "2025-10-21",
      "value": 2649
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "value",
        "mark": "area",
        "scale": {
          "domain": [
            0,
            3800
          ]
        }
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "points": "always",
    "pointSize": 2.5,
    "fillOpacity": 0.16,
    "partial": "dotted",
    "partialOpacity": 0.06,
    "strokeWidth": 1.75,
    "gradient": false
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
    "mode": "index",
    "background": "light-dark(#ffffff,#1f2937)",
    "radius": 8,
    "shadow": "0 4px 16px rgba(17,24,39,.12)",
    "crosshairColor": "#615fff"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Visits over 30 days, with the last day still open."
  }
}
```

## Pageviews

Daily series. The last segment is dotted.

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16. mark.partial is dotted and mark.partialOpacity is 0.06, so the last segment is a dotted stroke over a lighter fill. axes.y.title is empty.

```json
{
  "version": "1",
  "type": "combo",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#111827",
      "muted": "#6b7280",
      "grid": "#f3f4f6",
      "axis": "#e5e7eb",
      "accent": "#615fff",
      "positive": "#16a34a",
      "negative": "#ef4444",
      "series": [
        "#615fff",
        "#615fff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-09-22",
      "value": 4682
    },
    {
      "date": "2025-09-23",
      "value": 5054
    },
    {
      "date": "2025-09-24",
      "value": 4808
    },
    {
      "date": "2025-09-25",
      "value": 4048
    },
    {
      "date": "2025-09-26",
      "value": 3676
    },
    {
      "date": "2025-09-27",
      "value": 3891
    },
    {
      "date": "2025-09-28",
      "value": 4247
    },
    {
      "date": "2025-09-29",
      "value": 5319
    },
    {
      "date": "2025-09-30",
      "value": 5292
    },
    {
      "date": "2025-10-01",
      "value": 5360
    },
    {
      "date": "2025-10-02",
      "value": 4418
    },
    {
      "date": "2025-10-03",
      "value": 4626
    },
    {
      "date": "2025-10-04",
      "value": 5557
    },
    {
      "date": "2025-10-05",
      "value": 5673
    },
    {
      "date": "2025-10-06",
      "value": 5583
    },
    {
      "date": "2025-10-07",
      "value": 5647
    },
    {
      "date": "2025-10-08",
      "value": 5267
    },
    {
      "date": "2025-10-09",
      "value": 4814
    },
    {
      "date": "2025-10-10",
      "value": 4056
    },
    {
      "date": "2025-10-11",
      "value": 4068
    },
    {
      "date": "2025-10-12",
      "value": 5027
    },
    {
      "date": "2025-10-13",
      "value": 5851
    },
    {
      "date": "2025-10-14",
      "value": 6357
    },
    {
      "date": "2025-10-15",
      "value": 6032
    },
    {
      "date": "2025-10-16",
      "value": 5185
    },
    {
      "date": "2025-10-17",
      "value": 4506
    },
    {
      "date": "2025-10-18",
      "value": 4872
    },
    {
      "date": "2025-10-19",
      "value": 5259
    },
    {
      "date": "2025-10-20",
      "value": 5928
    },
    {
      "date": "2025-10-21",
      "value": 6385
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "value",
        "mark": "area",
        "scale": {
          "domain": [
            0,
            7600
          ]
        }
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "points": "always",
    "pointSize": 2.5,
    "fillOpacity": 0.16,
    "partial": "dotted",
    "partialOpacity": 0.06,
    "strokeWidth": 1.75,
    "gradient": false
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
    "mode": "index",
    "background": "light-dark(#ffffff,#1f2937)",
    "radius": 8,
    "shadow": "0 4px 16px rgba(17,24,39,.12)",
    "crosshairColor": "#615fff"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Pageviews over 30 days, with the last day still open."
  }
}
```

## Views per visit

Daily series. The last segment is dotted.

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16. mark.partial is dotted and mark.partialOpacity is 0.06, so the last segment is a dotted stroke over a lighter fill. axes.y.title is empty.

```json
{
  "version": "1",
  "type": "combo",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#111827",
      "muted": "#6b7280",
      "grid": "#f3f4f6",
      "axis": "#e5e7eb",
      "accent": "#615fff",
      "positive": "#16a34a",
      "negative": "#ef4444",
      "series": [
        "#615fff",
        "#615fff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-09-22",
      "value": 2.46
    },
    {
      "date": "2025-09-23",
      "value": 2.2
    },
    {
      "date": "2025-09-24",
      "value": 2
    },
    {
      "date": "2025-09-25",
      "value": 2.25
    },
    {
      "date": "2025-09-26",
      "value": 2.21
    },
    {
      "date": "2025-09-27",
      "value": 2.71
    },
    {
      "date": "2025-09-28",
      "value": 2.82
    },
    {
      "date": "2025-09-29",
      "value": 2.54
    },
    {
      "date": "2025-09-30",
      "value": 2.4
    },
    {
      "date": "2025-10-01",
      "value": 2.25
    },
    {
      "date": "2025-10-02",
      "value": 2.41
    },
    {
      "date": "2025-10-03",
      "value": 2.65
    },
    {
      "date": "2025-10-04",
      "value": 2.88
    },
    {
      "date": "2025-10-05",
      "value": 2.86
    },
    {
      "date": "2025-10-06",
      "value": 2.7
    },
    {
      "date": "2025-10-07",
      "value": 2.77
    },
    {
      "date": "2025-10-08",
      "value": 2.42
    },
    {
      "date": "2025-10-09",
      "value": 2.5300000000000002
    },
    {
      "date": "2025-10-10",
      "value": 2.69
    },
    {
      "date": "2025-10-11",
      "value": 2.79
    },
    {
      "date": "2025-10-12",
      "value": 3.19
    },
    {
      "date": "2025-10-13",
      "value": 3.13
    },
    {
      "date": "2025-10-14",
      "value": 2.66
    },
    {
      "date": "2025-10-15",
      "value": 2.57
    },
    {
      "date": "2025-10-16",
      "value": 2.64
    },
    {
      "date": "2025-10-17",
      "value": 2.93
    },
    {
      "date": "2025-10-18",
      "value": 3.0700000000000003
    },
    {
      "date": "2025-10-19",
      "value": 3.15
    },
    {
      "date": "2025-10-20",
      "value": 3.14
    },
    {
      "date": "2025-10-21",
      "value": 2.83
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "value",
        "mark": "area",
        "scale": {
          "domain": [
            0,
            3.8000000000000003
          ]
        }
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "points": "always",
    "pointSize": 2.5,
    "fillOpacity": 0.16,
    "partial": "dotted",
    "partialOpacity": 0.06,
    "strokeWidth": 1.75,
    "gradient": false
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
    "mode": "index",
    "background": "light-dark(#ffffff,#1f2937)",
    "radius": 8,
    "shadow": "0 4px 16px rgba(17,24,39,.12)",
    "crosshairColor": "#615fff"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Views per visit over 30 days."
  }
}
```

## Bounce

Daily series. The last segment is dotted.

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16. mark.partial is dotted and mark.partialOpacity is 0.06, so the last segment is a dotted stroke over a lighter fill. axes.y.title is empty.

```json
{
  "version": "1",
  "type": "combo",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#111827",
      "muted": "#6b7280",
      "grid": "#f3f4f6",
      "axis": "#e5e7eb",
      "accent": "#615fff",
      "positive": "#16a34a",
      "negative": "#ef4444",
      "series": [
        "#615fff",
        "#615fff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-09-22",
      "value": 0.51
    },
    {
      "date": "2025-09-23",
      "value": 0.5
    },
    {
      "date": "2025-09-24",
      "value": 0.45
    },
    {
      "date": "2025-09-25",
      "value": 0.41000000000000003
    },
    {
      "date": "2025-09-26",
      "value": 0.42
    },
    {
      "date": "2025-09-27",
      "value": 0.45
    },
    {
      "date": "2025-09-28",
      "value": 0.48
    },
    {
      "date": "2025-09-29",
      "value": 0.5
    },
    {
      "date": "2025-09-30",
      "value": 0.47000000000000003
    },
    {
      "date": "2025-10-01",
      "value": 0.45
    },
    {
      "date": "2025-10-02",
      "value": 0.41000000000000003
    },
    {
      "date": "2025-10-03",
      "value": 0.4
    },
    {
      "date": "2025-10-04",
      "value": 0.45
    },
    {
      "date": "2025-10-05",
      "value": 0.45
    },
    {
      "date": "2025-10-06",
      "value": 0.47000000000000003
    },
    {
      "date": "2025-10-07",
      "value": 0.46
    },
    {
      "date": "2025-10-08",
      "value": 0.41000000000000003
    },
    {
      "date": "2025-10-09",
      "value": 0.4
    },
    {
      "date": "2025-10-10",
      "value": 0.39
    },
    {
      "date": "2025-10-11",
      "value": 0.42
    },
    {
      "date": "2025-10-12",
      "value": 0.43
    },
    {
      "date": "2025-10-13",
      "value": 0.45
    },
    {
      "date": "2025-10-14",
      "value": 0.42
    },
    {
      "date": "2025-10-15",
      "value": 0.41000000000000003
    },
    {
      "date": "2025-10-16",
      "value": 0.36
    },
    {
      "date": "2025-10-17",
      "value": 0.37
    },
    {
      "date": "2025-10-18",
      "value": 0.38
    },
    {
      "date": "2025-10-19",
      "value": 0.44
    },
    {
      "date": "2025-10-20",
      "value": 0.43
    },
    {
      "date": "2025-10-21",
      "value": 0.43
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "value",
        "mark": "area",
        "scale": {
          "domain": [
            0,
            0.6
          ]
        }
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "points": "always",
    "pointSize": 2.5,
    "fillOpacity": 0.16,
    "partial": "dotted",
    "partialOpacity": 0.06,
    "strokeWidth": 1.75,
    "gradient": false
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
    "mode": "index",
    "background": "light-dark(#ffffff,#1f2937)",
    "radius": 8,
    "shadow": "0 4px 16px rgba(17,24,39,.12)",
    "crosshairColor": "#615fff"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Bounce rate over 30 days. Down is the better direction."
  }
}
```

## Duration

Daily series. The last segment is dotted.

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16. mark.partial is dotted and mark.partialOpacity is 0.06, so the last segment is a dotted stroke over a lighter fill. axes.y.title is empty.

```json
{
  "version": "1",
  "type": "combo",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#111827",
      "muted": "#6b7280",
      "grid": "#f3f4f6",
      "axis": "#e5e7eb",
      "accent": "#615fff",
      "positive": "#16a34a",
      "negative": "#ef4444",
      "series": [
        "#615fff",
        "#615fff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-09-22",
      "value": 121000
    },
    {
      "date": "2025-09-23",
      "value": 137000
    },
    {
      "date": "2025-09-24",
      "value": 134000
    },
    {
      "date": "2025-09-25",
      "value": 117000
    },
    {
      "date": "2025-09-26",
      "value": 115000
    },
    {
      "date": "2025-09-27",
      "value": 109000
    },
    {
      "date": "2025-09-28",
      "value": 113000
    },
    {
      "date": "2025-09-29",
      "value": 127000
    },
    {
      "date": "2025-09-30",
      "value": 136000
    },
    {
      "date": "2025-10-01",
      "value": 141000
    },
    {
      "date": "2025-10-02",
      "value": 126000
    },
    {
      "date": "2025-10-03",
      "value": 123000
    },
    {
      "date": "2025-10-04",
      "value": 120000
    },
    {
      "date": "2025-10-05",
      "value": 131000
    },
    {
      "date": "2025-10-06",
      "value": 136000
    },
    {
      "date": "2025-10-07",
      "value": 146000
    },
    {
      "date": "2025-10-08",
      "value": 152000
    },
    {
      "date": "2025-10-09",
      "value": 151000
    },
    {
      "date": "2025-10-10",
      "value": 155000
    },
    {
      "date": "2025-10-11",
      "value": 131000
    },
    {
      "date": "2025-10-12",
      "value": 140000
    },
    {
      "date": "2025-10-13",
      "value": 145000
    },
    {
      "date": "2025-10-14",
      "value": 156000
    },
    {
      "date": "2025-10-15",
      "value": 145000
    },
    {
      "date": "2025-10-16",
      "value": 144000
    },
    {
      "date": "2025-10-17",
      "value": 131000
    },
    {
      "date": "2025-10-18",
      "value": 132000
    },
    {
      "date": "2025-10-19",
      "value": 134000
    },
    {
      "date": "2025-10-20",
      "value": 153000
    },
    {
      "date": "2025-10-21",
      "value": 157000
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "value",
        "mark": "area",
        "scale": {
          "domain": [
            0,
            190000
          ]
        }
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "points": "always",
    "pointSize": 2.5,
    "fillOpacity": 0.16,
    "partial": "dotted",
    "partialOpacity": 0.06,
    "strokeWidth": 1.75,
    "gradient": false
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
    "mode": "index",
    "background": "light-dark(#ffffff,#1f2937)",
    "radius": 8,
    "shadow": "0 4px 16px rgba(17,24,39,.12)",
    "crosshairColor": "#615fff"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Visit duration over 30 days."
  }
}
```

## Sources

Sources

type bar-list, mark.track row. A full-height wash in series[0] sits behind the label. The count uses the text token and sits on the right.

```json
{
  "version": "1",
  "type": "bar-list",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#111827",
      "muted": "#6b7280",
      "grid": "#f3f4f6",
      "axis": "#e5e7eb",
      "accent": "#615fff",
      "positive": "#16a34a",
      "negative": "#ef4444",
      "series": [
        "#615fff",
        "#615fff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "source": "Direct",
      "visits": 2100
    },
    {
      "source": "Search",
      "visits": 1760
    },
    {
      "source": "Newsletter",
      "visits": 940
    },
    {
      "source": "Referral",
      "visits": 610
    },
    {
      "source": "Social",
      "visits": 280
    }
  ],
  "encoding": {
    "x": "source",
    "y": {
      "field": "visits",
      "format": "compact"
    }
  },
  "mark": {
    "track": "row"
  },
  "size": {
    "width": 1080,
    "height": 152
  },
  "a11y": {
    "alt": "Direct is the largest source, then search."
  }
}
```

## Pages

Pages

type bar-list, mark.track row. A full-height wash in series[0] sits behind the label. The count uses the text token and sits on the right.

```json
{
  "version": "1",
  "type": "bar-list",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#111827",
      "muted": "#6b7280",
      "grid": "#f3f4f6",
      "axis": "#e5e7eb",
      "accent": "#615fff",
      "positive": "#16a34a",
      "negative": "#ef4444",
      "series": [
        "#615fff",
        "#615fff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "page": "/pricing",
      "visits": 1840
    },
    {
      "page": "/docs",
      "visits": 1420
    },
    {
      "page": "/changelog",
      "visits": 980
    },
    {
      "page": "/about",
      "visits": 640
    },
    {
      "page": "/status",
      "visits": 410
    }
  ],
  "encoding": {
    "x": "page",
    "y": {
      "field": "visits",
      "format": "compact"
    }
  },
  "mark": {
    "track": "row"
  },
  "size": {
    "width": 1080,
    "height": 152
  },
  "a11y": {
    "alt": "Pricing is the most visited page, then docs."
  }
}
```

## Devices

Devices

type bar-list, mark.track row. A full-height wash in series[0] sits behind the label. The count uses the text token and sits on the right.

```json
{
  "version": "1",
  "type": "bar-list",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#111827",
      "muted": "#6b7280",
      "grid": "#f3f4f6",
      "axis": "#e5e7eb",
      "accent": "#615fff",
      "positive": "#16a34a",
      "negative": "#ef4444",
      "series": [
        "#615fff",
        "#615fff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "device": "Desktop",
      "visits": 9800
    },
    {
      "device": "Mobile",
      "visits": 7420
    },
    {
      "device": "Tablet",
      "visits": 1200
    }
  ],
  "encoding": {
    "x": "device",
    "y": {
      "field": "visits",
      "format": "compact"
    }
  },
  "mark": {
    "track": "row"
  },
  "size": {
    "width": 1080,
    "height": 96
  },
  "a11y": {
    "alt": "Desktop leads, then mobile."
  }
}
```

## What produces this look

- **Metric tabs.** The strip is page state: label, number, and delta, with an underline on the selected tab. Choosing a tab shows that tab's spec. There is no sparkline in the strip.
- **Daily line.** 30 points, curve linear, points always, a light y grid, and a soft area. mark.partial dots the last segment and mark.partialOpacity paints that segment at 0.06. The series token is #615fff. Midnight uses #9d99ff.
- **Lists.** Sources, Pages, and Devices are one bar-list at a time. mark.track row paints a full-width wash. The chart is on demand and is not in the line or all bundle.

https://chartkit.dev/dashboards/meter
