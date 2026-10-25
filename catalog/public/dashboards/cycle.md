# Linear-style insights

Cycle time and throughput for eight fictional weeks.

Range: 8 weeks.

Styled after Linear's dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by Linear.

Default theme: soft.

## Cycle time

Median days.

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
      "text": "#1b1b1f",
      "muted": "#6b6f76",
      "grid": "transparent",
      "axis": "#d5d5d8",
      "accent": "#5e6ad2",
      "positive": "#1f8a4c",
      "negative": "#e5484d",
      "series": [
        "#5e6ad2",
        "#9a9ea6"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    6.1000000000000005,
    6.5,
    6,
    4.9,
    4.5,
    3.6,
    3.2,
    3.3000000000000003
  ],
  "metric": {
    "label": "Cycle time",
    "value": 3.4,
    "delta": -0.19,
    "format": {
      "style": "number",
      "decimals": 1,
      "suffix": "d"
    },
    "goodDirection": "down"
  },
  "mark": {
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 300,
    "height": 96
  },
  "a11y": {
    "alt": "Median cycle time is 3.4 days, down 19 percent."
  }
}
```

## Shipped

Issues shipped.

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
      "text": "#1b1b1f",
      "muted": "#6b6f76",
      "grid": "transparent",
      "axis": "#d5d5d8",
      "accent": "#5e6ad2",
      "positive": "#1f8a4c",
      "negative": "#e5484d",
      "series": [
        "#5e6ad2",
        "#9a9ea6"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    20,
    21,
    23,
    21,
    23,
    24,
    30,
    33
  ],
  "metric": {
    "label": "Shipped",
    "value": 32,
    "delta": 0.28,
    "format": "compact"
  },
  "mark": {
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 300,
    "height": 96
  },
  "a11y": {
    "alt": "32 issues shipped in the last week, up 28 percent."
  }
}
```

## Open

Open issues.

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
      "text": "#1b1b1f",
      "muted": "#6b6f76",
      "grid": "transparent",
      "axis": "#d5d5d8",
      "accent": "#5e6ad2",
      "positive": "#1f8a4c",
      "negative": "#e5484d",
      "series": [
        "#5e6ad2",
        "#9a9ea6"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    40,
    38,
    36,
    34,
    33,
    31,
    30,
    28
  ],
  "metric": {
    "label": "Open",
    "value": 28,
    "delta": -0.12,
    "format": "compact",
    "goodDirection": "down"
  },
  "mark": {
    "fillOpacity": 0.16,
    "strokeWidth": 1.5
  },
  "size": {
    "width": 300,
    "height": 96
  },
  "a11y": {
    "alt": "28 issues are open, down 12 percent."
  }
}
```

## Cycle time

Median days to ship.

type line. One series in #5e6ad2. axes.y.title is empty.

```json
{
  "version": "1",
  "type": "line",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1b1b1f",
      "muted": "#6b6f76",
      "grid": "#ececee",
      "axis": "#d5d5d8",
      "accent": "#5e6ad2",
      "positive": "#1f8a4c",
      "negative": "#e5484d",
      "series": [
        "#5e6ad2",
        "#9a9ea6"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "week": "W1",
      "days": 6.1000000000000005
    },
    {
      "week": "W2",
      "days": 6.5
    },
    {
      "week": "W3",
      "days": 6
    },
    {
      "week": "W4",
      "days": 4.9
    },
    {
      "week": "W5",
      "days": 4.5
    },
    {
      "week": "W6",
      "days": 3.6
    },
    {
      "week": "W7",
      "days": 3.2
    },
    {
      "week": "W8",
      "days": 3.3000000000000003
    }
  ],
  "encoding": {
    "x": "week",
    "y": {
      "field": "days"
    }
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
    "show": false
  },
  "mark": {
    "strokeWidth": 2,
    "curve": "linear",
    "points": "always"
  },
  "size": {
    "width": 720,
    "height": 260
  },
  "a11y": {
    "alt": "Median cycle time falls from 6.2 days to 3.4 days."
  }
}
```

## By state

Open issues by state.

type donut. Four fictional states.

```json
{
  "version": "1",
  "type": "donut",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1b1b1f",
      "muted": "#6b6f76",
      "grid": "#ececee",
      "axis": "#d5d5d8",
      "accent": "#5e6ad2",
      "positive": "#1f8a4c",
      "negative": "#e5484d",
      "series": [
        "#5e6ad2",
        "#8b93e8",
        "#c4c8f0",
        "#e4e5ea"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "state": "Started",
      "n": 11
    },
    {
      "state": "Unstarted",
      "n": 9
    },
    {
      "state": "Review",
      "n": 5
    },
    {
      "state": "Blocked",
      "n": 3
    }
  ],
  "encoding": {
    "x": "state",
    "y": "n"
  },
  "legend": {
    "show": true
  },
  "size": {
    "width": 320,
    "height": 260
  },
  "a11y": {
    "alt": "Started is the largest open state, then unstarted, review, and blocked."
  }
}
```

## Throughput

Issues shipped each week.

type bar. One series. cornerRadius 3.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1b1b1f",
      "muted": "#6b6f76",
      "grid": "#ececee",
      "axis": "#d5d5d8",
      "accent": "#5e6ad2",
      "positive": "#1f8a4c",
      "negative": "#e5484d",
      "series": [
        "#5e6ad2",
        "#9a9ea6"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "week": "W1",
      "shipped": 20
    },
    {
      "week": "W2",
      "shipped": 21
    },
    {
      "week": "W3",
      "shipped": 23
    },
    {
      "week": "W4",
      "shipped": 21
    },
    {
      "week": "W5",
      "shipped": 23
    },
    {
      "week": "W6",
      "shipped": 24
    },
    {
      "week": "W7",
      "shipped": 30
    },
    {
      "week": "W8",
      "shipped": 33
    }
  ],
  "encoding": {
    "x": "week",
    "y": {
      "field": "shipped"
    }
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
    "show": false
  },
  "mark": {
    "gap": 0.35,
    "cornerRadius": 3
  },
  "size": {
    "width": 980,
    "height": 200
  },
  "a11y": {
    "alt": "Weekly throughput rises from 18 to 32."
  }
}
```

## What produces this look

- **Insights.** Three scorecards, a cycle-time line, a state donut, and weekly throughput bars. The accent is #5e6ad2. fontFamily is Inter.
- **Shell.** The page background is #f5f5f6 and cards are white with a 1px line. No project icons.
- **Data.** Weeks and counts are generated.

https://chartkit.dev/dashboards/cycle
