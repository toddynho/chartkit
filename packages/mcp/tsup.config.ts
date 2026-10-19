import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    cli: "src/cli.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [/^@modelcontextprotocol\/sdk(\/.*)?$/, /^@chartkitdev\/core(\/.*)?$/, "zod"],
});
