import type { ChartSlot, ShowcaseSpec } from "./showcase-data.ts";

/**
 * Boards for the features that landed with annotations, core gaps, uncertainty,
 * time and data, and the web component. The places are fictional.
 */

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

const seats = [640, 610, 720, 810, 860, 940, 980, 1120, 1080, 1140, 1210, 1260];
const band80: Array<[number, number] | null> = [
  null, null, null, null, null, null, null, null,
  [980, 1180], [1000, 1280], [1040, 1360], [1080, 1440],
];
const band95: Array<[number, number] | null> = [
  null, null, null, null, null, null, null, null,
  [900, 1280], [900, 1400], [920, 1500], [960, 1580],
];

const forecastRows = months.map((month, index) => ({
  month,
  seats: seats[index],
  tightLo: band80[index]?.[0] ?? null,
  tightHi: band80[index]?.[1] ?? null,
  wideLo: band95[index]?.[0] ?? null,
  wideHi: band95[index]?.[1] ?? null,
}));

const hours = ["20:00", "21:00", "22:00", "23:00", "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"];
const lamp = [62, 66, 70, 74, 71, 68, 44, 28, 39, 58, 69, 73];

const harbours = ["Brine", "Lantern", "Moth", "Skiff"] as const;
const harbourBase: Record<(typeof harbours)[number], number> = { Brine: 18, Lantern: 14, Moth: 9, Skiff: 6 };
const nightStart = Date.parse("2026-03-08T00:00:00Z");
const nightRows = Array.from({ length: 20 }, (_, hour) => {
  const t = new Date(nightStart + hour * 3600000).toISOString();
  const wave = 1 + 0.35 * Math.sin(hour / 3);
  return harbours.map((harbour) => ({
    t,
    harbour,
    notes: Math.round(harbourBase[harbour] * wave + (hour === 8 ? 4 : 0)),
  }));
}).flat();
const nightHours = Array.from({ length: 20 }, (_, hour) => {
  const t = new Date(nightStart + hour * 3600000).toISOString();
  const notes = nightRows.filter((row) => row.t === t).reduce((sum, row) => sum + row.notes, 0);
  return { t, notes };
});

const glassMonths = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"] as const;
const glassSpan: Array<[number, number]> = [
  [10, 16], [12, 18], [14, 21], [16, 23], [18, 25], [17, 24], [15, 22], [12, 19],
];
const glassRows = glassMonths.map((month, index) => ({
  month,
  low: glassSpan[index][0],
  high: glassSpan[index][1],
}));

const assays = [
  { dish: "Blank", mean: 12.4, lo: 11.6, hi: 13.1 },
  { dish: "Brine", mean: 13.1, lo: 12.2, hi: 14.0 },
  { dish: "Kelp", mean: 14.8, lo: 13.9, hi: 15.6 },
  { dish: "Salt", mean: 18.6, lo: 17.9, hi: 19.4 },
  { dish: "Iodine", mean: 15.2, lo: 14.1, hi: 16.4 },
  { dish: "Copper", mean: 11.8, lo: 10.4, hi: 13.2 },
];
const saltDays = [
  { day: "Mon", mean: 18.2, lo: 17.4, hi: 19.0 },
  { day: "Tue", mean: 18.8, lo: 18.1, hi: 19.5 },
  { day: "Wed", mean: 17.9, lo: 17.2, hi: 18.6 },
  { day: "Thu", mean: 19.1, lo: 18.4, hi: 19.8 },
  { day: "Fri", mean: 18.6, lo: 18.0, hi: 19.2 },
];

function hallDays(): { day: string; scans: number }[] {
  const anchor = Date.parse("2026-05-02T00:00:00Z");
  const dow = new Date(anchor).getUTCDay();
  const saturday = anchor + ((6 - dow + 7) % 7) * 86400000;
  const weeks = 12;
  const start = saturday - (weeks * 7 - 1) * 86400000;
  const rows: { day: string; scans: number }[] = [];
  for (let time = start; time <= saturday; time += 86400000) {
    const date = new Date(time);
    const day = date.getUTCDay();
    const week = Math.floor((time - start) / (7 * 86400000));
    const weekend = day === 0 || day === 6;
    const festival = week === 8;
    const base = weekend ? 6 : 16;
    const lift = festival ? 14 : week > 5 ? 4 : 0;
    const wobble = ((date.getUTCDate() * 3) % 5) - 2;
    rows.push({ day: date.toISOString().slice(0, 10), scans: Math.max(2, base + lift + wobble) });
  }
  return rows;
}

const stallSpec: ShowcaseSpec = {
  version: "1",
  id: "saltwharf-jars",
  type: "combo",
  title: "Jars this month",
  subtitle: "Bars are jars out. The line is lids that came back.",
  theme: "soft",
  data: [
    { week: "W1", jars: 28, lids: 4 },
    { week: "W2", jars: 34, lids: 6 },
    { week: "W3", jars: 31, lids: 5 },
    { week: "W4", jars: 40, lids: 7 },
    { week: "W5", jars: 46, lids: 8 },
    { week: "W6", jars: 44, lids: 6 },
    { week: "W7", jars: 52, lids: 9 },
    { week: "W8", jars: 49, lids: 8 },
    { week: "W9", jars: 58, lids: 10 },
    { week: "W10", jars: 63, lids: 11 },
  ],
  encoding: {
    x: { field: "week", title: "Week" },
    y: [
      { field: "jars", mark: "bar", title: "Jars" },
      { field: "lids", mark: "line", title: "Lids" },
    ],
  },
  axes: { x: { title: "Week", ticks: 10 }, y: { title: "Count" } },
  legend: { position: "bottom", interactive: true },
  tooltip: { mode: "index", position: "top" },
  size: { width: 1040, height: 420 },
  a11y: { alt: "Jars out at Saltwharf climb from 28 in week one to 63 in week ten. Lids that came back stay between 4 and 11." },
};

const stallHtml = `<chart-kit id="saltwharf" theme="soft">
  <script type="application/json">
${JSON.stringify(stallSpec, null, 2)}
  </script>
</chart-kit>
<script type="module">
  import "@chartkitdev/element";
</script>`;

export const fourthBoards: {
  slug: string;
  number: number;
  title: string;
  lede: string;
  charts: ChartSlot[];
  stacks?: { id: string; label: string; code: string; feature: string }[];
  extraOptions?: string[];
}[] = [
  {
    slug: "pell-forecast",
    number: 19,
    title: "Pell Hall forecast",
    lede: "Seats filled at a fictional concert hall. Actuals run through August. From September the line is dashed, inside an 80% band and a wider 95% band, with a full-house shade and a callout on the best month.",
    charts: [
      {
        id: "seats",
        title: "Seats, actual then forecast",
        caption: "The dashed part starts at Today. Full house is the shaded band. August is the best month so far.",
        span: "board-12",
        spec: {
          version: "1",
          id: "pell-seats",
          type: "area-range",
          title: "Seats filled at Pell Hall",
          theme: "soft",
          locale: "en-GB",
          data: forecastRows,
          encoding: {
            x: { field: "month", title: "Month" },
            y: [
              { lo: "wideLo", hi: "wideHi", title: "95%" },
              { lo: "tightLo", hi: "tightHi", title: "80%" },
              { field: "seats", title: "Seats" },
            ],
          },
          mark: { strokeDash: true },
          axes: { x: { title: "Month" }, y: { title: "Seats" } },
          annotations: [
            { type: "rule", axis: "x", value: "Sep", label: "Today", labelPosition: "start", dash: "dashed" },
            { type: "band", axis: "y", from: 1400, to: 1580, label: "Full house", opacity: 0.14 },
            { type: "marker", x: "Aug", y: 1120, label: "Best month", dx: -108, dy: -28 },
          ],
          size: { width: 1040, height: 480 },
          a11y: { alt: "Seats filled at Pell Hall rise from 640 in January to 1,120 in August, then a dashed forecast climbs toward the full-house band, inside an 80% band and a wider 95% band." },
        },
      },
    ],
  },
  {
    slug: "carrick-lamp",
    number: 20,
    title: "Carrick lamp, overnight",
    lede: "Lamp current at a fictional lighthouse. Bars are the hourly reading, coloured when the lamp runs dim or bright. The glow line is a three-hour mean, and its points use a distinct threshold colour. A callout marks the dip at 03:00. A host slides this window with mount().append.",
    charts: [
      {
        id: "lamp",
        title: "Current through the night",
        caption: "Under 40 is the dim token. 70 and over is the bright token. The mean waits until three readings exist.",
        span: "board-12",
        spec: {
          version: "1",
          id: "carrick-lamp",
          type: "combo",
          title: "Carrick Light",
          subtitle: "Hourly current, and a three-hour mean.",
          theme: "soft",
          data: hours.map((hour, index) => ({ hour, milliamp: lamp[index] })),
          transform: [{ type: "window", field: "milliamp", size: 3, op: "mean", as: "mean" }],
          encoding: {
            x: { field: "hour", title: "Hour" },
            y: [
              { field: "milliamp", mark: "bar", title: "Reading", scale: { domain: [0, 90], nice: false } },
              { field: "mean", mark: "line", title: "Three-hour mean" },
            ],
          },
          mark: {
            glow: true,
            curve: "monotone",
            points: "always",
            colorRules: [
              { color: "positive", gte: 70 },
              { color: "negative", lt: 40 },
            ],
          },
          axes: { x: { title: "Hour" }, y: { title: "Milliamps", ticks: [0, 20, 40, 60, 80] } },
          legend: { position: "top", interactive: true },
          tooltip: { mode: "index", position: "top" },
          annotations: [{ type: "marker", x: "03:00", y: 28, label: "Lamp dipped", dx: 18, dy: -42 }],
          size: { width: 1040, height: 500 },
          a11y: { alt: "Carrick lamp current stays near 70 milliamps, dips to 28 at 03:00, then recovers by 07:00. Bars are the reading. The glow line is a three-hour mean." },
        },
      },
    ],
  },
  {
    slug: "spring-notes",
    number: 21,
    title: "Notes across the spring-forward",
    lede: "Radio notes at four fictional harbours, labelled in America/New_York. The hour axis skips 02:00 when the clocks spring forward. The bars sum the same notes by harbour.",
    charts: [
      {
        id: "hours",
        title: "One night, New York time",
        caption: "The shaded hour is the spring-forward. There is no 02:00 tick.",
        span: "board-12",
        spec: {
          version: "1",
          id: "spring-hours",
          type: "line",
          title: "Notes, New York time",
          subtitle: "March 8, 2026. America/New_York.",
          theme: "soft",
          locale: "en-US",
          timezone: "America/New_York",
          data: nightHours,
          encoding: {
            x: { field: "t", type: "temporal", title: "Hour" },
            y: { field: "notes", title: "Notes" },
          },
          mark: { curve: "monotone", points: "always" },
          axes: {
            x: {
              title: "Hour",
              bands: [{ from: "2026-03-08T06:00:00Z", to: "2026-03-08T07:00:00Z", label: "Spring forward" }],
            },
            y: { title: "Notes" },
          },
          tooltip: { mode: "index", position: "top" },
          size: { width: 1040, height: 400 },
          a11y: { alt: "Harbour notes through the New York spring-forward. The axis skips 02:00 and shades the missing hour." },
        },
      },
      {
        id: "harbours",
        title: "The same notes, by harbour",
        caption: "Aggregate sums every hour, then the bars sort from the busiest harbour.",
        span: "board-12",
        spec: {
          version: "1",
          id: "spring-harbours",
          type: "bar",
          title: "Notes by harbour",
          subtitle: "Summed from the same night.",
          theme: "soft",
          data: nightRows,
          transform: [{ type: "aggregate", group: "harbour", field: "notes", op: "sum", as: "notes" }],
          sort: { by: "value", order: "descending" },
          encoding: {
            x: { field: "harbour", title: "Harbour" },
            y: { field: "notes", title: "Notes" },
            color: "harbour",
          },
          mark: { labels: true, labelPosition: "top" },
          axes: { x: { title: "Harbour" }, y: { title: "Notes" } },
          legend: { position: "bottom" },
          size: { width: 1040, height: 380 },
          a11y: { alt: "Brine sends the most notes over the night, then Lantern, Moth, and Skiff." },
        },
      },
    ],
  },
  {
    slug: "glasshouse",
    number: 22,
    title: "Glasshouse spans",
    lede: "Monthly low and high inside a fictional glasshouse at Pell, in degrees Celsius. Each bar floats across the span. A linear season line fits the midpoint, and July is called out at 25 degrees.",
    charts: [
      {
        id: "span",
        title: "Low and high",
        caption: "Ticks sit on 10, 14, 18, 22, and 26 degrees, so March's 10 and July's 25 stay inside the end gridlines. The season line is the linear fit.",
        span: "board-12",
        spec: {
          version: "1",
          id: "glass-span",
          type: "bar-range",
          title: "Pell glasshouse",
          subtitle: "Low to high, with a linear season line through the midpoint.",
          theme: "soft",
          locale: "en-GB",
          data: glassRows,
          encoding: {
            x: { field: "month", title: "Month" },
            low: "low",
            high: { field: "high", scale: { domain: [8, 28], nice: false } },
          },
          axes: {
            x: { title: "Month" },
            y: { title: "Degrees", ticks: [10, 14, 18, 22, 26], format: { style: "number", suffix: "°C" } },
          },
          annotations: [
            { type: "trendline", method: "linear", label: "Season line" },
            { type: "marker", x: "Jul", y: 25, label: "July high", dx: 16, dy: -24 },
          ],
          size: { width: 1040, height: 480 },
          a11y: { alt: "The Pell glasshouse runs from 10 to 16 degrees in March and from 18 to 25 degrees in July. A linear season line leans upward through the midpoint." },
        },
      },
    ],
  },
  {
    slug: "salt-assay",
    number: 23,
    title: "Salt assay",
    lede: "A fictional bench. Six dishes, each a mean with a whisker across three runs. A dashed rule marks the blank, and a callout sits on Salt, clear of that line. The second figure follows Salt across the week.",
    charts: [
      {
        id: "dishes",
        title: "Six dishes",
        caption: "The bar is the mean. The whisker is the low and high of three runs. Salt is the high dish.",
        span: "board-12",
        spec: {
          version: "1",
          id: "salt-dishes",
          type: "errorbar",
          title: "Dish means",
          subtitle: "Three runs. Salt sits clear of the blank.",
          theme: "soft",
          data: assays,
          encoding: {
            x: { field: "dish", title: "Dish" },
            y: { field: "mean", title: "Mean", scale: { domain: [0, 24], nice: false } },
            low: "lo",
            high: "hi",
          },
          mark: { error: "bar" },
          axes: { x: { title: "Dish" }, y: { title: "Reading", ticks: [0, 6, 12, 18, 24] } },
          annotations: [
            { type: "rule", axis: "y", value: 12.4, label: "Blank", dash: "dashed", labelPosition: "center" },
            { type: "marker", x: "Salt", y: 19.4, label: "Clear of the blank", dx: 18, dy: -28 },
          ],
          size: { width: 1040, height: 480 },
          a11y: { alt: "Salt averages 18.6, with a whisker from 17.9 to 19.4. The blank averages 12.4. A callout marks Salt clear of that line. Copper is the lowest dish." },
        },
      },
      {
        id: "week",
        title: "Salt across the week",
        caption: "The same dish, one point and whisker each weekday. Thursday carries the highest morning.",
        span: "board-12",
        spec: {
          version: "1",
          id: "salt-week",
          type: "errorbar",
          title: "Salt, Monday to Friday",
          subtitle: "The same dish, one whisker each weekday.",
          theme: "soft",
          data: saltDays,
          encoding: {
            x: { field: "day", title: "Day" },
            y: { field: "mean", title: "Mean", scale: { domain: [16, 21], nice: false } },
            low: "lo",
            high: "hi",
          },
          mark: { error: "point", pointSize: 5 },
          axes: { x: { title: "Day" }, y: { title: "Reading", ticks: [16, 17, 18, 19, 20, 21] } },
          annotations: [{ type: "marker", x: "Thu", y: 19.8, label: "Highest morning", dx: -12, dy: -26 }],
          size: { width: 1040, height: 440 },
          a11y: { alt: "Salt stays between 17.2 and 19.8 across the week. Thursday is the highest morning." },
        },
      },
    ],
  },
  {
    slug: "marlow-hall",
    number: 24,
    title: "Marlow Hall, twelve weeks",
    lede: "A fictional hall. Twelve weeks of door scans, split at 8 and 18, beside the path from enquiry to a seat. The funnel legend sits on top.",
    charts: [
      {
        id: "days",
        title: "Door scans",
        caption: "Quiet under 8, a middle band, then 18 and over. Week nine is the festival.",
        span: "board-6",
        spec: {
          version: "1",
          id: "marlow-days",
          type: "heatmap",
          title: "Door scans",
          theme: "soft",
          locale: "en-GB",
          data: hallDays(),
          encoding: {
            x: { field: "day", type: "temporal" },
            color: { field: "scans", title: "Scans", scale: { type: "threshold", thresholds: [8, 18] } },
          },
          mark: { layout: "calendar", weeks: 12 },
          size: { width: 520, height: 368 },
          a11y: { alt: "Door scans at Marlow Hall over twelve weeks. Weekends stay under 8, weekdays sit higher, and one festival week passes 18." },
        },
      },
      {
        id: "path",
        title: "From enquiry to a seat",
        caption: "The legend names each stage. Most of the drop is between enquiry and a hold.",
        span: "board-6",
        spec: {
          version: "1",
          id: "marlow-path",
          type: "funnel",
          theme: "soft",
          data: [
            { stage: "Enquiry", people: 240 },
            { stage: "Hold", people: 150 },
            { stage: "Paid", people: 96 },
            { stage: "Seated", people: 81 },
          ],
          encoding: { x: "stage", y: "people" },
          legend: { position: "top" },
          mark: { shape: "trapezoid" },
          size: { width: 520, height: 420 },
          a11y: { alt: "240 enquiries become 150 holds, 96 paid, and 81 seated." },
        },
      },
    ],
  },
  {
    slug: "saltwharf",
    number: 25,
    title: "Saltwharf, in the page",
    lede: "A fictional stall, drawn from the same spec a plain HTML page puts inside <chart-kit>. The element reads the child JSON script. The package is @chartkitdev/element.",
    charts: [
      {
        id: "jars",
        title: "Jars and lids",
        caption: "The chart above is that spec. The block below is the element a static page would ship.",
        span: "board-12",
        spec: stallSpec,
      },
    ],
    stacks: [{ id: "element", label: "HTML", code: stallHtml, feature: "framework.webcomponent" }],
    extraOptions: ["framework.webcomponent"],
  },
];
