# @chartkitdev/element

A framework-free `<chart-kit>` element. It draws the same JSON spec as the Vue, Svelte, and vanilla adapters. The package is not on npm yet.

```html
<script type="module">
  import "@chartkitdev/element";
</script>

<chart-kit theme="soft">
  <script type="application/json">
    {"version":"1","type":"line","data":[{"week":"W1","baskets":12},{"week":"W4","baskets":22}],"encoding":{"x":"week","y":"baskets"},"a11y":{"alt":"Baskets rose."}}
  </script>
</chart-kit>
```

The spec can also be the `spec` property or a JSON `spec` attribute. The property wins when it is set. `theme` reflects as an attribute and overrides `spec.theme`.

`pointclick` is the core click event, bubbling from the element. A selection also fires `select` (`detail` is `{ points, series }`). Histogram through journey load on demand. If the element already contains an SVG, that node is patched in place.

`renderToString` from `@chartkitdev/element/ssr` returns the element with the SVG already inside, including the extra charts.

`packages/element/example/index.html` is a page with no build step. Serve the repo and open that file. The import map points at the built `dist` files.
