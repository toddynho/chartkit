# Product discovery map

Research for Quill, a fictional notebook. Effort against delight, three overlapping sets, and a first-note journey.

## Where the next build sits

Light effort to the left, loud delight up.

```json
{
  "version": "1",
  "id": "quill-bets",
  "type": "quadrant",
  "theme": "soft",
  "quadrants": [
    "Do it now",
    "Worth the wait",
    "Leave it",
    "Later"
  ],
  "data": [
    {
      "name": "Ink search",
      "x": 0.22,
      "y": 0.8
    },
    {
      "name": "Pinned lines",
      "x": 0.34,
      "y": 0.62
    },
    {
      "name": "Shared notebook",
      "x": 0.78,
      "y": 0.84
    },
    {
      "name": "Offline pad",
      "x": 0.7,
      "y": 0.3
    },
    {
      "name": "Side notes",
      "x": 0.28,
      "y": 0.26
    }
  ],
  "encoding": {
    "x": {
      "field": "x",
      "title": "Light effort|Heavy effort",
      "scale": {
        "domain": [
          0,
          1
        ]
      }
    },
    "y": {
      "field": "y",
      "title": "Quiet delight|Loud delight",
      "scale": {
        "domain": [
          0,
          1
        ]
      }
    }
  },
  "size": {
    "width": 640,
    "height": 460
  },
  "a11y": {
    "alt": "Ink search is a quick win. A shared notebook is heavy and still delightful. Offline pad is heavy and quiet."
  }
}
```

## What notebooks combine

Three-set areas are approximate.

```json
{
  "version": "1",
  "id": "quill-sets",
  "type": "venn",
  "theme": "soft",
  "data": [
    {
      "set": "Ink",
      "size": 640
    },
    {
      "set": "Pins",
      "size": 410
    },
    {
      "set": "Search",
      "size": 280
    },
    {
      "set": "Ink+Pins",
      "size": 190
    },
    {
      "set": "Ink+Search",
      "size": 120
    },
    {
      "set": "Pins+Search",
      "size": 70
    },
    {
      "set": "Ink+Pins+Search",
      "size": 36
    }
  ],
  "encoding": {
    "x": "set",
    "y": "size"
  },
  "size": {
    "width": 640,
    "height": 460
  },
  "a11y": {
    "alt": "Ink, pins, and search overlap. Thirty-six notebooks use all three."
  }
}
```

## First note

Scores from 1 to 5, and who was in the room.

```json
{
  "version": "1",
  "id": "quill-journey",
  "type": "journey",
  "theme": "soft",
  "data": [
    {
      "section": "Open",
      "step": "Name the notebook",
      "score": 5,
      "actors": "Writer"
    },
    {
      "section": "Open",
      "step": "Pick a cover",
      "score": 4,
      "actors": "Writer"
    },
    {
      "section": "Write",
      "step": "First line",
      "score": 5,
      "actors": "Writer"
    },
    {
      "section": "Write",
      "step": "Find it again",
      "score": 2,
      "actors": "Writer"
    },
    {
      "section": "Share",
      "step": "Send a page",
      "score": 3,
      "actors": "Writer, Reader"
    },
    {
      "section": "Share",
      "step": "See a reply",
      "score": 4,
      "actors": "Writer, Reader"
    }
  ],
  "encoding": {
    "x": "step",
    "y": "score",
    "series": "section",
    "color": "actors"
  },
  "size": {
    "width": 760,
    "height": 420
  },
  "a11y": {
    "alt": "Naming and the first line score 5. Finding the note again drops to 2, then a reply recovers it."
  }
}
```

## Scores by room

The legend is on the left.

```json
{
  "version": "1",
  "id": "quill-rooms",
  "type": "bar",
  "theme": "soft",
  "data": [
    {
      "room": "Open",
      "novice": 4,
      "steady": 5
    },
    {
      "room": "Write",
      "novice": 3,
      "steady": 5
    },
    {
      "room": "Share",
      "novice": 2,
      "steady": 4
    }
  ],
  "encoding": {
    "x": "room",
    "y": [
      {
        "field": "novice",
        "title": "Novice"
      },
      {
        "field": "steady",
        "title": "Steady"
      }
    ]
  },
  "legend": {
    "position": "left",
    "orient": "vertical"
  },
  "axes": {
    "x": {
      "title": "Room"
    },
    "y": {
      "title": "Score",
      "ticks": [
        0,
        2,
        4,
        6
      ]
    }
  },
  "size": {
    "width": 880,
    "height": 360
  },
  "a11y": {
    "alt": "Steady writers score higher in every room. The gap is widest on Share."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Explicit tick values](https://chartkit.dev/features/axis.ticks.values) (`axis.ticks.values`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Grouped bar](https://chartkit.dev/features/type.bar.grouped) (`type.bar.grouped`)
- [Column / vertical bar](https://chartkit.dev/features/type.bar.vertical) (`type.bar.vertical`)
- [User journey](https://chartkit.dev/features/type.journey) (`type.journey`)
- [Quadrant chart](https://chartkit.dev/features/type.quadrant) (`type.quadrant`)
- [Venn / Euler diagram](https://chartkit.dev/features/type.venn) (`type.venn`)

https://chartkit.dev/showcase/discovery
