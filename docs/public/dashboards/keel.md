# Keel

Issues for the last 14 days.

Range: 14 days.

Inspired by common SaaS dashboard styles. ChartKit is not affiliated with any product.

Default theme: midnight.

## Event volume

Fault, warn, and note.

type bar with encoding.series and mark.stack stack. The 24h variant is the same bar over eight hours. The area variant is type stacked-area. The release band uses color text so the label is not the fault red. Ship uses labelPosition end, so the label sits above the plot.

```json
{
  "version": "1",
  "type": "bar",
  "theme": "midnight",
  "data": [
    {
      "day": "8",
      "level": "Fault",
      "events": 22
    },
    {
      "day": "8",
      "level": "Warn",
      "events": 14
    },
    {
      "day": "8",
      "level": "Note",
      "events": 12
    },
    {
      "day": "9",
      "level": "Fault",
      "events": 28
    },
    {
      "day": "9",
      "level": "Warn",
      "events": 16
    },
    {
      "day": "9",
      "level": "Note",
      "events": 14
    },
    {
      "day": "10",
      "level": "Fault",
      "events": 24
    },
    {
      "day": "10",
      "level": "Warn",
      "events": 18
    },
    {
      "day": "10",
      "level": "Note",
      "events": 11
    },
    {
      "day": "11",
      "level": "Fault",
      "events": 30
    },
    {
      "day": "11",
      "level": "Warn",
      "events": 15
    },
    {
      "day": "11",
      "level": "Note",
      "events": 13
    },
    {
      "day": "12",
      "level": "Fault",
      "events": 26
    },
    {
      "day": "12",
      "level": "Warn",
      "events": 17
    },
    {
      "day": "12",
      "level": "Note",
      "events": 16
    },
    {
      "day": "13",
      "level": "Fault",
      "events": 18
    },
    {
      "day": "13",
      "level": "Warn",
      "events": 12
    },
    {
      "day": "13",
      "level": "Note",
      "events": 10
    },
    {
      "day": "14",
      "level": "Fault",
      "events": 16
    },
    {
      "day": "14",
      "level": "Warn",
      "events": 9
    },
    {
      "day": "14",
      "level": "Note",
      "events": 8
    },
    {
      "day": "15",
      "level": "Fault",
      "events": 40
    },
    {
      "day": "15",
      "level": "Warn",
      "events": 22
    },
    {
      "day": "15",
      "level": "Note",
      "events": 18
    },
    {
      "day": "16",
      "level": "Fault",
      "events": 52
    },
    {
      "day": "16",
      "level": "Warn",
      "events": 30
    },
    {
      "day": "16",
      "level": "Note",
      "events": 16
    },
    {
      "day": "17",
      "level": "Fault",
      "events": 44
    },
    {
      "day": "17",
      "level": "Warn",
      "events": 28
    },
    {
      "day": "17",
      "level": "Note",
      "events": 22
    },
    {
      "day": "18",
      "level": "Fault",
      "events": 33
    },
    {
      "day": "18",
      "level": "Warn",
      "events": 20
    },
    {
      "day": "18",
      "level": "Note",
      "events": 24
    },
    {
      "day": "19",
      "level": "Fault",
      "events": 21
    },
    {
      "day": "19",
      "level": "Warn",
      "events": 14
    },
    {
      "day": "19",
      "level": "Note",
      "events": 15
    },
    {
      "day": "20",
      "level": "Fault",
      "events": 18
    },
    {
      "day": "20",
      "level": "Warn",
      "events": 12
    },
    {
      "day": "20",
      "level": "Note",
      "events": 14
    },
    {
      "day": "21",
      "level": "Fault",
      "events": 16
    },
    {
      "day": "21",
      "level": "Warn",
      "events": 11
    },
    {
      "day": "21",
      "level": "Note",
      "events": 13
    }
  ],
  "encoding": {
    "x": "day",
    "y": "events",
    "series": "level"
  },
  "mark": {
    "stack": "stack"
  },
  "axes": {
    "x": {
      "title": "October"
    },
    "y": {
      "title": "Events"
    }
  },
  "legend": {
    "position": "top"
  },
  "tooltip": {
    "mode": "index"
  },
  "annotations": [
    {
      "type": "band",
      "axis": "x",
      "from": "15",
      "to": "16",
      "label": "Keel 2.4",
      "opacity": 0.16,
      "color": "text"
    },
    {
      "type": "rule",
      "axis": "x",
      "value": "16",
      "label": "Ship",
      "labelPosition": "end",
      "dash": "solid",
      "color": "muted"
    }
  ],
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Faults peak on the 16th, inside the Keel 2.4 window."
  }
}
```

### 24h

```json
{
  "version": "1",
  "type": "bar",
  "theme": "midnight",
  "data": [
    {
      "day": "00",
      "level": "Fault",
      "events": 6
    },
    {
      "day": "00",
      "level": "Warn",
      "events": 3
    },
    {
      "day": "00",
      "level": "Note",
      "events": 2
    },
    {
      "day": "03",
      "level": "Fault",
      "events": 4
    },
    {
      "day": "03",
      "level": "Warn",
      "events": 2
    },
    {
      "day": "03",
      "level": "Note",
      "events": 2
    },
    {
      "day": "06",
      "level": "Fault",
      "events": 5
    },
    {
      "day": "06",
      "level": "Warn",
      "events": 3
    },
    {
      "day": "06",
      "level": "Note",
      "events": 1
    },
    {
      "day": "09",
      "level": "Fault",
      "events": 8
    },
    {
      "day": "09",
      "level": "Warn",
      "events": 4
    },
    {
      "day": "09",
      "level": "Note",
      "events": 3
    },
    {
      "day": "12",
      "level": "Fault",
      "events": 14
    },
    {
      "day": "12",
      "level": "Warn",
      "events": 7
    },
    {
      "day": "12",
      "level": "Note",
      "events": 4
    },
    {
      "day": "15",
      "level": "Fault",
      "events": 11
    },
    {
      "day": "15",
      "level": "Warn",
      "events": 6
    },
    {
      "day": "15",
      "level": "Note",
      "events": 3
    },
    {
      "day": "18",
      "level": "Fault",
      "events": 7
    },
    {
      "day": "18",
      "level": "Warn",
      "events": 4
    },
    {
      "day": "18",
      "level": "Note",
      "events": 2
    },
    {
      "day": "21",
      "level": "Fault",
      "events": 4
    },
    {
      "day": "21",
      "level": "Warn",
      "events": 2
    },
    {
      "day": "21",
      "level": "Note",
      "events": 2
    }
  ],
  "encoding": {
    "x": "day",
    "y": "events",
    "series": "level"
  },
  "mark": {
    "stack": "stack"
  },
  "axes": {
    "x": {
      "title": "Hour"
    },
    "y": {
      "title": "Events"
    }
  },
  "legend": {
    "position": "top"
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "Faults peak at noon in the last 24 hours."
  }
}
```

### Area

```json
{
  "version": "1",
  "type": "stacked-area",
  "theme": "midnight",
  "data": [
    {
      "day": "8",
      "Fault": 22,
      "Warn": 14,
      "Note": 12
    },
    {
      "day": "9",
      "Fault": 28,
      "Warn": 16,
      "Note": 14
    },
    {
      "day": "10",
      "Fault": 24,
      "Warn": 18,
      "Note": 11
    },
    {
      "day": "11",
      "Fault": 30,
      "Warn": 15,
      "Note": 13
    },
    {
      "day": "12",
      "Fault": 26,
      "Warn": 17,
      "Note": 16
    },
    {
      "day": "13",
      "Fault": 18,
      "Warn": 12,
      "Note": 10
    },
    {
      "day": "14",
      "Fault": 16,
      "Warn": 9,
      "Note": 8
    },
    {
      "day": "15",
      "Fault": 40,
      "Warn": 22,
      "Note": 18
    },
    {
      "day": "16",
      "Fault": 52,
      "Warn": 30,
      "Note": 16
    },
    {
      "day": "17",
      "Fault": 44,
      "Warn": 28,
      "Note": 22
    },
    {
      "day": "18",
      "Fault": 33,
      "Warn": 20,
      "Note": 24
    },
    {
      "day": "19",
      "Fault": 21,
      "Warn": 14,
      "Note": 15
    },
    {
      "day": "20",
      "Fault": 18,
      "Warn": 12,
      "Note": 14
    },
    {
      "day": "21",
      "Fault": 16,
      "Warn": 11,
      "Note": 13
    }
  ],
  "encoding": {
    "x": "day",
    "y": [
      {
        "field": "Fault",
        "title": "Fault"
      },
      {
        "field": "Warn",
        "title": "Warn"
      },
      {
        "field": "Note",
        "title": "Note"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "October"
    },
    "y": {
      "title": "Events"
    }
  },
  "legend": {
    "position": "top"
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 1100,
    "height": 280
  },
  "a11y": {
    "alt": "The stacked area shows the same 14 days as the bars."
  }
}
```

## Response

p50 and p95.

type line. The card sets --ck-series-1 to a calm colour and --ck-series-2 to a warning colour, so p50 does not use the fault red.

```json
{
  "version": "1",
  "type": "line",
  "theme": "midnight",
  "data": [
    {
      "hour": "00",
      "p50": 80,
      "p95": 210
    },
    {
      "hour": "04",
      "p50": 90,
      "p95": 240
    },
    {
      "hour": "08",
      "p50": 110,
      "p95": 320
    },
    {
      "hour": "12",
      "p50": 140,
      "p95": 410
    },
    {
      "hour": "16",
      "p50": 120,
      "p95": 360
    },
    {
      "hour": "20",
      "p50": 95,
      "p95": 250
    }
  ],
  "encoding": {
    "x": "hour",
    "y": [
      {
        "field": "p50",
        "title": "p50"
      },
      {
        "field": "p95",
        "title": "p95"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Hour"
    },
    "y": {
      "title": "Milliseconds"
    }
  },
  "legend": {
    "position": "top"
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 1100,
    "height": 240
  },
  "a11y": {
    "alt": "p95 peaks at 410 milliseconds at noon. p50 stays under 140."
  }
}
```

## Checkout timeout

Fault. 27 events, 6 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": "midnight",
  "data": [
    {
      "day": "1",
      "events": 2
    },
    {
      "day": "2",
      "events": 4
    },
    {
      "day": "3",
      "events": 9
    },
    {
      "day": "4",
      "events": 6
    },
    {
      "day": "5",
      "events": 3
    },
    {
      "day": "6",
      "events": 2
    },
    {
      "day": "7",
      "events": 1
    }
  ],
  "encoding": {
    "x": "day",
    "y": "events"
  },
  "axes": {
    "x": false,
    "y": false
  },
  "legend": {
    "show": false
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 220,
    "height": 72
  },
  "a11y": {
    "alt": "Checkout timeout over seven days."
  }
}
```

## Map tile retry

Warn. 17 events, 4 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": "midnight",
  "data": [
    {
      "day": "1",
      "events": 1
    },
    {
      "day": "2",
      "events": 1
    },
    {
      "day": "3",
      "events": 2
    },
    {
      "day": "4",
      "events": 5
    },
    {
      "day": "5",
      "events": 4
    },
    {
      "day": "6",
      "events": 2
    },
    {
      "day": "7",
      "events": 2
    }
  ],
  "encoding": {
    "x": "day",
    "y": "events"
  },
  "axes": {
    "x": false,
    "y": false
  },
  "legend": {
    "show": false
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 220,
    "height": 72
  },
  "a11y": {
    "alt": "Map tile retry over seven days."
  }
}
```

## Queue lag

Note. 27 events, 11 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": "midnight",
  "data": [
    {
      "day": "1",
      "events": 6
    },
    {
      "day": "2",
      "events": 5
    },
    {
      "day": "3",
      "events": 4
    },
    {
      "day": "4",
      "events": 4
    },
    {
      "day": "5",
      "events": 3
    },
    {
      "day": "6",
      "events": 3
    },
    {
      "day": "7",
      "events": 2
    }
  ],
  "encoding": {
    "x": "day",
    "y": "events"
  },
  "axes": {
    "x": false,
    "y": false
  },
  "legend": {
    "show": false
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 220,
    "height": 72
  },
  "a11y": {
    "alt": "Queue lag over seven days."
  }
}
```

## Auth clock skew

Fault. 14 events, 3 users.

```json
{
  "version": "1",
  "type": "bar",
  "theme": "midnight",
  "data": [
    {
      "day": "1",
      "events": 0
    },
    {
      "day": "2",
      "events": 1
    },
    {
      "day": "3",
      "events": 1
    },
    {
      "day": "4",
      "events": 8
    },
    {
      "day": "5",
      "events": 3
    },
    {
      "day": "6",
      "events": 1
    },
    {
      "day": "7",
      "events": 0
    }
  ],
  "encoding": {
    "x": "day",
    "y": "events"
  },
  "axes": {
    "x": false,
    "y": false
  },
  "legend": {
    "show": false
  },
  "tooltip": {
    "mode": "index"
  },
  "size": {
    "width": 220,
    "height": 72
  },
  "a11y": {
    "alt": "Auth clock skew over seven days."
  }
}
```

## What produces this look

- **Dark first.** The spec theme defaults to midnight, and the page shell, header, and footer follow that theme. Soft still renders from the toggle.
- **Release band.** The band colour is the text token, so the Keel 2.4 label is not red on the fault series. Ship uses labelPosition end and the muted token, above the plot.
- **Response.** p50 uses a calm colour and p95 a warning colour, set on that card's tokens rather than the fault series.
- **Issues.** Each row is a bar spec with both axes off, so the seven days read as a histogram. The event count and the user count sit on the right.
- **Window.** 14d is the stacked bar. 24h is the same bar over eight hours. Area is a stacked-area of the 14 days.

https://chartkit.dev/dashboards/keel
