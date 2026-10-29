import { mountAnnotations, mountChrome, mountColorRules, mountMarks, mountStacks } from "./renderers/cartesian";
import { registerPreset } from "./theme";
import { editorial } from "./themes/editorial";
import { midnight } from "./themes/midnight";
import { refined } from "./themes/refined";
import { soft } from "./themes/soft";

/**
 * Annotations, colour rules, headline and tooltip chrome, stack and label
 * layout, and the midnight, refined, and editorial presets.
 * Importing this module registers them. `@chartkitdev/core/all` imports it.
 * `createRenderer([line])` does not, so a line-only bundle can omit the code.
 */
export function mountFeatures(): void {
  mountAnnotations();
  mountColorRules();
  mountChrome();
  mountMarks();
  mountStacks();
  registerPreset("midnight", midnight);
  registerPreset("soft", soft);
  registerPreset("refined", refined);
  registerPreset("editorial", editorial);
}

mountFeatures();

export { editorial, midnight, refined, soft, mountAnnotations, mountChrome, mountColorRules, mountMarks, mountStacks };
