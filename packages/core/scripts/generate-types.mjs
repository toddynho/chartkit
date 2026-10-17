/**
 * Generate TypeScript types from the approved v1 schema.
 * Run from packages/core: `npm run generate:types`
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileFromFile } from "json-schema-to-typescript";

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, "../schema/chartkit.schema.json");
const outPath = join(here, "../src/generated/schema.ts");

const ts = await compileFromFile(schemaPath, {
  bannerComment:
    "/* eslint-disable */\n/**\n * Generated from schema/chartkit.schema.json by json-schema-to-typescript.\n * Do not edit by hand. Run `npm run generate:types` from packages/core.\n */",
  additionalProperties: false,
  cwd: join(here, ".."),
});

writeFileSync(outPath, ts);
console.log(`wrote ${outPath}`);
