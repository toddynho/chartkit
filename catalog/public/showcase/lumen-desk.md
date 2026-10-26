# Lumen desk

Saturday night at fictional Lumen Radio. Music runs longer than on a weeknight, talk shrinks, and Quay is the largest share of the evening audience.

## Minutes by desk

Weeknight and Saturday sit side by side. Music is the long arc. Ident stays a sliver.

```json
{
  "version": "1",
  "id": "lumen-desk-minutes",
  "type": "radial-bar",
  "title": "Lumen, minutes by desk",
  "subtitle": "Weeknight against Saturday.",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "desk": "Music",
      "weeknight": 186,
      "saturday": 210
    },
    {
      "desk": "Talk",
      "weeknight": 74,
      "saturday": 48
    },
    {
      "desk": "News",
      "weeknight": 36,
      "saturday": 22
    },
    {
      "desk": "Sky",
      "weeknight": 18,
      "saturday": 16
    },
    {
      "desk": "Spots",
      "weeknight": 28,
      "saturday": 40
    },
    {
      "desk": "Ident",
      "weeknight": 8,
      "saturday": 6
    }
  ],
  "encoding": {
    "x": {
      "field": "desk",
      "title": "Desk"
    },
    "y": [
      {
        "field": "weeknight",
        "title": "Weeknight",
        "format": {
          "suffix": " min"
        }
      },
      {
        "field": "saturday",
        "title": "Saturday",
        "format": {
          "suffix": " min"
        }
      }
    ]
  },
  "mark": {
    "innerRadius": 0.34,
    "padAngle": 2,
    "cornerRadius": 4
  },
  "layout": {
    "coordinate": "polar"
  },
  "legend": {
    "position": "bottom"
  },
  "size": {
    "width": 520,
    "height": 480
  },
  "a11y": {
    "alt": "Saturday music runs longer, and talk shrinks."
  }
}
```

## Saturday audience

Equal angles. The radius is listeners. Quay reaches farthest.

```json
{
  "version": "1",
  "id": "lumen-desk-audience",
  "type": "rose",
  "title": "Saturday audience",
  "subtitle": "Listeners by neighbourhood.",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "place": "Hale",
      "listeners": 4200
    },
    {
      "place": "Mill",
      "listeners": 3100
    },
    {
      "place": "Quay",
      "listeners": 5600
    },
    {
      "place": "Ridge",
      "listeners": 1800
    },
    {
      "place": "Yard",
      "listeners": 2400
    },
    {
      "place": "Orchard",
      "listeners": 3900
    }
  ],
  "encoding": {
    "x": {
      "field": "place",
      "title": "Place"
    },
    "y": {
      "field": "listeners",
      "title": "Listeners",
      "format": {
        "specifier": ",.0f"
      }
    }
  },
  "mark": {
    "padAngle": 1.2,
    "labels": true
  },
  "layout": {
    "coordinate": "polar"
  },
  "size": {
    "width": 520,
    "height": 480
  },
  "a11y": {
    "alt": "Quay is the largest share of the evening audience."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Data labels on marks](https://chartkit.dev/features/label.show) (`label.show`)
- [Coordinate systems (polar, transpose, geo)](https://chartkit.dev/features/layout.polar.coords) (`layout.polar.coords`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Tooltip value formatting](https://chartkit.dev/features/tooltip.format) (`tooltip.format`)
- [Polar area / rose / nightingale](https://chartkit.dev/features/type.polar.area) (`type.polar.area`)
- [Radial bar](https://chartkit.dev/features/type.polar.radialbar) (`type.polar.radialbar`)

https://chartkit.dev/showcase/lumen-desk
