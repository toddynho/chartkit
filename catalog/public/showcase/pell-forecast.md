# Pell Hall forecast

Seats filled at a fictional concert hall. Actuals run through August. From September the line is dashed, inside an 80% band and a wider 95% band, with a full-house shade and a callout on the best month.

## Seats, actual then forecast

The dashed part starts at Today. Full house is the shaded band. August is the best month so far.

```json
{
  "version": "1",
  "id": "pell-seats",
  "type": "area-range",
  "title": "Seats filled at Pell Hall",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "month": "Jan",
      "seats": 640,
      "tightLo": null,
      "tightHi": null,
      "wideLo": null,
      "wideHi": null
    },
    {
      "month": "Feb",
      "seats": 610,
      "tightLo": null,
      "tightHi": null,
      "wideLo": null,
      "wideHi": null
    },
    {
      "month": "Mar",
      "seats": 720,
      "tightLo": null,
      "tightHi": null,
      "wideLo": null,
      "wideHi": null
    },
    {
      "month": "Apr",
      "seats": 810,
      "tightLo": null,
      "tightHi": null,
      "wideLo": null,
      "wideHi": null
    },
    {
      "month": "May",
      "seats": 860,
      "tightLo": null,
      "tightHi": null,
      "wideLo": null,
      "wideHi": null
    },
    {
      "month": "Jun",
      "seats": 940,
      "tightLo": null,
      "tightHi": null,
      "wideLo": null,
      "wideHi": null
    },
    {
      "month": "Jul",
      "seats": 980,
      "tightLo": null,
      "tightHi": null,
      "wideLo": null,
      "wideHi": null
    },
    {
      "month": "Aug",
      "seats": 1120,
      "tightLo": null,
      "tightHi": null,
      "wideLo": null,
      "wideHi": null
    },
    {
      "month": "Sep",
      "seats": 1080,
      "tightLo": 980,
      "tightHi": 1180,
      "wideLo": 900,
      "wideHi": 1280
    },
    {
      "month": "Oct",
      "seats": 1140,
      "tightLo": 1000,
      "tightHi": 1280,
      "wideLo": 900,
      "wideHi": 1400
    },
    {
      "month": "Nov",
      "seats": 1210,
      "tightLo": 1040,
      "tightHi": 1360,
      "wideLo": 920,
      "wideHi": 1500
    },
    {
      "month": "Dec",
      "seats": 1260,
      "tightLo": 1080,
      "tightHi": 1440,
      "wideLo": 960,
      "wideHi": 1580
    }
  ],
  "encoding": {
    "x": {
      "field": "month",
      "title": "Month"
    },
    "y": [
      {
        "lo": "wideLo",
        "hi": "wideHi",
        "title": "95%"
      },
      {
        "lo": "tightLo",
        "hi": "tightHi",
        "title": "80%"
      },
      {
        "field": "seats",
        "title": "Seats"
      }
    ]
  },
  "mark": {
    "strokeDash": true
  },
  "axes": {
    "x": {
      "title": "Month"
    },
    "y": {
      "title": "Seats"
    }
  },
  "annotations": [
    {
      "type": "rule",
      "axis": "x",
      "value": "Sep",
      "label": "Today",
      "labelPosition": "start",
      "dash": "dashed"
    },
    {
      "type": "band",
      "axis": "y",
      "from": 1400,
      "to": 1580,
      "label": "Full house",
      "opacity": 0.14
    },
    {
      "type": "marker",
      "x": "Aug",
      "y": 1120,
      "label": "Best month",
      "dx": -108,
      "dy": -28
    }
  ],
  "size": {
    "width": 1040,
    "height": 480
  },
  "a11y": {
    "alt": "Seats filled at Pell Hall rise from 640 in January to 1,120 in August, then a dashed forecast climbs toward the full-house band, inside an 80% band and a wider 95% band."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Shaded band / region](https://chartkit.dev/features/annotation.band) (`annotation.band`)
- [Annotation label placement](https://chartkit.dev/features/annotation.label.position) (`annotation.label.position`)
- [Vertical reference line](https://chartkit.dev/features/annotation.line.x) (`annotation.line.x`)
- [Point marker / callout](https://chartkit.dev/features/annotation.marker) (`annotation.marker`)
- [Annotation styling (dash, colour, opacity)](https://chartkit.dev/features/annotation.style) (`annotation.style`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Range / band area](https://chartkit.dev/features/type.area.range) (`type.area.range`)

https://chartkit.dev/showcase/pell-forecast
