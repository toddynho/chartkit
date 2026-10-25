import { attach } from "@chartkitdev/geo";

/** Hover, focus, and click on choropleth and bubble maps. */
export function attachMaps(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-geo]").forEach((host) => {
    const svg = host.querySelector("svg");
    if (!svg || host.dataset.geoAttached === "1") return;
    attach(svg);
    host.dataset.geoAttached = "1";
  });
}

attachMaps();
