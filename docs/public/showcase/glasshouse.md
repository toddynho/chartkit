# Glasshouse spans

Monthly low and high inside a fictional glasshouse at Pell, in degrees Celsius. The floating bars are the span. The line is the midpoint, with a linear season line.

## Low and high

Each bar floats from the month's low to its high. July reaches 25 degrees.

```json
{
  "version": "1",
  "id": "glass-span",
  "type": "bar-range",
  "title": "Pell glasshouse",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "month": "Mar",
      "low": 10,
      "high": 16,
      "mid": 13
    },
    {
      "month": "Apr",
      "low": 12,
      "high": 18,
      "mid": 15
    },
    {
      "month": "May",
      "low": 14,
      "high": 21,
      "mid": 17.5
    },
    {
      "month": "Jun",
      "low": 16,
      "high": 23,
      "mid": 19.5
    },
    {
      "month": "Jul",
      "low": 18,
      "high": 25,
      "mid": 21.5
    },
    {
      "month": "Aug",
      "low": 17,
      "high": 24,
      "mid": 20.5
    },
    {
      "month": "Sep",
      "low": 15,
      "high": 22,
      "mid": 18.5
    },
    {
      "month": "Oct",
      "low": 12,
      "high": 19,
      "mid": 15.5
    }
  ],
  "encoding": {
    "x": {
      "field": "month",
      "title": "Month"
    },
    "low": "low",
    "high": "high"
  },
  "axes": {
    "x": {
      "title": "Month"
    },
    "y": {
      "title": "Degrees",
      "format": {
        "style": "number",
        "suffix": "°C"
      }
    }
  },
  "size": {
    "width": 1040,
    "height": 400
  },
  "a11y": {
    "alt": "The Pell glasshouse runs from 10 to 16 degrees in March and from 18 to 25 degrees in July."
  }
}
```

## Midpoint

The straight line is a linear fit through the monthly midpoint.

```json
{
  "version": "1",
  "id": "glass-drift",
  "type": "line",
  "title": "Midpoint of the span",
  "subtitle": "A linear fit through March to October.",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "month": "Mar",
      "low": 10,
      "high": 16,
      "mid": 13
    },
    {
      "month": "Apr",
      "low": 12,
      "high": 18,
      "mid": 15
    },
    {
      "month": "May",
      "low": 14,
      "high": 21,
      "mid": 17.5
    },
    {
      "month": "Jun",
      "low": 16,
      "high": 23,
      "mid": 19.5
    },
    {
      "month": "Jul",
      "low": 18,
      "high": 25,
      "mid": 21.5
    },
    {
      "month": "Aug",
      "low": 17,
      "high": 24,
      "mid": 20.5
    },
    {
      "month": "Sep",
      "low": 15,
      "high": 22,
      "mid": 18.5
    },
    {
      "month": "Oct",
      "low": 12,
      "high": 19,
      "mid": 15.5
    }
  ],
  "encoding": {
    "x": {
      "field": "month",
      "title": "Month"
    },
    "y": {
      "field": "mid",
      "title": "Midpoint",
      "scale": {
        "domain": [
          10,
          26
        ],
        "nice": false
      }
    }
  },
  "mark": {
    "curve": "monotone",
    "points": "always"
  },
  "axes": {
    "x": {
      "title": "Month"
    },
    "y": {
      "title": "Degrees",
      "ticks": [
        12,
        16,
        20,
        24
      ],
      "format": {
        "style": "number",
        "suffix": "°C"
      }
    }
  },
  "annotations": [
    {
      "type": "trendline",
      "method": "linear",
      "series": "Midpoint",
      "label": "Season line"
    }
  ],
  "size": {
    "width": 1040,
    "height": 380
  },
  "a11y": {
    "alt": "The midpoint of the glasshouse span rises from March into July, then eases by October. A linear season line leans upward."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Trend / average / statistic lines](https://chartkit.dev/features/annotation.trendline) (`annotation.trendline`)
- [Explicit tick values](https://chartkit.dev/features/axis.ticks.values) (`axis.ticks.values`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Number formatting options](https://chartkit.dev/features/format.number) (`format.number`)
- [Show markers always / on hover / never](https://chartkit.dev/features/mark.point.visibility) (`mark.point.visibility`)
- [Nice rounding](https://chartkit.dev/features/scale.nice) (`scale.nice`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Range / floating bar](https://chartkit.dev/features/type.bar.range) (`type.bar.range`)
- [Line chart](https://chartkit.dev/features/type.line) (`type.line`)
- [Smoothed / spline line](https://chartkit.dev/features/type.line.smooth) (`type.line.smooth`)

https://chartkit.dev/showcase/glasshouse
