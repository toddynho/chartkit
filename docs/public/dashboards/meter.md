# Plausible-style analytics

Audience for the last 30 days.

Range: Last 30 days.

Styled after Plausible's dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by Plausible.

Default theme: soft.

## Visitors

Daily series. The last segment is dotted.

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16, y grid on, legend off, axes.y.title empty. The area series is null on the last day. A second line, dash dotted, covers the last segment. Both series tokens are the same indigo.

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
      "solid": 2310,
      "tail": null
    },
    {
      "date": "2025-09-23",
      "solid": 2670,
      "tail": null
    },
    {
      "date": "2025-09-24",
      "solid": 2670,
      "tail": null
    },
    {
      "date": "2025-09-25",
      "solid": 2310,
      "tail": null
    },
    {
      "date": "2025-09-26",
      "solid": 2400,
      "tail": null
    },
    {
      "date": "2025-09-27",
      "solid": 2130,
      "tail": null
    },
    {
      "date": "2025-09-28",
      "solid": 2310,
      "tail": null
    },
    {
      "date": "2025-09-29",
      "solid": 2130,
      "tail": null
    },
    {
      "date": "2025-09-30",
      "solid": 2400,
      "tail": null
    },
    {
      "date": "2025-10-01",
      "solid": 2310,
      "tail": null
    },
    {
      "date": "2025-10-02",
      "solid": 2670,
      "tail": null
    },
    {
      "date": "2025-10-03",
      "solid": 2670,
      "tail": null
    },
    {
      "date": "2025-10-04",
      "solid": 2310,
      "tail": null
    },
    {
      "date": "2025-10-05",
      "solid": 2400,
      "tail": null
    },
    {
      "date": "2025-10-06",
      "solid": 2130,
      "tail": null
    },
    {
      "date": "2025-10-07",
      "solid": 2310,
      "tail": null
    },
    {
      "date": "2025-10-08",
      "solid": 2130,
      "tail": null
    },
    {
      "date": "2025-10-09",
      "solid": 2400,
      "tail": null
    },
    {
      "date": "2025-10-10",
      "solid": 2310,
      "tail": null
    },
    {
      "date": "2025-10-11",
      "solid": 2670,
      "tail": null
    },
    {
      "date": "2025-10-12",
      "solid": 2670,
      "tail": null
    },
    {
      "date": "2025-10-13",
      "solid": 2310,
      "tail": null
    },
    {
      "date": "2025-10-14",
      "solid": 2400,
      "tail": null
    },
    {
      "date": "2025-10-15",
      "solid": 2130,
      "tail": null
    },
    {
      "date": "2025-10-16",
      "solid": 2310,
      "tail": null
    },
    {
      "date": "2025-10-17",
      "solid": 2130,
      "tail": null
    },
    {
      "date": "2025-10-18",
      "solid": 2400,
      "tail": null
    },
    {
      "date": "2025-10-19",
      "solid": 2310,
      "tail": null
    },
    {
      "date": "2025-10-20",
      "solid": 2670,
      "tail": 2670
    },
    {
      "date": "2025-10-21",
      "solid": null,
      "tail": 2670
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
        "mark": "area"
      },
      {
        "field": "tail",
        "mark": "line",
        "dash": "dotted"
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
    "alt": "Visitors over 30 days, with the last day still open."
  }
}
```

## Visits

Daily series. The last segment is dotted.

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16, y grid on, legend off, axes.y.title empty. The area series is null on the last day. A second line, dash dotted, covers the last segment. Both series tokens are the same indigo.

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
      "solid": 4040,
      "tail": null
    },
    {
      "date": "2025-09-23",
      "solid": 3560,
      "tail": null
    },
    {
      "date": "2025-09-24",
      "solid": 4200,
      "tail": null
    },
    {
      "date": "2025-09-25",
      "solid": 4520,
      "tail": null
    },
    {
      "date": "2025-09-26",
      "solid": 4520,
      "tail": null
    },
    {
      "date": "2025-09-27",
      "solid": 4200,
      "tail": null
    },
    {
      "date": "2025-09-28",
      "solid": 3560,
      "tail": null
    },
    {
      "date": "2025-09-29",
      "solid": 4040,
      "tail": null
    },
    {
      "date": "2025-09-30",
      "solid": 4200,
      "tail": null
    },
    {
      "date": "2025-10-01",
      "solid": 4040,
      "tail": null
    },
    {
      "date": "2025-10-02",
      "solid": 3560,
      "tail": null
    },
    {
      "date": "2025-10-03",
      "solid": 4200,
      "tail": null
    },
    {
      "date": "2025-10-04",
      "solid": 4520,
      "tail": null
    },
    {
      "date": "2025-10-05",
      "solid": 4520,
      "tail": null
    },
    {
      "date": "2025-10-06",
      "solid": 4200,
      "tail": null
    },
    {
      "date": "2025-10-07",
      "solid": 3560,
      "tail": null
    },
    {
      "date": "2025-10-08",
      "solid": 4040,
      "tail": null
    },
    {
      "date": "2025-10-09",
      "solid": 4200,
      "tail": null
    },
    {
      "date": "2025-10-10",
      "solid": 4040,
      "tail": null
    },
    {
      "date": "2025-10-11",
      "solid": 3560,
      "tail": null
    },
    {
      "date": "2025-10-12",
      "solid": 4200,
      "tail": null
    },
    {
      "date": "2025-10-13",
      "solid": 4520,
      "tail": null
    },
    {
      "date": "2025-10-14",
      "solid": 4520,
      "tail": null
    },
    {
      "date": "2025-10-15",
      "solid": 4200,
      "tail": null
    },
    {
      "date": "2025-10-16",
      "solid": 3560,
      "tail": null
    },
    {
      "date": "2025-10-17",
      "solid": 4040,
      "tail": null
    },
    {
      "date": "2025-10-18",
      "solid": 4200,
      "tail": null
    },
    {
      "date": "2025-10-19",
      "solid": 4040,
      "tail": null
    },
    {
      "date": "2025-10-20",
      "solid": 3560,
      "tail": 3560
    },
    {
      "date": "2025-10-21",
      "solid": null,
      "tail": 4200
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
        "mark": "area"
      },
      {
        "field": "tail",
        "mark": "line",
        "dash": "dotted"
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

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16, y grid on, legend off, axes.y.title empty. The area series is null on the last day. A second line, dash dotted, covers the last segment. Both series tokens are the same indigo.

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
      "solid": 7920,
      "tail": null
    },
    {
      "date": "2025-09-23",
      "solid": 8760,
      "tail": null
    },
    {
      "date": "2025-09-24",
      "solid": 8200,
      "tail": null
    },
    {
      "date": "2025-09-25",
      "solid": 8760,
      "tail": null
    },
    {
      "date": "2025-09-26",
      "solid": 7920,
      "tail": null
    },
    {
      "date": "2025-09-27",
      "solid": 8200,
      "tail": null
    },
    {
      "date": "2025-09-28",
      "solid": 7080,
      "tail": null
    },
    {
      "date": "2025-09-29",
      "solid": 7080,
      "tail": null
    },
    {
      "date": "2025-09-30",
      "solid": 8200,
      "tail": null
    },
    {
      "date": "2025-10-01",
      "solid": 7920,
      "tail": null
    },
    {
      "date": "2025-10-02",
      "solid": 8760,
      "tail": null
    },
    {
      "date": "2025-10-03",
      "solid": 8200,
      "tail": null
    },
    {
      "date": "2025-10-04",
      "solid": 8760,
      "tail": null
    },
    {
      "date": "2025-10-05",
      "solid": 7920,
      "tail": null
    },
    {
      "date": "2025-10-06",
      "solid": 8200,
      "tail": null
    },
    {
      "date": "2025-10-07",
      "solid": 7080,
      "tail": null
    },
    {
      "date": "2025-10-08",
      "solid": 7080,
      "tail": null
    },
    {
      "date": "2025-10-09",
      "solid": 8200,
      "tail": null
    },
    {
      "date": "2025-10-10",
      "solid": 7920,
      "tail": null
    },
    {
      "date": "2025-10-11",
      "solid": 8760,
      "tail": null
    },
    {
      "date": "2025-10-12",
      "solid": 8200,
      "tail": null
    },
    {
      "date": "2025-10-13",
      "solid": 8760,
      "tail": null
    },
    {
      "date": "2025-10-14",
      "solid": 7920,
      "tail": null
    },
    {
      "date": "2025-10-15",
      "solid": 8200,
      "tail": null
    },
    {
      "date": "2025-10-16",
      "solid": 7080,
      "tail": null
    },
    {
      "date": "2025-10-17",
      "solid": 7080,
      "tail": null
    },
    {
      "date": "2025-10-18",
      "solid": 8200,
      "tail": null
    },
    {
      "date": "2025-10-19",
      "solid": 7920,
      "tail": null
    },
    {
      "date": "2025-10-20",
      "solid": 8760,
      "tail": 8760
    },
    {
      "date": "2025-10-21",
      "solid": null,
      "tail": 8200
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
        "mark": "area"
      },
      {
        "field": "tail",
        "mark": "line",
        "dash": "dotted"
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

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16, y grid on, legend off, axes.y.title empty. The area series is null on the last day. A second line, dash dotted, covers the last segment. Both series tokens are the same indigo.

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
      "solid": 2.6,
      "tail": null
    },
    {
      "date": "2025-09-23",
      "solid": 1.8,
      "tail": null
    },
    {
      "date": "2025-09-24",
      "solid": 2.2,
      "tail": null
    },
    {
      "date": "2025-09-25",
      "solid": 2,
      "tail": null
    },
    {
      "date": "2025-09-26",
      "solid": 1.5,
      "tail": null
    },
    {
      "date": "2025-09-27",
      "solid": 1.9,
      "tail": null
    },
    {
      "date": "2025-09-28",
      "solid": 1.7,
      "tail": null
    },
    {
      "date": "2025-09-29",
      "solid": 1.5,
      "tail": null
    },
    {
      "date": "2025-09-30",
      "solid": 1.9,
      "tail": null
    },
    {
      "date": "2025-10-01",
      "solid": 1.7,
      "tail": null
    },
    {
      "date": "2025-10-02",
      "solid": 1.5,
      "tail": null
    },
    {
      "date": "2025-10-03",
      "solid": 1.9,
      "tail": null
    },
    {
      "date": "2025-10-04",
      "solid": 1.7,
      "tail": null
    },
    {
      "date": "2025-10-05",
      "solid": 1.5,
      "tail": null
    },
    {
      "date": "2025-10-06",
      "solid": 1.9,
      "tail": null
    },
    {
      "date": "2025-10-07",
      "solid": 1.7,
      "tail": null
    },
    {
      "date": "2025-10-08",
      "solid": 1.5,
      "tail": null
    },
    {
      "date": "2025-10-09",
      "solid": 1.9,
      "tail": null
    },
    {
      "date": "2025-10-10",
      "solid": 1.7,
      "tail": null
    },
    {
      "date": "2025-10-11",
      "solid": 1.5,
      "tail": null
    },
    {
      "date": "2025-10-12",
      "solid": 1.9,
      "tail": null
    },
    {
      "date": "2025-10-13",
      "solid": 1.7,
      "tail": null
    },
    {
      "date": "2025-10-14",
      "solid": 1.5,
      "tail": null
    },
    {
      "date": "2025-10-15",
      "solid": 1.9,
      "tail": null
    },
    {
      "date": "2025-10-16",
      "solid": 1.7,
      "tail": null
    },
    {
      "date": "2025-10-17",
      "solid": 1.5,
      "tail": null
    },
    {
      "date": "2025-10-18",
      "solid": 1.9,
      "tail": null
    },
    {
      "date": "2025-10-19",
      "solid": 1.7,
      "tail": null
    },
    {
      "date": "2025-10-20",
      "solid": 1.5,
      "tail": 1.5
    },
    {
      "date": "2025-10-21",
      "solid": null,
      "tail": 1.9
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
        "mark": "area"
      },
      {
        "field": "tail",
        "mark": "line",
        "dash": "dotted"
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

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16, y grid on, legend off, axes.y.title empty. The area series is null on the last day. A second line, dash dotted, covers the last segment. Both series tokens are the same indigo.

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
      "solid": 0.45,
      "tail": null
    },
    {
      "date": "2025-09-23",
      "solid": 0.47,
      "tail": null
    },
    {
      "date": "2025-09-24",
      "solid": 0.43,
      "tail": null
    },
    {
      "date": "2025-09-25",
      "solid": 0.42,
      "tail": null
    },
    {
      "date": "2025-09-26",
      "solid": 0.44,
      "tail": null
    },
    {
      "date": "2025-09-27",
      "solid": 0.4,
      "tail": null
    },
    {
      "date": "2025-09-28",
      "solid": 0.39,
      "tail": null
    },
    {
      "date": "2025-09-29",
      "solid": 0.41,
      "tail": null
    },
    {
      "date": "2025-09-30",
      "solid": 0.37,
      "tail": null
    },
    {
      "date": "2025-10-01",
      "solid": 0.36,
      "tail": null
    },
    {
      "date": "2025-10-02",
      "solid": 0.38,
      "tail": null
    },
    {
      "date": "2025-10-03",
      "solid": 0.34,
      "tail": null
    },
    {
      "date": "2025-10-04",
      "solid": 0.33,
      "tail": null
    },
    {
      "date": "2025-10-05",
      "solid": 0.35,
      "tail": null
    },
    {
      "date": "2025-10-06",
      "solid": 0.31,
      "tail": null
    },
    {
      "date": "2025-10-07",
      "solid": 0.3,
      "tail": null
    },
    {
      "date": "2025-10-08",
      "solid": 0.32,
      "tail": null
    },
    {
      "date": "2025-10-09",
      "solid": 0.28,
      "tail": null
    },
    {
      "date": "2025-10-10",
      "solid": 0.27,
      "tail": null
    },
    {
      "date": "2025-10-11",
      "solid": 0.29,
      "tail": null
    },
    {
      "date": "2025-10-12",
      "solid": 0.25,
      "tail": null
    },
    {
      "date": "2025-10-13",
      "solid": 0.25,
      "tail": null
    },
    {
      "date": "2025-10-14",
      "solid": 0.27,
      "tail": null
    },
    {
      "date": "2025-10-15",
      "solid": 0.25,
      "tail": null
    },
    {
      "date": "2025-10-16",
      "solid": 0.25,
      "tail": null
    },
    {
      "date": "2025-10-17",
      "solid": 0.27,
      "tail": null
    },
    {
      "date": "2025-10-18",
      "solid": 0.25,
      "tail": null
    },
    {
      "date": "2025-10-19",
      "solid": 0.25,
      "tail": null
    },
    {
      "date": "2025-10-20",
      "solid": 0.27,
      "tail": 0.27
    },
    {
      "date": "2025-10-21",
      "solid": null,
      "tail": 0.25
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
        "mark": "area"
      },
      {
        "field": "tail",
        "mark": "line",
        "dash": "dotted"
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

type combo. curve linear, points always, pointSize 2.5, fillOpacity 0.16, y grid on, legend off, axes.y.title empty. The area series is null on the last day. A second line, dash dotted, covers the last segment. Both series tokens are the same indigo.

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
      "solid": 134000,
      "tail": null
    },
    {
      "date": "2025-09-23",
      "solid": 122000,
      "tail": null
    },
    {
      "date": "2025-09-24",
      "solid": 104000,
      "tail": null
    },
    {
      "date": "2025-09-25",
      "solid": 80000,
      "tail": null
    },
    {
      "date": "2025-09-26",
      "solid": 104000,
      "tail": null
    },
    {
      "date": "2025-09-27",
      "solid": 122000,
      "tail": null
    },
    {
      "date": "2025-09-28",
      "solid": 134000,
      "tail": null
    },
    {
      "date": "2025-09-29",
      "solid": 140000,
      "tail": null
    },
    {
      "date": "2025-09-30",
      "solid": 140000,
      "tail": null
    },
    {
      "date": "2025-10-01",
      "solid": 134000,
      "tail": null
    },
    {
      "date": "2025-10-02",
      "solid": 122000,
      "tail": null
    },
    {
      "date": "2025-10-03",
      "solid": 104000,
      "tail": null
    },
    {
      "date": "2025-10-04",
      "solid": 80000,
      "tail": null
    },
    {
      "date": "2025-10-05",
      "solid": 104000,
      "tail": null
    },
    {
      "date": "2025-10-06",
      "solid": 122000,
      "tail": null
    },
    {
      "date": "2025-10-07",
      "solid": 134000,
      "tail": null
    },
    {
      "date": "2025-10-08",
      "solid": 140000,
      "tail": null
    },
    {
      "date": "2025-10-09",
      "solid": 140000,
      "tail": null
    },
    {
      "date": "2025-10-10",
      "solid": 134000,
      "tail": null
    },
    {
      "date": "2025-10-11",
      "solid": 122000,
      "tail": null
    },
    {
      "date": "2025-10-12",
      "solid": 104000,
      "tail": null
    },
    {
      "date": "2025-10-13",
      "solid": 80000,
      "tail": null
    },
    {
      "date": "2025-10-14",
      "solid": 104000,
      "tail": null
    },
    {
      "date": "2025-10-15",
      "solid": 122000,
      "tail": null
    },
    {
      "date": "2025-10-16",
      "solid": 134000,
      "tail": null
    },
    {
      "date": "2025-10-17",
      "solid": 140000,
      "tail": null
    },
    {
      "date": "2025-10-18",
      "solid": 140000,
      "tail": null
    },
    {
      "date": "2025-10-19",
      "solid": 134000,
      "tail": null
    },
    {
      "date": "2025-10-20",
      "solid": 122000,
      "tail": 122000
    },
    {
      "date": "2025-10-21",
      "solid": null,
      "tail": 104000
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
        "mark": "area"
      },
      {
        "field": "tail",
        "mark": "line",
        "dash": "dotted"
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
- **Daily line.** 30 points, curve linear, points always, a light y grid, and a soft area. The last day is a second series with dash dotted. Both series tokens are #615fff. Midnight uses #9d99ff.
- **Lists.** Sources, Pages, and Devices are one bar-list at a time. mark.track row paints a full-width wash. The chart is on demand and is not in the line or all bundle.

https://chartkit.dev/dashboards/meter
