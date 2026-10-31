# Changelog

## Unreleased

- Presets `tape`, `kite`, `mustard`, and `violet`. Tape and Kite are the named ideas. Mustard (`#ca8a04`) and Violet (`#6d28d9`) freeze the light and dark output of `createTheme`. Import them from `@chartkitdev/core/themes/<name>` or `@chartkitdev/core/themes/all`. They are not in the line bundle.
- `createTheme({ brand })` and `theme: { brand: "#hex" }` derive a light and a dark preset, then adjust for contrast and for deuteranopia and protanopia. `validate` and `repair` canonicalize the hex (CK3085). The colour math stays in `@chartkitdev/core/themes/brand`, off the line bundle.
- `colorsFromSvg` reads SVG fills. `sampleImageData` reads pixels. `colorsFromBitmap` samples a browser canvas at 48px. Node does not decode PNG or JPEG.
- `createTheme().textures` suggests riso for Mustard and Violet. Pattern tiles are not painted.
- The line entry does not import these themes. `@chartkitdev/core/all` registers tape, kite, mustard, and violet with the other named presets.
- Motion is in beta. The API may change. `motion: "auto"` opts an update into a 320ms ease-out. Omitted and `"none"` stay still, which is the default. `render()` and export ignore it, so SSR and PNG/SVG export stay still. The runtime lives in the interact chunk. Bundled alone it is 4,478 bytes gzip. Morphs stop above 2,000 rows. A same-length canvas window strokes in place.
- Minimal `createRenderer([...])` setups now need `import "@chartkitdev/core/features"` for annotations, color rules, headlines, tooltip chrome, line labels and the midnight, refined and editorial themes.
- Themes can also be imported individually from `@chartkitdev/core/themes/<name>`.
