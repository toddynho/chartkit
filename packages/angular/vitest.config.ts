import path from "node:path";
import { defineConfig } from "vitest/config";

const core = path.resolve(__dirname, "../core/src");

export default defineConfig({
  resolve: {
    alias: [
      { find: "@chartkitdev/core/canvas/hydrate", replacement: path.join(core, "canvas/hydrate.ts") },
      { find: "@chartkitdev/core/charts/bar-list", replacement: path.join(core, "charts/bar-list.ts") },
      { find: "@chartkitdev/core/validate/phase4", replacement: path.join(core, "validate-phase4.ts") },
      { find: "@chartkitdev/core/export", replacement: path.join(core, "export.ts") },
      { find: "@chartkitdev/core/extra-tip", replacement: path.join(core, "extra-tip.ts") },
      { find: "@chartkitdev/core/extra", replacement: path.join(core, "extra.ts") },
      { find: "@chartkitdev/core/load", replacement: path.join(core, "load.ts") },
      { find: "@chartkitdev/core/all", replacement: path.join(core, "all.ts") },
      { find: "@chartkitdev/core/interact", replacement: path.join(core, "interact.ts") },
      { find: "@chartkitdev/core/validate", replacement: path.join(core, "validate.ts") },
      { find: "@chartkitdev/core", replacement: path.join(core, "index.ts") },
      { find: "@chartkitdev/vanilla", replacement: path.resolve(__dirname, "../vanilla/src/index.ts") },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/test-setup.ts"],
  },
});
