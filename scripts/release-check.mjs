/**
 * Build every library, then pack, publint, and check types for each public package.
 * Does not publish. Todd runs the Publish workflow for that.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoUrl = "git+https://github.com/toddynho/chartkit.git";

function publicPackages() {
  return readFileSync(join(root, "scripts/public-packages.txt"), "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [name, dir, profile] = line.split(/\s+/);
      return { name, dir, profile };
    });
}

const packages = publicPackages();
for (const { name, dir } of packages) {
  const pkg = JSON.parse(readFileSync(join(root, dir, "package.json"), "utf8"));
  const repo = pkg.repository ?? {};
  const problems = [];
  if (pkg.name !== name) problems.push(`name is ${pkg.name}`);
  if (pkg.private) problems.push("private is set");
  if (repo.type !== "git" || repo.url !== repoUrl || repo.directory !== dir) {
    problems.push(`repository is ${JSON.stringify(repo)}`);
  }
  if (pkg.publishConfig?.access !== "public" || pkg.publishConfig?.provenance !== true) {
    problems.push(`publishConfig is ${JSON.stringify(pkg.publishConfig ?? null)}`);
  }
  if (problems.length) {
    console.error(`${name}: ${problems.join("; ")}`);
    process.exit(1);
  }
}

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
  for (const { name, profile } of packages) {
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
