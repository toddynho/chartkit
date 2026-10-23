import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: "@chartkitdev/core/validate/phase4", replacement: path.resolve(__dirname, "../../packages/core/src/validate-phase4.ts") },
      { find: "@chartkitdev/core/validate", replacement: path.resolve(__dirname, "../../packages/core/src/validate.ts") },
      { find: "@chartkitdev/core/extra", replacement: path.resolve(__dirname, "../../packages/core/src/extra.ts") },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});
