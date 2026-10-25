import { attach } from "@chartkitdev/geo";

const board = document.querySelector<HTMLElement>("[data-state-board]");
const map = board?.querySelector("svg");
const barsHost = board?.querySelector<HTMLElement>("[data-state-bars]");
const data = document.querySelector<HTMLScriptElement>("#state-bars");
if (board && map && barsHost && data?.textContent) {
  const bars = JSON.parse(data.textContent) as Record<string, string>;
  attach(map, {
    onSelect: (item) => {
      if (item.id && bars[item.id]) barsHost.innerHTML = bars[item.id];
    },
  });
}
