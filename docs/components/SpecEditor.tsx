"use client";

import { useEffect, useRef, useState } from "react";
import { scaleSvgText } from "@/lib/chart";
import { THEMES } from "@/lib/specs";

interface Props {
  initialSpec: unknown;
  initialSvg: string;
  mode?: "compact" | "full" | "hero";
  labelScale?: number;
}

async function draw(spec: unknown, preset: boolean): Promise<string> {
  if (preset) await import("@chartkitdev/core/themes/all");
  const { render } = await import("@chartkitdev/core/all");
  return render(spec);
}

export function SpecEditor({ initialSpec, initialSvg, mode = "compact", labelScale = 1 }: Props) {
  const [text, setText] = useState(() => JSON.stringify(initialSpec, null, 2));
  const [svg, setSvg] = useState(initialSvg);
  const [theme, setTheme] = useState("site");
  const [status, setStatus] = useState("Showing the published spec.");
  const [issues, setIssues] = useState<string[]>([]);
  const skip = useRef(true);
  const keepStatus = useRef(false);

  async function renderText(source: string, themeName: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(source);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON";
      setStatus(message);
      setIssues([]);
      return;
    }
    const themed = applyTheme(parsed, themeName);
    try {
      const next = scaleSvgText(await draw(themed, themeName !== "site"), labelScale);
      setSvg(next);
      if (keepStatus.current) {
        keepStatus.current = false;
      } else if (next.includes("ck-chart-error")) {
        setStatus("This spec rendered an error chart. Validate or Repair it.");
        setIssues([]);
      } else {
        setStatus(themeName === "site" ? "Rendered." : `Rendered with the ${themeName} theme.`);
        setIssues([]);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Render failed");
    }
  }

  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void renderText(text, theme);
    }, 160);
    return () => window.clearTimeout(timer);
    // theme and text are the inputs; renderText is recreated each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, theme]);

  useEffect(() => {
    if (mode !== "full") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(hash));
      setText(JSON.stringify(parsed, null, 2));
      setStatus("Loaded the spec from the link.");
    } catch {
      setStatus("The link hash is not JSON.");
    }
  }, [mode]);

  async function onValidate() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid JSON");
      return;
    }
    const { validate } = await import("@chartkitdev/core/validate");
    const result = validate(parsed);
    setIssues(result.errors.map((error) => `${error.code} ${error.path} ${error.message}`));
    setStatus(result.ok ? "Valid." : `${result.errors.length} diagnostic${result.errors.length === 1 ? "" : "s"}.`);
  }

  async function onRepair() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid JSON");
      return;
    }
    const { repair } = await import("@chartkitdev/core/validate");
    const result = repair(parsed);
    keepStatus.current = true;
    setText(JSON.stringify(result.spec, null, 2));
    setIssues(result.errors.map((error) => `${error.code} ${error.path} ${error.message}`));
    setStatus(
      result.applied.length
        ? `Applied ${result.applied.length} patch${result.applied.length === 1 ? "" : "es"}. ${result.ok ? "Valid." : "Diagnostics remain."}`
        : result.ok
          ? "Already valid. Nothing to repair."
          : "No safe patch applied.",
    );
  }

  async function onShare() {
    const url = `${window.location.origin}/playground#${encodeURIComponent(text)}`;
    window.history.replaceState(null, "", `#${encodeURIComponent(text)}`);
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Link copied.");
    } catch {
      setStatus("Link updated in the address bar.");
    }
  }

  function onSvg() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    download(blob, "chartkit.svg");
  }

  function onPng() {
    const sized = svg.replace('width="100%"', 'width="640"');
    const blob = new Blob([sized], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth * scale;
      canvas.height = image.naturalHeight * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#ffffff";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((png) => {
        if (png) download(png, "chartkit.png");
      });
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }

  const preset = theme !== "site";

  const frame = mode === "full" ? "editor editor-full" : mode === "hero" ? "editor editor-hero" : "editor";

  return (
    <div className={frame}>
      <div className={preset ? "chart-host chart-preset preview" : "chart-host preview"} dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="editor-side">
        <label htmlFor="spec-json">Chart spec (JSON)</label>
        <textarea
          id="spec-json"
          value={text}
          spellCheck={false}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="editor-actions">
          {mode === "full" ? (
            <>
              <label className="theme-label" htmlFor="theme-select">
                Theme
                <select id="theme-select" value={theme} onChange={(event) => setTheme(event.target.value)}>
                  <option value="site">Match site</option>
                  {THEMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="btn btn-ghost" onClick={() => void onValidate()}>
                Validate
              </button>
              <button type="button" className="btn btn-primary" onClick={() => void onRepair()}>
                Repair
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void onShare()}>
                Share
              </button>
              <button type="button" className="btn btn-ghost" onClick={onSvg}>
                SVG
              </button>
              <button type="button" className="btn btn-ghost" onClick={onPng}>
                PNG
              </button>
            </>
          ) : (
            <a className="btn btn-ghost" href={`/playground#${encodeURIComponent(text)}`}>
              Open in playground
            </a>
          )}
        </div>
        <p className="status" role="status">
          {status}
        </p>
        {issues.length > 0 ? (
          <ul className="issues">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function applyTheme(spec: unknown, themeName: string): unknown {
  if (typeof spec !== "object" || spec === null || Array.isArray(spec)) return spec;
  const next = { ...(spec as Record<string, unknown>) };
  if (themeName === "site") delete next.theme;
  else next.theme = themeName;
  return next;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
