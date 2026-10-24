/** Small valid specs for the try-it shell. Not a catalog of every chart. */
export const samples = {
  line: {
    version: "1",
    type: "line",
    data: [
      { quarter: "Q1", units: 40 },
      { quarter: "Q2", units: 55 },
    ],
    encoding: { x: "quarter", y: "units" },
    a11y: { alt: "Units rose from Q1 to Q2." },
  },
  bar: {
    version: "1",
    type: "bar",
    data: [
      { quarter: "Q1", units: 40 },
      { quarter: "Q2", units: 55 },
    ],
    encoding: { x: "quarter", y: "units" },
    a11y: { alt: "Units were 40 in Q1 and 55 in Q2." },
  },
  donut: {
    version: "1",
    type: "donut",
    data: [
      { channel: "Search", visits: 40 },
      { channel: "Direct", visits: 55 },
    ],
    encoding: { x: "channel", y: "visits" },
    a11y: { alt: "Direct is a larger share than Search." },
  },
} as const;

export const lineSample = JSON.stringify(samples.line, null, 2);

/** GET /render on the public Cloud origin. The query spec is the line sample above. */
export const cloudCurl = `curl -sG "https://cloud.chartkit.dev/render" \\
  --data-urlencode 'spec=${JSON.stringify(samples.line)}' \\
  --data-urlencode format=svg \\
  -o chart.svg`;
