# Saltwharf, in the page

A fictional stall, drawn from the same spec a plain HTML page puts inside <chart-kit>. The element reads the child JSON script, and its tooltip slot names the week as jars out and lids back. The package is @chartkitdev/element.

## Jars and lids

The chart above is that spec. Hover names the week as jars out and lids back. The block below is the element a static page would ship, with the same tooltip slot.

```json
{
  "version": "1",
  "id": "saltwharf-jars",
  "type": "combo",
  "title": "Jars this month",
  "subtitle": "Bars are jars out. The line is lids that came back.",
  "theme": "soft",
  "data": [
    {
      "week": "W1",
      "jars": 28,
      "lids": 4
    },
    {
      "week": "W2",
      "jars": 34,
      "lids": 6
    },
    {
      "week": "W3",
      "jars": 31,
      "lids": 5
    },
    {
      "week": "W4",
      "jars": 40,
      "lids": 7
    },
    {
      "week": "W5",
      "jars": 46,
      "lids": 8
    },
    {
      "week": "W6",
      "jars": 44,
      "lids": 6
    },
    {
      "week": "W7",
      "jars": 52,
      "lids": 9
    },
    {
      "week": "W8",
      "jars": 49,
      "lids": 8
    },
    {
      "week": "W9",
      "jars": 58,
      "lids": 10
    },
    {
      "week": "W10",
      "jars": 63,
      "lids": 11
    }
  ],
  "encoding": {
    "x": {
      "field": "week",
      "title": "Week"
    },
    "y": [
      {
        "field": "jars",
        "mark": "bar",
        "title": "Jars"
      },
      {
        "field": "lids",
        "mark": "line",
        "title": "Lids"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Week",
      "ticks": 10
    },
    "y": {
      "title": "Count"
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top"
  },
  "size": {
    "width": 1040,
    "height": 420
  },
  "a11y": {
    "alt": "Jars out at Saltwharf climb from 28 in week one to 63 in week ten. Lids that came back stay between 4 and 11."
  }
}
```

## Stacks

### HTML

```
<chart-kit id="saltwharf" theme="soft">
  <script type="application/json">
{
  "version": "1",
  "id": "saltwharf-jars",
  "type": "combo",
  "title": "Jars this month",
  "subtitle": "Bars are jars out. The line is lids that came back.",
  "theme": "soft",
  "data": [
    {
      "week": "W1",
      "jars": 28,
      "lids": 4
    },
    {
      "week": "W2",
      "jars": 34,
      "lids": 6
    },
    {
      "week": "W3",
      "jars": 31,
      "lids": 5
    },
    {
      "week": "W4",
      "jars": 40,
      "lids": 7
    },
    {
      "week": "W5",
      "jars": 46,
      "lids": 8
    },
    {
      "week": "W6",
      "jars": 44,
      "lids": 6
    },
    {
      "week": "W7",
      "jars": 52,
      "lids": 9
    },
    {
      "week": "W8",
      "jars": 49,
      "lids": 8
    },
    {
      "week": "W9",
      "jars": 58,
      "lids": 10
    },
    {
      "week": "W10",
      "jars": 63,
      "lids": 11
    }
  ],
  "encoding": {
    "x": {
      "field": "week",
      "title": "Week"
    },
    "y": [
      {
        "field": "jars",
        "mark": "bar",
        "title": "Jars"
      },
      {
        "field": "lids",
        "mark": "line",
        "title": "Lids"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Week",
      "ticks": 10
    },
    "y": {
      "title": "Count"
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top"
  },
  "size": {
    "width": 1040,
    "height": 420
  },
  "a11y": {
    "alt": "Jars out at Saltwharf climb from 28 in week one to 63 in week ten. Lids that came back stay between 4 and 11."
  }
}
  </script>
</chart-kit>
<script type="module">
  import "@chartkitdev/element";
  const chart = document.querySelector("#saltwharf");
  chart.tooltip = (detail) => {
    const jars = detail.rows.find((row) => row.name === "Jars");
    const lids = detail.rows.find((row) => row.name === "Lids");
    const sent = jars ? jars.text : "0";
    const back = lids ? lids.text : "0";
    return "<strong>" + detail.title + "</strong><div>" + sent + " jars out, " + back + " lids back</div>";
  };
</script>
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Web component](https://chartkit.dev/features/framework.webcomponent) (`framework.webcomponent`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Custom HTML / component tooltip](https://chartkit.dev/features/tooltip.custom) (`tooltip.custom`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Combined bar + line](https://chartkit.dev/features/type.combo) (`type.combo`)

https://chartkit.dev/showcase/saltwharf
