import { render } from "@chartkitdev/core/all";
import { render as renderGeo } from "@chartkitdev/geo";
import { ChartView } from "@/components/ChartView";
import { CodeBlock } from "@/components/CodeBlock";
import { StateBoard } from "@/components/StateBoard";
import { citySpec, metroRows, stateChange, stateNames, usSpec, withTheme, worldSpec } from "@/lib/geo-samples";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta(
  "Maps",
  "Choropleth and bubble maps from @chartkitdev/geo. Built-in atlases, no tile layer.",
  "/maps",
);

const sample = `{
  "version": "1",
  "type": "choropleth",
  "data": [{ "country": "Norway", "share": 98 }, { "country": "UK", "share": 46 }, { "country": "USA", "share": 23 }],
  "encoding": { "region": "country", "color": "share" },
  "mark": { "atlas": "world", "scale": "sequential" },
  "a11y": { "alt": "Norway's renewable share is higher than the UK and the US." }
}`;

export default async function MapsPage() {
  const boardMap = await renderGeo(withTheme({ ...usSpec, title: "Click a state", size: { width: 760, height: 520 } }, "soft"));
  const bars: Record<string, string> = {};
  for (const [id] of stateChange) {
    const name = stateNames[id] ?? id;
    bars[id] = render({
      version: "1",
      type: "bar",
      title: name,
      theme: "soft",
      data: metroRows(id),
      encoding: { x: "name", y: "people" },
      axes: { y: { title: "Millions" } },
      size: { width: 420, height: 480 },
      a11y: { alt: `${name} metros, approximate population in millions. This is not a county map.` },
    });
  }

  return (
    <div className="wrap section">
      <h1>Maps</h1>
      <p className="lede">
        Choropleth and bubble maps live in <code>@chartkitdev/geo</code>. The package is unpublished. It is not part of the line chart or <code>@chartkitdev/core/all</code>. Naming an atlas does not fetch anything. Each atlas is its own chunk.
      </p>
      <p>
        Colour scales are sequential, diverging, and threshold, with a legend and a no-data fill. Points take latitude and longitude, and can be sized and coloured. Themes set water, land, borders, and the no-data fill. Soft follows the page colour scheme. Midnight, Obsidian, Neon, and the other dark presets bake their own ink so a light page cannot wash the type out.
      </p>
      <h2>What this does not do</h2>
      <p>
        There is no tile layer. Highcharts (<code>tiledwebmap</code>), Plotly (<code>scattermap</code> and <code>choroplethmap</code>), amCharts (<code>MapRasterSeries</code>), and Google Maps do. ECharts tiles are a plugin. That row stays a ChartKit loss. There is no pan or zoom. There is no US county atlas and no NUTS-1, NUTS-2, or NUTS-3. The world and EU shapes are Natural Earth 110m, which omits Malta. Canada is a simplified 50m extract of the provinces and territories. Coastlines are coarse.
      </p>
      <p>
        Choropleth and point maps are native here, which ties ECharts, Highcharts, Plotly, Observable Plot, and Vega-Lite. Nivo&apos;s point map is a manual layer, so that row is a ChartKit win. The tile row is not.
      </p>

      <h2>Renewable share</h2>
      <p>
        Sequential green. <code>USA</code>, <code>United States</code>, and <code>UK</code> match the same way. Countries with no row, and Malta, stay in the no-data colour.
      </p>
      <ChartView spec={worldSpec} />

      <h2>States, diverging</h2>
      <p>
        Albers USA puts the lower 48 in the main frame and Alaska and Hawaii in insets. Red is a loss, blue is a gain, and the midpoint is zero. Figures are approximate percent change from 2020 to 2023.
      </p>
      <ChartView spec={usSpec} />

      <h2>Cities</h2>
      <p>Bubble area follows urban population. The six largest are labelled. The rest stay on the map without a tag when the tags would collide.</p>
      <ChartView spec={citySpec} />

      <h2>A state and its metros</h2>
      <p>
        Click a state, or focus it and press Enter. The bars are metro population for that state. ChartKit has no county polygons, so this drill stays in the data. California opens the board.
      </p>
      <StateBoard mapSvg={boardMap} bars={bars} names={stateNames} />

      <h2>Spec</h2>
      <CodeBlock code={sample} label="json" />
      <p>
        <code>validate()</code> in the geo package warns, with a JSON Patch, for an unknown atlas (CK3050), an unknown region key (CK3051, with a suggestion), a latitude or longitude outside range (CK3052), swapped latitude and longitude (CK3053), a missing value field (CK3054), missing coordinate fields (CK3055), and a missing region field (CK3056). Core <code>validate()</code> does not know these types.
      </p>
    </div>
  );
}
