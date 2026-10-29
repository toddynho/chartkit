/**
 * Build every library, then pack, publint, and check types for each public package.
 * Does not publish. Todd runs the Publish workflow for that.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Dependency order. core and geo have no workspace deps. The shim depends on react.
 * attw profile: dual packages ignore Node 10 (engines is >=20). ESM-only packages
 * also ignore require().
 */
const packages = [
  ["@chartkitdev/core", "node16"],
  ["@chartkitdev/geo", "esm-only"],
  ["@chartkitdev/react", "node16"],
  ["@chartkitdev/vue", "node16"],
  ["@chartkitdev/svelte", "esm-only"],
  ["@chartkitdev/vanilla", "node16"],
  ["@chartkitdev/element", "node16"],
  ["@chartkitdev/markdown", "node16"],
  ["@chartkitdev/mcp", "esm-only"],
  ["@derpdaderp/chartkit", "node16"],
];

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", env: process.env });
  if (result.status !== 0) {
    console.error(`\nrelease:check failed: ${command} ${args.join(" ")}`);
    process.exit(result.status || 1);
  }
}

run("npm", ["run", "build:lib"]);

const dest = mkdtempSync(join(tmpdir(), "chartkit-release-"));
try {
  for (const [name, profile] of packages) {
    console.log(`\n# ${name}`);
    run("npm", ["pack", "--dry-run", "--workspace", name]);
    const before = new Set(readdirSync(dest));
    run("npm", ["pack", "--workspace", name, "--pack-destination", dest]);
    const tarball = readdirSync(dest).find((file) => !before.has(file) && file.endsWith(".tgz"));
    if (!tarball) {
      console.error(`no tarball written for ${name}`);
      process.exit(1);
    }
    const packed = join(dest, tarball);
    run("npx", ["publint", "--strict", packed]);
    run("npx", ["attw", "--pack", packed, "--profile", profile]);
  }
} finally {
  rmSync(dest, { recursive: true, force: true });
}

console.log("\nrelease:check ok");
