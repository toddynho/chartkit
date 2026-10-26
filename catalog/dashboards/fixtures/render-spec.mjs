/** Render one ChartKit spec from stdin. Test-only. */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { render } = require("../../../packages/core/dist/all.js");
const spec = JSON.parse(readFileSync(0, "utf8"));
process.stdout.write(render(spec));
