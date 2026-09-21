"use client";

import { useMemo, useState } from "react";
import type { BugHuntGroup, BugHuntItem } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEscapeToClose } from "@/hooks/useEscapeToClose";
import { useProgressSet } from "@/hooks/useProgressSet";
import { pinColorForIndex } from "@/lib/boardVisuals";
import { Toolbar } from "./Toolbar";
import { SectionSidebar } from "./SectionSidebar";
import { StickyNote } from "./StickyNote";
import { EmptyState } from "./EmptyState";
import { FRESH_GUESS, PinnedBugCard, type BugGuess } from "./PinnedBugCard";

const PROGRESS_KEY = "unity-bughunt-progress";

interface BugHuntBoardProps {
  bugHuntGroups: BugHuntGroup[];
}

/**
 * The one board that grades an answer instead of revealing it: each card
 * shows a snippet and the reader clicks the line they think is wrong.
 *
 * Guesses live in component state rather than localStorage on purpose —
 * a solved card should still be re-playable in the next session, so only
 * "I found this one" is persisted (through `useProgressSet`, same as every
 * other tab's pins).
 */
export function BugHuntBoard({ bugHuntGroups }: BugHuntBoardProps) {
  const { t, pick } = useLanguage();
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [guesses, setGuesses] = useState<Record<string, BugGuess>>({});
  // One explanation panel at a time: it hangs over the cards below (see
  // `PinnedCardShell`'s `overlay`), so two open at once would overlap.
  const [openId, setOpenId] = useState<string | null>(null);
  useEscapeToClose(openId !== null, () => setOpenId(null));
  const { done, toggle, count } = useProgressSet(PROGRESS_KEY);

  const total = useMemo(
    () => bugHuntGroups.reduce((sum, group) => sum + group.items.length, 0),
    [bugHuntGroups],
  );

  const sections = [
    { id: "all", label: t.bugHunt.allFilter, count: total },
    ...bugHuntGroups.map((group) => ({
      id: group.id,
      label: pick(group.g, group.gru),
      count: group.items.length,
    })),
  ];

  const needle = term.trim().toLowerCase();
  const visibleGroups = useMemo(() => {
    return bugHuntGroups
      .filter((group) => category === "all" || group.id === category)
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!needle) return true;
          return `${item.t}${item.tru}${item.code}${item.a}${item.aru}${item.fix}${item.fixru}`
            .toLowerCase()
            .includes(needle);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [bugHuntGroups, category, needle]);

  const visibleCount = visibleGroups.reduce((sum, group) => sum + group.items.length, 0);
  const remaining = total - count;

  function guessFor(id: string): BugGuess {
    return guesses[id] ?? FRESH_GUESS;
  }

  function updateGuess(id: string, next: BugGuess) {
    setGuesses((current) => ({ ...current, [id]: next }));
  }

  function pickLine(item: BugHuntItem, line: number) {
    const guess = guessFor(item.id);
    if (guess.solved || guess.revealed || guess.picked.includes(line)) return;

    const solved = item.bug.includes(line);
    updateGuess(item.id, { ...guess, picked: [...guess.picked, line], solved });

    if (solved) {
      setOpenId(item.id);
      // Finding it yourself is what the pin records; "show me" never does.
      if (!done[item.id]) toggle(item.id);
    }
  }

  function reveal(item: BugHuntItem) {
    updateGuess(item.id, { ...guessFor(item.id), revealed: true });
    setOpenId(item.id);
  }

  function retry(item: BugHuntItem) {
    updateGuess(item.id, FRESH_GUESS);
    setOpenId((current) => (current === item.id ? null : current));
  }

  return (
    <div>
      <Toolbar
        query={term}
        onQueryChange={setTerm}
        searchPlaceholder={t.searchPlaceholder.bugs}
        cardCountLabel={t.cardCount(total)}
        progressLabel={t.progress(count, total, "found")}
      />

      <div className="flex flex-col gap-[26px] px-4 pt-7 md:px-[30px] md:flex-row">
        <SectionSidebar
          sections={sections}
          activeId={category}
          onChange={setCategory}
          ariaLabel={t.sectionsHeading}
          stickyNote={<StickyNote eyebrow={t.tabs.bugs}>{t.shelfNote(remaining, "bugs")}</StickyNote>}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-3.5 flex items-baseline justify-between">
            <p className="font-display text-[11px] font-semibold tracking-[.2em] text-cream-dim uppercase">
              {t.tabSub.bugs}
            </p>
            <p className="font-mono text-[12px] text-cream-soft">{t.filteredCount(visibleCount, total)}</p>
          </div>

          {visibleGroups.length > 0 ? (
            visibleGroups.map((group) => (
              <div key={group.id} className="mb-7">
                <h2 className="font-serif text-[17px] tracking-tight text-cream">
                  {pick(group.g, group.gru)}
                </h2>
                <div className="mt-3 grid grid-cols-1 items-start gap-[22px] md:grid-cols-2">
                  {group.items.map((item, i) => (
                    <PinnedBugCard
                      key={item.id}
                      item={item}
                      index={i}
                      pinColor={pinColorForIndex(i)}
                      guess={guessFor(item.id)}
                      found={Boolean(done[item.id])}
                      isOpen={openId === item.id}
                      onPickLine={(line) => pickLine(item, line)}
                      onReveal={() => reveal(item)}
                      onRetry={() => retry(item)}
                      onToggleOpen={() => setOpenId((current) => (current === item.id ? null : item.id))}
                      onToggleFound={() => toggle(item.id)}
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
