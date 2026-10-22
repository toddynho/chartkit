# Quiet Meter

A minimal visits view: one accent, a large area, and two horizontal lists.

Inspired by common SaaS dashboard styles. ChartKit is not affiliated with any product.

Default theme: soft.

## Visits

One series, area on, legend off, monotone curve.

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
  "size": {
    "width": 760,
    "height": 320
  },
  "a11y": {
    "alt": "Visits peak on Friday at 5,340 and fall over the weekend."
  }
}
```

## Top pages

Horizontal bars, one colour, no legend.

type bar, mark.orientation horizontal, legend.show false. The same series token paints every bar.

```json
{
  "version": "1",
  "type": "bar",
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
    "y": "visits"
  },
  "mark": {
    "orientation": "horizontal"
  },
  "legend": {
    "show": false
  },
  "axes": {
    "x": {
      "title": "Page"
    },
    "y": {
      "title": "Visits"
    }
  },
  "size": {
    "width": 420,
    "height": 260
  },
  "a11y": {
    "alt": "Pricing is the most visited page, then docs."
  }
}
```

## Top sources

The same bar spec, with a different category field.

Same horizontal bar options as the page list. No second palette.

```json
{
  "version": "1",
  "type": "bar",
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
    "y": "visits"
  },
  "mark": {
    "orientation": "horizontal"
  },
  "legend": {
    "show": false
  },
  "axes": {
    "x": {
      "title": "Source"
    },
    "y": {
      "title": "Visits"
    }
  },
  "size": {
    "width": 420,
    "height": 260
  },
  "a11y": {
    "alt": "Direct is the largest source, then search."
  }
}
```

## Options

- **One accent.** Every mark uses --ck-series-1. The page does not set a range.
- **Lists.** Horizontal bars are mark.orientation horizontal. Categories stay on x in the spec; the chart draws them down the side.

https://chartkit.dev/dashboards/meter
