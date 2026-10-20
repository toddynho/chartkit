# Glasshouse spans

Monthly low and high inside a fictional glasshouse at Pell, in degrees Celsius. Each bar floats across the span. A linear season line fits the midpoint, and July is called out at 25 degrees.

## Low and high

Ticks sit on 10, 14, 18, 22, and 26 degrees, so March's 10 and July's 25 stay inside the end gridlines. The season line is the linear fit.

```json
{
  "version": "1",
  "id": "glass-span",
  "type": "bar-range",
  "title": "Pell glasshouse",
  "subtitle": "Low to high, with a linear season line through the midpoint.",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "month": "Mar",
      "low": 10,
      "high": 16
    },
    {
      "month": "Apr",
      "low": 12,
      "high": 18
    },
    {
      "month": "May",
      "low": 14,
      "high": 21
    },
    {
      "month": "Jun",
      "low": 16,
      "high": 23
    },
    {
      "month": "Jul",
      "low": 18,
      "high": 25
    },
    {
      "month": "Aug",
      "low": 17,
      "high": 24
    },
    {
      "month": "Sep",
      "low": 15,
      "high": 22
    },
    {
      "month": "Oct",
      "low": 12,
      "high": 19
    }
  ],
  "encoding": {
    "x": {
      "field": "month",
      "title": "Month"
    },
    "low": "low",
    "high": {
      "field": "high",
      "scale": {
        "domain": [
          8,
          28
        ],
        "nice": false
      }
    }
  },
  "axes": {
    "x": {
      "title": "Month"
    },
    "y": {
      "title": "Degrees",
      "ticks": [
        10,
        14,
        18,
        22,
        26
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
      "label": "Season line"
    },
    {
      "type": "marker",
      "x": "Jul",
      "y": 25,
      "label": "July high",
      "dx": 16,
      "dy": -24
    }
  ],
  "size": {
    "width": 1040,
    "height": 480
  },
  "a11y": {
    "alt": "The Pell glasshouse runs from 10 to 16 degrees in March and from 18 to 25 degrees in July. A linear season line leans upward through the midpoint."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Point marker / callout](https://chartkit.dev/features/annotation.marker) (`annotation.marker`)
- [Trend / average / statistic lines](https://chartkit.dev/features/annotation.trendline) (`annotation.trendline`)
- [Explicit tick values](https://chartkit.dev/features/axis.ticks.values) (`axis.ticks.values`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Number formatting options](https://chartkit.dev/features/format.number) (`format.number`)
- [Explicit domain (min/max)](https://chartkit.dev/features/scale.domain) (`scale.domain`)
- [Nice rounding](https://chartkit.dev/features/scale.nice) (`scale.nice`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Range / floating bar](https://chartkit.dev/features/type.bar.range) (`type.bar.range`)

https://chartkit.dev/showcase/glasshouse
