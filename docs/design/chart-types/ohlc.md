# OHLC bars spec proposal

Status: design only. Rank 4 in [README.md](./README.md). Recommendation: do the smaller version. Effort S. Coverage 3 of 9. Matrix id `type.ohlc`, `agentRelevance` 2. The parity doc already says candlestick exists and a separate OHLC mark does not.

An OHLC bar is the same four numbers as a candlestick. The high and the low are a vertical line. The open is a tick to the left. The close is a tick to the right. Use it when a finance prompt says OHLC, or when the candle body hides a small open-to-close move. Do not use it as a second chart with a second layout. The volume pane, the time axis, the up/down colors, and the high/low check are the candlestick chart.

## How other libraries expose it

| Library | What you write | Docs |
| --- | --- | --- |
| Highcharts | A Stock series `type: "ohlc"`. Points are `[x, open, high, low, close]`. The left tick is the open and the right tick is the close. Candlestick is the sibling series. | [OHLC chart](https://www.highcharts.com/docs/stock/ohlc-chart), [series.ohlc](https://api.highcharts.com/highstock/series.ohlc) |
| Plotly | A trace `type: "ohlc"` with `x`, `open`, `high`, `low`, `close`. Increasing points default green, decreasing red. `type: "candlestick"` is the body. | [OHLC charts](https://plotly.com/javascript/ohlc-charts/), [ohlc reference](https://plotly.com/javascript/reference/ohlc/) |
| amCharts 5 | `OHLCSeries` on an XY chart. The candlestick guide covers both marks. Colors come from close versus open. | [Candlestick and OHLC](https://www.amcharts.com/docs/v5/charts/xy-chart/series/candlestick-series/), [OHLCSeries](https://www.amcharts.com/docs/v5/reference/ohlcseries/) |

ECharts has candlestick and no OHLC series (matrix `none`). Vega-Lite, Plot, Recharts, and Nivo do not have the mark. Chart.js needs a plugin. They are not coverage.

## Encoding

The encoding is the candlestick encoding. No new channels.

| Channel | Role |
| --- | --- |
| `encoding.x` | Time or category. |
| `encoding.open`, `encoding.high`, `encoding.low`, `encoding.close` | The four prices. |
| `encoding.volume` | Optional pane under the price plot. Already shipped. |

`a11y.alt` stays required.

## Mark options

| Property | Values | Default when omitted | Drawn as |
| --- | --- | --- | --- |
| `mark.style` | `"candle"` \| `"ohlc"` | `"candle"` on type `candlestick`. `"ohlc"` when the type was `ohlc` and repair rewrote it. | Candle body, or a stem with two ticks. |

Tick length is a third of the slot, not a new option. The up color is `positive`. The down color is `negative`. Close equal to open uses `positive`, matching the candle (the body is flat, the ticks still draw).

`mark.style` on any type other than candlestick warns and `repair()` removes it.

## The smaller version

Do not add a renderer, and do not add `"ohlc"` as a chart that owns geometry.

1. `mark.style` on candlestick, default `"candle"`.
2. `validate` accepts `type: "ohlc"` only as an alias: `repair()` sets `type` to `"candlestick"` and `mark.style` to `"ohlc"`. The enum has to contain `"ohlc"` or the bad-enum error fires before repair. Add it to the enum as an alias, described as the candlestick chart with ticks. The hero catalog does not gain a type. `HERO_TYPE_COUNT` stays 38.
3. `isExtra("ohlc")` is false. The painter stays in `all`, because candlestick is already there.

A separate `@chartkitdev/core/charts/ohlc` entry would duplicate the scale, the volume pane, and the high/low check. That is the version not to build.

## Catalog groups

Candlestick's groups, plus `mark.style` under Marks & style. Axes, the volume pane, `encoding.x` type, format, and scale (restored for candlestick in the parity pass), tooltip, and `positive` / `negative` tokens stay as they are. `render: "canvas"` stays legal on candlestick. The canvas painter grows one branch for the stem and the ticks. That branch is the cost of the alias, and it is small.

## Data shape and transforms

One row per period. The same row as a candle. No transform. The existing high/low check stays: high is the max of the four, low is the min. That check is `CK3003`. OHLC does not get a second code for the same mistake.

## Interactions

The candlestick hover: one period, open, high, low, close, and volume when present. Keyboard, when `a11y.keyboard` is set, moves by period. No new hit target. The stem is the hit target, the same slot as the candle body.

## Accessibility

`a11y.alt` is the move, not the chart type. Teach: the period, the direction, and the close, in one sentence.

Each stem's `aria-label` is the x label, up or down, and the four numbers in open, high, low, close order. Color is not the only cue: the label says up or down, and the tick sides say open and close for a sighted reader. A note in the docs should say the left tick is the open, because that convention is not universal in prose even though these three libraries share it.

## Soft theme

`positive` is `#15803d` in the light list and `#30d158` in the dark list. `negative` is `#be123c` and `#ff453a`. Those are the candle colors today. OHLC uses them for the stroke. There is no fill, so the contrast is the stroke against the transparent plot. Both pairs are already chosen for that. No new token. Grid and axis unchanged. Volume bars keep the candle treatment.

## Layout, dependency, bundle

No new layout. The candlestick scale, slot width, and volume pane stay. The mark is a line from low to high at the slot center, a horizontal tick to the left at open, a horizontal tick to the right at close.

Zero dependencies.

Estimate: 0.4–0.8 KB gzip on `all`, the same on `canvas` if the painter branch lands, and a smaller bump on `validate` for one enum value and one `mark` enum. The line bundle does not include candlestick and should not move. There is no standalone extra entry.

## Shared code

The candlestick renderer. `openChart`, `readAxis`, `ticks`, `linear`, `cssVar("positive")`, `cssVar("negative")`. Volume pane. `CK3003`.

## Risks

- An alias that repairs `type` will surprise a caller who switches on `spec.type` after `repair()`. The repaired spec says `candlestick`. Docs and the repair note say that. The rendered `data-ck-type` should stay `candlestick` so one painter owns the attribute. `data-ck-style="ohlc"` records the mark.
- Agents emit `open` `high` `low` `close` as keys inside `mark` or as a `y` array. That is an existing candlestick failure, not a new one. The unknown-field hint stays.
- Drawing OHLC and a candle on one combo is out of scope. `mark.style` is the chart, not a per-series switch, in v1.

## Error situations

Numbers are not assigned, except `CK3003`, which already covers a high below a low or a high that is not the max.

| Situation | Severity | Repair |
| --- | --- | --- |
| `type` is `"ohlc"`. | warning | Set `type` to `"candlestick"` and `mark.style` to `"ohlc"`. |
| `mark.style` is `"ohlc"` or `"candle"` on another type. | warning | Remove `mark.style`. |
| `mark.style` is any other string. | error | The existing bad-enum error. |
| High, low, open, or close is inconsistent. | error | `CK3003`, unchanged. |

## Schema diff

Add `"ohlc"` to the `type` enum. The description says it is the candlestick chart drawn as ticks, and that repair rewrites it to `candlestick` with `mark.style: "ohlc"`.

`mark.style` is `"candle"` or `"ohlc"`. Description: candlestick only. Omitted means a candle.

No new encoding channels. `encoding.open`, `high`, `low`, `close`, and `volume` descriptions can mention the alias in one clause.

## Examples

### 1. The spec an agent will write

Repair rewrites this to a candlestick with `mark.style: "ohlc"`.

```json
{
  "version": "1",
  "type": "ohlc",
  "data": [
    { "day": "Mon", "open": 10, "high": 14, "low": 9, "close": 12 },
    { "day": "Tue", "open": 12, "high": 13, "low": 8, "close": 9 }
  ],
  "encoding": { "x": "day", "open": "open", "high": "high", "low": "low", "close": "close" },
  "a11y": { "alt": "Monday closed up at 12. Tuesday closed down at 9." }
}
```

Compact JSON is 289 characters and **96 tokens**. Pretty-printed it is 150 tokens.

### 2. The spec after repair, with volume

This is the form to store. The alias exists so example 1 still validates.

```json
{
  "version": "1",
  "type": "candlestick",
  "data": [
    { "day": "Mon", "open": 10, "high": 14, "low": 9, "close": 12, "shares": 100 },
    { "day": "Tue", "open": 12, "high": 13, "low": 8, "close": 9, "shares": 140 }
  ],
  "encoding": {
    "x": "day",
    "open": "open",
    "high": "high",
    "low": "low",
    "close": "close",
    "volume": "shares"
  },
  "mark": { "style": "ohlc" },
  "a11y": { "alt": "Monday closed up at 12 on 100 shares. Tuesday closed down at 9." }
}
```

Compact JSON is 378 characters and **120 tokens**. Pretty-printed it is 193 tokens.

## Where it ships

- Inside the candlestick renderer, which is already in `all` and in the canvas painter.
- No new docs route. The candlestick page gains a section and the repaired example.
- `llms.txt` gains one line on the candlestick rule: OHLC is `mark.style: "ohlc"`, or `type: "ohlc"` which repairs to that. Paid for by a trim.
- No new gallery tile. The candlestick tile can stay a candle.
- Eval task `two-day-ohlc` for a later round. The checker accepts either the alias or `mark.style: "ohlc"`, and it wants a stem rather than a filled body. Not a paid run. The scoreboard stays 42.

## Left for later

Per-point tick colors beyond up/down. Hollow candles. A column of volume that is not the existing pane. Those are candlestick work, not a new type.

## Size

**S.** One branch in a painter that already reads the four fields.
