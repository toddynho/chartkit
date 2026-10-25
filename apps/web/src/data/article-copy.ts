import type { DocSection } from "./docs-catalog";

function section(title: string, paragraphs: string[], list: string[] = [], code: string[] = []): DocSection {
  return { title, paragraphs, list, code };
}

/** Short original copy for the docs pages. Replaces the mock article bodies. */
export const articleSections: Record<string, DocSection[]> = {
  "": [
    section(
      "Install",
      [
        "Install core, then the adapter for the framework you render in. `@chartkitdev/element`, `@chartkitdev/geo`, and `@chartkitdev/mcp` are in this repo and are not on npm yet.",
      ],
      [],
      ["npm install @chartkitdev/core\nnpm install @chartkitdev/react"],
    ),
    section(
      "A valid spec",
      [
        '`version` is `"1"`. `a11y.alt` is one sentence and is required. `data` is an array of row objects. Sparkline, mini-area, and spike may use a number array. The chart type goes in `type`. `mark` is an options object. Gauge, kpi, and progress-ring put the number in `metric`.',
      ],
    ),
    section(
      "Render",
      [
        "`render` from `@chartkitdev/core/all` registers the core charts and the named theme presets. Histogram through rose, and the planning charts, render from `@chartkitdev/core/extra`. `render()` does not validate. This docs site runs `validate()` first and does not call Cloud.",
      ],
      [],
      [
        'import { render } from "@chartkitdev/core/all";\nimport { validate, repair } from "@chartkitdev/core/validate";\n\nconst result = validate(spec);\nconst svg = render(result.ok ? spec : repair(spec).spec);',
      ],
    ),
  ],
  react: [
    section("Install", ["The adapter depends on `@chartkitdev/core`."], [], ["npm install @chartkitdev/react"]),
    section("Chart", ["Pass the same JSON every other adapter takes. Framework props are not spec keys."], [], [
      'import { Chart } from "@chartkitdev/react";\n\nexport function Panel() {\n  return <Chart spec={spec} />;\n}',
    ]),
    section("Server", [
      "App Router can render the SVG on the server with `renderToString` from `react-dom/server`. The older dashboard components still exist. Their props are not spec keys.",
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
  ],
  axes: [
    section("Titles", [
      "Axis titles are `axes.x.title` and `axes.y.title`. There is no `axis.x.label`. Tick count, rotation, side, and reversed scales are drawn.",
    ]),
    section("Range", ["A y domain clips points to the plot. Ticks stay inside that range."]),
  ],
  "themes-tokens": [
    section("Built in", [
      'Soft is the default. Omit `theme`, or set `"auto"` or `"soft"`. `refined` and `editorial` are built in. `midnight` is the opt-in dark card. Any other name falls through to midnight until that preset is registered.',
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
      "The published line-chart figure is 34,554 bytes gzip. uPlot is smaller, and first hover is faster there. Those losses stay in the benchmark table.",
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
      "CK1xxx is structure, CK2xxx is data, CK3xxx is semantics, CK4xxx is design. `CK1001` is invalid JSON. `CK1004` is a missing required field. This rail shows the code and does not draw a chart when `validate()` fails.",
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
  "llms-txt": [
    section("Where it lives", [
      "`llms.txt` is the short agent index: the rules, the repair loop, and one spec per chart type. chartkit.dev still serves that file from the Next.js app. This Astro app links to it and does not replace it.",
    ]),
  ],
  mcp: [
    section("Not on npm", [
      "`@chartkitdev/mcp` is not published yet. The server speaks stdio and calls `validate`, `repair`, and `render` in-process. `render_chart` is the tool that calls Cloud.",
    ]),
  ],
};
