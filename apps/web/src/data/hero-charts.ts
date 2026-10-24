/**
 * Illustrative stage art for the marketing hero.
 * These SVGs are not renders from @chartkitdev/core. The JSON is the shape an agent writes.
 */

export type HeroChart = {
  id: string;
  label: string;
  title: string;
  kpi: string;
  delta: string;
  chrome: string;
  json: string;
  icon: string;
  svg: string;
};

function grid(): string {
  return '<g stroke="rgba(0,0,0,0.05)" stroke-width="1"><line x1="44" y1="14" x2="44" y2="172"/><line x1="44" y1="172" x2="576" y2="172"/><line x1="44" y1="120" x2="576" y2="120" stroke-dasharray="2 5"/><line x1="44" y1="68" x2="576" y2="68" stroke-dasharray="2 5"/></g>';
}

function xlabels(labels = ["W1", "W3", "W5", "W7", "W8"], xs = [44, 174, 304, 434, 576]): string {
  return labels
    .map(
      (label, i) =>
        `<text x="${xs[i]}" y="198" text-anchor="middle" font-family="Inter,system-ui" font-size="11" fill="#86868b">${label}</text>`,
    )
    .join("");
}

function chartSvg(label: string, body: string): string {
  return `<svg class="chart-svg" viewBox="0 0 600 220" role="img" aria-label="${label}">${body}</svg>`;
}

export const heroCharts: HeroChart[] = [
  {
    id: "area",
    label: "Area",
    title: "Weekly signups",
    kpi: "86",
    delta: "↑ 28% vs last period",
    chrome: "spec.json → area",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"area"</span>,\n  <span class="k">"title"</span>: <span class="s">"Weekly signups"</span>,\n  <span class="k">"theme"</span>: <span class="s">"soft"</span>,\n  <span class="k">"series"</span>: [{\n    <span class="k">"name"</span>: <span class="s">"signups"</span>,\n    <span class="k">"data"</span>: [\n      [<span class="s">"W1"</span>, <span class="n">18</span>],\n      [<span class="s">"W2"</span>, <span class="n">28</span>],\n      …\n    ]\n  }]\n}',
    icon: '<path d="M2 16 L6 12 L10 13 L14 7 L18 5 L22 3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M2 16 L6 12 L10 13 L14 7 L18 5 L22 3 V18 H2 Z" fill="currentColor" opacity="0.2"/>',
    svg: chartSvg(
      "Area chart of weekly signups",
      `<defs><linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0071e3" stop-opacity="0.44"/><stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.02"/></linearGradient></defs>${grid()}<path d="M44,158 C90,144 122,128 174,114 C226,100 252,118 304,90 C356,62 382,50 434,40 C486,30 512,28 576,22 L576,172 L44,172 Z" fill="url(#heroArea)"/><path d="M44,158 C90,144 122,128 174,114 C226,100 252,118 304,90 C356,62 382,50 434,40 C486,30 512,28 576,22" fill="none" stroke="#0071e3" stroke-width="2.75" stroke-linecap="round"/><circle cx="576" cy="22" r="3.6" fill="#fff" stroke="#0071e3" stroke-width="2"/>${xlabels()}`,
    ),
  },
  {
    id: "line",
    label: "Line",
    title: "API latency",
    kpi: "142ms",
    delta: "↓ 12% week over week",
    chrome: "spec.json → line",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"line"</span>,\n  <span class="k">"title"</span>: <span class="s">"API latency"</span>,\n  <span class="k">"series"</span>: [{\n    <span class="k">"name"</span>: <span class="s">"p95"</span>,\n    <span class="k">"data"</span>: [\n      [<span class="s">"Mon"</span>, <span class="n">180</span>],\n      [<span class="s">"Tue"</span>, <span class="n">160</span>],\n      …\n    ]\n  }]\n}',
    icon: '<path d="M2 14 L7 10 L12 12 L17 5 L22 7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="22" cy="7" r="1.6" fill="currentColor"/>',
    svg: chartSvg(
      "Line chart of API latency",
      `${grid()}<path d="M44,40 L140,90 L236,70 L332,120 L428,95 L524,130 L576,110" fill="none" stroke="#0071e3" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M44,80 L140,110 L236,100 L332,140 L428,125 L524,150 L576,145" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="5 4" opacity="0.7"/>${xlabels(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], [44, 140, 236, 332, 428, 524, 576])}`,
    ),
  },
  {
    id: "bar",
    label: "Bar",
    title: "Revenue by region",
    kpi: "$1.2M",
    delta: "↑ 9% vs last quarter",
    chrome: "spec.json → bar",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"bar"</span>,\n  <span class="k">"title"</span>: <span class="s">"Revenue by region"</span>,\n  <span class="k">"data"</span>: [\n    { <span class="k">"x"</span>: <span class="s">"NA"</span>, <span class="k">"y"</span>: <span class="n">420</span> },\n    { <span class="k">"x"</span>: <span class="s">"EU"</span>, <span class="k">"y"</span>: <span class="n">310</span> },\n    …\n  ]\n}',
    icon: '<rect x="3" y="10" width="3.5" height="8" rx="0.8" fill="currentColor"/><rect x="9" y="6" width="3.5" height="12" rx="0.8" fill="currentColor"/><rect x="15" y="3" width="3.5" height="15" rx="0.8" fill="currentColor"/><rect x="21" y="8" width="3.5" height="10" rx="0.8" fill="currentColor" opacity="0.45"/>',
    svg: chartSvg(
      "Bar chart of revenue by region",
      `${grid()}${[
        [80, 120],
        [160, 80],
        [240, 140],
        [320, 60],
        [400, 100],
        [480, 90],
      ]
        .map((bar, i) => {
          const fill = i === 3 ? "#0071e3" : `rgba(0,113,227,${0.35 + i * 0.08})`;
          return `<rect x="${bar[0]}" y="${172 - bar[1]}" width="44" height="${bar[1]}" rx="6" fill="${fill}"/>`;
        })
        .join("")}${xlabels(["NA", "EU", "APAC", "LATAM", "ME", "AF"], [102, 182, 262, 342, 422, 502])}`,
    ),
  },
  {
    id: "donut",
    label: "Donut",
    title: "Traffic sources",
    kpi: "48%",
    delta: "Organic share",
    chrome: "spec.json → donut",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"donut"</span>,\n  <span class="k">"title"</span>: <span class="s">"Traffic sources"</span>,\n  <span class="k">"data"</span>: [\n    { <span class="k">"label"</span>: <span class="s">"Organic"</span>, <span class="k">"value"</span>: <span class="n">48</span> },\n    { <span class="k">"label"</span>: <span class="s">"Paid"</span>, <span class="k">"value"</span>: <span class="n">27</span> },\n    …\n  ]\n}',
    icon: '<circle cx="12" cy="11" r="7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="28 20" stroke-linecap="round" transform="rotate(-90 12 11)"/>',
    svg: chartSvg(
      "Donut chart of traffic sources",
      '<g transform="translate(300,108)"><circle r="78" fill="none" stroke="#e8e8ed" stroke-width="28"/><circle r="78" fill="none" stroke="#0071e3" stroke-width="28" stroke-dasharray="235 490" stroke-linecap="round" transform="rotate(-90)"/><circle r="78" fill="none" stroke="#0ea5e9" stroke-width="28" stroke-dasharray="130 490" stroke-dashoffset="-235" stroke-linecap="round" transform="rotate(-90)"/><circle r="78" fill="none" stroke="#86868b" stroke-width="28" stroke-dasharray="80 490" stroke-dashoffset="-365" transform="rotate(-90)" opacity="0.45"/><text y="6" text-anchor="middle" font-family="Inter,system-ui" font-size="28" font-weight="600" fill="#1d1d1f">48%</text><text y="28" text-anchor="middle" font-family="Inter,system-ui" font-size="12" fill="#6e6e73">Organic</text></g>',
    ),
  },
  {
    id: "combo",
    label: "Combo",
    title: "Orders and AOV",
    kpi: "3.4k",
    delta: "Orders · AOV $86",
    chrome: "spec.json → combo",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"combo"</span>,\n  <span class="k">"title"</span>: <span class="s">"Orders and AOV"</span>,\n  <span class="k">"bars"</span>: <span class="s">"orders"</span>,\n  <span class="k">"line"</span>: <span class="s">"aov"</span>\n}',
    icon: '<rect x="3" y="9" width="3" height="9" rx="0.6" fill="currentColor" opacity="0.45"/><rect x="8" y="6" width="3" height="12" rx="0.6" fill="currentColor" opacity="0.45"/><rect x="13" y="4" width="3" height="14" rx="0.6" fill="currentColor" opacity="0.45"/><path d="M4 8 L9 11 L14 7 L19 9 L23 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    svg: chartSvg(
      "Combo chart of orders and average order value",
      `${grid()}${[90, 110, 70, 130, 100, 120, 85]
        .map(
          (height, i) =>
            `<rect x="${60 + i * 70}" y="${172 - height}" width="36" height="${height}" rx="5" fill="rgba(0,113,227,0.28)"/>`,
        )
        .join("")}<path d="M78,100 L148,80 L218,110 L288,50 L358,70 L428,40 L498,55" fill="none" stroke="#0071e3" stroke-width="2.5" stroke-linecap="round"/>${xlabels(["M", "T", "W", "T", "F", "S", "S"], [78, 148, 218, 288, 358, 428, 498])}`,
    ),
  },
  {
    id: "gauge",
    label: "Gauge",
    title: "NPS score",
    kpi: "72",
    delta: "Good · target 80",
    chrome: "spec.json → gauge",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"gauge"</span>,\n  <span class="k">"title"</span>: <span class="s">"NPS score"</span>,\n  <span class="k">"value"</span>: <span class="n">72</span>,\n  <span class="k">"min"</span>: <span class="n">0</span>,\n  <span class="k">"max"</span>: <span class="n">100</span>\n}',
    icon: '<path d="M4 15 A8 8 0 0 1 20 15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M12 15 L17 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    svg: chartSvg(
      "Gauge chart of an NPS score",
      '<g transform="translate(300,150)"><path d="M-110,0 A110,110 0 0 1 110,0" fill="none" stroke="#e8e8ed" stroke-width="22" stroke-linecap="round"/><path d="M-110,0 A110,110 0 0 1 55,-95" fill="none" stroke="#0071e3" stroke-width="22" stroke-linecap="round"/><line x1="0" y1="0" x2="48" y2="-78" stroke="#1d1d1f" stroke-width="3" stroke-linecap="round"/><circle r="6" fill="#1d1d1f"/><text y="40" text-anchor="middle" font-family="Inter,system-ui" font-size="36" font-weight="600" fill="#1d1d1f">72</text></g>',
    ),
  },
  {
    id: "heatmap",
    label: "Heatmap",
    title: "Activity by hour",
    kpi: "Peak 2–4p",
    delta: "Tue · densest day",
    chrome: "spec.json → heatmap",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"heatmap"</span>,\n  <span class="k">"title"</span>: <span class="s">"Activity by hour"</span>,\n  <span class="k">"x"</span>: <span class="s">"hour"</span>,\n  <span class="k">"y"</span>: <span class="s">"day"</span>\n}',
    icon: Array.from({ length: 3 }, (_, row) =>
      Array.from({ length: 4 }, (_, col) => {
        const opacity = (0.25 + ((row + col) % 4) * 0.2).toFixed(2);
        return `<rect x="${3 + col * 5}" y="${3 + row * 5}" width="4" height="4" rx="0.6" fill="currentColor" opacity="${opacity}"/>`;
      }).join(""),
    ).join(""),
    svg: chartSvg(
      "Heatmap of activity by hour",
      Array.from({ length: 5 }, (_, day) =>
        Array.from({ length: 12 }, (_, hour) => {
          const value = (Math.sin(hour * 0.7 + day) + 1) / 2;
          return `<rect x="${60 + hour * 40}" y="${36 + day * 28}" width="34" height="22" rx="4" fill="#0071e3" opacity="${(0.12 + value * 0.7).toFixed(2)}"/>`;
        }).join(""),
      ).join(""),
    ),
  },
  {
    id: "candle",
    label: "Candle",
    title: "Sample session",
    kpi: "68.2",
    delta: "↑ 1.4% on the day",
    chrome: "spec.json → candlestick",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"candlestick"</span>,\n  <span class="k">"title"</span>: <span class="s">"Sample session"</span>,\n  <span class="k">"ohlc"</span>: [\n    { <span class="k">"o"</span>: <span class="n">67.1</span>, <span class="k">"h"</span>: <span class="n">68.4</span>, <span class="k">"l"</span>: <span class="n">66.8</span>, <span class="k">"c"</span>: <span class="n">68.2</span> }\n  ]\n}',
    icon: '<line x1="6" y1="3" x2="6" y2="18" stroke="currentColor" stroke-width="1.2"/><rect x="4" y="7" width="4" height="7" rx="0.5" fill="currentColor"/><line x1="14" y1="4" x2="14" y2="17" stroke="currentColor" stroke-width="1.2"/><rect x="12" y="6" width="4" height="5" rx="0.5" fill="currentColor" opacity="0.4"/><line x1="22" y1="5" x2="22" y2="16" stroke="currentColor" stroke-width="1.2"/><rect x="20" y="8" width="4" height="6" rx="0.5" fill="currentColor"/>',
    svg: chartSvg(
      "Candlestick chart",
      `${grid()}${[
        [80, 40, 140, 60, 100],
        [150, 70, 130, 50, 90],
        [220, 50, 100, 40, 70],
        [290, 90, 150, 80, 120],
        [360, 60, 110, 45, 80],
        [430, 40, 90, 30, 55],
        [500, 55, 130, 50, 100],
      ]
        .map(([x, open, high, low, close]) => {
          const up = close < open;
          const color = up ? "#30a46c" : "#e5484d";
          const top = Math.min(open, close);
          const bottom = Math.max(open, close);
          return `<line x1="${x + 12}" y1="${172 - high}" x2="${x + 12}" y2="${172 - low}" stroke="${color}" stroke-width="1.5"/><rect x="${x}" y="${172 - bottom}" width="24" height="${Math.max(bottom - top, 3)}" rx="2" fill="${color}"/>`;
        })
        .join("")}`,
    ),
  },
  {
    id: "histogram",
    label: "Histogram",
    title: "Response sizes",
    kpi: "σ 24kb",
    delta: "n = 12,480",
    chrome: "spec.json → histogram",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"histogram"</span>,\n  <span class="k">"title"</span>: <span class="s">"Response sizes"</span>,\n  <span class="k">"bins"</span>: <span class="n">14</span>\n}',
    icon: '<rect x="2" y="12" width="2.5" height="6" fill="currentColor" opacity="0.35"/><rect x="5.5" y="8" width="2.5" height="10" fill="currentColor" opacity="0.5"/><rect x="9" y="4" width="2.5" height="14" fill="currentColor"/><rect x="12.5" y="6" width="2.5" height="12" fill="currentColor" opacity="0.85"/><rect x="16" y="9" width="2.5" height="9" fill="currentColor" opacity="0.55"/><rect x="19.5" y="12" width="2.5" height="6" fill="currentColor" opacity="0.35"/>',
    svg: chartSvg(
      "Histogram of response sizes",
      `${grid()}${[20, 40, 70, 110, 140, 155, 130, 100, 70, 45, 30, 18, 12, 8]
        .map((height, i) => {
          const opacity = 0.35 + (i === 5 ? 0.45 : i * 0.03);
          return `<rect x="${50 + i * 36}" y="${172 - height}" width="28" height="${height}" rx="3" fill="#0071e3" opacity="${opacity.toFixed(2)}"/>`;
        })
        .join("")}`,
    ),
  },
  {
    id: "funnel",
    label: "Funnel",
    title: "Signup funnel",
    kpi: "18%",
    delta: "Visit to paid",
    chrome: "spec.json → funnel",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"funnel"</span>,\n  <span class="k">"title"</span>: <span class="s">"Signup funnel"</span>,\n  <span class="k">"stages"</span>: [\n    { <span class="k">"label"</span>: <span class="s">"Visit"</span>, <span class="k">"value"</span>: <span class="n">10000</span> },\n    { <span class="k">"label"</span>: <span class="s">"Signup"</span>, <span class="k">"value"</span>: <span class="n">3200</span> }\n  ]\n}',
    icon: '<path d="M3 3 H21 L18 8 H6 Z" fill="currentColor" opacity="0.9"/><path d="M6 9 H18 L15.5 14 H8.5 Z" fill="currentColor" opacity="0.6"/><path d="M9 15 H15 L13.5 19 H10.5 Z" fill="currentColor" opacity="0.35"/>',
    svg: chartSvg(
      "Funnel chart of a signup path",
      [
        [440, "Visit", "10k"],
        [340, "Signup", "3.2k"],
        [250, "Activate", "1.8k"],
        [170, "Trial", "920"],
        [110, "Paid", "480"],
      ]
        .map((stage, i) => {
          const width = stage[0] as number;
          const y = 24 + i * 36;
          const x = (600 - width) / 2;
          const opacity = (1 - i * 0.14).toFixed(2);
          return `<rect x="${x}" y="${y}" width="${width}" height="28" rx="6" fill="#0071e3" opacity="${opacity}"/><text x="300" y="${y + 19}" text-anchor="middle" font-family="Inter,system-ui" font-size="12" font-weight="500" fill="#fff">${stage[1]} · ${stage[2]}</text>`;
        })
        .join(""),
    ),
  },
  {
    id: "treemap",
    label: "Treemap",
    title: "Bundle size",
    kpi: "248kb",
    delta: "gzip · main chunk",
    chrome: "spec.json → treemap",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"treemap"</span>,\n  <span class="k">"title"</span>: <span class="s">"Bundle size"</span>,\n  <span class="k">"children"</span>: [\n    { <span class="k">"name"</span>: <span class="s">"react"</span>, <span class="k">"value"</span>: <span class="n">42</span> }\n  ]\n}',
    icon: '<rect x="2" y="3" width="12" height="10" rx="1" fill="currentColor"/><rect x="15" y="3" width="7" height="5" rx="1" fill="currentColor" opacity="0.55"/><rect x="15" y="9" width="7" height="4" rx="1" fill="currentColor" opacity="0.35"/><rect x="2" y="14" width="7" height="4" rx="1" fill="currentColor" opacity="0.45"/><rect x="10" y="14" width="12" height="4" rx="1" fill="currentColor" opacity="0.25"/>',
    svg: chartSvg(
      "Treemap of bundle size",
      [
        [40, 20, 280, 120, 0.85, "react"],
        [330, 20, 230, 70, 0.55, "charts"],
        [330, 100, 230, 40, 0.4, "utils"],
        [40, 150, 160, 50, 0.5, "router"],
        [210, 150, 180, 50, 0.35, "state"],
        [400, 150, 160, 50, 0.25, "misc"],
      ]
        .map(
          ([x, y, width, height, opacity, name]) =>
            `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="#0071e3" opacity="${opacity}"/><text x="${Number(x) + 12}" y="${Number(y) + 22}" font-family="Inter,system-ui" font-size="13" font-weight="500" fill="#fff">${name}</text>`,
        )
        .join(""),
    ),
  },
  {
    id: "sankey",
    label: "Sankey",
    title: "User flows",
    kpi: "4 paths",
    delta: "Onboarding to core",
    chrome: "spec.json → sankey",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"sankey"</span>,\n  <span class="k">"title"</span>: <span class="s">"User flows"</span>,\n  <span class="k">"links"</span>: [\n    { <span class="k">"source"</span>: <span class="s">"Visit"</span>, <span class="k">"target"</span>: <span class="s">"Signup"</span>, <span class="k">"value"</span>: <span class="n">40</span> }\n  ]\n}',
    icon: '<path d="M2 5 C10 5, 10 9, 18 9" fill="none" stroke="currentColor" stroke-width="2.2" opacity="0.7"/><path d="M2 12 C10 12, 10 9, 18 9" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.4"/><path d="M2 16 C10 16, 10 15, 18 15" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.3"/>',
    svg: chartSvg(
      "Sankey diagram of user flows",
      '<path d="M60,40 C220,40 220,70 540,70" fill="none" stroke="#0071e3" stroke-width="28" opacity="0.35" stroke-linecap="round"/><path d="M60,100 C220,100 220,70 540,70" fill="none" stroke="#0ea5e9" stroke-width="18" opacity="0.4" stroke-linecap="round"/><path d="M60,150 C220,150 220,140 540,140" fill="none" stroke="#86868b" stroke-width="14" opacity="0.3" stroke-linecap="round"/><rect x="48" y="26" width="14" height="140" rx="4" fill="#1d1d1f" opacity="0.15"/><rect x="538" y="50" width="14" height="110" rx="4" fill="#1d1d1f" opacity="0.15"/>',
    ),
  },
  {
    id: "radar",
    label: "Radar",
    title: "Model scores",
    kpi: "0.91",
    delta: "F1 · best fold",
    chrome: "spec.json → radar",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"radar"</span>,\n  <span class="k">"title"</span>: <span class="s">"Model scores"</span>,\n  <span class="k">"axes"</span>: [<span class="s">"precision"</span>, <span class="s">"recall"</span>, <span class="s">"f1"</span>]\n}',
    icon: '<polygon points="12,2 20,8 17,18 7,18 4,8" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.3"/>',
    svg: chartSvg("Radar chart of model scores", radarBody()),
  },
  {
    id: "spark",
    label: "Spark",
    title: "Active users",
    kpi: "12.4k",
    delta: "Last 24h",
    chrome: "spec.json → sparkline",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"sparkline"</span>,\n  <span class="k">"title"</span>: <span class="s">"Active users"</span>,\n  <span class="k">"data"</span>: [<span class="n">8.1</span>, <span class="n">8.4</span>, <span class="n">9.0</span>, <span class="n">12.4</span>]\n}',
    icon: '<path d="M2 14 L6 10 L10 12 L14 6 L18 8 L22 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="22" cy="4" r="1.5" fill="currentColor"/>',
    svg: chartSvg(
      "Sparkline of active users",
      '<text x="44" y="70" font-family="Inter,system-ui" font-size="14" fill="#6e6e73">Active now</text><text x="44" y="120" font-family="Inter,system-ui" font-size="56" font-weight="600" letter-spacing="-0.03em" fill="#1d1d1f">12,418</text><path d="M300,140 C340,130 360,150 400,100 C440,50 480,80 540,40" fill="none" stroke="#0071e3" stroke-width="3" stroke-linecap="round"/><circle cx="540" cy="40" r="4" fill="#0071e3"/>',
    ),
  },
  {
    id: "waterfall",
    label: "Waterfall",
    title: "Margin bridge",
    kpi: "+240k",
    delta: "Gross to net",
    chrome: "spec.json → waterfall",
    json: '{\n  <span class="k">"type"</span>: <span class="s">"waterfall"</span>,\n  <span class="k">"title"</span>: <span class="s">"Margin bridge"</span>,\n  <span class="k">"steps"</span>: [\n    { <span class="k">"label"</span>: <span class="s">"Gross"</span>, <span class="k">"value"</span>: <span class="n">800</span> },\n    { <span class="k">"label"</span>: <span class="s">"COGS"</span>, <span class="k">"value"</span>: <span class="n">-220</span> }\n  ]\n}',
    icon: '<rect x="2" y="4" width="4" height="14" rx="0.6" fill="currentColor"/><rect x="8" y="8" width="4" height="6" rx="0.6" fill="currentColor" opacity="0.45"/><rect x="14" y="6" width="4" height="8" rx="0.6" fill="currentColor" opacity="0.7"/><rect x="20" y="10" width="4" height="8" rx="0.6" fill="currentColor"/>',
    svg: chartSvg(
      "Waterfall chart of a margin bridge",
      `${grid()}${[
        [60, 40, 132, "#0071e3"],
        [150, 40, 40, "#e5484d"],
        [240, 80, 35, "#e5484d"],
        [330, 70, 45, "#30a46c"],
        [420, 70, 102, "#0071e3"],
      ]
        .map(
          ([x, y, height, color]) =>
            `<rect x="${x}" y="${y}" width="48" height="${height}" rx="5" fill="${color}" opacity="0.85"/>`,
        )
        .join("")}<line x1="108" y1="40" x2="150" y2="40" stroke="rgba(0,0,0,0.15)" stroke-dasharray="3 3"/><line x1="198" y1="80" x2="240" y2="80" stroke="rgba(0,0,0,0.15)" stroke-dasharray="3 3"/><line x1="288" y1="115" x2="330" y2="115" stroke="rgba(0,0,0,0.15)" stroke-dasharray="3 3"/>${xlabels(["Gross", "COGS", "OpEx", "Upsell", "Net"], [84, 174, 264, 354, 444])}`,
    ),
  },
];

function radarBody(): string {
  const cx = 300;
  const cy = 110;
  const radius = 80;
  const axes = 6;
  const values = [0.9, 0.75, 0.85, 0.7, 0.95, 0.8];
  let rings = "";
  for (let ring = 1; ring <= 3; ring += 1) {
    const points: string[] = [];
    for (let axis = 0; axis < axes; axis += 1) {
      const angle = -Math.PI / 2 + (axis * 2 * Math.PI) / axes;
      const distance = (radius * ring) / 3;
      points.push(`${(cx + Math.cos(angle) * distance).toFixed(1)},${(cy + Math.sin(angle) * distance).toFixed(1)}`);
    }
    rings += `<polygon points="${points.join(" ")}" fill="none" stroke="rgba(0,0,0,0.08)"/>`;
  }
  const shape = values
    .map((value, axis) => {
      const angle = -Math.PI / 2 + (axis * 2 * Math.PI) / axes;
      return `${(cx + Math.cos(angle) * radius * value).toFixed(1)},${(cy + Math.sin(angle) * radius * value).toFixed(1)}`;
    })
    .join(" ");
  return `${rings}<polygon points="${shape}" fill="rgba(0,113,227,0.22)" stroke="#0071e3" stroke-width="2"/>`;
}
