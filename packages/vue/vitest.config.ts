import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: "@chartkitdev/core/all", replacement: path.resolve(__dirname, "../core/src/all.ts") },
      { find: "@chartkitdev/core/interact", replacement: path.resolve(__dirname, "../core/src/interact.ts") },
      { find: "@chartkitdev/core", replacement: path.resolve(__dirname, "../core/src/index.ts") },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
});
