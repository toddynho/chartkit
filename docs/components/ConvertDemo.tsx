"use client";

import { render } from "@chartkitdev/core/all";
import { convert, parseJsx, parseLiteral, samples, type ConvertResult, type JsxNode } from "@chartkitdev/convert";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createElement } from "react";
import { ChartHost } from "./ChartHost";

const LABELS: Record<string, string> = { chartjs: "Chart.js", recharts: "Recharts", echarts: "ECharts" };

export function ConvertDemo({ initial = "chartjs" }: { initial?: string }) {
  const starter = samples.find((item) => item.id === initial) ?? samples[0];
  const [text, setText] = useState(starter.source);
  const [sourceId, setSourceId] = useState(starter.id);
  const originalRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [originalError, setOriginalError] = useState("");
  const [reactChart, setReactChart] = useState<ReactNode>(null);

  const result = useMemo<ConvertResult>(() => convert(text), [text]);
  const specText = result.spec ? JSON.stringify(result.spec, null, 2) : "";
  const svg = result.spec ? render(result.spec) : "";
  const diff = useMemo(() => lineDiff(text, specText || "(no spec)"), [text, specText]);

  useEffect(() => {
    if (result.source !== "recharts") {
      setReactChart(null);
      return;
    }
    let dead = false;
    setOriginalError("");
    originalRef.current?.removeAttribute("data-original-ready");
    void import("recharts")
      .then((lib) => {
        if (dead) return;
        const parsed = parseJsx(text);
        if (!parsed.root) throw new Error("No Recharts chart tag in this snippet.");
        const modules = lib as unknown as Record<string, unknown>;
        const ResponsiveContainer = modules.ResponsiveContainer as (props: { width: string; height: number; children?: ReactNode }) => ReactNode;
        setReactChart(createElement(ResponsiveContainer, { width: "100%", height: 320 }, jsxToElement(parsed.root, modules)));
      })
      .catch((error: unknown) => {
        if (dead) return;
        setReactChart(null);
        setOriginalError(error instanceof Error ? error.message : "Recharts did not render this config.");
      });
    return () => {
      dead = true;
    };
  }, [text, result.source]);

  useEffect(() => {
    const host = originalRef.current;
    if (result.source === "recharts") {
      if (reactChart) host?.setAttribute("data-original-ready", "1");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const box = { dead: false, destroy: () => {} };
    canvas.replaceChildren();
    host?.removeAttribute("data-original-ready");
    setOriginalError("");
    void paintOriginal(result.source, text, canvas, box)
      .then(() => {
        if (!box.dead) host?.setAttribute("data-original-ready", "1");
      })
      .catch((error: unknown) => {
        if (box.dead) return;
        setOriginalError(error instanceof Error ? error.message : "The original library did not render this config.");
      });
    return () => {
      box.dead = true;
      box.destroy();
    };
  }, [text, result.source, reactChart]);

  return (
    <div className="convert" data-convert-demo="on">
      <div className="convert-toolbar">
        {samples.map((item) => (
          <button
            key={item.id}
            type="button"
            className={sourceId === item.id ? "btn btn-primary" : "btn btn-ghost"}
            aria-pressed={sourceId === item.id}
            onClick={() => {
              setSourceId(item.id);
              setText(item.source);
            }}
          >
            {item.label} sample
          </button>
        ))}
      </div>
      <label className="convert-label" htmlFor="convert-source">
        Chart.js config, Recharts JSX, or an ECharts option
      </label>
      <textarea
        id="convert-source"
        className="convert-source"
        value={text}
        spellCheck={false}
        onChange={(event) => {
          setSourceId("custom");
          setText(event.target.value);
        }}
      />
      <p className="convert-meta">
        Detected source: {result.source ? LABELS[result.source] : "none"}. Chart.js, Recharts, and ECharts load on this
        page only.
      </p>
      <div className="convert-grid">
        <figure className="convert-pane">
          <figcaption>Original{result.source ? `, ${LABELS[result.source]}` : ""}</figcaption>
          <div ref={originalRef} className="convert-original" data-original-host="1">
            {result.source === "recharts" ? reactChart : <div ref={canvasRef} className="convert-canvas" />}
          </div>
          {originalError ? <p role="alert">{originalError}</p> : null}
        </figure>
        <figure className="convert-pane">
          <figcaption>ChartKit</figcaption>
          {result.spec && svg ? (
            <ChartHost key={specText} spec={result.spec} svg={svg} className="chart-host" />
          ) : (
            <p>No ChartKit spec for this input.</p>
          )}
        </figure>
      </div>
      <section aria-labelledby="convert-warnings">
        <h2 id="convert-warnings">Warnings</h2>
        {result.warnings.length === 0 ? (
          <p>No warnings. Every key the converter read was mapped.</p>
        ) : (
          <ul className="convert-warnings">
            {result.warnings.map((warning, index) => (
              <li key={`${warning.code}-${warning.path}-${index}`}>
                <code>{warning.code}</code> {warning.path ? <code>{warning.path}</code> : null} {warning.message}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="convert-spec">
        <h2 id="convert-spec">Spec</h2>
        <pre className="convert-pre">
          <code>{specText || "null"}</code>
        </pre>
      </section>
      <section aria-labelledby="convert-diff">
        <h2 id="convert-diff">Source → ChartKit spec</h2>
        <pre className="convert-pre convert-diff" aria-label="Line diff from source to ChartKit spec">
          {diff.map((row, index) => (
            <div key={index} className={row.op === "+" ? "diff-add" : row.op === "-" ? "diff-del" : "diff-same"}>
              {row.op === " " ? " " : row.op}
              {row.text}
            </div>
          ))}
        </pre>
      </section>
    </div>
  );
}

async function paintOriginal(
  source: ConvertResult["source"],
  text: string,
  host: HTMLDivElement,
  box: { dead: boolean; destroy: () => void },
) {
  if (source === "chartjs") {
    const parsed = parseLiteral(text);
    const mod = await import("chart.js/auto");
    if (box.dead) return;
    const canvas = document.createElement("canvas");
    host.appendChild(canvas);
    const chart = new mod.default(canvas, parsed.value as never);
    box.destroy = () => chart.destroy();
    if (box.dead) box.destroy();
    return;
  }
  if (source === "echarts") {
    const parsed = parseLiteral(text);
    const echarts = await import("echarts");
    if (box.dead) return;
    const chart = echarts.init(host, undefined, { renderer: "canvas" });
    chart.setOption(parsed.value as never);
    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    box.destroy = () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
    };
    if (box.dead) box.destroy();
    return;
  }
  throw new Error("Paste a Chart.js config, Recharts JSX, or an ECharts option.");
}

function jsxToElement(node: JsxNode, lib: Record<string, unknown>): ReactNode {
  const Comp = lib[node.name];
  if (typeof Comp !== "function" && (typeof Comp !== "object" || Comp === null)) return null;
  const props: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node.props)) {
    if (value && typeof value === "object" && "__dropped" in value) continue;
    if (key === "width" || key === "height") continue;
    props[key] = value;
  }
  return createElement(Comp as never, props, ...node.children.map((child) => jsxToElement(child, lib)));
}

function lineDiff(before: string, after: string): { op: " " | "+" | "-"; text: string }[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: { op: " " | "+" | "-"; text: string }[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ op: " ", text: a[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ op: "-", text: a[i] });
      i += 1;
    } else {
      out.push({ op: "+", text: b[j] });
      j += 1;
    }
  }
  while (i < n) {
    out.push({ op: "-", text: a[i] });
    i += 1;
  }
  while (j < m) {
    out.push({ op: "+", text: b[j] });
    j += 1;
  }
  return out;
}
