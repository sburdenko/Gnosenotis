"use client";

import { useMemo, useState } from "react";
import type { AlgoPattern, LeetCodeGroup, PatternGroup, PatternId } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { useProgressSet } from "@/hooks/useProgressSet";
import { buildPatternUsage } from "@/lib/patternUsage";
import { pinColorForIndex } from "@/lib/boardVisuals";
import { Toolbar } from "./Toolbar";
import { SectionSidebar } from "./SectionSidebar";
import { StickyNote } from "./StickyNote";
import { PinnedPatternCard } from "./PinnedPatternCard";
import { EmptyState } from "./EmptyState";

const PROGRESS_KEY = "unity-patterns-progress";

interface PatternsBoardProps {
  patternGroups: PatternGroup[];
  /** Used to derive which problems practise each pattern. */
  leetcodeGroups: LeetCodeGroup[];
}

export function PatternsBoard({ patternGroups, leetcodeGroups }: PatternsBoardProps) {
  const { t, pick } = useLanguage();
  const [term, setTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");
  const [openIds, setOpenIds] = useState<Set<PatternId>>(new Set());
  const { done: learned, toggle: toggleLearned, count: learnedCount } = useProgressSet(PROGRESS_KEY);

  const usage = useMemo(() => buildPatternUsage(leetcodeGroups), [leetcodeGroups]);
  const total = useMemo(() => patternGroups.reduce((sum, g) => sum + g.items.length, 0), [patternGroups]);

  const sections = useMemo(
    () => [
      { id: "all", label: t.categoryAll, count: total },
      ...patternGroups.map((g) => ({
        id: g.id,
        label: pick(g.g, g.gru),
        count: g.items.length,
      })),
    ],
    [patternGroups, total, t, pick],
  );

  const needle = term.trim().toLowerCase();
  const visibleGroups = useMemo(() => {
    return patternGroups
      .filter((group) => activeGroup === "all" || group.id === activeGroup)
      .map((group) => ({
        ...group,
        items: group.items.filter((p) => matches(p, needle)),
      }))
      .filter((group) => group.items.length > 0);
  }, [patternGroups, activeGroup, needle]);

  function toggleCard(id: PatternId) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const visibleCount = visibleGroups.reduce((sum, g) => sum + g.items.length, 0);
  const remaining = total - learnedCount;

  return (
    <div>
      <Toolbar
        query={term}
        onQueryChange={setTerm}
        searchPlaceholder={t.searchPlaceholder.patterns}
        cardCountLabel={t.cardCount(total)}
        progressLabel={t.progress(learnedCount, total, "learned")}
      />

      <div className="flex flex-col gap-[26px] px-[30px] pt-7 md:flex-row">
        <SectionSidebar
          sections={sections}
          activeId={activeGroup}
          onChange={setActiveGroup}
          ariaLabel={t.sectionsHeading}
          stickyNote={<StickyNote eyebrow={t.tabs.patterns}>{t.shelfNote(remaining, "patterns")}</StickyNote>}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-[11px] font-semibold tracking-[.2em] text-cream-dim uppercase">
              {t.tabSub.patterns}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpenIds(new Set(visibleGroups.flatMap((g) => g.items.map((p) => p.id))))}
                className="font-display text-[10.5px] font-semibold tracking-[.1em] text-cream-dim uppercase hover:text-cream"
              >
                {t.expandAll}
              </button>
              <button
                type="button"
                onClick={() => setOpenIds(new Set())}
                className="font-display text-[10.5px] font-semibold tracking-[.1em] text-cream-dim uppercase hover:text-cream"
              >
                {t.collapseAll}
              </button>
              <p className="font-mono text-[12px] text-cream-soft">{t.filteredCount(visibleCount, total)}</p>
            </div>
          </div>

          {visibleGroups.length > 0 ? (
            visibleGroups.map((group) => (
              <div key={group.id} className="mb-7">
                <h2 className="font-serif text-[17px] tracking-tight text-cream">
                  {pick(group.g, group.gru)}
                </h2>
                <div className="mt-3 grid items-start gap-[22px] md:grid-cols-2">
                  {group.items.map((pattern, i) => (
                    <PinnedPatternCard
                      key={pattern.id}
                      pattern={pattern}
                      index={i}
                      pinColor={pinColorForIndex(patternGroups.indexOf(group))}
                      isOpen={openIds.has(pattern.id)}
                      learned={Boolean(learned[pattern.id])}
                      usage={usage[pattern.id] ?? []}
                      onToggleOpen={() => toggleCard(pattern.id)}
                      onToggleLearned={() => toggleLearned(pattern.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <EmptyState>{t.emptyState}</EmptyState>
          )}
        </div>
      </div>
    </div>
  );
}

function matches(pattern: AlgoPattern, needle: string): boolean {
  if (!needle) return true;
  const haystack = [
    pattern.n,
    pattern.nru,
    pattern.idea,
    pattern.idearu,
    pattern.code,
    ...pattern.when,
    ...pattern.whenru,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}
