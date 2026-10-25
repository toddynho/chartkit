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
  vite: {
    resolve: {
      alias: existsSync(cookieV2) ? { cookie: cookieV2 } : {},
    },
  },
});
