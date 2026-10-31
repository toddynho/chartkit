export interface ThemePage {
  slug: string;
  title: string;
  description: string;
  lede: string;
  audience: string;
  geometry: string;
  type: string;
  checks: string;
  theme: string;
}

export const themePages: ThemePage[] = [
  {
    slug: "tape",
    title: "Tape",
    description: "A dark trading preset. Blue and clay instead of green and red, hairline strokes, square corners.",
    lede: "A trading desk after the close: warm black, hairline rules, and an up/down pair that is blue and clay rather than green and red.",
    audience: "Finance terminals and P&L views, when the candle has to stay readable for a deuteranopic reader.",
    geometry: "Hairline 1.5px stroke, square corners, a 0.12 bar gap, no points. The font is Geist Mono. Grid density is not a token, so a chart that wants the dense desk sets axes.y.ticks itself.",
    type: "Dark only. theme: \"tape\". Import @chartkitdev/core/themes/tape or @chartkitdev/core/themes/all.",
    checks: "On #14120e, text is 16.3:1 and ticks are 9.6:1. The weakest series mark is 5.7:1. Closest series under deuteranopia Δ 0.064 and under protanopia Δ 0.084, both #5dccc0 against #c4b6f2. Up against down is deuteranopia Δ 0.277 and protanopia Δ 0.240.",
    theme: "tape",
  },
  {
    slug: "kite",
    title: "Kite",
    description: "Cream paper, round bars, and a plum dusk. Fruit colours that still separate.",
    lede: "A consumer product on a Saturday morning: cream paper, round bars, and fruit colours that still separate.",
    audience: "Playful product UI, in daylight and in a plum dusk mode.",
    geometry: "2.6px stroke, 14px corners, a wide 0.4 gap, no points. The chart asks for Nunito and falls back to the system sans if that face is not loaded.",
    type: "Light and dark in one preset, via light-dark(). theme: \"kite\".",
    checks: "Light, on #fff6ee: text 14.8:1, ticks 7.9:1, weakest series 4.4:1. Closest series under deuteranopia Δ 0.059 (#c43766 / #0d7a58) and under protanopia Δ 0.068 (#c43766 / #a33b88). Up against down is deuteranopia Δ 0.232 and protanopia Δ 0.176. Dark, on #2a2340: text 13.9:1, ticks 9.8:1, weakest series 6.9:1. Closest series under deuteranopia Δ 0.046 (#ff8fb0 / #7ddec0) and under protanopia Δ 0.093 (#ff8fb0 / #f0b090). Up against down is deuteranopia Δ 0.144 and protanopia Δ 0.110.",
    theme: "kite",
  },
  {
    slug: "mustard",
    title: "Mustard",
    description: "The frozen light and dark preset for brand #ca8a04.",
    lede: "Mustard is createTheme({ brand: \"#ca8a04\" }), frozen. The lead series is the brand pulled to #ba8116 so it clears 3:1 on the cream surface.",
    audience: "A warm brand that should still read as itself after the contrast and colour-blind pass.",
    geometry: "Soft geometry: 2px stroke, 8px corners, no points. The font is Geist. createTheme suggests riso tiles for this hue. Those tiles are not painted.",
    type: "theme: \"mustard\". The same colours come back from createTheme({ brand: \"#ca8a04\" }).",
    checks: "Light text 13.6:1, ticks 6.1:1, weakest series 3.1:1. Dark text 15.4:1, ticks 8.6:1, weakest series 5.8:1. Series deuteranopia Δ 0.056, protanopia Δ 0.073. Up against down is deuteranopia Δ 0.232 and protanopia Δ 0.190.",
    theme: "mustard",
  },
  {
    slug: "violet",
    title: "Violet",
    description: "The frozen light and dark preset for brand #6d28d9.",
    lede: "Violet is createTheme({ brand: \"#6d28d9\" }), frozen. The lead series is #694bb5 in the light and #6b5d9e in the dark.",
    audience: "A violet brand on a pale ground, with a dusk surface that keeps the same hues.",
    geometry: "Soft geometry, Geist, same as Mustard. The riso suggestion is recorded on createTheme and is not painted.",
    type: "theme: \"violet\".",
    checks: "Light text 13.6:1, ticks 6.1:1, weakest series 4.2:1. Dark text 15.5:1, ticks 8.7:1, weakest series 3.1:1. Series deuteranopia Δ 0.061, protanopia Δ 0.058. Up against down is deuteranopia Δ 0.232 and protanopia Δ 0.190.",
    theme: "violet",
  },
];

export function themePage(slug: string): ThemePage | undefined {
  return themePages.find((page) => page.slug === slug);
}
