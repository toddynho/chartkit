/**
 * README drift checks. Reads package source and the Astro pages as text.
 * Does not import a library bundle.
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "vendor", "third_party", "third-party", ".astro"]);

function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (/^readme(\.|$)/i.test(entry.name)) out.push(path);
  }
  return out;
}

const readmes = walk(root, []);

function stripFences(text) {
  return text.replace(/```[\s\S]*?```/g, "");
}

function headingSlugs(text) {
  const slugs = new Set();
  for (const match of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const slug = match[1]
      .replace(/<[^>]+>/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-");
    if (slug) slugs.add(slug);
  }
  return slugs;
}

function loadPackages() {
  const packages = new Map();
  for (const dir of [join(root, "packages"), join(root, "apps")]) {
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      const pkgDir = join(dir, name);
      const pkgPath = join(pkgDir, "package.json");
      if (!existsSync(pkgPath)) continue;
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      if (pkg.name && pkg.exports) packages.set(pkg.name, { dir: pkgDir, exports: pkg.exports });
    }
  }
  return packages;
}

const packages = loadPackages();

function pickPublished(target) {
  if (typeof target === "string") return target;
  if (!target || typeof target !== "object") return null;
  const direct = [target.import, target.default, target.svelte, target.astro, target.types];
  for (const item of direct) {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      if (typeof item.default === "string") return item.default;
      if (typeof item.types === "string") return item.types;
    }
  }
  for (const value of Object.values(target)) {
    const found = pickPublished(value);
    if (found) return found;
  }
  return null;
}

function tsupEntries(pkgDir) {
  const config = join(pkgDir, "tsup.config.ts");
  if (!existsSync(config)) return {};
  const text = readFileSync(config, "utf8");
  const entries = {};
  for (const match of text.matchAll(/^\s*(?:"([^"]+)"|'([^']+)'|([\w./-]+))\s*:\s*(?:"(src\/[^"]+)"|'(src\/[^']+)')/gm)) {
    const key = match[1] || match[2] || match[3];
    const file = match[4] || match[5];
    if (key && file) entries[key] = file;
  }
  for (const match of text.matchAll(/entry\[`([^`$]+)`\]\s*=\s*"([^"]+)"/g)) entries[match[1]] = match[2];
  const chartList = text.match(/const charts = \[([\s\S]*?)\];/);
  if (chartList && text.includes("entry[`charts/${name}`]")) {
    for (const name of chartList[1].matchAll(/"([^"]+)"/g)) entries[`charts/${name[1]}`] = `src/charts/${name[1]}.ts`;
  }
  const themeList = text.match(/const themes = \[([\s\S]*?)\];/);
  if (themeList && text.includes("entry[`themes/${name}`]")) {
    for (const name of themeList[1].matchAll(/"([^"]+)"/g)) entries[`themes/${name[1]}`] = `src/themes/${name[1]}.ts`;
  }
  return entries;
}

function sourceFor(pkg, subpath) {
  const built = tsupEntries(pkg.dir);
  if (built[subpath === "." ? "index" : subpath]) {
    const file = resolve(pkg.dir, built[subpath === "." ? "index" : subpath]);
    if (existsSync(file)) return file;
  }
  const exportKey = subpath === "." ? "." : `./${subpath}`;
  let published = pickPublished(pkg.exports[exportKey]);
  if (!published) {
    for (const [key, value] of Object.entries(pkg.exports)) {
      if (!key.includes("*")) continue;
      const pattern = `^${key.replace(/[.+?^${}()|[\]\\*]/g, "\\$&").replace("\\*", "([^/]+)")}$`;
      const match = exportKey.match(new RegExp(pattern));
      if (!match) continue;
      const raw = pickPublished(value);
      published = raw ? raw.replaceAll("*", match[1]) : null;
      break;
    }
  }
  const candidates = [];
  if (published) {
    const rel = published.replace(/^\.\//, "");
    if (rel.startsWith("dist/")) {
      const stem = rel.replace(/^dist\//, "").replace(/\.(d\.cts|d\.ts|cjs|mjs|js)$/, "");
      for (const ext of [".ts", ".tsx", ".js", ".d.ts", ".mjs"]) candidates.push(resolve(pkg.dir, "src", stem + ext));
    }
    candidates.push(resolve(pkg.dir, rel));
  }
  if (subpath === ".") {
    for (const file of ["src/index.ts", "src/index.tsx", "src/index.js", "src/index.d.ts"]) candidates.push(resolve(pkg.dir, file));
  }
  if (subpath === "ssr") {
    for (const file of ["src/ssr.ts", "src/ssr.js", "src/ssr.d.ts"]) candidates.push(resolve(pkg.dir, file));
  }
  return candidates.find((file) => existsSync(file)) ?? null;
}

function packageOf(specifier) {
  const names = [...packages.keys()].sort((a, b) => b.length - a.length);
  for (const name of names) {
    if (specifier === name) return { pkg: packages.get(name), subpath: "." };
    if (specifier.startsWith(`${name}/`)) return { pkg: packages.get(name), subpath: specifier.slice(name.length + 1) };
  }
  return null;
}

function isWorkspace(specifier) {
  return specifier.startsWith("@chartkitdev/") || specifier.startsWith("@derpdaderp/");
}

function resolveModule(fromFile, specifier) {
  if (specifier.startsWith(".")) {
    const base = resolve(dirname(fromFile), specifier);
    const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.d.ts`, `${base}.mjs`, `${base}.svelte`, join(base, "index.ts"), join(base, "index.tsx"), join(base, "index.js")];
    // `export * from "./components"` names a directory. Skip it so the index file is read.
    return candidates.find((file) => existsSync(file) && !statSync(file).isDirectory()) ?? null;
  }
  const found = packageOf(specifier);
  if (!found) return null;
  return sourceFor(found.pkg, found.subpath);
}

function readExportNames(file, depth = 0, seen = new Set()) {
  const empty = { names: new Set(), hasDefault: false };
  if (!file || depth > 8 || seen.has(file) || !existsSync(file) || statSync(file).isDirectory()) return empty;
  seen.add(file);
  const text = readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
  const names = new Set();
  let hasDefault = /\bexport\s+default\b/.test(text);
  for (const match of text.matchAll(/export\s+(?:declare\s+)?(?:async\s+)?(?:function|const|let|var|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(match[1]);
  }
  for (const match of text.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}(?:\s+from\s+["']([^"']+)["'])?/g)) {
    for (const part of match[1].split(",")) {
      const bit = part.trim().replace(/^type\s+/, "");
      if (!bit) continue;
      const [local, alias] = bit.split(/\s+as\s+/);
      const exported = (alias || local).trim();
      if (exported === "default") hasDefault = true;
      else if (exported) names.add(exported);
    }
  }
  for (const match of text.matchAll(/export\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+["'][^"']+["']/g)) names.add(match[1]);
  for (const match of text.matchAll(/export\s+\*\s+from\s+["']([^"']+)["']/g)) {
    const nested = readExportNames(resolveModule(file, match[1]), depth + 1, seen);
    for (const name of nested.names) names.add(name);
    if (nested.hasDefault) hasDefault = true;
  }
  return { names, hasDefault };
}

function codeFences(text) {
  return [...text.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((match) => match[1]).join("\n");
}

function importClauses(text) {
  const found = [];
  const code = codeFences(text);
  for (const match of code.matchAll(/import\s+(?:type\s+)?([A-Za-z0-9_${}*,\s]+?)\s+from\s+["']([^"']+)["']/g)) {
    found.push({ clause: match[1], from: match[2] });
  }
  for (const match of code.matchAll(/import\s+["']([^"']+)["']/g)) {
    found.push({ clause: "", from: match[1], sideEffect: true });
  }
  return found;
}

function importedNames(clause) {
  const names = [];
  let hasDefault = false;
  let namespace = false;
  const brace = clause.match(/\{([^}]*)\}/);
  if (brace) {
    for (const part of brace[1].split(",")) {
      const bit = part.trim().replace(/^type\s+/, "");
      if (!bit) continue;
      names.push(bit.split(/\s+as\s+/)[0].trim());
    }
  }
  const rest = clause.replace(/\{[^}]*\}/g, "").replace(/,/g, " ").trim();
  if (rest.startsWith("*")) namespace = true;
  else if (rest) hasDefault = true;
  return { names, hasDefault, namespace };
}

function siteRoutes() {
  const pages = join(root, "apps/web/src/pages");
  const exact = new Set(["/"]);
  const patterns = [];
  function addFile(prefix, name) {
    const dynamic = name.startsWith("[");
    const spread = name.startsWith("[...");
    const base = name.replace(/\.(astro|ts|mjs|js)$/, "");
    let routeBase = base;
    if (base.endsWith(".json") || base.endsWith(".md") || base.endsWith(".xml") || base.endsWith(".png")) routeBase = base;
    else if (base.endsWith(".json") === false && name.endsWith(".ts")) routeBase = base;
    if (name.endsWith(".json.ts")) routeBase = name.slice(0, -".ts".length);
    else if (name.endsWith(".md.ts")) routeBase = name.slice(0, -".ts".length);
    else if (name.endsWith(".xml.ts")) routeBase = name.slice(0, -".ts".length);
    else if (name.endsWith(".png.ts")) routeBase = name.slice(0, -".ts".length);
    else routeBase = base.replace(/\.(astro|mjs|js)$/, "");
    if (!dynamic) {
      const route = routeBase === "index" ? prefix || "/" : `${prefix}/${routeBase}`.replace(/\/+/g, "/");
      exact.add(route === "" ? "/" : route);
      return;
    }
    const rest = spread ? ".+" : "[^/]+";
    const stem = routeBase.replace(/^\[\.\.\.[^\]]+\]/, "").replace(/^\[[^\]]+\]/, "");
    const pattern = stem ? `${prefix}/${rest}${stem.startsWith(".") ? stem : ""}` : `${prefix}/${rest}`;
    patterns.push(new RegExp(`^${pattern.replace(/\/+/g, "/")}$`));
  }
  function walkPages(dir, prefix) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith("[...")) patterns.push(new RegExp(`^${prefix}(?:/.*)?$`));
        else if (entry.name.startsWith("[")) patterns.push(new RegExp(`^${prefix}/${entry.name.replace(/^\[[^\]]+\]$/, "[^/]+")}$`.replace(entry.name, "[^/]+")));
        else walkPages(path, `${prefix}/${entry.name}`);
      } else addFile(prefix, entry.name);
    }
  }
  walkPages(pages, "");
  const config = readFileSync(join(root, "apps/web/astro.config.mjs"), "utf8");
  for (const match of config.matchAll(/"(\/[^"]+)":\s*\{\s*status:\s*\d+,\s*destination:\s*"([^"]+)"/g)) {
    exact.add(match[1].replace(/\/\[[^\]]+\]/g, ""));
    const source = match[1].replace(/\[(?:\.\.\.)?[^\]]+\]/g, "[^/]+");
    if (source.includes("[^/]+")) patterns.push(new RegExp(`^${source}$`));
    else exact.add(match[1]);
    const destination = match[2].split("#")[0].split("?")[0];
    if (destination.startsWith("/") && !destination.includes("[")) exact.add(destination);
  }
  return { exact, patterns };
}

const routes = siteRoutes();

function routeExists(pathname) {
  const path = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  if (routes.exact.has(path)) return true;
  return routes.patterns.some((pattern) => pattern.test(path));
}

function markdownLinks(text) {
  const links = [];
  for (const match of text.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) links.push(match[1]);
  return links;
}

test("README files exist outside dependencies", () => {
  assert.ok(readmes.length >= 20);
  assert.ok(readmes.every((file) => !file.includes("node_modules")));
});

test("README relative links and chartkit.dev routes resolve", () => {
  const problems = [];
  for (const file of readmes) {
    const text = readFileSync(file, "utf8");
    const prose = stripFences(text);
    const slugs = headingSlugs(prose);
    for (const href of markdownLinks(prose)) {
      if (href.startsWith("#")) {
        const slug = decodeURIComponent(href.slice(1));
        if (!slugs.has(slug)) problems.push(`${relative(root, file)} missing heading ${href}`);
        continue;
      }
      if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
        let url;
        try {
          url = new URL(href);
        } catch {
          problems.push(`${relative(root, file)} bad URL ${href}`);
          continue;
        }
        if (url.hostname === "chartkit.dev" || url.hostname === "www.chartkit.dev") {
          if (!routeExists(url.pathname)) problems.push(`${relative(root, file)} missing site route ${url.pathname}`);
        }
        continue;
      }
      if (href.startsWith("/")) {
        if (!routeExists(href)) problems.push(`${relative(root, file)} missing site route ${href}`);
        continue;
      }
      const [pathPart, hash] = href.split("#");
      const target = resolve(dirname(file), pathPart.split("?")[0]);
      if (!existsSync(target)) problems.push(`${relative(root, file)} missing ${href}`);
      else if (hash && target.endsWith(".md")) {
        const targetSlugs = headingSlugs(readFileSync(target, "utf8"));
        if (!targetSlugs.has(decodeURIComponent(hash))) problems.push(`${relative(root, file)} missing heading ${href}`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

test("README code imports name real workspace exports", () => {
  const problems = [];
  for (const file of readmes) {
    const text = readFileSync(file, "utf8");
    for (const item of importClauses(text)) {
      if (!isWorkspace(item.from)) continue;
      const source = resolveModule(file, item.from);
      if (!source) {
        problems.push(`${relative(root, file)} unresolved ${item.from}`);
        continue;
      }
      if (item.sideEffect) continue;
      const parsed = importedNames(item.clause);
      if (parsed.namespace) continue;
      const exported = readExportNames(source);
      if (parsed.hasDefault && !exported.hasDefault) problems.push(`${relative(root, file)} ${item.from} has no default export`);
      for (const name of parsed.names) {
        if (!exported.names.has(name)) problems.push(`${relative(root, file)} ${item.from} does not export ${name}`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

test("README chart-type counts match the catalog and the bench list", () => {
  const chartTypes = [...readFileSync(join(root, "apps/web/src/data/chart-types.ts"), "utf8").matchAll(/type:\s*"([^"]+)"/g)].map((match) => match[1]);
  const heroTypes = [...readFileSync(join(root, "apps/web/src/data/hero-catalog.ts"), "utf8").matchAll(/\{\s*type:\s*"([^"]+)"/g)].map((match) => match[1]);
  const galleryBlock = readFileSync(join(root, "bench/browser/chart-types.mjs"), "utf8").match(/export const GALLERY_TYPES = \[([\s\S]*?)\];/);
  const gallery = [...galleryBlock[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  assert.equal(chartTypes.length, gallery.length);
  assert.deepEqual([...chartTypes].sort(), [...gallery].sort());
  assert.equal(heroTypes.length, chartTypes.length + 2);
  assert.ok(heroTypes.includes("choropleth") && heroTypes.includes("map-points"));
  const rootReadme = readFileSync(join(root, "README.md"), "utf8");
  const benchReadme = readFileSync(join(root, "bench/README.md"), "utf8");
  assert.match(rootReadme, new RegExp(`${heroTypes.length} types`));
  assert.match(rootReadme, new RegExp(`${chartTypes.length} ids`));
  assert.match(benchReadme, new RegExp(`${gallery.length} types`));
});
