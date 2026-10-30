import type { APIRoute } from "astro";
import { renderBarList } from "@chartkitdev/core/charts/bar-list";
import { render as renderGeo } from "@chartkitdev/geo";
import { heroExtra, heroTypes } from "../../data/hero-catalog";

const GEO = new Set(["choropleth", "map-points"]);

export function getStaticPaths() {
  return heroTypes.filter((type) => !type.slide).map((type) => ({ params: { type: type.type } }));
}

function drawn(spec: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...spec };
  delete copy.title;
  delete copy.subtitle;
  return copy;
}

export const GET: APIRoute = async ({ params }) => {
  const type = params.type ?? "";
  const extra = heroExtra[type];
  const meta = heroTypes.find((item) => item.type === type);
  if (!extra || !meta) return new Response("Unknown chart type", { status: 404 });
  let svg = "";
  if (GEO.has(type)) svg = await renderGeo(drawn(extra.spec));
  else if (type === "bar-list") svg = renderBarList(drawn(extra.spec)) ?? "";
  return new Response(
    JSON.stringify({
      type,
      title: meta.title,
      subtitle: meta.subtitle,
      motion: extra.motion,
      spec: extra.spec,
      ...(svg ? { svg } : {}),
    }),
    { headers: { "content-type": "application/json; charset=utf-8" } },
  );
};
