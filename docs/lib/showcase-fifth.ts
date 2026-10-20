import type { ChartSlot } from "./showcase-data.ts";

/**
 * Boards for nested hierarchy: a treemap and a sunburst of the same tree,
 * then a sunburst beside a ranked bar, then a treemap beside a short series.
 * The places are fictional.
 */

const litres = { field: "value", title: "Litres", format: { style: "number", suffix: " L" } };
const hoursFormat = { field: "value", title: "Hours", format: { style: "number", suffix: " h" } };

const press = [
  {
    name: "North",
    children: [
      { name: "Russet", children: [{ name: "Ash", value: 980 }, { name: "Elm", value: 820 }] },
      { name: "Pippin", children: [{ name: "Beech", value: 760 }, { name: "Holly", value: 540 }] },
    ],
  },
  {
    name: "River",
    children: [
      { name: "Bramley", children: [{ name: "Oak", value: 1120 }, { name: "Yew", value: 640 }] },
      { name: "Cox", children: [{ name: "Lime", value: 580 }, { name: "Alder", value: 420 }] },
    ],
  },
  {
    name: "Walled",
    children: [
      { name: "Quince", children: [{ name: "Maple", value: 610 }, { name: "Birch", value: 390 }] },
      { name: "Medlar", children: [{ name: "Cedar", value: 340 }, { name: "Thorn", value: 260 }] },
    ],
  },
];

const yard = [
  {
    name: "Skiff",
    children: [
      {
        name: "Cobble",
        children: [
          { name: "Keel", value: 48 },
          { name: "Plank", value: 36 },
          { name: "Paint", value: 18 },
        ],
      },
      { name: "Punt", children: [{ name: "Ribs", value: 22 }, { name: "Oars", value: 14 }] },
    ],
  },
  {
    name: "Lantern",
    children: [
      { name: "Ketch", children: [{ name: "Deck", value: 40 }, { name: "Rig", value: 28 }] },
      { name: "Yawl", children: [{ name: "Hull", value: 26 }, { name: "Sail", value: 16 }] },
    ],
  },
  {
    name: "Moth",
    children: [{ name: "Pram", children: [{ name: "Seams", value: 20 }, { name: "Glue", value: 12 }] }],
  },
];

const boats = [
  { boat: "Cobble", hours: 102 },
  { boat: "Ketch", hours: 68 },
  { boat: "Yawl", hours: 42 },
  { boat: "Punt", hours: 36 },
  { boat: "Pram", hours: 32 },
];

const mornings = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;
const quay = [48, 52, 44, 60, 58, 72, 66, 50, 46, 54, 42, 48];
const hill = [36, 40, 38, 48, 44, 56, 52, 42, 46, 50, 58, 50];
const lane = [28, 32, 30, 36, 40, 48, 44, 34, 38, 42, 52, 56];
const marketDays = mornings.map((morning, index) => ({
  morning,
  quay: quay[index],
  hill: hill[index],
  lane: lane[index],
}));

const market = [
  {
    name: "Quay",
    children: [
      { name: "Salt", children: [{ name: "Oats", value: 200 }, { name: "Honey", value: 160 }] },
      { name: "Kelp", children: [{ name: "Bread", value: 160 }, { name: "Cheese", value: 120 }] },
    ],
  },
  {
    name: "Hill",
    children: [
      { name: "Wool", children: [{ name: "Yarn", value: 180 }, { name: "Felt", value: 140 }] },
      { name: "Tin", children: [{ name: "Spoons", value: 140 }, { name: "Lamps", value: 100 }] },
    ],
  },
  {
    name: "Lane",
    children: [
      { name: "Paper", children: [{ name: "Cards", value: 150 }, { name: "Maps", value: 120 }] },
      { name: "Ink", children: [{ name: "Black", value: 120 }, { name: "Red", value: 90 }] },
    ],
  },
];

const crates = { field: "value", title: "Crates", format: { style: "number" } };

export const fifthBoards: {
  slug: string;
  number: number;
  title: string;
  lede: string;
  charts: ChartSlot[];
}[] = [
  {
    slug: "pell-press",
    number: 26,
    title: "Pell press cellar",
    lede: "A fictional cider cellar at Pell. The same nested litres — orchard, apple, then cask — drawn as a treemap with the amount on each tile, and as a sunburst with the cellar total in the hole.",
    charts: [
      {
        id: "tiles",
        title: "Litres by cask",
        caption: "North, River, and Walled. Oak, under Bramley, is the largest cask at 1,120 litres.",
        span: "board-6",
        spec: {
          version: "1",
          id: "pell-press-tiles",
          type: "treemap",
          title: "Pell press",
          subtitle: "Orchard, apple, then cask.",
          theme: "soft",
          locale: "en-GB",
          data: press,
          encoding: { x: "name", y: litres },
          legend: { position: "bottom" },
          size: { width: 560, height: 640 },
          a11y: { alt: "The Pell press holds 7,460 litres. North and River are the larger orchards. Oak, a Bramley cask, is the single largest tile at 1,120 litres." },
        },
      },
      {
        id: "rings",
        title: "The same cellar, in rings",
        caption: "The inner ring is the orchard, then the apple, then the cask. The hole states the total.",
        span: "board-6",
        spec: {
          version: "1",
          id: "pell-press-rings",
          type: "sunburst",
          title: "The same cellar",
          subtitle: "Three rings, one total.",
          theme: "soft",
          locale: "en-GB",
          data: press,
          encoding: { x: "name", y: litres },
          mark: { innerRadius: 0.42 },
          legend: { position: "bottom" },
          size: { width: 560, height: 640 },
          a11y: { alt: "A sunburst of the same 7,460 litres. North, River, and Walled wrap the hole, then each apple, then each cask." },
        },
      },
    ],
  },
  {
    slug: "carrick-yard",
    number: 27,
    title: "Carrick yard, winter hours",
    lede: "Winter work at a fictional boatyard. The sunburst splits hours by shed, boat, and job. The bars are those same hours rolled up to the boat and ranked.",
    charts: [
      {
        id: "sheds",
        title: "Shed, boat, job",
        caption: "Skiff, Lantern, and Moth. Cobble takes the longest job list.",
        span: "board-6",
        spec: {
          version: "1",
          id: "carrick-yard-sheds",
          type: "sunburst",
          title: "Winter hours",
          subtitle: "Shed, then boat, then job.",
          theme: "soft",
          locale: "en-GB",
          data: yard,
          encoding: { x: "name", y: hoursFormat },
          mark: { innerRadius: 0.4 },
          legend: { position: "bottom" },
          size: { width: 560, height: 620 },
          a11y: { alt: "280 hours of winter work. Cobble in the Skiff shed is the largest boat, then Ketch in the Lantern shed." },
        },
      },
      {
        id: "boats",
        title: "The same hours, by boat",
        caption: "Cobble is 102 hours. Pram is 32. The ranking is the sunburst, folded to one name per boat.",
        span: "board-6",
        spec: {
          version: "1",
          id: "carrick-yard-boats",
          type: "bar",
          title: "Hours by boat",
          subtitle: "Ranked from the same winter.",
          theme: "soft",
          locale: "en-GB",
          data: boats,
          sort: { by: "value", order: "descending" },
          encoding: {
            x: { field: "boat", title: "Boat" },
            y: { field: "hours", title: "Hours", format: { style: "number", suffix: " h" }, scale: { domain: [0, 120], nice: false } },
            color: "boat",
          },
          mark: { orientation: "horizontal", labels: true, labelPosition: "right" },
          axes: { x: { title: "Boat" }, y: { title: "Hours", ticks: [0, 30, 60, 90, 120] } },
          legend: false,
          size: { width: 560, height: 480 },
          a11y: { alt: "Cobble 102 hours, Ketch 68, Yawl 42, Punt 36, and Pram 32." },
        },
      },
    ],
  },
  {
    slug: "brine-market",
    number: 28,
    title: "Brine market, twelve mornings",
    lede: "A fictional quayside market. Twelve mornings of crates, split by row, stall, and good in the treemap. The lines are those same mornings, one series per row.",
    charts: [
      {
        id: "stalls",
        title: "Where the crates sat",
        caption: "Quay is 640 crates, Hill 560, Lane 480. Oats is the largest single good.",
        span: "board-6",
        spec: {
          version: "1",
          id: "brine-market-stalls",
          type: "treemap",
          title: "Crates in the market",
          subtitle: "Row, stall, then good.",
          theme: "soft",
          locale: "en-GB",
          data: market,
          encoding: { x: "name", y: crates },
          legend: { position: "bottom" },
          size: { width: 560, height: 620 },
          a11y: { alt: "1,680 crates across Quay, Hill, and Lane. Oats at the Salt stall is the largest good, at 200 crates." },
        },
      },
      {
        id: "mornings",
        title: "The same crates, by morning",
        caption: "Morning 6 is Quay's busiest, at 72. Lane climbs toward the end of the twelve.",
        span: "board-6",
        spec: {
          version: "1",
          id: "brine-market-mornings",
          type: "line",
          title: "Crates each morning",
          subtitle: "Quay, Hill, and Lane.",
          theme: "soft",
          locale: "en-GB",
          data: marketDays,
          encoding: {
            x: { field: "morning", title: "Morning" },
            y: [
              { field: "quay", title: "Quay", scale: { domain: [0, 90], nice: false } },
              { field: "hill", title: "Hill" },
              { field: "lane", title: "Lane" },
            ],
          },
          mark: { curve: "monotone", points: "always" },
          axes: {
            x: { title: "Morning" },
            y: { title: "Crates", ticks: [0, 20, 40, 60, 80] },
          },
          legend: { position: "top", interactive: true },
          tooltip: { mode: "index", position: "top" },
          annotations: [{ type: "marker", x: "6", y: 72, label: "Quay peak", dx: 12, dy: -28 }],
          size: { width: 560, height: 480 },
          a11y: { alt: "Quay leads most mornings and peaks at 72 on morning 6. Hill stays in the middle. Lane starts near 28 and finishes at 56." },
        },
      },
    ],
  },
];
