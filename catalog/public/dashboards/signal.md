# Datadog-style monitors

Request rate, errors, and latency for 1–24 October. The figures are fictional.

Range: 1–24 Oct.

Styled after Datadog and Grafana dashboards to show ChartKit's styling flexibility. Not affiliated with or endorsed by Datadog or Grafana.

Default theme: midnight.

## Requests

Requests per minute.

type kpi. The spark is the request series. surface and grid are transparent.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#d8d9da",
      "muted": "#8e8e8e",
      "grid": "transparent",
      "axis": "#444c52",
      "accent": "#73bf69",
      "positive": "#73bf69",
      "negative": "#f2495c",
      "series": [
        "#73bf69",
        "#f2cc0c",
        "#8ab8ff",
        "#ff9830"
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    810,
    951,
    985,
    938,
    801,
    747,
    853,
    1119,
    1147,
    1286,
    1111,
    949,
    907,
    1133,
    1350,
    1539,
    1926,
    1537,
    1290,
    1127,
    1178,
    1415,
    1588,
    1670
  ],
  "metric": {
    "label": "Requests",
    "value": 1284,
    "delta": 0.18,
    "format": {
      "style": "compact",
      "suffix": "/m"
    }
  },
  "mark": {
    "fillOpacity": 0.2,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 280,
    "height": 96
  },
  "a11y": {
    "alt": "Requests are 1,284 per minute, up 18 percent."
  }
}
```

## Errors

Error count.

type kpi. goodDirection down, so a falling error count is the positive tone.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#d8d9da",
      "muted": "#8e8e8e",
      "grid": "transparent",
      "axis": "#444c52",
      "accent": "#73bf69",
      "positive": "#73bf69",
      "negative": "#f2495c",
      "series": [
        "#73bf69",
        "#f2cc0c",
        "#8ab8ff",
        "#ff9830"
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    13,
    14,
    13,
    11,
    9,
    10,
    10,
    14,
    12,
    14,
    8,
    7,
    6,
    11,
    11,
    11,
    10,
    9,
    5,
    4,
    8,
    10,
    12,
    11
  ],
  "metric": {
    "label": "Errors",
    "value": 8,
    "delta": -0.22,
    "format": "compact",
    "goodDirection": "down"
  },
  "mark": {
    "fillOpacity": 0.2,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 280,
    "height": 96
  },
  "a11y": {
    "alt": "Errors are 8, down 22 percent."
  }
}
```

## p95

Tail latency.

type kpi. The value is milliseconds.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#d8d9da",
      "muted": "#8e8e8e",
      "grid": "transparent",
      "axis": "#444c52",
      "accent": "#73bf69",
      "positive": "#73bf69",
      "negative": "#f2495c",
      "series": [
        "#73bf69",
        "#f2cc0c",
        "#8ab8ff",
        "#ff9830"
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    71,
    76,
    75,
    73,
    68,
    64,
    68,
    74,
    79,
    80,
    70,
    63,
    61,
    69,
    74,
    74,
    72,
    70,
    66,
    67,
    61,
    67,
    74,
    77
  ],
  "metric": {
    "label": "p95",
    "value": 86,
    "delta": 0.04,
    "format": {
      "style": "number",
      "suffix": " ms"
    }
  },
  "mark": {
    "fillOpacity": 0.2,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 280,
    "height": 96
  },
  "a11y": {
    "alt": "p95 latency is 86 milliseconds, up 4 percent."
  }
}
```

## Saturation

CPU saturation.

type gauge. min 0, max 100, target 70.

```json
{
  "version": "1",
  "type": "gauge",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#d8d9da",
      "muted": "#8e8e8e",
      "grid": "transparent",
      "axis": "#444c52",
      "accent": "#73bf69",
      "positive": "#73bf69",
      "negative": "#f2495c",
      "series": [
        "#73bf69",
        "#f2cc0c",
        "#8ab8ff",
        "#ff9830"
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "metric": {
    "label": "Saturation",
    "value": 64,
    "min": 0,
    "max": 100,
    "target": 70,
    "format": {
      "style": "number",
      "suffix": "%"
    }
  },
  "size": {
    "width": 280,
    "height": 120
  },
  "a11y": {
    "alt": "Saturation is 64 percent, under a target of 70."
  }
}
```

## Request rate

This period against the previous one.

type combo. The current series is a solid green line. The prior series is dashed. legend.show is false. axes.y.title is empty. fontFamily is Roboto.

```json
{
  "version": "1",
  "type": "combo",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#181b1f",
      "text": "#d8d9da",
      "muted": "#8e8e8e",
      "grid": "#2c3235",
      "axis": "#444c52",
      "accent": "#73bf69",
      "positive": "#73bf69",
      "negative": "#f2495c",
      "series": [
        "#73bf69",
        "#f2cc0c",
        "#8ab8ff",
        "#ff9830"
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-10-01",
      "requests": 810,
      "prior": 783
    },
    {
      "date": "2025-10-02",
      "requests": 951,
      "prior": 748
    },
    {
      "date": "2025-10-03",
      "requests": 985,
      "prior": 747
    },
    {
      "date": "2025-10-04",
      "requests": 938,
      "prior": 636
    },
    {
      "date": "2025-10-05",
      "requests": 801,
      "prior": 606
    },
    {
      "date": "2025-10-06",
      "requests": 747,
      "prior": 716
    },
    {
      "date": "2025-10-07",
      "requests": 853,
      "prior": 936
    },
    {
      "date": "2025-10-08",
      "requests": 1119,
      "prior": 982
    },
    {
      "date": "2025-10-09",
      "requests": 1147,
      "prior": 929
    },
    {
      "date": "2025-10-10",
      "requests": 1286,
      "prior": 863
    },
    {
      "date": "2025-10-11",
      "requests": 1111,
      "prior": 799
    },
    {
      "date": "2025-10-12",
      "requests": 949,
      "prior": 833
    },
    {
      "date": "2025-10-13",
      "requests": 907,
      "prior": 842
    },
    {
      "date": "2025-10-14",
      "requests": 1133,
      "prior": 1058
    },
    {
      "date": "2025-10-15",
      "requests": 1350,
      "prior": 997
    },
    {
      "date": "2025-10-16",
      "requests": 1539,
      "prior": 1061
    },
    {
      "date": "2025-10-17",
      "requests": 1926,
      "prior": 878
    },
    {
      "date": "2025-10-18",
      "requests": 1537,
      "prior": 902
    },
    {
      "date": "2025-10-19",
      "requests": 1290,
      "prior": 976
    },
    {
      "date": "2025-10-20",
      "requests": 1127,
      "prior": 971
    },
    {
      "date": "2025-10-21",
      "requests": 1178,
      "prior": 1166
    },
    {
      "date": "2025-10-22",
      "requests": 1415,
      "prior": 1244
    },
    {
      "date": "2025-10-23",
      "requests": 1588,
      "prior": 1095
    },
    {
      "date": "2025-10-24",
      "requests": 1670,
      "prior": 1104
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "requests",
        "mark": "line"
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
      "grid": true
    }
  },
  "legend": {
    "show": false
  },
  "mark": {
    "strokeWidth": 2,
    "curve": "linear",
    "points": "none",
    "fillOpacity": 0,
    "gradient": false
  },
  "size": {
    "width": 720,
    "height": 280
  },
  "a11y": {
    "alt": "Request rate rises across October and spikes on the 17th."
  }
}
```

## Error rate

Errors per minute.

type line. The series token is the negative colour.

```json
{
  "version": "1",
  "type": "line",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#181b1f",
      "text": "#d8d9da",
      "muted": "#8e8e8e",
      "grid": "#2c3235",
      "axis": "#444c52",
      "accent": "#73bf69",
      "positive": "#73bf69",
      "negative": "#f2495c",
      "series": [
        "#f2495c"
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-10-01",
      "errors": 13
    },
    {
      "date": "2025-10-02",
      "errors": 14
    },
    {
      "date": "2025-10-03",
      "errors": 13
    },
    {
      "date": "2025-10-04",
      "errors": 11
    },
    {
      "date": "2025-10-05",
      "errors": 9
    },
    {
      "date": "2025-10-06",
      "errors": 10
    },
    {
      "date": "2025-10-07",
      "errors": 10
    },
    {
      "date": "2025-10-08",
      "errors": 14
    },
    {
      "date": "2025-10-09",
      "errors": 12
    },
    {
      "date": "2025-10-10",
      "errors": 14
    },
    {
      "date": "2025-10-11",
      "errors": 8
    },
    {
      "date": "2025-10-12",
      "errors": 7
    },
    {
      "date": "2025-10-13",
      "errors": 6
    },
    {
      "date": "2025-10-14",
      "errors": 11
    },
    {
      "date": "2025-10-15",
      "errors": 11
    },
    {
      "date": "2025-10-16",
      "errors": 11
    },
    {
      "date": "2025-10-17",
      "errors": 10
    },
    {
      "date": "2025-10-18",
      "errors": 9
    },
    {
      "date": "2025-10-19",
      "errors": 5
    },
    {
      "date": "2025-10-20",
      "errors": 4
    },
    {
      "date": "2025-10-21",
      "errors": 8
    },
    {
      "date": "2025-10-22",
      "errors": 10
    },
    {
      "date": "2025-10-23",
      "errors": 12
    },
    {
      "date": "2025-10-24",
      "errors": 11
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": {
      "field": "errors"
    }
  },
  "axes": {
    "x": {
      "grid": false,
      "ticks": 4
    },
    "y": {
      "title": "",
      "grid": true
    }
  },
  "legend": {
    "show": false
  },
  "mark": {
    "strokeWidth": 1.75,
    "curve": "linear",
    "points": "none"
  },
  "size": {
    "width": 360,
    "height": 280
  },
  "a11y": {
    "alt": "Errors drift down from 12 to 8 across the period."
  }
}
```

## Latency

p50 and p95.

type line. Two series, p50 and p95. No gradient.

```json
{
  "version": "1",
  "type": "line",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#181b1f",
      "text": "#d8d9da",
      "muted": "#8e8e8e",
      "grid": "#2c3235",
      "axis": "#444c52",
      "accent": "#73bf69",
      "positive": "#73bf69",
      "negative": "#f2495c",
      "series": [
        "#73bf69",
        "#f2cc0c",
        "#8ab8ff",
        "#ff9830"
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-10-01",
      "p50": 43,
      "p95": 71
    },
    {
      "date": "2025-10-02",
      "p50": 47,
      "p95": 76
    },
    {
      "date": "2025-10-03",
      "p50": 45,
      "p95": 75
    },
    {
      "date": "2025-10-04",
      "p50": 42,
      "p95": 73
    },
    {
      "date": "2025-10-05",
      "p50": 36,
      "p95": 68
    },
    {
      "date": "2025-10-06",
      "p50": 36,
      "p95": 64
    },
    {
      "date": "2025-10-07",
      "p50": 39,
      "p95": 68
    },
    {
      "date": "2025-10-08",
      "p50": 44,
      "p95": 74
    },
    {
      "date": "2025-10-09",
      "p50": 48,
      "p95": 79
    },
    {
      "date": "2025-10-10",
      "p50": 48,
      "p95": 80
    },
    {
      "date": "2025-10-11",
      "p50": 42,
      "p95": 70
    },
    {
      "date": "2025-10-12",
      "p50": 34,
      "p95": 63
    },
    {
      "date": "2025-10-13",
      "p50": 31,
      "p95": 61
    },
    {
      "date": "2025-10-14",
      "p50": 38,
      "p95": 69
    },
    {
      "date": "2025-10-15",
      "p50": 42,
      "p95": 74
    },
    {
      "date": "2025-10-16",
      "p50": 46,
      "p95": 74
    },
    {
      "date": "2025-10-17",
      "p50": 43,
      "p95": 72
    },
    {
      "date": "2025-10-18",
      "p50": 40,
      "p95": 70
    },
    {
      "date": "2025-10-19",
      "p50": 35,
      "p95": 66
    },
    {
      "date": "2025-10-20",
      "p50": 35,
      "p95": 67
    },
    {
      "date": "2025-10-21",
      "p50": 33,
      "p95": 61
    },
    {
      "date": "2025-10-22",
      "p50": 38,
      "p95": 67
    },
    {
      "date": "2025-10-23",
      "p50": 44,
      "p95": 74
    },
    {
      "date": "2025-10-24",
      "p50": 46,
      "p95": 77
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "p50",
        "title": "p50"
      },
      {
        "field": "p95",
        "title": "p95"
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
      "grid": true
    }
  },
  "legend": {
    "show": true
  },
  "mark": {
    "strokeWidth": 1.75,
    "curve": "linear",
    "points": "none"
  },
  "size": {
    "width": 520,
    "height": 220
  },
  "a11y": {
    "alt": "p95 stays above p50. Both are in milliseconds."
  }
}
```

## Services

Requests by service.

type bar-list, mark.track row. The wash is series[0].

```json
{
  "version": "1",
  "type": "bar-list",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#181b1f",
      "text": "#d8d9da",
      "muted": "#8e8e8e",
      "grid": "#2c3235",
      "axis": "#444c52",
      "accent": "#73bf69",
      "positive": "#73bf69",
      "negative": "#f2495c",
      "series": [
        "#73bf69",
        "#f2cc0c",
        "#8ab8ff",
        "#ff9830"
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "service": "edge",
      "requests": 48200
    },
    {
      "service": "api",
      "requests": 36100
    },
    {
      "service": "worker",
      "requests": 21400
    },
    {
      "service": "auth",
      "requests": 9800
    }
  ],
  "encoding": {
    "x": "service",
    "y": {
      "field": "requests",
      "format": "compact"
    }
  },
  "mark": {
    "track": "row"
  },
  "size": {
    "width": 520,
    "height": 140
  },
  "a11y": {
    "alt": "Edge serves the most requests, then api, worker, and auth."
  }
}
```

## What produces this look

- **Panels.** A dark panel grid: four scorecards, a request-rate line with a dashed prior period, an error line in the negative token, p50 and p95, and a service list. fontFamily is Roboto, which Grafana uses. Datadog's own face is not shipped.
- **Palette.** Midnight tokens: green #73bf69, yellow #f2cc0c, blue #8ab8ff, orange #ff9830, card #181b1f, grid #2c3235. The page background is #111217. Marks come from theme.tokens, not from page CSS.
- **Data.** Every series is generated. No customer names, hosts, or live metrics.

https://chartkit.dev/dashboards/signal
