export interface OptionLink {
  id: string;
  label: string;
}

export interface SurfaceChart {
  id: string;
  title: string;
  caption: string;
  span: string;
  spec: Record<string, unknown>;
  svg: string;
  alt: string;
}

export interface StackSnippet {
  id: string;
  label: string;
  code: string;
  feature: string;
}

export interface RepairCard {
  id: string;
  title: string;
  caption: string;
  broken: Record<string, unknown>;
  errors: Diagnostic[];
  warnings: Diagnostic[];
  applied: { op: string; path: string; value?: unknown; from?: string }[];
  repaired: Record<string, unknown> | null;
  svg: string | null;
  alt: string;
}

export interface Diagnostic {
  code: string;
  path: string;
  message: string;
  hint?: string;
}

export interface MermaidCard {
  id: string;
  title: string;
  caption: string;
  source: string;
  warnings: { code?: string; message: string }[];
  chart: SurfaceChart;
}

export interface BenchSources {
  sizeMeasured: string;
  sizeCommit: string;
  benchMeasured: string;
  round: number;
  roundMeasured: string;
  roundCommit: string;
}

export interface ShowcaseBoard {
  slug: string;
  number: number;
  title: string;
  lede: string;
  charts: SurfaceChart[];
  options: OptionLink[];
  stacks?: StackSnippet[];
  mermaid?: MermaidCard[];
  repairs?: RepairCard[];
  losses?: { label: string; detail: string }[];
  sources?: BenchSources;
}

export interface ShowcaseCard {
  slug: string;
  number: number;
  title: string;
  lede: string;
  coverSvg: string | null;
  coverAlt: string;
  repairSvg: string | null;
  repairAlt: string;
}

export interface ShowcaseIndex {
  source: string;
  boards: ShowcaseCard[];
}

export interface ExampleCard {
  slug: string;
  title: string;
  group: string;
  groupId: string;
  type: string;
  blurb: string;
  svg: string;
  alt: string;
}

export interface ExamplesIndex {
  source: string;
  groups: { id: string; label: string }[];
  examples: ExampleCard[];
}

export interface ExampleFile extends ExampleCard {
  spec: Record<string, unknown>;
  snippets: { id: string; label: string; code: string }[];
}

export interface MatrixCell {
  status: string;
  tier: string | null;
  apiPaths: string[];
  verified: string;
  strength: string;
  source: string[];
  note?: string;
  assessed?: string;
}

export interface FeatureIndex {
  source: string;
  schemaVersion: string;
  generated: string;
  chartkitCommit: string;
  chartkitRechecked: string;
  dateChecked: string;
  synonymsNote: string;
  coverage: { cells: number; strong: number; weak: number; absence: number; unknown: number };
  taxonomy: { id: string; label: string; desc: string }[];
  notScored: { id: string; name: string; reason: string }[];
  chartkit: { version: string; bundleGzip: Record<string, unknown> | null };
  libraries: { id: string; name: string }[];
  features: { id: string; category: string; label: string; badge: string }[];
}

export interface FeatureFile {
  id: string;
  category: string;
  label: string;
  desc: string;
  badge: string;
  spec: Record<string, unknown> | null;
  svg: string | null;
  cells: Record<string, MatrixCell>;
}

export interface RaceChart {
  svg: string;
  alt: string;
  caption: string;
}

export interface HomeStoryChart {
  id: string;
  title: string;
  caption: string;
  alt: string;
  spec: Record<string, unknown>;
  svg: string;
}

export interface HomeStory {
  source: string;
  round: number;
  measured: string;
  coreCommit: string;
  lede: string;
  lineGzipBytes: string;
  uplotJsBytes: string;
  uplotCssBytes: string;
  uplotSumBytes: string;
  sizeMeasured: string;
  charts: HomeStoryChart[];
}

export interface BenchmarksPage {
  source: string;
  round: number;
  measured: string;
  coreCommit: string;
  agentMeasured: string;
  updateMethod: string;
  headline: Record<string, string>;
  bundle: RaceChart;
  initial1k: RaceChart;
  initial100k: RaceChart;
  initial1m: RaceChart;
  ssr: RaceChart;
  bundleRows: { lib: string; gzip: string; note: string }[];
  browserRows: { shape: string; points: string; ckI: string; upI: string; ckU: string; upU: string; call: string; tone: string }[];
  hoverRows: { lib: string; tip: string; painted: string; p95: string }[];
  firstHoverRows: { delay: string; ck: string; ckMax: string; uplot: string; uplotMax: string }[];
  samplingRows: { points: string; initial: string; update: string }[];
  ssrRows: { lib: string; mean: string; median: string; status: string }[];
  agentRows: { lib: string; noFirst: string; noTwo: string; offFirst: string; offTwo: string; tokens: string }[];
  published: {
    model: string;
    temperature: number;
    tasks: number;
    tokensOfficial: number[];
  };
  canvas: {
    measured: string;
    heads: string[];
    rows: { points: string; cells: string[] }[];
    losses: string;
  };
  browserClaim: string;
  hoverClaim: string;
  samplingClaim: string;
  rivalsOmitted: string;
}

export interface PlaygroundFile {
  spec: Record<string, unknown>;
  svg: string;
  themes: string[];
}
