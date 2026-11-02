import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const theme = z
  .object({
    bg: z.string(),
    chrome: z.string(),
    surface: z.string(),
    border: z.string(),
    text: z.string(),
    muted: z.string(),
    accent: z.string(),
    accent2: z.string(),
    accent3: z.string(),
    grid: z.string(),
    up: z.string(),
    down: z.string(),
    radius: z.number(),
    gap: z.number(),
    row: z.number(),
    navActive: z.string(),
    dark: z.boolean().optional(),
    h1: z.number().optional(),
    chipR: z.number().optional(),
    shadow: z.string().optional(),
    labelCase: z.string().optional(),
    labelTrack: z.union([z.string(), z.number()]).optional(),
    mapBg: z.string().optional(),
    font: z.string().optional(),
    pad: z.number().optional(),
  })
  .passthrough();

const dashboards = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/dashboards" }),
  schema: z
    .object({
      order: z.number().int(),
      id: z.string(),
      name: z.string(),
      blurb: z.string(),
      app: z.string(),
      user: z.string(),
      chrome: z.enum(["sidebar", "topbar"]),
      active: z.number().int(),
      nav: z.array(z.string()),
      title: z.string(),
      sub: z.string(),
      filters: z.array(z.string()),
      theme,
      panels: z.array(z.record(z.string(), z.unknown())),
    })
    .passthrough(),
});

export const collections = { dashboards };
