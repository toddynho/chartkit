# Google Analytics-style traffic report

Acquisition for the last 28 days.

Range: Last 28 days.

Styled after Google Analytics's dashboard to show ChartKit's styling flexibility. Not affiliated with or endorsed by Google Analytics.

Default theme: soft.

## Users

This period and the previous period.

type line. curve linear, so segments are straight. series[1] dash is dashed. legend.show is false. axes.y.title is empty. The blue series token is #1a73e8 and the comparison is #9aa0a6. The previous period is its own series, not a copy of this one.

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
      "now": 630,
      "then": 560
    },
    {
      "date": "2025-09-25",
      "now": 655,
      "then": 471
    },
    {
      "date": "2025-09-26",
      "now": 676,
      "then": 428
    },
    {
      "date": "2025-09-27",
      "now": 690,
      "then": 503
    },
    {
      "date": "2025-09-28",
      "now": 625,
      "then": 587
    },
    {
      "date": "2025-09-29",
      "now": 616,
      "then": 618
    },
    {
      "date": "2025-09-30",
      "now": 684,
      "then": 644
    },
    {
      "date": "2025-10-01",
      "now": 771,
      "then": 610
    },
    {
      "date": "2025-10-02",
      "now": 782,
      "then": 570
    },
    {
      "date": "2025-10-03",
      "now": 728,
      "then": 542
    },
    {
      "date": "2025-10-04",
      "now": 717,
      "then": 584
    },
    {
      "date": "2025-10-05",
      "now": 656,
      "then": 570
    },
    {
      "date": "2025-10-06",
      "now": 675,
      "then": 690
    },
    {
      "date": "2025-10-07",
      "now": 732,
      "then": 717
    },
    {
      "date": "2025-10-08",
      "now": 834,
      "then": 657
    },
    {
      "date": "2025-10-09",
      "now": 846,
      "then": 600
    },
    {
      "date": "2025-10-10",
      "now": 950,
      "then": 621
    },
    {
      "date": "2025-10-11",
      "now": 953,
      "then": 561
    },
    {
      "date": "2025-10-12",
      "now": 848,
      "then": 646
    },
    {
      "date": "2025-10-13",
      "now": 797,
      "then": 776
    },
    {
      "date": "2025-10-14",
      "now": 768,
      "then": 754
    },
    {
      "date": "2025-10-15",
      "now": 838,
      "then": 743
    },
    {
      "date": "2025-10-16",
      "now": 949,
      "then": 734
    },
    {
      "date": "2025-10-17",
      "now": 948,
      "then": 592
    },
    {
      "date": "2025-10-18",
      "now": 915,
      "then": 631
    },
    {
      "date": "2025-10-19",
      "now": 859,
      "then": 755
    },
    {
      "date": "2025-10-20",
      "now": 857,
      "then": 844
    },
    {
      "date": "2025-10-21",
      "now": 905,
      "then": 824
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
    "alt": "Users rise across 28 days and stay mostly above the previous period."
  }
}
```

## New users

This period and the previous period.

type line. curve linear, so segments are straight. series[1] dash is dashed. legend.show is false. axes.y.title is empty. The blue series token is #1a73e8 and the comparison is #9aa0a6. The previous period is its own series, not a copy of this one.

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
      "now": 302,
      "then": 216
    },
    {
      "date": "2025-09-25",
      "now": 318,
      "then": 221
    },
    {
      "date": "2025-09-26",
      "now": 291,
      "then": 214
    },
    {
      "date": "2025-09-27",
      "now": 256,
      "then": 263
    },
    {
      "date": "2025-09-28",
      "now": 273,
      "then": 253
    },
    {
      "date": "2025-09-29",
      "now": 266,
      "then": 281
    },
    {
      "date": "2025-09-30",
      "now": 314,
      "then": 289
    },
    {
      "date": "2025-10-01",
      "now": 346,
      "then": 252
    },
    {
      "date": "2025-10-02",
      "now": 355,
      "then": 229
    },
    {
      "date": "2025-10-03",
      "now": 324,
      "then": 210
    },
    {
      "date": "2025-10-04",
      "now": 288,
      "then": 261
    },
    {
      "date": "2025-10-05",
      "now": 289,
      "then": 301
    },
    {
      "date": "2025-10-06",
      "now": 308,
      "then": 301
    },
    {
      "date": "2025-10-07",
      "now": 341,
      "then": 327
    },
    {
      "date": "2025-10-08",
      "now": 368,
      "then": 296
    },
    {
      "date": "2025-10-09",
      "now": 363,
      "then": 274
    },
    {
      "date": "2025-10-10",
      "now": 378,
      "then": 230
    },
    {
      "date": "2025-10-11",
      "now": 338,
      "then": 271
    },
    {
      "date": "2025-10-12",
      "now": 334,
      "then": 327
    },
    {
      "date": "2025-10-13",
      "now": 332,
      "then": 352
    },
    {
      "date": "2025-10-14",
      "now": 374,
      "then": 336
    },
    {
      "date": "2025-10-15",
      "now": 411,
      "then": 315
    },
    {
      "date": "2025-10-16",
      "now": 430,
      "then": 261
    },
    {
      "date": "2025-10-17",
      "now": 385,
      "then": 282
    },
    {
      "date": "2025-10-18",
      "now": 378,
      "then": 290
    },
    {
      "date": "2025-10-19",
      "now": 362,
      "then": 329
    },
    {
      "date": "2025-10-20",
      "now": 379,
      "then": 364
    },
    {
      "date": "2025-10-21",
      "now": 414,
      "then": 344
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

type line. curve linear, so segments are straight. series[1] dash is dashed. legend.show is false. axes.y.title is empty. The blue series token is #1a73e8 and the comparison is #9aa0a6. The previous period is its own series, not a copy of this one.

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
      "now": 155,
      "then": 144
    },
    {
      "date": "2025-09-25",
      "now": 160,
      "then": 143
    },
    {
      "date": "2025-09-26",
      "now": 164,
      "then": 126
    },
    {
      "date": "2025-09-27",
      "now": 149,
      "then": 119
    },
    {
      "date": "2025-09-28",
      "now": 137,
      "then": 134
    },
    {
      "date": "2025-09-29",
      "now": 141,
      "then": 149
    },
    {
      "date": "2025-09-30",
      "now": 164,
      "then": 164
    },
    {
      "date": "2025-10-01",
      "now": 174,
      "then": 159
    },
    {
      "date": "2025-10-02",
      "now": 177,
      "then": 148
    },
    {
      "date": "2025-10-03",
      "now": 174,
      "then": 137
    },
    {
      "date": "2025-10-04",
      "now": 164,
      "then": 121
    },
    {
      "date": "2025-10-05",
      "now": 159,
      "then": 135
    },
    {
      "date": "2025-10-06",
      "now": 152,
      "then": 161
    },
    {
      "date": "2025-10-07",
      "now": 174,
      "then": 162
    },
    {
      "date": "2025-10-08",
      "now": 173,
      "then": 157
    },
    {
      "date": "2025-10-09",
      "now": 188,
      "then": 155
    },
    {
      "date": "2025-10-10",
      "now": 172,
      "then": 142
    },
    {
      "date": "2025-10-11",
      "now": 172,
      "then": 134
    },
    {
      "date": "2025-10-12",
      "now": 172,
      "then": 146
    },
    {
      "date": "2025-10-13",
      "now": 163,
      "then": 161
    },
    {
      "date": "2025-10-14",
      "now": 183,
      "then": 172
    },
    {
      "date": "2025-10-15",
      "now": 197,
      "then": 170
    },
    {
      "date": "2025-10-16",
      "now": 189,
      "then": 169
    },
    {
      "date": "2025-10-17",
      "now": 194,
      "then": 145
    },
    {
      "date": "2025-10-18",
      "now": 182,
      "then": 141
    },
    {
      "date": "2025-10-19",
      "now": 183,
      "then": 155
    },
    {
      "date": "2025-10-20",
      "now": 174,
      "then": 166
    },
    {
      "date": "2025-10-21",
      "now": 190,
      "then": 168
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

type line. curve linear, so segments are straight. series[1] dash is dashed. legend.show is false. axes.y.title is empty. The blue series token is #1a73e8 and the comparison is #9aa0a6. The previous period is its own series, not a copy of this one.

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
      "now": 1095,
      "then": 976
    },
    {
      "date": "2025-09-25",
      "now": 1299,
      "then": 959
    },
    {
      "date": "2025-09-26",
      "now": 1275,
      "then": 877
    },
    {
      "date": "2025-09-27",
      "now": 1221,
      "then": 950
    },
    {
      "date": "2025-09-28",
      "now": 1138,
      "then": 1079
    },
    {
      "date": "2025-09-29",
      "now": 1057,
      "then": 1201
    },
    {
      "date": "2025-09-30",
      "now": 1216,
      "then": 1132
    },
    {
      "date": "2025-10-01",
      "now": 1239,
      "then": 1156
    },
    {
      "date": "2025-10-02",
      "now": 1345,
      "then": 1053
    },
    {
      "date": "2025-10-03",
      "now": 1390,
      "then": 931
    },
    {
      "date": "2025-10-04",
      "now": 1523,
      "then": 1007
    },
    {
      "date": "2025-10-05",
      "now": 1550,
      "then": 1165
    },
    {
      "date": "2025-10-06",
      "now": 1427,
      "then": 1310
    },
    {
      "date": "2025-10-07",
      "now": 1343,
      "then": 1375
    },
    {
      "date": "2025-10-08",
      "now": 1457,
      "then": 1312
    },
    {
      "date": "2025-10-09",
      "now": 1459,
      "then": 1065
    },
    {
      "date": "2025-10-10",
      "now": 1491,
      "then": 1051
    },
    {
      "date": "2025-10-11",
      "now": 1523,
      "then": 1135
    },
    {
      "date": "2025-10-12",
      "now": 1332,
      "then": 1200
    },
    {
      "date": "2025-10-13",
      "now": 1366,
      "then": 1339
    },
    {
      "date": "2025-10-14",
      "now": 1473,
      "then": 1482
    },
    {
      "date": "2025-10-15",
      "now": 1645,
      "then": 1295
    },
    {
      "date": "2025-10-16",
      "now": 1738,
      "then": 1142
    },
    {
      "date": "2025-10-17",
      "now": 1670,
      "then": 1120
    },
    {
      "date": "2025-10-18",
      "now": 1620,
      "then": 1276
    },
    {
      "date": "2025-10-19",
      "now": 1488,
      "then": 1443
    },
    {
      "date": "2025-10-20",
      "now": 1517,
      "then": 1531
    },
    {
      "date": "2025-10-21",
      "now": 1670,
      "then": 1482
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

type heatmap. encoding.color.range is a continuous blue ramp, #e8f0fe, #aecbfa, #1a73e8. Weekday afternoons are the dark cells and nights stay light. Every cell has a value, so none are hatched.

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
      "users": 51
    },
    {
      "day": "Mon",
      "hour": "03",
      "users": 66
    },
    {
      "day": "Mon",
      "hour": "06",
      "users": 128
    },
    {
      "day": "Mon",
      "hour": "09",
      "users": 201
    },
    {
      "day": "Mon",
      "hour": "12",
      "users": 249
    },
    {
      "day": "Mon",
      "hour": "15",
      "users": 202
    },
    {
      "day": "Mon",
      "hour": "18",
      "users": 131
    },
    {
      "day": "Mon",
      "hour": "21",
      "users": 55
    },
    {
      "day": "Tue",
      "hour": "00",
      "users": 50
    },
    {
      "day": "Tue",
      "hour": "03",
      "users": 61
    },
    {
      "day": "Tue",
      "hour": "06",
      "users": 128
    },
    {
      "day": "Tue",
      "hour": "09",
      "users": 203
    },
    {
      "day": "Tue",
      "hour": "12",
      "users": 240
    },
    {
      "day": "Tue",
      "hour": "15",
      "users": 197
    },
    {
      "day": "Tue",
      "hour": "18",
      "users": 135
    },
    {
      "day": "Tue",
      "hour": "21",
      "users": 59
    },
    {
      "day": "Wed",
      "hour": "00",
      "users": 53
    },
    {
      "day": "Wed",
      "hour": "03",
      "users": 61
    },
    {
      "day": "Wed",
      "hour": "06",
      "users": 128
    },
    {
      "day": "Wed",
      "hour": "09",
      "users": 209
    },
    {
      "day": "Wed",
      "hour": "12",
      "users": 241
    },
    {
      "day": "Wed",
      "hour": "15",
      "users": 198
    },
    {
      "day": "Wed",
      "hour": "18",
      "users": 134
    },
    {
      "day": "Wed",
      "hour": "21",
      "users": 59
    },
    {
      "day": "Thu",
      "hour": "00",
      "users": 47
    },
    {
      "day": "Thu",
      "hour": "03",
      "users": 65
    },
    {
      "day": "Thu",
      "hour": "06",
      "users": 122
    },
    {
      "day": "Thu",
      "hour": "09",
      "users": 207
    },
    {
      "day": "Thu",
      "hour": "12",
      "users": 240
    },
    {
      "day": "Thu",
      "hour": "15",
      "users": 207
    },
    {
      "day": "Thu",
      "hour": "18",
      "users": 125
    },
    {
      "day": "Thu",
      "hour": "21",
      "users": 63
    },
    {
      "day": "Fri",
      "hour": "00",
      "users": 60
    },
    {
      "day": "Fri",
      "hour": "03",
      "users": 63
    },
    {
      "day": "Fri",
      "hour": "06",
      "users": 133
    },
    {
      "day": "Fri",
      "hour": "09",
      "users": 201
    },
    {
      "day": "Fri",
      "hour": "12",
      "users": 239
    },
    {
      "day": "Fri",
      "hour": "15",
      "users": 198
    },
    {
      "day": "Fri",
      "hour": "18",
      "users": 124
    },
    {
      "day": "Fri",
      "hour": "21",
      "users": 52
    },
    {
      "day": "Sat",
      "hour": "00",
      "users": 35
    },
    {
      "day": "Sat",
      "hour": "03",
      "users": 32
    },
    {
      "day": "Sat",
      "hour": "06",
      "users": 56
    },
    {
      "day": "Sat",
      "hour": "09",
      "users": 86
    },
    {
      "day": "Sat",
      "hour": "12",
      "users": 101
    },
    {
      "day": "Sat",
      "hour": "15",
      "users": 85
    },
    {
      "day": "Sat",
      "hour": "18",
      "users": 63
    },
    {
      "day": "Sat",
      "hour": "21",
      "users": 30
    },
    {
      "day": "Sun",
      "hour": "00",
      "users": 32
    },
    {
      "day": "Sun",
      "hour": "03",
      "users": 35
    },
    {
      "day": "Sun",
      "hour": "06",
      "users": 59
    },
    {
      "day": "Sun",
      "hour": "09",
      "users": 91
    },
    {
      "day": "Sun",
      "hour": "12",
      "users": 106
    },
    {
      "day": "Sun",
      "hour": "15",
      "users": 91
    },
    {
      "day": "Sun",
      "hour": "18",
      "users": 60
    },
    {
      "day": "Sun",
      "hour": "21",
      "users": 36
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
        "#aecbfa",
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
- **Hour grid.** The heatmap is weekday by hour. color.range is the continuous ramp #e8f0fe, #aecbfa, #1a73e8. Nights are light and weekday afternoons are dark.

https://chartkit.dev/dashboards/wayline
