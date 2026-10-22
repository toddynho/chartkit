# Google Analytics-style traffic report

Acquisition for the last 8 weeks.

Range: Last 8 weeks.

Styled after Google Analytics's dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by Google Analytics.

Default theme: soft.

## Sessions

Sessions

type kpi. The spark uses the blue series token. Bounce rate uses format percent and goodDirection down.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#202124",
      "muted": "#5f6368",
      "grid": "transparent",
      "axis": "#dadce0",
      "accent": "#1a73e8",
      "positive": "#188038",
      "negative": "#d93025",
      "series": [
        "#1a73e8",
        "#9aa0a6"
      ]
    }
  },
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
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
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

type kpi. The spark uses the blue series token. Bounce rate uses format percent and goodDirection down.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#202124",
      "muted": "#5f6368",
      "grid": "transparent",
      "axis": "#dadce0",
      "accent": "#1a73e8",
      "positive": "#188038",
      "negative": "#d93025",
      "series": [
        "#1a73e8",
        "#9aa0a6"
      ]
    }
  },
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
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
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

type kpi. The spark uses the blue series token. Bounce rate uses format percent and goodDirection down.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#202124",
      "muted": "#5f6368",
      "grid": "transparent",
      "axis": "#dadce0",
      "accent": "#1a73e8",
      "positive": "#188038",
      "negative": "#d93025",
      "series": [
        "#1a73e8",
        "#9aa0a6"
      ]
    }
  },
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
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
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

type kpi. The spark uses the blue series token. Bounce rate uses format percent and goodDirection down.

```json
{
  "version": "1",
  "type": "kpi",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#202124",
      "muted": "#5f6368",
      "grid": "transparent",
      "axis": "#dadce0",
      "accent": "#1a73e8",
      "positive": "#188038",
      "negative": "#d93025",
      "series": [
        "#1a73e8",
        "#9aa0a6"
      ]
    }
  },
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
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
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

This period and the previous period.

type line. series[0] is solid blue. series[1] is a dashed gray comparison. axes.y.grid is on and axes.x.grid is off. legend.position is top.

```json
{
  "version": "1",
  "type": "line",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#202124",
      "muted": "#5f6368",
      "grid": "#e8eaed",
      "axis": "#dadce0",
      "accent": "#1a73e8",
      "positive": "#188038",
      "negative": "#d93025",
      "series": [
        "#1a73e8",
        "#9aa0a6"
      ]
    }
  },
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
        "title": "Previous period",
        "dash": "dashed"
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
    "strokeWidth": 2.25
  },
  "size": {
    "width": 720,
    "height": 320
  },
  "a11y": {
    "alt": "Sessions rise from 18.2 to 24.5 thousand, staying above the previous period."
  }
}
```

## Channels

Share of sessions.

type donut. This chart's theme.tokens.series is the five channel colours, so the slices do not use a page CSS variable. legend.values prints the share and the session count. The y channel is Sessions with format compact, so the centre is the total.

```json
{
  "version": "1",
  "type": "donut",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#202124",
      "muted": "#5f6368",
      "grid": "#e8eaed",
      "axis": "#dadce0",
      "accent": "#1a73e8",
      "positive": "#188038",
      "negative": "#d93025",
      "series": [
        "#1a73e8",
        "#12b5cb",
        "#e8710a",
        "#e52592",
        "#9334e6"
      ]
    }
  },
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

The list is type bar in the blue series token. The map is type choropleth. encoding.color.range is the blue ramp #aecbfa to #1a73e8. The map theme is the string soft or midnight because a token object does not change water, land, or legend text.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#202124",
      "muted": "#5f6368",
      "grid": "#e8eaed",
      "axis": "#dadce0",
      "accent": "#1a73e8",
      "positive": "#188038",
      "negative": "#d93025",
      "series": [
        "#1a73e8"
      ]
    }
  },
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
    "orientation": "horizontal",
    "cornerRadius": 2
  },
  "legend": {
    "show": false
  },
  "axes": {
    "x": {
      "grid": false
    },
    "y": {
      "grid": true
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
      "format": "compact",
      "range": [
        "#aecbfa",
        "#669df6",
        "#1a73e8"
      ]
    }
  },
  "mark": {
    "atlas": "world",
    "projection": "equalEarth",
    "scale": "sequential"
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

- **Scorecards.** Each kpi includes data, so the sparkline is in the card. The spark colour is the blue series token.
- **Comparison.** The sessions line uses #1a73e8 for this period and a dashed #9aa0a6 for the previous period. Midnight uses #8ab4f8 for this period.
- **Donut.** theme.tokens.series is Search blue, Direct teal, Mail orange, Social pink, and Referral purple. legend.values prints the share and the session count under the ring.
- **Countries.** The bar uses the blue series token. The map toggle renders a choropleth whose sequential ramp is encoding.color.range. Geo loads on demand.

https://chartkit.dev/dashboards/wayline
