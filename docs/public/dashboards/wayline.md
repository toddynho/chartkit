# Wayline

Acquisition for the last 8 weeks.

Range: Last 8 weeks.

Inspired by common SaaS dashboard styles. ChartKit is not affiliated with any product.

Default theme: soft.

## Sessions

Sessions

type kpi with data for the sparkline. Bounce rate uses format percent and goodDirection down.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "data": [
    18.2,
    19.4,
    18.8,
    21.1,
    22.4,
    21.6,
    23.8,
    24.5
  ],
  "metric": {
    "label": "Sessions",
    "value": 24500,
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
    "alt": "Sessions this week are 24.5 thousand, up 6 percent."
  }
}
```

## Engaged

Engaged

type kpi with data for the sparkline. Bounce rate uses format percent and goodDirection down.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "data": [
    8.1,
    8.4,
    8.2,
    9.4,
    10.1,
    9.8,
    10.6,
    11.2
  ],
  "metric": {
    "label": "Engaged",
    "value": 11200,
    "delta": 0.03,
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
    "alt": "Engaged sessions are 11.2 thousand, up 3 percent."
  }
}
```

## Bounce rate

Bounce rate

type kpi with data for the sparkline. Bounce rate uses format percent and goodDirection down.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "data": [
    0.44,
    0.42,
    0.43,
    0.41,
    0.4,
    0.39,
    0.38,
    0.38
  ],
  "metric": {
    "label": "Bounce rate",
    "value": 0.38,
    "delta": -0.02,
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
    "alt": "Bounce rate is 38 percent, down 2 points."
  }
}
```

## Minutes

Minutes

type kpi with data for the sparkline. Bounce rate uses format percent and goodDirection down.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": "soft",
  "data": [
    2.8,
    2.9,
    3,
    3.1,
    3.2,
    3.1,
    3.3,
    3.4
  ],
  "metric": {
    "label": "Minutes",
    "value": 3.4,
    "delta": 0.05,
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
    "alt": "Average minutes are 3.4, up 5 percent."
  }
}
```

## Sessions

This period and the prior period.

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
  "tooltip": {
    "mode": "index"
  },
  "mark": {
    "strokeWidth": 2.25
  },
  "size": {
    "width": 720,
    "height": 320
  },
  "a11y": {
    "alt": "Sessions rise from 18.2 to 24.5 thousand, staying above the prior period."
  }
}
```

## Channels

Share of sessions.

type donut. encoding.y is titled Sessions and formatted compact, so the centre is the total sessions. legend.values prints the share and the session count under the ring. color.range is var(--ck-wayline-1) through var(--ck-wayline-5).

```json
{
  "version": "1",
  "type": "donut",
  "theme": "soft",
  "data": [
    {
      "channel": "Search",
      "sessions": 10290
    },
    {
      "channel": "Direct",
      "sessions": 5880
    },
    {
      "channel": "Mail",
      "sessions": 3920
    },
    {
      "channel": "Social",
      "sessions": 2695
    },
    {
      "channel": "Referral",
      "sessions": 1715
    }
  ],
  "encoding": {
    "x": "channel",
    "y": {
      "field": "sessions",
      "title": "Sessions",
      "format": "compact"
    },
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
  "legend": {
    "values": true
  },
  "size": {
    "width": 400,
    "height": 430
  },
  "a11y": {
    "alt": "Search is 10.3 thousand sessions. The centre total is 24.5 thousand."
  }
}
```

## Countries

Sessions by country.

The list is type bar. The map toggle is type choropleth from @chartkitdev/geo, mark.atlas world, encoding.region set to the ISO code. Geo is on demand and is not in the line or all bundle.

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
    "y": {
      "field": "sessions",
      "format": "compact"
    }
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
    "width": 640,
    "height": 260
  },
  "a11y": {
    "alt": "Japan has the most sessions, then Portugal."
  }
}
```

### Map

```json
{
  "version": "1",
  "type": "choropleth",
  "theme": "soft",
  "data": [
    {
      "country": "JPN",
      "sessions": 6200
    },
    {
      "country": "PRT",
      "sessions": 4100
    },
    {
      "country": "CHL",
      "sessions": 2800
    },
    {
      "country": "KEN",
      "sessions": 1900
    },
    {
      "country": "CAN",
      "sessions": 1600
    }
  ],
  "encoding": {
    "region": "country",
    "color": {
      "field": "sessions",
      "title": "Sessions",
      "format": "compact"
    }
  },
  "mark": {
    "atlas": "world",
    "projection": "equalEarth",
    "scale": "sequential"
  },
  "legend": {
    "position": "bottom"
  },
  "size": {
    "width": 720,
    "height": 340
  },
  "a11y": {
    "alt": "Japan has the most sessions, then Portugal. Countries without a row are hatched."
  }
}
```

## What produces this look

- **Scorecards.** Each kpi includes data, so the sparkline is in the card. Bounce rate replaces the old Brief label.
- **Donut.** The y channel is Sessions with format compact. The hole shows that total. legend.values prints the share and the session count under the ring.
- **Countries.** The bar sits beside a table. The map toggle renders a choropleth with @chartkitdev/geo, which loads on demand.

https://chartkit.dev/dashboards/wayline
