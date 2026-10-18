import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: "@chartkitdev/core/mermaid", replacement: path.resolve(__dirname, "../core/src/mermaid.ts") },
      { find: "@chartkitdev/core/extra", replacement: path.resolve(__dirname, "../core/src/extra.ts") },
      { find: "@chartkitdev/core", replacement: path.resolve(__dirname, "../core/src/index.ts") },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
