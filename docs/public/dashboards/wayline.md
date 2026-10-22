# Google Analytics-style traffic report

Acquisition for the last 28 days.

Range: Last 28 days.

Styled after Google Analytics's dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by Google Analytics.

Default theme: soft.

## Users

This period and the previous period.

type line. curve linear, so segments are straight. series[1] dash is dashed. legend.show is false. axes.y.title is empty. The blue series token is #1a73e8 and the comparison is #9aa0a6.

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
      "date": "2025-09-24",
      "now": 780,
      "then": 661
    },
    {
      "date": "2025-09-25",
      "now": 940,
      "then": 577
    },
    {
      "date": "2025-09-26",
      "now": 940,
      "then": 689
    },
    {
      "date": "2025-09-27",
      "now": 780,
      "then": 745
    },
    {
      "date": "2025-09-28",
      "now": 820,
      "then": 745
    },
    {
      "date": "2025-09-29",
      "now": 700,
      "then": 689
    },
    {
      "date": "2025-09-30",
      "now": 780,
      "then": 577
    },
    {
      "date": "2025-10-01",
      "now": 700,
      "then": 661
    },
    {
      "date": "2025-10-02",
      "now": 820,
      "then": 689
    },
    {
      "date": "2025-10-03",
      "now": 780,
      "then": 661
    },
    {
      "date": "2025-10-04",
      "now": 940,
      "then": 577
    },
    {
      "date": "2025-10-05",
      "now": 940,
      "then": 689
    },
    {
      "date": "2025-10-06",
      "now": 780,
      "then": 745
    },
    {
      "date": "2025-10-07",
      "now": 820,
      "then": 745
    },
    {
      "date": "2025-10-08",
      "now": 700,
      "then": 689
    },
    {
      "date": "2025-10-09",
      "now": 780,
      "then": 577
    },
    {
      "date": "2025-10-10",
      "now": 700,
      "then": 661
    },
    {
      "date": "2025-10-11",
      "now": 820,
      "then": 689
    },
    {
      "date": "2025-10-12",
      "now": 780,
      "then": 661
    },
    {
      "date": "2025-10-13",
      "now": 940,
      "then": 577
    },
    {
      "date": "2025-10-14",
      "now": 940,
      "then": 689
    },
    {
      "date": "2025-10-15",
      "now": 780,
      "then": 745
    },
    {
      "date": "2025-10-16",
      "now": 820,
      "then": 745
    },
    {
      "date": "2025-10-17",
      "now": 700,
      "then": 689
    },
    {
      "date": "2025-10-18",
      "now": 780,
      "then": 577
    },
    {
      "date": "2025-10-19",
      "now": 700,
      "then": 661
    },
    {
      "date": "2025-10-20",
      "now": 820,
      "then": 689
    },
    {
      "date": "2025-10-21",
      "now": 780,
      "then": 661
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "now"
      },
      {
        "field": "then",
        "dash": "dashed"
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "strokeWidth": 2,
    "points": "none"
  },
  "legend": {
    "show": false
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
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Users rise across 28 days and stay above the previous period."
  }
}
```

## New users

This period and the previous period.

type line. curve linear, so segments are straight. series[1] dash is dashed. legend.show is false. axes.y.title is empty. The blue series token is #1a73e8 and the comparison is #9aa0a6.

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
      "date": "2025-09-24",
      "now": 338,
      "then": 287
    },
    {
      "date": "2025-09-25",
      "now": 250,
      "then": 256
    },
    {
      "date": "2025-09-26",
      "now": 294,
      "then": 210
    },
    {
      "date": "2025-09-27",
      "now": 272,
      "then": 166
    },
    {
      "date": "2025-09-28",
      "now": 198,
      "then": 228
    },
    {
      "date": "2025-09-29",
      "now": 242,
      "then": 274
    },
    {
      "date": "2025-09-30",
      "now": 220,
      "then": 305
    },
    {
      "date": "2025-10-01",
      "now": 198,
      "then": 320
    },
    {
      "date": "2025-10-02",
      "now": 242,
      "then": 320
    },
    {
      "date": "2025-10-03",
      "now": 220,
      "then": 305
    },
    {
      "date": "2025-10-04",
      "now": 198,
      "then": 274
    },
    {
      "date": "2025-10-05",
      "now": 242,
      "then": 228
    },
    {
      "date": "2025-10-06",
      "now": 220,
      "then": 166
    },
    {
      "date": "2025-10-07",
      "now": 198,
      "then": 228
    },
    {
      "date": "2025-10-08",
      "now": 242,
      "then": 274
    },
    {
      "date": "2025-10-09",
      "now": 220,
      "then": 305
    },
    {
      "date": "2025-10-10",
      "now": 198,
      "then": 320
    },
    {
      "date": "2025-10-11",
      "now": 242,
      "then": 320
    },
    {
      "date": "2025-10-12",
      "now": 220,
      "then": 305
    },
    {
      "date": "2025-10-13",
      "now": 198,
      "then": 274
    },
    {
      "date": "2025-10-14",
      "now": 242,
      "then": 228
    },
    {
      "date": "2025-10-15",
      "now": 220,
      "then": 166
    },
    {
      "date": "2025-10-16",
      "now": 198,
      "then": 228
    },
    {
      "date": "2025-10-17",
      "now": 242,
      "then": 274
    },
    {
      "date": "2025-10-18",
      "now": 220,
      "then": 305
    },
    {
      "date": "2025-10-19",
      "now": 198,
      "then": 320
    },
    {
      "date": "2025-10-20",
      "now": 242,
      "then": 320
    },
    {
      "date": "2025-10-21",
      "now": 220,
      "then": 305
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "now"
      },
      {
        "field": "then",
        "dash": "dashed"
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "strokeWidth": 2,
    "points": "none"
  },
  "legend": {
    "show": false
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
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "New users over 28 days, with a dashed previous period."
  }
}
```

## Avg engagement

This period and the previous period.

type line. curve linear, so segments are straight. series[1] dash is dashed. legend.show is false. axes.y.title is empty. The blue series token is #1a73e8 and the comparison is #9aa0a6.

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
      "date": "2025-09-24",
      "now": 172,
      "then": 146
    },
    {
      "date": "2025-09-25",
      "now": 196,
      "then": 123
    },
    {
      "date": "2025-09-26",
      "now": 180,
      "then": 134
    },
    {
      "date": "2025-09-27",
      "now": 196,
      "then": 129
    },
    {
      "date": "2025-09-28",
      "now": 172,
      "then": 106
    },
    {
      "date": "2025-09-29",
      "now": 180,
      "then": 118
    },
    {
      "date": "2025-09-30",
      "now": 148,
      "then": 112
    },
    {
      "date": "2025-10-01",
      "now": 148,
      "then": 90
    },
    {
      "date": "2025-10-02",
      "now": 180,
      "then": 101
    },
    {
      "date": "2025-10-03",
      "now": 172,
      "then": 95
    },
    {
      "date": "2025-10-04",
      "now": 196,
      "then": 83
    },
    {
      "date": "2025-10-05",
      "now": 180,
      "then": 94
    },
    {
      "date": "2025-10-06",
      "now": 196,
      "then": 89
    },
    {
      "date": "2025-10-07",
      "now": 172,
      "then": 83
    },
    {
      "date": "2025-10-08",
      "now": 180,
      "then": 94
    },
    {
      "date": "2025-10-09",
      "now": 148,
      "then": 89
    },
    {
      "date": "2025-10-10",
      "now": 148,
      "then": 83
    },
    {
      "date": "2025-10-11",
      "now": 180,
      "then": 94
    },
    {
      "date": "2025-10-12",
      "now": 172,
      "then": 89
    },
    {
      "date": "2025-10-13",
      "now": 196,
      "then": 83
    },
    {
      "date": "2025-10-14",
      "now": 180,
      "then": 94
    },
    {
      "date": "2025-10-15",
      "now": 196,
      "then": 89
    },
    {
      "date": "2025-10-16",
      "now": 172,
      "then": 83
    },
    {
      "date": "2025-10-17",
      "now": 180,
      "then": 94
    },
    {
      "date": "2025-10-18",
      "now": 148,
      "then": 89
    },
    {
      "date": "2025-10-19",
      "now": 148,
      "then": 83
    },
    {
      "date": "2025-10-20",
      "now": 180,
      "then": 94
    },
    {
      "date": "2025-10-21",
      "now": 172,
      "then": 89
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "now"
      },
      {
        "field": "then",
        "dash": "dashed"
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "strokeWidth": 2,
    "points": "none"
  },
  "legend": {
    "show": false
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
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Average engagement over 28 days."
  }
}
```

## Revenue

This period and the previous period.

type line. curve linear, so segments are straight. series[1] dash is dashed. legend.show is false. axes.y.title is empty. The blue series token is #1a73e8 and the comparison is #9aa0a6.

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
      "date": "2025-09-24",
      "now": 1330,
      "then": 1127
    },
    {
      "date": "2025-09-25",
      "now": 1120,
      "then": 1078
    },
    {
      "date": "2025-09-26",
      "now": 1400,
      "then": 1029
    },
    {
      "date": "2025-09-27",
      "now": 1540,
      "then": 980
    },
    {
      "date": "2025-09-28",
      "now": 1540,
      "then": 931
    },
    {
      "date": "2025-09-29",
      "now": 1400,
      "then": 882
    },
    {
      "date": "2025-09-30",
      "now": 1120,
      "then": 833
    },
    {
      "date": "2025-10-01",
      "now": 1330,
      "then": 784
    },
    {
      "date": "2025-10-02",
      "now": 1400,
      "then": 735
    },
    {
      "date": "2025-10-03",
      "now": 1330,
      "then": 686
    },
    {
      "date": "2025-10-04",
      "now": 1120,
      "then": 647
    },
    {
      "date": "2025-10-05",
      "now": 1400,
      "then": 647
    },
    {
      "date": "2025-10-06",
      "now": 1540,
      "then": 647
    },
    {
      "date": "2025-10-07",
      "now": 1540,
      "then": 647
    },
    {
      "date": "2025-10-08",
      "now": 1400,
      "then": 647
    },
    {
      "date": "2025-10-09",
      "now": 1120,
      "then": 647
    },
    {
      "date": "2025-10-10",
      "now": 1330,
      "then": 647
    },
    {
      "date": "2025-10-11",
      "now": 1400,
      "then": 647
    },
    {
      "date": "2025-10-12",
      "now": 1330,
      "then": 647
    },
    {
      "date": "2025-10-13",
      "now": 1120,
      "then": 647
    },
    {
      "date": "2025-10-14",
      "now": 1400,
      "then": 647
    },
    {
      "date": "2025-10-15",
      "now": 1540,
      "then": 647
    },
    {
      "date": "2025-10-16",
      "now": 1540,
      "then": 647
    },
    {
      "date": "2025-10-17",
      "now": 1400,
      "then": 647
    },
    {
      "date": "2025-10-18",
      "now": 1120,
      "then": 647
    },
    {
      "date": "2025-10-19",
      "now": 1330,
      "then": 647
    },
    {
      "date": "2025-10-20",
      "now": 1400,
      "then": 647
    },
    {
      "date": "2025-10-21",
      "now": 1330,
      "then": 647
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": [
      {
        "field": "now"
      },
      {
        "field": "then",
        "dash": "dashed"
      }
    ]
  },
  "mark": {
    "curve": "linear",
    "strokeWidth": 2,
    "points": "none"
  },
  "legend": {
    "show": false
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
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Revenue over 28 days, with a dashed previous period."
  }
}
```

## Channels

Share of sessions.

type donut. theme.tokens.series is the five channel colours. legend.values prints the share. The centre is the total.

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

## Users by hour

Weekday against hour.

type heatmap. encoding.color.range is #e8f0fe to #1a73e8. Every cell has a value, so none are hatched.

```json
{
  "version": "1",
  "type": "heatmap",
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
      "day": "Mon",
      "hour": "00",
      "users": 29
    },
    {
      "day": "Mon",
      "hour": "03",
      "users": 64
    },
    {
      "day": "Mon",
      "hour": "06",
      "users": 129
    },
    {
      "day": "Mon",
      "hour": "09",
      "users": 208
    },
    {
      "day": "Mon",
      "hour": "12",
      "users": 231
    },
    {
      "day": "Mon",
      "hour": "15",
      "users": 201
    },
    {
      "day": "Mon",
      "hour": "18",
      "users": 132
    },
    {
      "day": "Mon",
      "hour": "21",
      "users": 60
    },
    {
      "day": "Tue",
      "hour": "00",
      "users": 32
    },
    {
      "day": "Tue",
      "hour": "03",
      "users": 67
    },
    {
      "day": "Tue",
      "hour": "06",
      "users": 132
    },
    {
      "day": "Tue",
      "hour": "09",
      "users": 194
    },
    {
      "day": "Tue",
      "hour": "12",
      "users": 234
    },
    {
      "day": "Tue",
      "hour": "15",
      "users": 204
    },
    {
      "day": "Tue",
      "hour": "18",
      "users": 135
    },
    {
      "day": "Tue",
      "hour": "21",
      "users": 63
    },
    {
      "day": "Wed",
      "hour": "00",
      "users": 35
    },
    {
      "day": "Wed",
      "hour": "03",
      "users": 70
    },
    {
      "day": "Wed",
      "hour": "06",
      "users": 135
    },
    {
      "day": "Wed",
      "hour": "09",
      "users": 197
    },
    {
      "day": "Wed",
      "hour": "12",
      "users": 237
    },
    {
      "day": "Wed",
      "hour": "15",
      "users": 207
    },
    {
      "day": "Wed",
      "hour": "18",
      "users": 121
    },
    {
      "day": "Wed",
      "hour": "21",
      "users": 66
    },
    {
      "day": "Thu",
      "hour": "00",
      "users": 38
    },
    {
      "day": "Thu",
      "hour": "03",
      "users": 73
    },
    {
      "day": "Thu",
      "hour": "06",
      "users": 121
    },
    {
      "day": "Thu",
      "hour": "09",
      "users": 200
    },
    {
      "day": "Thu",
      "hour": "12",
      "users": 240
    },
    {
      "day": "Thu",
      "hour": "15",
      "users": 193
    },
    {
      "day": "Thu",
      "hour": "18",
      "users": 124
    },
    {
      "day": "Thu",
      "hour": "21",
      "users": 69
    },
    {
      "day": "Fri",
      "hour": "00",
      "users": 41
    },
    {
      "day": "Fri",
      "hour": "03",
      "users": 59
    },
    {
      "day": "Fri",
      "hour": "06",
      "users": 124
    },
    {
      "day": "Fri",
      "hour": "09",
      "users": 203
    },
    {
      "day": "Fri",
      "hour": "12",
      "users": 243
    },
    {
      "day": "Fri",
      "hour": "15",
      "users": 196
    },
    {
      "day": "Fri",
      "hour": "18",
      "users": 127
    },
    {
      "day": "Fri",
      "hour": "21",
      "users": 72
    },
    {
      "day": "Sat",
      "hour": "00",
      "users": 37
    },
    {
      "day": "Sat",
      "hour": "03",
      "users": 35
    },
    {
      "day": "Sat",
      "hour": "06",
      "users": 62
    },
    {
      "day": "Sat",
      "hour": "09",
      "users": 92
    },
    {
      "day": "Sat",
      "hour": "12",
      "users": 93
    },
    {
      "day": "Sat",
      "hour": "15",
      "users": 85
    },
    {
      "day": "Sat",
      "hour": "18",
      "users": 65
    },
    {
      "day": "Sat",
      "hour": "21",
      "users": 48
    },
    {
      "day": "Sun",
      "hour": "00",
      "users": 23
    },
    {
      "day": "Sun",
      "hour": "03",
      "users": 38
    },
    {
      "day": "Sun",
      "hour": "06",
      "users": 65
    },
    {
      "day": "Sun",
      "hour": "09",
      "users": 95
    },
    {
      "day": "Sun",
      "hour": "12",
      "users": 96
    },
    {
      "day": "Sun",
      "hour": "15",
      "users": 88
    },
    {
      "day": "Sun",
      "hour": "18",
      "users": 68
    },
    {
      "day": "Sun",
      "hour": "21",
      "users": 34
    }
  ],
  "encoding": {
    "x": "hour",
    "y": "day",
    "color": {
      "field": "users",
      "title": "Users",
      "range": [
        "#e8f0fe",
        "#1a73e8"
      ]
    }
  },
  "mark": {
    "gap": 0.18,
    "cornerRadius": 2
  },
  "size": {
    "width": 520,
    "height": 280
  },
  "a11y": {
    "alt": "Users peak on weekday afternoons and fall overnight."
  }
}
```

## Countries

Users by country.

type choropleth. encoding.color.range is the blue ramp. mark.nodata is fill, mark.land is #e8eaed, and mark.water is #ffffff, so missing countries are plain grey. Midnight uses land #3c4043 and water #202124. Fifty-two countries have a value.

```json
{
  "version": "1",
  "type": "choropleth",
  "theme": "soft",
  "data": [
    {
      "country": "USA",
      "sessions": 9200
    },
    {
      "country": "JPN",
      "sessions": 7100
    },
    {
      "country": "GBR",
      "sessions": 5400
    },
    {
      "country": "DEU",
      "sessions": 4800
    },
    {
      "country": "BRA",
      "sessions": 4300
    },
    {
      "country": "IND",
      "sessions": 3900
    },
    {
      "country": "FRA",
      "sessions": 3600
    },
    {
      "country": "AUS",
      "sessions": 2800
    },
    {
      "country": "CAN",
      "sessions": 2600
    },
    {
      "country": "MEX",
      "sessions": 2100
    },
    {
      "country": "ESP",
      "sessions": 1900
    },
    {
      "country": "ITA",
      "sessions": 1800
    },
    {
      "country": "KOR",
      "sessions": 1700
    },
    {
      "country": "IDN",
      "sessions": 1600
    },
    {
      "country": "NLD",
      "sessions": 1400
    },
    {
      "country": "POL",
      "sessions": 1300
    },
    {
      "country": "TUR",
      "sessions": 1250
    },
    {
      "country": "ARG",
      "sessions": 1200
    },
    {
      "country": "ZAF",
      "sessions": 1100
    },
    {
      "country": "SWE",
      "sessions": 980
    },
    {
      "country": "CHE",
      "sessions": 940
    },
    {
      "country": "BEL",
      "sessions": 900
    },
    {
      "country": "PRT",
      "sessions": 860
    },
    {
      "country": "NOR",
      "sessions": 820
    },
    {
      "country": "AUT",
      "sessions": 780
    },
    {
      "country": "DNK",
      "sessions": 740
    },
    {
      "country": "FIN",
      "sessions": 700
    },
    {
      "country": "IRL",
      "sessions": 680
    },
    {
      "country": "CZE",
      "sessions": 640
    },
    {
      "country": "GRC",
      "sessions": 610
    },
    {
      "country": "ROU",
      "sessions": 580
    },
    {
      "country": "UKR",
      "sessions": 540
    },
    {
      "country": "COL",
      "sessions": 720
    },
    {
      "country": "CHL",
      "sessions": 690
    },
    {
      "country": "PER",
      "sessions": 640
    },
    {
      "country": "EGY",
      "sessions": 600
    },
    {
      "country": "MAR",
      "sessions": 560
    },
    {
      "country": "NGA",
      "sessions": 530
    },
    {
      "country": "KEN",
      "sessions": 490
    },
    {
      "country": "SAU",
      "sessions": 760
    },
    {
      "country": "ARE",
      "sessions": 710
    },
    {
      "country": "THA",
      "sessions": 670
    },
    {
      "country": "VNM",
      "sessions": 640
    },
    {
      "country": "MYS",
      "sessions": 600
    },
    {
      "country": "PHL",
      "sessions": 570
    },
    {
      "country": "NZL",
      "sessions": 520
    },
    {
      "country": "CHN",
      "sessions": 2400
    },
    {
      "country": "KAZ",
      "sessions": 430
    },
    {
      "country": "UZB",
      "sessions": 380
    },
    {
      "country": "FJI",
      "sessions": 140
    },
    {
      "country": "TZA",
      "sessions": 360
    },
    {
      "country": "PNG",
      "sessions": 180
    }
  ],
  "encoding": {
    "region": "country",
    "color": {
      "field": "sessions",
      "title": "Users",
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
    "scale": "sequential",
    "nodata": "fill",
    "land": "#e8eaed",
    "water": "#ffffff"
  },
  "legend": {
    "show": true
  },
  "size": {
    "width": 1100,
    "height": 420
  },
  "a11y": {
    "alt": "Users across more than forty countries. Countries without a row are plain grey."
  }
}
```

### Midnight

```json
{
  "version": "1",
  "type": "choropleth",
  "theme": "midnight",
  "data": [
    {
      "country": "USA",
      "sessions": 9200
    },
    {
      "country": "JPN",
      "sessions": 7100
    },
    {
      "country": "GBR",
      "sessions": 5400
    },
    {
      "country": "DEU",
      "sessions": 4800
    },
    {
      "country": "BRA",
      "sessions": 4300
    },
    {
      "country": "IND",
      "sessions": 3900
    },
    {
      "country": "FRA",
      "sessions": 3600
    },
    {
      "country": "AUS",
      "sessions": 2800
    },
    {
      "country": "CAN",
      "sessions": 2600
    },
    {
      "country": "MEX",
      "sessions": 2100
    },
    {
      "country": "ESP",
      "sessions": 1900
    },
    {
      "country": "ITA",
      "sessions": 1800
    },
    {
      "country": "KOR",
      "sessions": 1700
    },
    {
      "country": "IDN",
      "sessions": 1600
    },
    {
      "country": "NLD",
      "sessions": 1400
    },
    {
      "country": "POL",
      "sessions": 1300
    },
    {
      "country": "TUR",
      "sessions": 1250
    },
    {
      "country": "ARG",
      "sessions": 1200
    },
    {
      "country": "ZAF",
      "sessions": 1100
    },
    {
      "country": "SWE",
      "sessions": 980
    },
    {
      "country": "CHE",
      "sessions": 940
    },
    {
      "country": "BEL",
      "sessions": 900
    },
    {
      "country": "PRT",
      "sessions": 860
    },
    {
      "country": "NOR",
      "sessions": 820
    },
    {
      "country": "AUT",
      "sessions": 780
    },
    {
      "country": "DNK",
      "sessions": 740
    },
    {
      "country": "FIN",
      "sessions": 700
    },
    {
      "country": "IRL",
      "sessions": 680
    },
    {
      "country": "CZE",
      "sessions": 640
    },
    {
      "country": "GRC",
      "sessions": 610
    },
    {
      "country": "ROU",
      "sessions": 580
    },
    {
      "country": "UKR",
      "sessions": 540
    },
    {
      "country": "COL",
      "sessions": 720
    },
    {
      "country": "CHL",
      "sessions": 690
    },
    {
      "country": "PER",
      "sessions": 640
    },
    {
      "country": "EGY",
      "sessions": 600
    },
    {
      "country": "MAR",
      "sessions": 560
    },
    {
      "country": "NGA",
      "sessions": 530
    },
    {
      "country": "KEN",
      "sessions": 490
    },
    {
      "country": "SAU",
      "sessions": 760
    },
    {
      "country": "ARE",
      "sessions": 710
    },
    {
      "country": "THA",
      "sessions": 670
    },
    {
      "country": "VNM",
      "sessions": 640
    },
    {
      "country": "MYS",
      "sessions": 600
    },
    {
      "country": "PHL",
      "sessions": 570
    },
    {
      "country": "NZL",
      "sessions": 520
    },
    {
      "country": "CHN",
      "sessions": 2400
    },
    {
      "country": "KAZ",
      "sessions": 430
    },
    {
      "country": "UZB",
      "sessions": 380
    },
    {
      "country": "FJI",
      "sessions": 140
    },
    {
      "country": "TZA",
      "sessions": 360
    },
    {
      "country": "PNG",
      "sessions": 180
    }
  ],
  "encoding": {
    "region": "country",
    "color": {
      "field": "sessions",
      "title": "Users",
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
    "scale": "sequential",
    "nodata": "fill",
    "land": "#3c4043",
    "water": "#202124"
  },
  "legend": {
    "show": true
  },
  "size": {
    "width": 1100,
    "height": 420
  },
  "a11y": {
    "alt": "Users across more than forty countries. Countries without a row are plain grey."
  }
}
```

## What produces this look

- **Metric tabs.** Users, New users, Avg engagement, and Revenue are page tabs. The selected tab is underlined. Each tab is its own line spec.
- **Comparison.** curve linear keeps the segments straight. The previous period is dash dashed in #9aa0a6. axes.y.title is empty. Midnight uses #8ab4f8 for this period.
- **Map.** Fifty-two countries use encoding.color.range #aecbfa, #669df6, #1a73e8. mark.nodata fill paints missing countries with mark.land. There is no hatch.
- **Hour grid.** The heatmap is weekday by hour. color.range is #e8f0fe to #1a73e8 and every cell is filled.

https://chartkit.dev/dashboards/wayline
