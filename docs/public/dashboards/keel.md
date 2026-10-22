# Sentry-style issues

Issues for the last 14 days.

Range: 14 days.

Styled after Sentry's dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by Sentry.

Default theme: soft.

## Event volume

Error, warning, and info.

type bar with encoding.series and mark.stack stack. theme.tokens.series is error, warning, and info. axes.y.title is empty. There is no band and no release rule. The 24h variant is the same bar. The area variant is type stacked-area.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1f1633",
      "muted": "#6a6275",
      "grid": "#eeeaf2",
      "axis": "#ddd6e6",
      "accent": "#7553ff",
      "positive": "#1b7c4d",
      "negative": "#f55459",
      "series": [
        "#f55459",
        "#ff9838",
        "#8d95a3"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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
    "radiusEnds": "all",
    "stackGap": 2,
    "gap": 0.28
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
    "position": "top"
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 620,
    "height": 260
  },
  "a11y": {
    "alt": "Errors are the largest share of events across the 14 days."
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
      "surface": "#ffffff",
      "text": "#1f1633",
      "muted": "#6a6275",
      "grid": "#eeeaf2",
      "axis": "#ddd6e6",
      "accent": "#7553ff",
      "positive": "#1b7c4d",
      "negative": "#f55459",
      "series": [
        "#f55459",
        "#ff9838",
        "#8d95a3"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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
    "radiusEnds": "all",
    "stackGap": 2,
    "gap": 0.28
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
    "position": "top"
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 620,
    "height": 260
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
      "surface": "#ffffff",
      "text": "#1f1633",
      "muted": "#6a6275",
      "grid": "#eeeaf2",
      "axis": "#ddd6e6",
      "accent": "#7553ff",
      "positive": "#1b7c4d",
      "negative": "#f55459",
      "series": [
        "#f55459",
        "#ff9838",
        "#8d95a3"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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
    "fillOpacity": 0.85,
    "stackGap": 2,
    "gradient": true
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
    "position": "top"
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 620,
    "height": 260
  },
  "a11y": {
    "alt": "The stacked area shows the same 14 days as the bars."
  }
}
```

## Response

p50 and p95.

type line. This chart's series tokens are the purple accent for p50 and the warning colour for p95. axes.y.title is empty.

```json
{
  "version": "1",
  "type": "line",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1f1633",
      "muted": "#6a6275",
      "grid": "#eeeaf2",
      "axis": "#ddd6e6",
      "accent": "#7553ff",
      "positive": "#1b7c4d",
      "negative": "#f55459",
      "series": [
        "#7553ff",
        "#ff9838"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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
      "title": "",
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
    "curve": "linear",
    "strokeWidth": 2,
    "points": "none"
  },
  "size": {
    "width": 620,
    "height": 260
  },
  "a11y": {
    "alt": "p95 peaks at 410 milliseconds at noon. p50 stays under 140."
  }
}
```

## Checkout timeout

checkout.pay. Last seen 2 min ago. Age 4d. 27 events, 6 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1f1633",
      "muted": "#6a6275",
      "grid": "#eeeaf2",
      "axis": "#ddd6e6",
      "accent": "#7553ff",
      "positive": "#1b7c4d",
      "negative": "#f55459",
      "series": [
        "#7553ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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
    "gap": 0.15
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
    "width": 120,
    "height": 36
  },
  "a11y": {
    "alt": "Checkout timeout over seven days."
  }
}
```

## Map tile retry

maps.load. Last seen 18 min ago. Age 12d. 17 events, 4 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1f1633",
      "muted": "#6a6275",
      "grid": "#eeeaf2",
      "axis": "#ddd6e6",
      "accent": "#7553ff",
      "positive": "#1b7c4d",
      "negative": "#f55459",
      "series": [
        "#7553ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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
    "gap": 0.15
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
    "width": 120,
    "height": 36
  },
  "a11y": {
    "alt": "Map tile retry over seven days."
  }
}
```

## Queue lag

worker.tick. Last seen 1 hr ago. Age 9d. 27 events, 11 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1f1633",
      "muted": "#6a6275",
      "grid": "#eeeaf2",
      "axis": "#ddd6e6",
      "accent": "#7553ff",
      "positive": "#1b7c4d",
      "negative": "#f55459",
      "series": [
        "#7553ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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
    "gap": 0.15
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
    "width": 120,
    "height": 36
  },
  "a11y": {
    "alt": "Queue lag over seven days."
  }
}
```

## Auth clock skew

auth.verify. Last seen 3 hr ago. Age 2d. 14 events, 3 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1f1633",
      "muted": "#6a6275",
      "grid": "#eeeaf2",
      "axis": "#ddd6e6",
      "accent": "#7553ff",
      "positive": "#1b7c4d",
      "negative": "#f55459",
      "series": [
        "#7553ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
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
    "gap": 0.15
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
    "width": 120,
    "height": 36
  },
  "a11y": {
    "alt": "Auth clock skew over seven days."
  }
}
```

## Null price

cart.total. Last seen 5 hr ago. Age 6d. 9 events, 2 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1f1633",
      "muted": "#6a6275",
      "grid": "#eeeaf2",
      "axis": "#ddd6e6",
      "accent": "#7553ff",
      "positive": "#1b7c4d",
      "negative": "#f55459",
      "series": [
        "#7553ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "day": "1",
      "events": 1
    },
    {
      "day": "2",
      "events": 0
    },
    {
      "day": "3",
      "events": 2
    },
    {
      "day": "4",
      "events": 1
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
      "events": 1
    }
  ],
  "encoding": {
    "x": "day",
    "y": "events"
  },
  "mark": {
    "cornerRadius": 1,
    "gap": 0.15
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
    "width": 120,
    "height": 36
  },
  "a11y": {
    "alt": "Null price over seven days."
  }
}
```

## Webhook 409

hooks.deliver. Last seen 1 day ago. Age 15d. 21 events, 8 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1f1633",
      "muted": "#6a6275",
      "grid": "#eeeaf2",
      "axis": "#ddd6e6",
      "accent": "#7553ff",
      "positive": "#1b7c4d",
      "negative": "#f55459",
      "series": [
        "#7553ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "day": "1",
      "events": 3
    },
    {
      "day": "2",
      "events": 2
    },
    {
      "day": "3",
      "events": 4
    },
    {
      "day": "4",
      "events": 3
    },
    {
      "day": "5",
      "events": 4
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
    "gap": 0.15
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
    "width": 120,
    "height": 36
  },
  "a11y": {
    "alt": "Webhook 409 over seven days."
  }
}
```

## What produces this look

- **Issues.** The table is the page. Each row has a title, a culprit, last seen, age, a 36px bar spark in the purple series token, an events count, and a users count.
- **Light first.** The default tokens are the light set: card #ffffff, ink #1f1633, accent #7553ff, error #f55459, warning #ff9838, info #8d95a3. Midnight swaps them.
- **Volume.** The stacked bar is a secondary card. It has no highlighted band and no release label. 14d, 24h, and Area are variants of that card.

https://chartkit.dev/dashboards/keel
