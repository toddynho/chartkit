"use client";

import { useState } from "react";
import type { DashChart, DashSpark, DashTheme, Dashboard } from "@/lib/dashboards";
import { ChartHost } from "./ChartHost";

function withTheme(spec: Record<string, unknown>, theme: DashTheme): Record<string, unknown> {
  return { ...spec, theme };
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

function Figure({ chart, theme }: { chart: DashChart; theme: DashTheme }) {
  const spec = withTheme(chart.spec, theme);
  return (
    <figure className={`dash-card ${chart.span}`}>
      <figcaption>
        <h3>{chart.title}</h3>
        <p>{chart.caption}</p>
      </figcaption>
      <ChartHost spec={spec} svg={chart.svg} className="chart-host chart-preset" />
      <p className="dash-option">{chart.note}</p>
      <SpecBlock spec={spec} />
    </figure>
  );
}

function Score({ chart, spark, theme }: { chart: DashChart; spark?: DashSpark; theme: DashTheme }) {
  const spec = withTheme(chart.spec, theme);
  const sparkSpec = spark ? withTheme(spark.spec, theme) : null;
  return (
    <article className="dash-card dash-4 dash-score">
      <ChartHost spec={spec} svg={chart.svg} className="chart-host chart-preset" />
      {spark && sparkSpec ? <ChartHost spec={sparkSpec} svg={spark.svg} className="chart-host chart-preset dash-spark" /> : null}
      <p className="dash-option">{chart.note}</p>
      <SpecBlock spec={spec} />
      {sparkSpec ? <SpecBlock spec={sparkSpec} /> : null}
    </article>
  );
}

export function DashboardStage({ board }: { board: Dashboard }) {
  const [theme, setTheme] = useState<DashTheme>(board.defaultTheme);
  const scores = board.charts.filter((item) => item.spec.type === "kpi");
  const rest = board.charts.filter((item) => item.spec.type !== "kpi");
  const paired = scores.length > 0 && scores.length === board.sparks.length;
  const rows = paired ? [] : board.sparks;

  return (
    <div className={`dash-page dash-${board.slug} dash-theme-${theme}`}>
      <div className="dash-toolbar">
        <p className="dash-affiliation">Inspired by common SaaS dashboard styles. ChartKit is not affiliated with any product.</p>
        <div className="theme-switch" role="group" aria-label="Chart theme">
          {(["soft", "midnight"] as const).map((item) => (
            <button key={item} type="button" aria-pressed={theme === item} onClick={() => setTheme(item)}>
              {item === "soft" ? "Soft" : "Midnight"}
            </button>
          ))}
        </div>
      </div>
      <div className="dash-grid">
        {scores.map((item, index) => (
          <Score key={item.id} chart={item} spark={paired ? board.sparks[index] : undefined} theme={theme} />
        ))}
        {rest.map((item) => (
          <Figure key={item.id} chart={item} theme={theme} />
        ))}
        {rows.length ? (
          <section className="dash-card dash-12">
            <h3>Issues</h3>
            <p>One sparkline spec per row.</p>
            <ul className="dash-issues">
              {rows.map((item) => {
                const spec = withTheme(item.spec, theme);
                return (
                  <li key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.detail}</span>
                    </div>
                    <ChartHost spec={spec} svg={item.svg} className="chart-host chart-preset dash-spark" />
                    <SpecBlock spec={spec} />
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>
      <h2>What produces this look</h2>
      <ul className="dash-notes">
        {board.notes.map((note) => (
          <li key={note.label}>
            <strong>{note.label}.</strong> {note.detail}
          </li>
        ))}
      </ul>
    </div>
  );
}
