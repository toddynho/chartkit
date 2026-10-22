import type { ChartSlot } from "./showcase-data.ts";

/**
 * Board 29. A fictional kiln at Harrow, drawn so the new axis and tooltip
 * options are doing the work: a signed log through zero, a broken linear
 * scale for the same firing, and a threshold mosaic of the bays.
 */

const bells = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22] as const;
const hearthKw = [-18, -26, -11, 8, 34, 86, 2480, 190, 62, 16, -6, -16];
const flueKw = [-6, -9, -3, 3, 12, 28, 96, 44, 18, 6, -2, -5];

const firing = bells.map((hour, index) => ({
  hour,
  hearth: hearthKw[index],
  flue: flueKw[index],
}));

const kw = { specifier: "+,.0f", suffix: " kW" };
const signedScale = { type: "symlog", constant: 10, domain: [-40, 2800], nice: false, zero: false };
const linearScale = { type: "linear", domain: [-40, 2800], nice: false, zero: false };

const bays = ["Ash", "Elm", "Oak", "Yew"] as const;
const bayBells = ["02", "06", "10", "14", "18", "22"] as const;
const bayKw = [
  [-14, -4, 22, 70, 18, -8],
  [-6, 8, 48, 420, 36, -2],
  [4, 16, 90, 860, 54, 6],
  [-20, -12, 10, 30, 8, -16],
];
const mosaic = bays.flatMap((bay, row) =>
  bayBells.map((bell, column) => ({ bay, bell, kiln: bayKw[row]?.[column] ?? 0 })),
);

export const visualBoards: {
  slug: string;
  number: number;
  title: string;
  lede: string;
  charts: ChartSlot[];
}[] = [
  {
    slug: "harrow-kiln",
    number: 29,
    title: "Harrow kiln",
    lede: "One firing at the fictional Harrow kiln. The hearth swings from a banked night to a 2,480 kW peak, so the first chart is a signed log with the axis through zero. The second keeps a linear scale and breaks out the empty middle. The mosaic bins the four bays.",
    charts: [
      {
        id: "signed",
        title: "Signed log through zero",
        caption: "Hearth paints over the flue. The axis crosses zero, with minor ticks. The night band sits under the lines. Tap pins the tooltip.",
        span: "board-12",
        spec: {
          version: "1",
          id: "harrow-kiln-signed",
          type: "line",
          title: "Harrow, one firing",
          subtitle: "Hearth over flue. Signed log, constant 10.",
          theme: "soft",
          locale: "en-GB",
          data: firing,
          encoding: {
            x: { field: "hour", type: "quantitative", title: "Hour" },
            y: [
              {
                field: "flue",
                title: "Flue",
                z: 0,
                format: kw,
                scale: signedScale,
              },
              {
                field: "hearth",
                title: "Hearth",
                z: 2,
                format: kw,
                scale: signedScale,
              },
            ],
          },
          mark: { curve: "monotone", points: "always", pointSize: 3.5 },
          axes: {
            x: { title: "Hour", crosses: 0, line: { show: true, width: 1.75, color: "#6b7280" }, format: { specifier: ".0f" } },
            y: { title: "Kilowatts", minorTicks: 2, ticks: [-10, 0, 10, 100, 1000], format: kw },
          },
          legend: { position: "bottom", interactive: true },
          tooltip: {
            mode: "index",
            position: "top",
            pin: true,
            hit: 28,
            template: "{name} {value} {unit}",
            fields: [
              { field: "hearth", title: "Hearth", format: { specifier: "+,.0f" }, unit: "kW" },
              { field: "flue", title: "Flue", format: { specifier: "+,.0f" }, unit: "kW" },
            ],
          },
          animation: { duration: 640, easing: "spring" },
          annotations: [
            { type: "band", axis: "y", from: -40, to: 0, label: "Banked", z: -1 },
            { type: "marker", x: 12, y: 2480, label: "Hearth peak", dx: -8, dy: -28, z: 3 },
          ],
          size: { width: 960, height: 480, padding: { left: 84, bottom: 48 } },
          a11y: {
            alt: "The Harrow hearth is banked overnight, near minus 26 kW at hour 2, then peaks at 2,480 kW at hour 12. The flue stays under it and peaks at 96 kW.",
          },
        },
      },
      {
        id: "broken",
        title: "The empty middle, broken out",
        caption: "Same firing on a linear scale. The axis skips 200 to 1,800 kW, sits 12 px off the plot, and still crosses zero.",
        span: "board-6",
        spec: {
          version: "1",
          id: "harrow-kiln-break",
          type: "line",
          title: "Linear, with a break",
          subtitle: "The gap is 200 to 1,800 kW.",
          theme: "soft",
          locale: "en-GB",
          data: firing,
          encoding: {
            x: { field: "hour", type: "quantitative", title: "Hour" },
            y: [
              { field: "flue", title: "Flue", z: 0, format: kw, scale: linearScale },
              { field: "hearth", title: "Hearth", z: 1, format: kw, scale: linearScale },
            ],
          },
          mark: { curve: "monotone", points: "always" },
          axes: {
            x: { title: "Hour", crosses: 0, line: { show: true, width: 1.75, color: "#6b7280" }, minorTicks: 1, format: { specifier: ".0f" } },
            y: {
              title: "Kilowatts",
              offset: 12,
              minorTicks: 1,
              ticks: [-20, 0, 100, 2000, 2600],
              breaks: [{ from: 200, to: 1800 }],
              line: { show: true, width: 1.75, color: "#6b7280" },
              format: kw,
            },
          },
          legend: { position: "bottom" },
          tooltip: { mode: "index", position: "top", fields: ["hearth", "flue"] },
          size: { width: 560, height: 480, padding: { left: 72 } },
          a11y: {
            alt: "On a linear scale with a break from 200 to 1,800 kW, the Harrow hearth peak at hour 12 still reads as 2,480, and the banked night stays readable below zero.",
          },
        },
      },
      {
        id: "bays",
        title: "Four bays, binned",
        caption: "Threshold cuts at 0, 80, and 400 kW. Oak at the 14 bell is the hottest cell.",
        span: "board-6",
        spec: {
          version: "1",
          id: "harrow-kiln-bays",
          type: "heatmap",
          title: "Bays",
          subtitle: "Cuts at 0, 80, and 400 kW.",
          theme: "soft",
          locale: "en-GB",
          data: mosaic,
          encoding: {
            x: { field: "bell", title: "Bell" },
            y: { field: "bay", title: "Bay" },
            color: { field: "kiln", scale: { type: "threshold", thresholds: [0, 80, 400] } },
          },
          legend: { position: "bottom" },
          tooltip: {
            pin: true,
            hit: 24,
            template: "{bay} at {bell}: {value} {unit}",
            fields: [{ field: "kiln", title: "Kilowatts", format: { specifier: "+,.0f" }, unit: "kW" }],
          },
          size: { width: 560, height: 480 },
          a11y: {
            alt: "Oak at the 14 bell is the hottest Harrow bay, at 860 kW. Ash and Yew stay near or below zero except at the 10 and 14 bells.",
          },
        },
      },
    ],
  },
];
