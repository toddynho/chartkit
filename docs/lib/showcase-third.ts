import type { ChartSlot } from "./showcase-data.ts";

const jolts = Array.from({ length: 48 }, (_, index) => {
  const hour = index + 1;
  const ridge = Math.round(6 + 5 * Math.sin(index / 4.5) + (index % 11 === 0 ? 18 : 0));
  const cinder = Math.round(4 + 3 * Math.cos(index / 5.5) + (index % 9 === 4 ? 11 : 0));
  return { hour, ridge, cinder };
});

const joltSizes = [4, 7, 9, 11, 12, 14, 15, 16, 18, 19, 22, 24, 27, 31, 36, 8, 13, 17, 21, 28, 6, 10, 20, 33];

const watches = ["Dawn", "Noon", "Dusk", "Night"];
const stations = ["Ridge", "Cinder", "Vent"];
const stationCounts = [4, 9, 6, 3, 7, 14, 11, 5, 2, 8, 12, 4];
const stationSwing = [-4, 1, -1, -6, 2, 8, 5, -2, -5, 3, 6, -3];

export const volcanoCharts: ChartSlot[] = [
  {
    id: "trace",
    title: "Forty-eight hours at Ashmere",
    caption: "Two stations, joined with straight segments. The legend sits on the right, and export is on the chart.",
    span: "board-12",
    spec: {
      version: "1",
      id: "ashmere-trace",
      type: "line",
      theme: "soft",
      data: jolts,
      encoding: {
        x: { field: "hour", type: "quantitative", title: "Hour" },
        y: [
          { field: "ridge", title: "Ridge" },
          { field: "cinder", title: "Cinder" },
        ],
      },
      mark: { sampling: "lttb", glow: true, curve: "linear" },
      axes: { x: { title: "Hour" }, y: { title: "Jolts" } },
      legend: { position: "right", orient: "vertical", interactive: true },
      tooltip: { mode: "index", position: "top", crosshair: true },
      interaction: { zoom: "x", pan: true, export: ["png", "svg", "csv"] },
      size: { width: 980, height: 440 },
      a11y: { alt: "Ridge jolts spike every few hours and stay above Cinder across the two days." },
    },
  },
  {
    id: "spikes",
    title: "Ridge, as spikes",
    caption: "The same first day, one spike per hour.",
    span: "board-6",
    spec: {
      version: "1",
      id: "ashmere-spikes",
      type: "spike",
      theme: "soft",
      data: jolts.slice(0, 16).map((row) => ({ hour: row.hour, jolts: row.ridge })),
      encoding: { x: { field: "hour", type: "quantitative" }, y: "jolts" },
      mark: { baseline: 0 },
      axes: { x: { title: "Hour" }, y: { title: "Jolts" } },
      size: { width: 640, height: 280 },
      a11y: { alt: "Ridge stays in single digits, then jumps above twenty once in the first sixteen hours." },
    },
  },
  {
    id: "sizes",
    title: "How big the jolts were",
    caption: "Eight bins.",
    span: "board-6",
    spec: {
      version: "1",
      id: "ashmere-sizes",
      type: "histogram",
      theme: "soft",
      data: joltSizes.map((size) => ({ size })),
      encoding: { x: { field: "size", title: "Size" } },
      mark: { bins: 8 },
      axes: { x: { title: "Size" }, y: { title: "Jolts" } },
      size: { width: 640, height: 280 },
      a11y: { alt: "Most jolts are mid-sized. A few pass thirty." },
    },
  },
  {
    id: "counts",
    title: "Counts by station",
    caption: "A sequential teal ramp. Missing watches stay hatched.",
    span: "board-6",
    spec: {
      version: "1",
      id: "ashmere-counts",
      type: "heatmap",
      theme: "soft",
      data: stations.flatMap((station, stationIndex) =>
        watches.flatMap((watch, watchIndex) => {
          if (station === "Vent" && watch === "Dawn") return [];
          return [{ station, watch, jolts: stationCounts[stationIndex * watches.length + watchIndex] }];
        }),
      ),
      encoding: {
        x: "watch",
        y: "station",
        color: { field: "jolts", title: "Jolts", scale: { type: "sequential", scheme: "teal" } },
      },
      mark: { layout: "grid" },
      size: { width: 640, height: 320 },
      a11y: { alt: "Cinder at noon is the busiest cell. Vent at dawn has no reading, so that cell stays hatched." },
    },
  },
  {
    id: "swing",
    title: "Swing from a quiet hour",
    caption: "Diverging around zero. Orange is above the quiet hour, the other end is below.",
    span: "board-6",
    spec: {
      version: "1",
      id: "ashmere-swing",
      type: "heatmap",
      theme: "soft",
      data: stations.flatMap((station, stationIndex) =>
        watches.map((watch, watchIndex) => ({
          station,
          watch,
          swing: stationSwing[stationIndex * watches.length + watchIndex],
        })),
      ),
      encoding: {
        x: "watch",
        y: "station",
        color: { field: "swing", title: "Swing", scale: { type: "diverging", midpoint: 0 } },
      },
      mark: { layout: "grid" },
      size: { width: 640, height: 320 },
      a11y: { alt: "Cinder at noon sits well above a quiet hour. Vent at dawn sits below it." },
    },
  },
];

export const launchCharts: ChartSlot[] = [
  {
    id: "years",
    title: "Northline, year by year",
    caption: "Events, and two stretches of work.",
    span: "board-12",
    spec: {
      version: "1",
      id: "northline-years",
      type: "timeline",
      theme: "soft",
      data: [
        { label: "Pad leased", date: "2019-03-04", kind: "event" },
        { label: "First static fire", date: "2020-11-12", kind: "event" },
        { label: "Sounding flights", start: "2021-04-01", end: "2023-09-01", kind: "period" },
        { label: "Cinder crew", date: "2024-01-18", kind: "event" },
        { label: "Stack rehearsals", start: "2024-06-01", end: "2026-02-01", kind: "period" },
        { label: "Window booked", date: "2026-05-20", kind: "event" },
      ],
      encoding: { x: "label", open: "start", close: "end", color: "kind" },
      size: { width: 980, height: 360 },
      a11y: { alt: "Northline leased a pad in 2019, flew sounding missions through 2023, and booked a window for May 2026." },
    },
  },
  {
    id: "lanes",
    title: "Prep lanes for Cinder",
    caption: "Sections, a finished lane, and a liftoff milestone.",
    span: "board-12",
    spec: {
      version: "1",
      id: "cinder-lanes",
      type: "gantt",
      theme: "soft",
      data: [
        { id: "tank", task: "Proof the tank", section: "Prep", start: "2026-04-06", end: "2026-04-17", progress: 1, status: "done" },
        { id: "avionics", task: "Fit avionics", section: "Prep", start: "2026-04-13", end: "2026-04-28", progress: 0.7, status: "active", depends: "tank" },
        { id: "stack", task: "Stack the stages", section: "Stack", start: "2026-04-22", end: "2026-05-08", progress: 0.4, status: "active", depends: "tank" },
        { id: "dress", task: "Dress rehearsal", section: "Stack", start: "2026-05-06", end: "2026-05-15", progress: 0.15, status: "crit", depends: "stack" },
        { id: "lift", task: "Liftoff", section: "Fire", start: "2026-05-20", milestone: true, status: "crit", depends: "dress" },
      ],
      encoding: { x: "task", y: "section", open: "start", close: "end", color: "status", source: "id", target: "depends" },
      size: { width: 980, height: 420 },
      a11y: { alt: "The tank is proved. Dress rehearsal is the critical lane, and liftoff is marked for 20 May." },
    },
  },
  {
    id: "funnel",
    title: "From pitch to liftoff",
    caption: "How many proposals are still in the queue.",
    span: "board-8",
    spec: {
      version: "1",
      id: "northline-funnel",
      type: "funnel",
      theme: "soft",
      data: [
        { stage: "Pitch", count: 48 },
        { stage: "Shortlist", count: 22 },
        { stage: "Pad slot", count: 9 },
        { stage: "Stacked", count: 4 },
        { stage: "Away", count: 1 },
      ],
      encoding: { x: "stage", y: "count" },
      legend: { position: "top" },
      size: { width: 720, height: 380 },
      a11y: { alt: "Forty-eight pitches narrow to one vehicle that leaves the pad." },
    },
  },
  {
    id: "fee",
    title: "Pad fee",
    caption: "The booked window, in euros.",
    span: "board-4",
    spec: {
      version: "1",
      id: "northline-fee",
      type: "kpi",
      theme: "soft",
      locale: "en-IE",
      metric: {
        label: "Pad fee",
        value: 186000,
        delta: 0.04,
        format: { style: "currency", currency: "EUR", decimals: 0 },
      },
      data: [140, 152, 161, 174, 186],
      size: { width: 420, height: 240 },
      a11y: { alt: "The pad fee is 186,000 euros, up 4 percent on the last window." },
    },
  },
  {
    id: "readiness",
    title: "Readiness",
    caption: "The needle and the figure both read 72. The dot on the arc is the target at 80.",
    span: "board-6",
    spec: {
      version: "1",
      id: "cinder-readiness",
      type: "gauge",
      theme: "soft",
      metric: {
        label: "Readiness",
        value: 72,
        min: 0,
        max: 100,
        target: 80,
        format: { style: "number", decimals: 0 },
        bands: [
          { from: 0, to: 50, color: "negative", label: "Hold" },
          { from: 50, to: 100, color: "positive", label: "Go" },
        ],
      },
      size: { width: 420, height: 250 },
      a11y: { alt: "The needle reads 72. A dot on the arc marks the target at 80." },
    },
  },
  {
    id: "checks",
    title: "Checks closed",
    caption: "Seven of ten cards on the wall.",
    span: "board-6",
    spec: {
      version: "1",
      id: "cinder-checks",
      type: "progress-ring",
      theme: "soft",
      metric: { label: "Checks", value: 7, min: 0, max: 10, format: { style: "number", decimals: 0 } },
      size: { width: 240, height: 240 },
      a11y: { alt: "Seven of ten pre-flight checks are closed." },
    },
  },
];

export const discoveryCharts: ChartSlot[] = [
  {
    id: "bets",
    title: "Where the next build sits",
    caption: "Light effort to the left, loud delight up.",
    span: "board-6",
    spec: {
      version: "1",
      id: "quill-bets",
      type: "quadrant",
      theme: "soft",
      quadrants: ["Do it now", "Worth the wait", "Leave it", "Later"],
      data: [
        { name: "Ink search", x: 0.22, y: 0.8 },
        { name: "Pinned lines", x: 0.34, y: 0.62 },
        { name: "Shared notebook", x: 0.78, y: 0.84 },
        { name: "Offline pad", x: 0.7, y: 0.3 },
        { name: "Side notes", x: 0.28, y: 0.26 },
      ],
      encoding: {
        x: { field: "x", title: "Light effort|Heavy effort", scale: { domain: [0, 1] } },
        y: { field: "y", title: "Quiet delight|Loud delight", scale: { domain: [0, 1] } },
      },
      size: { width: 640, height: 460 },
      a11y: { alt: "Ink search is a quick win. A shared notebook is heavy and still delightful. Offline pad is heavy and quiet." },
    },
  },
  {
    id: "sets",
    title: "What notebooks combine",
    caption: "Three-set areas are approximate.",
    span: "board-6",
    spec: {
      version: "1",
      id: "quill-sets",
      type: "venn",
      theme: "soft",
      data: [
        { set: "Ink", size: 640 },
        { set: "Pins", size: 410 },
        { set: "Search", size: 280 },
        { set: "Ink+Pins", size: 190 },
        { set: "Ink+Search", size: 120 },
        { set: "Pins+Search", size: 70 },
        { set: "Ink+Pins+Search", size: 36 },
      ],
      encoding: { x: "set", y: "size" },
      size: { width: 640, height: 460 },
      a11y: { alt: "Ink, pins, and search overlap. Thirty-six notebooks use all three." },
    },
  },
  {
    id: "first-note",
    title: "First note",
    caption: "Scores from 1 to 5, and who was in the room.",
    span: "board-8",
    spec: {
      version: "1",
      id: "quill-journey",
      type: "journey",
      theme: "soft",
      data: [
        { section: "Open", step: "Name the notebook", score: 5, actors: "Writer" },
        { section: "Open", step: "Pick a cover", score: 4, actors: "Writer" },
        { section: "Write", step: "First line", score: 5, actors: "Writer" },
        { section: "Write", step: "Find it again", score: 2, actors: "Writer" },
        { section: "Share", step: "Send a page", score: 3, actors: "Writer, Reader" },
        { section: "Share", step: "See a reply", score: 4, actors: "Writer, Reader" },
      ],
      encoding: { x: "step", y: "score", series: "section", color: "actors" },
      size: { width: 760, height: 420 },
      a11y: { alt: "Naming and the first line score 5. Finding the note again drops to 2, then a reply recovers it." },
    },
  },
  {
    id: "rooms",
    title: "Scores by room",
    caption: "The legend is on the left.",
    span: "board-12",
    spec: {
      version: "1",
      id: "quill-rooms",
      type: "bar",
      theme: "soft",
      data: [
        { room: "Open", novice: 4, steady: 5 },
        { room: "Write", novice: 3, steady: 5 },
        { room: "Share", novice: 2, steady: 4 },
      ],
      encoding: {
        x: "room",
        y: [
          { field: "novice", title: "Novice" },
          { field: "steady", title: "Steady" },
        ],
      },
      legend: { position: "left", orient: "vertical" },
      axes: { x: { title: "Room" }, y: { title: "Score", ticks: [0, 2, 4, 6] } },
      size: { width: 880, height: 360 },
      a11y: { alt: "Steady writers score higher in every room. The gap is widest on Share." },
    },
  },
];

const beds = ["Fern", "Ivy", "Moss", "Sage", "Rue", "Yarrow", "Nettle", "Cress"];

export const nurseryCharts: ChartSlot[] = [
  {
    id: "beds",
    title: "Eight beds, two at a time",
    caption: "The legend shows two beds, then the next page. Export sits above the chart.",
    span: "board-12",
    spec: {
      version: "1",
      id: "low-fern-beds",
      type: "line",
      theme: "soft",
      data: [
        { week: "W1", fern: 6, ivy: 8, moss: 4, sage: 10, rue: 3, yarrow: 7, nettle: 5, cress: 9 },
        { week: "W2", fern: 9, ivy: 11, moss: 6, sage: 12, rue: 5, yarrow: 10, nettle: 7, cress: 14 },
        { week: "W3", fern: 14, ivy: 13, moss: 9, sage: 11, rue: 8, yarrow: 16, nettle: 8, cress: 18 },
        { week: "W4", fern: 18, ivy: 13, moss: 15, sage: 14, rue: 12, yarrow: 19, nettle: 11, cress: 20 },
        { week: "W5", fern: 22, ivy: 16, moss: 17, sage: 18, rue: 16, yarrow: 19, nettle: 15, cress: 21 },
        { week: "W6", fern: 24, ivy: 19, moss: 18, sage: 21, rue: 20, yarrow: 23, nettle: 17, cress: 22 },
      ],
      encoding: {
        x: "week",
        y: beds.map((bed) => ({ field: bed.toLowerCase(), title: bed })),
      },
      legend: { position: "right", orient: "vertical", maxRows: 2, title: "Beds", interactive: true },
      tooltip: { mode: "index", position: "top" },
      interaction: { select: "series", export: ["png", "svg", "csv"] },
      axes: { x: { title: "Week" }, y: { title: "Trays" } },
      size: { width: 980, height: 420 },
      a11y: { alt: "Eight beds of trays over six weeks. Most climb, sage dips in week 3, and ivy pauses before it climbs again." },
    },
  },
  {
    id: "inside",
    title: "Cuttings this week",
    caption: "The legend sits in the clear space above the bars.",
    span: "board-6",
    spec: {
      version: "1",
      id: "low-fern-cuttings",
      type: "bar",
      theme: "soft",
      data: [
        { week: "W4", fern: 12, ivy: 9 },
        { week: "W5", fern: 15, ivy: 11 },
        { week: "W6", fern: 14, ivy: 13 },
      ],
      encoding: {
        x: "week",
        y: [
          { field: "fern", title: "Fern", scale: { domain: [0, 24] } },
          { field: "ivy", title: "Ivy" },
        ],
      },
      legend: { position: "inside", anchor: "top-right", orient: "vertical" },
      axes: { x: { title: "Week" }, y: { title: "Cuttings" } },
      size: { width: 640, height: 360 },
      a11y: { alt: "Fern cuttings lead in week 5. Ivy catches up in week 6." },
    },
  },
  {
    id: "mix",
    title: "What left the yard",
    caption: "A palette on the slices, so the theme switch keeps these colours.",
    span: "board-6",
    spec: {
      version: "1",
      id: "low-fern-mix",
      type: "donut",
      theme: "soft",
      data: [
        { kind: "Fern", trays: 86 },
        { kind: "Ivy", trays: 54 },
        { kind: "Sage", trays: 41 },
        { kind: "Rue", trays: 28 },
      ],
      encoding: { x: "kind", y: "trays" },
      mark: { palette: ["#0f6e56", "#c45c26", "#1d4e89", "#5b4b8a"] },
      legend: { position: "bottom", values: true, interactive: true },
      interaction: { select: "point" },
      size: { width: 560, height: 360 },
      a11y: { alt: "Fern is the largest share of trays that left the yard, then ivy, sage, and rue." },
    },
  },
  {
    id: "pots",
    title: "Pot size and leaf count",
    caption: "Each point is one bench.",
    span: "board-8",
    spec: {
      version: "1",
      id: "low-fern-pots",
      type: "scatter",
      theme: "soft",
      data: [
        { pot: 9, leaves: 14, bench: "North" },
        { pot: 12, leaves: 22, bench: "North" },
        { pot: 15, leaves: 18, bench: "South" },
        { pot: 11, leaves: 11, bench: "South" },
        { pot: 18, leaves: 27, bench: "North" },
        { pot: 8, leaves: 9, bench: "South" },
      ],
      encoding: {
        x: { field: "pot", title: "Pot, cm" },
        y: { field: "leaves", title: "Leaves" },
        color: "bench",
      },
      legend: { position: "bottom" },
      axes: { x: { title: "Pot, cm" }, y: { title: "Leaves" } },
      size: { width: 720, height: 360 },
      a11y: { alt: "Larger pots tend to carry more leaves. The north bench holds the fullest pot." },
    },
  },
  {
    id: "water",
    title: "Water used",
    caption: "Litres against a mark of 80.",
    span: "board-4",
    spec: {
      version: "1",
      id: "low-fern-water",
      type: "gauge",
      theme: "soft",
      metric: {
        label: "Litres",
        value: 64,
        min: 0,
        max: 100,
        target: 80,
        format: { style: "number", decimals: 0 },
      },
      size: { width: 420, height: 280 },
      a11y: { alt: "The yard used 64 litres, under the mark of 80." },
    },
  },
];

const baskets = Array.from({ length: 12 * 7 }, (_, index) => {
  const day = new Date(Date.UTC(2026, 3, 6 + index)).toISOString().slice(0, 10);
  return { day, baskets: 1 + ((index * 5 + (index % 4) * 3) % 16) };
});

export const gardenCharts: ChartSlot[] = [
  {
    id: "kilos",
    title: "Kilos off the beds",
    caption: "Padding is set by hand. Export is on this chart too.",
    span: "board-8",
    spec: {
      version: "1",
      id: "marrow-kilos",
      type: "line",
      theme: "soft",
      locale: "en-GB",
      data: [
        { week: "W1", kilos: 18 },
        { week: "W2", kilos: 24 },
        { week: "W3", kilos: 21 },
        { week: "W4", kilos: 33 },
        { week: "W5", kilos: 29 },
        { week: "W6", kilos: 41 },
        { week: "W7", kilos: 36 },
        { week: "W8", kilos: 44 },
      ],
      encoding: { x: "week", y: { field: "kilos", title: "Kilos" } },
      legend: { position: "bottom" },
      axes: { x: { title: "Week" }, y: { title: "Kilos" } },
      tooltip: { position: "top", fields: [{ field: "kilos", title: "Kilos" }] },
      interaction: { export: ["png", "svg", "csv"] },
      size: { width: 760, height: 360, minHeight: 280, padding: { top: 28, right: 24, bottom: 36, left: 56 } },
      a11y: { alt: "Kilos off the beds rise from 18 to the mid-forties, with a dip in week 5." },
    },
  },
  {
    id: "takings",
    title: "Stall takings",
    caption: "Pounds, with whole-number ticks.",
    span: "board-4",
    spec: {
      version: "1",
      id: "marrow-takings",
      type: "kpi",
      theme: "soft",
      locale: "en-GB",
      metric: {
        label: "Takings",
        value: 640,
        delta: 0.12,
        format: { style: "currency", currency: "GBP", decimals: 0 },
      },
      data: [42, 48, 51, 64],
      size: { width: 420, height: 240 },
      a11y: { alt: "The stall took 640 pounds, up 12 percent." },
    },
  },
  {
    id: "crops",
    title: "Takings by crop",
    caption: "Labels use the same pound format as the axis.",
    span: "board-12",
    spec: {
      version: "1",
      id: "marrow-crops",
      type: "bar",
      theme: "soft",
      locale: "en-GB",
      data: [
        { crop: "Marrow", pounds: 220 },
        { crop: "Beet", pounds: 140 },
        { crop: "Kale", pounds: 160 },
        { crop: "Leek", pounds: 120 },
      ],
      encoding: {
        x: "crop",
        y: { field: "pounds", format: { style: "currency", currency: "GBP", decimals: 0 } },
      },
      mark: { labels: true, labelPosition: "top" },
      axes: {
        x: { title: "Crop" },
        y: { title: "Pounds", format: { style: "currency", currency: "GBP", decimals: 0 } },
      },
      tooltip: {
        position: "top",
        fields: [{ field: "pounds", title: "Pounds", format: { style: "currency", currency: "GBP", decimals: 0 } }],
      },
      size: { width: 720, height: 380 },
      a11y: { alt: "Marrow brings in 220 pounds. Leek is the smallest stall taking, at 120." },
    },
  },
  {
    id: "targets",
    title: "Against the bed marks",
    caption: "Value, a mark, and three bands.",
    span: "board-12",
    spec: {
      version: "1",
      id: "marrow-targets",
      type: "bullet",
      theme: "soft",
      data: [
        { crop: "Marrow", kilos: 44, mark: 40, thin: 20, fair: 36, full: 50 },
        { crop: "Beet", kilos: 22, mark: 28, thin: 12, fair: 24, full: 36 },
        { crop: "Kale", kilos: 31, mark: 30, thin: 14, fair: 26, full: 40 },
      ],
      encoding: { x: "crop", y: "kilos", target: "mark" },
      mark: { ranges: ["thin", "fair", "full"] },
      size: { width: 880, height: 240 },
      a11y: { alt: "Marrow and kale are past their marks. Beet is still short." },
    },
  },
  {
    id: "share",
    title: "Share of the baskets",
    caption: "Four crops.",
    span: "board-6",
    spec: {
      version: "1",
      id: "marrow-share",
      type: "donut",
      theme: "soft",
      data: [
        { crop: "Marrow", baskets: 86 },
        { crop: "Beet", baskets: 40 },
        { crop: "Kale", baskets: 54 },
        { crop: "Leek", baskets: 32 },
      ],
      encoding: { x: "crop", y: "baskets" },
      legend: { position: "bottom", values: true },
      size: { width: 520, height: 340 },
      a11y: { alt: "Marrow fills the largest share of baskets, then kale, beet, and leek." },
    },
  },
  {
    id: "calendar",
    title: "Baskets, twelve weeks",
    caption: "Threshold colours: quiet under 6, busy from 12.",
    span: "board-6",
    spec: {
      version: "1",
      id: "marrow-calendar",
      type: "heatmap",
      theme: "soft",
      data: baskets,
      encoding: {
        x: { field: "day", type: "temporal" },
        color: { field: "baskets", title: "Baskets", scale: { type: "threshold", thresholds: [6, 12] } },
      },
      mark: { layout: "calendar", weeks: 12 },
      a11y: { alt: "Basket counts run for twelve weeks from early April, split at 6 and 12." },
    },
  },
];

export const sheetSources: { id: string; title: string; caption: string; span: "board-12"; source: string; width?: number; height?: number }[] = [
  {
    id: "pie",
    title: "Kiln hours",
    caption: "A pie fence. showData puts the numbers in the legend.",
    span: "board-12",
    source: `pie showData
    title Kiln hours
    "Bisque" : 18
    "Glaze" : 27
    "Cool" : 11`,
    width: 520,
    height: 460,
  },
  {
    id: "xychart",
    title: "Thrown and fired",
    caption: "An xychart fence becomes a combo.",
    span: "board-12",
    source: `xychart-beta
    title Thrown and fired
    x-axis [Mon, Tue, Wed, Thu, Fri]
    y-axis "Pots"
    bar "Thrown" [8, 11, 9, 14, 12]
    line "Fired" [6, 9, 10, 11, 13]`,
  },
  {
    id: "sankey",
    title: "Clay to the shelf",
    caption: "A sankey fence. The return is not in this one.",
    span: "board-12",
    source: `sankey-beta
Clay,Wheel,14
Wheel,Kiln,9
Wheel,Reclaim,5
Kiln,Shelf,7
Kiln,Shard,2`,
    height: 480,
  },
  {
    id: "radar",
    title: "A potter's week",
    caption: "Two curves, with a max of 10.",
    span: "board-12",
    source: `radar-beta
    title A potter week
    axis throw["Throw"], glaze["Glaze"], fire["Fire"], mend["Mend"]
    curve ada["Ada"]{8, 5, 7, 3}
    curve bo["Bo"]{4, 9, 6, 8}
    max 10
    showLegend true`,
  },
  {
    id: "treemap",
    title: "Clay on the rack",
    caption: "A treemap fence, two families.",
    span: "board-12",
    source: `treemap-beta
"Stone"
    "Speck" : 22
    "Ash" : 14
"Earthen"
    "Red" : 18
    "Sand" : 9`,
  },
  {
    id: "venn",
    title: "Wheel, glaze, kiln",
    caption: "A venn fence. Overlaps are approximate.",
    span: "board-12",
    source: `venn-beta
    title Wheel, glaze, kiln
    set Wheel:70
    set Glaze:54
    set Kiln:46
    union Wheel,Glaze:22
    union Wheel,Kiln:16
    union Glaze,Kiln:12
    union Wheel,Glaze,Kiln:8`,
    height: 480,
  },
];

export const thirdBoardMeta: {
  slug: string;
  number: number;
  title: string;
  lede: string;
  charts: ChartSlot[];
}[] = [
  {
    slug: "volcano",
    number: 2,
    title: "Volcano watch",
    lede: "Jolts at Ashmere, a fictional peak. A short trace with zoom and export, then sequential and diverging colour.",
    charts: volcanoCharts,
  },
  {
    slug: "launch",
    number: 6,
    title: "Space launch manifest",
    lede: "Northline, a fictional pad. Years, prep lanes, a narrowing queue, a euro fee, and two readiness marks.",
    charts: launchCharts,
  },
  {
    slug: "discovery",
    number: 10,
    title: "Product discovery map",
    lede: "Research for Quill, a fictional notebook. Effort against delight, three overlapping sets, and a first-note journey.",
    charts: discoveryCharts,
  },
  {
    slug: "nursery",
    number: 12,
    title: "Nursery theme studio",
    lede: "Low Fern, a fictional yard. The switcher restyles the board. One legend pages, one sits inside the plot, and the donut keeps its own palette.",
    charts: nurseryCharts,
  },
  {
    slug: "garden",
    number: 18,
    title: "Printable field report",
    lede: "Marrow Lane, a fictional garden. Pounds on the stall, a padded line you can export, and twelve weeks of baskets in threshold colour.",
    charts: gardenCharts,
  },
];

export const sheetMeta = {
  slug: "mermaid-sheet",
  number: 17,
  title: "Mermaid sheet",
  lede: "Six fences the game-launch board does not show: pie, xychart, sankey, radar, treemap, and venn. Each card is new pottery data.",
  sources: sheetSources,
};
