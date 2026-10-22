# Wayline

Sessions over time, a channel donut, a country bar, and four scorecards.

Inspired by common SaaS dashboard styles. ChartKit is not affiliated with any product.

Default theme: soft.

## Sessions

Scorecard.

type kpi. metric.delta is the comparison chip. metric.format is compact, percent, or number.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "metric": {
    "label": "Sessions",
    "value": 24500,
    "delta": 0.06,
    "format": "compact"
  },
  "size": {
    "width": 220,
    "height": 96
  },
  "a11y": {
    "alt": "Sessions this week are 24.5 thousand, up 6 percent."
  }
}
```

## Engaged

Scorecard.

type kpi. metric.delta is the comparison chip. metric.format is compact, percent, or number.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "metric": {
    "label": "Engaged",
    "value": 11200,
    "delta": 0.03,
    "format": "compact"
  },
  "size": {
    "width": 220,
    "height": 96
  },
  "a11y": {
    "alt": "Engaged sessions are 11.2 thousand, up 3 percent."
  }
}
```

## Brief

Scorecard.

type kpi. metric.delta is the comparison chip. metric.format is compact, percent, or number.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "metric": {
    "label": "Brief",
    "value": 0.38,
    "delta": -0.02,
    "format": "percent"
  },
  "size": {
    "width": 220,
    "height": 96
  },
  "a11y": {
    "alt": "Brief sessions are 38 percent, down 2 points."
  }
}
```

## Minutes

Scorecard.

type kpi. metric.delta is the comparison chip. metric.format is compact, percent, or number.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "metric": {
    "label": "Minutes",
    "value": 3.4,
    "delta": 0.05,
    "format": "number"
  },
  "size": {
    "width": 220,
    "height": 96
  },
  "a11y": {
    "alt": "Average minutes are 3.4, up 5 percent."
  }
}
```

## Sessions

This period is solid. The comparison period is dashed.

type line. The second y series sets dash dashed. Both share encoding.x.

```json
{
  "version": "1",
  "type": "line",
  "theme": "soft",
  "data": [
    {
      "week": "W1",
      "now": 18.2,
      "then": 16.4
    },
    {
      "week": "W2",
      "now": 19.4,
      "then": 17.1
    },
    {
      "week": "W3",
      "now": 18.8,
      "then": 17.8
    },
    {
      "week": "W4",
      "now": 21.1,
      "then": 18.2
    },
    {
      "week": "W5",
      "now": 22.4,
      "then": 18.9
    },
    {
      "week": "W6",
      "now": 21.6,
      "then": 19.4
    },
    {
      "week": "W7",
      "now": 23.8,
      "then": 19.1
    },
    {
      "week": "W8",
      "now": 24.5,
      "then": 20.2
    }
  ],
  "encoding": {
    "x": "week",
    "y": [
      {
        "field": "now",
        "title": "This period"
      },
      {
        "field": "then",
        "title": "Prior period",
        "dash": "dashed"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Week"
    },
    "y": {
      "title": "Thousand sessions"
    }
  },
  "legend": {
    "position": "top"
  },
  "size": {
    "width": 520,
    "height": 280
  },
  "a11y": {
    "alt": "Sessions rise from 18.2 to 24.5 thousand, staying above the prior period."
  }
}
```

## Channels

Five slices, coloured from one sequential range.

type donut. encoding.color.range is five var(--ck-wayline-N) steps, so Soft and Midnight recolour the slices.

```json
{
  "version": "1",
  "type": "donut",
  "theme": "soft",
  "data": [
    {
      "channel": "Search",
      "share": 42
    },
    {
      "channel": "Direct",
      "share": 24
    },
    {
      "channel": "Mail",
      "share": 16
    },
    {
      "channel": "Social",
      "share": 11
    },
    {
      "channel": "Referral",
      "share": 7
    }
  ],
  "encoding": {
    "x": "channel",
    "y": "share",
    "color": {
      "field": "channel",
      "range": [
        "var(--ck-wayline-1)",
        "var(--ck-wayline-2)",
        "var(--ck-wayline-3)",
        "var(--ck-wayline-4)",
        "var(--ck-wayline-5)"
      ]
    }
  },
  "size": {
    "width": 320,
    "height": 280
  },
  "a11y": {
    "alt": "Search is 42 percent of sessions. Referral is 7 percent."
  }
}
```

## Countries

A bar stands in for a map. The same rows can feed a choropleth.

type bar, mark.orientation horizontal. A choropleth would use type choropleth, encoding.region, and mark.atlas world from @chartkitdev/geo.

```json
{
  "version": "1",
  "type": "bar",
  "theme": "soft",
  "data": [
    {
      "country": "Japan",
      "sessions": 6200
    },
    {
      "country": "Portugal",
      "sessions": 4100
    },
    {
      "country": "Chile",
      "sessions": 2800
    },
    {
      "country": "Kenya",
      "sessions": 1900
    },
    {
      "country": "Canada",
      "sessions": 1600
    }
  ],
  "encoding": {
    "x": "country",
    "y": "sessions"
  },
  "mark": {
    "orientation": "horizontal"
  },
  "legend": {
    "show": false
  },
  "axes": {
    "x": {
      "title": "Country"
    },
    "y": {
      "title": "Sessions"
    }
  },
  "size": {
    "width": 760,
    "height": 240
  },
  "a11y": {
    "alt": "Japan has the most sessions, then Portugal."
  }
}
```

## Options

- **Dashed comparison.** The prior series is a y object with dash dashed. It is the same chart, not an overlay image.
- **Donut.** color.range points at --ck-wayline-1 through --ck-wayline-5. The page defines a lighter set in Midnight.
- **Country.** This page uses a bar. The note on the chart is the choropleth alternative.

https://chartkit.dev/dashboards/wayline
