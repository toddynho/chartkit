import { useEffect, useState, useSyncExternalStore } from "react";
import { SHOW_PLAYGROUND, playgroundHref } from "../../lib/dashboard-flags";
import { getDrawer, openDrawer, subscribe, type DrawerState } from "../../lib/dash-ui";

interface Props {
  name: string;
  panels: Record<string, unknown>[];
  pageSpec: string;
  themeSpec: string;
  themeNote: string;
}

export default function SpecDrawer({ name, panels, pageSpec, themeSpec, themeNote }: Props) {
  const drawer = useSyncExternalStore(subscribe, getDrawer, empty);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [drawer]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (!drawer) return null;
  const view = describe(drawer, name, panels, pageSpec, themeSpec, themeNote);

  async function copy() {
    try {
      await navigator.clipboard.writeText(view.code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <button type="button" className="dash-scrim" aria-label="Close spec" onClick={() => openDrawer(null)} />
      <aside className="dash-drawer" role="dialog" aria-modal="true" aria-labelledby="dash-drawer-title">
        <div className="dash-drawer__head">
          <div>
            <div className="dash-drawer__eye">{view.eyebrow}</div>
            <div className="dash-drawer__title" id="dash-drawer-title">
              {view.title}
            </div>
          </div>
          <button type="button" className="dash-drawer__copy" onClick={() => void copy()}>
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <button type="button" className="dash-drawer__x" aria-label="Close" onClick={() => openDrawer(null)}>
            ✕
          </button>
        </div>
        <pre>{view.code}</pre>
        <div className="dash-drawer__foot">
          <span>{view.foot}</span>
          {SHOW_PLAYGROUND ? <a href={playgroundHref(view.code)}>Open in playground ↗</a> : null}
        </div>
      </aside>
    </>
  );
}

function empty(): DrawerState {
  return null;
}

function describe(
  drawer: Exclude<DrawerState, null>,
  name: string,
  panels: Record<string, unknown>[],
  pageSpec: string,
  themeSpec: string,
  themeNote: string,
): { eyebrow: string; title: string; code: string; foot: string } {
  if (drawer.kind === "panel") {
    const panel = panels[drawer.index] ?? {};
    const title = typeof panel.title === "string" && panel.title ? panel.title : "Untitled panel";
    return {
      eyebrow: `Panel ${drawer.index + 1} of ${panels.length} · ChartSpec`,
      title,
      code: JSON.stringify(panel, null, 2),
      foot: "One spec, every framework. Theme is a reference, not a copy.",
    };
  }
  if (drawer.kind === "page") {
    return {
      eyebrow: `${panels.length} panels · DashboardSpec`,
      title: name,
      code: pageSpec,
      foot: "Paste into any ChartKit renderer.",
    };
  }
  return {
    eyebrow: "Theme tokens · chartkit.theme()",
    title: `${name} theme`,
    code: themeSpec,
    foot: themeNote,
  };
}
