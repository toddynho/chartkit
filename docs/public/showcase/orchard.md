# Orchard harvest almanac

Three fictional apple varieties. Sun hours against sugar, crate weight coloured by a threshold, then the spread and the bins.

## Sun hours and sugar

Each diamond is one crate. Colour is the variety, and the dot grows with weight. The vertical scale is not nicened.

```json
{
  "version": "1",
  "id": "orchard-sun",
  "type": "scatter",
  "theme": "soft",
  "data": [
    {
      "variety": "Pippin",
      "grams": 168,
      "hours": 4.2,
      "brix": 12.4
    },
    {
      "variety": "Pippin",
      "grams": 174,
      "hours": 5.1,
      "brix": 13.1
    },
    {
      "variety": "Pippin",
      "grams": 181,
      "hours": 6.4,
      "brix": 13.8
    },
    {
      "variety": "Pippin",
      "grams": 159,
      "hours": 3.6,
      "brix": 11.6
    },
    {
      "variety": "Pippin",
      "grams": 188,
      "hours": 7.2,
      "brix": 14.2
    },
    {
      "variety": "Russet",
      "grams": 142,
      "hours": 3.1,
      "brix": 14.8
    },
    {
      "variety": "Russet",
      "grams": 151,
      "hours": 4.4,
      "brix": 15.4
    },
    {
      "variety": "Russet",
      "grams": 136,
      "hours": 2.8,
      "brix": 14.1
    },
    {
      "variety": "Russet",
      "grams": 158,
      "hours": 5.5,
      "brix": 16.2
    },
    {
      "variety": "Russet",
      "grams": 147,
      "hours": 4,
      "brix": 15
    },
    {
      "variety": "Ashmead",
      "grams": 192,
      "hours": 6.8,
      "brix": 13.2
    },
    {
      "variety": "Ashmead",
      "grams": 205,
      "hours": 8.1,
      "brix": 14.6
    },
    {
      "variety": "Ashmead",
      "grams": 184,
      "hours": 5.9,
      "brix": 12.8
    },
    {
      "variety": "Ashmead",
      "grams": 210,
      "hours": 8.6,
      "brix": 15.1
    },
    {
      "variety": "Ashmead",
      "grams": 176,
      "hours": 4.8,
      "brix": 12.2
    }
  ],
  "encoding": {
    "x": {
      "field": "hours",
      "title": "Sun hours"
    },
    "y": {
      "field": "brix",
      "title": "Brix",
      "scale": {
        "nice": false
      }
    },
    "size": {
      "field": "grams",
      "range": [
        8,
        28
      ]
    },
    "color": "variety"
  },
  "mark": {
    "pointShape": "diamond",
    "pointSize": 6
  },
  "axes": {
    "x": {
      "title": "Sun hours"
    },
    "y": {
      "title": "Brix",
      "ticks": [
        12,
        13,
        14,
        15,
        16
      ]
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "variety",
        "title": "Variety"
      },
      {
        "field": "brix",
        "title": "Brix"
      },
      {
        "field": "grams",
        "title": "Grams"
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 760,
    "height": 420
  },
  "a11y": {
    "alt": "Russet crates are sweeter at fewer sun hours. Ashmead crates are heavier and sit toward more sun."
  }
}
```

## Crate weight, coloured by a rule

Under 150 grams is the negative token. 180 grams and over is the positive token. The labels are the weights.

```json
{
  "version": "1",
  "id": "orchard-weight-rule",
  "type": "bar",
  "theme": "soft",
  "data": [
    {
      "crate": "P2",
      "grams": 142
    },
    {
      "crate": "R1",
      "grams": 151
    },
    {
      "crate": "A4",
      "grams": 176
    },
    {
      "crate": "P5",
      "grams": 188
    },
    {
      "crate": "A2",
      "grams": 205
    }
  ],
  "encoding": {
    "x": "crate",
    "y": "grams"
  },
  "mark": {
    "labels": true,
    "labelPosition": "top",
    "colorRules": [
      {
        "test": "positive",
        "color": "positive",
        "gte": 180
      },
      {
        "color": "negative",
        "lt": 150
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Crate"
    },
    "y": {
      "title": "Grams",
      "ticks": [
        0,
        100,
        200
      ]
    }
  },
  "tooltip": {
    "position": "top",
    "fields": [
      {
        "field": "grams",
        "title": "Grams"
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "size": {
    "width": 420,
    "height": 420
  },
  "a11y": {
    "alt": "Two crates are under 150 grams and two are at or over 180. The heaviest is 205 grams."
  }
}
```

## Weight by variety

A box for each variety.

```json
{
  "version": "1",
  "id": "orchard-spread",
  "type": "boxplot",
  "theme": "soft",
  "data": [
    {
      "variety": "Pippin",
      "grams": 168
    },
    {
      "variety": "Pippin",
      "grams": 174
    },
    {
      "variety": "Pippin",
      "grams": 181
    },
    {
      "variety": "Pippin",
      "grams": 159
    },
    {
      "variety": "Pippin",
      "grams": 188
    },
    {
      "variety": "Russet",
      "grams": 142
    },
    {
      "variety": "Russet",
      "grams": 151
    },
    {
      "variety": "Russet",
      "grams": 136
    },
    {
      "variety": "Russet",
      "grams": 158
    },
    {
      "variety": "Russet",
      "grams": 147
    },
    {
      "variety": "Ashmead",
      "grams": 192
    },
    {
      "variety": "Ashmead",
      "grams": 205
    },
    {
      "variety": "Ashmead",
      "grams": 184
    },
    {
      "variety": "Ashmead",
      "grams": 210
    },
    {
      "variety": "Ashmead",
      "grams": 176
    }
  ],
  "encoding": {
    "x": "variety",
    "y": "grams"
  },
  "axes": {
    "x": {
      "title": "Variety"
    },
    "y": {
      "title": "Grams"
    }
  },
  "size": {
    "width": 560,
    "height": 340
  },
  "a11y": {
    "alt": "Ashmead weighs more than Russet. Pippin sits between them."
  }
}
```

## How the weights fall

Eight bins across every crate.

```json
{
  "version": "1",
  "id": "orchard-bins",
  "type": "histogram",
  "theme": "soft",
  "data": [
    {
      "grams": 168
    },
    {
      "grams": 174
    },
    {
      "grams": 181
    },
    {
      "grams": 159
    },
    {
      "grams": 188
    },
    {
      "grams": 142
    },
    {
      "grams": 151
    },
    {
      "grams": 136
    },
    {
      "grams": 158
    },
    {
      "grams": 147
    },
    {
      "grams": 192
    },
    {
      "grams": 205
    },
    {
      "grams": 184
    },
    {
      "grams": 210
    },
    {
      "grams": 176
    }
  ],
  "encoding": {
    "x": {
      "field": "grams",
      "title": "Grams"
    }
  },
  "mark": {
    "bins": 8
  },
  "axes": {
    "x": {
      "title": "Grams"
    },
    "y": {
      "title": "Crates"
    }
  },
  "size": {
    "width": 560,
    "height": 340
  },
  "a11y": {
    "alt": "Crate weights run from the mid 130s to just over 200 grams, with more than one bin occupied."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Explicit tick values](https://chartkit.dev/features/axis.ticks.values) (`axis.ticks.values`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Click events on marks](https://chartkit.dev/features/interaction.click) (`interaction.click`)
- [Selection (point / multi / series)](https://chartkit.dev/features/interaction.select) (`interaction.select`)
- [Data label position](https://chartkit.dev/features/label.position) (`label.position`)
- [Data labels on marks](https://chartkit.dev/features/label.show) (`label.show`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Conditional / threshold colouring](https://chartkit.dev/features/mark.color.conditional) (`mark.color.conditional`)
- [Per-point / per-category colour](https://chartkit.dev/features/mark.color.point) (`mark.color.point`)
- [Point marker shapes](https://chartkit.dev/features/mark.point.shape) (`mark.point.shape`)
- [Point marker size](https://chartkit.dev/features/mark.point.size) (`mark.point.size`)
- [Nice rounding](https://chartkit.dev/features/scale.nice) (`scale.nice`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Custom tooltip fields](https://chartkit.dev/features/tooltip.fields) (`tooltip.fields`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Column / vertical bar](https://chartkit.dev/features/type.bar.vertical) (`type.bar.vertical`)
- [Box plot](https://chartkit.dev/features/type.boxplot) (`type.boxplot`)
- [Bubble chart](https://chartkit.dev/features/type.bubble) (`type.bubble`)
- [Histogram](https://chartkit.dev/features/type.histogram) (`type.histogram`)

https://chartkit.dev/showcase/orchard
