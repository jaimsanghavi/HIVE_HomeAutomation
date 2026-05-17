/**
 * Hive – Material Design 3 theme tokens
 * Single source of truth for all brand styling.
 * M3 tonal palette generated from source color #2563EB (blue).
 *
 * Change `source` to re-skin the entire product.
 */

export const brand = {
  name: "Hive",
  logo: "/logo.svg",
  tagline: "Your home, simplified.",
} as const;

/* ── M3 Color Tokens ─────────────────────────────────────────────────── */

export const lightScheme = {
  primary: "#2563EB",
  onPrimary: "#FFFFFF",
  primaryContainer: "#DBE8FF",
  onPrimaryContainer: "#00174D",

  secondary: "#555F71",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#D9E3F8",
  onSecondaryContainer: "#121C2B",

  tertiary: "#6E5676",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#F8D8FF",
  onTertiaryContainer: "#271430",

  error: "#BA1A1A",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#410002",

  surface: "#F8FAFF",
  onSurface: "#191C20",
  surfaceVariant: "#E0E2EC",
  onSurfaceVariant: "#44474E",
  surfaceDim: "#D8DAE0",
  surfaceBright: "#F8FAFF",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F2F4FA",
  surfaceContainer: "#ECEFF4",
  surfaceContainerHigh: "#E7E9EF",
  surfaceContainerHighest: "#E1E3E9",

  outline: "#74777F",
  outlineVariant: "#C4C6D0",
  inverseSurface: "#2E3036",
  inverseOnSurface: "#EFF0F7",
  inversePrimary: "#B3CCFF",

  success: "#1B6D2F",
  onSuccess: "#FFFFFF",
  successContainer: "#A3F6A8",

  warning: "#7B5800",
  onWarning: "#FFFFFF",
  warningContainer: "#FFDEA1",

  shadow: "rgba(0,0,0,0.08)",
  scrim: "rgba(0,0,0,0.32)",
} as const;

export const darkScheme = {
  primary: "#B3CCFF",
  onPrimary: "#00297A",
  primaryContainer: "#0040B5",
  onPrimaryContainer: "#DBE8FF",

  secondary: "#BDC7DC",
  onSecondary: "#273141",
  secondaryContainer: "#3E4858",
  onSecondaryContainer: "#D9E3F8",

  tertiary: "#DCBCE4",
  onTertiary: "#3D2846",
  tertiaryContainer: "#553F5D",
  onTertiaryContainer: "#F8D8FF",

  error: "#FFB4AB",
  onError: "#690005",
  errorContainer: "#93000A",
  onErrorContainer: "#FFDAD6",

  surface: "#111318",
  onSurface: "#E1E3E9",
  surfaceVariant: "#44474E",
  onSurfaceVariant: "#C4C6D0",
  surfaceDim: "#111318",
  surfaceBright: "#37393E",
  surfaceContainerLowest: "#0C0E13",
  surfaceContainerLow: "#191C20",
  surfaceContainer: "#1D2024",
  surfaceContainerHigh: "#282A2F",
  surfaceContainerHighest: "#33353A",

  outline: "#8E9099",
  outlineVariant: "#44474E",
  inverseSurface: "#E1E3E9",
  inverseOnSurface: "#2E3036",
  inversePrimary: "#2563EB",

  success: "#88D98E",
  onSuccess: "#003911",
  successContainer: "#005320",

  warning: "#F5BF48",
  onWarning: "#412D00",
  warningContainer: "#5D4200",

  shadow: "rgba(0,0,0,0.3)",
  scrim: "rgba(0,0,0,0.6)",
} as const;

export type ColorScheme = Record<keyof typeof lightScheme, string>;

/* ── M3 Elevation (dp) ───────────────────────────────────────────────── */

export const elevation = {
  level0: "none",
  level1: "0 1px 3px 1px rgba(0,0,0,0.15), 0 1px 2px 0 rgba(0,0,0,0.3)",
  level2: "0 2px 6px 2px rgba(0,0,0,0.15), 0 1px 2px 0 rgba(0,0,0,0.3)",
  level3: "0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px 0 rgba(0,0,0,0.3)",
  level4: "0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px 0 rgba(0,0,0,0.3)",
  level5: "0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px 0 rgba(0,0,0,0.3)",
} as const;

/* ── M3 Shape (radius) ───────────────────────────────────────────────── */

export const shape = {
  none: "0px",
  extraSmall: "4px",
  small: "8px",
  medium: "12px",
  large: "16px",
  extraLarge: "28px",
  full: "9999px",
} as const;

/* ── M3 Type Scale ───────────────────────────────────────────────────── */

export const typeScale = {
  displayLarge: { size: "57px", lineHeight: "64px", weight: 400, tracking: "-0.25px" },
  displayMedium: { size: "45px", lineHeight: "52px", weight: 400, tracking: "0px" },
  displaySmall: { size: "36px", lineHeight: "44px", weight: 400, tracking: "0px" },

  headlineLarge: { size: "32px", lineHeight: "40px", weight: 400, tracking: "0px" },
  headlineMedium: { size: "28px", lineHeight: "36px", weight: 400, tracking: "0px" },
  headlineSmall: { size: "24px", lineHeight: "32px", weight: 400, tracking: "0px" },

  titleLarge: { size: "22px", lineHeight: "28px", weight: 500, tracking: "0px" },
  titleMedium: { size: "16px", lineHeight: "24px", weight: 500, tracking: "0.15px" },
  titleSmall: { size: "14px", lineHeight: "20px", weight: 500, tracking: "0.1px" },

  bodyLarge: { size: "16px", lineHeight: "24px", weight: 400, tracking: "0.5px" },
  bodyMedium: { size: "14px", lineHeight: "20px", weight: 400, tracking: "0.25px" },
  bodySmall: { size: "12px", lineHeight: "16px", weight: 400, tracking: "0.4px" },

  labelLarge: { size: "14px", lineHeight: "20px", weight: 500, tracking: "0.1px" },
  labelMedium: { size: "12px", lineHeight: "16px", weight: 500, tracking: "0.5px" },
  labelSmall: { size: "11px", lineHeight: "16px", weight: 500, tracking: "0.5px" },
} as const;

/* ── M3 Motion (duration + easing) ───────────────────────────────────── */

export const motion = {
  duration: {
    short1: "50ms",
    short2: "100ms",
    short3: "150ms",
    short4: "200ms",
    medium1: "250ms",
    medium2: "300ms",
    medium3: "350ms",
    medium4: "400ms",
    long1: "450ms",
    long2: "500ms",
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    standardDecelerate: "cubic-bezier(0, 0, 0, 1)",
    standardAccelerate: "cubic-bezier(0.3, 0, 1, 1)",
    emphasized: "cubic-bezier(0.2, 0, 0, 1)",
    emphasizedDecelerate: "cubic-bezier(0.05, 0.7, 0.1, 1)",
    emphasizedAccelerate: "cubic-bezier(0.3, 0, 0.8, 0.15)",
  },
} as const;

/* ── M3 State Layers ─────────────────────────────────────────────────── */

export const stateLayer = {
  hover: 0.08,
  focus: 0.1,
  pressed: 0.1,
  dragged: 0.16,
} as const;
