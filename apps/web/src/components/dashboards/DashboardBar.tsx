import { useEffect, useId, useRef, useState } from "react";
import { navigate } from "astro:transitions/client";
import { SHOW_PLAYGROUND, playgroundHref } from "../../lib/dashboard-flags";
import { getDrawer, openDrawer } from "../../lib/dash-ui";

export interface BarItem {
  id: string;
  name: string;
  href: string;
  swatch: string;
}

interface Props {
  items: BarItem[];
  index: number;
  name: string;
  invert: boolean;
  prevHref: string;
  nextHref: string;
  specText: string;
}

export default function DashboardBar({ items, index, name, invert, prevHref, nextHref, specText }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const total = items.length;
  const counter = `${index + 1}/${total}`;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Escape") {
        if (getDrawer()) {
          openDrawer(null);
          return;
        }
        if (open) {
          setOpen(false);
          return;
        }
        event.preventDefault();
        void navigate("/dashboards");
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        setOpen(false);
        openDrawer(null);
        void navigate(event.key === "ArrowRight" ? nextHref : prevHref);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextHref, open, prevHref]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (root.current && event.target instanceof Node && !root.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copySpec() {
    try {
      await navigator.clipboard.writeText(specText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function show(kind: "page" | "theme") {
    setOpen(false);
    openDrawer({ kind });
  }

  return (
    <div className="dash-float" data-invert={invert ? "" : undefined} ref={root}>
      {open ? (
        <div className="dash-pop" id={listId} role="listbox" aria-label="Dashboards">
          <div className="dash-pop__head">Dashboards · ← → to switch</div>
          {items.map((item, itemIndex) => (
            <a key={item.id} href={item.href} className={itemIndex === index ? "is-on" : undefined} aria-current={itemIndex === index ? "page" : undefined}>
              <span className="dash-swatch" style={{ background: item.swatch }} />
              {item.name}
              <span className="dash-pop__n">{String(itemIndex + 1).padStart(2, "0")}</span>
            </a>
          ))}
          <div className="dash-pop__extra">
            <button type="button" onClick={() => show("page")}>
              Spec
            </button>
            <button type="button" onClick={() => show("theme")}>
              Theme
            </button>
            <button type="button" onClick={() => void copySpec()}>
              {copied ? "Copied ✓" : "Copy spec"}
            </button>
          </div>
        </div>
      ) : null}
      <div className="dash-pill">
        <a className="dash-home" href="/dashboards" title="All dashboards (Esc)">
          <Logo />
          ChartKit
        </a>
        <span className="dash-hair" />
        <a className="dash-round" href={prevHref} title="Previous (←)" aria-label="Previous dashboard">
          ‹
        </a>
        <button
          type="button"
          className={open ? "dash-name is-on" : "dash-name"}
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
        >
          <em>{name}</em>
          <span className="dash-count">{counter}</span>
        </button>
        <a className="dash-round" href={nextHref} title="Next (→)" aria-label="Next dashboard">
          ›
        </a>
        <span className="dash-hair dash-desk" />
        <button type="button" className="dash-text dash-desk" onClick={() => show("page")}>
          <code>{"{ }"}</code> Spec
        </button>
        <button type="button" className="dash-text dash-desk" onClick={() => show("theme")}>
          Theme
        </button>
        <button type="button" className="dash-text dash-desk" onClick={() => void copySpec()}>
          {copied ? "Copied ✓" : "Copy spec"}
        </button>
        {SHOW_PLAYGROUND ? (
          <a className="dash-play dash-desk" href={playgroundHref(specText)}>
            Playground ↗
          </a>
        ) : null}
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg className="dash-logo" width="18" height="18" viewBox="0 0 32 32" aria-hidden="true">
      <g transform="translate(16 16) scale(0.86) translate(-16 -16)">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M11.6 9V5.7C11.6 4.49 12.59 3.5 13.8 3.5h4.4c1.21 0 2.2.99 2.2 2.2V9h-2.2V6.4c0-.52-.43-.95-.95-.95h-2.5c-.52 0-.95.43-.95.95V9Z"
        />
        <path fill="currentColor" d="M9 9h14c4.92 0 6 1.08 6 6v7c0 4.92-1.08 6-6 6H9c-4.92 0-6-1.08-6-6v-7c0-4.92 1.08-6 6-6Z" />
        <rect className="logo-bars" x="9.8" y="20.4" width="3.2" height="5" rx="1.05" />
        <rect className="logo-bars" x="14.4" y="17.4" width="3.2" height="8" rx="1.05" />
        <rect className="logo-bars" x="19" y="13.8" width="3.2" height="11.6" rx="1.05" />
      </g>
    </svg>
  );
}
