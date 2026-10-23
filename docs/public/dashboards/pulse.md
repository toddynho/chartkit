# Fitness-style activity

A fictional week of activity and a day of heart rate.

Range: This week.

Styled after Apple Fitness and Apple Health to show ChartKit's styling flexibility. Not affiliated with or endorsed by Apple.

Default theme: soft.

## Move

Move

type progress-ring. One ring. The series token is #ff375f. Three rings sit side by side because one spec draws one ring.

```json
{
  "version": "1",
  "type": "progress-ring",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#1d1d1f",
      "muted": "#6e6e73",
      "grid": "transparent",
      "axis": "#d2d2d7",
      "accent": "#ff375f",
      "positive": "#30d158",
      "negative": "#ff375f",
      "series": [
        "#ff375f"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "metric": {
    "label": "Move",
    "value": 530,
    "min": 0,
    "max": 600,
    "format": "compact"
  },
  "size": {
    "width": 220,
    "height": 180
  },
  "a11y": {
    "alt": "Move is 530 of a 600 goal."
  }
}
```

## Exercise

Exercise

type progress-ring. One ring. The series token is #30d158. Three rings sit side by side because one spec draws one ring.

```json
{
  "version": "1",
  "type": "progress-ring",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#1d1d1f",
      "muted": "#6e6e73",
      "grid": "transparent",
      "axis": "#d2d2d7",
      "accent": "#ff375f",
      "positive": "#30d158",
      "negative": "#ff375f",
      "series": [
        "#30d158"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "metric": {
    "label": "Exercise",
    "value": 32,
    "min": 0,
    "max": 45,
    "format": "compact"
  },
  "size": {
    "width": 220,
    "height": 180
  },
  "a11y": {
    "alt": "Exercise is 32 minutes toward a 45 minute scale."
  }
}
```

## Stand

Stand

type progress-ring. One ring. The series token is #0a84ff. Three rings sit side by side because one spec draws one ring.

```json
{
  "version": "1",
  "type": "progress-ring",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "transparent",
      "text": "#1d1d1f",
      "muted": "#6e6e73",
      "grid": "transparent",
      "axis": "#d2d2d7",
      "accent": "#ff375f",
      "positive": "#30d158",
      "negative": "#ff375f",
      "series": [
        "#0a84ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "metric": {
    "label": "Stand",
    "value": 10,
    "min": 0,
    "max": 12,
    "format": "compact"
  },
  "size": {
    "width": 220,
    "height": 180
  },
  "a11y": {
    "alt": "Stand is 10 hours of a 12 hour goal."
  }
}
```

## Week

Move, exercise, and stand by day.

type bar. Exercise minutes and stand hours are grouped. Move stays on its ring so its larger unit does not flatten these two.

```json
{
  "version": "1",
  "type": "bar",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1d1d1f",
      "muted": "#6e6e73",
      "grid": "#e8e8ed",
      "axis": "#d2d2d7",
      "accent": "#ff375f",
      "positive": "#30d158",
      "negative": "#ff375f",
      "series": [
        "#ff375f",
        "#30d158",
        "#0a84ff"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "day": "Mon",
      "exercise": 22,
      "stand": 8
    },
    {
      "day": "Tue",
      "exercise": 35,
      "stand": 10
    },
    {
      "day": "Wed",
      "exercise": 18,
      "stand": 7
    },
    {
      "day": "Thu",
      "exercise": 44,
      "stand": 12
    },
    {
      "day": "Fri",
      "exercise": 40,
      "stand": 11
    },
    {
      "day": "Sat",
      "exercise": 28,
      "stand": 9
    },
    {
      "day": "Sun",
      "exercise": 32,
      "stand": 10
    }
  ],
  "encoding": {
    "x": "day",
    "y": [
      {
        "field": "exercise",
        "title": "Exercise"
      },
      {
        "field": "stand",
        "title": "Stand"
      }
    ]
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
    "show": true
  },
  "mark": {
    "gap": 0.3,
    "cornerRadius": 3
  },
  "size": {
    "width": 680,
    "height": 240
  },
  "a11y": {
    "alt": "Exercise minutes and stand hours across seven days."
  }
}
```

## Heart rate

Beats per minute across a day.

type line. The series token is #ff375f.

```json
{
  "version": "1",
  "type": "line",
  "theme": {
    "preset": "soft",
    "tokens": {
      "background": "transparent",
      "surface": "#ffffff",
      "text": "#1d1d1f",
      "muted": "#6e6e73",
      "grid": "#e8e8ed",
      "axis": "#d2d2d7",
      "accent": "#ff375f",
      "positive": "#30d158",
      "negative": "#ff375f",
      "series": [
        "#ff375f"
      ],
      "fontFamily": "Inter, sans-serif",
      "fontSize": 12
    }
  },
  "data": [
    {
      "hour": 0,
      "bpm": 65
    },
    {
      "hour": 1,
      "bpm": 73
    },
    {
      "hour": 2,
      "bpm": 70
    },
    {
      "hour": 3,
      "bpm": 66
    },
    {
      "hour": 4,
      "bpm": 54
    },
    {
      "hour": 5,
      "bpm": 56
    },
    {
      "hour": 6,
      "bpm": 65
    },
    {
      "hour": 7,
      "bpm": 72
    },
    {
      "hour": 8,
      "bpm": 76
    },
    {
      "hour": 9,
      "bpm": 70
    },
    {
      "hour": 10,
      "bpm": 68
    },
    {
      "hour": 11,
      "bpm": 63
    },
    {
      "hour": 12,
      "bpm": 61
    },
    {
      "hour": 13,
      "bpm": 72
    },
    {
      "hour": 14,
      "bpm": 80
    },
    {
      "hour": 15,
      "bpm": 84
    },
    {
      "hour": 16,
      "bpm": 75
    },
    {
      "hour": 17,
      "bpm": 71
    },
    {
      "hour": 18,
      "bpm": 68
    },
    {
      "hour": 19,
      "bpm": 70
    },
    {
      "hour": 20,
      "bpm": 75
    },
    {
      "hour": 21,
      "bpm": 84
    },
    {
      "hour": 22,
      "bpm": 84
    },
    {
      "hour": 23,
      "bpm": 84
    }
  ],
  "encoding": {
    "x": "hour",
    "y": {
      "field": "bpm"
    }
  },
  "axes": {
    "x": {
      "grid": false,
      "ticks": 4
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
    "strokeWidth": 1.75,
    "curve": "monotone",
    "points": "none"
  },
  "size": {
    "width": 320,
    "height": 240
  },
  "a11y": {
    "alt": "Heart rate varies through the day and peaks in the afternoon."
  }
}
```

## What produces this look

- **Rings.** Three progress-ring specs: move #ff375f, exercise #30d158, stand #0a84ff. A single spec cannot draw three concentric rings. That gap is in GAPS.md.
- **Week.** Grouped bars for exercise minutes and stand hours. Move stays on its ring so the larger unit does not flatten the other two.
- **Type.** fontFamily is Inter. The system face used by the reference products is not shipped. The page background is #f5f5f7.

https://chartkit.dev/dashboards/pulse
