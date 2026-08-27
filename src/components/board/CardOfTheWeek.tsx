"use client";

import { useSyncExternalStore } from "react";
import type { LeetCodeGroup } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";

function isoWeekNumber(date: Date): number {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - (utcDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

const UNKNOWN_WEEK = -1;

function getCurrentWeek(): number {
  return isoWeekNumber(new Date());
}

function getServerWeek(): number {
  return UNKNOWN_WEEK;
}

// The calendar week never changes while this tab is open (or if it does, a
// stale pick is harmless), so there's nothing to subscribe to — an empty
// unsubscribe is enough to satisfy `useSyncExternalStore`'s contract.
function subscribeNoop() {
  return () => {};
}

/**
 * Picks one "core" LeetCode problem to spotlight, rotating weekly.
 *
 * Learning note: this reuses `useSyncExternalStore` (see
 * `src/i18n/LanguageContext.tsx` for the fuller explanation) to treat "the
 * current calendar week" as an external value React doesn't own — the same
 * category of problem as reading `localStorage`. The site is statically
 * exported, so the server-rendered HTML is generated once, whenever
 * `next build` runs, and served unchanged afterward; computing "this week"
 * during render would bake in the *build's* week forever, and could
 * disagree with the *visitor's* actual week on first paint (a hydration
 * mismatch). `getServerWeek` reports "unknown" so the initial render is
 * empty on both server and client, then the real week reconciles right after hydration.
 */
export function CardOfTheWeek({ leetcodeGroups }: { leetcodeGroups: LeetCodeGroup[] }) {
  const { t } = useLanguage();
  const week = useSyncExternalStore(subscribeNoop, getCurrentWeek, getServerWeek);

  if (week === UNKNOWN_WEEK) return null;

  const coreItems = leetcodeGroups.flatMap((g) => g.items).filter((i) => i.core);
  if (coreItems.length === 0) return null;
  const picked = coreItems[week % coreItems.length];

  return (
    <section className="mt-[22px] flex -rotate-[.3deg] flex-col items-start gap-[22px] border border-[rgba(80,50,15,.28)] bg-kraft px-[22px] py-[18px] shadow-[2px_4px_11px_rgba(40,20,0,.3)] md:flex-row md:items-center">
      <div className="flex-1">
        <p className="mb-2 font-display text-[10px] font-semibold tracking-[.2em] text-[#8a5a20] uppercase">
          {t.weekTask.eyebrow}
        </p>
        <p className="font-serif text-[16px] leading-relaxed text-ink-body">{t.weekTask.text(picked.t)}</p>
      </div>

      <a
        href={`https://leetcode.com/problems/${picked.s}/`}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 bg-accent px-5 py-3 font-display text-[12px] font-semibold tracking-[.14em] text-[#fdf3e2] uppercase shadow-button hover:bg-accent-hover active:translate-y-0.5 active:shadow-button-active"
      >
        {t.weekTask.cta}
      </a>
    </section>
  );
}
