import type { MetadataRoute } from "next";
import { librariesExceptChartkit, matrix } from "@/lib/matrix";
import { showcaseBoards } from "@/lib/showcase";
import { chartTypes, examples } from "@/lib/specs";

const BASE = "https://chartkit.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = [
    "",
    "/docs",
    "/docs/react",
    "/docs/vue",
    "/docs/svelte",
    "/docs/vanilla",
    "/docs/web-component",
    "/docs/spec",
    "/docs/theming",
    "/docs/migrate",
    "/docs/mermaid",
    "/docs/mcp",
    "/examples",
    "/playground",
    "/benchmarks",
    "/agents",
    "/demo",
    "/large",
    "/interaction",
    "/maps",
    "/compare",
    "/features",
    "/showcase",
    "/showcase.json",
    "/features.json",
    "/when-to-use",
    ...matrix().features.flatMap((feature) => [`/features/${feature.id}`, `/features/${feature.id}.md`]),
    ...librariesExceptChartkit().map((library) => `/compare/${library.id}`),
    ...showcaseBoards().flatMap((board) => [`/showcase/${board.slug}`, `/showcase/${board.slug}.md`]),
    "/benchmarks.json",
    "/benchmarks.md",
    "/benchmarks.schema.json",
    "/llms.txt",
    "/llms-full.txt",
    ...chartTypes.map((item) => `/docs/charts/${item.type}`),
    ...examples.map((item) => `/examples/${item.slug}`),
  ];
  return paths.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/examples" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
