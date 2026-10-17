"use client";

import { useEffect, useState } from "react";
import { paletteFromBrand } from "@chartkitdev/core/themes/brand";
import { render } from "@chartkitdev/core/all";

export function BrandPalette() {
  const [hex, setHex] = useState("#007aff");
  const [scheme, setScheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setScheme(root.classList.contains("dark") ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  let series: string[] = [];
  let message = "";
  let svg = "";
  try {
    series = paletteFromBrand(hex, scheme);
    const spec = {
      version: "1",
      type: "bar",
      data: series.slice(0, 4).map((color, index) => ({ lane: `S${index + 1}`, value: 8 + index * 3, swatch: color })),
      encoding: { x: "lane", y: "value", color: "lane" },
      theme: { tokens: { series } },
      legend: false,
      size: { width: 480, height: 180 },
      a11y: { alt: `Four bars painted from a palette derived from ${hex} for ${scheme} mode.` },
    };
    svg = render(spec);
  } catch (caught) {
    message = caught instanceof Error ? caught.message : "That colour is not a hex value.";
    series = [];
  }

  return (
    <div>
      <div className="brand-row">
        <label>
          Brand colour
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#007aff"}
            aria-label="Brand colour"
            onChange={(event) => setHex(event.target.value)}
          />
        </label>
        <p className="meta">
          <code>paletteFromBrand(&quot;{hex}&quot;, &quot;{scheme}&quot;)</code> from{" "}
          <code>@chartkitdev/core/themes/brand</code>. The page scheme picks light or dark. Every colour clears 3:1 on
          white or on <code>#09090b</code>, not on this card.
        </p>
      </div>
      {message ? <p className="status">{message}</p> : null}
      <div className="swatches" aria-hidden="true">
        {series.map((color) => (
          <span key={color} className="swatch" style={{ background: color }} title={color} />
        ))}
      </div>
      {svg ? <div className="chart-host chart-preset" dangerouslySetInnerHTML={{ __html: svg }} /> : null}
    </div>
  );
}
