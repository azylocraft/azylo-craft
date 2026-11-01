import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

/** Hanken Grotesk is used for everything: UI, headings and the "azylo." wordmark. */
export const hanken = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const fontVariables = `${hanken.variable} ${jetbrainsMono.variable}`;
