/** The second six showcase boards. Data stays off the eval themes. */

import type { ChartSlot } from "./showcase-data.ts";

const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12", "W13", "W14", "W15", "W16"];
const kilometres = [28, 32, 30, 36, 40, 38, 44, 42, 48, 46, 52, 50, 55, 48, 58, 36];
const pace = [6.4, 6.3, 6.3, 6.1, 6.0, 6.0, 5.8, 5.8, 5.7, 5.6, 5.5, 5.5, 5.4, 5.4, 5.2, 5.1];

const training = weeks.map((week, index) => ({ week, km: kilometres[index], pace: pace[index] }));

const effort = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"].flatMap((week, index) => [
  { week, band: "Easy", minutes: 70 + index * 4 },
  { week, band: "Steady", minutes: 24 + (index % 3) * 4 },
  { week, band: "Hard", minutes: 8 + (index % 4) * 3 },
]);

export const marathonCharts: ChartSlot[] = [
  {
    id: "block",
    title: "Kilometres and pace",
    caption: "Bars are kilometres. The diamond line is pace, on a reversed right axis, so a faster week sits higher. Click a legend name to hide a series.",
    span: "board-12",
    spec: {
      version: "1",
      id: "marathon-block",
      type: "combo",
      theme: "soft",
      locale: "en-GB",
      data: training,
      encoding: {
        x: "week",
        y: [
          { field: "km", title: "Kilometres", mark: "bar" },
          {
            field: "pace",
            title: "Pace",
            mark: "line",
            axis: "y2",
            pointShape: "diamond",
            pointSize: 5,
            scale: { reverse: true },
          },
        ],
      },
      axes: {
        x: { title: "Week", titlePosition: "start" },
        y: { title: "Kilometres", ticks: [20, 40, 60], titlePosition: "end" },
        y2: { title: "Minutes per km", position: "right", ticks: [5, 5.5, 6, 6.5], titlePosition: "end" },
      },
      mark: { points: "always", labelEnds: "ends" },
      legend: { position: "bottom", interactive: true },
      tooltip: { mode: "index", position: "top", crosshair: true, crosshairLabel: true },
      interaction: { select: "series" },
      size: { width: 980, height: 460, padding: { left: 72, right: 88 } },
      a11y: { alt: "Kilometres climb through the block and ease in the last week. Pace falls from 6.4 to 5.1 minutes per kilometre, drawn upward because the right axis is reversed." },
    },
  },
  {
    id: "effort",
    title: "Easy, steady, and hard",
    caption: "Stacked minutes. Click a legend name to hide a band.",
    span: "board-8",
    spec: {
      version: "1",
      id: "marathon-effort",
      type: "bar",
      theme: "soft",
      data: effort,
      encoding: { x: "week", y: "minutes", series: "band" },
      mark: { stack: "stack" },
      axes: { x: { title: "Week" }, y: { title: "Minutes", ticks: [40, 80, 120] } },
      legend: { position: "bottom", interactive: true },
      tooltip: { mode: "index", position: "top", crosshair: true },
      interaction: { select: "series" },
      size: { width: 760, height: 380 },
      a11y: { alt: "Easy minutes are the largest band each week, with a smaller hard band on top." },
    },
  },
  {
    id: "radar",
    title: "Early block and late block",
    caption: "Two spokes sets. Late sits further out on hills and stride.",
    span: "board-4",
    spec: {
      version: "1",
      id: "marathon-radar",
      type: "radar",
      theme: "soft",
      data: [
        { spoke: "Hills", early: 4, late: 7 },
        { spoke: "Stride", early: 5, late: 8 },
        { spoke: "Rest", early: 6, late: 7 },
        { spoke: "Fuel", early: 5, late: 6 },
        { spoke: "Sleep", early: 7, late: 7 },
      ],
      encoding: {
        x: "spoke",
        y: [
          { field: "early", title: "Early" },
          { field: "late", title: "Late" },
        ],
      },
      legend: { position: "bottom", interactive: true },
      size: { width: 420, height: 380 },
      a11y: { alt: "The late block scores higher on hills and stride. Sleep is level." },
    },
  },
  {
    id: "spark",
    title: "This week's kilometres",
    caption: "Seven days, no axes.",
    span: "board-12",
    spec: {
      version: "1",
      id: "marathon-spark",
      type: "sparkline",
      theme: "soft",
      data: [6, 8, 0, 10, 7, 14, 5],
      size: { width: 960, height: 120 },
      a11y: { alt: "The week has a rest day, then a long day of 14 kilometres." },
    },
  },
];

const crates = [
  { variety: "Pippin", grams: 168, hours: 4.2, brix: 12.4 },
  { variety: "Pippin", grams: 174, hours: 5.1, brix: 13.1 },
  { variety: "Pippin", grams: 181, hours: 6.4, brix: 13.8 },
  { variety: "Pippin", grams: 159, hours: 3.6, brix: 11.6 },
  { variety: "Pippin", grams: 188, hours: 7.2, brix: 14.2 },
  { variety: "Russet", grams: 142, hours: 3.1, brix: 14.8 },
  { variety: "Russet", grams: 151, hours: 4.4, brix: 15.4 },
  { variety: "Russet", grams: 136, hours: 2.8, brix: 14.1 },
  { variety: "Russet", grams: 158, hours: 5.5, brix: 16.2 },
  { variety: "Russet", grams: 147, hours: 4.0, brix: 15.0 },
  { variety: "Ashmead", grams: 192, hours: 6.8, brix: 13.2 },
  { variety: "Ashmead", grams: 205, hours: 8.1, brix: 14.6 },
  { variety: "Ashmead", grams: 184, hours: 5.9, brix: 12.8 },
  { variety: "Ashmead", grams: 210, hours: 8.6, brix: 15.1 },
  { variety: "Ashmead", grams: 176, hours: 4.8, brix: 12.2 },
];

const weightBinStart = 135;
const weightBinWidth = 10;
const weightBinCount = 8;
const weightBins = Array.from({ length: weightBinCount }, (_, index) => {
  const start = weightBinStart + index * weightBinWidth;
  const end = start + weightBinWidth;
  const last = index === weightBinCount - 1;
  const count = crates.filter((row) => row.grams >= start && (last ? row.grams <= end : row.grams < end)).length;
  return { grams: String(start), crates: count };
});

export const orchardCharts: ChartSlot[] = [
  {
    id: "sun",
    title: "Sun hours and sugar",
    caption: "Each diamond is one crate. Colour is the variety, and the dot grows with weight. The vertical scale is not nicened, with a little room past the crates.",
    span: "board-6",
    spec: {
      version: "1",
      id: "orchard-sun",
      type: "scatter",
      theme: "soft",
      data: crates,
      encoding: {
        x: { field: "hours", title: "Sun hours", scale: { padding: 0.08 } },
        y: { field: "brix", title: "Brix", scale: { nice: false, padding: { min: 0.08, max: 0.14 } } },
        size: { field: "grams", range: [8, 28] },
        color: "variety",
      },
      mark: { pointShape: "diamond", pointSize: 6 },
      axes: { x: { title: "Sun hours" }, y: { title: "Brix", ticks: [12, 13, 14, 15, 16] } },
      legend: { position: "bottom", interactive: true },
      tooltip: {
        position: "top",
        fields: [
          { field: "variety", title: "Variety" },
          { field: "brix", title: "Brix" },
          { field: "grams", title: "Grams" },
        ],
      },
      interaction: { select: "point" },
      size: { width: 560, height: 420 },
      a11y: { alt: "Russet crates are sweeter at fewer sun hours. Ashmead crates are heavier and sit toward more sun." },
    },
  },
  {
    id: "weight-rule",
    title: "Crate weight, coloured by a rule",
    caption: "Under 150 grams is the negative token. 180 grams and over is the positive token. The labels are the weights.",
    span: "board-6",
    spec: {
      version: "1",
      id: "orchard-weight-rule",
      type: "bar",
      theme: "soft",
      data: [
        { crate: "P2", grams: 142 },
        { crate: "R1", grams: 151 },
        { crate: "A4", grams: 176 },
        { crate: "P5", grams: 188 },
        { crate: "A2", grams: 205 },
      ],
      encoding: { x: "crate", y: "grams" },
      mark: {
        labels: true,
        labelPosition: "top",
        colorRules: [
          { test: "positive", color: "positive", gte: 180 },
          { color: "negative", lt: 150 },
        ],
      },
      axes: { x: { title: "Crate" }, y: { title: "Grams", ticks: [0, 100, 200] } },
      tooltip: { position: "top", fields: [{ field: "grams", title: "Grams" }] },
      interaction: { select: "point" },
      size: { width: 560, height: 420 },
      a11y: { alt: "Two crates are under 150 grams and two are at or over 180. The heaviest is 205 grams." },
    },
  },
  {
    id: "spread",
    title: "Weight by variety",
    caption: "A box for each variety.",
    span: "board-6",
    spec: {
      version: "1",
      id: "orchard-spread",
      type: "boxplot",
      theme: "soft",
      data: crates.map((row) => ({ variety: row.variety, grams: row.grams })),
      encoding: { x: "variety", y: "grams" },
      axes: { x: { title: "Variety" }, y: { title: "Grams" } },
      size: { width: 560, height: 340 },
      a11y: { alt: "Ashmead weighs more than Russet. Pippin sits between them." },
    },
  },
  {
    id: "bins",
    title: "How the weights fall",
    caption: "Eight bins of 10 grams, from 135. The bin from 195 to 205 is empty.",
    span: "board-6",
    spec: {
      version: "1",
      id: "orchard-bins",
      type: "histogram",
      theme: "soft",
      data: weightBins,
      encoding: {
        x: { field: "grams", title: "Grams" },
        y: { field: "crates", title: "Crates" },
      },
      axes: { x: { title: "Grams" }, y: { title: "Crates" } },
      size: { width: 560, height: 340 },
      a11y: { alt: "Crate weights run from 136 to 210 grams, in eight bins of 10 grams starting at 135. The bin from 195 to 205 grams is empty." },
    },
  },
];

function holdCalendar(): { day: string; holds: number }[] {
  const start = Date.UTC(2026, 0, 5);
  const rows = [];
  for (let i = 0; i < 16 * 7; i += 1) {
    const day = new Date(start + i * 86400000).toISOString().slice(0, 10);
    rows.push({ day, holds: 4 + ((i * 5 + (i % 6) * 3) % 18) });
  }
  return rows;
}

export const libraryCharts: ChartSlot[] = [
  {
    id: "shelves",
    title: "Loans by shelf",
    caption: "A real pie. Names sit outside the slices on leader lines, in a palette set on this chart.",
    span: "board-6",
    spec: {
      version: "1",
      id: "library-shelves",
      type: "pie",
      theme: "soft",
      locale: "en-GB",
      data: [
        { shelf: "Folio", loans: 840 },
        { shelf: "Atlas", loans: 310 },
        { shelf: "Verse", loans: 460 },
        { shelf: "Cookery", loans: 520 },
        { shelf: "Scores", loans: 190 },
        { shelf: "Maps", loans: 260 },
      ],
      encoding: { x: "shelf", y: "loans" },
      mark: {
        labels: true,
        labelPosition: "outside",
        palette: ["#0f6e56", "#c45c26", "#1d4e89", "#a15c38", "#5b4b8a", "#8a6a2f"],
      },
      legend: { position: "bottom", interactive: true },
      tooltip: { position: "top", fields: [{ field: "loans", title: "Loans" }] },
      interaction: { select: "point" },
      size: { width: 560, height: 440 },
      a11y: { alt: "Folio is the largest shelf of loans, then cookery and verse. Scores is the smallest." },
    },
  },
  {
    id: "branches",
    title: "Loans by branch",
    caption: "Long branch names wrap instead of colliding. The number sits at the end of each bar.",
    span: "board-6",
    spec: {
      version: "1",
      id: "library-branches",
      type: "bar",
      theme: "soft",
      locale: "en-GB",
      data: [
        { branch: "Old Quay Reading Room", loans: 980 },
        { branch: "Hill School Cupboard", loans: 640 },
        { branch: "Lantern Annex", loans: 720 },
        { branch: "Mill Lane Stacks", loans: 540 },
      ],
      encoding: { x: "branch", y: "loans" },
      mark: { orientation: "horizontal", labels: true, labelPosition: "right" },
      axes: { x: { title: "Branch", labelWidth: 96, labelLines: 2 }, y: { title: "Loans" } },
      tooltip: { position: "top", fields: [{ field: "loans", title: "Loans" }] },
      interaction: { select: "point" },
      size: { width: 560, height: 440, padding: { left: 120 } },
      a11y: { alt: "The Old Quay Reading Room lent the most. Mill Lane Stacks lent the least of the four branches." },
    },
  },
  {
    id: "holds",
    title: "Holds across sixteen weeks",
    caption: "One cell per day.",
    span: "board-12",
    spec: {
      version: "1",
      id: "library-holds",
      type: "heatmap",
      theme: "soft",
      data: holdCalendar(),
      encoding: {
        x: { field: "day", type: "temporal", title: "Day" },
        color: { field: "holds", title: "Holds" },
      },
      mark: { layout: "calendar", weeks: 16 },
      size: { width: 980, height: 340 },
      a11y: { alt: "Daily holds over sixteen weeks stay in a band from a quiet day to a busy day, with no empty week." },
    },
  },
  {
    id: "out",
    title: "Out now",
    caption: "A count and a short sparkline.",
    span: "board-4",
    spec: {
      version: "1",
      id: "library-out",
      type: "kpi",
      theme: "soft",
      locale: "en-GB",
      metric: { label: "Out now", value: 1280, delta: 0.04, format: { style: "compact", decimals: 1 } },
      data: [40, 42, 38, 44, 41, 46, 45],
      size: { width: 420, height: 240 },
      a11y: { alt: "1.3 thousand items are out, up 4 percent, and the week ends higher than it starts." },
    },
  },
  {
    id: "daily",
    title: "Holds this week",
    caption: "A mini area, still with axes.",
    span: "board-8",
    spec: {
      version: "1",
      id: "library-daily",
      type: "mini-area",
      theme: "soft",
      data: [18, 22, 16, 25, 21, 14, 19],
      size: { width: 640, height: 200 },
      a11y: { alt: "Holds peak midweek and dip before the last day." },
    },
  },
];

export const ferryCharts: ChartSlot[] = [
  {
    id: "flows",
    title: "Where the boats go, and come back",
    caption: "Brine feeds Kelp and Cairn. Kelp sends some boats straight back, and Skiff and Dock return the rest. Those three bows cross above the columns.",
    span: "board-12",
    spec: {
      version: "1",
      id: "ferry-flows",
      type: "sankey",
      theme: "soft",
      data: [
        { from: "Brine", to: "Kelp", crossings: 180 },
        { from: "Brine", to: "Cairn", crossings: 100 },
        { from: "Kelp", to: "Skiff", crossings: 120 },
        { from: "Kelp", to: "Brine", crossings: 60 },
        { from: "Cairn", to: "Dock", crossings: 70 },
        { from: "Cairn", to: "Skiff", crossings: 30 },
        { from: "Skiff", to: "Brine", crossings: 150 },
        { from: "Dock", to: "Brine", crossings: 70 },
      ],
      encoding: { source: "from", target: "to", y: "crossings" },
      size: { width: 980, height: 560 },
      a11y: { alt: "280 crossings leave Brine. Kelp returns 60 directly. Skiff returns 150 and Dock returns 70, so every boat comes back." },
    },
  },
  {
    id: "routes",
    title: "Crossings by route",
    caption: "Click a bar to mark that route.",
    span: "board-8",
    spec: {
      version: "1",
      id: "ferry-routes",
      type: "bar",
      theme: "soft",
      data: [
        { route: "Brine–Kelp", crossings: 180 },
        { route: "Skiff–Brine", crossings: 150 },
        { route: "Kelp–Skiff", crossings: 120 },
        { route: "Brine–Cairn", crossings: 100 },
        { route: "Cairn–Dock", crossings: 70 },
        { route: "Dock–Brine", crossings: 70 },
        { route: "Kelp–Brine", crossings: 60 },
        { route: "Cairn–Skiff", crossings: 30 },
      ],
      encoding: { x: "route", y: "crossings" },
      mark: { labels: true, labelPosition: "top" },
      axes: { x: { title: "Route", rotate: -28 }, y: { title: "Crossings" } },
      tooltip: { position: "top", fields: [{ field: "crossings", title: "Crossings" }] },
      interaction: { select: "point" },
      size: { width: 760, height: 400 },
      a11y: { alt: "Brine to Kelp has the most crossings. Cairn to Skiff has the fewest." },
    },
  },
  {
    id: "week",
    title: "This week's boats",
    caption: "A count and the shape of the week.",
    span: "board-4",
    spec: {
      version: "1",
      id: "ferry-week",
      type: "kpi",
      theme: "soft",
      locale: "en-GB",
      metric: { label: "Left Brine", value: 280, delta: 0.04, format: { style: "number" } },
      data: [22, 28, 24, 30, 26, 34, 22],
      size: { width: 420, height: 240 },
      a11y: { alt: "280 boats left Brine, up 4 percent on last week." },
    },
  },
  {
    id: "season",
    title: "Weekly crossings",
    caption: "Square markers. Click a point to mark a week, or a legend name to hide a series.",
    span: "board-12",
    spec: {
      version: "1",
      id: "ferry-season",
      type: "line",
      theme: "soft",
      data: [
        { week: "W1", brine: 70, skiff: 40 },
        { week: "W2", brine: 74, skiff: 42 },
        { week: "W3", brine: 68, skiff: 48 },
        { week: "W4", brine: 80, skiff: 44 },
        { week: "W5", brine: 86, skiff: 51 },
        { week: "W6", brine: 82, skiff: 55 },
        { week: "W7", brine: 90, skiff: 52 },
        { week: "W8", brine: 88, skiff: 58 },
      ],
      encoding: {
        x: "week",
        y: [
          { field: "brine", title: "Out of Brine", pointShape: "square", pointSize: 5 },
          { field: "skiff", title: "Into Skiff", pointShape: "triangle", pointSize: 5 },
        ],
      },
      mark: { points: "always" },
      axes: { x: { title: "Week" }, y: { title: "Crossings", position: "left" } },
      legend: { position: "bottom", interactive: true },
      tooltip: { mode: "index", position: "top", crosshair: true, crosshairLabel: true },
      interaction: { select: "point" },
      size: { width: 980, height: 380 },
      a11y: { alt: "Crossings out of Brine stay above crossings into Skiff, and both rise across the eight weeks." },
    },
  },
];

export const harbourCharts: ChartSlot[] = [
  {
    id: "index",
    title: "Greywick container index",
    caption: "Twelve sessions of a fictional index, with volume underneath. Not a listed ticker.",
    span: "board-12",
    spec: {
      version: "1",
      id: "harbour-index",
      type: "candlestick",
      theme: "soft",
      locale: "en-GB",
      data: [
        { day: "2026-03-02", open: 102, high: 108, low: 99, close: 106, volume: 420 },
        { day: "2026-03-03", open: 106, high: 110, low: 104, close: 105, volume: 380 },
        { day: "2026-03-04", open: 105, high: 107, low: 98, close: 100, volume: 510 },
        { day: "2026-03-05", open: 100, high: 104, low: 96, close: 103, volume: 460 },
        { day: "2026-03-06", open: 103, high: 112, low: 102, close: 111, volume: 540 },
        { day: "2026-03-09", open: 111, high: 114, low: 107, close: 109, volume: 390 },
        { day: "2026-03-10", open: 109, high: 111, low: 101, close: 102, volume: 610 },
        { day: "2026-03-11", open: 102, high: 106, low: 100, close: 105, volume: 440 },
        { day: "2026-03-12", open: 105, high: 109, low: 103, close: 108, volume: 400 },
        { day: "2026-03-13", open: 108, high: 116, low: 107, close: 115, volume: 580 },
        { day: "2026-03-16", open: 115, high: 117, low: 110, close: 112, volume: 470 },
        { day: "2026-03-17", open: 112, high: 113, low: 106, close: 107, volume: 520 },
      ],
      encoding: {
        x: { field: "day", type: "temporal" },
        open: "open",
        high: "high",
        low: "low",
        close: "close",
        volume: "volume",
      },
      axes: { x: { title: "Session" }, y: { title: "Index" } },
      tooltip: { position: "top" },
      size: { width: 980, height: 460 },
      a11y: { alt: "The fictional Greywick index rises from about 102 to a high near 117, then closes the last session lower." },
    },
  },
  {
    id: "voyage",
    title: "One voyage, step by step",
    caption: "Hover a bar for the amount. Click it to mark that step.",
    span: "board-8",
    spec: {
      version: "1",
      id: "harbour-voyage",
      type: "waterfall",
      theme: "soft",
      locale: "en-GB",
      data: [
        { step: "Open", amount: 8400, total: true },
        { step: "Crane", amount: 2100 },
        { step: "Berth", amount: 1600 },
        { step: "Cloth", amount: -900 },
        { step: "Close", amount: 11200, total: true },
      ],
      encoding: {
        x: "step",
        y: { field: "amount", format: { style: "currency", currency: "GBP", decimals: 0 } },
      },
      axes: { x: { title: "Step" }, y: { title: "Pounds" } },
      tooltip: { position: "top", fields: [{ field: "amount", title: "Amount", format: { style: "currency", currency: "GBP", decimals: 0 } }] },
      interaction: { select: "point" },
      size: { width: 720, height: 380 },
      a11y: { alt: "The voyage opens at 8,400 pounds. Crane and berth add, cloth subtracts, and the close is 11,200." },
    },
  },
  {
    id: "close",
    title: "Close",
    caption: "The last step, as a figure.",
    span: "board-4",
    spec: {
      version: "1",
      id: "harbour-close",
      type: "kpi",
      theme: "soft",
      locale: "en-GB",
      metric: {
        label: "Close",
        value: 11200,
        delta: 0.33,
        format: { style: "currency", currency: "GBP", decimals: 0 },
      },
      data: [8.4, 10.5, 12.1, 11.2, 11.2],
      size: { width: 420, height: 240 },
      a11y: { alt: "The voyage closes at 11,200 pounds, up 33 percent from the open." },
    },
  },
];

const mornings = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon 2"];

export const wetlandCharts: ChartSlot[] = [
  {
    id: "counts",
    title: "Birds at three hides",
    caption: "Circle, square, and triangle markers. Mire is dashed. Arrow keys walk the points. Click a marker to mark it, or a legend name to hide a hide.",
    span: "board-12",
    spec: {
      version: "1",
      id: "wetland-counts",
      type: "line",
      theme: "soft",
      data: mornings.map((morning, index) => ({
        morning,
        reed: [12, 14, 11, 18, 16, 22, 19, 15][index],
        sedge: [8, 9, 7, 11, 10, 13, 12, 9][index],
        mire: [5, 6, 8, 7, 9, 8, 11, 10][index],
      })),
      encoding: {
        x: "morning",
        y: [
          { field: "reed", title: "Reed", pointShape: "circle", pointSize: 6 },
          { field: "sedge", title: "Sedge", pointShape: "square", pointSize: 6 },
          { field: "mire", title: "Mire", pointShape: "triangle", pointSize: 6, dash: "dashed" },
        ],
      },
      mark: { points: "always", labelEnds: "ends" },
      axes: { x: { title: "Morning" }, y: { title: "Birds", ticks: [5, 10, 15, 20] } },
      legend: { position: "bottom", interactive: true },
      tooltip: { mode: "index", position: "top", crosshair: true, crosshairLabel: true },
      interaction: { select: "point" },
      a11y: {
        alt: "Reed counts the most birds and peaks on Saturday. Sedge stays in the middle. Mire, drawn dashed with triangles, rises toward the second Monday.",
        description: "Counts are from one watcher at each hide. The table lists the same eight mornings.",
        keyboard: true,
        dataTable: true,
      },
      size: { width: 980, height: 440, padding: { left: 64 } },
    },
  },
  {
    id: "species",
    title: "Saturday at Reed",
    caption: "Value labels on the bars. Click a bar to mark a bird.",
    span: "board-6",
    spec: {
      version: "1",
      id: "wetland-species",
      type: "bar",
      theme: "soft",
      data: [
        { bird: "Heron", count: 4 },
        { bird: "Knot", count: 9 },
        { bird: "Pipit", count: 6 },
        { bird: "Teal", count: 3 },
      ],
      encoding: { x: "bird", y: "count" },
      mark: { labels: true, labelPosition: "top" },
      axes: { x: { title: "Bird" }, y: { title: "Count", ticks: [0, 5, 10] } },
      tooltip: { position: "top", fields: [{ field: "count", title: "Count" }] },
      interaction: { select: "point" },
      size: { width: 560, height: 340 },
      a11y: { alt: "On Saturday at Reed, knot outnumber the other birds. Teal is the smallest count." },
    },
  },
  {
    id: "hides",
    title: "Week totals",
    caption: "One bar per hide, labelled.",
    span: "board-6",
    spec: {
      version: "1",
      id: "wetland-hides",
      type: "bar",
      theme: "soft",
      data: [
        { hide: "Reed", birds: 127 },
        { hide: "Sedge", birds: 79 },
        { hide: "Mire", birds: 64 },
      ],
      encoding: { x: "hide", y: "birds", color: "hide" },
      mark: { labels: true, labelPosition: "top" },
      axes: { x: { title: "Hide" }, y: { title: "Birds" } },
      legend: { position: "bottom", interactive: true },
      tooltip: { position: "top", fields: [{ field: "birds", title: "Birds" }] },
      interaction: { select: "point" },
      size: { width: 560, height: 340 },
      a11y: { alt: "Reed totals 127 birds, Sedge 79, and Mire 64. Each hide has its own colour." },
    },
  },
];

export const nextBoardMeta: { slug: string; number: number; title: string; lede: string; charts: ChartSlot[] }[] = [
  {
    slug: "marathon",
    number: 7,
    title: "Marathon training block",
    lede: "Sixteen weeks for a fictional runner. Kilometres sit on the left, pace sits on a reversed right axis, and the early and late blocks share a radar.",
    charts: marathonCharts,
  },
  {
    slug: "orchard",
    number: 4,
    title: "Orchard harvest almanac",
    lede: "Three fictional apple varieties. Sun hours against sugar, crate weight coloured by a threshold, then the spread and the bins.",
    charts: orchardCharts,
  },
  {
    slug: "library",
    number: 9,
    title: "Library lending year",
    lede: "A fictional town library. Shelf loans are a pie with leader lines, branch names wrap, and sixteen weeks of holds fill a calendar.",
    charts: libraryCharts,
  },
  {
    slug: "ferry",
    number: 15,
    title: "Ferry network",
    lede: "Crossings among five fictional harbours. Every boat that leaves Brine comes back, and the return ribbons bow over the columns.",
    charts: ferryCharts,
  },
  {
    slug: "harbour",
    number: 8,
    title: "Harbour freight desk",
    lede: "A synthetic container index for the port of Greywick, then the pounds of one voyage from open to close. Hover a step, or click it to mark it.",
    charts: harbourCharts,
  },
  {
    slug: "wetlands",
    number: 14,
    title: "Accessibility tour",
    lede: "Bird counts at three fictional wetland hides. Each hide has its own marker, one line is dashed, and the keyboard and a data table sit on the same spec.",
    charts: wetlandCharts,
  },
];
