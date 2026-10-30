import "@angular/compiler";
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { bootstrapApplication } from "@angular/platform-browser";
import { renderApplication } from "@angular/platform-server";
import type { ChartSpec } from "@chartkitdev/core";
import { beforeEach, describe, expect, it } from "vitest";
import { Chart } from "../../dist/fesm2022/chartkitdev-angular.mjs";

const line = {
  version: "1" as const,
  type: "line" as const,
  data: [
    { quarter: "Q1", units: 40 },
    { quarter: "Q2", units: 55 },
  ],
  encoding: { x: "quarter", y: "units" },
  a11y: { alt: "Units rose from Q1 to Q2." },
} satisfies ChartSpec;

describe("Angular Chart", () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [Chart] });
  });

  it("writes the SVG during the render lifecycle", async () => {
    const fixture = TestBed.createComponent(Chart);
    fixture.componentRef.setInput("spec", line);
    fixture.detectChanges();
    await fixture.whenStable();
    const svg = fixture.nativeElement.querySelector("svg");
    expect(svg?.getAttribute("data-ck-type")).toBe("line");
    expect(svg?.getAttribute("aria-label")).toBe(line.a11y.alt);
    expect(fixture.nativeElement.querySelectorAll("svg")).toHaveLength(1);
  });

  it("updates in place when the spec changes", async () => {
    const fixture = TestBed.createComponent(Chart);
    fixture.componentRef.setInput("spec", line);
    fixture.detectChanges();
    await fixture.whenStable();
    const next = {
      ...line,
      a11y: { alt: "Units fell from Q1 to Q2." },
      data: [
        { quarter: "Q1", units: 55 },
        { quarter: "Q2", units: 40 },
      ],
    };
    fixture.componentRef.setInput("spec", next);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll("svg")).toHaveLength(1);
    expect(fixture.nativeElement.querySelector("svg")?.getAttribute("aria-label")).toBe(next.a11y.alt);
  });
});

describe("Angular SSR", () => {
  it("includes the SVG in platform-server HTML", async () => {
    class Host {
      spec = line;
    }
    Component({
      standalone: true,
      imports: [Chart],
      selector: "app-spec",
      template: `<ck-chart [spec]="spec" />`,
    })(Host);
    const html = await renderApplication((context) => bootstrapApplication(Host, undefined, context), {
      document: "<!DOCTYPE html><html><head></head><body><app-spec></app-spec></body></html>",
    });
    expect(html).toContain('data-ck-type="line"');
    expect(html).toContain("Units rose from Q1 to Q2.");
    expect(html.match(/<svg/g)).toHaveLength(1);
  });
});
