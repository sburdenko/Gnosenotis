"use client";

import { useMemo, useState } from "react";
import { useEscapeToClose } from "@/hooks/useEscapeToClose";
import type { AlgoPattern, LeetCodeGroup, PatternId } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { useProgressSet } from "@/hooks/useProgressSet";
import { Toolbar } from "./Toolbar";
import { SectionSidebar } from "./SectionSidebar";
import { StickyNote } from "./StickyNote";
import { PinnedLeetCodeCard } from "./PinnedLeetCodeCard";
import { CardOfTheWeek } from "./CardOfTheWeek";
import { EmptyState } from "./EmptyState";

const PROGRESS_KEY = "unity-leetcode-progress";

type FilterKey = "all" | "easy" | "med" | "hard" | "core";

interface LeetCodeBoardProps {
  leetcodeGroups: LeetCodeGroup[];
  patternsById: Record<PatternId, AlgoPattern>;
}

export function LeetCodeBoard({ leetcodeGroups, patternsById }: LeetCodeBoardProps) {
  const { t, pick } = useLanguage();
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  // One card at a time: the unfolded part hangs over the cards below (see
  // `PinnedCardShell`'s `overlay`), so two open at once would just stack.
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  useEscapeToClose(openSlug !== null, () => setOpenSlug(null));
  const { done, toggle, count } = useProgressSet(PROGRESS_KEY);

  const total = useMemo(() => leetcodeGroups.reduce((sum, g) => sum + g.items.length, 0), [leetcodeGroups]);
  const coreCount = useMemo(
    () => leetcodeGroups.reduce((sum, g) => sum + g.items.filter((i) => i.core).length, 0),
    [leetcodeGroups],
  );

  const sections = [
    { id: "all" as FilterKey, label: t.leetFilters.all, count: total },
    {
      id: "easy" as FilterKey,
      label: t.leetFilters.easy,
      count: leetcodeGroups[0]?.items.length ?? 0,
    },
    {
      id: "med" as FilterKey,
      label: t.leetFilters.medium,
      count: leetcodeGroups[1]?.items.length ?? 0,
    },
    {
      id: "hard" as FilterKey,
      label: t.leetFilters.hard,
      count: leetcodeGroups[2]?.items.length ?? 0,
    },
    { id: "core" as FilterKey, label: t.leetFilters.core, count: coreCount },
  ];

  const needle = term.trim().toLowerCase();
  const visibleGroups = useMemo(() => {
    return leetcodeGroups
      .filter((g) => filter === "all" || filter === "core" || g.d === filter)
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          if (filter === "core" && !item.core) return false;
          if (!needle) return true;
          // Approach names and pattern ids are searchable too, so "dijkstra"
          // or "sliding window" finds every problem that drills them.
          const solutionText = item.sol.map((s) => `${s.n}${s.nru}${s.i}${s.iru}`).join("");
          return `${item.t}${item.why}${item.whyru}${item.pat.join(" ")}${solutionText}`
            .toLowerCase()
            .includes(needle);
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [leetcodeGroups, filter, needle]);

  const visibleCount = visibleGroups.reduce((sum, g) => sum + g.items.length, 0);
  const remaining = total - count;

  return (
    <div>
      <Toolbar
        query={term}
        onQueryChange={setTerm}
        searchPlaceholder={t.searchPlaceholder.leetcode}
        cardCountLabel={t.cardCount(total)}
        progressLabel={t.progress(count, total, "solved")}
      />

      <div className="flex flex-col gap-[26px] px-4 pt-7 md:px-[30px] md:flex-row">
        <SectionSidebar
          sections={sections}
          activeId={filter}
          onChange={(id) => setFilter(id as FilterKey)}
          ariaLabel={t.sectionsHeading}
          stickyNote={<StickyNote eyebrow={t.tabs.leetcode}>{t.shelfNote(remaining, "leetcode")}</StickyNote>}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-3.5 flex items-baseline justify-between">
            <p className="font-display text-[11px] font-semibold tracking-[.2em] text-cream-dim uppercase">
              {t.tabSub.leetcode}
            </p>
            <p className="font-mono text-[12px] text-cream-soft">{t.filteredCount(visibleCount, total)}</p>
          </div>

          {visibleGroups.length > 0 ? (
            visibleGroups.map((group) => (
              <div key={group.g} className="mb-7">
                <h2 className="font-serif text-[17px] tracking-tight text-cream">
                  {pick(group.g, group.gru)}
                </h2>
                <div className="mt-3 grid grid-cols-1 gap-[22px] md:grid-cols-2">
                  {group.items.map((item, i) => (
                    <PinnedLeetCodeCard
                      key={item.s}
                      item={item}
                      index={i}
                      difficulty={group.d}
                      done={Boolean(done[item.s])}
                      isOpen={openSlug === item.s}
                      patternsById={patternsById}
                      onToggleDone={() => toggle(item.s)}
                      onToggleOpen={() => setOpenSlug((current) => (current === item.s ? null : item.s))}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <EmptyState>{t.emptyState}</EmptyState>
          )}

          <CardOfTheWeek leetcodeGroups={leetcodeGroups} />
        </div>
      </div>
    </div>
  );
}
