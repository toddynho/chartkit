/**
 * Opt-in brand themes. Not imported by the line bundle.
 * paletteFromBrand derives eight colours. createTheme fits them to a light and a dark surface.
 * Importing this module registers theme.brand with resolvePreset.
 */

export { BRAND_REFERENCE_BACKGROUND, paletteFromBrand, type BrandScheme } from "./palette";
export { canonicalHex } from "./hex";
export {
  createTheme,
  installBrandTheme,
  tokensFromBrand,
  type Adjustment,
  type BrandChecks,
  type BrandMode,
  type BrandTextures,
  type BrandTheme,
} from "./create-theme";
export { SAMPLE_MARK, colorsFromBitmap, colorsFromSvg, sampleImageData } from "./drawing";

import { installBrandTheme } from "./create-theme";

installBrandTheme();
