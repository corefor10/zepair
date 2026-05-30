/**
 * Zepair Design System — Theme Constants
 * Single source of truth for all design tokens.
 * Use this file across the entire app; never hard-code colours or spacing.
 */

// ─── Colour Palette ──────────────────────────────────────────────────────────

export const palette = {
  // Brand
  primary: "#004ac6",
  primaryContainer: "#2563eb",
  primaryFixed: "#dbe1ff",
  primaryFixedDim: "#b4c5ff",
  inversePrimary: "#b4c5ff",
  onPrimary: "#ffffff",
  onPrimaryFixed: "#00174b",
  onPrimaryFixedVariant: "#003ea8",

  secondary: "#6b38d4",
  secondaryContainer: "#8455ef",
  secondaryFixed: "#e9ddff",
  secondaryFixedDim: "#d0bcff",
  onSecondary: "#ffffff",
  onSecondaryContainer: "#fffbff",
  onSecondaryFixed: "#23005c",
  onSecondaryFixedVariant: "#5516be",

  tertiary: "#943700",
  tertiaryContainer: "#bc4800",
  tertiaryFixed: "#ffdbcd",
  tertiaryFixedDim: "#ffb596",
  onTertiary: "#ffffff",
  onTertiaryContainer: "#ffede6",
  onTertiaryFixed: "#360f00",
  onTertiaryFixedVariant: "#7d2d00",

  // Surface scale
  background: "#faf8ff",
  surface: "#faf8ff",
  surfaceBright: "#faf8ff",
  surfaceDim: "#d9d9e5",
  surfaceVariant: "#e1e2ed",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f3f3fe",
  surfaceContainer: "#ededf9",
  surfaceContainerHigh: "#e7e7f3",
  surfaceContainerHighest: "#e1e2ed",
  inverseSurface: "#2e3039",
  inverseOnSurface: "#f0f0fb",
  surfaceTint: "#0053db",

  // Content
  onBackground: "#191b23",
  onSurface: "#191b23",
  onSurfaceVariant: "#434655",

  // Utility
  outline: "#737686",
  outlineVariant: "#c3c6d7",

  // Semantic
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  onError: "#ffffff",
  onErrorContainer: "#93000a",

  // Accents (extended, not in M3 spec but used by Zepair)
  success: "#00875a",
  successLight: "#e3fcef",
  warning: "#ff8b00",
  warningLight: "#fff3cd",
} as const;

// ─── Derived Types ────────────────────────────────────────────────────────────

export type PaletteKey = keyof typeof palette;
export type PaletteColor = (typeof palette)[PaletteKey];

// ─── Typography ──────────────────────────────────────────────────────────────

export interface TypographyToken {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing?: string;
}

export const fontFamily = {
  sans: ["Inter", "system-ui", "sans-serif"],
} as const;

export type FontFamilyKey = keyof typeof fontFamily;

export const typography = {
  headlineLg: {
    fontSize: "32px",
    lineHeight: "40px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
  },
  headlineLgMobile: {
    fontSize: "26px",
    lineHeight: "32px",
    fontWeight: "700",
    letterSpacing: "-0.01em",
  },
  sectionTitle: {
    fontSize: "22px",
    lineHeight: "28px",
    fontWeight: "600",
  },
  sectionTitleMobile: {
    fontSize: "20px",
    lineHeight: "26px",
    fontWeight: "600",
  },
  bodyLg: {
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: "400",
  },
  bodySm: {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: "400",
  },
  labelMd: {
    fontSize: "13px",
    lineHeight: "18px",
    fontWeight: "500",
  },
  labelSm: {
    fontSize: "11px",
    lineHeight: "16px",
    fontWeight: "500",
    letterSpacing: "0.02em",
  },
} as const satisfies Record<string, TypographyToken>;

export type TypographyKey = keyof typeof typography;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  base: 4,          // 4px  — atom unit
  xs: 8,            // 8px
  sm: 12,           // 12px
  md: 16,           // 16px
  gutter: 16,       // 16px — column gutter
  lg: 24,           // 24px
  xl: 32,           // 32px
  marginMobile: 20, // 20px — screen edge margin
  containerMax: 375,// 375px — max mobile canvas width
} as const;

export type SpacingKey = keyof typeof spacing;
export type SpacingValue = (typeof spacing)[SpacingKey];

/**
 * Returns a pixel string for a spacing token.
 * @param key - spacing token key
 * @returns pixel string e.g. "16px"
 */
export const sp = (key: SpacingKey): string => `${spacing[key]}px`;

// ─── Border Radius ───────────────────────────────────────────────────────────

export const radius = {
  none: "0px",
  sm: "4px",
  DEFAULT: "4px",
  md: "8px",
  lg: "8px",
  xl: "12px",
  "2xl": "14px",
  "3xl": "16px",
  full: "9999px",
} as const;

export type RadiusKey = keyof typeof radius;
export type RadiusValue = (typeof radius)[RadiusKey];

// ─── Elevation / Shadows ─────────────────────────────────────────────────────

export const shadow = {
  none: "none",
  sm: "0px 1px 2px rgba(0,0,0,0.06)",
  md: "0px 2px 8px rgba(0,0,0,0.04)",
  lg: "0px 4px 12px rgba(0,0,0,0.08)",
  xl: "0px 8px 24px rgba(0,0,0,0.12)",
  primary: "0px 4px 14px rgba(37,99,235,0.20)",
} as const;

export type ShadowKey = keyof typeof shadow;
export type ShadowValue = (typeof shadow)[ShadowKey];

// ─── Motion / Animation ──────────────────────────────────────────────────────

export const motion = {
  durationXs: "100ms",
  durationSm: "200ms",
  durationMd: "300ms",
  durationLg: "500ms",
  durationXl: "800ms",

  easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
  easingDecelerate: "cubic-bezier(0, 0, 0, 1)",
  easingAccelerate: "cubic-bezier(0.3, 0, 1, 1)",
  easingSpring: "cubic-bezier(0.16, 1, 0.3, 1)",
  easingBounce: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
} as const;

export type MotionKey = keyof typeof motion;
export type MotionValue = (typeof motion)[MotionKey];

// ─── Breakpoints ─────────────────────────────────────────────────────────────

export const breakpoints = {
  xs: 320,
  sm: 375,    // base mobile canvas
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type BreakpointKey = keyof typeof breakpoints;
export type BreakpointValue = (typeof breakpoints)[BreakpointKey];

// ─── Z-Index ─────────────────────────────────────────────────────────────────

export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  raised: 10,
  dropdown: 20,
  sticky: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
} as const;

export type ZIndexKey = keyof typeof zIndex;
export type ZIndexValue = (typeof zIndex)[ZIndexKey];

// ─── Component Size Tokens ───────────────────────────────────────────────────

export const componentSize = {
  buttonHeight: "52px",
  inputHeight: "48px",
  inputHeightLg: "52px",
  iconButtonSize: "40px",
  otpBoxWidth: "52px",
  otpBoxHeight: "56px",
  logoSize: "64px",
  avatarSm: "32px",
  avatarMd: "40px",
  avatarLg: "56px",
  avatarXl: "160px",
  badgeSize: "56px",
} as const;

export type ComponentSizeKey = keyof typeof componentSize;
export type ComponentSizeValue = (typeof componentSize)[ComponentSizeKey];

// ─── Gradient Presets ────────────────────────────────────────────────────────

export const gradients = {
  primaryCta: `linear-gradient(to right, ${palette.primaryContainer}, ${palette.secondaryContainer})`,
  primaryBrand: `linear-gradient(to right, ${palette.primary}, ${palette.primaryContainer})`,
  splashHero: "linear-gradient(135deg, #2563EB, #06B6D4)",
  surfaceFade: `linear-gradient(to top, ${palette.surfaceContainerLowest}, transparent)`,
  primaryGlow: `radial-gradient(circle, ${palette.primaryContainer}1A 0%, transparent 70%)`,
} as const;

export type GradientKey = keyof typeof gradients;
export type GradientValue = (typeof gradients)[GradientKey];

// ─── Theme Interface ──────────────────────────────────────────────────────────

export interface Theme {
  palette: typeof palette;
  fontFamily: typeof fontFamily;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadow: typeof shadow;
  motion: typeof motion;
  breakpoints: typeof breakpoints;
  zIndex: typeof zIndex;
  componentSize: typeof componentSize;
  gradients: typeof gradients;
}

// ─── Theme Object (flat, runtime) ────────────────────────────────────────────

const theme: Theme = {
  palette,
  fontFamily,
  typography,
  spacing,
  radius,
  shadow,
  motion,
  breakpoints,
  zIndex,
  componentSize,
  gradients,
};

export default theme;