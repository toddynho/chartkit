# @chartkitdev/geo

Choropleth and point maps. This package is separate from `@chartkitdev/core`. It is not in the line bundle or in `@chartkitdev/core/all`. World, US, Canada, and EU atlases each load on demand. There is no tile layer, no pan or zoom, no US counties, and no NUTS-2.

The geometry is Natural Earth, which is public domain, simplified for these atlases. Small states missing from the 110m world map, including Malta, are drawn as points.

```bash
npm install @chartkitdev/geo
```

```js
import { render, validate } from "@chartkitdev/geo";

const spec = {
  version: "1",
  type: "choropleth",
  data: [
    { country: "Norway", share: 98 },
    { country: "France", share: 26 },
  ],
  encoding: { region: "country", color: "share" },
  mark: { atlas: "world" },
  a11y: { alt: "Norway is higher than France." },
};

const result = validate(spec);
const svg = await render(spec);
```

Core `validate()` reports CK3057 for a map spec and leaves atlas, region, latitude, and `encoding.tooltip` to this package. `validate()` here reports CK3050–CK3056.
