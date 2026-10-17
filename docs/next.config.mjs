/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@chartkitdev/core"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.chartkit.dev" }],
        destination: "https://chartkit.dev/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://chartkit.dev/:path*",
        permanent: true,
      },
      { source: "/getting-started", destination: "/docs", permanent: false },
      { source: "/play", destination: "/playground", permanent: false },
      { source: "/components", destination: "/docs", permanent: false },
      { source: "/components/line-chart", destination: "/docs/charts/line", permanent: false },
      { source: "/components/bar-chart", destination: "/docs/charts/bar", permanent: false },
      { source: "/components/donut-chart", destination: "/docs/charts/donut", permanent: false },
      { source: "/components/stacked-area", destination: "/docs/charts/stacked-area", permanent: false },
      { source: "/components/scatter-chart", destination: "/docs/charts/scatter", permanent: false },
      { source: "/components/combo-chart", destination: "/docs/charts/combo", permanent: false },
      { source: "/components/heatmap", destination: "/docs/charts/heatmap", permanent: false },
      { source: "/components/gauge-chart", destination: "/docs/charts/gauge", permanent: false },
      { source: "/components/kpi-card", destination: "/docs/charts/kpi", permanent: false },
      { source: "/components/sparkline", destination: "/docs/charts/sparkline", permanent: false },
      { source: "/components/mini-area", destination: "/docs/charts/mini-area", permanent: false },
      { source: "/components/progress-ring", destination: "/docs/charts/progress-ring", permanent: false },
      { source: "/components/spike-chart", destination: "/docs/charts/spike", permanent: false },
      { source: "/components/candlestick-chart", destination: "/docs/charts/candlestick", permanent: false },
      { source: "/components/:path*", destination: "/docs", permanent: false },
      { source: "/hooks", destination: "/docs", permanent: false },
      { source: "/hooks/:path*", destination: "/docs", permanent: false },
      { source: "/utilities", destination: "/docs/spec", permanent: false },
      { source: "/utilities/:path*", destination: "/docs/spec", permanent: false },
      { source: "/themes", destination: "/docs/theming", permanent: false },
      { source: "/themes/:path*", destination: "/docs/theming", permanent: false },
      { source: "/about", destination: "/agents", permanent: false },
    ];
  },
  async headers() {
    const plain = [
      { key: "Content-Type", value: "text/plain; charset=utf-8" },
      { key: "Cache-Control", value: "public, max-age=86400" },
    ];
    return [
      { source: "/llms.txt", headers: plain },
      { source: "/llms-full.txt", headers: plain },
      {
        source: "/benchmarks.md",
        headers: [
          { key: "Content-Type", value: "text/markdown; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      {
        source: "/benchmarks.json",
        headers: [
          { key: "Content-Type", value: "application/json; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/benchmarks.schema.json",
        headers: [
          { key: "Content-Type", value: "application/json; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/llms.json",
        headers: [
          { key: "Content-Type", value: "application/json; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
