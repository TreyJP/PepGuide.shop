import { darkColors, lightColors, type ColorSchemeName, type ThemeColors } from './colors';
import { radii, spacing, touchTarget } from './spacing';
import { typography } from './typography';

export type AppTheme = {
  scheme: ColorSchemeName;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  touchTarget: typeof touchTarget;
};

export function createTheme(scheme: ColorSchemeName): AppTheme {
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    spacing,
    radii,
    typography,
    touchTarget,
  };
}

export { darkColors, lightColors, radii, spacing, touchTarget, typography };
export type { ColorSchemeName, ThemeColors };
