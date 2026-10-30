import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  type AfterViewInit,
  type OnChanges,
  type OnDestroy,
} from "@angular/core";
import type { ChartSpec } from "@chartkitdev/core";
import { mount, type MountedChart } from "@chartkitdev/vanilla";
import { paint, type RenderChart } from "./paint";

/**
 * Standalone Angular component. The server HTML includes the SVG for a core chart.
 * `afterNextRender` calls `mount()` from `@chartkitdev/vanilla` in the browser only.
 * OnPush plus `ngOnChanges` redraws when `spec` changes.
 */
@Component({
  selector: "ck-chart",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="chartkit"></div>`,
})
export class Chart implements OnChanges, AfterViewInit, OnDestroy {
  /** A v1 chart spec. The same object renders in every ChartKit adapter. */
  @Input({ required: true }) spec!: ChartSpec;
  /** Defaults to the core charts. Pass `createRenderer([...])` to draw a subset, or the SSR renderer to include the rest. */
  @Input() render?: RenderChart;

  private readonly host = inject(ElementRef<HTMLElement>);
  private box?: HTMLElement;
  private chart?: MountedChart;

  constructor() {
    afterNextRender(() => this.arm());
  }

  ngOnChanges(): void {
    if (!this.spec) return;
    if (this.chart) {
      this.chart.update(this.spec);
      return;
    }
    this.draw();
  }

  ngAfterViewInit(): void {
    this.box = this.host.nativeElement.querySelector(".chartkit") ?? undefined;
    if (!this.chart) this.draw();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = undefined;
  }

  private draw(): void {
    const el = this.box;
    if (!el || !this.spec) return;
    const svg = paint(this.spec, this.render);
    if (el.innerHTML !== svg) el.innerHTML = svg;
  }

  private arm(): void {
    const el = this.box ?? this.host.nativeElement.querySelector(".chartkit");
    if (!(el instanceof HTMLElement) || !this.spec || this.chart) return;
    this.box = el;
    if (!el.querySelector("svg")) this.draw();
    this.chart = mount(el, this.spec, this.render ? { render: this.render } : undefined);
  }
}
