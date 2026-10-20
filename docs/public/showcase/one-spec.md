# One spec, every stack

Tide heights at the fictional harbour of Greywick. The same JSON renders in React, Vue, Svelte, vanilla, a CDN script, a Markdown fence, and Node. This page is the Next.js server render.

## Greywick harbour

One spec. The SVG in this page is the Next.js server render. Hover for the tooltip, click a point to mark it, or click a legend name to hide that line.

```json
{
  "version": "1",
  "id": "greywick-tide",
  "type": "line",
  "title": "Greywick tide",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "bell": "03:10",
      "sounded": 74,
      "posted": 81
    },
    {
      "bell": "06:40",
      "sounded": 142,
      "posted": 136
    },
    {
      "bell": "10:20",
      "sounded": 188,
      "posted": 176
    },
    {
      "bell": "13:50",
      "sounded": 121,
      "posted": 133
    },
    {
      "bell": "17:30",
      "sounded": 58,
      "posted": 64
    },
    {
      "bell": "21:10",
      "sounded": 96,
      "posted": 88
    }
  ],
  "encoding": {
    "x": {
      "field": "bell",
      "title": "Bell"
    },
    "y": [
      {
        "field": "sounded",
        "title": "Sounded"
      },
      {
        "field": "posted",
        "title": "Posted"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Harbour bell"
    },
    "y": {
      "title": "Centimetres",
      "format": {
        "style": "number",
        "suffix": " cm"
      }
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "crosshair": true,
    "crosshairLabel": true,
    "fields": [
      {
        "field": "sounded",
        "title": "Sounded",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      },
      {
        "field": "posted",
        "title": "Posted",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "annotations": [
    {
      "type": "rule",
      "axis": "y",
      "value": 160,
      "dash": "dashed",
      "label": "Dock lip",
      "labelPosition": "end"
    },
    {
      "type": "band",
      "axis": "y",
      "from": 40,
      "to": 90,
      "label": "Keel window",
      "opacity": 0.18
    }
  ],
  "size": {
    "width": 960,
    "height": 440,
    "padding": {
      "left": 96
    }
  },
  "a11y": {
    "alt": "Sounded tide at Greywick peaks at the 10:20 bell, above the dock lip, and the posted tide stays close to it."
  }
}
```

## Stacks

### Next.js

```
import { render } from "@chartkitdev/core/all";

const spec = {
  "version": "1",
  "id": "greywick-tide",
  "type": "line",
  "title": "Greywick tide",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "bell": "03:10",
      "sounded": 74,
      "posted": 81
    },
    {
      "bell": "06:40",
      "sounded": 142,
      "posted": 136
    },
    {
      "bell": "10:20",
      "sounded": 188,
      "posted": 176
    },
    {
      "bell": "13:50",
      "sounded": 121,
      "posted": 133
    },
    {
      "bell": "17:30",
      "sounded": 58,
      "posted": 64
    },
    {
      "bell": "21:10",
      "sounded": 96,
      "posted": 88
    }
  ],
  "encoding": {
    "x": {
      "field": "bell",
      "title": "Bell"
    },
    "y": [
      {
        "field": "sounded",
        "title": "Sounded"
      },
      {
        "field": "posted",
        "title": "Posted"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Harbour bell"
    },
    "y": {
      "title": "Centimetres",
      "format": {
        "style": "number",
        "suffix": " cm"
      }
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "crosshair": true,
    "crosshairLabel": true,
    "fields": [
      {
        "field": "sounded",
        "title": "Sounded",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      },
      {
        "field": "posted",
        "title": "Posted",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "annotations": [
    {
      "type": "rule",
      "axis": "y",
      "value": 160,
      "dash": "dashed",
      "label": "Dock lip",
      "labelPosition": "end"
    },
    {
      "type": "band",
      "axis": "y",
      "from": 40,
      "to": 90,
      "label": "Keel window",
      "opacity": 0.18
    }
  ],
  "size": {
    "width": 960,
    "height": 440,
    "padding": {
      "left": 96
    }
  },
  "a11y": {
    "alt": "Sounded tide at Greywick peaks at the 10:20 bell, above the dock lip, and the posted tide stays close to it."
  }
};

export default function Page() {
  const svg = render(spec);
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
```

### React

```
import { Chart } from "@chartkitdev/react";

const spec = {
  "version": "1",
  "id": "greywick-tide",
  "type": "line",
  "title": "Greywick tide",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "bell": "03:10",
      "sounded": 74,
      "posted": 81
    },
    {
      "bell": "06:40",
      "sounded": 142,
      "posted": 136
    },
    {
      "bell": "10:20",
      "sounded": 188,
      "posted": 176
    },
    {
      "bell": "13:50",
      "sounded": 121,
      "posted": 133
    },
    {
      "bell": "17:30",
      "sounded": 58,
      "posted": 64
    },
    {
      "bell": "21:10",
      "sounded": 96,
      "posted": 88
    }
  ],
  "encoding": {
    "x": {
      "field": "bell",
      "title": "Bell"
    },
    "y": [
      {
        "field": "sounded",
        "title": "Sounded"
      },
      {
        "field": "posted",
        "title": "Posted"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Harbour bell"
    },
    "y": {
      "title": "Centimetres",
      "format": {
        "style": "number",
        "suffix": " cm"
      }
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "crosshair": true,
    "crosshairLabel": true,
    "fields": [
      {
        "field": "sounded",
        "title": "Sounded",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      },
      {
        "field": "posted",
        "title": "Posted",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "annotations": [
    {
      "type": "rule",
      "axis": "y",
      "value": 160,
      "dash": "dashed",
      "label": "Dock lip",
      "labelPosition": "end"
    },
    {
      "type": "band",
      "axis": "y",
      "from": 40,
      "to": 90,
      "label": "Keel window",
      "opacity": 0.18
    }
  ],
  "size": {
    "width": 960,
    "height": 440,
    "padding": {
      "left": 96
    }
  },
  "a11y": {
    "alt": "Sounded tide at Greywick peaks at the 10:20 bell, above the dock lip, and the posted tide stays close to it."
  }
};

export function Panel() {
  return <Chart spec={spec} />;
}
```

### Vue

```
<script setup>
import { Chart } from "@chartkitdev/vue";

const spec = {
  "version": "1",
  "id": "greywick-tide",
  "type": "line",
  "title": "Greywick tide",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "bell": "03:10",
      "sounded": 74,
      "posted": 81
    },
    {
      "bell": "06:40",
      "sounded": 142,
      "posted": 136
    },
    {
      "bell": "10:20",
      "sounded": 188,
      "posted": 176
    },
    {
      "bell": "13:50",
      "sounded": 121,
      "posted": 133
    },
    {
      "bell": "17:30",
      "sounded": 58,
      "posted": 64
    },
    {
      "bell": "21:10",
      "sounded": 96,
      "posted": 88
    }
  ],
  "encoding": {
    "x": {
      "field": "bell",
      "title": "Bell"
    },
    "y": [
      {
        "field": "sounded",
        "title": "Sounded"
      },
      {
        "field": "posted",
        "title": "Posted"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Harbour bell"
    },
    "y": {
      "title": "Centimetres",
      "format": {
        "style": "number",
        "suffix": " cm"
      }
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "crosshair": true,
    "crosshairLabel": true,
    "fields": [
      {
        "field": "sounded",
        "title": "Sounded",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      },
      {
        "field": "posted",
        "title": "Posted",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "annotations": [
    {
      "type": "rule",
      "axis": "y",
      "value": 160,
      "dash": "dashed",
      "label": "Dock lip",
      "labelPosition": "end"
    },
    {
      "type": "band",
      "axis": "y",
      "from": 40,
      "to": 90,
      "label": "Keel window",
      "opacity": 0.18
    }
  ],
  "size": {
    "width": 960,
    "height": 440,
    "padding": {
      "left": 96
    }
  },
  "a11y": {
    "alt": "Sounded tide at Greywick peaks at the 10:20 bell, above the dock lip, and the posted tide stays close to it."
  }
};
</script>

<template>
  <Chart :spec="spec" />
</template>
```

### Svelte

```
<script>
  import { Chart } from "@chartkitdev/svelte";

  const spec = {
  "version": "1",
  "id": "greywick-tide",
  "type": "line",
  "title": "Greywick tide",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "bell": "03:10",
      "sounded": 74,
      "posted": 81
    },
    {
      "bell": "06:40",
      "sounded": 142,
      "posted": 136
    },
    {
      "bell": "10:20",
      "sounded": 188,
      "posted": 176
    },
    {
      "bell": "13:50",
      "sounded": 121,
      "posted": 133
    },
    {
      "bell": "17:30",
      "sounded": 58,
      "posted": 64
    },
    {
      "bell": "21:10",
      "sounded": 96,
      "posted": 88
    }
  ],
  "encoding": {
    "x": {
      "field": "bell",
      "title": "Bell"
    },
    "y": [
      {
        "field": "sounded",
        "title": "Sounded"
      },
      {
        "field": "posted",
        "title": "Posted"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Harbour bell"
    },
    "y": {
      "title": "Centimetres",
      "format": {
        "style": "number",
        "suffix": " cm"
      }
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "crosshair": true,
    "crosshairLabel": true,
    "fields": [
      {
        "field": "sounded",
        "title": "Sounded",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      },
      {
        "field": "posted",
        "title": "Posted",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "annotations": [
    {
      "type": "rule",
      "axis": "y",
      "value": 160,
      "dash": "dashed",
      "label": "Dock lip",
      "labelPosition": "end"
    },
    {
      "type": "band",
      "axis": "y",
      "from": 40,
      "to": 90,
      "label": "Keel window",
      "opacity": 0.18
    }
  ],
  "size": {
    "width": 960,
    "height": 440,
    "padding": {
      "left": 96
    }
  },
  "a11y": {
    "alt": "Sounded tide at Greywick peaks at the 10:20 bell, above the dock lip, and the posted tide stays close to it."
  }
};
</script>

<Chart {spec} />
```

### Vanilla ESM

```
import { mount } from "@chartkitdev/vanilla";

const spec = {
  "version": "1",
  "id": "greywick-tide",
  "type": "line",
  "title": "Greywick tide",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "bell": "03:10",
      "sounded": 74,
      "posted": 81
    },
    {
      "bell": "06:40",
      "sounded": 142,
      "posted": 136
    },
    {
      "bell": "10:20",
      "sounded": 188,
      "posted": 176
    },
    {
      "bell": "13:50",
      "sounded": 121,
      "posted": 133
    },
    {
      "bell": "17:30",
      "sounded": 58,
      "posted": 64
    },
    {
      "bell": "21:10",
      "sounded": 96,
      "posted": 88
    }
  ],
  "encoding": {
    "x": {
      "field": "bell",
      "title": "Bell"
    },
    "y": [
      {
        "field": "sounded",
        "title": "Sounded"
      },
      {
        "field": "posted",
        "title": "Posted"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Harbour bell"
    },
    "y": {
      "title": "Centimetres",
      "format": {
        "style": "number",
        "suffix": " cm"
      }
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "crosshair": true,
    "crosshairLabel": true,
    "fields": [
      {
        "field": "sounded",
        "title": "Sounded",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      },
      {
        "field": "posted",
        "title": "Posted",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "annotations": [
    {
      "type": "rule",
      "axis": "y",
      "value": 160,
      "dash": "dashed",
      "label": "Dock lip",
      "labelPosition": "end"
    },
    {
      "type": "band",
      "axis": "y",
      "from": 40,
      "to": 90,
      "label": "Keel window",
      "opacity": 0.18
    }
  ],
  "size": {
    "width": 960,
    "height": 440,
    "padding": {
      "left": 96
    }
  },
  "a11y": {
    "alt": "Sounded tide at Greywick peaks at the 10:20 bell, above the dock lip, and the posted tide stays close to it."
  }
};

const chart = mount(document.querySelector("#chart"), spec);
chart.update(spec);
chart.destroy();
```

### CDN

```
<script src="chartkit.global.js"></script>
<pre class="chartkit"><code>{
  "version": "1",
  "id": "greywick-tide",
  "type": "line",
  "title": "Greywick tide",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "bell": "03:10",
      "sounded": 74,
      "posted": 81
    },
    {
      "bell": "06:40",
      "sounded": 142,
      "posted": 136
    },
    {
      "bell": "10:20",
      "sounded": 188,
      "posted": 176
    },
    {
      "bell": "13:50",
      "sounded": 121,
      "posted": 133
    },
    {
      "bell": "17:30",
      "sounded": 58,
      "posted": 64
    },
    {
      "bell": "21:10",
      "sounded": 96,
      "posted": 88
    }
  ],
  "encoding": {
    "x": {
      "field": "bell",
      "title": "Bell"
    },
    "y": [
      {
        "field": "sounded",
        "title": "Sounded"
      },
      {
        "field": "posted",
        "title": "Posted"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Harbour bell"
    },
    "y": {
      "title": "Centimetres",
      "format": {
        "style": "number",
        "suffix": " cm"
      }
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "crosshair": true,
    "crosshairLabel": true,
    "fields": [
      {
        "field": "sounded",
        "title": "Sounded",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      },
      {
        "field": "posted",
        "title": "Posted",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "annotations": [
    {
      "type": "rule",
      "axis": "y",
      "value": 160,
      "dash": "dashed",
      "label": "Dock lip",
      "labelPosition": "end"
    },
    {
      "type": "band",
      "axis": "y",
      "from": 40,
      "to": 90,
      "label": "Keel window",
      "opacity": 0.18
    }
  ],
  "size": {
    "width": 960,
    "height": 440,
    "padding": {
      "left": 96
    }
  },
  "a11y": {
    "alt": "Sounded tide at Greywick peaks at the 10:20 bell, above the dock lip, and the posted tide stays close to it."
  }
}</code></pre>
```

### Markdown

```
```chartkit
{
  "version": "1",
  "id": "greywick-tide",
  "type": "line",
  "title": "Greywick tide",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "bell": "03:10",
      "sounded": 74,
      "posted": 81
    },
    {
      "bell": "06:40",
      "sounded": 142,
      "posted": 136
    },
    {
      "bell": "10:20",
      "sounded": 188,
      "posted": 176
    },
    {
      "bell": "13:50",
      "sounded": 121,
      "posted": 133
    },
    {
      "bell": "17:30",
      "sounded": 58,
      "posted": 64
    },
    {
      "bell": "21:10",
      "sounded": 96,
      "posted": 88
    }
  ],
  "encoding": {
    "x": {
      "field": "bell",
      "title": "Bell"
    },
    "y": [
      {
        "field": "sounded",
        "title": "Sounded"
      },
      {
        "field": "posted",
        "title": "Posted"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Harbour bell"
    },
    "y": {
      "title": "Centimetres",
      "format": {
        "style": "number",
        "suffix": " cm"
      }
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "crosshair": true,
    "crosshairLabel": true,
    "fields": [
      {
        "field": "sounded",
        "title": "Sounded",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      },
      {
        "field": "posted",
        "title": "Posted",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "annotations": [
    {
      "type": "rule",
      "axis": "y",
      "value": 160,
      "dash": "dashed",
      "label": "Dock lip",
      "labelPosition": "end"
    },
    {
      "type": "band",
      "axis": "y",
      "from": 40,
      "to": 90,
      "label": "Keel window",
      "opacity": 0.18
    }
  ],
  "size": {
    "width": 960,
    "height": 440,
    "padding": {
      "left": 96
    }
  },
  "a11y": {
    "alt": "Sounded tide at Greywick peaks at the 10:20 bell, above the dock lip, and the posted tide stays close to it."
  }
}
```
```

### renderToString

```
import { renderToString } from "@chartkitdev/vanilla";

const spec = {
  "version": "1",
  "id": "greywick-tide",
  "type": "line",
  "title": "Greywick tide",
  "theme": "soft",
  "locale": "en-GB",
  "data": [
    {
      "bell": "03:10",
      "sounded": 74,
      "posted": 81
    },
    {
      "bell": "06:40",
      "sounded": 142,
      "posted": 136
    },
    {
      "bell": "10:20",
      "sounded": 188,
      "posted": 176
    },
    {
      "bell": "13:50",
      "sounded": 121,
      "posted": 133
    },
    {
      "bell": "17:30",
      "sounded": 58,
      "posted": 64
    },
    {
      "bell": "21:10",
      "sounded": 96,
      "posted": 88
    }
  ],
  "encoding": {
    "x": {
      "field": "bell",
      "title": "Bell"
    },
    "y": [
      {
        "field": "sounded",
        "title": "Sounded"
      },
      {
        "field": "posted",
        "title": "Posted"
      }
    ]
  },
  "axes": {
    "x": {
      "title": "Harbour bell"
    },
    "y": {
      "title": "Centimetres",
      "format": {
        "style": "number",
        "suffix": " cm"
      }
    }
  },
  "legend": {
    "position": "bottom",
    "interactive": true
  },
  "tooltip": {
    "mode": "index",
    "position": "top",
    "crosshair": true,
    "crosshairLabel": true,
    "fields": [
      {
        "field": "sounded",
        "title": "Sounded",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      },
      {
        "field": "posted",
        "title": "Posted",
        "format": {
          "style": "number",
          "suffix": " cm"
        }
      }
    ]
  },
  "interaction": {
    "select": "point"
  },
  "annotations": [
    {
      "type": "rule",
      "axis": "y",
      "value": 160,
      "dash": "dashed",
      "label": "Dock lip",
      "labelPosition": "end"
    },
    {
      "type": "band",
      "axis": "y",
      "from": 40,
      "to": 90,
      "label": "Keel window",
      "opacity": 0.18
    }
  ],
  "size": {
    "width": 960,
    "height": 440,
    "padding": {
      "left": 96
    }
  },
  "a11y": {
    "alt": "Sounded tide at Greywick peaks at the 10:20 bell, above the dock lip, and the posted tide stays close to it."
  }
};

const svg = renderToString(spec);
```

## Options used

- [Accessible name / alt text](https://chartkit.dev/features/a11y.alt) (`a11y.alt`)
- [Shaded band / region](https://chartkit.dev/features/annotation.band) (`annotation.band`)
- [Annotation label placement](https://chartkit.dev/features/annotation.label.position) (`annotation.label.position`)
- [Horizontal reference line](https://chartkit.dev/features/annotation.line.y) (`annotation.line.y`)
- [Annotation styling (dash, colour, opacity)](https://chartkit.dev/features/annotation.style) (`annotation.style`)
- [Axis title](https://chartkit.dev/features/axis.title) (`axis.title`)
- [Locale-aware formatting (i18n)](https://chartkit.dev/features/format.locale) (`format.locale`)
- [Number formatting options](https://chartkit.dev/features/format.number) (`format.number`)
- [React](https://chartkit.dev/features/framework.react) (`framework.react`)
- [Svelte](https://chartkit.dev/features/framework.svelte) (`framework.svelte`)
- [Vanilla JS / framework-agnostic core](https://chartkit.dev/features/framework.vanilla) (`framework.vanilla`)
- [Vue](https://chartkit.dev/features/framework.vue) (`framework.vue`)
- [Click events on marks](https://chartkit.dev/features/interaction.click) (`interaction.click`)
- [Selection (point / multi / series)](https://chartkit.dev/features/interaction.select) (`interaction.select`)
- [Margins / padding](https://chartkit.dev/features/layout.margin) (`layout.margin`)
- [Click to toggle series](https://chartkit.dev/features/legend.interactive) (`legend.interactive`)
- [Legend position](https://chartkit.dev/features/legend.position) (`legend.position`)
- [Built-in themes](https://chartkit.dev/features/theme.presets) (`theme.presets`)
- [Crosshair / guide line](https://chartkit.dev/features/tooltip.crosshair) (`tooltip.crosshair`)
- [Custom tooltip fields](https://chartkit.dev/features/tooltip.fields) (`tooltip.fields`)
- [Tooltip positioning / follow cursor](https://chartkit.dev/features/tooltip.position) (`tooltip.position`)
- [Shared (index) vs single (nearest) tooltip](https://chartkit.dev/features/tooltip.shared) (`tooltip.shared`)
- [Line chart](https://chartkit.dev/features/type.line) (`type.line`)
- [Text-syntax charts (Mermaid-style)](https://chartkit.dev/features/type.xychart.text) (`type.xychart.text`)

https://chartkit.dev/showcase/one-spec
