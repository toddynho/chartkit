# Default looks

Three candidate defaults for Todd to choose from. None of them is the library default. `theme` omitted or `"auto"` still resolves to the current auto theme.

The pictures are in `/opt/cursor/artifacts/design/`. Colour tokens live in `packages/core/themes/candidates.css`. The same values are in `packages/core/src/themes/candidates.ts` for the sheet renderer and the tests. That module is not imported by the line bundle, `all`, or `validate`.

## What the reference defaults do well

Studied as they ship, not as a custom theme on top: Tremor, shadcn/ui charts, Observable Plot, Nivo, Apple Stocks and Health, Stripe and Linear dashboards, Vercel analytics. Chart.js 4.5, ECharts 6.1, and Recharts 3.10 were rendered from the versions in the benchmark harness.

**Palette.** The ones that look finished have a real categorical palette on the first paint. shadcn uses five `oklch` chart colours (orange, teal, blue, yellow, amber) and lets the host override `--chart-1`. Observable’s `observable10` is saturated and slightly dusty. Stripe’s marketing charts lean on one blurple (`#635bff`) and then a short saturated set. Tremor’s documented multi-series examples use Tailwind 500s (blue `#3b82f6`, emerald `#10b981`, violet `#8b5cf6`), but the component default for `colors` is a single `"blue"`, so an untouched multi-series Tremor chart is monochrome. Vercel analytics is often one blue (`#0070f3`) on white. Apple Health uses a few saturated rings (pink, green, blue), not a long rainbow. Nivo’s default scheme is pastel and several of those pastels miss 3:1 on white.

**Saturation.** Refined products keep chroma in a middle band. Neon (high chroma, high lightness) and pastel (high lightness, low chroma) both fail as defaults: neon vibrates on a white card, pastel disappears. Dark mode is the same hues, lifted in lightness, not a separate rainbow.

**Contrast.** Gridlines are the quiet layer. shadcn and Vercel use a hairline at about 6–8% ink. Ticks are a muted gray that still clears roughly 4.5:1 as text (`#71717a` on white is 4.8:1). The data mark is the loud layer. WCAG non-text contrast is 3:1 against the adjacent background. A yellow that looks pleasant at `oklch` lightness 0.9 lands near 1.3:1 on white, so it cannot be a default series colour. Okabe–Ito’s yellow and sky blue fail this. The categorical colours below were held to 3:1 or better, which pushes them into a mid tone.

**Type.** System sans, 12–14px titles, 11px ticks, tabular numerals so columns of ticks align. Vercel, Stripe, and Linear use that stack (Inter or SF when the OS has it). Apple Stocks puts the number huge and the axis almost away. Titles are one weight heavier than subtitles, and the subtitle is the muted colour, not a second black line.

**Grid and axes.** No box around the plot. No heavy axis rule. Horizontal grid only, or none (Apple). Ticks sit in the margin with a few pixels of air, not on the spine. ECharts 6 still draws an axis line and a stronger split line (`neutral15`), which is why its defaults feel more like a desktop tool than a dashboard card.

**Padding.** Dashboard cards are about 320×220, not a full-bleed 640×360. Title and subtitle sit inside the card, left aligned with the plot, with more air above the first gridline than below the last tick.

**Bars.** shadcn and Tremor round the top of the bar (about 4–8px) and leave a clear gap between groups. Observable often uses square caps. A radius past 8px on a narrow bar turns the mark into a capsule and should stay on the “soft” look only.

**Lines and areas.** Stroke around 1.75–2.25px, round caps and joins. Area fill is a vertical fade to transparent, not a flat 30% slab. Point markers are off or hover-only on dashboard lines (shadcn, Vercel, Apple). Observable and Chart.js keep small dots. Dots on every vertex fight a smooth curve at this size, so only the editorial candidate turns them on.

**Legend.** A small rounded swatch and a 12px label, in a row under the title or under the plot. No framed legend box. Hidden when there is only one series.

**Empty and edge.** Empty is a track, not an illustration and not a fake zero series. Heatmap cells with no value use the surface colour. Gauge and ring tracks use the grid colour. A missing point breaks the line (it is not dropped into a neighbour). Wide tick labels need margin; that is already how the renderer sizes the y axis. A single series does not grow a legend.

## Candidates

Each look is a full token set, light and dark: background, surface, text, muted, grid, axis, accent, positive, negative, eight series, a six-stop sequential scale, and a seven-stop diverging scale. Series order is the order a chart paints (`--ck-series-1` first).

Structural numbers (line width, bar radius, gap, area opacity, point markers) are in the stylesheet as `--ck-line-width`, `--ck-bar-radius`, `--ck-bar-gap`, and `--ck-area-opacity`. The renderer does not read those yet. It already reads `--ck-font-family` and the colour tokens. The sheets pass the structural numbers through `mark` so the pictures show the proposed geometry. Wiring them into every `stroke-width` attribute would grow the line bundle, so that waits until a look is chosen.

| | A Refined neutral | B Vivid editorial | C Soft modern |
|---|---|---|---|
| Reference | shadcn, Vercel | Stripe, Observable | Tremor, Apple |
| Light background | `#ffffff` | `#ffffff` | `#f5f5f7` |
| Dark background | `#09090b` | `#0b1020` | `#1c1c1e` |
| Line | 1.75px, no dots | 2.25px, small dots | 2px, no dots |
| Bar radius / gap | 4 / 0.22 | 2 / 0.18 | 8 / 0.34 |
| Area fade | 0.14 at the top | 0.24 at the top | 0.20 at the top |
| Type | system sans, tabular nums | same, ink titles (`#0a2540`) | same, on a warm gray page |

Positive and negative are taken from the series (a green and a rose or brick) so candles and KPI deltas stay inside the checked set.

### A. Refined neutral

Quiet chrome. Zinc text (`#18181b` / `#fafafa`), muted `#71717a` (4.83:1 on white) and `#a1a1aa` (7.76:1 on `#09090b`). Grid is 8% ink. The series is a dusty blue, brick, violet, green, teal, gold, cyan, and mauve. It is the closest of the three to a shadcn card: the colour is there, the furniture is not.

### B. Vivid editorial

Higher chroma, Stripe-like indigo as series 1 (`#4555a6` light, `#9fb3fc` dark), then crimson, green, orange, magenta, teal, olive, and lime. Titles use Stripe’s ink `#0a2540`. Dots stay on so a line reads as a marked series, the way Observable’s defaults do. Bars are almost square.

### C. Soft modern

Page is Apple’s system gray `#f5f5f7`, not pure white. Bars get an 8px cap and a wider gap. No dots. The series is blue, green, amber, violet, rose, teal, indigo, and olive. Dark is `#1c1c1e`, the system gray Apple uses behind grouped content.

## Colour-vision and contrast checks

Categorical, sequential, and diverging stops were checked against the look’s own background.

Contrast is the WCAG relative-luminance ratio. The floor asked for is 3:1 for non-text. Every stop in all three looks, both schemes, is at or above 3:1. Muted tick colours are at or above 4.5:1. The minimum categorical contrast is 4.07:1 (soft light). The minimum sequential stop is 3.75:1 (soft light). The minimum diverging stop is 3.91:1 (soft light). Grays in the diverging midpoints sit around 4.6:1 on light backgrounds and 5.5:1 on dark ones.

Colour-vision simulation is Machado, Oliveira, and Fernandes 2009 at full severity (protanopia, deuteranopia, tritanopia), applied in linear sRGB, then compared with OKLab Euclidean distance (ΔE). This is not a WCAG number. Okabe–Ito’s original set reaches about 0.075 under deuteranopia, but its yellow is 1.32:1 on white and its sky blue is 2.31:1, so it cannot be used as-is. Once every swatch has to clear 3:1, yellow and sky get pulled into the same lightness band as orange and blue and the easy lightness gap disappears. Eight colours in that band cannot all be far apart under every simulation. The sets below are the mid-tone palettes that still clear 3:1. Closest pairs are named so a 3-series chart can avoid them by using the earlier series.

Minimum pairwise OKLab ΔE, and the closest pair:

| Look | Scheme | Normal | Protan | Deutan | Tritan | Weakest contrast |
|---|---|---:|---:|---:|---:|---:|
| Refined | light | 0.070 | 0.042 | 0.040 | 0.042 | 4.30 |
| Refined | dark | 0.074 | 0.054 | 0.059 | 0.056 | 6.65 |
| Editorial | light | 0.080 | 0.038 | 0.039 | 0.040 | 4.69 |
| Editorial | dark | 0.077 | 0.069 | 0.054 | 0.053 | 6.19 |
| Soft | light | 0.063 | 0.044 | 0.041 | 0.043 | 4.07 |
| Soft | dark | 0.106 | 0.079 | 0.067 | 0.083 | 5.97 |

Closest light-mode pairs, so they are easy to see on the sheet:

- Refined, deuteranopia 0.040: cyan `#258598` and mauve `#9d6184`. Also brick `#894840` and gold `#795616`.
- Editorial, protanopia 0.038: orange `#b35c29` and lime `#527a19`. Deuteranopia 0.039: crimson `#99393b` and olive `#6f5c01`.
- Soft, deuteranopia 0.041: blue `#407cb2` and indigo `#5a66a8`.

Those pairs are late in the series list where it was possible. A three-series chart uses the first colours, which are further apart. Sequential scales are monotonic in lightness, so order survives a simulation that only collapses hue. Diverging scales put a neutral gray that itself clears 3:1 between a rose arm and a teal or green arm.

## Theme API

Formatting stays presets only. No formatter functions.

**Today.** `theme` omitted or `"auto"` is the default and follows `light-dark()`. `"midnight"` is the built-in dark card. Other names (`emerald`, `slate`, …) are opt-in imports. A `tokens` object on the theme already replaces any colour, including `series`.

**Proposed built-ins, after a look is picked.** Six names, selected by `theme`:

| Name | Role |
|---|---|
| `auto` | Default. Follows the page scheme. |
| `midnight` | Current dark card. |
| `refined` | Candidate A. |
| `editorial` | Candidate B. |
| `soft` | Candidate C. |
| `contrast` | Same hues as the chosen look, pushed to the ends of the 3:1 band when someone needs a larger colour-vision gap than the mid-tone set. Not built. |

Do not set `theme` to `refined`, `editorial`, or `soft` yet. An unknown name still falls through to midnight, which is a different look. Until one is registered, load the stylesheet and set the attributes on an ancestor:

```html
<div data-ck-theme="refined" data-ck-scheme="light">
  <!-- chart svg -->
</div>
```

The renderer already emits `var(--ck-series-1, …)`, so the host variables win without a JavaScript preset.

**Brand in one call.** `paletteFromBrand` derives eight categorical colours from one hex, or from a short list. The first colour keeps the brand hue and is only shifted enough to clear 3:1 on white (light) or `#09090b` (dark). Further colours rotate that hue and are spaced for the same contrast floor. It is not wired into `resolvePreset`, so it cannot change the default and it stays out of the line bundle.

```ts
import { paletteFromBrand } from "@chartkitdev/core/themes/brand";

const series = paletteFromBrand("#635bff");
```

Pass the array through the tokens override that already exists:

```ts
render({ ...spec, theme: { preset: "auto", tokens: { series } } });
```

A later `theme: { preset: "auto", brand: "#635bff" }` would call the same function inside the renderer. That waits, because the OKLCH math would ship in every bundle that paints a chart.

## Size

Themes are CSS custom properties. `candidates.css` is the opt-in file. `paletteFromBrand` is its own entry (`themes/brand`), not an import of `line`, `all`, or `validate`.

Measured with `npm run size` on this branch (gzip -9, same method as CI). The three headline bundles are unchanged from the parent commit:

| Bundle | Bytes | Budget |
|---|---:|---:|
| line | 12517 | 13074 |
| all | 23448 | 24788 |
| validate | 16644 | 17594 |

`candidates.css` is 6,422 bytes raw and 1,587 bytes gzipped. It is not imported by any JavaScript bundle. `paletteFromBrand` is a separate `themes/brand` entry: 3,529 bytes minified, 1,924 bytes gzipped. It is not on the line, all, or validate graphs.
