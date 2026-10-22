# Quiet Meter

Audience for the last 7 days.

Range: Last 7 days.

Inspired by common SaaS dashboard styles. ChartKit is not affiliated with any product.

Default theme: soft.

## Visitors

Visitors

type kpi above the chart. metric.delta is the change. Bounce uses goodDirection down.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "data": [
    2400,
    2620,
    2510,
    2800,
    3010,
    2680,
    2400
  ],
  "metric": {
    "label": "Visitors",
    "value": 18420,
    "delta": 0.04,
    "format": "compact"
  },
  "mark": {
    "fillOpacity": 0.14,
    "strokeWidth": 1.25
  },
  "size": {
    "width": 280,
    "height": 132
  },
  "a11y": {
    "alt": "Visitors are 18.4 thousand, up 4 percent."
  }
}
```

## Pageviews

Pageviews

type kpi above the chart. metric.delta is the change. Bounce uses goodDirection down.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "data": [
    4200,
    4600,
    4480,
    5100,
    5340,
    3900,
    3720
  ],
  "metric": {
    "label": "Pageviews",
    "value": 61200,
    "delta": 0.06,
    "format": "compact"
  },
  "mark": {
    "fillOpacity": 0.14,
    "strokeWidth": 1.25
  },
  "size": {
    "width": 280,
    "height": 132
  },
  "a11y": {
    "alt": "Pageviews are 61.2 thousand, up 6 percent."
  }
}
```

## Bounce

Bounce

type kpi above the chart. metric.delta is the change. Bounce uses goodDirection down.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "data": [
    0.46,
    0.44,
    0.45,
    0.42,
    0.4,
    0.41,
    0.39
  ],
  "metric": {
    "label": "Bounce",
    "value": 0.41,
    "delta": -0.03,
    "format": "percent",
    "goodDirection": "down"
  },
  "mark": {
    "fillOpacity": 0.14,
    "strokeWidth": 1.25
  },
  "size": {
    "width": 280,
    "height": 132
  },
  "a11y": {
    "alt": "Bounce is 41 percent, down 3 points."
  }
}
```

## Duration

Duration

type kpi above the chart. metric.delta is the change. Bounce uses goodDirection down.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "data": [
    2.1,
    2.2,
    2,
    2.4,
    2.6,
    2.3,
    2.4
  ],
  "metric": {
    "label": "Duration",
    "value": 2.4,
    "delta": 0.02,
    "format": "number"
  },
  "mark": {
    "fillOpacity": 0.14,
    "strokeWidth": 1.25
  },
  "size": {
    "width": 280,
    "height": 132
  },
  "a11y": {
    "alt": "Duration is 2.4 minutes, up 2 percent."
  }
}
```

## Visits

One series.

type line, mark.area and mark.curve monotone, legend.show false. A single --ck-series-1 token is the only colour.

```json
{
  "version": "1",
  "type": "line",
  "theme": "soft",
  "data": [
    {
      "day": "Mon",
      "visits": 4200
    },
    {
      "day": "Tue",
      "visits": 4600
    },
    {
      "day": "Wed",
      "visits": 4480
    },
    {
      "day": "Thu",
      "visits": 5100
    },
    {
      "day": "Fri",
      "visits": 5340
    },
    {
      "day": "Sat",
      "visits": 3900
    },
    {
      "day": "Sun",
      "visits": 3720
    }
  ],
  "encoding": {
    "x": "day",
    "y": {
      "field": "visits",
      "title": "Visits"
    }
  },
  "mark": {
    "area": true,
    "curve": "monotone"
  },
  "legend": {
    "show": false
  },
  "axes": {
    "x": {
      "title": "Day"
    },
    "y": {
      "title": "Visits",
      "format": "compact"
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
    "alt": "Visits peak on Friday at 5,340 and fall over the weekend."
  }
}
```

## Top pages

Top pages

type bar-list. No axes. The track is a light tint of the series token, the label sits on it, and the value is right-aligned.

```json
{
  "version": "1",
  "type": "bar-list",
  "theme": "soft",
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
  "size": {
    "width": 360,
    "height": 152
  },
  "a11y": {
    "alt": "Pricing is the most visited page, then docs."
  }
}
```

## Top sources

Top sources

type bar-list. No axes. The track is a light tint of the series token, the label sits on it, and the value is right-aligned.

```json
{
  "version": "1",
  "type": "bar-list",
  "theme": "soft",
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
  "size": {
    "width": 360,
    "height": 152
  },
  "a11y": {
    "alt": "Direct is the largest source, then search."
  }
}
```

## Devices

Devices

type bar-list. No axes. The track is a light tint of the series token, the label sits on it, and the value is right-aligned.

```json
{
  "version": "1",
  "type": "bar-list",
  "theme": "soft",
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
  "size": {
    "width": 360,
    "height": 96
  },
  "a11y": {
    "alt": "Desktop leads, then mobile."
  }
}
```

## What produces this look

- **Stats.** Four kpi specs sit above the chart. Each has a delta. Bounce uses goodDirection down and format percent.
- **One accent.** Every mark uses --ck-series-1. The page does not set a range.
- **Lists.** Top pages, sources, and devices are type bar-list. The chart is on demand from @chartkitdev/core/charts/bar-list and is not part of the line or all bundle.

https://chartkit.dev/dashboards/meter
