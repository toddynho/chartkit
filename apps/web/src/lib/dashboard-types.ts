export type ThemeName = "soft" | "midnight";

export type StringPair = {
  wide: string;
  narrow: string;
};

export type ThemeText = Record<ThemeName, StringPair>;

export type PaintedVariant = {
  id: string;
  label: string;
  alt: string;
  frames: ThemeText;
};

export type PaintedChart = {
  id: string;
  title: string;
  caption: string;
  type: string;
  span: string;
  place: string;
  alt: string;
  tab?: { label: string; value: string; delta: string; good: boolean };
  frames: ThemeText;
  variants: PaintedVariant[];
};

export type PaintedSpark = {
  id: string;
  name: string;
  detail: string;
  seen: string;
  age: string;
  events: number;
  users: number;
  tags: string[];
  priority: string;
  assignee: string;
  alt: string;
  frames: ThemeText;
};

export type SpecBlock = {
  heading: string;
  specs: ThemeText;
};

export type PaintedBoard = {
  slug: string;
  product: string;
  title: string;
  lede: string;
  disclaimer: string;
  range: string;
  defaultTheme: ThemeName;
  charts: PaintedChart[];
  sparks: PaintedSpark[];
  notes: { label: string; detail: string }[];
  specBlocks: SpecBlock[];
};

export type DashboardCard = {
  slug: string;
  product: string;
  title: string;
  lede: string;
  disclaimer: string;
  range: string;
  defaultTheme: ThemeName;
  coverAlt: string;
  coverSvg: string;
};

export type DashboardIndex = {
  source: string;
  boards: DashboardCard[];
};
