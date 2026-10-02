import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { archivo, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "B-Core",
  description: "Modular self-improvement.",
};

export const viewport: Viewport = {
  // Browser chrome colour; must be a literal. Mirrors --color-bg in night-ice.css.
  themeColor: "#0b0f14",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-dvh bg-bg font-sans text-text">{children}</body>
    </html>
  );
}
