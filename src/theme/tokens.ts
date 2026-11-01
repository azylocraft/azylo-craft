// AZYLO design tokens, from the Claude Design "Bau" kit (az-kit.jsx).
// This file is the single source of truth: layout.tsx turns it into CSS
// variables, and globals.css maps those variables onto Tailwind utilities.

export const colors = {
  bg: "#FFFFFF",
  bg2: "#F7F7F5",
  card: "#FFFFFF",
  ink: "#151412",
  ink2: "#2B2926",
  muted: "#6E685F",
  faint: "#A19A8F",
  line: "#E6E5E1",
  line2: "#EFEEEA",
  // "gold" is the brand accent token; in the Bau theme it is olive (the logo dot).
  gold: "#6B6A33",
  goldSoft: "#F1F1EA",
  goldLine: "#CFCEB4",
  goldBright: "#B9B88A",
  cream: "#EFEFEC",
  dark: "#1A1917",
  dark2: "#232220",
  darkLine: "#2E2D2B",
  darkField: "#42413E",
  onDark: "#D8D8D5",
  onDarkMuted: "#ABABA8",
  onDarkFaint: "#8A8A87",
  green: "#2E7D57",
  greenSoft: "#E6F2EB",
  blue: "#2F6FE4",
  red: "#B93A2B",
  redSoft: "#FBEDEA",
  skeleton: "#EEEEEB",
  skeletonHi: "#F7F7F5",
  toggleOff: "#D8D2C7",
  checkLine: "#CFC8BC",
} as const;

export const fonts = {
  sans: "var(--font-hanken), system-ui, sans-serif",
  serif: "var(--font-hanken), system-ui, sans-serif",
  mono: "var(--font-jetbrains-mono), ui-monospace, monospace",
} as const;

export const shadows = {
  card: "none",
  float: "0 30px 80px -20px rgba(26,25,23,.30)",
  soft: "0 14px 34px -18px rgba(26,25,23,.20)",
  bar: "none",
} as const;

export const radii = {
  field: "16px",
  tile: "22px",
  card: "28px",
  panel: "28px",
  block: "32px",
  section: "32px",
  modal: "32px",
  hero: "36px",
  pill: "999px",
} as const;

/** Control heights in px, as drawn in the kit. */
export const sizes = {
  btn: { sm: 36, md: 46, lg: 54 },
  chip: 36,
  round: 44,
  badge: 22,
  field: 52,
  stepper: { sm: 36, md: 48 },
  headerTop: 76,
  headerNav: 60,
  mobileHeader: 60,
} as const;

/** Page gutters and section rhythm (px). */
export const spacing = {
  gutterDesktop: 48,
  gutterMobile: 16,
  sectionGap: 96,
  sectionGapSm: 56,
  maxWidth: 1440,
} as const;

export const breakpoints = { sm: 360, md: 768, lg: 1280 } as const;

export const tokens = { colors, fonts, shadows, radii, sizes, spacing, breakpoints };
export type ColorToken = keyof typeof colors;

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

/** CSS custom properties for :root, generated from the tokens above. */
export function tokensToCss(): string {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(colors)) lines.push(`--az-${kebab(k)}:${v}`);
  for (const [k, v] of Object.entries(shadows)) lines.push(`--az-shadow-${kebab(k)}:${v}`);
  for (const [k, v] of Object.entries(radii)) lines.push(`--az-radius-${kebab(k)}:${v}`);
  return `:root{${lines.join(";")}}`;
}
