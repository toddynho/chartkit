# The repair loop, live

Broken specs about a fictional bakery. validate() names the code and the JSON Pointer. repair() applies the safe patches. A line that asks for labels warns CK3012 and still draws the line.

## pie is not a type

The type pie is rewritten to donut.

Broken:

```json
{
  "version": "1",
  "type": "pie",
  "title": "Crumb mix",
  "theme": "soft",
  "data": [
    {
      "part": "Crumb",
      "grams": 180
    },
    {
      "part": "Crust",
      "grams": 90
    },
    {
      "part": "Filling",
      "grams": 140
    }
  ],
  "encoding": {
    "x": "part",
    "y": "grams"
  },
  "size": {
    "width": 480,
    "height": 320
  },
  "a11y": {
    "alt": "Crumb is the largest part of the mix, then filling, then crust."
  }
}
```

Repaired:

```json
{
  "version": "1",
  "type": "donut",
  "title": "Crumb mix",
  "theme": "soft",
  "data": [
    {
      "part": "Crumb",
      "grams": 180
    },
    {
      "part": "Crust",
      "grams": 90
    },
    {
      "part": "Filling",
      "grams": 140
    }
  ],
  "encoding": {
    "x": "part",
    "y": "grams"
  },
  "size": {
    "width": 480,
    "height": 320
  },
  "a11y": {
    "alt": "Crumb is the largest part of the mix, then filling, then crust."
  },
  "mark": {
    "innerRadius": 0
  }
}
```

## data.values is unwrapped

A Vega-style wrapper becomes a plain array.

Broken:

```json
{
  "version": "1",
  "type": "bar",
  "title": "Sittings",
  "theme": "soft",
  "data": {
    "values": [
      {
        "sitting": "Dawn",
        "loaves": 46
      },
      {
        "sitting": "Mid",
        "loaves": 72
      },
      {
        "sitting": "Dusk",
        "loaves": 38
      }
    ]
  },
  "encoding": {
    "x": "sitting",
    "y": "loaves"
  },
  "size": {
    "width": 560,
    "height": 300
  },
  "a11y": {
    "alt": "Mid sitting bakes the most loaves."
  }
}
```

Repaired:

```json
{
  "version": "1",
  "type": "bar",
  "title": "Sittings",
  "theme": "soft",
  "data": [
    {
      "sitting": "Dawn",
      "loaves": 46
    },
    {
      "sitting": "Mid",
      "loaves": 72
    },
    {
      "sitting": "Dusk",
      "loaves": 38
    }
  ],
  "encoding": {
    "x": "sitting",
    "y": "loaves"
  },
  "size": {
    "width": 560,
    "height": 300
  },
  "a11y": {
    "alt": "Mid sitting bakes the most loaves."
  }
}
```

## A mistyped field

The unknown field is pointed at the column that exists.

Broken:

```json
{
  "version": "1",
  "type": "bar",
  "title": "Sittings",
  "theme": "soft",
  "data": [
    {
      "sitting": "Dawn",
      "loaves": 46
    },
    {
      "sitting": "Mid",
      "loaves": 72
    },
    {
      "sitting": "Dusk",
      "loaves": 38
    }
  ],
  "encoding": {
    "x": "sitting",
    "y": "loafes"
  },
  "size": {
    "width": 560,
    "height": 300
  },
  "a11y": {
    "alt": "Mid sitting bakes the most loaves."
  }
}
```

Repaired:

```json
{
  "version": "1",
  "type": "bar",
  "title": "Sittings",
  "theme": "soft",
  "data": [
    {
      "sitting": "Dawn",
      "loaves": 46
    },
    {
      "sitting": "Mid",
      "loaves": 72
    },
    {
      "sitting": "Dusk",
      "loaves": 38
    }
  ],
  "encoding": {
    "x": "sitting",
    "y": "loaves"
  },
  "size": {
    "width": 560,
    "height": 300
  },
  "a11y": {
    "alt": "Mid sitting bakes the most loaves."
  }
}
```

## Missing alt text

validate() asks for one sentence, and repair() writes it.

Broken:

```json
{
  "version": "1",
  "type": "bar",
  "title": "Sittings",
  "theme": "soft",
  "data": [
    {
      "sitting": "Dawn",
      "loaves": 46
    },
    {
      "sitting": "Mid",
      "loaves": 72
    },
    {
      "sitting": "Dusk",
      "loaves": 38
    }
  ],
  "encoding": {
    "x": "sitting",
    "y": "loaves"
  },
  "size": {
    "width": 560,
    "height": 300
  }
}
```

Repaired:

```json
{
  "version": "1",
  "type": "bar",
  "title": "Sittings",
  "theme": "soft",
  "data": [
    {
      "sitting": "Dawn",
      "loaves": 46
    },
    {
      "sitting": "Mid",
      "loaves": 72
    },
    {
      "sitting": "Dusk",
      "loaves": 38
    }
  ],
  "encoding": {
    "x": "sitting",
    "y": "loaves"
  },
  "size": {
    "width": 560,
    "height": 300
  },
  "a11y": {
    "alt": "Bar chart of loaves — Sittings."
  }
}
```

## Labels on a line are accepted and not drawn

CK3012 warns. The line still renders. The labels are not painted.

Broken:

```json
{
  "version": "1",
  "type": "line",
  "title": "Loaves by sitting",
  "theme": "soft",
  "data": [
    {
      "sitting": "Dawn",
      "loaves": 46
    },
    {
      "sitting": "Mid",
      "loaves": 72
    },
    {
      "sitting": "Dusk",
      "loaves": 38
    }
  ],
  "encoding": {
    "x": "sitting",
    "y": "loaves"
  },
  "mark": {
    "labels": true
  },
  "axes": {
    "y": {
      "title": "Loaves"
    }
  },
  "size": {
    "width": 640,
    "height": 300,
    "padding": {
      "left": 64
    }
  },
  "a11y": {
    "alt": "Loaves peak at the mid sitting. Mark labels are requested and not drawn on a line."
  }
}
```

Repaired:

```json
{
  "version": "1",
  "type": "line",
  "title": "Loaves by sitting",
  "theme": "soft",
  "data": [
    {
      "sitting": "Dawn",
      "loaves": 46
    },
    {
      "sitting": "Mid",
      "loaves": 72
    },
    {
      "sitting": "Dusk",
      "loaves": 38
    }
  ],
  "encoding": {
    "x": "sitting",
    "y": "loaves"
  },
  "mark": {
    "labels": true
  },
  "axes": {
    "y": {
      "title": "Loaves"
    }
  },
  "size": {
    "width": 640,
    "height": 300,
    "padding": {
      "left": 64
    }
  },
  "a11y": {
    "alt": "Loaves peak at the mid sitting. Mark labels are requested and not drawn on a line."
  }
}
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Data labels on marks](https://chartkit.dev/features/label.show) (`label.show`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Column / vertical bar](https://chartkit.dev/features/type.bar.vertical) (`type.bar.vertical`)
- [Donut chart](https://chartkit.dev/features/type.donut) (`type.donut`)
- [Line chart](https://chartkit.dev/features/type.line) (`type.line`)
- [Stable error codes](https://chartkit.dev/features/validate.codes) (`validate.codes`)
- [Automatic repair / fix suggestions](https://chartkit.dev/features/validate.repair) (`validate.repair`)
- [Runtime spec validation API](https://chartkit.dev/features/validate.runtime) (`validate.runtime`)
- [Unknown-option detection](https://chartkit.dev/features/validate.unknown.keys) (`validate.unknown.keys`)

https://chartkit.dev/showcase/repair-loop
