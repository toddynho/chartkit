"use client";

import { useEffect, useRef, useState } from "react";

/** US choropleth beside a bar chart. Click or Enter on a state swaps the bars. */
export function StateBoard({
  mapSvg,
  bars,
  initial = "CA",
  names,
}: {
  mapSvg: string;
  bars: Record<string, string>;
  initial?: string;
  names: Record<string, string>;
}) {
  const [id, setId] = useState(initial);
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const svg = mapRef.current?.querySelector("svg");
    if (!svg) return;
    let detach = () => {};
    let alive = true;
    void import("@chartkitdev/geo").then(({ attach }) => {
      if (!alive) return;
      detach = attach(svg, {
        onSelect: (item) => {
          if (item.id && bars[item.id]) setId(item.id);
        },
      });
    });
    return () => {
      alive = false;
      detach();
    };
  }, [bars, mapSvg]);
  return (
    <div className="map-board" id="ck-state-board">
      <div ref={mapRef} className="chart-host chart-preset" dangerouslySetInnerHTML={{ __html: mapSvg }} />
      <div>
        <p className="kicker">
          {names[id] ?? id}. City bars, not counties.
        </p>
        <div key={id} className="chart-host chart-preset" dangerouslySetInnerHTML={{ __html: bars[id] ?? "" }} />
      </div>
    </div>
  );
}
