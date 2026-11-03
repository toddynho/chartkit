import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: "@chartkitdev/core/export", replacement: path.resolve(__dirname, "src/export.ts") },
      { find: "@chartkitdev/core/extra-tip", replacement: path.resolve(__dirname, "src/extra-tip.ts") },
      { find: "@chartkitdev/core/extra", replacement: path.resolve(__dirname, "src/extra.ts") },
      { find: "@chartkitdev/core/load", replacement: path.resolve(__dirname, "src/load.ts") },
      { find: "@chartkitdev/core/interact", replacement: path.resolve(__dirname, "src/interact.ts") },
      { find: "@chartkitdev/core/all", replacement: path.resolve(__dirname, "src/all.ts") },
      { find: "@chartkitdev/core/validate/phase4", replacement: path.resolve(__dirname, "src/validate-phase4.ts") },
      { find: "@chartkitdev/core/validate", replacement: path.resolve(__dirname, "src/validate.ts") },
      { find: "@chartkitdev/core/charts", replacement: path.resolve(__dirname, "src/charts") },
      { find: "@chartkitdev/core", replacement: path.resolve(__dirname, "src/index.ts") },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
    setupFiles: ["./src/test-setup.ts"],
  },
});
