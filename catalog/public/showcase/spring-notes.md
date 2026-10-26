# Notes across the spring-forward

Radio notes at four fictional harbours, labelled in America/New_York. The hour axis skips 02:00 when the clocks spring forward. The bars sum the same notes by harbour.

## One night, New York time

The shaded hour is the spring-forward. There is no 02:00 tick.

```json
{
  "version": "1",
  "id": "spring-hours",
  "type": "line",
  "title": "Notes, New York time",
  "subtitle": "March 8, 2026. America/New_York.",
  "theme": "soft",
  "locale": "en-US",
  "timezone": "America/New_York",
  "data": [
    {
      "t": "2026-03-08T00:00:00.000Z",
      "notes": 47
    },
    {
      "t": "2026-03-08T01:00:00.000Z",
      "notes": 53
    },
    {
      "t": "2026-03-08T02:00:00.000Z",
      "notes": 57
    },
    {
      "t": "2026-03-08T03:00:00.000Z",
      "notes": 61
    },
    {
      "t": "2026-03-08T04:00:00.000Z",
      "notes": 63
    },
    {
      "t": "2026-03-08T05:00:00.000Z",
      "notes": 63
    },
    {
      "t": "2026-03-08T06:00:00.000Z",
      "notes": 62
    },
    {
      "t": "2026-03-08T07:00:00.000Z",
      "notes": 60
    },
    {
      "t": "2026-03-08T08:00:00.000Z",
      "notes": 70
    },
    {
      "t": "2026-03-08T09:00:00.000Z",
      "notes": 49
    },
    {
      "t": "2026-03-08T10:00:00.000Z",
      "notes": 44
    },
    {
      "t": "2026-03-08T11:00:00.000Z",
      "notes": 39
    },
    {
      "t": "2026-03-08T12:00:00.000Z",
      "notes": 34
    },
    {
      "t": "2026-03-08T13:00:00.000Z",
      "notes": 31
    },
    {
      "t": "2026-03-08T14:00:00.000Z",
      "notes": 31
    },
    {
      "t": "2026-03-08T15:00:00.000Z",
      "notes": 31
    },
    {
      "t": "2026-03-08T16:00:00.000Z",
      "notes": 33
    },
    {
      "t": "2026-03-08T17:00:00.000Z",
      "notes": 37
    },
    {
      "t": "2026-03-08T18:00:00.000Z",
      "notes": 42
    },
    {
      "t": "2026-03-08T19:00:00.000Z",
      "notes": 47
    }
  ],
  "encoding": {
    "x": {
      "field": "t",
      "type": "temporal",
      "title": "Hour"
    },
    "y": {
      "field": "notes",
      "title": "Notes"
    }
  },
  "mark": {
    "curve": "monotone",
    "points": "always"
  },
  "axes": {
    "x": {
      "title": "Hour",
      "bands": [
        {
          "from": "2026-03-08T06:00:00Z",
          "to": "2026-03-08T07:00:00Z",
          "label": "Spring forward"
        }
      ]
    },
    "y": {
      "title": "Notes"
    }
  },
  "tooltip": {
    "mode": "index",
    "position": "top"
  },
  "size": {
    "width": 1040,
    "height": 400
  },
  "a11y": {
    "alt": "Harbour notes through the New York spring-forward. The axis skips 02:00 and shades the missing hour."
  }
}
```

## The same notes, by harbour

Aggregate sums every hour, then the bars sort from the busiest harbour.

```json
{
  "version": "1",
  "id": "spring-harbours",
  "type": "bar",
  "title": "Notes by harbour",
  "subtitle": "Summed from the same night.",
  "theme": "soft",
  "data": [
    {
      "t": "2026-03-08T00:00:00.000Z",
      "harbour": "Brine",
      "notes": 18
    },
    {
      "t": "2026-03-08T00:00:00.000Z",
      "harbour": "Lantern",
      "notes": 14
    },
    {
      "t": "2026-03-08T00:00:00.000Z",
      "harbour": "Moth",
      "notes": 9
    },
    {
      "t": "2026-03-08T00:00:00.000Z",
      "harbour": "Skiff",
      "notes": 6
    },
    {
      "t": "2026-03-08T01:00:00.000Z",
      "harbour": "Brine",
      "notes": 20
    },
    {
      "t": "2026-03-08T01:00:00.000Z",
      "harbour": "Lantern",
      "notes": 16
    },
    {
      "t": "2026-03-08T01:00:00.000Z",
      "harbour": "Moth",
      "notes": 10
    },
    {
      "t": "2026-03-08T01:00:00.000Z",
      "harbour": "Skiff",
      "notes": 7
    },
    {
      "t": "2026-03-08T02:00:00.000Z",
      "harbour": "Brine",
      "notes": 22
    },
    {
      "t": "2026-03-08T02:00:00.000Z",
      "harbour": "Lantern",
      "notes": 17
    },
    {
      "t": "2026-03-08T02:00:00.000Z",
      "harbour": "Moth",
      "notes": 11
    },
    {
      "t": "2026-03-08T02:00:00.000Z",
      "harbour": "Skiff",
      "notes": 7
    },
    {
      "t": "2026-03-08T03:00:00.000Z",
      "harbour": "Brine",
      "notes": 23
    },
    {
      "t": "2026-03-08T03:00:00.000Z",
      "harbour": "Lantern",
      "notes": 18
    },
    {
      "t": "2026-03-08T03:00:00.000Z",
      "harbour": "Moth",
      "notes": 12
    },
    {
      "t": "2026-03-08T03:00:00.000Z",
      "harbour": "Skiff",
      "notes": 8
    },
    {
      "t": "2026-03-08T04:00:00.000Z",
      "harbour": "Brine",
      "notes": 24
    },
    {
      "t": "2026-03-08T04:00:00.000Z",
      "harbour": "Lantern",
      "notes": 19
    },
    {
      "t": "2026-03-08T04:00:00.000Z",
      "harbour": "Moth",
      "notes": 12
    },
    {
      "t": "2026-03-08T04:00:00.000Z",
      "harbour": "Skiff",
      "notes": 8
    },
    {
      "t": "2026-03-08T05:00:00.000Z",
      "harbour": "Brine",
      "notes": 24
    },
    {
      "t": "2026-03-08T05:00:00.000Z",
      "harbour": "Lantern",
      "notes": 19
    },
    {
      "t": "2026-03-08T05:00:00.000Z",
      "harbour": "Moth",
      "notes": 12
    },
    {
      "t": "2026-03-08T05:00:00.000Z",
      "harbour": "Skiff",
      "notes": 8
    },
    {
      "t": "2026-03-08T06:00:00.000Z",
      "harbour": "Brine",
      "notes": 24
    },
    {
      "t": "2026-03-08T06:00:00.000Z",
      "harbour": "Lantern",
      "notes": 18
    },
    {
      "t": "2026-03-08T06:00:00.000Z",
      "harbour": "Moth",
      "notes": 12
    },
    {
      "t": "2026-03-08T06:00:00.000Z",
      "harbour": "Skiff",
      "notes": 8
    },
    {
      "t": "2026-03-08T07:00:00.000Z",
      "harbour": "Brine",
      "notes": 23
    },
    {
      "t": "2026-03-08T07:00:00.000Z",
      "harbour": "Lantern",
      "notes": 18
    },
    {
      "t": "2026-03-08T07:00:00.000Z",
      "harbour": "Moth",
      "notes": 11
    },
    {
      "t": "2026-03-08T07:00:00.000Z",
      "harbour": "Skiff",
      "notes": 8
    },
    {
      "t": "2026-03-08T08:00:00.000Z",
      "harbour": "Brine",
      "notes": 25
    },
    {
      "t": "2026-03-08T08:00:00.000Z",
      "harbour": "Lantern",
      "notes": 20
    },
    {
      "t": "2026-03-08T08:00:00.000Z",
      "harbour": "Moth",
      "notes": 14
    },
    {
      "t": "2026-03-08T08:00:00.000Z",
      "harbour": "Skiff",
      "notes": 11
    },
    {
      "t": "2026-03-08T09:00:00.000Z",
      "harbour": "Brine",
      "notes": 19
    },
    {
      "t": "2026-03-08T09:00:00.000Z",
      "harbour": "Lantern",
      "notes": 15
    },
    {
      "t": "2026-03-08T09:00:00.000Z",
      "harbour": "Moth",
      "notes": 9
    },
    {
      "t": "2026-03-08T09:00:00.000Z",
      "harbour": "Skiff",
      "notes": 6
    },
    {
      "t": "2026-03-08T10:00:00.000Z",
      "harbour": "Brine",
      "notes": 17
    },
    {
      "t": "2026-03-08T10:00:00.000Z",
      "harbour": "Lantern",
      "notes": 13
    },
    {
      "t": "2026-03-08T10:00:00.000Z",
      "harbour": "Moth",
      "notes": 8
    },
    {
      "t": "2026-03-08T10:00:00.000Z",
      "harbour": "Skiff",
      "notes": 6
    },
    {
      "t": "2026-03-08T11:00:00.000Z",
      "harbour": "Brine",
      "notes": 15
    },
    {
      "t": "2026-03-08T11:00:00.000Z",
      "harbour": "Lantern",
      "notes": 12
    },
    {
      "t": "2026-03-08T11:00:00.000Z",
      "harbour": "Moth",
      "notes": 7
    },
    {
      "t": "2026-03-08T11:00:00.000Z",
      "harbour": "Skiff",
      "notes": 5
    },
    {
      "t": "2026-03-08T12:00:00.000Z",
      "harbour": "Brine",
      "notes": 13
    },
    {
      "t": "2026-03-08T12:00:00.000Z",
      "harbour": "Lantern",
      "notes": 10
    },
    {
      "t": "2026-03-08T12:00:00.000Z",
      "harbour": "Moth",
      "notes": 7
    },
    {
      "t": "2026-03-08T12:00:00.000Z",
      "harbour": "Skiff",
      "notes": 4
    },
    {
      "t": "2026-03-08T13:00:00.000Z",
      "harbour": "Brine",
      "notes": 12
    },
    {
      "t": "2026-03-08T13:00:00.000Z",
      "harbour": "Lantern",
      "notes": 9
    },
    {
      "t": "2026-03-08T13:00:00.000Z",
      "harbour": "Moth",
      "notes": 6
    },
    {
      "t": "2026-03-08T13:00:00.000Z",
      "harbour": "Skiff",
      "notes": 4
    },
    {
      "t": "2026-03-08T14:00:00.000Z",
      "harbour": "Brine",
      "notes": 12
    },
    {
      "t": "2026-03-08T14:00:00.000Z",
      "harbour": "Lantern",
      "notes": 9
    },
    {
      "t": "2026-03-08T14:00:00.000Z",
      "harbour": "Moth",
      "notes": 6
    },
    {
      "t": "2026-03-08T14:00:00.000Z",
      "harbour": "Skiff",
      "notes": 4
    },
    {
      "t": "2026-03-08T15:00:00.000Z",
      "harbour": "Brine",
      "notes": 12
    },
    {
      "t": "2026-03-08T15:00:00.000Z",
      "harbour": "Lantern",
      "notes": 9
    },
    {
      "t": "2026-03-08T15:00:00.000Z",
      "harbour": "Moth",
      "notes": 6
    },
    {
      "t": "2026-03-08T15:00:00.000Z",
      "harbour": "Skiff",
      "notes": 4
    },
    {
      "t": "2026-03-08T16:00:00.000Z",
      "harbour": "Brine",
      "notes": 13
    },
    {
      "t": "2026-03-08T16:00:00.000Z",
      "harbour": "Lantern",
      "notes": 10
    },
    {
      "t": "2026-03-08T16:00:00.000Z",
      "harbour": "Moth",
      "notes": 6
    },
    {
      "t": "2026-03-08T16:00:00.000Z",
      "harbour": "Skiff",
      "notes": 4
    },
    {
      "t": "2026-03-08T17:00:00.000Z",
      "harbour": "Brine",
      "notes": 14
    },
    {
      "t": "2026-03-08T17:00:00.000Z",
      "harbour": "Lantern",
      "notes": 11
    },
    {
      "t": "2026-03-08T17:00:00.000Z",
      "harbour": "Moth",
      "notes": 7
    },
    {
      "t": "2026-03-08T17:00:00.000Z",
      "harbour": "Skiff",
      "notes": 5
    },
    {
      "t": "2026-03-08T18:00:00.000Z",
      "harbour": "Brine",
      "notes": 16
    },
    {
      "t": "2026-03-08T18:00:00.000Z",
      "harbour": "Lantern",
      "notes": 13
    },
    {
      "t": "2026-03-08T18:00:00.000Z",
      "harbour": "Moth",
      "notes": 8
    },
    {
      "t": "2026-03-08T18:00:00.000Z",
      "harbour": "Skiff",
      "notes": 5
    },
    {
      "t": "2026-03-08T19:00:00.000Z",
      "harbour": "Brine",
      "notes": 18
    },
    {
      "t": "2026-03-08T19:00:00.000Z",
      "harbour": "Lantern",
      "notes": 14
    },
    {
      "t": "2026-03-08T19:00:00.000Z",
      "harbour": "Moth",
      "notes": 9
    },
    {
      "t": "2026-03-08T19:00:00.000Z",
      "harbour": "Skiff",
      "notes": 6
    }
  ],
  "transform": [
    {
      "type": "aggregate",
      "group": "harbour",
      "field": "notes",
      "op": "sum",
      "as": "notes"
    }
  ],
  "sort": {
    "by": "value",
    "order": "descending"
  },
  "encoding": {
    "x": {
      "field": "harbour",
      "title": "Harbour"
    },
    "y": {
      "field": "notes",
      "title": "Notes"
    },
    "color": "harbour"
  },
  "mark": {
    "labels": true,
    "labelPosition": "top"
  },
  "axes": {
    "x": {
      "title": "Harbour"
    },
    "y": {
      "title": "Notes"
    }
  },
  "legend": {
    "position": "bottom"
  },
  "size": {
    "width": 1040,
    "height": 380
  },
  "a11y": {
    "alt": "Brine sends the most notes over the night, then Lantern, Moth, and Skiff."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Alternating bands / plot bands](https://chartkit.dev/features/axis.bands) (`axis.bands`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Sorting categories](https://chartkit.dev/features/data.sort) (`data.sort`)
- [Time zone handling](https://chartkit.dev/features/data.timezone) (`data.timezone`)
- [Built-in data transforms](https://chartkit.dev/features/data.transform) (`data.transform`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Data label position](https://chartkit.dev/features/label.position) (`label.position`)
- [Data labels on marks](https://chartkit.dev/features/label.show) (`label.show`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Per-point / per-category colour](https://chartkit.dev/features/mark.color.point) (`mark.color.point`)
- [Show markers always / on hover / never](https://chartkit.dev/features/mark.point.visibility) (`mark.point.visibility`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Column / vertical bar](https://chartkit.dev/features/type.bar.vertical) (`type.bar.vertical`)
- [Line chart](https://chartkit.dev/features/type.line) (`type.line`)
- [Smoothed / spline line](https://chartkit.dev/features/type.line.smooth) (`type.line.smooth`)

https://chartkit.dev/showcase/spring-notes
