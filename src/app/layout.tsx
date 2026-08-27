import type { Metadata } from "next";
import "./globals.css";

// Learning note (Next.js App Router): everything exported from a file named
// `layout.tsx` wraps every page below it in the same folder. This is a
// Server Component by default (no "use client" here) — it renders to plain
// HTML on the server/at build time, with zero JavaScript shipped for it.
export const metadata: Metadata = {
  title: "Unity Interview — 310 Questions",
  description:
    "Senior/Lead Unity interview prep: 310 C#, rendering and gameplay questions, a curated reading list, and 58 LeetCode problems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-txt antialiased leading-relaxed">
        {children}
      </body>
    </html>
  );
}
