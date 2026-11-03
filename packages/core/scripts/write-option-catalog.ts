/**
 * Rebuild src/generated/option-catalog.json from schema/chartkit.schema.json.
 * From packages/core: npm run options:catalog
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildOptionCatalog, optionCoverage } from "../src/option-catalog.ts";

const root = process.cwd();
const schema = JSON.parse(readFileSync(join(root, "schema/chartkit.schema.json"), "utf8")) as Parameters<typeof buildOptionCatalog>[0];
const fields = buildOptionCatalog(schema);
const out = join(root, "src/generated/option-catalog.json");
writeFileSync(out, `${JSON.stringify(fields, null, 2)}\n`);
const types = [...new Set(fields.find((field) => field.path === "type")?.enumValues ?? [])];
const coverage = optionCoverage(types, fields);
console.log(`wrote ${fields.length} options to ${out}`);
for (const row of coverage) console.log(`${row.type}\t${row.controls}\tjson ${row.json}`);
