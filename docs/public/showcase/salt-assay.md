# Salt assay

A fictional bench. Six dishes, each a mean with a whisker across three runs. Salt sits clear of the blank. The second figure follows Salt across the week.

## Six dishes

The bar is the mean. The whisker is the low and high of three runs. Salt is the high dish.

```json
{
  "version": "1",
  "id": "salt-dishes",
  "type": "errorbar",
  "title": "Dish means",
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
      "title": "Mean"
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
      "title": "Reading"
    }
  },
  "size": {
    "width": 1040,
    "height": 420
  },
  "a11y": {
    "alt": "Salt averages 18.6, with a whisker from 17.9 to 19.4. The blank averages 12.4. Copper is the lowest dish."
  }
}
```

## Salt across the week

The same dish, one point and whisker each weekday.

```json
{
  "version": "1",
  "id": "salt-week",
  "type": "errorbar",
  "title": "Salt, Monday to Friday",
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
      "title": "Mean"
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
      "title": "Reading"
    }
  },
  "size": {
    "width": 1040,
    "height": 380
  },
  "a11y": {
    "alt": "Salt stays between 17.9 and 19.1 across the week. Thursday is the highest morning."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Point marker size](https://chartkit.dev/features/mark.point.size) (`mark.point.size`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Error bars](https://chartkit.dev/features/type.errorbar) (`type.errorbar`)

https://chartkit.dev/showcase/salt-assay
