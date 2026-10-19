"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChartHost } from "./ChartHost";
import type { MermaidCard, ReadyChart, RepairCard, StackSnippet } from "@/lib/showcase";

const CHART_THEMES = ["soft", "refined", "editorial", "midnight"] as const;
import type { OptionLink } from "@/lib/showcase-options";

function playgroundHref(spec: unknown): string {
  return `/playground#${encodeURIComponent(JSON.stringify(spec))}`;
}

function withTheme(spec: Record<string, unknown>, theme: string): Record<string, unknown> {
  return { ...spec, theme };
}

function SpecBlock({ spec }: { spec: unknown }) {
  const text = JSON.stringify(spec, null, 2);
  return (
    <div className="spec-tools">
      <p className="spec-actions">
        <button type="button" className="btn" onClick={() => void navigator.clipboard.writeText(text)}>
          Copy spec
        </button>
        <a className="btn" href={playgroundHref(spec)}>
          Open in playground
        </a>
      </p>
      <details className="spec-fold">
        <summary>View spec</summary>
        <pre className="spec-block spec-scroll">
          <code>{text}</code>
        </pre>
      </details>
    </div>
  );
}

function ChartFigure({ chart, theme }: { chart: ReadyChart; theme: string }) {
  const spec = withTheme(chart.spec, theme);
  const kpi = chart.spec.type === "kpi";
  return (
    <figure className={`board-card ${chart.span}${kpi ? " kpi-card" : ""}`}>
      {kpi ? null : (
        <figcaption>
          <h3>{chart.title}</h3>
          <p>{chart.caption}</p>
        </figcaption>
      )}
      <ChartHost spec={spec} svg={chart.svg} className="chart-host chart-preset" />
      {kpi ? <p className="kpi-note">{chart.caption}</p> : null}
      <script type="application/json" data-ck-spec={chart.id} dangerouslySetInnerHTML={{ __html: JSON.stringify(spec) }} />
      <SpecBlock spec={spec} />
    </figure>
  );
}

function Stacks({ snippets }: { snippets: StackSnippet[] }) {
  const [id, setId] = useState(snippets[0]?.id ?? "");
  const current = snippets.find((snippet) => snippet.id === id) ?? snippets[0];
  if (!current) return null;
  return (
    <div className="board-card board-12">
      <h3>The same spec, in each stack</h3>
      <div className="theme-switch" role="tablist" aria-label="Adapter">
        {snippets.map((snippet) => (
          <button key={snippet.id} type="button" role="tab" aria-selected={snippet.id === current.id} onClick={() => setId(snippet.id)}>
            {snippet.label}
          </button>
        ))}
      </div>
      <pre className="spec-block spec-scroll">
        <code>{current.code}</code>
      </pre>
      <p className="spec-actions">
        <button type="button" className="btn btn-ghost" onClick={() => void navigator.clipboard.writeText(current.code)}>
          Copy {current.label}
        </button>
        <Link href={`/features/${current.feature}`}>{current.label} in the matrix</Link>
      </p>
    </div>
  );
}

export function ShowcaseStage({
  charts,
  mermaid = [],
  repairs = [],
  stacks,
}: {
  charts: ReadyChart[];
  mermaid?: MermaidCard[];
  repairs?: RepairCard[];
  stacks?: StackSnippet[];
}) {
  const [theme, setTheme] = useState<string>("soft");
  const themedMermaid = useMemo(() => mermaid, [mermaid]);
  return (
    <>
      <div className="theme-switch" role="radiogroup" aria-label="Chart theme">
        {CHART_THEMES.map((name) => (
          <button key={name} type="button" role="radio" aria-checked={theme === name} onClick={() => setTheme(name)}>
            {name}
          </button>
        ))}
      </div>
      <div className="board-grid">
        {charts.map((chart) => (
          <ChartFigure key={chart.id} chart={chart} theme={theme} />
        ))}
        {stacks ? <Stacks snippets={stacks} /> : null}
        {themedMermaid.map((card) => (
          <article key={card.id} className="board-card board-12 mermaid-pair">
            <div>
              <h3>{card.title}</h3>
              <p>{card.caption}</p>
              <pre className="spec-block spec-scroll">
                <code>{card.source}</code>
              </pre>
              {card.warnings.length ? (
                <ul className="issues">
                  {card.warnings.map((warning) => (
                    <li key={warning.message}>
                      {warning.code ? `${warning.code} ` : ""}
                      {warning.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="meta">fromMermaid returned this spec with no warnings. validatePhase4 passed.</p>
              )}
            </div>
            <div>
              <ChartHost spec={withTheme(card.chart.spec, theme)} svg={card.chart.svg} className="chart-host chart-preset" />
              <SpecBlock spec={withTheme(card.chart.spec, theme)} />
            </div>
          </article>
        ))}
        {repairs.map((item) => (
          <article key={item.id} className="board-card board-12">
            <h3>{item.title}</h3>
            <p>{item.caption}</p>
            <div className="repair-pair">
              <div>
                <h4>Broken</h4>
                <pre className="spec-block spec-scroll">
                  <code>{JSON.stringify(item.broken, null, 2)}</code>
                </pre>
                <ul className="issues">
                  {item.errors.map((error) => (
                    <li key={`${error.code}${error.path}`}>
                      {error.code} {error.path} — {error.message}
                      {error.hint ? ` ${error.hint}` : ""}
                    </li>
                  ))}
                  {item.warnings.map((warning) => (
                    <li key={`${warning.code}${warning.path}`}>
                      {warning.code} {warning.path} — {warning.message}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>After repair</h4>
                {item.svg ? (
                  <ChartHost spec={withTheme(item.repaired ?? {}, theme)} svg={item.svg} className="chart-host chart-preset" />
                ) : null}
                {item.applied.length ? (
                  <ol className="issues">
                    {item.applied.map((patch) => (
                      <li key={`${patch.op}${patch.path}`}>
                        {patch.op} {patch.path}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="meta">repair() applied no patch. The warning stays.</p>
                )}
                {item.repaired ? <SpecBlock spec={withTheme(item.repaired, theme)} /> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export function OptionList({ options }: { options: OptionLink[] }) {
  return (
    <ul className="option-list">
      {options.map((option) => (
        <li key={option.id}>
          <Link href={`/features/${option.id}`}>{option.label}</Link>
          <code>{option.id}</code>
        </li>
      ))}
    </ul>
  );
}
