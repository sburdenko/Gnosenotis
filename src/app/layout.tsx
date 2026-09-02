import type { Metadata } from "next";
import { Caveat, JetBrains_Mono, Oswald, PT_Serif } from "next/font/google";
import { LanguageProvider } from "@/i18n/LanguageContext";
import "./globals.css";

// Each of these loads once at build time and self-hosts the font files (no
// runtime request to Google Fonts), exposed as a CSS variable that
// globals.css maps to `font-serif` / `font-display` / `font-mono` / `font-hand`.
// `cyrillic` is required here, not just `latin` — half of this app's content is Russian.
const ptSerif = PT_Serif({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  variable: "--font-pt-serif",
});
const oswald = Oswald({
  subsets: ["cyrillic", "latin"],
  weight: ["500", "600"],
  variable: "--font-oswald",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
});
const caveat = Caveat({
  subsets: ["cyrillic", "latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
});

// Learning note (Next.js App Router): everything exported from a file named
// `layout.tsx` wraps every page below it in the same folder. This is a
// Server Component by default (no "use client" here) — it renders to plain
// HTML on the server/at build time, with zero JavaScript shipped for it.
// It can still render <LanguageProvider>, a Client Component, directly:
// Server Components can render Client Components, just not the other way
// around (a Client Component can only *import* another Client Component).
export const metadata: Metadata = {
  title: "Unity Interview Board — 373 Questions",
  description:
    "Senior/Lead Unity interview prep, styled as a card catalog: 373 C#/rendering/gameplay/math questions, a curated reading list, algorithm patterns, and 58 LeetCode problems with solution ladders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVariables = [ptSerif.variable, oswald.variable, jetbrainsMono.variable, caveat.variable].join(" ");

  return (
    <html lang="ru" className={fontVariables}>
      <body className="font-serif antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
