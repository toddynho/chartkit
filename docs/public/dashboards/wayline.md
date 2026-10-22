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
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
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
    "width": 420,
    "height": 148
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
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
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
    "width": 420,
    "height": 148
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
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
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
    "width": 420,
    "height": 148
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
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
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
    "width": 420,
    "height": 148
  },
  "a11y": {
    "alt": "Revenue over 28 days, with a dashed previous period."
  }
}
```

## Last 30 minutes

Users in the last half hour.

type bar. A small realtime card. axes are off so the bars fill the card. The series token is #1a73e8.

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
        "#1a73e8",
        "#9aa0a6"
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "minute": "1",
      "users": 8
    },
    {
      "minute": "2",
      "users": 14
    },
    {
      "minute": "3",
      "users": 9
    },
    {
      "minute": "4",
      "users": 15
    },
    {
      "minute": "5",
      "users": 10
    },
    {
      "minute": "6",
      "users": 16
    },
    {
      "minute": "7",
      "users": 11
    },
    {
      "minute": "8",
      "users": 17
    },
    {
      "minute": "9",
      "users": 12
    },
    {
      "minute": "10",
      "users": 18
    },
    {
      "minute": "11",
      "users": 13
    },
    {
      "minute": "12",
      "users": 8
    },
    {
      "minute": "13",
      "users": 14
    },
    {
      "minute": "14",
      "users": 9
    },
    {
      "minute": "15",
      "users": 15
    },
    {
      "minute": "16",
      "users": 10
    },
    {
      "minute": "17",
      "users": 16
    },
    {
      "minute": "18",
      "users": 11
    },
    {
      "minute": "19",
      "users": 17
    },
    {
      "minute": "20",
      "users": 12
    },
    {
      "minute": "21",
      "users": 18
    },
    {
      "minute": "22",
      "users": 13
    },
    {
      "minute": "23",
      "users": 8
    },
    {
      "minute": "24",
      "users": 20
    },
    {
      "minute": "25",
      "users": 15
    },
    {
      "minute": "26",
      "users": 21
    },
    {
      "minute": "27",
      "users": 16
    },
    {
      "minute": "28",
      "users": 22
    },
    {
      "minute": "29",
      "users": 17
    },
    {
      "minute": "30",
      "users": 23
    }
  ],
  "encoding": {
    "x": "minute",
    "y": "users"
  },
  "axes": {
    "x": false,
    "y": false
  },
  "legend": {
    "show": false
  },
  "mark": {
    "gap": 0.2,
    "cornerRadius": 1
  },
  "size": {
    "width": 280,
    "height": 72
  },
  "a11y": {
    "alt": "Users in each of the last 30 minutes."
  }
}
```

## New users by channel

Horizontal bars for the five channels.

type bar with mark.orientation horizontal. The series token is #1a73e8. legend.show is false.

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
        "#1a73e8",
        "#9aa0a6"
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "channel": "Search",
      "users": 6380
    },
    {
      "channel": "Direct",
      "users": 3646
    },
    {
      "channel": "Mail",
      "users": 2430
    },
    {
      "channel": "Social",
      "users": 1671
    },
    {
      "channel": "Referral",
      "users": 1063
    }
  ],
  "encoding": {
    "x": "channel",
    "y": {
      "field": "users",
      "title": "New users",
      "format": "compact"
    }
  },
  "mark": {
    "orientation": "horizontal",
    "gap": 0.32,
    "cornerRadius": 2
  },
  "axes": {
    "x": {
      "title": "",
      "grid": false
    },
    "y": {
      "title": "",
      "grid": false
    }
  },
  "legend": {
    "show": false
  },
  "size": {
    "width": 300,
    "height": 180
  },
  "a11y": {
    "alt": "Search brings the most new users. Referral brings the fewest."
  }
}
```

## User activity over time

30 days, 7 days, or 1 day.

type line. The card switches 30 days, 7 days, and 1 day. The series token is #1a73e8. legend.show is false.

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
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-09-24",
      "users": 630
    },
    {
      "date": "2025-09-25",
      "users": 655
    },
    {
      "date": "2025-09-26",
      "users": 676
    },
    {
      "date": "2025-09-27",
      "users": 690
    },
    {
      "date": "2025-09-28",
      "users": 625
    },
    {
      "date": "2025-09-29",
      "users": 616
    },
    {
      "date": "2025-09-30",
      "users": 684
    },
    {
      "date": "2025-10-01",
      "users": 771
    },
    {
      "date": "2025-10-02",
      "users": 782
    },
    {
      "date": "2025-10-03",
      "users": 728
    },
    {
      "date": "2025-10-04",
      "users": 717
    },
    {
      "date": "2025-10-05",
      "users": 656
    },
    {
      "date": "2025-10-06",
      "users": 675
    },
    {
      "date": "2025-10-07",
      "users": 732
    },
    {
      "date": "2025-10-08",
      "users": 834
    },
    {
      "date": "2025-10-09",
      "users": 827
    },
    {
      "date": "2025-10-10",
      "users": 883
    },
    {
      "date": "2025-10-11",
      "users": 793
    },
    {
      "date": "2025-10-12",
      "users": 781
    },
    {
      "date": "2025-10-13",
      "users": 778
    },
    {
      "date": "2025-10-14",
      "users": 768
    },
    {
      "date": "2025-10-15",
      "users": 838
    },
    {
      "date": "2025-10-16",
      "users": 949
    },
    {
      "date": "2025-10-17",
      "users": 948
    },
    {
      "date": "2025-10-18",
      "users": 915
    },
    {
      "date": "2025-10-19",
      "users": 859
    },
    {
      "date": "2025-10-20",
      "users": 857
    },
    {
      "date": "2025-10-21",
      "users": 905
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": "users"
  },
  "mark": {
    "curve": "linear",
    "strokeWidth": 2,
    "points": "none"
  },
  "axes": {
    "x": {
      "grid": false,
      "ticks": "ends"
    },
    "y": {
      "title": "",
      "grid": true
    }
  },
  "legend": {
    "show": false
  },
  "size": {
    "width": 300,
    "height": 150
  },
  "a11y": {
    "alt": "User activity across 30 days."
  }
}
```

### 30 days

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
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-09-24",
      "users": 630
    },
    {
      "date": "2025-09-25",
      "users": 655
    },
    {
      "date": "2025-09-26",
      "users": 676
    },
    {
      "date": "2025-09-27",
      "users": 690
    },
    {
      "date": "2025-09-28",
      "users": 625
    },
    {
      "date": "2025-09-29",
      "users": 616
    },
    {
      "date": "2025-09-30",
      "users": 684
    },
    {
      "date": "2025-10-01",
      "users": 771
    },
    {
      "date": "2025-10-02",
      "users": 782
    },
    {
      "date": "2025-10-03",
      "users": 728
    },
    {
      "date": "2025-10-04",
      "users": 717
    },
    {
      "date": "2025-10-05",
      "users": 656
    },
    {
      "date": "2025-10-06",
      "users": 675
    },
    {
      "date": "2025-10-07",
      "users": 732
    },
    {
      "date": "2025-10-08",
      "users": 834
    },
    {
      "date": "2025-10-09",
      "users": 827
    },
    {
      "date": "2025-10-10",
      "users": 883
    },
    {
      "date": "2025-10-11",
      "users": 793
    },
    {
      "date": "2025-10-12",
      "users": 781
    },
    {
      "date": "2025-10-13",
      "users": 778
    },
    {
      "date": "2025-10-14",
      "users": 768
    },
    {
      "date": "2025-10-15",
      "users": 838
    },
    {
      "date": "2025-10-16",
      "users": 949
    },
    {
      "date": "2025-10-17",
      "users": 948
    },
    {
      "date": "2025-10-18",
      "users": 915
    },
    {
      "date": "2025-10-19",
      "users": 859
    },
    {
      "date": "2025-10-20",
      "users": 857
    },
    {
      "date": "2025-10-21",
      "users": 905
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": "users"
  },
  "mark": {
    "curve": "linear",
    "strokeWidth": 2,
    "points": "none"
  },
  "axes": {
    "x": {
      "grid": false,
      "ticks": "ends"
    },
    "y": {
      "title": "",
      "grid": true
    }
  },
  "legend": {
    "show": false
  },
  "size": {
    "width": 300,
    "height": 150
  },
  "a11y": {
    "alt": "User activity across 30 days."
  }
}
```

### 7 days

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
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "date": "2025-10-15",
      "users": 760
    },
    {
      "date": "2025-10-16",
      "users": 775
    },
    {
      "date": "2025-10-17",
      "users": 826
    },
    {
      "date": "2025-10-18",
      "users": 793
    },
    {
      "date": "2025-10-19",
      "users": 786
    },
    {
      "date": "2025-10-20",
      "users": 876
    },
    {
      "date": "2025-10-21",
      "users": 920
    }
  ],
  "encoding": {
    "x": {
      "field": "date",
      "type": "temporal"
    },
    "y": "users"
  },
  "mark": {
    "curve": "linear",
    "strokeWidth": 2,
    "points": "none"
  },
  "axes": {
    "x": {
      "grid": false,
      "ticks": "ends"
    },
    "y": {
      "title": "",
      "grid": true
    }
  },
  "legend": {
    "show": false
  },
  "size": {
    "width": 300,
    "height": 150
  },
  "a11y": {
    "alt": "User activity across 7 days."
  }
}
```

### 1 day

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
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "hour": "00",
      "users": 120
    },
    {
      "hour": "04",
      "users": 80
    },
    {
      "hour": "08",
      "users": 210
    },
    {
      "hour": "12",
      "users": 340
    },
    {
      "hour": "16",
      "users": 290
    },
    {
      "hour": "20",
      "users": 160
    }
  ],
  "encoding": {
    "x": "hour",
    "y": "users"
  },
  "mark": {
    "curve": "linear",
    "strokeWidth": 2,
    "points": "none"
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
  "size": {
    "width": 300,
    "height": 150
  },
  "a11y": {
    "alt": "User activity across one day."
  }
}
```

## Cohort

Users remaining by period.

type heatmap. Rows are cohorts and columns are periods. color.range is #e8f0fe, #aecbfa, #1a73e8. Later periods are lighter.

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
      ],
      "fontFamily": "Roboto, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "cohort": "Cohort A",
      "period": "0",
      "users": 93
    },
    {
      "cohort": "Cohort A",
      "period": "1",
      "users": 89
    },
    {
      "cohort": "Cohort A",
      "period": "2",
      "users": 79
    },
    {
      "cohort": "Cohort A",
      "period": "3",
      "users": 70
    },
    {
      "cohort": "Cohort A",
      "period": "4",
      "users": 64
    },
    {
      "cohort": "Cohort A",
      "period": "5",
      "users": 54
    },
    {
      "cohort": "Cohort A",
      "period": "6",
      "users": 48
    },
    {
      "cohort": "Cohort B",
      "period": "0",
      "users": 93
    },
    {
      "cohort": "Cohort B",
      "period": "1",
      "users": 84
    },
    {
      "cohort": "Cohort B",
      "period": "2",
      "users": 77
    },
    {
      "cohort": "Cohort B",
      "period": "3",
      "users": 68
    },
    {
      "cohort": "Cohort B",
      "period": "4",
      "users": 58
    },
    {
      "cohort": "Cohort B",
      "period": "5",
      "users": 48
    },
    {
      "cohort": "Cohort B",
      "period": "6",
      "users": 38
    },
    {
      "cohort": "Cohort C",
      "period": "0",
      "users": 97
    },
    {
      "cohort": "Cohort C",
      "period": "1",
      "users": 85
    },
    {
      "cohort": "Cohort C",
      "period": "2",
      "users": 74
    },
    {
      "cohort": "Cohort C",
      "period": "3",
      "users": 65
    },
    {
      "cohort": "Cohort C",
      "period": "4",
      "users": 55
    },
    {
      "cohort": "Cohort C",
      "period": "5",
      "users": 46
    },
    {
      "cohort": "Cohort C",
      "period": "6",
      "users": 34
    },
    {
      "cohort": "Cohort D",
      "period": "0",
      "users": 93
    },
    {
      "cohort": "Cohort D",
      "period": "1",
      "users": 86
    },
    {
      "cohort": "Cohort D",
      "period": "2",
      "users": 73
    },
    {
      "cohort": "Cohort D",
      "period": "3",
      "users": 59
    },
    {
      "cohort": "Cohort D",
      "period": "4",
      "users": 53
    },
    {
      "cohort": "Cohort D",
      "period": "5",
      "users": 38
    },
    {
      "cohort": "Cohort D",
      "period": "6",
      "users": 30
    }
  ],
  "encoding": {
    "x": "period",
    "y": "cohort",
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
    "width": 300,
    "height": 180
  },
  "a11y": {
    "alt": "Each cohort fades across the seven periods."
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
    "show": true,
    "position": "bottom"
  },
  "size": {
    "width": 280,
    "height": 180
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
    "show": true,
    "position": "bottom"
  },
  "size": {
    "width": 280,
    "height": 180
  },
  "a11y": {
    "alt": "Users across more than forty countries. Countries without a row are plain grey."
  }
}
```

## What produces this look

- **Snapshot grid.** Eight cards in two rows of four: users with a metric strip, last 30 minutes, insights, new users by channel, a sessions table, a map with a country table, user activity over time, and a cohort heatmap. There is no donut.
- **Comparison.** curve linear keeps the segments straight. The previous period is dash dashed in #9aa0a6. axes.y.title is empty. Midnight uses #8ab4f8 for this period.
- **Map.** Fifty-two countries use encoding.color.range #aecbfa, #669df6, #1a73e8. mark.nodata fill paints missing countries with mark.land. There is no hatch.
- **Cohort.** The heatmap rows are cohorts and the columns are periods 0 through 6. color.range is #e8f0fe, #aecbfa, #1a73e8.

https://chartkit.dev/dashboards/wayline
