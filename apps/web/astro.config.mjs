// @ts-check
import { defineConfig } from "astro/config";

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
});
