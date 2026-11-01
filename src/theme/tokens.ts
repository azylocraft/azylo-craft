// AZYLO design tokens: minimal white / ink / olive theme.
// This file is the single source of truth: layout.tsx turns it into CSS
// variables, and globals.css maps those variables onto Tailwind utilities.

export const colors = {
  bg: "#FFFFFF",
  bg2: "#F6F6F3",
  card: "#FFFFFF",
  ink: "#111111",
  ink2: "#262624",
  muted: "#6B6B66",
  faint: "#A3A29C",
  line: "#E4E3DE",
  line2: "#EEEDE9",
  // "gold" is the brand accent token; in this theme it is olive (the logo dot).
  gold: "#5F5C2E",
  goldSoft: "#F0EFE5",
  goldLine: "#CFCCAE",
  goldBright: "#B9B57B",
  cream: "#ECEBE6",
  dark: "#121211",
  dark2: "#1E1E1C",
  darkLine: "#2F2F2C",
  darkField: "#444440",
  onDark: "#E2E2DD",
  onDarkMuted: "#B5B5AE",
  onDarkFaint: "#8A8A83",
  green: "#2E7D57",
  greenSoft: "#E6F2EB",
  blue: "#2F6FE4",
  red: "#B93A2B",
  redSoft: "#FBEDEA",
  skeleton: "#EDEDEA",
  skeletonHi: "#F6F6F4",
  toggleOff: "#D6D6D1",
  checkLine: "#CBCAC4",
} as const;

export const fonts = {
  sans: "var(--font-inter-tight), system-ui, sans-serif",
  serif: "var(--font-inter-tight), system-ui, sans-serif",
  mono: "var(--font-jetbrains-mono), ui-monospace, monospace",
} as const;

export const shadows = {
  card: "0 1px 2px rgba(17,17,17,.03), 0 10px 30px -18px rgba(17,17,17,.12)",
  float: "0 30px 80px -20px rgba(17,17,17,.30)",
  soft: "0 14px 34px -16px rgba(17,17,17,.22)",
  bar: "0 6px 18px -14px rgba(0,0,0,.2)",
} as const;

export const radii = {
  field: "16px",
  tile: "22px",
  card: "28px",
  panel: "28px",
  block: "32px",
  section: "32px",
  modal: "32px",
  hero: "40px",
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
