# Vercel-style analytics

Visitors for 20 September–3 October. The paths are fictional.

Range: 14 days.

Styled after Vercel's dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by Vercel.

Default theme: soft.

## Visitors

Unique visitors.

type kpi.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#171717",
      "muted": "#666666",
      "grid": "transparent",
      "axis": "#d4d4d4",
      "accent": "#171717",
      "positive": "#0070f3",
      "negative": "#e00",
      "series": [
        "#171717",
        "#0070f3"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    2456,
    2936,
    2948,
    2796,
    2655,
    2866,
    3021,
    3406,
    3707,
    3790,
    3833,
    3663,
    3679,
    3968
  ],
  "metric": {
    "label": "Visitors",
    "value": 4100,
    "delta": 0.21,
    "format": "compact"
  },
  "mark": {
    "fillOpacity": 0.12,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 300,
    "height": 96
  },
  "a11y": {
    "alt": "Visitors are 4,100, up 21 percent."
  }
}
```

## Views

Page views.

type kpi.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#171717",
      "muted": "#666666",
      "grid": "transparent",
      "axis": "#d4d4d4",
      "accent": "#171717",
      "positive": "#0070f3",
      "negative": "#e00",
      "series": [
        "#171717",
        "#0070f3"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    5894,
    7046,
    7075,
    6710,
    6372,
    6878,
    7250,
    8174,
    8897,
    9096,
    9199,
    8791,
    8830,
    9523
  ],
  "metric": {
    "label": "Views",
    "value": 9840,
    "delta": 0.16,
    "format": "compact"
  },
  "mark": {
    "fillOpacity": 0.12,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 300,
    "height": 96
  },
  "a11y": {
    "alt": "Page views are 9,840, up 16 percent."
  }
}
```

## Bounce

Bounce rate.

type kpi. goodDirection down.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#171717",
      "muted": "#666666",
      "grid": "transparent",
      "axis": "#d4d4d4",
      "accent": "#171717",
      "positive": "#0070f3",
      "negative": "#e00",
      "series": [
        "#171717",
        "#0070f3"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    48,
    46,
    47,
    44,
    42,
    41,
    39
  ],
  "metric": {
    "label": "Bounce",
    "value": 39,
    "delta": -0.08,
    "format": {
      "style": "number",
      "suffix": "%"
    },
    "goodDirection": "down"
  },
  "mark": {
    "fillOpacity": 0.12,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 300,
    "height": 96
  },
  "a11y": {
    "alt": "Bounce rate is 39 percent, down 8 percent."
  }
}
```

## Visitors

Daily visitors. The last segment is dashed.

type area line. mark.partial dashes the last segment and mark.partialOpacity fades its fill. The series token is #171717.

```json
{
  "version": "1",
  "type": "line",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#171717",
      "muted": "#666666",
      "grid": "#ebebeb",
      "axis": "#d4d4d4",
      "accent": "#171717",
      "positive": "#0070f3",
      "negative": "#e00",
      "series": [
        "#171717",
        "#0070f3"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-09-20",
      "visitors": 2456
    },
    {
      "date": "2025-09-21",
      "visitors": 2936
    },
    {
      "date": "2025-09-22",
      "visitors": 2948
    },
    {
      "date": "2025-09-23",
      "visitors": 2796
    },
    {
      "date": "2025-09-24",
      "visitors": 2655
    },
    {
      "date": "2025-09-25",
      "visitors": 2866
    },
    {
      "date": "2025-09-26",
      "visitors": 3021
    },
    {
      "date": "2025-09-27",
      "visitors": 3406
    },
    {
      "date": "2025-09-28",
      "visitors": 3707
    },
    {
      "date": "2025-09-29",
      "visitors": 3790
    },
    {
      "date": "2025-09-30",
      "visitors": 3833
    },
    {
      "date": "2025-10-01",
      "visitors": 3663
    },
    {
      "date": "2025-10-02",
      "visitors": 3679
    },
    {
      "date": "2025-10-03",
      "visitors": 3968
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": {
      "field": "visitors"
    }
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
  "mark": {
    "area": true,
    "strokeWidth": 1.75,
    "curve": "linear",
    "points": "none",
    "fillOpacity": 0.12,
    "gradient": false,
    "partial": "dashed",
    "partialOpacity": 0.05
  },
  "size": {
    "width": 720,
    "height": 280
  },
  "a11y": {
    "alt": "Visitors rise across the fortnight. The last segment is dashed."
  }
}
```

## Devices

Visits by device.

type donut.

```json
{
  "version": "1",
  "type": "donut",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#171717",
      "muted": "#666666",
      "grid": "#ebebeb",
      "axis": "#d4d4d4",
      "accent": "#171717",
      "positive": "#0070f3",
      "negative": "#e00",
      "series": [
        "#171717",
        "#0070f3",
        "#d4d4d4"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "device": "Desktop",
      "n": 58
    },
    {
      "device": "Phone",
      "n": 34
    },
    {
      "device": "Tablet",
      "n": 8
    }
  ],
  "encoding": {
    "x": "device",
    "y": "n"
  },
  "legend": {
    "show": true
  },
  "size": {
    "width": 320,
    "height": 280
  },
  "a11y": {
    "alt": "Desktop is 58 percent of visits, phone 34, tablet 8."
  }
}
```

## Paths

Top paths.

type bar-list, mark.track row.

```json
{
  "version": "1",
  "type": "bar-list",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#171717",
      "muted": "#666666",
      "grid": "#ebebeb",
      "axis": "#d4d4d4",
      "accent": "#171717",
      "positive": "#0070f3",
      "negative": "#e00",
      "series": [
        "#171717",
        "#0070f3"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "path": "/",
      "visits": 4200
    },
    {
      "path": "/docs",
      "visits": 2100
    },
    {
      "path": "/pricing",
      "visits": 980
    },
    {
      "path": "/blog",
      "visits": 640
    }
  ],
  "encoding": {
    "x": "path",
    "y": {
      "field": "visits",
      "format": "compact"
    }
  },
  "mark": {
    "track": "row"
  },
  "size": {
    "width": 980,
    "height": 140
  },
  "a11y": {
    "alt": "The home path has the most visits, then docs, pricing, and blog."
  }
}
```

## What produces this look

- **Visitors.** A black area line on white. mark.partial dashes the last day. axes.y is hidden. fontFamily is Inter.
- **Lists.** Paths are a bar-list with a row track. Devices are a donut. No favicon and no deployment mark.
- **Data.** Paths and counts are fictional.

https://chartkit.dev/dashboards/edge
