# Sentry-style issues

Issues for the last 14 days.

Range: 14 days.

Styled after Sentry's dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by Sentry.

Default theme: midnight.

## Event volume

Error, warning, and info.

type bar with encoding.series and mark.stack stack. theme.tokens.series is error #fa6769, warning #ff9838, and info #a4a8b4 in the dark tokens. The 24h variant is the same bar. The area variant is type stacked-area. Ship uses labelPosition end, so the label sits above the plot.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#241f33",
      "text": "#eeeaf6",
      "muted": "#a39bb0",
      "grid": "#322b42",
      "axis": "#3d3550",
      "accent": "#7b52ff",
      "positive": "#6dcea0",
      "negative": "#fa6769",
      "series": [
        "#fa6769",
        "#ff9838",
        "#a4a8b4"
      ]
    }
  },
  "data": [
    {
      "day": "8",
      "level": "Error",
      "events": 22
    },
    {
      "day": "8",
      "level": "Warning",
      "events": 14
    },
    {
      "day": "8",
      "level": "Info",
      "events": 12
    },
    {
      "day": "9",
      "level": "Error",
      "events": 28
    },
    {
      "day": "9",
      "level": "Warning",
      "events": 16
    },
    {
      "day": "9",
      "level": "Info",
      "events": 14
    },
    {
      "day": "10",
      "level": "Error",
      "events": 24
    },
    {
      "day": "10",
      "level": "Warning",
      "events": 18
    },
    {
      "day": "10",
      "level": "Info",
      "events": 11
    },
    {
      "day": "11",
      "level": "Error",
      "events": 30
    },
    {
      "day": "11",
      "level": "Warning",
      "events": 15
    },
    {
      "day": "11",
      "level": "Info",
      "events": 13
    },
    {
      "day": "12",
      "level": "Error",
      "events": 26
    },
    {
      "day": "12",
      "level": "Warning",
      "events": 17
    },
    {
      "day": "12",
      "level": "Info",
      "events": 16
    },
    {
      "day": "13",
      "level": "Error",
      "events": 18
    },
    {
      "day": "13",
      "level": "Warning",
      "events": 12
    },
    {
      "day": "13",
      "level": "Info",
      "events": 10
    },
    {
      "day": "14",
      "level": "Error",
      "events": 16
    },
    {
      "day": "14",
      "level": "Warning",
      "events": 9
    },
    {
      "day": "14",
      "level": "Info",
      "events": 8
    },
    {
      "day": "15",
      "level": "Error",
      "events": 40
    },
    {
      "day": "15",
      "level": "Warning",
      "events": 22
    },
    {
      "day": "15",
      "level": "Info",
      "events": 18
    },
    {
      "day": "16",
      "level": "Error",
      "events": 52
    },
    {
      "day": "16",
      "level": "Warning",
      "events": 30
    },
    {
      "day": "16",
      "level": "Info",
      "events": 16
    },
    {
      "day": "17",
      "level": "Error",
      "events": 44
    },
    {
      "day": "17",
      "level": "Warning",
      "events": 28
    },
    {
      "day": "17",
      "level": "Info",
      "events": 22
    },
    {
      "day": "18",
      "level": "Error",
      "events": 33
    },
    {
      "day": "18",
      "level": "Warning",
      "events": 20
    },
    {
      "day": "18",
      "level": "Info",
      "events": 24
    },
    {
      "day": "19",
      "level": "Error",
      "events": 21
    },
    {
      "day": "19",
      "level": "Warning",
      "events": 14
    },
    {
      "day": "19",
      "level": "Info",
      "events": 15
    },
    {
      "day": "20",
      "level": "Error",
      "events": 18
    },
    {
      "day": "20",
      "level": "Warning",
      "events": 12
    },
    {
      "day": "20",
      "level": "Info",
      "events": 14
    },
    {
      "day": "21",
      "level": "Error",
      "events": 16
    },
    {
      "day": "21",
      "level": "Warning",
      "events": 11
    },
    {
      "day": "21",
      "level": "Info",
      "events": 13
    }
  ],
  "encoding": {
    "x": "day",
    "y": "events",
    "series": "level"
  },
  "mark": {
    "stack": "stack",
    "cornerRadius": 2,
    "gap": 0.28
  },
  "axes": {
    "x": {
      "grid": false
    },
    "y": {
      "grid": true
    }
  },
  "legend": {
    "position": "top"
  },
  "tooltip": {
    "mode": "index"
  },
  "annotations": [
    {
      "type": "band",
      "axis": "x",
      "from": "15",
      "to": "16",
      "label": "2.4",
      "opacity": 0.16,
      "color": "text"
    },
    {
      "type": "rule",
      "axis": "x",
      "value": "16",
      "label": "Ship",
      "labelPosition": "end",
      "dash": "solid",
      "color": "muted"
    }
  ],
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Errors peak on the 16th, inside the 2.4 window."
  }
}
```

### 24h

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#241f33",
      "text": "#eeeaf6",
      "muted": "#a39bb0",
      "grid": "#322b42",
      "axis": "#3d3550",
      "accent": "#7b52ff",
      "positive": "#6dcea0",
      "negative": "#fa6769",
      "series": [
        "#fa6769",
        "#ff9838",
        "#a4a8b4"
      ]
    }
  },
  "data": [
    {
      "day": "00",
      "level": "Error",
      "events": 6
    },
    {
      "day": "00",
      "level": "Warning",
      "events": 3
    },
    {
      "day": "00",
      "level": "Info",
      "events": 2
    },
    {
      "day": "03",
      "level": "Error",
      "events": 4
    },
    {
      "day": "03",
      "level": "Warning",
      "events": 2
    },
    {
      "day": "03",
      "level": "Info",
      "events": 2
    },
    {
      "day": "06",
      "level": "Error",
      "events": 5
    },
    {
      "day": "06",
      "level": "Warning",
      "events": 3
    },
    {
      "day": "06",
      "level": "Info",
      "events": 1
    },
    {
      "day": "09",
      "level": "Error",
      "events": 8
    },
    {
      "day": "09",
      "level": "Warning",
      "events": 4
    },
    {
      "day": "09",
      "level": "Info",
      "events": 3
    },
    {
      "day": "12",
      "level": "Error",
      "events": 14
    },
    {
      "day": "12",
      "level": "Warning",
      "events": 7
    },
    {
      "day": "12",
      "level": "Info",
      "events": 4
    },
    {
      "day": "15",
      "level": "Error",
      "events": 11
    },
    {
      "day": "15",
      "level": "Warning",
      "events": 6
    },
    {
      "day": "15",
      "level": "Info",
      "events": 3
    },
    {
      "day": "18",
      "level": "Error",
      "events": 7
    },
    {
      "day": "18",
      "level": "Warning",
      "events": 4
    },
    {
      "day": "18",
      "level": "Info",
      "events": 2
    },
    {
      "day": "21",
      "level": "Error",
      "events": 4
    },
    {
      "day": "21",
      "level": "Warning",
      "events": 2
    },
    {
      "day": "21",
      "level": "Info",
      "events": 2
    }
  ],
  "encoding": {
    "x": "day",
    "y": "events",
    "series": "level"
  },
  "mark": {
    "stack": "stack",
    "cornerRadius": 2,
    "gap": 0.28
  },
  "axes": {
    "x": {
      "grid": false
    },
    "y": {
      "grid": true
    }
  },
  "legend": {
    "position": "top"
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Errors peak at noon in the last 24 hours."
  }
}
```

### Area

```json
{
  "version": "1",
  "type": "stacked-area",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#241f33",
      "text": "#eeeaf6",
      "muted": "#a39bb0",
      "grid": "#322b42",
      "axis": "#3d3550",
      "accent": "#7b52ff",
      "positive": "#6dcea0",
      "negative": "#fa6769",
      "series": [
        "#fa6769",
        "#ff9838",
        "#a4a8b4"
      ]
    }
  },
  "data": [
    {
      "day": "8",
      "Error": 22,
      "Warning": 14,
      "Info": 12
    },
    {
      "day": "9",
      "Error": 28,
      "Warning": 16,
      "Info": 14
    },
    {
      "day": "10",
      "Error": 24,
      "Warning": 18,
      "Info": 11
    },
    {
      "day": "11",
      "Error": 30,
      "Warning": 15,
      "Info": 13
    },
    {
      "day": "12",
      "Error": 26,
      "Warning": 17,
      "Info": 16
    },
    {
      "day": "13",
      "Error": 18,
      "Warning": 12,
      "Info": 10
    },
    {
      "day": "14",
      "Error": 16,
      "Warning": 9,
      "Info": 8
    },
    {
      "day": "15",
      "Error": 40,
      "Warning": 22,
      "Info": 18
    },
    {
      "day": "16",
      "Error": 52,
      "Warning": 30,
      "Info": 16
    },
    {
      "day": "17",
      "Error": 44,
      "Warning": 28,
      "Info": 22
    },
    {
      "day": "18",
      "Error": 33,
      "Warning": 20,
      "Info": 24
    },
    {
      "day": "19",
      "Error": 21,
      "Warning": 14,
      "Info": 15
    },
    {
      "day": "20",
      "Error": 18,
      "Warning": 12,
      "Info": 14
    },
    {
      "day": "21",
      "Error": 16,
      "Warning": 11,
      "Info": 13
    }
  ],
  "encoding": {
    "x": "day",
    "y": [
      {
        "field": "Error",
        "title": "Error"
      },
      {
        "field": "Warning",
        "title": "Warning"
      },
      {
        "field": "Info",
        "title": "Info"
      }
    ]
  },
  "mark": {
    "fillOpacity": 0.85
  },
  "axes": {
    "x": {
      "grid": false
    },
    "y": {
      "grid": true
    }
  },
  "legend": {
    "position": "top"
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "The stacked area shows the same 14 days as the bars."
  }
}
```

## Response

p50 and p95.

type line. This chart's theme.tokens.series is purple for p50 and the warning colour for p95, separate from the error series.

```json
{
  "version": "1",
  "type": "line",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#241f33",
      "text": "#eeeaf6",
      "muted": "#a39bb0",
      "grid": "#322b42",
      "axis": "#3d3550",
      "accent": "#7b52ff",
      "positive": "#6dcea0",
      "negative": "#fa6769",
      "series": [
        "#7b52ff",
        "#ffb15a"
      ]
    }
  },
  "data": [
    {
      "hour": "00",
      "p50": 80,
      "p95": 210
    },
    {
      "hour": "04",
      "p50": 90,
      "p95": 240
    },
    {
      "hour": "08",
      "p50": 110,
      "p95": 320
    },
    {
      "hour": "12",
      "p50": 140,
      "p95": 410
    },
    {
      "hour": "16",
      "p50": 120,
      "p95": 360
    },
    {
      "hour": "20",
      "p50": 95,
      "p95": 250
    }
  ],
  "encoding": {
    "x": "hour",
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
      "grid": false
    },
    "y": {
      "grid": true
    }
  },
  "legend": {
    "position": "top"
  },
  "tooltip": {
    "mode": "index"
  },
  "mark": {
    "strokeWidth": 2
  },
  "size": {
    "width": 1100,
    "height": 240
  },
  "a11y": {
    "alt": "p95 peaks at 410 milliseconds at noon. p50 stays under 140."
  }
}
```

## Checkout timeout

Error. 27 events, 6 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#241f33",
      "text": "#eeeaf6",
      "muted": "#a39bb0",
      "grid": "#322b42",
      "axis": "#3d3550",
      "accent": "#7b52ff",
      "positive": "#6dcea0",
      "negative": "#fa6769",
      "series": [
        "#7b52ff"
      ]
    }
  },
  "data": [
    {
      "day": "1",
      "events": 2
    },
    {
      "day": "2",
      "events": 4
    },
    {
      "day": "3",
      "events": 9
    },
    {
      "day": "4",
      "events": 6
    },
    {
      "day": "5",
      "events": 3
    },
    {
      "day": "6",
      "events": 2
    },
    {
      "day": "7",
      "events": 1
    }
  ],
  "encoding": {
    "x": "day",
    "y": "events"
  },
  "mark": {
    "cornerRadius": 1,
    "gap": 0.2
  },
  "axes": {
    "x": false,
    "y": false
  },
  "legend": {
    "show": false
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 220,
    "height": 72
  },
  "a11y": {
    "alt": "Checkout timeout over seven days."
  }
}
```

## Map tile retry

Warning. 17 events, 4 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#241f33",
      "text": "#eeeaf6",
      "muted": "#a39bb0",
      "grid": "#322b42",
      "axis": "#3d3550",
      "accent": "#7b52ff",
      "positive": "#6dcea0",
      "negative": "#fa6769",
      "series": [
        "#7b52ff"
      ]
    }
  },
  "data": [
    {
      "day": "1",
      "events": 1
    },
    {
      "day": "2",
      "events": 1
    },
    {
      "day": "3",
      "events": 2
    },
    {
      "day": "4",
      "events": 5
    },
    {
      "day": "5",
      "events": 4
    },
    {
      "day": "6",
      "events": 2
    },
    {
      "day": "7",
      "events": 2
    }
  ],
  "encoding": {
    "x": "day",
    "y": "events"
  },
  "mark": {
    "cornerRadius": 1,
    "gap": 0.2
  },
  "axes": {
    "x": false,
    "y": false
  },
  "legend": {
    "show": false
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 220,
    "height": 72
  },
  "a11y": {
    "alt": "Map tile retry over seven days."
  }
}
```

## Queue lag

Info. 27 events, 11 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#241f33",
      "text": "#eeeaf6",
      "muted": "#a39bb0",
      "grid": "#322b42",
      "axis": "#3d3550",
      "accent": "#7b52ff",
      "positive": "#6dcea0",
      "negative": "#fa6769",
      "series": [
        "#7b52ff"
      ]
    }
  },
  "data": [
    {
      "day": "1",
      "events": 6
    },
    {
      "day": "2",
      "events": 5
    },
    {
      "day": "3",
      "events": 4
    },
    {
      "day": "4",
      "events": 4
    },
    {
      "day": "5",
      "events": 3
    },
    {
      "day": "6",
      "events": 3
    },
    {
      "day": "7",
      "events": 2
    }
  ],
  "encoding": {
    "x": "day",
    "y": "events"
  },
  "mark": {
    "cornerRadius": 1,
    "gap": 0.2
  },
  "axes": {
    "x": false,
    "y": false
  },
  "legend": {
    "show": false
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 220,
    "height": 72
  },
  "a11y": {
    "alt": "Queue lag over seven days."
  }
}
```

## Auth clock skew

Error. 14 events, 3 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#241f33",
      "text": "#eeeaf6",
      "muted": "#a39bb0",
      "grid": "#322b42",
      "axis": "#3d3550",
      "accent": "#7b52ff",
      "positive": "#6dcea0",
      "negative": "#fa6769",
      "series": [
        "#7b52ff"
      ]
    }
  },
  "data": [
    {
      "day": "1",
      "events": 0
    },
    {
      "day": "2",
      "events": 1
    },
    {
      "day": "3",
      "events": 1
    },
    {
      "day": "4",
      "events": 8
    },
    {
      "day": "5",
      "events": 3
    },
    {
      "day": "6",
      "events": 1
    },
    {
      "day": "7",
      "events": 0
    }
  ],
  "encoding": {
    "x": "day",
    "y": "events"
  },
  "mark": {
    "cornerRadius": 1,
    "gap": 0.2
  },
  "axes": {
    "x": false,
    "y": false
  },
  "legend": {
    "show": false
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 220,
    "height": 72
  },
  "a11y": {
    "alt": "Auth clock skew over seven days."
  }
}
```

## What produces this look

- **Dark first.** The spec theme defaults to the dark token object: page-adjacent card #241f33, ink #eeeaf6, error #fa6769, warning #ff9838, info #a4a8b4, accent #7b52ff. Soft swaps those tokens.
- **Release band.** The band colour is the text token, so the 2.4 label is not the error red. Ship uses labelPosition end and the muted token, above the plot.
- **Response.** p50 uses the purple accent and p95 the warning colour, on that chart's theme.tokens.series.
- **Issues.** Each row is a bar spec with both axes off and the purple series token, so the seven days read as a histogram. The event count and the user count sit on the right.
- **Window.** 14d is the stacked bar. 24h is the same bar over eight hours. Area is a stacked-area of the 14 days.

https://chartkit.dev/dashboards/keel
