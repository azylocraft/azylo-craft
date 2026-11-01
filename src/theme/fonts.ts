import { Inter_Tight, JetBrains_Mono } from "next/font/google";

/** Tight neo-grotesk used for everything: UI, headings and the "azylo." wordmark. */
export const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const fontVariables = `${interTight.variable} ${jetbrainsMono.variable}`;
