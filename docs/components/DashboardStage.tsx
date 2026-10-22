"use client";

import { useEffect, useState } from "react";
import type { DashChart, DashSpark, DashTheme, DashThemes, Dashboard } from "@/lib/dashboards";
import { ChartHost } from "./ChartHost";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function withTheme(spec: Record<string, unknown>, theme: DashTheme, themes: DashThemes): Record<string, unknown> {
  const type = typeof spec.type === "string" ? spec.type : "";
  if (type === "choropleth" || type === "map-points") return { ...spec, theme };
  return { ...spec, theme: themes[theme] };
}

/** Phone width redraws wide charts so labels stay at body size and ticks thin out. */
function fitMobile(spec: Record<string, unknown>): Record<string, unknown> {
  const type = typeof spec.type === "string" ? spec.type : "";
  if (type === "kpi") return { ...spec, size: { width: 168, height: 104 } };
  if (type === "bar-list") {
    const currentSize = isRecord(spec.size) ? spec.size : {};
    const height = typeof currentSize.height === "number" ? currentSize.height : 180;
    return { ...spec, size: { width: 340, height } };
  }
  if (type === "donut" || type === "pie") return { ...spec, size: { width: 340, height: 420 } };
  if (type === "choropleth" || type === "map-points") return { ...spec, size: { width: 360, height: 280 } };
  const current = isRecord(spec.size) ? spec.size : {};
  const height = typeof current.height === "number" ? current.height : 240;
  if (height < 120) return spec;
  const axes = isRecord(spec.axes) ? spec.axes : {};
  const encoding = isRecord(spec.encoding) ? spec.encoding : {};
  const temporalX = isRecord(encoding.x) && encoding.x.type === "temporal";
  const axis = (value: unknown, hold: boolean) => {
    if (value === false) return false;
    const currentAxis = isRecord(value) ? value : {};
    if (hold || Array.isArray(currentAxis.ticks)) return currentAxis;
    return { ...currentAxis, ticks: 4 };
  };
  return {
    ...spec,
    size: { width: 360, height: 240 },
    axes: { ...axes, x: axis(axes.x, temporalX), y: axis(axes.y, false) },
  };
}

function present(spec: Record<string, unknown>, theme: DashTheme, themes: DashThemes, narrow: boolean, themed?: DashThemes): Record<string, unknown> {
  const next = themed ? themed[theme] : withTheme(spec, theme, themes);
  return narrow ? fitMobile(next) : next;
}

function StaticChart({ svg, className }: { svg: string; className?: string }) {
  return <div className={className} data-ck-mounted="1" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function ChartView({ chart, theme, narrow, spec, svg }: { chart: DashChart; theme: DashTheme; narrow: boolean; spec: Record<string, unknown>; svg: string }) {
  const list = spec.type === "bar-list" || chart.spec.type === "bar-list";
  if (list) {
    const drawn = (narrow ? chart.phone : chart.svgs)?.[theme] ?? chart.svgs?.[theme] ?? svg;
    return <StaticChart svg={drawn} className="chart-host chart-preset dash-list" />;
  }
  return <ChartHost spec={spec} svg={svg} className="chart-host chart-preset" />;
}

function Side({ chart, theme, narrow }: { chart: DashChart; theme: DashTheme; narrow: boolean }) {
  const variants = chart.variants ?? [];
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const variant = variants.find((item) => item.id === variantId) ?? variants[0];
  const spec = present(variant?.spec ?? chart.spec, theme, chart.themes, narrow, chart.themed);
  const svg = variant?.svg ?? chart.svg;
  return (
    <figure className={`dash-card ${chart.span}`}>
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
      </figcaption>
      <ChartView chart={chart} theme={theme} narrow={narrow} spec={spec} svg={svg} />
    </figure>
  );
}

function MapCard({ chart, theme, narrow }: { chart: DashChart; theme: DashTheme; narrow: boolean }) {
  const spec = present(chart.spec, theme, chart.themes, narrow, chart.themed);
  const [svg, setSvg] = useState("");
  const key = JSON.stringify(spec);
  useEffect(() => {
    let alive = true;
    setSvg("");
    void import("@chartkitdev/geo").then(async (geo) => {
      const drawn = await geo.render(JSON.parse(key) as Record<string, unknown>);
      if (alive) setSvg(drawn);
    });
    return () => {
      alive = false;
    };
  }, [key]);
  return (
    <figure className={`dash-card ${chart.span}`}>
      <figcaption className="dash-cap">
        <h3>{chart.title}</h3>
      </figcaption>
      {svg ? <StaticChart svg={svg} className="chart-host chart-preset" /> : <p className="dash-wait">Drawing the map…</p>}
    </figure>
  );
}

function Tabs({ charts, active, onPick }: { charts: DashChart[]; active: number; onPick: (index: number) => void }) {
  return (
    <div className="dash-tabs" role="tablist">
      {charts.map((chart, index) => {
        const tab = chart.tab;
        if (!tab) return null;
        return (
          <button key={chart.id} type="button" role="tab" aria-selected={index === active} aria-pressed={index === active} onClick={() => onPick(index)}>
            <span className="dash-tab-label">{tab.label}</span>
            <span className="dash-tab-value">{tab.value}</span>
            <span className={`dash-tab-delta ${tab.good ? "up" : "down"}`}>{tab.delta}</span>
          </button>
        );
      })}
    </div>
  );
}

function Issues({ rows, theme, narrow }: { rows: DashSpark[]; theme: DashTheme; narrow: boolean }) {
  return (
    <section className="dash-card dash-12 dash-feed">
      <h3>Issues</h3>
      <div className="dash-issue-head" aria-hidden="true">
        <span>Issue</span>
        <span>Last seen</span>
        <span>Age</span>
        <span>Trend</span>
        <span>Events</span>
        <span>Users</span>
      </div>
      <ul className="dash-issues">
        {rows.map((item) => {
          const spec = present(item.spec, theme, item.themes, narrow);
          return (
            <li key={item.id}>
              <div className="dash-issue-name">
                <strong>{item.name}</strong>
                <span>{item.detail}</span>
              </div>
              <span className="dash-issue-seen">{item.seen}</span>
              <span className="dash-issue-age">{item.age}</span>
              <ChartHost spec={spec} svg={item.svg} className="chart-host chart-preset dash-issue-bars" />
              <span className="dash-count dash-events">
                <b>{item.events}</b>
                <i>events</i>
              </span>
              <span className="dash-count dash-users">
                <b>{item.users}</b>
                <i>users</i>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Specs({ board, theme, narrow }: { board: Dashboard; theme: DashTheme; narrow: boolean }) {
  return (
    <details className="dash-specs">
      <summary>View spec</summary>
      {board.charts.map((chart) => {
        const spec = present(chart.spec, theme, chart.themes, narrow, chart.themed);
        return (
          <div key={chart.id}>
            <h3>{chart.title}</h3>
            <pre className="spec-block spec-scroll">
              <code>{JSON.stringify(spec, null, 2)}</code>
            </pre>
            {(chart.variants ?? []).map((variant) =>
              variant.spec === chart.spec ? null : (
                <div key={variant.id}>
                  <h3>
                    {chart.title} · {variant.label}
                  </h3>
                  <pre className="spec-block spec-scroll">
                    <code>{JSON.stringify(present(variant.spec, theme, chart.themes, narrow), null, 2)}</code>
                  </pre>
                </div>
              ),
            )}
          </div>
        );
      })}
      {board.sparks.map((item) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <pre className="spec-block spec-scroll">
            <code>{JSON.stringify(present(item.spec, theme, item.themes, narrow), null, 2)}</code>
          </pre>
        </div>
      ))}
    </details>
  );
}

export function DashboardStage({ board }: { board: Dashboard }) {
  const [theme, setTheme] = useState<DashTheme>(board.defaultTheme);
  const [narrow, setNarrow] = useState(false);
  const [tab, setTab] = useState(0);
  const [list, setList] = useState(0);
  const tabs = board.charts.filter((item) => item.place === "tab");
  const metrics = board.charts.filter((item) => item.place === "metric");
  const hero = board.charts.find((item) => item.place === "hero");
  const lists = board.charts.filter((item) => item.place === "list");
  const sides = board.charts.filter((item) => item.place === "side");
  const maps = board.charts.filter((item) => item.place === "map");
  const active = tabs[tab] ?? tabs[0];
  const activeList = lists[list] ?? lists[0];

  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");
    const apply = () => setNarrow(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const issues = board.sparks.length ? <Issues rows={board.sparks} theme={theme} narrow={narrow} /> : null;
  const sideCards = sides.map((item) => <Side key={item.id} chart={item} theme={theme} narrow={narrow} />);
  const mapCards = maps.map((item) => <MapCard key={item.id} chart={item} theme={theme} narrow={narrow} />);

  return (
    <div className={`dash-shell dash-page dash-${board.slug} dash-theme-${theme}`}>
      <header className="dash-top">
        <div className="dash-id">
          <h1>{board.title}</h1>
          <p>{board.lede}</p>
          <p className="dash-disclaimer">{board.disclaimer}</p>
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
        {board.slug === "keel" ? issues : null}
        {hero ? (
          <figure className={`dash-card ${hero.span} dash-hero`}>
            {board.headline ? (
              <div className="dash-headline">
                <span className="dash-tab-label">{board.headline.label}</span>
                <span className="dash-headline-row">
                  <b>{board.headline.value}</b>
                  <span className={board.headline.good ? "up" : "down"}>{board.headline.delta}</span>
                </span>
              </div>
            ) : (
              <h3>{hero.title}</h3>
            )}
            <ChartView chart={hero} theme={theme} narrow={narrow} spec={present(hero.spec, theme, hero.themes, narrow)} svg={hero.svg} />
          </figure>
        ) : null}
        {tabs.length && active ? (
          <>
            <div className="dash-12">
              <Tabs charts={tabs} active={tab} onPick={setTab} />
            </div>
            <figure className="dash-card dash-12 dash-hero">
              <ChartView chart={active} theme={theme} narrow={narrow} spec={present(active.spec, theme, active.themes, narrow)} svg={active.svg} />
            </figure>
          </>
        ) : null}
        {metrics.map((item) => (
          <article key={item.id} className={`dash-card ${item.span} dash-score`}>
            <ChartHost spec={present(item.spec, theme, item.themes, narrow)} svg={item.svg} className="chart-host chart-preset" />
          </article>
        ))}
        {activeList ? (
          <figure className="dash-card dash-12">
            <div className="dash-seg" role="tablist" aria-label="Ranked lists">
              {lists.map((item, index) => (
                <button key={item.id} type="button" aria-pressed={index === list} onClick={() => setList(index)}>
                  {item.title}
                </button>
              ))}
            </div>
            <ChartView chart={activeList} theme={theme} narrow={narrow} spec={present(activeList.spec, theme, activeList.themes, narrow)} svg={activeList.svg} />
          </figure>
        ) : null}
        {board.slug === "keel" ? null : issues}
        {sideCards}
        {mapCards}
      </div>
      <Specs board={board} theme={theme} narrow={narrow} />
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
          {board.disclaimer} <a href={`/dashboards/${board.slug}.md`}>{board.slug}.md</a>
        </p>
      </section>
    </div>
  );
}
