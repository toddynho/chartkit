# Carrick yard, winter hours

Winter work at a fictional boatyard. The sunburst splits hours by shed, boat, and job. The bars are those same hours rolled up to the boat and ranked.

## Shed, boat, job

Skiff, Lantern, and Moth. Cobble takes the longest job list.

```json
{
  "version": "1",
  "id": "carrick-yard-sheds",
  "type": "sunburst",
  "title": "Winter hours",
  "subtitle": "Shed, then boat, then job.",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "name": "Skiff",
      "children": [
        {
          "name": "Cobble",
          "children": [
            {
              "name": "Keel",
              "value": 48
            },
            {
              "name": "Plank",
              "value": 36
            },
            {
              "name": "Paint",
              "value": 18
            }
          ]
        },
        {
          "name": "Punt",
          "children": [
            {
              "name": "Ribs",
              "value": 22
            },
            {
              "name": "Oars",
              "value": 14
            }
          ]
        }
      ]
    },
    {
      "name": "Lantern",
      "children": [
        {
          "name": "Ketch",
          "children": [
            {
              "name": "Deck",
              "value": 40
            },
            {
              "name": "Rig",
              "value": 28
            }
          ]
        },
        {
          "name": "Yawl",
          "children": [
            {
              "name": "Hull",
              "value": 26
            },
            {
              "name": "Sail",
              "value": 16
            }
          ]
        }
      ]
    },
    {
      "name": "Moth",
      "children": [
        {
          "name": "Pram",
          "children": [
            {
              "name": "Seams",
              "value": 20
            },
            {
              "name": "Glue",
              "value": 12
            }
          ]
        }
      ]
    }
  ],
  "encoding": {
    "x": "name",
    "y": {
      "field": "value",
      "title": "Hours",
      "format": {
        "style": "number",
        "suffix": " h"
      }
    }
  },
  "mark": {
    "innerRadius": 0.4
  },
  "legend": {
    "position": "bottom"
  },
  "size": {
    "width": 560,
    "height": 620
  },
  "a11y": {
    "alt": "280 hours of winter work. Cobble in the Skiff shed is the largest boat, then Ketch in the Lantern shed."
  }
}
```

## The same hours, by boat

Cobble is 102 hours. Pram is 32. The ranking is the sunburst, folded to one name per boat.

```json
{
  "version": "1",
  "id": "carrick-yard-boats",
  "type": "bar",
  "title": "Hours by boat",
  "subtitle": "Ranked from the same winter.",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "boat": "Cobble",
      "hours": 102
    },
    {
      "boat": "Ketch",
      "hours": 68
    },
    {
      "boat": "Yawl",
      "hours": 42
    },
    {
      "boat": "Punt",
      "hours": 36
    },
    {
      "boat": "Pram",
      "hours": 32
    }
  ],
  "sort": {
    "by": "value",
    "order": "descending"
  },
  "encoding": {
    "x": {
      "field": "boat",
      "title": "Boat"
    },
    "y": {
      "field": "hours",
      "title": "Hours",
      "format": {
        "style": "number",
        "suffix": " h"
      },
      "scale": {
        "domain": [
          0,
          120
        ],
        "nice": false
      }
    },
    "color": "boat"
  },
  "mark": {
    "orientation": "horizontal",
    "labels": true,
    "labelPosition": "right"
  },
  "axes": {
    "x": {
      "title": "Boat"
    },
    "y": {
      "title": "Hours",
      "ticks": [
        0,
        30,
        60,
        90,
        120
      ]
    }
  },
  "legend": false,
  "size": {
    "width": 560,
    "height": 480
  },
  "a11y": {
    "alt": "Cobble 102 hours, Ketch 68, Yawl 42, Punt 36, and Pram 32."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Explicit tick values](https://chartkit.dev/features/axis.ticks.values) (`axis.ticks.values`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Hierarchical data input](https://chartkit.dev/features/data.hierarchy) (`data.hierarchy`)
- [Sorting categories](https://chartkit.dev/features/data.sort) (`data.sort`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Number formatting options](https://chartkit.dev/features/format.number) (`format.number`)
- [Data label position](https://chartkit.dev/features/label.position) (`label.position`)
- [Data labels on marks](https://chartkit.dev/features/label.show) (`label.show`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Per-point / per-category colour](https://chartkit.dev/features/mark.color.point) (`mark.color.point`)
- [Explicit domain (min/max)](https://chartkit.dev/features/scale.domain) (`scale.domain`)
- [Nice rounding](https://chartkit.dev/features/scale.nice) (`scale.nice`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Horizontal bar](https://chartkit.dev/features/type.bar.horizontal) (`type.bar.horizontal`)
- [Sunburst](https://chartkit.dev/features/type.sunburst) (`type.sunburst`)

https://chartkit.dev/showcase/carrick-yard
