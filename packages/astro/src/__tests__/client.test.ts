/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { hydrate } from "../client.js";
import { renderToString } from "../render.js";

const line = {
  version: "1" as const,
  type: "line" as const,
  data: [
    { quarter: "Q1", units: 40 },
    { quarter: "Q2", units: 55 },
  ],
  encoding: { x: "quarter", y: "units" },
  a11y: { alt: "Units rose from Q1 to Q2." },
};

describe("hydrate", () => {
  it("mounts the server SVG in place and does not add a second chart", () => {
    const svg = renderToString(line);
    const host = document.createElement("div");
    host.setAttribute("data-chartkit", "");
    const script = document.createElement("script");
    script.type = "application/json";
    script.textContent = JSON.stringify(line);
    host.append(script);
    host.insertAdjacentHTML("beforeend", svg);
    document.body.append(host);

    hydrate(document);
    hydrate(document);

    expect(host.dataset.chartkitOn).toBe("1");
    expect(host.querySelector("script")).toBeNull();
    expect(host.querySelectorAll("svg")).toHaveLength(1);
    expect(host.querySelector("svg")?.getAttribute("data-ck-type")).toBe("line");
    expect(host.querySelector("svg")?.getAttribute("aria-label")).toBe(line.a11y.alt);
  });
});
