import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const file = join(dirname(fileURLToPath(import.meta.url)), "../dist/cli.js");
const text = readFileSync(file, "utf8");
if (!text.startsWith("#!")) writeFileSync(file, `#!/usr/bin/env node\n${text}`);
chmodSync(file, 0o755);
