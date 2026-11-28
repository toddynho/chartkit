import type { DocSection } from "./docs-catalog";

function section(title: string, paragraphs: string[], list: string[] = [], code: string[] = []): DocSection {
  return { title, paragraphs, list, code };
}

/** Short original copy for the docs pages. Replaces the mock article bodies. */
export const articleSections: Record<string, DocSection[]> = {
  "": [
    section(
      "Next steps",
      ["The quick start on Overview renders a chart. These pages go further."],
      [
        "Concepts. The spec, data, and encoding.",
        "Validate. Check a spec, then repair it.",
        "Theming. Theme, tokens, and presets.",
        "Gallery. Every chart type.",
        "Playground. Edit a spec and render it.",
      ],
    ),
  ],
  react: [
    section("Install", ["The adapter depends on `@chartkitdev/core`."], [], ["npm install @chartkitdev/react"]),
    section("Chart", ["Pass the same JSON every other adapter takes. Framework props are not spec keys."], [], [
      'import { Chart } from "@chartkitdev/react";\n\nexport function Panel() {\n  return <Chart spec={spec} />;\n}',
    ]),
    section("Server", [
      "App Router can render the SVG on the server with `renderToString` from `react-dom/server`. The older dashboard components (`LineChart`, `KpiCard`, and the rest) still exist. Pass `spec` to `Chart` for new charts.",
    ], [], [
      'import { renderToString } from "react-dom/server";\nimport { Chart } from "@chartkitdev/react";\n\nconst html = renderToString(<Chart spec={spec} />);',
    ]),
  ],
  vue: [
    section("Install", ["Vue 3. The adapter depends on `@chartkitdev/core`."], [], ["npm install @chartkitdev/vue"]),
    section("Chart", ["Bind the spec with `:spec`. The SVG is produced during render."], [], [
      '<script setup>\nimport { Chart } from "@chartkitdev/vue";\n</script>\n\n<template>\n  <Chart :spec="spec" />\n</template>',
    ]),
    section("Server", ["`renderToString` from `@chartkitdev/vue/ssr` includes the SVG."], [], [
      'import { renderToString } from "@chartkitdev/vue/ssr";\n\nconst html = await renderToString(spec);',
    ]),
  ],
  svelte: [
    section("Install", ["Svelte 4 and Svelte 5 both compile the component."], [], ["npm install @chartkitdev/svelte"]),
    section("Chart", ["The component uses `export let spec`. SvelteKit SSR includes the SVG."], [], [
      '<script>\n  import { Chart } from "@chartkitdev/svelte";\n</script>\n\n<Chart {spec} />',
    ]),
    section("Server", ["SvelteKit renders the SVG during SSR. No extra server entry is required."]),
  ],
  vanilla: [
    section("Install", ["No framework. `mount` writes into an element you already have."], [], [
      "npm install @chartkitdev/vanilla",
    ]),
    section(
      "Chart",
      ["`update` keeps that element. `destroy` clears it. `renderToString` is the SVG string from core."],
      [],
      [
        'import { mount, renderToString } from "@chartkitdev/vanilla";\n\nconst chart = mount(document.querySelector("#chart"), spec);\nchart.update(spec);\nconst svg = renderToString(spec);',
      ],
    ),
  ],
  markdown: [
    section("Fence", [
      "A `chartkit` fence is a v1 spec. The markdown package renders it with core. It does not invent a second chart language.",
    ]),
    section("Install", ["The package is `@chartkitdev/markdown`."], [], ["npm install @chartkitdev/markdown"]),
  ],
  "spec-anatomy": [
    section("Required", [
      '`version` is `"1"`. `type` names the chart. `a11y.alt` is one sentence. `data` is an array of rows, or `{ "columns": { "field": [] } }` when the table is wide. It is not `{ "values": [] }`.',
    ]),
    section("Mark and metric", [
      "`mark` is an options object: curve, points, area, sampling, stack. It is not a string, and it is not `mark.markers` or `mark.fill`. Gauge, kpi, and progress-ring use `metric` for the number.",
    ]),
    section("Repair", [
      "`validate()` checks the schema and the data. `render()` does not. Unknown types return an error SVG and do not throw. `repair()` applies the safe JSON Patch and does not mutate the input.",
    ]),
  ],
  data: [
    section("Rows", [
      "Each row is an object. Field names in `encoding` point at those keys. A number array is only for sparkline, mini-area, and spike.",
    ]),
    section("Columns", [
      'Large tables may use `{ "columns": { "month": ["Jan"], "revenue": [120] } }`. The encoding field names stay the same.',
    ]),
  ],
  encoding: [
    section("Channels", [
      "`encoding.x` and `encoding.y` are field names. `encoding.y` may be a list of channels. A heatmap measure is `encoding.color`, not `encoding.value`. A donut uses `encoding.x` for the slice label and `encoding.y` for the value.",
    ]),
    section("Second axis", [
      'Put a channel on the right axis with `axis: "y2"`. The title is `axes.y2.title`. Combo does not use `encoding.bar`.',
    ]),
  ],
  scales: [
    section("Types", ["Field types are quantitative, temporal, ordinal, or nominal."]),
    section("Domain", [
      "`encoding.y.scale.domain` is `[min, max]`. Either end may be `null` to stay automatic, as in `[0, null]`. `scale.type` `log` is for a positive domain.",
    ]),
    section(
      "Dates and times",
      [
        'Set `type: "temporal"` on `encoding.x` and write each value as an ISO 8601 string or as epoch milliseconds. A string with no offset is clock time in the spec `timezone`, which is an IANA name such as `America/New_York`. With no `timezone` it is UTC. The zone of the machine that renders is never used, so a server in UTC, a laptop in Tokyo, and the browser that hydrates the page paint the same ticks.',
      ],
      [
        "`2026-11-27` is midnight at the start of that day in the spec timezone.",
        "`2026-11-27T07:40`, `2026-11-27 07:40`, `2026-11-27T07:40:15`, and `2026-11-27T07:40:15.250` are that clock time in the spec timezone.",
        "`2026-11-27T07:40Z` and `2026-11-27T07:40-05:00` name one instant. The timezone does not move them. It only decides how the ticks read.",
        "A number is epoch milliseconds: `1795802400000` is 18:00 UTC on November 27, 2026.",
        'Any other text, such as `Nov 27, 2026` or `11/27/2026`, is handed to the JavaScript engine and can differ between hosts. Write ISO strings.',
        "When clocks jump forward, a time inside the skipped hour moves forward by that hour. When clocks fall back, a time that happens twice is the first of the two. Add an offset to say which one you mean.",
      ],
      [
        'import { render } from "@chartkitdev/core/all";\n\nconst svg = render({\n  version: "1",\n  type: "line",\n  timezone: "America/New_York",\n  data: [\n    { t: "2026-11-27T07:40", visits: 120 },\n    { t: "2026-11-27T13:00", visits: 310 },\n    { t: "2026-11-27T22:30", visits: 180 },\n  ],\n  encoding: { x: { field: "t", type: "temporal" }, y: "visits" },\n  a11y: { alt: "Visits peaked at 310 at 1 PM." },\n});\n\n// x ticks on any host: 09:00 AM, 12:00 PM, 03:00 PM, 06:00 PM, 09:00 PM.\n// They are New York clock times. Remove `timezone` and the same strings are UTC.',
      ],
    ),
    section(
      "Tick labels on a time axis",
      [
        "With no format set, the axis picks the shortest labels that still tell every tick apart. One day reads as times. Several days read as dates. When ticks fall inside a day on a span of several days, the tick at midnight shows the date and the others show the date and the time. Labels are never shortened. When they need more room, the axis draws fewer ticks.",
        "The chart below spans two and a half days at the default 640 pixel width. Its ticks read `Nov 25, 12:00 PM`, `Nov 26`, `Nov 26, 12:00 PM`, `Nov 27`, `Nov 27, 12:00 PM`.",
        'To override the text, set `encoding.x.format` to `date`, `time`, `datetime`, `weekday`, `month`, or `year`. The format in the spec wins, even when it makes two ticks read the same: `"format": "time"` on this chart prints `12:00 PM`, `12:00 AM`, `12:00 PM`, `12:00 AM`, `12:00 PM`. To choose the ticks themselves, set `axes.x.ticks` to epoch milliseconds: `"axes": { "x": { "ticks": [1795651200000, 1795737600000] } }` draws two ticks, `Nov 26` and `Nov 27`.',
        "Line, area, scatter, combo, and the other charts on the shared x axis follow both rules. Spike, candlestick, and area-range read dates the same way and still label by span alone, so their ticks can repeat across days. Streamgraph reads a string with no offset as UTC whatever the timezone. The hover tooltip reads one in the browser's zone when `timezone` is set. Write an offset or `Z` on those until they follow.",
      ],
      [],
      [
        'import { render } from "@chartkitdev/core/all";\n\nconst svg = render({\n  version: "1",\n  type: "line",\n  data: [\n    { t: "2026-11-25T08:30Z", load: 41 },\n    { t: "2026-11-25T20:10Z", load: 58 },\n    { t: "2026-11-26T08:00Z", load: 44 },\n    { t: "2026-11-26T21:00Z", load: 63 },\n    { t: "2026-11-27T08:30Z", load: 47 },\n    { t: "2026-11-27T19:45Z", load: 52 },\n  ],\n  encoding: { x: { field: "t", type: "temporal" }, y: "load" },\n  a11y: { alt: "Load peaked at 63 on the evening of November 26." },\n});\n\n// To override: encoding: { x: { field: "t", type: "temporal", format: "time" }, y: "load" }',
      ],
    ),
  ],
  axes: [
    section("Titles", [
      "Axis titles are `axes.x.title` and `axes.y.title`. There is no `axis.x.label`. Tick count, rotation, side, and reversed scales are drawn.",
    ]),
    section("Range", ["A y domain clips points to the plot. Ticks stay inside that range."]),
  ],
  "themes-tokens": [
    section("Built in", [
      'Soft is the default. Omit `theme`, or set `"auto"` or `"soft"`. `@chartkitdev/core/all` is unchanged and already registers the other themes. A minimal `createRenderer([...])` setup needs `import "@chartkitdev/core/features"` for midnight, refined, and editorial, or a direct import from `@chartkitdev/core/themes/<name>`.',
    ]),
    section("Presets", [
      "This site's renderer imports `@chartkitdev/core/all`, which registers emerald, slate, mocha, and the other names in `@chartkitdev/core/themes/all`. A page that only imports one chart still needs that themes entry. Hosts override tokens with `--ck-*`.",
    ]),
  ],
  bundles: [
    section("What to import", [
      "`@chartkitdev/core/all` is the core set, including line. `@chartkitdev/core/extra` adds histogram through rose and the planning charts. `createRenderer([line])` keeps a page to one chart.",
    ]),
    section("Size", [
      "The measured gzip for each chart type is on /benchmarks. uPlot’s full package is smaller than the line, and first hover is faster there. Those losses stay in the benchmark table.",
    ]),
  ],
  options: [
    section("Names that exist", [
      "`mark.curve` is monotone by default, or linear, step, step-before, step-after. `mark.points` is none, hover, or always. `mark.area` fills under a line. Axis titles are `axes.x.title` and `axes.y.title`.",
    ]),
    section("Names that do not", ["`mark.markers`, `mark.fill`, and `axis.x.label` are not fields."]),
  ],
  errors: [
    section("Ranges", [
      "`CK1004` is a missing required field.",
    ]),
  ],
  themes: [
    section("On this page", [
      "The chips are Soft, Refined, Midnight, and Emerald. Soft is the default. Refined is built in. Midnight is the dark card. Emerald comes from `@chartkitdev/core/themes/all`, which this renderer loads.",
    ]),
    section("The rest", [
      "Also registered with that import: mono, slate, arctic, orchid, obsidian, neon, mocha, owl, retro, copper, rose, sunset, silver, pearl, and latte. Set `theme` to the name. An unknown name still resolves to midnight.",
    ]),
  ],
  validate: [
    section("One pass", [
      "`validate()` returns `{ ok, diagnostics, errors, warnings }`. It does not throw on a bad spec. `repair()` applies the safe fixes and does not mutate the input.",
    ]),
    section("Planning charts", [
      "Gantt, timeline, quadrant, venn, and journey are checked with `validatePhase4`. The main `validate()` entry warns and points there.",
    ]),
  ],
  repair: [
    section("Patch", [
      "`repair()` returns the next spec and the JSON Patch it applied, then revalidates. It does not invent rows. A missing or unknown `type` is reported first.",
    ]),
  ],
  render: [
    section("Entries", [
      "`render()` from `@chartkitdev/core/all` draws the core charts. `@chartkitdev/core/extra` draws the rest of the library, including the planning charts. Neither call validates, and neither throws on an unknown type: the SVG explains the error.",
    ]),
    section("This site", [
      "The response rail validates first. When there are errors it shows the CK codes and skips `render()`. Warnings still draw the chart.",
    ]),
  ],
  "llms-txt": [],
  mcp: [
    section("Install", [
      "`npx -y @chartkitdev/mcp` starts the server. It speaks stdio and calls `validate`, `repair`, and `render` in-process. `render_chart` is the tool that calls Cloud.",
    ], [], ["npx -y @chartkitdev/mcp"]),
  ],
};
