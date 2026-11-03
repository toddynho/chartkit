// @ts-check
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

/**
 * Express hoists cookie 0.7. Astro 7 imports parseCookie from cookie 2.
 * Pin that import to Astro's nested copy when npm has not hoisted cookie 2.
 */
const cookieV2 = fileURLToPath(new URL("../../node_modules/astro/node_modules/cookie/dist/index.js", import.meta.url));

/** Static site for chartkit.dev. Todd deploys apps/web/dist by hand. */
export default defineConfig({
  site: "https://chartkit.dev",
  devToolbar: { enabled: false },
  trailingSlash: "ignore",
  server: {
    host: true,
    port: 4321,
  },
  build: {
    format: "directory",
  },
  integrations: [react()],
  redirects: {
    // Static meta refresh drops a fragment, so /examples is a page that keeps location.hash.
    "/play": { status: 307, destination: "/playground" },
    "/demo": { status: 307, destination: "/playground" },
    "/showcase": { status: 307, destination: "/gallery" },
    "/maps": { status: 307, destination: "/gallery#maps" },
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
    "/utilities/legend": { status: 307, destination: "/docs/spec" },
    "/utilities/annotations": { status: 307, destination: "/docs/spec" },
    "/utilities/responsive-chart": { status: 307, destination: "/docs/spec" },
    "/.well-known/llms.txt": { status: 307, destination: "/llms.txt" },
    "/themes": { status: 307, destination: "/docs/theming" },
    "/about": { status: 307, destination: "/agents" },
    "/docs/agents/mcp": { status: 307, destination: "/docs/mcp" },
    "/docs/react": { status: 307, destination: "/docs?framework=react" },
    "/docs/vue": { status: 307, destination: "/docs?framework=vue" },
    "/docs/svelte": { status: 307, destination: "/docs?framework=svelte" },
    "/docs/astro": { status: 307, destination: "/docs?framework=astro" },
    "/docs/solid": { status: 307, destination: "/docs?framework=solid" },
    "/docs/qwik": { status: 307, destination: "/docs?framework=qwik" },
    "/docs/angular": { status: 307, destination: "/docs?framework=angular" },
    "/docs/vanilla": { status: 307, destination: "/docs?framework=vanilla" },
    "/dashboard": { status: 307, destination: "/dashboards" },
    "/dashboards/ledger": { status: 301, destination: "/dashboards/stripe" },
    "/dashboards/meter": { status: 301, destination: "/dashboards/plausible" },
    "/dashboards/wayline": { status: 301, destination: "/dashboards/ga" },
    "/dashboards/keel": { status: 301, destination: "/dashboards/sentry" },
    "/dashboards/signal": { status: 301, destination: "/dashboards/datadog" },
    "/dashboards/folio": { status: 301, destination: "/dashboards/robinhood" },
    "/dashboards/cycle": { status: 301, destination: "/dashboards/linear" },
    "/dashboards/edge": { status: 301, destination: "/dashboards/vercel" },
    "/dashboards/pulse": { status: 301, destination: "/dashboards" },
    "/dashboards/retain": { status: 301, destination: "/dashboards" },
    "/pricing": { status: 307, destination: "/cloud#pricing" },
    "/docs/charts": { status: 307, destination: "/gallery" },
    "/docs/reference/try": { status: 307, destination: "/playground" },
    "/docs/reference": { status: 307, destination: "/docs/options" },
    "/docs/reference/validate": { status: 307, destination: "/docs/validate" },
    "/docs/agents": { status: 307, destination: "/docs/validate" },
    "/docs/agents/llms": { status: 307, destination: "/docs/llms-txt" },
    "/docs/spec-anatomy": { status: 307, destination: "/docs/concepts/spec" },
    "/docs/themes": { status: 307, destination: "/docs/theming" },
    "/docs/themes-tokens": { status: 307, destination: "/docs/theming" },
    "/docs/concepts/themes": { status: 307, destination: "/docs/theming" },
    "/spec": { status: 307, destination: "/docs/spec" },
    "/spec/[type]": { status: 307, destination: "/docs/charts/[type]" },
    "/interaction": { status: 307, destination: "/docs/concepts/interaction" },
    "/layouts": { status: 307, destination: "/docs/concepts/layouts" },
    "/large": { status: 307, destination: "/docs/concepts/large-data" },
    "/when-to-use": { status: 307, destination: "/compare#when-to-use" },
  },
  vite: {
    resolve: {
      alias: existsSync(cookieV2) ? { cookie: cookieV2 } : {},
    },
  },
});
