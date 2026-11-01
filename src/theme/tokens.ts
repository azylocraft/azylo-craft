// AZYLO design tokens, taken from the Claude Design kit (az-kit.jsx).
// This file is the single source of truth: layout.tsx turns it into CSS
// variables, and globals.css maps those variables onto Tailwind utilities.

export const colors = {
  bg: "#F7F4EE",
  bg2: "#FBF9F5",
  card: "#FFFFFF",
  ink: "#151412",
  ink2: "#2B2926",
  muted: "#6E685F",
  faint: "#A19A8F",
  line: "#E7E1D6",
  line2: "#EFEAE1",
  gold: "#A57A36",
  goldSoft: "#F5EEE1",
  goldLine: "#DCC79F",
  goldBright: "#C9A262",
  cream: "#EEE6D7",
  dark: "#1A1917",
  dark2: "#25231F",
  darkLine: "#34312C",
  darkField: "#4A4640",
  onDark: "#D9D3C8",
  onDarkMuted: "#B8B1A6",
  onDarkFaint: "#8E877C",
  green: "#2E7D57",
  greenSoft: "#E6F2EB",
  blue: "#2F6FE4",
  red: "#B93A2B",
  redSoft: "#FBEDEA",
  skeleton: "#ECE7DE",
  skeletonHi: "#F5F1EA",
  toggleOff: "#D8D2C7",
  checkLine: "#CFC8BC",
} as const;

export const fonts = {
  sans: "var(--font-manrope), system-ui, sans-serif",
  serif: "var(--font-instrument-serif), Georgia, serif",
  mono: "var(--font-jetbrains-mono), ui-monospace, monospace",
} as const;

export const shadows = {
  card: "0 1px 2px rgba(26,25,23,.04), 0 12px 32px -14px rgba(26,25,23,.14)",
  float: "0 30px 80px -20px rgba(26,25,23,.35)",
  soft: "0 8px 24px -12px rgba(26,25,23,.18)",
  bar: "0 6px 18px -14px rgba(0,0,0,.25)",
} as const;

export const radii = {
  field: "14px",
  tile: "18px",
  card: "20px",
  panel: "22px",
  block: "24px",
  section: "26px",
  modal: "28px",
  hero: "30px",
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
