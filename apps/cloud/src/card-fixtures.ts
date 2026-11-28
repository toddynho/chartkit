/** Specs the share-card tests and the PR's before and after images are drawn from. */
export const CARD_SPECS = {
  /** Authored at 960×540, with a subtitle and a value label on every bar. */
  bar: {
    version: "1",
    type: "bar",
    title: "Signups by month",
    subtitle: "New accounts, first half of 2026",
    data: [
      { month: "January", signups: 1240 },
      { month: "February", signups: 1810 },
      { month: "March", signups: 1530 },
      { month: "April", signups: 2090 },
      { month: "May", signups: 2420 },
      { month: "June", signups: 2260 },
    ],
    encoding: { x: "month", y: { field: "signups", type: "quantitative", title: "Signups" } },
    mark: { labels: true },
    size: { width: 960, height: 540 },
    locale: "en-US",
    a11y: { alt: "Signups rose from 1,240 in January to a peak of 2,420 in May." },
  },
  /** No size: the library picks one. Two series, so the card carries a legend. */
  line: {
    version: "1",
    type: "line",
    title: "API throughput vs latency",
    subtitle: "Last 6 hours, 1-hour buckets",
    data: [
      { time: "2026-10-16T05:00:00Z", requests: 1200, latency: 180 },
      { time: "2026-10-16T06:00:00Z", requests: 1800, latency: 200 },
      { time: "2026-10-16T07:00:00Z", requests: 2100, latency: 240 },
      { time: "2026-10-16T08:00:00Z", requests: 1900, latency: 210 },
      { time: "2026-10-16T09:00:00Z", requests: 2400, latency: 190 },
      { time: "2026-10-16T10:00:00Z", requests: 2600, latency: 170 },
      { time: "2026-10-16T11:00:00Z", requests: 2300, latency: 185 },
    ],
    encoding: {
      x: { field: "time", type: "temporal" },
      y: [
        { field: "requests", title: "Requests / min" },
        { field: "latency", title: "p95 latency", axis: "y2" },
      ],
    },
    axes: { y2: true },
    locale: "en-US",
    a11y: { alt: "Requests stayed above one thousand while p95 latency peaked at 240." },
  },
  donut: {
    version: "1",
    type: "donut",
    title: "Sessions by traffic source",
    data: [
      { label: "Search", value: 42 },
      { label: "Direct", value: 28 },
      { label: "Social", value: 18 },
      { label: "Email", value: 12 },
    ],
    encoding: { x: "label", y: "value" },
    mark: { innerRadius: 0.6, labels: true },
    a11y: { alt: "Search is the largest traffic source at 42 percent of sessions." },
  },
} as const;
