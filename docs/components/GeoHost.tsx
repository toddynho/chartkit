"use client";

import { useEffect, useRef } from "react";

/** Server SVG, then geo attach for hover, focus, and click. Does not mount the cartesian host. */
export function GeoHost({ svg, className }: { svg: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current?.querySelector("svg");
    if (!el) return;
    let detach = () => {};
    let alive = true;
    void import("@chartkitdev/geo").then(({ attach }) => {
      if (!alive) return;
      detach = attach(el);
    });
    return () => {
      alive = false;
      detach();
    };
  }, [svg]);
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}
