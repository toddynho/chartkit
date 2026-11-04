import { describe, expect, it } from "vitest";
import { render } from "../extra";

const alt = "Stage values can be hidden or formatted.";

const funnel = {
  version: "1",
  type: "funnel",
  data: [
    { stage: "Visit", count: 80 },
    { stage: "Pay", count: 12 },
  ],
  encoding: { x: "stage", y: "count" },
  a11y: { alt },
};

const waterfall = {
  version: "1",
  type: "waterfall",
  data: [
    { step: "Open", amount: 40 },
    { step: "Close", amount: -15 },
  ],
  encoding: { x: "step", y: "amount" },
  a11y: { alt },
};

describe("funnel and waterfall value labels", () => {
  it("hides funnel values when mark.labels is false and formats them when asked", () => {
    const plain = render(funnel) ?? "";
    const hidden = render({ ...funnel, mark: { labels: false } }) ?? "";
    const money = render({ ...funnel, mark: { labelFormat: { style: "currency", currency: "USD", decimals: 0 } } }) ?? "";
    expect(plain).toContain(">80<");
    expect(hidden).not.toContain(">80<");
    expect(hidden).toContain(">Visit<");
    expect(money).toContain(">$80<");
  });

  it("hides waterfall values when mark.labels is false", () => {
    const plain = render(waterfall) ?? "";
    const hidden = render({ ...waterfall, mark: { labels: false } }) ?? "";
    expect(plain).toContain('font-weight="600">40<');
    expect(hidden).not.toContain('font-weight="600">40<');
    expect(hidden).toContain(">Open<");
  });
});
