# Keel

Event volume, a release band, a sparkline on each issue, and p50 against p95. Dark first.

Inspired by common SaaS dashboard styles. ChartKit is not affiliated with any product.

Default theme: midnight.

## Event volume

Stacked bars. The shaded band is the 2.4 release window.

type bar, encoding.series, mark.stack stack. annotations band on x from Wed to Thu, plus a rule at Thu.

```json
{
  "version": "1",
  "type": "bar",
  "theme": "midnight",
  "data": [
    {
      "day": "Mon",
      "level": "Fault",
      "events": 40
    },
    {
      "day": "Mon",
      "level": "Warn",
      "events": 22
    },
    {
      "day": "Mon",
      "level": "Note",
      "events": 18
    },
    {
      "day": "Tue",
      "level": "Fault",
      "events": 36
    },
    {
      "day": "Tue",
      "level": "Warn",
      "events": 24
    },
    {
      "day": "Tue",
      "level": "Note",
      "events": 20
    },
    {
      "day": "Wed",
      "level": "Fault",
      "events": 52
    },
    {
      "day": "Wed",
      "level": "Warn",
      "events": 30
    },
    {
      "day": "Wed",
      "level": "Note",
      "events": 16
    },
    {
      "day": "Thu",
      "level": "Fault",
      "events": 44
    },
    {
      "day": "Thu",
      "level": "Warn",
      "events": 28
    },
    {
      "day": "Thu",
      "level": "Note",
      "events": 22
    },
    {
      "day": "Fri",
      "level": "Fault",
      "events": 33
    },
    {
      "day": "Fri",
      "level": "Warn",
      "events": 20
    },
    {
      "day": "Fri",
      "level": "Note",
      "events": 24
    },
    {
      "day": "Sat",
      "level": "Fault",
      "events": 18
    },
    {
      "day": "Sat",
      "level": "Warn",
      "events": 12
    },
    {
      "day": "Sat",
      "level": "Note",
      "events": 14
    },
    {
      "day": "Sun",
      "level": "Fault",
      "events": 16
    },
    {
      "day": "Sun",
      "level": "Warn",
      "events": 11
    },
    {
      "day": "Sun",
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
      "title": "Day"
    },
    "y": {
      "title": "Events"
    }
  },
  "legend": {
    "position": "top"
  },
  "annotations": [
    {
      "type": "band",
      "axis": "x",
      "from": "Wed",
      "to": "Thu",
      "label": "Keel 2.4",
      "opacity": 0.18
    },
    {
      "type": "rule",
      "axis": "x",
      "value": "Thu",
      "label": "Ship",
      "dash": "solid"
    }
  ],
  "size": {
    "width": 760,
    "height": 300
  },
  "a11y": {
    "alt": "Faults peak on Wednesday, inside the Keel 2.4 window, and fall through the weekend."
  }
}
```

## Latency

p50 and p95, two lines, one axis.

type line. Two y fields. The page tokens paint p50 and p95 as different series.

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
  "size": {
    "width": 760,
    "height": 260
  },
  "a11y": {
    "alt": "p95 peaks at 410 milliseconds at noon. p50 stays under 140."
  }
}
```

## Checkout timeout

14 events

```json
{
  "version": "1",
  "type": "sparkline",
  "theme": "midnight",
  "data": [
    2,
    4,
    9,
    6,
    3,
    2,
    1
  ],
  "size": {
    "width": 148,
    "height": 36
  },
  "a11y": {
    "alt": "Checkout timeout is busiest midweek."
  }
}
```

## Map tile retry

11 events

```json
{
  "version": "1",
  "type": "sparkline",
  "theme": "midnight",
  "data": [
    1,
    1,
    2,
    5,
    4,
    2,
    2
  ],
  "size": {
    "width": 148,
    "height": 36
  },
  "a11y": {
    "alt": "Map tile retry is busiest midweek."
  }
}
```

## Queue lag

27 events

```json
{
  "version": "1",
  "type": "sparkline",
  "theme": "midnight",
  "data": [
    6,
    5,
    4,
    4,
    3,
    3,
    2
  ],
  "size": {
    "width": 148,
    "height": 36
  },
  "a11y": {
    "alt": "Queue lag is busiest midweek."
  }
}
```

## Auth clock skew

8 events

```json
{
  "version": "1",
  "type": "sparkline",
  "theme": "midnight",
  "data": [
    0,
    1,
    1,
    8,
    3,
    1,
    0
  ],
  "size": {
    "width": 148,
    "height": 36
  },
  "a11y": {
    "alt": "Auth clock skew is busiest midweek."
  }
}
```

## Options

- **Dark first.** The spec theme defaults to midnight. Soft still renders; the page tokens shift with the toggle.
- **Release band.** annotations band shades Wed to Thu. A rule annotation marks the ship.
- **Issue rows.** Each row is a sparkline spec. The label is page text, not a chart title.

https://chartkit.dev/dashboards/keel
