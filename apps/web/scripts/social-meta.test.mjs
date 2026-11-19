/**
 * Every built HTML page exposes an absolute share image.
 * Redirect hops are Astro's refresh stubs. They are not share targets.
 *
 *   npm run build --workspace=chartkit-web
 *   node --test apps/web/scripts/social-meta.test.mjs
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist", import.meta.url));

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

function metaTags(html) {
  const tags = [];
  for (const match of html.matchAll(/<meta\b([^>]*?)\/?>/gi)) {
    const attrs = {};
    for (const attr of match[1].matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      attrs[attr[1].toLowerCase()] = attr[2] ?? attr[3] ?? "";
    }
    tags.push(attrs);
  }
  return tags;
}

function isHop(html) {
  return /http-equiv\s*=\s*["']refresh["']/i.test(html) && !/property\s*=\s*["']og:title["']/i.test(html);
}

function absolute(url) {
  try {
    const parsed = new URL(url);
    return (parsed.protocol === "https:" || parsed.protocol === "http:") && parsed.host.length > 0;
  } catch {
    return false;
  }
}

test("built pages have an absolute og:image and twitter:card", () => {
  const htmlFiles = walk(dist).filter((path) => path.endsWith(".html"));
  assert.ok(htmlFiles.length > 0, "apps/web/dist has no HTML. Build the site first.");
  const pages = htmlFiles.filter((path) => !isHop(readFileSync(path, "utf8")));
  assert.ok(pages.length > 10, `only ${pages.length} HTML pages after skipping redirects`);

  const failures = [];
  for (const path of pages) {
    const html = readFileSync(path, "utf8");
    const tags = metaTags(html);
    const og = tags.filter((tag) => tag.property === "og:image").map((tag) => tag.content ?? "");
    const twitterImage = tags.filter((tag) => tag.name === "twitter:image").map((tag) => tag.content ?? "");
    const card = tags.find((tag) => tag.name === "twitter:card")?.content ?? "";
    const problems = [];
    if (og.length === 0) problems.push("missing og:image");
    if (!card) problems.push("missing twitter:card");
    else if (card !== "summary_large_image") problems.push(`twitter:card is ${card}`);
    for (const url of [...og, ...twitterImage]) {
      if (!absolute(url)) problems.push(`image URL is not absolute: ${url || "(empty)"}`);
    }
    if (twitterImage.length === 0) problems.push("missing twitter:image");
    if (problems.length) failures.push(`${path.slice(dist.length)}: ${problems.join("; ")}`);
  }
  assert.deepEqual(failures, []);
});
