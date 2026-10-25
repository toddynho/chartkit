// @ts-check
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

/**
 * Express hoists cookie 0.7. Astro 7 imports parseCookie from cookie 2.
 * Pin that import to Astro's nested copy when npm has not hoisted cookie 2.
 */
const cookieV2 = fileURLToPath(new URL("../../node_modules/astro/node_modules/cookie/dist/index.js", import.meta.url));

/** Static marketing + docs shell. Not wired to production hosting. */
export default defineConfig({
  site: "https://chartkit.dev",
  trailingSlash: "ignore",
  server: {
    host: true,
    port: 4321,
  },
  build: {
    format: "directory",
  },
  redirects: {
    "/play": { status: 307, destination: "/playground" },
    "/getting-started": { status: 307, destination: "/docs" },
    "/components": { status: 307, destination: "/docs" },
    "/components/line-chart": { status: 307, destination: "/docs/charts/line" },
    "/components/bar-chart": { status: 307, destination: "/docs/charts/bar" },
    "/components/donut-chart": { status: 307, destination: "/docs/charts/donut" },
    "/components/stacked-area": { status: 307, destination: "/docs/charts/stacked-area" },
    "/components/scatter-chart": { status: 307, destination: "/docs/charts/scatter" },
    "/components/combo-chart": { status: 307, destination: "/docs/charts/combo" },
    "/components/heatmap": { status: 307, destination: "/docs/charts/heatmap" },
    "/components/gauge-chart": { status: 307, destination: "/docs/charts/gauge" },
    "/components/kpi-card": { status: 307, destination: "/docs/charts/kpi" },
    "/components/sparkline": { status: 307, destination: "/docs/charts/sparkline" },
    "/components/mini-area": { status: 307, destination: "/docs/charts/mini-area" },
    "/components/progress-ring": { status: 307, destination: "/docs/charts/progress-ring" },
    "/components/spike-chart": { status: 307, destination: "/docs/charts/spike" },
    "/components/candlestick-chart": { status: 307, destination: "/docs/charts/candlestick" },
    "/hooks": { status: 307, destination: "/docs" },
    "/utilities": { status: 307, destination: "/docs/spec" },
    "/themes": { status: 307, destination: "/docs/theming" },
    "/about": { status: 307, destination: "/agents" },
    "/docs/agents/mcp": { status: 307, destination: "/docs/mcp" },
    "/docs/react": { status: 307, destination: "/docs?framework=react" },
    "/docs/vue": { status: 307, destination: "/docs?framework=vue" },
    "/docs/svelte": { status: 307, destination: "/docs?framework=svelte" },
    "/docs/vanilla": { status: 307, destination: "/docs?framework=vanilla" },
    "/dashboard": { status: 307, destination: "/dashboards" },
  },
  vite: {
    resolve: {
      alias: existsSync(cookieV2) ? { cookie: cookieV2 } : {},
    },
  },
});
