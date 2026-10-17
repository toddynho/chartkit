import { headline, published } from "./benchmarks";

export interface FaqItem {
  question: string;
  answer: string;
}

export const whenToUseFaqs: FaqItem[] = [
  {
    question: "When should I use ChartKit?",
    answer: `Use ChartKit when one JSON spec should render SVG in React, Vue, Svelte, or without a framework, and when an agent should validate and repair that spec. The minimal line chart is ${headline.lineGzipBytes} bytes gzip. A 1,000 point line server-renders in ${headline.ssrLabel} mean. With the docs, the round 7 agent eval was 42/42 on the first try.`,
  },
  {
    question: "When should I pick another chart library?",
    answer:
      "Pick something else when you need a hover tooltip, zoom, pan, brush, or animation. ChartKit accepts those fields and does not draw them (CK3011). Pick Recharts, Chart.js, ECharts, or Nivo when you need their larger catalog (radar, treemap, sankey, maps). Pick uPlot or Chart.js when the update path at 1,000 or 1,000,000 points is the constraint. ChartKit loses those update cells.",
  },
  {
    question: "How large is a ChartKit line chart?",
    answer: `${headline.lineGzipBytes} bytes gzip for the minimal line entry in the round 7 harness. The next smallest line is ${headline.nextLib} at ${headline.nextGzipBytes} bytes. Chart.js is 49,234. ECharts modular line is 162,391. Recharts is 95,807 with React external. Nivo is 95,493 with React external. scripts/size.mjs measures the ChartKit line entry at 12,106 bytes.`,
  },
  {
    question: "Can ChartKit render without a DOM?",
    answer: `Yes. Round 7 server-rendered a 1,000 point line in ${headline.ssrLabel} mean (1.22 ms on a quiet rerun). ECharts did it in 9.04 ms. Nivo did it in 113 ms on the loaded full run. uPlot, Chart.js, Recharts, and Observable Plot did not produce a chart without a DOM.`,
  },
  {
    question: "How well do coding agents do on the first try?",
    answer: `Round 7, claude-sonnet-4-5, temperature 0, 42 tasks. ChartKit with no docs: ${published.agents[0].noDocsFirst}/42 first, 42/42 within two tries, and 42/42 after repair() with no model call. With llms.txt in the prompt: 42/42 first try, mean 131.1 output tokens. Recharts, ECharts, and Chart.js were 42/42 with no docs, at higher token counts. Nivo and uPlot were not in that eval.`,
  },
  {
    question: "Where does ChartKit lose?",
    answer:
      "The 1,000-point update is a loss and ChartKit is last of seven (32.8 ms; quiet 31.9). The 100,000-point update is a loss to uPlot (22.9 vs 17.5). The 1,000,000-point full run loses to uPlot on initial (34.8 vs 32.0) and update (33.4 vs 29.2). A quiet rerun ties the 1M initial (36.3 vs 36.9). Update timings sit on a two-frame wait. With sampling off, 1M is 782.5 ms to draw and 53.3 seconds to update.",
  },
  {
    question: "How do I reproduce the numbers?",
    answer:
      "The figures are round 7, measured 2026-10-16. Core is pull request #6 at dccdbe6. The harness is pull request #4 at afd7edb. Run npm run bench on that pairing. Median of 5, Playwright Chromium, a 640×360 line. The full run shared a loaded machine. The JSON file is https://chartkit.dev/benchmarks.json and the Markdown file is https://chartkit.dev/benchmarks.md.",
  },
];
