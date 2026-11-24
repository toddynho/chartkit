import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { chartPageTypes, docArticlePages } from "../data/docs-catalog";
import { SITE } from "../data/site";
import { themePages } from "../data/theme-pages";
import { loadCompareIndex } from "../lib/batch3";

export const GET: APIRoute = async () => {
  const boards = await getCollection("dashboards");
  const paths = new Set<string>(["/", "/dashboards", "/gallery", "/docs", "/cloud", "/agents", "/compare", "/benchmarks"]);
  for (const file of Object.keys(import.meta.glob("./**/*.astro"))) {
    if (file.includes("[")) continue;
    const route = file
      .replace(/^\.\//, "/")
      .replace(/\/index\.astro$/, "")
      .replace(/\.astro$/, "");
    if (route.endsWith("/404")) continue;
    // /examples is a noindex page that forwards to /playground.
    if (route === "/examples") continue;
    paths.add(route === "" ? "/" : route);
  }
  for (const board of boards) paths.add(`/dashboards/${board.data.id}`);
  // Generated routes, from the lists their getStaticPaths use. /examples/* and /showcase/* only redirect.
  for (const { library } of loadCompareIndex().rivals) paths.add(`/compare/${library.id}`);
  for (const { slug } of docArticlePages()) paths.add(`/docs/${slug}`);
  for (const type of chartPageTypes) paths.add(`/docs/charts/${type}`);
  for (const page of themePages) paths.add(`/docs/themes/${page.slug}`);

  const urls = [...paths].sort().map((path) => {
    const loc = new URL(path, SITE.url).href;
    return `<url><loc>${loc}</loc></url>`;
  });
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
