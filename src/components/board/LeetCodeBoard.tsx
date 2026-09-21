"use client";

import { useMemo, useState } from "react";
import { useEscapeToClose } from "@/hooks/useEscapeToClose";
import type { AlgoPattern, LeetCodeProblem, LeetCodeTopicGroup, PatternId } from "@/types/content";
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
  /** Problems grouped by topic — the headings on the board. */
  topicGroups: LeetCodeTopicGroup[];
  /** The same problems flat, for the counts and the card of the week. */
  problems: LeetCodeProblem[];
  patternsById: Record<PatternId, AlgoPattern>;
}

/**
 * Problems are grouped by *topic* and filtered by *difficulty*: the sidebar
 * picks a difficulty (or the core set), the headings stay topical, and each
 * card carries its own difficulty badge. Grouping by difficulty instead
 * would answer "what is hard?", which is not the question anyone preparing
 * actually asks.
 */
export function LeetCodeBoard({ topicGroups, problems, patternsById }: LeetCodeBoardProps) {
  const { t, pick } = useLanguage();
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  // One card at a time: the unfolded part hangs over the cards below (see
  // `PinnedCardShell`'s `overlay`), so two open at once would just stack.
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  useEscapeToClose(openSlug !== null, () => setOpenSlug(null));
  const { done, toggle, count } = useProgressSet(PROGRESS_KEY);

  const total = problems.length;
  const counts = useMemo(
    () => ({
      easy: problems.filter((p) => p.d === "easy").length,
      med: problems.filter((p) => p.d === "med").length,
      hard: problems.filter((p) => p.d === "hard").length,
      core: problems.filter((p) => p.core).length,
    }),
    [problems],
  );

  const sections = [
    { id: "all" as FilterKey, label: t.leetFilters.all, count: total },
    { id: "easy" as FilterKey, label: t.leetFilters.easy, count: counts.easy },
    { id: "med" as FilterKey, label: t.leetFilters.medium, count: counts.med },
    { id: "hard" as FilterKey, label: t.leetFilters.hard, count: counts.hard },
    { id: "core" as FilterKey, label: t.leetFilters.core, count: counts.core },
  ];

  const needle = term.trim().toLowerCase();
  const visibleGroups = useMemo(() => {
    return topicGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          if (filter === "core" && !item.core) return false;
          if (filter !== "all" && filter !== "core" && item.d !== filter) return false;
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
  }, [topicGroups, filter, needle]);

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
              <div key={group.id} className="mb-7">
                <h2 className="font-serif text-[17px] tracking-tight text-cream">
                  {pick(group.g, group.gru)}
                </h2>
                <div className="mt-3 grid grid-cols-1 gap-[22px] md:grid-cols-2">
                  {group.items.map((item, i) => (
                    <PinnedLeetCodeCard
                      key={item.s}
                      item={item}
                      index={i}
                      difficulty={item.d}
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

          <CardOfTheWeek problems={problems} />
        </div>
      </div>
    </div>
  );
}
