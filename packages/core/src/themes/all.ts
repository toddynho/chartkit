import { emerald } from "./emerald";
import { mono } from "./mono";
import { slate } from "./slate";
import { arctic } from "./arctic";
import { orchid } from "./orchid";
import { obsidian } from "./obsidian";
import { neon } from "./neon";
import { mocha } from "./mocha";
import { owl } from "./owl";
import { retro } from "./retro";
import { copper } from "./copper";
import { rose } from "./rose";
import { sunset } from "./sunset";
import { silver } from "./silver";
import { pearl } from "./pearl";
import { latte } from "./latte";
import { registerPreset, type PresetTokens } from "../theme";

export const themes: Record<string, PresetTokens> = {
  emerald,
  mono,
  slate,
  arctic,
  orchid,
  obsidian,
  neon,
  mocha,
  owl,
  retro,
  copper,
  rose,
  sunset,
  silver,
  pearl,
  latte,
};

for (const [name, preset] of Object.entries(themes)) registerPreset(name, preset);

export { emerald, mono, slate, arctic, orchid, obsidian, neon, mocha, owl, retro, copper, rose, sunset, silver, pearl, latte };
