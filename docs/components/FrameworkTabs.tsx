"use client";

import { useEffect, useState } from "react";
import { FRAMEWORKS, type FrameworkId } from "@/lib/snippets";
import { CopyButton } from "./CopyButton";

export function FrameworkTabs({ snippets }: { snippets: Record<FrameworkId, string> }) {
  const [tab, setTab] = useState<FrameworkId>("react");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ck-fw");
      if (saved && saved in snippets) setTab(saved as FrameworkId);
    } catch {
      /* ignore */
    }
  }, [snippets]);

  function pick(id: FrameworkId) {
    setTab(id);
    try {
      localStorage.setItem("ck-fw", id);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="tabs">
      <div role="tablist" aria-label="Framework" className="tablist">
        {FRAMEWORKS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            className={tab === item.id ? "tab on" : "tab"}
            onClick={() => pick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="code">
        <div className="code-bar">
          <span>{FRAMEWORKS.find((item) => item.id === tab)?.label}</span>
          <CopyButton text={snippets[tab]} label="Copy code" />
        </div>
        <pre>
          <code>{snippets[tab]}</code>
        </pre>
      </div>
    </div>
  );
}
