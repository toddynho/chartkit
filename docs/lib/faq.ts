import { headline, published } from "./benchmarks";

export interface FaqItem {
  question: string;
  answer: string;
}

export const whenToUseFaqs: FaqItem[] = [
  {
    question: "When should I use ChartKit?",
    answer: `Use ChartKit when one JSON spec should render SVG in React, Vue, Svelte, or without a framework, and when an agent should validate and repair that spec. The line chart is ${headline.lineGzipBytes} bytes gzip. A 1,000 point line server-renders in ${headline.ssrLabel} mean. With the docs, the agent eval was 42/42 on the first try. That eval was not re-run for round 13.`,
  },
  {
    question: "When should I pick another chart library?",
    answer:
      "Tooltip, zoom, pan, brush, and animation run in the client runtime. The static SVG does not paint them. Keyboard, the data table, and legend clicks stay off unless set. Pick Recharts, Chart.js, ECharts, or Nivo when you need maps. Pick uPlot when the aligned update at 1,000 points is the constraint: ChartKit loses that cell on even, jittered, and gapped x (1.5 vs 1.2, 1.6 vs 1.4, and 1.6 vs 1.4). Pick uPlot when the first hover has to be a few milliseconds: ChartKit’s painted median is 20.8, 15.9, and 16.5 ms, and uPlot’s is 4, 4.6, and 4.9 ms.",
  },
  {
    question: "How large is a ChartKit line chart?",
    answer: `${headline.lineGzipBytes} bytes gzip for the line entry from scripts/size.mjs on phase 2 d8dcc5a, measured 2026-10-18. It is still the smallest. The next line is ${headline.nextLib} at ${headline.nextGzipBytes} bytes. The harness minimal line is 14,987. Chart.js is 49,234. ECharts modular line is 162,391. Recharts is 95,807 with React external. Nivo is 95,493 with React external. ChartKit bar is 13,022, donut is 6,683, and /all is 26,715.`,
  },
  {
    question: "Can ChartKit render without a DOM?",
    answer: `Yes. Round 13 server-rendered a 1,000 point line in ${headline.ssrLabel} mean and 0.85 ms median. ECharts did it in 6.65 ms mean (median 6.38). Nivo did it in 92.29 ms mean (median 90.89). uPlot, Chart.js, Recharts, and Observable Plot did not produce a chart without a DOM.`,
  },
  {
    question: "How well do coding agents do on the first try?",
    answer: `The agent eval was not re-run for round 13. The recorded run is 2026-10-16, claude-sonnet-4-5, temperature 0, 42 tasks. ChartKit with no docs: ${published.agents[0].noDocsFirst}/42 first, 42/42 within two tries, and 42/42 after repair() with no model call. With llms.txt in the prompt: 42/42 first try, mean 131.1 output tokens. Recharts, ECharts, and Chart.js were 42/42 with no docs, at higher token counts. Nivo and uPlot were not in that eval.`,
  },
  {
    question: "Where does ChartKit lose?",
    answer:
      "Round 13 initial render wins all 12 cells against uPlot. The aligned update wins 6 and loses 6. The losses are even 1,000 (1.5 vs 1.2), even 10,000 (1.9 vs 1.7), jittered 1,000 (1.6 vs 1.4), gapped 1,000 (1.6 vs 1.4), gapped 10,000 (1.9 vs 1.6), and gapped 100,000 (3.5 vs 3.4). Steady hover at 100k is 16.5 vs uPlot 16.2. First hover painted medians are 20.8, 15.9, and 16.5 ms against uPlot 4, 4.6, and 4.9. With sampling off, 1,000,000 points is 471.8 ms to draw and 462.4 ms to update on the fair timer.",
  },
  {
    question: "How do I reproduce the numbers?",
    answer:
      "The browser, bundle, and server-render figures are round 13, measured 2026-10-18 on phase 2 d8dcc5a. Median of 5, Playwright Chromium, a 640×360 line. The aligned update starts at the top of a requestAnimationFrame, awaits the library’s own completion, and reads time from a MessageChannel after paint. The JSON file is https://chartkit.dev/benchmarks.json and the Markdown file is https://chartkit.dev/benchmarks.md.",
  },
];
