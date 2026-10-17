import type { MetadataRoute } from "next";
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
    "/docs/spec",
    "/docs/theming",
    "/docs/migrate",
    "/examples",
    "/playground",
    "/benchmarks",
    "/agents",
    "/demo",
    "/compare",
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
