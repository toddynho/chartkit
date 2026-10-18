"use client";

import { useState } from "react";
import { ChartHost } from "./ChartHost";

export interface LookPanel {
  id: string;
  label: string;
  detail: string;
  charts: { title: string; svg: string; spec: unknown }[];
}

export function ThemeShowcase({ looks }: { looks: LookPanel[] }) {
  const [id, setId] = useState(looks[0]?.id ?? "soft");
  const look = looks.find((item) => item.id === id) ?? looks[0];
  if (!look) return null;

  return (
    <div>
      <div className="look-switch" role="group" aria-label="Chart look">
        {looks.map((item) => (
          <button key={item.id} type="button" aria-pressed={item.id === look.id} onClick={() => setId(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <p className="meta">{look.detail}</p>
      <div className={`look-stage look-${look.id}`}>
        <div className="look-grid">
          {look.charts.map((chart) => (
            <ChartHost
              key={`${look.id}-${chart.title}`}
              spec={chart.spec}
              svg={chart.svg}
              className="chart-host chart-preset"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
