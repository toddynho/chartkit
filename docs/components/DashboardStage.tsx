"use client";

import { useEffect, useState } from "react";
import type { DashChart, DashSpark, DashTheme, Dashboard } from "@/lib/dashboards";
import { ChartHost } from "./ChartHost";

function withTheme(spec: Record<string, unknown>, theme: DashTheme): Record<string, unknown> {
  return { ...spec, theme };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Phone width redraws wide charts so labels stay at body size and ticks thin out. */
function fitMobile(spec: Record<string, unknown>): Record<string, unknown> {
  const type = typeof spec.type === "string" ? spec.type : "";
  if (type === "kpi" || type === "bar-list") return spec;
  if (type === "donut" || type === "pie") return { ...spec, size: { width: 340, height: 420 } };
  if (type === "choropleth" || type === "map-points") return { ...spec, size: { width: 360, height: 280 } };
  const current = isRecord(spec.size) ? spec.size : {};
  const height = typeof current.height === "number" ? current.height : 240;
  if (height < 120) return spec;
  const axes = isRecord(spec.axes) ? spec.axes : {};
  const axis = (value: unknown) => {
    if (value === false) return false;
    return { ...(isRecord(value) ? value : {}), ticks: 4 };
  };
  return {
    ...spec,
    size: { width: 360, height: 240 },
    axes: { ...axes, x: axis(axes.x), y: axis(axes.y) },
  };
}

function present(spec: Record<string, unknown>, theme: DashTheme, narrow: boolean): Record<string, unknown> {
  const themed = withTheme(spec, theme);
  return narrow ? fitMobile(themed) : themed;
}

function SpecBlock({ spec }: { spec: unknown }) {
  const text = JSON.stringify(spec, null, 2);
  return (
    <details className="spec-fold">
      <summary>View spec</summary>
      <pre className="spec-block spec-scroll">
        <code>{text}</code>
      </pre>
    </details>
  );
}

function StaticChart({ svg, className }: { svg: string; className?: string }) {
  return <div className={className} data-ck-mounted="1" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function Figure({ chart, theme, narrow }: { chart: DashChart; theme: DashTheme; narrow: boolean }) {
  const variants = chart.variants ?? [];
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [mapOn, setMapOn] = useState(false);
  const [mapSvg, setMapSvg] = useState("");
  const variant = variants.find((item) => item.id === variantId) ?? variants[0];
  const spec = present(variant?.spec ?? chart.spec, theme, narrow);
  const svg = variant?.svg ?? chart.svg ?? "";
  const list = chart.spec.type === "bar-list";

  useEffect(() => {
    if (!mapOn || !chart.mapSpec) return;
    let alive = true;
    setMapSvg("");
    void import("@chartkitdev/geo").then(async (geo) => {
      const drawn = await geo.render(present(chart.mapSpec ?? {}, theme, narrow));
      if (alive) setMapSvg(drawn);
    });
    return () => {
      alive = false;
    };
  }, [mapOn, theme, narrow, chart.mapSpec]);

  const body = mapOn ? (
    mapSvg ? <StaticChart svg={mapSvg} className="chart-host chart-preset" /> : <p className="dash-wait">Drawing the map…</p>
  ) : list ? (
    <StaticChart svg={svg} className="chart-host chart-preset dash-list" />
  ) : (
    <ChartHost spec={spec} svg={svg} className="chart-host chart-preset" />
  );

  return (
    <figure className={`dash-card ${chart.span} ${chart.cardClass ?? ""}`}>
      <figcaption className="dash-cap">
        <h3>{chart.title}</h3>
        {variants.length ? (
          <div className="dash-seg" role="group" aria-label={`${chart.title} view`}>
            {variants.map((item) => (
              <button key={item.id} type="button" aria-pressed={item.id === (variant?.id ?? "")} onClick={() => setVariantId(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
        {chart.mapSpec ? (
          <div className="dash-seg" role="group" aria-label="Country view">
            <button type="button" aria-pressed={!mapOn} onClick={() => setMapOn(false)}>
              Bars
            </button>
            <button type="button" aria-pressed={mapOn} onClick={() => setMapOn(true)}>
              Map
            </button>
          </div>
        ) : null}
      </figcaption>
      {chart.table ? (
        <div className="dash-split">
          <div>{body}</div>
          <table className="dash-table">
            <caption>{chart.table.title}</caption>
            <thead>
              <tr>
                {chart.table.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.table.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell, index) => (
                    <td key={`${cell}-${index}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        body
      )}
      <SpecBlock spec={mapOn && chart.mapSpec ? present(chart.mapSpec, theme, narrow) : spec} />
    </figure>
  );
}

function Score({ chart, theme }: { chart: DashChart; theme: DashTheme }) {
  const spec = withTheme(chart.spec, theme);
  return (
    <article className="dash-card dash-4 dash-score">
      <ChartHost spec={spec} svg={chart.svg} className="chart-host chart-preset" />
      <SpecBlock spec={spec} />
    </article>
  );
}

function Issues({ rows, theme, narrow }: { rows: DashSpark[]; theme: DashTheme; narrow: boolean }) {
  return (
    <section className="dash-card dash-12">
      <h3>Issues</h3>
      <ul className="dash-issues">
        {rows.map((item) => {
          const spec = present(item.spec, theme, narrow);
          return (
            <li key={item.id}>
              <div className="dash-issue-name">
                <strong>{item.name}</strong>
                <span>{item.detail}</span>
              </div>
              <ChartHost spec={spec} svg={item.svg} className="chart-host chart-preset dash-issue-bars" />
              <div className="dash-issue-metrics">
                <b>{item.events}</b>
                <span>events</span>
                <b>{item.users}</b>
                <span>users</span>
              </div>
              <SpecBlock spec={spec} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function DashboardStage({ board }: { board: Dashboard }) {
  const [theme, setTheme] = useState<DashTheme>(board.defaultTheme);
  const [narrow, setNarrow] = useState(false);
  const scores = board.charts.filter((item) => item.spec.type === "kpi");
  const rest = board.charts.filter((item) => item.spec.type !== "kpi");

  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");
    const apply = () => setNarrow(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return (
    <div className={`dash-shell dash-page dash-${board.slug} dash-theme-${theme}`}>
      <header className="dash-top">
        <div className="dash-id">
          <h1>{board.product}</h1>
          <p>{board.lede}</p>
        </div>
        <span className="dash-chip">{board.range}</span>
        <div className="theme-switch" role="group" aria-label="Chart theme">
          {(["soft", "midnight"] as const).map((item) => (
            <button key={item} type="button" aria-pressed={theme === item} onClick={() => setTheme(item)}>
              {item === "soft" ? "Soft" : "Midnight"}
            </button>
          ))}
        </div>
      </header>
      <div className="dash-grid">
        {scores.map((item) => (
          <Score key={item.id} chart={item} theme={theme} />
        ))}
        {rest.map((item) => (
          <Figure key={item.id} chart={item} theme={theme} narrow={narrow} />
        ))}
        {board.sparks.length ? <Issues rows={board.sparks} theme={theme} narrow={narrow} /> : null}
      </div>
      <section className="dash-explain">
        <h2>What produces this look</h2>
        <ul className="dash-notes">
          {board.notes.map((note) => (
            <li key={note.label}>
              <strong>{note.label}.</strong> {note.detail}
            </li>
          ))}
        </ul>
        <p className="dash-affiliation">
          Inspired by common SaaS dashboard styles. ChartKit is not affiliated with any product.{" "}
          <a href={`/dashboards/${board.slug}.md`}>{board.slug}.md</a>
        </p>
      </section>
    </div>
  );
}
