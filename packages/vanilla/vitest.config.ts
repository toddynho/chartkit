import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: "@chartkitdev/core/export-menu", replacement: path.resolve(__dirname, "../core/src/export-menu.ts") },
      { find: "@chartkitdev/core/export", replacement: path.resolve(__dirname, "../core/src/export.ts") },
      { find: "@chartkitdev/core/extra-tip", replacement: path.resolve(__dirname, "../core/src/extra-tip.ts") },
      { find: "@chartkitdev/core/extra", replacement: path.resolve(__dirname, "../core/src/extra.ts") },
      { find: "@chartkitdev/core/load", replacement: path.resolve(__dirname, "../core/src/load.ts") },
      { find: "@chartkitdev/core/all", replacement: path.resolve(__dirname, "../core/src/all.ts") },
      { find: "@chartkitdev/core/mermaid/phase4", replacement: path.resolve(__dirname, "../core/src/mermaid-phase4.ts") },
      { find: "@chartkitdev/core/mermaid", replacement: path.resolve(__dirname, "../core/src/mermaid.ts") },
      { find: "@chartkitdev/core/canvas/hydrate", replacement: path.resolve(__dirname, "../core/src/canvas/hydrate.ts") },
      { find: "@chartkitdev/core/interact", replacement: path.resolve(__dirname, "../core/src/interact.ts") },
      { find: "@chartkitdev/core", replacement: path.resolve(__dirname, "../core/src/index.ts") },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
});
