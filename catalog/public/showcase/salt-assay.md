# Salt assay

A fictional bench. Six dishes, each a mean with a whisker across three runs. A dashed rule marks the blank, and a callout sits on Salt, clear of that line. The second figure follows Salt across the week.

## Six dishes

The bar is the mean. The whisker is the low and high of three runs. Salt is the high dish.

```json
{
  "version": "1",
  "id": "salt-dishes",
  "type": "errorbar",
  "title": "Dish means",
  "subtitle": "Three runs. Salt sits clear of the blank.",
  "theme": "soft",
  "data": [
    {
      "dish": "Blank",
      "mean": 12.4,
      "lo": 11.6,
      "hi": 13.1
    },
    {
      "dish": "Brine",
      "mean": 13.1,
      "lo": 12.2,
      "hi": 14
    },
    {
      "dish": "Kelp",
      "mean": 14.8,
      "lo": 13.9,
      "hi": 15.6
    },
    {
      "dish": "Salt",
      "mean": 18.6,
      "lo": 17.9,
      "hi": 19.4
    },
    {
      "dish": "Iodine",
      "mean": 15.2,
      "lo": 14.1,
      "hi": 16.4
    },
    {
      "dish": "Copper",
      "mean": 11.8,
      "lo": 10.4,
      "hi": 13.2
    }
  ],
  "encoding": {
    "x": {
      "field": "dish",
      "title": "Dish"
    },
    "y": {
      "field": "mean",
      "title": "Mean",
      "scale": {
        "domain": [
          0,
          24
        ],
        "nice": false
      }
    },
    "low": "lo",
    "high": "hi"
  },
  "mark": {
    "error": "bar"
  },
  "axes": {
    "x": {
      "title": "Dish"
    },
    "y": {
      "title": "Reading",
      "ticks": [
        0,
        6,
        12,
        18,
        24
      ]
    }
  },
  "annotations": [
    {
      "type": "rule",
      "axis": "y",
      "value": 12.4,
      "label": "Blank",
      "dash": "dashed",
      "labelPosition": "end"
    },
    {
      "type": "marker",
      "x": "Salt",
      "y": 19.4,
      "label": "Clear of the blank",
      "dx": 18,
      "dy": -28
    }
  ],
  "size": {
    "width": 1040,
    "height": 480
  },
  "a11y": {
    "alt": "Salt averages 18.6, with a whisker from 17.9 to 19.4. The blank averages 12.4. A callout marks Salt clear of that line. Copper is the lowest dish."
  }
}
```

## Salt across the week

The same dish, one point and whisker each weekday. Thursday carries the highest morning.

```json
{
  "version": "1",
  "id": "salt-week",
  "type": "errorbar",
  "title": "Salt, Monday to Friday",
  "subtitle": "The same dish, one whisker each weekday.",
  "theme": "soft",
  "data": [
    {
      "day": "Mon",
      "mean": 18.2,
      "lo": 17.4,
      "hi": 19
    },
    {
      "day": "Tue",
      "mean": 18.8,
      "lo": 18.1,
      "hi": 19.5
    },
    {
      "day": "Wed",
      "mean": 17.9,
      "lo": 17.2,
      "hi": 18.6
    },
    {
      "day": "Thu",
      "mean": 19.1,
      "lo": 18.4,
      "hi": 19.8
    },
    {
      "day": "Fri",
      "mean": 18.6,
      "lo": 18,
      "hi": 19.2
    }
  ],
  "encoding": {
    "x": {
      "field": "day",
      "title": "Day"
    },
    "y": {
      "field": "mean",
      "title": "Mean",
      "scale": {
        "domain": [
          16,
          21
        ],
        "nice": false
      }
    },
    "low": "lo",
    "high": "hi"
  },
  "mark": {
    "error": "point",
    "pointSize": 5
  },
  "axes": {
    "x": {
      "title": "Day"
    },
    "y": {
      "title": "Reading",
      "ticks": [
        16,
        17,
        18,
        19,
        20,
        21
      ]
    }
  },
  "annotations": [
    {
      "type": "marker",
      "x": "Thu",
      "y": 19.8,
      "label": "Highest morning",
      "dx": -8,
      "dy": -40
    }
  ],
  "size": {
    "width": 1040,
    "height": 440
  },
  "a11y": {
    "alt": "Salt stays between 17.2 and 19.8 across the week. Thursday is the highest morning."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Annotation label placement](https://chartkit.dev/features/annotation.label.position) (`annotation.label.position`)
- [Horizontal reference line](https://chartkit.dev/features/annotation.line.y) (`annotation.line.y`)
- [Point marker / callout](https://chartkit.dev/features/annotation.marker) (`annotation.marker`)
- [Annotation styling (dash, colour, opacity)](https://chartkit.dev/features/annotation.style) (`annotation.style`)
- [Explicit tick values](https://chartkit.dev/features/axis.ticks.values) (`axis.ticks.values`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Point marker size](https://chartkit.dev/features/mark.point.size) (`mark.point.size`)
- [Explicit domain (min/max)](https://chartkit.dev/features/scale.domain) (`scale.domain`)
- [Nice rounding](https://chartkit.dev/features/scale.nice) (`scale.nice`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Error bars](https://chartkit.dev/features/type.errorbar) (`type.errorbar`)

https://chartkit.dev/showcase/salt-assay
