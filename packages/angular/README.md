# @chartkitdev/angular

Standalone Angular component for a ChartKit JSON spec. The SVG comes from `@chartkitdev/core`. This package does not draw charts itself.

`<ck-chart [spec]="spec" />` validates the spec and writes the SVG during the server render. Change detection is OnPush: a new `spec` input redraws through `ngOnChanges`. In the browser, `afterNextRender` calls `mount()` from `@chartkitdev/vanilla` on that node. The server does not run that hook.

```bash
npm install @chartkitdev/core @chartkitdev/angular
```

```ts
import { Component } from "@angular/core";
import { Chart } from "@chartkitdev/angular";

@Component({
  standalone: true,
  imports: [Chart],
  template: `<ck-chart [spec]="spec" />`,
})
export class Panel {
  spec = spec;
}
```

An invalid spec throws `ChartKitSpecError` with the CK codes. Warnings still draw.

The component's own server render draws the core charts. Pass `render` from `createRenderer([...])` to draw a subset. `renderToString` from `@chartkitdev/angular/ssr` is the SVG string with histogram through rose and bar-list included:

```ts
import { renderToString } from "@chartkitdev/angular/ssr";

const svg = renderToString(spec);
```

`mount()` hydrates the same node. Core charts attach immediately. Histogram through rose load on demand when the component did not receive a `render` that already drew them.

Maps stay on `@chartkitdev/geo`.
