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
    if (hold || Array.isArray(currentAxis.ticks) || currentAxis.ticks === "ends") return currentAxis;
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

function MapCard({ chart, theme, narrow, framed = true }: { chart: DashChart; theme: DashTheme; narrow: boolean; framed?: boolean }) {
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
  const body = svg ? <StaticChart svg={svg} className="chart-host chart-preset" /> : <p className="dash-wait">Drawing the map…</p>;
  if (!framed) return body;
  return (
    <figure className={`dash-card ${chart.span}`}>
      <figcaption className="dash-cap">
        <h3>{chart.title}</h3>
      </figcaption>
      {body}
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
      <div className="dash-issue-head" aria-hidden="true">
        <span />
        <span>Issue</span>
        <span>Last seen</span>
        <span>Age</span>
        <span>Trend</span>
        <span>Events</span>
        <span>Users</span>
        <span>Priority</span>
        <span>Assignee</span>
      </div>
      <ul className="dash-issues">
        {rows.map((item) => {
          const spec = present(item.spec, theme, item.themes, narrow);
          return (
            <li key={item.id}>
              <input className="dash-check" type="checkbox" aria-label={`Select ${item.name}`} />
              <div className="dash-issue-name">
                <strong>{item.name}</strong>
                <span className="dash-culprit">{item.detail}</span>
                <span className="dash-tags">
                  {item.tags.map((tag) => (
                    <i key={tag}>{tag}</i>
                  ))}
                </span>
              </div>
              <span className="dash-issue-seen">{item.seen}</span>
              <span className="dash-issue-age">{item.age}</span>
              <span className="dash-trend">
                <ChartHost spec={spec} svg={item.svg} className="chart-host chart-preset dash-issue-bars" />
                <b>{item.events}</b>
              </span>
              <span className="dash-count dash-events">
                <b>{item.events}</b>
              </span>
              <span className="dash-count dash-users">
                <b>{item.users}</b>
              </span>
              <span className="dash-priority">{item.priority}</span>
              <span className="dash-assignee">{item.assignee}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ThemeSwitch({ theme, onChange }: { theme: DashTheme; onChange: (theme: DashTheme) => void }) {
  return (
    <div className="theme-switch" role="group" aria-label="Chart theme">
      {(["soft", "midnight"] as const).map((item) => (
        <button key={item} type="button" aria-pressed={theme === item} onClick={() => onChange(item)}>
          {item === "soft" ? "Soft" : "Midnight"}
        </button>
      ))}
    </div>
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
  const [reportsOpen, setReportsOpen] = useState(true);
  const tabs = board.charts.filter((item) => item.place === "tab");
  const metrics = board.charts.filter((item) => item.place === "metric");
  const hero = board.charts.find((item) => item.place === "hero");
  const lists = board.charts.filter((item) => item.place === "list");
  const sides = board.charts.filter((item) => item.place === "side");
  const maps = board.charts.filter((item) => item.place === "map");
  const live = board.charts.filter((item) => item.place === "realtime");
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
  const rail = ["Home", "Reports", "Explore", "Settings"];
  const reportNav = ["Snapshot", "Realtime", "Acquisition", "Engagement"];
  const feedNav = ["Issues", "Explore", "Dashboards", "Insights", "Settings"];
  const hbar = board.charts.find((item) => item.place === "hbar");
  const activity = board.charts.find((item) => item.place === "activity");
  const cohort = board.charts.find((item) => item.place === "cohort");
  const map = maps[0];
  const realtime = live[0];
  const docs = (
    <>
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
    </>
  );
  return (
    <div className={`dash-page dash-${board.slug} dash-theme-${theme}`}>
      <div className="dash-banner">
        <div className="dash-id">
          <h1>{board.title}</h1>
          <p className="dash-disclaimer">{board.disclaimer}</p>
        </div>
        <ThemeSwitch theme={theme} onChange={setTheme} />
      </div>
      <div className={`dash-shell dash-${board.slug} dash-theme-${theme}`}>
        {board.slug === "wayline" ? (
          <>
            <aside className="dash-rail" aria-label="Sections">
              <div className="dash-mark" aria-hidden="true">N</div>
              {rail.map((item, index) => (
                <button key={item} type="button" aria-label={item} aria-current={index === 1 ? "page" : undefined}>
                  <span className={`ico ico-${index}`} aria-hidden="true" />
                </button>
              ))}
            </aside>
            <aside className={`dash-reports ${reportsOpen ? "open" : "shut"}`} aria-label="Reports">
              <button type="button" className="dash-reports-toggle" aria-expanded={reportsOpen} onClick={() => setReportsOpen((open) => !open)}>
                Reports
              </button>
              {reportsOpen ? (
                <nav>
                  {reportNav.map((item, index) => (
                    <button key={item} type="button" aria-current={index === 0 ? "page" : undefined}>
                      {item}
                    </button>
                  ))}
                </nav>
              ) : null}
            </aside>
          </>
        ) : null}
        {board.slug === "keel" ? (
          <aside className="dash-rail dash-iconrail" aria-label="Sections">
            <div className="dash-mark" aria-hidden="true">N</div>
            <nav>
              {feedNav.map((item, index) => (
                <button key={item} type="button" aria-current={index === 0 ? "page" : undefined}>
                  <span className={`ico ico-${index}`} aria-hidden="true" />
                  <span className="dash-rail-label">{item}</span>
                </button>
              ))}
            </nav>
          </aside>
        ) : null}
        <div className="dash-main">
          {board.slug === "meter" ? (
            <div className="dash-plausible-bar">
              <button type="button" className="dash-picker">example.com</button>
              <span className="dash-live"><i />12</span>
              <button type="button" className="dash-filter">Filter</button>
              <button type="button" className="dash-picker">{board.range}</button>
            </div>
          ) : null}
          {board.slug === "keel" ? (
            <header className="dash-feedhead">
              <div className="dash-feedtools">
                <h2>Feed</h2>
                <button type="button" className="dash-picker">Project</button>
                <button type="button" className="dash-picker">Environment</button>
                <button type="button" className="dash-picker">{board.range}</button>
                <button type="button" className="dash-sort">Last Seen</button>
                <button type="button" className="dash-save">Save As</button>
              </div>
              <label className="dash-search">
                <span className="ico ico-search" aria-hidden="true" />
                <span className="dash-token">is:unresolved</span>
                <input type="search" placeholder="Search" aria-label="Search issues" />
              </label>
            </header>
          ) : null}
          {board.slug === "ledger" ? (
            <>
              {hero ? (
                <figure className="dash-card dash-solo dash-hero">
                  <ChartView chart={hero} theme={theme} narrow={narrow} spec={present(hero.spec, theme, hero.themes, narrow)} svg={hero.svg} />
                </figure>
              ) : null}
              <div className="dash-grid dash-home">
                {metrics.map((item) => (
                  <article key={item.id} className={`dash-card ${item.span} dash-score`}>
                    <ChartHost spec={present(item.spec, theme, item.themes, narrow)} svg={item.svg} className="chart-host chart-preset" />
                  </article>
                ))}
                {sideCards}
              </div>
            </>
          ) : null}
          {board.slug === "meter" && active ? (
            <div className="dash-grid">
              <div className="dash-12">
                <Tabs charts={tabs} active={tab} onPick={setTab} />
              </div>
              <figure className="dash-card dash-12 dash-hero">
                <ChartView chart={active} theme={theme} narrow={narrow} spec={present(active.spec, theme, active.themes, narrow)} svg={active.svg} />
              </figure>
              {activeList ? (
                <figure className="dash-card dash-12">
                  <div className="dash-seg" role="tablist" aria-label="Ranked lists">
                    {lists.map((item, index) => (
                      <button key={item.id} type="button" aria-pressed={index === list} onClick={() => setList(index)}>
                        {item.title}
                      </button>
                    ))}
                  </div>
                  <div className="dash-list-head" aria-hidden="true">
                    <span>{activeList.title}</span>
                    <span>Visitors</span>
                  </div>
                  <ChartView chart={activeList} theme={theme} narrow={narrow} spec={present(activeList.spec, theme, activeList.themes, narrow)} svg={activeList.svg} />
                </figure>
              ) : null}
            </div>
          ) : null}
          {board.slug === "wayline" ? (
            <div className="dash-snapshot">
              <article className="dash-card dash-usercard">
                <Tabs charts={tabs} active={tab} onPick={setTab} />
                {active ? <ChartView chart={active} theme={theme} narrow={narrow} spec={present(active.spec, theme, active.themes, narrow)} svg={active.svg} /> : null}
              </article>
              {realtime ? (
                <article className="dash-card dash-realtime">
                  <h3>{realtime.title}</h3>
                  <ChartView chart={realtime} theme={theme} narrow={narrow} spec={present(realtime.spec, theme, realtime.themes, narrow)} svg={realtime.svg} />
                  <table className="dash-mini">
                    <caption>Top countries</caption>
                    <tbody>
                      {[
                        ["United States", "42"],
                        ["Japan", "18"],
                        ["Germany", "11"],
                        ["Brazil", "9"],
                        ["India", "7"],
                      ].map(([name, count]) => (
                        <tr key={name}>
                          <td>{name}</td>
                          <td>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </article>
              ) : null}
              <article className="dash-card dash-insights">
                <h3>Insights</h3>
                <p>Weekday afternoons carry the most users.</p>
                <p>Search brings more new users than the other channels.</p>
                <p>The newest cohort is still in its first period.</p>
              </article>
              {hbar ? <Side chart={hbar} theme={theme} narrow={narrow} /> : null}
              <article className="dash-card">
                <h3>Sessions by channel</h3>
                <table className="dash-mini">
                  <tbody>
                    {[
                      ["Search", "10,290"],
                      ["Direct", "5,880"],
                      ["Mail", "3,920"],
                      ["Social", "2,695"],
                      ["Referral", "1,715"],
                    ].map(([name, count]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
              <article className="dash-card dash-mapcard">
                <h3>Users by country</h3>
                {map ? <MapCard chart={map} theme={theme} narrow={narrow} framed={false} /> : null}
                <table className="dash-mini">
                  <tbody>
                    {[
                      ["United States", "9,200"],
                      ["Japan", "7,100"],
                      ["United Kingdom", "5,400"],
                      ["Germany", "4,800"],
                      ["Brazil", "4,300"],
                    ].map(([name, count]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
              {activity ? <Side chart={activity} theme={theme} narrow={narrow} /> : null}
              {cohort ? <Side chart={cohort} theme={theme} narrow={narrow} /> : null}
            </div>
          ) : null}
          {board.slug === "keel" ? (
            <>
              {issues}
              <div className="dash-grid">{sideCards}</div>
            </>
          ) : null}
          {docs}
        </div>
      </div>
    </div>
  );
}
