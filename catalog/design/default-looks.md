# Default looks

Soft is the library default. `theme` omitted, `"auto"`, or `"soft"` resolve to the same tokens. Light or dark follows the page scheme (`light-dark()`, so `color-scheme` on an ancestor and `prefers-color-scheme` both work). `"refined"` and `"editorial"` are built-in names. `"midnight"` stays an opt-in dark card. Any other name still falls through to midnight until that preset is imported.

The pictures are in `/opt/cursor/artifacts/design/`. Colour tokens live in `packages/core/themes/candidates.css`. The same values are in `packages/core/src/themes/candidates.ts` for the sheet renderer and the sync test. That module is not imported by the line bundle. The renderer carries the light-dark pairs itself, in `theme.ts`.

## What the reference defaults do well

Studied as they ship, not as a custom theme on top: Tremor, shadcn/ui charts, Observable Plot, Nivo, Apple Stocks and Health, Stripe and Linear dashboards, Vercel analytics. Chart.js 4.5, ECharts 6.1, and Recharts 3.10 were rendered from the versions in the benchmark harness.

**Palette.** The ones that look finished have a real categorical palette on the first paint. shadcn uses five `oklch` chart colours (orange, teal, blue, yellow, amber) and lets the host override `--chart-1`. Observable’s `observable10` is saturated and slightly dusty. Stripe’s marketing charts lean on one blurple (`#635bff`) and then a short saturated set. Tremor’s documented multi-series examples use Tailwind 500s (blue `#3b82f6`, emerald `#10b981`, violet `#8b5cf6`), but the component default for `colors` is a single `"blue"`, so an untouched multi-series Tremor chart is monochrome. Vercel analytics is often one blue (`#0070f3`) on white. Apple Health uses a few saturated rings (pink, green, blue), not a long rainbow. Nivo’s default scheme is pastel and several of those pastels miss 3:1 on white.

**Saturation.** Refined products keep chroma in a middle band. Neon (high chroma, high lightness) and pastel (high lightness, low chroma) both fail as defaults: neon vibrates on a white card, pastel disappears. Dark mode is the same hues, lifted in lightness, not a separate rainbow.

**Contrast.** Gridlines are the quiet layer. shadcn and Vercel use a hairline at about 5–8% ink. Ticks are a muted gray that still clears roughly 4.5:1 as text (`#71717a` on white is 4.8:1). The data mark is the loud layer. Holding every series swatch to 3:1 on white pulled the first pass into desaturated mid tones. Fills can now be vivid 500-weight hues. The 3:1 floor stays on thin strokes (lines at or under 2px, via a darker `--ck-line-*` when the fill misses it) and on text-like marks (KPI deltas, muted ticks). Legends, direct labels, and a spread of lightness carry the rest.

**Type.** System sans, 12–14px titles, 11px ticks, tabular numerals so columns of ticks align. Vercel, Stripe, and Linear use that stack (Inter or SF when the OS has it). Apple Stocks puts the number huge and the axis almost away. Titles are one weight heavier than subtitles, and the subtitle is the muted colour, not a second black line.

**Grid and axes.** No box around the plot. No heavy axis rule. Horizontal grid only, or none (Apple). Ticks sit in the margin with a few pixels of air, not on the spine. ECharts 6 still draws an axis line and a stronger split line (`neutral15`), which is why its defaults feel more like a desktop tool than a dashboard card.

**Padding.** Dashboard cards are about 320×220, not a full-bleed 640×360. Title and subtitle sit inside the card, left aligned with the plot, with more air above the first gridline than below the last tick.

**Bars.** shadcn and Tremor round the top of the bar (about 4–8px) and leave the base square, with a clear gap between groups. Observable often uses square caps. A radius past 8px on a narrow bar turns the mark into a capsule and should stay on the “soft” look only. The renderer now rounds only the end away from the baseline.

**Lines and areas.** Stroke around 1.75–2.25px, round caps and joins. Area fill is a vertical fade to transparent, not a flat 30% slab. Point markers are off or hover-only on dashboard lines (shadcn, Vercel, Apple). Observable and Chart.js keep small dots. Dots on every vertex fight a smooth curve at this size, so only the editorial candidate turns them on.

**Legend.** A small rounded swatch and a 12px label, in a row under the title or under the plot. No framed legend box. Hidden when there is only one series. Donut legends use two columns: the name on the left, the percentage on the right, with the value column reserved so a label cannot run into the number.

**Empty and edge.** Empty is a track, not an illustration and not a fake zero series. Heatmap cells with no value use the surface colour. Gauge and ring tracks use `--ck-track`, falling back to the theme track colour. A missing point breaks the line (it is not dropped into a neighbour). Wide tick labels need margin; that is already how the renderer sizes the y axis. A single series does not grow a legend. The default curve is monotone-x, so a spike stays inside the data range. A stroke centered on the top gridline would still be clipped by the plot, so the y domain grows by extra air (about half the stroke plus 14px on a full chart, less on a sparkline) and the peak sits inside the plot. The plot clip still applies.

## Candidates

Each look is a full token set, light and dark: background, surface, text, muted, grid, axis, accent, positive, negative, eight series, a six-stop sequential scale, and a seven-stop diverging scale. Series order is the order a chart paints (`--ck-series-1` first).

Structural numbers are wired. `--ck-line-width`, `--ck-bar-radius` (outer end of a bar only, via `clip-path`), `--ck-area-opacity` (including the gradient mid stop), `--ck-track`, and `--ck-line-dots` (`none` or `inline`) are presentation values, so a host stylesheet overrides them on the painted SVG. `--ck-bar-gap` is the same number as the theme, but the renderer applies it when it places the bars. A later CSS change cannot move those bars; set `mark.gap`, or pick a theme, to change the gap. `mark.strokeWidth`, `mark.cornerRadius`, `mark.fillOpacity`, `mark.points`, and `mark.gap` still override the theme. Soft and refined omit visible dots; the circles are in the SVG with `display: none` so `--ck-line-dots: inline` can turn them on. Editorial draws them. Midnight keeps the previous geometry (radius 3, gap 0.25, hover dots that are not painted).

| | A Refined neutral | B Vivid editorial | C Soft modern |
|---|---|---|---|
| Reference | shadcn, Vercel | Stripe, Observable | Tremor, Apple |
| Light card | `#ffffff` | `#ffffff` | `#f5f5f7` (plot stays transparent) |
| Dark background | `#09090b` | `#0b1020` | `#1c1c1e` |
| Line | 1.75px, no dots | 2.25px, small dots | 2px, no dots |
| Bar radius / gap | 4 / 0.22 | 2 / 0.18 | 8 / 0.34 |
| Area fade | 0.18 at the top, then 35% of that, then clear | 0.28 at the top, same falloff | 0.22 at the top, same falloff |
| Type | system sans, tabular nums | same, ink titles (`#0a2540`) | same; gray card is optional |

Positive and negative are text colours on KPI deltas and candle bodies. They clear 3:1 on that look’s background (the light ones clear 4.5:1 except editorial is the same pair). They are not required to be members of the fill list.

### A. Refined neutral

Quiet chrome, vivid data. Zinc text (`#18181b` / `#fafafa`), muted `#71717a` (4.83:1 on white) and `#a1a1aa` (7.76:1 on `#09090b`). Grid is 5% ink. Series 1 is Tailwind blue 500 (`#3b82f6`), then rose 600, amber 400, emerald 500, violet 600, cyan 400, orange 400, and pink 500. Amber and cyan are bright fills; their 2px strokes drop to amber 600 and cyan 600.

### B. Vivid editorial

Indigo 600 (`#4f46e5`) leads, in the same family as Stripe’s `#635bff`, then orange 500, emerald 600, amber 400, rose 600, cyan 400, purple 500 (`#a855f7`), and pink 500. Titles use Stripe’s ink `#0a2540`. The line is 2.25px, so the sheet paints the fill colour rather than the darker stroke token. Dots stay on. Bars are almost square, with the radius only on the outer end.

### C. Soft modern

Page is Apple’s system gray `#f5f5f7`. Bars get an 8px cap on the outer end and a wider gap. No dots. The series is Apple blue, green, orange, purple, and pink, plus sky, lime 600, and a warm orange. Dark is `#1c1c1e`. Several of those system colours sit under 3:1 as fills; the ≤2px stroke uses a darker variant (`#248a3d`, `#c93400`, `#0071a4`, `#4d7c0f`, `#9a3412`).

## Colour-vision and contrast checks

Fills, sequential stops, and diverging stops are not all held to 3:1. Light heatmap stops are tints on purpose, so a low cell is visibly lighter than a high cell. Thin-line tokens (`--ck-line-1` … `--ck-line-8`), positive, negative, and muted text are the colours that have to clear a contrast floor: 3:1 for the strokes and the delta colours, 4.5:1 for muted ticks.

Contrast is the WCAG relative-luminance ratio against that look’s own background. The weakest fill is 1.67:1 (amber `#fbbf24` on white, refined and editorial light). The weakest thin-line token is 3.19:1 (amber `#d97706` on white). Positive and negative are at least 4.70:1 on white, 5.04:1 and 5.77:1 on `#f5f5f7`, and 4.99:1 or better on the dark backgrounds. Muted ticks are at least 4.66:1.

Colour-vision simulation is Machado, Oliveira, and Fernandes 2009 at full severity (protanopia, deuteranopia, tritanopia), applied in linear sRGB, then compared with OKLab Euclidean distance (ΔE). This is not a WCAG number. Lightness is staggered so a hue collapse still leaves a luminance gap. Eight vivid colours still have a close pair under one simulation. The numbers below are the fills. Stroke tokens are listed when they are tighter than the fills.

Minimum pairwise OKLab ΔE on the eight fills:

| Look | Scheme | Normal | Protan | Deutan | Tritan | Weakest fill | Weakest line |
|---|---|---:|---:|---:|---:|---:|---:|
| Refined | light | 0.112 | 0.078 | 0.049 | 0.067 | 1.67 | 3.19 |
| Refined | dark | 0.071 | 0.074 | 0.071 | 0.032 | 4.70 | 4.70 |
| Editorial | light | 0.113 | 0.062 | 0.058 | 0.042 | 1.67 | 3.19 |
| Editorial | dark | 0.123 | 0.077 | 0.044 | 0.063 | 5.14 | 5.14 |
| Soft | light | 0.098 | 0.034 | 0.035 | 0.038 | 2.02 | 3.35 |
| Soft | dark | 0.077 | 0.042 | 0.036 | 0.058 | 4.66 | 4.66 |

Closest fill pairs:

- Refined light, deuteranopia 0.049: emerald `#10b981` and pink `#ec4899`. Tritanopia 0.067: rose `#e11d48` and pink `#ec4899`.
- Refined dark, tritanopia 0.032: emerald `#6ee7b7` and cyan `#22d3ee`.
- Editorial light, tritanopia 0.042: orange `#f97316` and pink `#ec4899`. The thin-line pair is tighter: orange `#ea580c` and amber `#d97706` are 0.016 under deuteranopia. Those two strokes are only used when the line is ≤2px; the editorial sheet is 2.25px and paints the fills.
- Editorial dark, deuteranopia 0.044: emerald `#34d399` and rose `#fda4af`.
- Soft light, protanopia 0.034: orange `#ff9500` and lime `#65a30d`. Deuteranopia 0.035: pink `#ff2d55` and lime `#65a30d`.
- Soft dark, deuteranopia 0.036: green `#30d158` and red `#ff6961`.

Sequential scales run from a light tint to a deep stop (OKLab L span about 0.55 to 0.57), so a heatmap is not one blue. Diverging scales put a neutral gray between a rose arm and a green or blue arm. The neutral and the tints are fills, not thin lines, and some of them are under 3:1.

## Plot and card

Soft light’s card colour is `#f5f5f7` (dark `#1c1c1e`). Painting that rectangle inside the SVG makes a gray slab on a white page and covers a colored page. The built-in plot fill is therefore `transparent`. On white, the chart is just the marks and the type. On any other page, that page shows through, and `light-dark()` still picks the Soft ink for the page scheme.

The card is opt-in. Set `--ck-background: light-dark(#f5f5f7, #1c1c1e)`, or wrap the chart:

```css
.ck-card { background: light-dark(#f5f5f7, #1c1c1e); border-radius: 12px; }
```

`themes/candidates.css` does the same when an ancestor has `data-ck-theme="soft"` and `data-ck-scheme`. KPI cards use `--ck-surface` (`#ffffff` / `#2c2c2e`), not the page card. Contrast figures in this doc were measured on the card colour; on a transparent plot they hold on white and on the dark card, and they are the host’s to check on a saturated page.

## Theme API

Formatting stays presets only. No formatter functions.

| Name | Role |
|---|---|
| `auto`, `soft` | Default. Same tokens. Follows the page scheme. Transparent plot. |
| `refined` | Built in. Hairline grid, thinner line, radius 4. |
| `editorial` | Built in. Heavier line, dots on, radius 2. |
| `midnight` | Opt-in dark card. |
| anything else | Midnight, until `@chartkitdev/core/themes/<name>` is imported. |

A `tokens` object on the theme still replaces any colour, including `series`. Host `--ck-*` and `--chart-N` win over the fallbacks. The stylesheet remains the way to force one scheme without changing the page:

```html
<div data-ck-theme="refined" data-ck-scheme="light">
  <!-- chart svg -->
</div>
```

**Brand in one call.** `paletteFromBrand` derives eight categorical colours from one hex, or from a short list. The first colour keeps the brand hue and is only shifted enough to clear 3:1 on white (light) or `#09090b` (dark). It is not called from `resolvePreset`. The OKLCH math is about 1.9 KB gzipped, which does not fit in the line bundle next to the three built-in palettes, so `theme.brand` is not a spec field. Pass the array through the tokens override:

```ts
import { paletteFromBrand } from "@chartkitdev/core/themes/brand";

const series = paletteFromBrand("#635bff");
render({ ...spec, theme: { preset: "soft", tokens: { series } } });
```

Overriding `series` also replaces the thin-line fallback, so the brand colours are used for both fills and strokes unless `tokens.lines` is set too.

## Size

`paletteFromBrand` stays a separate `themes/brand` entry. It is not an import of `line`, `all`, or `validate`. `candidates.css` is not imported by any JavaScript bundle.

Measured with `npm run size` (gzip -9) after Soft, refined, and editorial moved into `theme.ts`.

| Bundle | Bytes | Budget |
|---|---:|---:|
| line | 13966 | 15083 |
| all | 25371 | 27401 |
| validate | 16658 | 17594 |

Line and all passed the previous caps (13074 and 24788). The new caps are 8 percent above the measurement, recorded in `scripts/size-budget.json` on 2026-10-17. Validate and the adapters stayed inside their budgets. `candidates.css` is 8,323 bytes raw and 1,897 bytes gzipped. `paletteFromBrand` remains about 1.9 KB gzipped on its own entry, which is more than the line headroom, so it is not imported there.
