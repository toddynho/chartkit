import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", ssr: "src/ssr.ts", auto: "src/auto.ts" },
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [/^@chartkitdev\/core(\/.*)?$/],
});
