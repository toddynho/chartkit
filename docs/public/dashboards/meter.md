# Plausible-style analytics

Audience for the last 30 days.

Range: Last 30 days.

Styled after Plausible's dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by Plausible.

Default theme: soft.

## Visitors

Daily series. The last segment is dotted.

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16, y grid on, legend off, axes.y.title empty. The solid area stops on the day before the last. The last segment is a second area, dash dotted, fillOpacity 0.06, in the same indigo.

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
      ]
    }
  },
  "data": [
    {
      "date": "2025-09-22",
      "solid": 1422,
      "tail": null
    },
    {
      "date": "2025-09-23",
      "solid": 1832,
      "tail": null
    },
    {
      "date": "2025-09-24",
      "solid": 1712,
      "tail": null
    },
    {
      "date": "2025-09-25",
      "solid": 1639,
      "tail": null
    },
    {
      "date": "2025-09-26",
      "solid": 1287,
      "tail": null
    },
    {
      "date": "2025-09-27",
      "solid": 1046,
      "tail": null
    },
    {
      "date": "2025-09-28",
      "solid": 1229,
      "tail": null
    },
    {
      "date": "2025-09-29",
      "solid": 1480,
      "tail": null
    },
    {
      "date": "2025-09-30",
      "solid": 1704,
      "tail": null
    },
    {
      "date": "2025-10-01",
      "solid": 1950,
      "tail": null
    },
    {
      "date": "2025-10-02",
      "solid": 1482,
      "tail": null
    },
    {
      "date": "2025-10-03",
      "solid": 1305,
      "tail": null
    },
    {
      "date": "2025-10-04",
      "solid": 1534,
      "tail": null
    },
    {
      "date": "2025-10-05",
      "solid": 2253,
      "tail": null
    },
    {
      "date": "2025-10-06",
      "solid": 1909,
      "tail": null
    },
    {
      "date": "2025-10-07",
      "solid": 2100,
      "tail": null
    },
    {
      "date": "2025-10-08",
      "solid": 1902,
      "tail": null
    },
    {
      "date": "2025-10-09",
      "solid": 1635,
      "tail": null
    },
    {
      "date": "2025-10-10",
      "solid": 1457,
      "tail": null
    },
    {
      "date": "2025-10-11",
      "solid": 1092,
      "tail": null
    },
    {
      "date": "2025-10-12",
      "solid": 1490,
      "tail": null
    },
    {
      "date": "2025-10-13",
      "solid": 1643,
      "tail": null
    },
    {
      "date": "2025-10-14",
      "solid": 2026,
      "tail": null
    },
    {
      "date": "2025-10-15",
      "solid": 2002,
      "tail": null
    },
    {
      "date": "2025-10-16",
      "solid": 1757,
      "tail": null
    },
    {
      "date": "2025-10-17",
      "solid": 1407,
      "tail": null
    },
    {
      "date": "2025-10-18",
      "solid": 1408,
      "tail": null
    },
    {
      "date": "2025-10-19",
      "solid": 1403,
      "tail": null
    },
    {
      "date": "2025-10-20",
      "solid": 1747,
      "tail": 1747
    },
    {
      "date": "2025-10-21",
      "solid": null,
      "tail": 1940
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "solid",
        "mark": "area",
        "scale": {
          "domain": [
            0,
            2700
          ]
        }
      },
      {
        "field": "tail",
        "mark": "area",
        "dash": "dotted",
        "fillOpacity": 0.06
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "points": "always",
    "pointSize": 2.5,
    "fillOpacity": 0.16,
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
    "mode": "index"
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

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16, y grid on, legend off, axes.y.title empty. The solid area stops on the day before the last. The last segment is a second area, dash dotted, fillOpacity 0.06, in the same indigo.

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
      ]
    }
  },
  "data": [
    {
      "date": "2025-09-22",
      "solid": 1998,
      "tail": null
    },
    {
      "date": "2025-09-23",
      "solid": 1934,
      "tail": null
    },
    {
      "date": "2025-09-24",
      "solid": 1940,
      "tail": null
    },
    {
      "date": "2025-09-25",
      "solid": 1398,
      "tail": null
    },
    {
      "date": "2025-09-26",
      "solid": 1115,
      "tail": null
    },
    {
      "date": "2025-09-27",
      "solid": 1576,
      "tail": null
    },
    {
      "date": "2025-09-28",
      "solid": 1871,
      "tail": null
    },
    {
      "date": "2025-09-29",
      "solid": 2028,
      "tail": null
    },
    {
      "date": "2025-09-30",
      "solid": 2097,
      "tail": null
    },
    {
      "date": "2025-10-01",
      "solid": 1985,
      "tail": null
    },
    {
      "date": "2025-10-02",
      "solid": 1516,
      "tail": null
    },
    {
      "date": "2025-10-03",
      "solid": 1469,
      "tail": null
    },
    {
      "date": "2025-10-04",
      "solid": 1442,
      "tail": null
    },
    {
      "date": "2025-10-05",
      "solid": 2130,
      "tail": null
    },
    {
      "date": "2025-10-06",
      "solid": 2369,
      "tail": null
    },
    {
      "date": "2025-10-07",
      "solid": 2731,
      "tail": null
    },
    {
      "date": "2025-10-08",
      "solid": 3166,
      "tail": null
    },
    {
      "date": "2025-10-09",
      "solid": 2146,
      "tail": null
    },
    {
      "date": "2025-10-10",
      "solid": 1453,
      "tail": null
    },
    {
      "date": "2025-10-11",
      "solid": 1658,
      "tail": null
    },
    {
      "date": "2025-10-12",
      "solid": 2118,
      "tail": null
    },
    {
      "date": "2025-10-13",
      "solid": 2299,
      "tail": null
    },
    {
      "date": "2025-10-14",
      "solid": 2286,
      "tail": null
    },
    {
      "date": "2025-10-15",
      "solid": 2165,
      "tail": null
    },
    {
      "date": "2025-10-16",
      "solid": 1656,
      "tail": null
    },
    {
      "date": "2025-10-17",
      "solid": 1640,
      "tail": null
    },
    {
      "date": "2025-10-18",
      "solid": 1715,
      "tail": null
    },
    {
      "date": "2025-10-19",
      "solid": 2051,
      "tail": null
    },
    {
      "date": "2025-10-20",
      "solid": 2618,
      "tail": 2618
    },
    {
      "date": "2025-10-21",
      "solid": null,
      "tail": 2649
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "solid",
        "mark": "area",
        "scale": {
          "domain": [
            0,
            3800
          ]
        }
      },
      {
        "field": "tail",
        "mark": "area",
        "dash": "dotted",
        "fillOpacity": 0.06
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "points": "always",
    "pointSize": 2.5,
    "fillOpacity": 0.16,
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
    "mode": "index"
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

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16, y grid on, legend off, axes.y.title empty. The solid area stops on the day before the last. The last segment is a second area, dash dotted, fillOpacity 0.06, in the same indigo.

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
      ]
    }
  },
  "data": [
    {
      "date": "2025-09-22",
      "solid": 4682,
      "tail": null
    },
    {
      "date": "2025-09-23",
      "solid": 5054,
      "tail": null
    },
    {
      "date": "2025-09-24",
      "solid": 4808,
      "tail": null
    },
    {
      "date": "2025-09-25",
      "solid": 4048,
      "tail": null
    },
    {
      "date": "2025-09-26",
      "solid": 3676,
      "tail": null
    },
    {
      "date": "2025-09-27",
      "solid": 3891,
      "tail": null
    },
    {
      "date": "2025-09-28",
      "solid": 4247,
      "tail": null
    },
    {
      "date": "2025-09-29",
      "solid": 5319,
      "tail": null
    },
    {
      "date": "2025-09-30",
      "solid": 5292,
      "tail": null
    },
    {
      "date": "2025-10-01",
      "solid": 5360,
      "tail": null
    },
    {
      "date": "2025-10-02",
      "solid": 4418,
      "tail": null
    },
    {
      "date": "2025-10-03",
      "solid": 4626,
      "tail": null
    },
    {
      "date": "2025-10-04",
      "solid": 5557,
      "tail": null
    },
    {
      "date": "2025-10-05",
      "solid": 5673,
      "tail": null
    },
    {
      "date": "2025-10-06",
      "solid": 5583,
      "tail": null
    },
    {
      "date": "2025-10-07",
      "solid": 5647,
      "tail": null
    },
    {
      "date": "2025-10-08",
      "solid": 5267,
      "tail": null
    },
    {
      "date": "2025-10-09",
      "solid": 4814,
      "tail": null
    },
    {
      "date": "2025-10-10",
      "solid": 4056,
      "tail": null
    },
    {
      "date": "2025-10-11",
      "solid": 4068,
      "tail": null
    },
    {
      "date": "2025-10-12",
      "solid": 5027,
      "tail": null
    },
    {
      "date": "2025-10-13",
      "solid": 5851,
      "tail": null
    },
    {
      "date": "2025-10-14",
      "solid": 6357,
      "tail": null
    },
    {
      "date": "2025-10-15",
      "solid": 6032,
      "tail": null
    },
    {
      "date": "2025-10-16",
      "solid": 5185,
      "tail": null
    },
    {
      "date": "2025-10-17",
      "solid": 4506,
      "tail": null
    },
    {
      "date": "2025-10-18",
      "solid": 4872,
      "tail": null
    },
    {
      "date": "2025-10-19",
      "solid": 5259,
      "tail": null
    },
    {
      "date": "2025-10-20",
      "solid": 5928,
      "tail": 5928
    },
    {
      "date": "2025-10-21",
      "solid": null,
      "tail": 6385
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "solid",
        "mark": "area",
        "scale": {
          "domain": [
            0,
            7600
          ]
        }
      },
      {
        "field": "tail",
        "mark": "area",
        "dash": "dotted",
        "fillOpacity": 0.06
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "points": "always",
    "pointSize": 2.5,
    "fillOpacity": 0.16,
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
    "mode": "index"
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

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16, y grid on, legend off, axes.y.title empty. The solid area stops on the day before the last. The last segment is a second area, dash dotted, fillOpacity 0.06, in the same indigo.

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
      ]
    }
  },
  "data": [
    {
      "date": "2025-09-22",
      "solid": 2.46,
      "tail": null
    },
    {
      "date": "2025-09-23",
      "solid": 2.2,
      "tail": null
    },
    {
      "date": "2025-09-24",
      "solid": 2,
      "tail": null
    },
    {
      "date": "2025-09-25",
      "solid": 2.25,
      "tail": null
    },
    {
      "date": "2025-09-26",
      "solid": 2.21,
      "tail": null
    },
    {
      "date": "2025-09-27",
      "solid": 2.71,
      "tail": null
    },
    {
      "date": "2025-09-28",
      "solid": 2.82,
      "tail": null
    },
    {
      "date": "2025-09-29",
      "solid": 2.54,
      "tail": null
    },
    {
      "date": "2025-09-30",
      "solid": 2.4,
      "tail": null
    },
    {
      "date": "2025-10-01",
      "solid": 2.25,
      "tail": null
    },
    {
      "date": "2025-10-02",
      "solid": 2.41,
      "tail": null
    },
    {
      "date": "2025-10-03",
      "solid": 2.65,
      "tail": null
    },
    {
      "date": "2025-10-04",
      "solid": 2.88,
      "tail": null
    },
    {
      "date": "2025-10-05",
      "solid": 2.86,
      "tail": null
    },
    {
      "date": "2025-10-06",
      "solid": 2.7,
      "tail": null
    },
    {
      "date": "2025-10-07",
      "solid": 2.77,
      "tail": null
    },
    {
      "date": "2025-10-08",
      "solid": 2.42,
      "tail": null
    },
    {
      "date": "2025-10-09",
      "solid": 2.5300000000000002,
      "tail": null
    },
    {
      "date": "2025-10-10",
      "solid": 2.69,
      "tail": null
    },
    {
      "date": "2025-10-11",
      "solid": 2.79,
      "tail": null
    },
    {
      "date": "2025-10-12",
      "solid": 3.19,
      "tail": null
    },
    {
      "date": "2025-10-13",
      "solid": 3.13,
      "tail": null
    },
    {
      "date": "2025-10-14",
      "solid": 2.66,
      "tail": null
    },
    {
      "date": "2025-10-15",
      "solid": 2.57,
      "tail": null
    },
    {
      "date": "2025-10-16",
      "solid": 2.64,
      "tail": null
    },
    {
      "date": "2025-10-17",
      "solid": 2.93,
      "tail": null
    },
    {
      "date": "2025-10-18",
      "solid": 3.0700000000000003,
      "tail": null
    },
    {
      "date": "2025-10-19",
      "solid": 3.15,
      "tail": null
    },
    {
      "date": "2025-10-20",
      "solid": 3.14,
      "tail": 3.14
    },
    {
      "date": "2025-10-21",
      "solid": null,
      "tail": 2.83
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "solid",
        "mark": "area",
        "scale": {
          "domain": [
            0,
            3.8000000000000003
          ]
        }
      },
      {
        "field": "tail",
        "mark": "area",
        "dash": "dotted",
        "fillOpacity": 0.06
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "points": "always",
    "pointSize": 2.5,
    "fillOpacity": 0.16,
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
    "mode": "index"
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

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16, y grid on, legend off, axes.y.title empty. The solid area stops on the day before the last. The last segment is a second area, dash dotted, fillOpacity 0.06, in the same indigo.

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
      ]
    }
  },
  "data": [
    {
      "date": "2025-09-22",
      "solid": 0.51,
      "tail": null
    },
    {
      "date": "2025-09-23",
      "solid": 0.5,
      "tail": null
    },
    {
      "date": "2025-09-24",
      "solid": 0.45,
      "tail": null
    },
    {
      "date": "2025-09-25",
      "solid": 0.41000000000000003,
      "tail": null
    },
    {
      "date": "2025-09-26",
      "solid": 0.42,
      "tail": null
    },
    {
      "date": "2025-09-27",
      "solid": 0.45,
      "tail": null
    },
    {
      "date": "2025-09-28",
      "solid": 0.48,
      "tail": null
    },
    {
      "date": "2025-09-29",
      "solid": 0.5,
      "tail": null
    },
    {
      "date": "2025-09-30",
      "solid": 0.47000000000000003,
      "tail": null
    },
    {
      "date": "2025-10-01",
      "solid": 0.45,
      "tail": null
    },
    {
      "date": "2025-10-02",
      "solid": 0.41000000000000003,
      "tail": null
    },
    {
      "date": "2025-10-03",
      "solid": 0.4,
      "tail": null
    },
    {
      "date": "2025-10-04",
      "solid": 0.45,
      "tail": null
    },
    {
      "date": "2025-10-05",
      "solid": 0.45,
      "tail": null
    },
    {
      "date": "2025-10-06",
      "solid": 0.47000000000000003,
      "tail": null
    },
    {
      "date": "2025-10-07",
      "solid": 0.46,
      "tail": null
    },
    {
      "date": "2025-10-08",
      "solid": 0.41000000000000003,
      "tail": null
    },
    {
      "date": "2025-10-09",
      "solid": 0.4,
      "tail": null
    },
    {
      "date": "2025-10-10",
      "solid": 0.39,
      "tail": null
    },
    {
      "date": "2025-10-11",
      "solid": 0.42,
      "tail": null
    },
    {
      "date": "2025-10-12",
      "solid": 0.43,
      "tail": null
    },
    {
      "date": "2025-10-13",
      "solid": 0.45,
      "tail": null
    },
    {
      "date": "2025-10-14",
      "solid": 0.42,
      "tail": null
    },
    {
      "date": "2025-10-15",
      "solid": 0.41000000000000003,
      "tail": null
    },
    {
      "date": "2025-10-16",
      "solid": 0.36,
      "tail": null
    },
    {
      "date": "2025-10-17",
      "solid": 0.37,
      "tail": null
    },
    {
      "date": "2025-10-18",
      "solid": 0.38,
      "tail": null
    },
    {
      "date": "2025-10-19",
      "solid": 0.44,
      "tail": null
    },
    {
      "date": "2025-10-20",
      "solid": 0.43,
      "tail": 0.43
    },
    {
      "date": "2025-10-21",
      "solid": null,
      "tail": 0.43
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "solid",
        "mark": "area",
        "scale": {
          "domain": [
            0,
            0.6
          ]
        }
      },
      {
        "field": "tail",
        "mark": "area",
        "dash": "dotted",
        "fillOpacity": 0.06
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "points": "always",
    "pointSize": 2.5,
    "fillOpacity": 0.16,
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
    "mode": "index"
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

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16, y grid on, legend off, axes.y.title empty. The solid area stops on the day before the last. The last segment is a second area, dash dotted, fillOpacity 0.06, in the same indigo.

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
      ]
    }
  },
  "data": [
    {
      "date": "2025-09-22",
      "solid": 121000,
      "tail": null
    },
    {
      "date": "2025-09-23",
      "solid": 137000,
      "tail": null
    },
    {
      "date": "2025-09-24",
      "solid": 134000,
      "tail": null
    },
    {
      "date": "2025-09-25",
      "solid": 117000,
      "tail": null
    },
    {
      "date": "2025-09-26",
      "solid": 115000,
      "tail": null
    },
    {
      "date": "2025-09-27",
      "solid": 109000,
      "tail": null
    },
    {
      "date": "2025-09-28",
      "solid": 113000,
      "tail": null
    },
    {
      "date": "2025-09-29",
      "solid": 127000,
      "tail": null
    },
    {
      "date": "2025-09-30",
      "solid": 136000,
      "tail": null
    },
    {
      "date": "2025-10-01",
      "solid": 141000,
      "tail": null
    },
    {
      "date": "2025-10-02",
      "solid": 126000,
      "tail": null
    },
    {
      "date": "2025-10-03",
      "solid": 123000,
      "tail": null
    },
    {
      "date": "2025-10-04",
      "solid": 120000,
      "tail": null
    },
    {
      "date": "2025-10-05",
      "solid": 131000,
      "tail": null
    },
    {
      "date": "2025-10-06",
      "solid": 136000,
      "tail": null
    },
    {
      "date": "2025-10-07",
      "solid": 146000,
      "tail": null
    },
    {
      "date": "2025-10-08",
      "solid": 152000,
      "tail": null
    },
    {
      "date": "2025-10-09",
      "solid": 151000,
      "tail": null
    },
    {
      "date": "2025-10-10",
      "solid": 155000,
      "tail": null
    },
    {
      "date": "2025-10-11",
      "solid": 131000,
      "tail": null
    },
    {
      "date": "2025-10-12",
      "solid": 140000,
      "tail": null
    },
    {
      "date": "2025-10-13",
      "solid": 145000,
      "tail": null
    },
    {
      "date": "2025-10-14",
      "solid": 156000,
      "tail": null
    },
    {
      "date": "2025-10-15",
      "solid": 145000,
      "tail": null
    },
    {
      "date": "2025-10-16",
      "solid": 144000,
      "tail": null
    },
    {
      "date": "2025-10-17",
      "solid": 131000,
      "tail": null
    },
    {
      "date": "2025-10-18",
      "solid": 132000,
      "tail": null
    },
    {
      "date": "2025-10-19",
      "solid": 134000,
      "tail": null
    },
    {
      "date": "2025-10-20",
      "solid": 153000,
      "tail": 153000
    },
    {
      "date": "2025-10-21",
      "solid": null,
      "tail": 157000
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "solid",
        "mark": "area",
        "scale": {
          "domain": [
            0,
            190000
          ]
        }
      },
      {
        "field": "tail",
        "mark": "area",
        "dash": "dotted",
        "fillOpacity": 0.06
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "points": "always",
    "pointSize": 2.5,
    "fillOpacity": 0.16,
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
    "mode": "index"
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
      ]
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
      ]
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
      ]
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
- **Daily line.** 30 points, curve linear, points always, a light y grid, and a soft area under the solid line. The last day is a second area, dash dotted, fillOpacity 0.06. Both series tokens are #615fff. Midnight uses #9d99ff.
- **Lists.** Sources, Pages, and Devices are one bar-list at a time. mark.track row paints a full-width wash. The chart is on demand and is not in the line or all bundle.

https://chartkit.dev/dashboards/meter
