# Pell press cellar

A fictional cider cellar at Pell. The same nested litres — orchard, apple, then cask — drawn as a treemap with the amount on each tile, and as a sunburst with the cellar total in the hole.

## Litres by cask

North, River, and Walled. Oak, under Bramley, is the largest cask at 1,120 litres.

```json
{
  "version": "1",
  "id": "pell-press-tiles",
  "type": "treemap",
  "title": "Pell press",
  "subtitle": "Orchard, apple, then cask.",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "name": "North",
      "children": [
        {
          "name": "Russet",
          "children": [
            {
              "name": "Ash",
              "value": 980
            },
            {
              "name": "Elm",
              "value": 820
            }
          ]
        },
        {
          "name": "Pippin",
          "children": [
            {
              "name": "Beech",
              "value": 760
            },
            {
              "name": "Holly",
              "value": 540
            }
          ]
        }
      ]
    },
    {
      "name": "River",
      "children": [
        {
          "name": "Bramley",
          "children": [
            {
              "name": "Oak",
              "value": 1120
            },
            {
              "name": "Yew",
              "value": 640
            }
          ]
        },
        {
          "name": "Cox",
          "children": [
            {
              "name": "Lime",
              "value": 580
            },
            {
              "name": "Alder",
              "value": 420
            }
          ]
        }
      ]
    },
    {
      "name": "Walled",
      "children": [
        {
          "name": "Quince",
          "children": [
            {
              "name": "Maple",
              "value": 610
            },
            {
              "name": "Birch",
              "value": 390
            }
          ]
        },
        {
          "name": "Medlar",
          "children": [
            {
              "name": "Cedar",
              "value": 340
            },
            {
              "name": "Thorn",
              "value": 260
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
      "title": "Litres",
      "format": {
        "style": "number",
        "suffix": " L"
      }
    }
  },
  "legend": {
    "position": "bottom"
  },
  "size": {
    "width": 560,
    "height": 640
  },
  "a11y": {
    "alt": "The Pell press holds 7,460 litres. North and River are the larger orchards. Oak, a Bramley cask, is the single largest tile at 1,120 litres."
  }
}
```

## The same cellar, in rings

The inner ring is the orchard, then the apple, then the cask. The hole states the total.

```json
{
  "version": "1",
  "id": "pell-press-rings",
  "type": "sunburst",
  "title": "The same cellar",
  "subtitle": "Three rings, one total.",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "name": "North",
      "children": [
        {
          "name": "Russet",
          "children": [
            {
              "name": "Ash",
              "value": 980
            },
            {
              "name": "Elm",
              "value": 820
            }
          ]
        },
        {
          "name": "Pippin",
          "children": [
            {
              "name": "Beech",
              "value": 760
            },
            {
              "name": "Holly",
              "value": 540
            }
          ]
        }
      ]
    },
    {
      "name": "River",
      "children": [
        {
          "name": "Bramley",
          "children": [
            {
              "name": "Oak",
              "value": 1120
            },
            {
              "name": "Yew",
              "value": 640
            }
          ]
        },
        {
          "name": "Cox",
          "children": [
            {
              "name": "Lime",
              "value": 580
            },
            {
              "name": "Alder",
              "value": 420
            }
          ]
        }
      ]
    },
    {
      "name": "Walled",
      "children": [
        {
          "name": "Quince",
          "children": [
            {
              "name": "Maple",
              "value": 610
            },
            {
              "name": "Birch",
              "value": 390
            }
          ]
        },
        {
          "name": "Medlar",
          "children": [
            {
              "name": "Cedar",
              "value": 340
            },
            {
              "name": "Thorn",
              "value": 260
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
      "title": "Litres",
      "format": {
        "style": "number",
        "suffix": " L"
      }
    }
  },
  "mark": {
    "innerRadius": 0.42
  },
  "legend": {
    "position": "bottom"
  },
  "size": {
    "width": 560,
    "height": 640
  },
  "a11y": {
    "alt": "A sunburst of the same 7,460 litres. North, River, and Walled wrap the hole, then each apple, then each cask."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Hierarchical data input](https://chartkit.dev/features/data.hierarchy) (`data.hierarchy`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Number formatting options](https://chartkit.dev/features/format.number) (`format.number`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Sunburst](https://chartkit.dev/features/type.sunburst) (`type.sunburst`)
- [Treemap](https://chartkit.dev/features/type.treemap) (`type.treemap`)

https://chartkit.dev/showcase/pell-press
