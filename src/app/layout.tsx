import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/theme/fonts";
import { colors, tokensToCss } from "@/theme/tokens";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AZYLO — Made-to-order sofas and smart tables", template: "%s · AZYLO" },
  description:
    "Made-to-order power reclining sofas, convertible sofa beds, modular and small-space sofas and smart tables, delivered free with duties included.",
};

export const viewport: Viewport = { themeColor: colors.bg2, width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full`}>
      <head>
        <style>{tokensToCss()}</style>
      </head>
      <body className="flex min-h-full flex-col bg-bg font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
