"use client";

import { useState } from "react";
import type { AlgoPattern, LeetCodeItem, LeetCodeDifficulty, PatternId } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import type { PinColor } from "@/lib/boardVisuals";
import { PinnedCardShell } from "./PinnedCardShell";
import { Badge } from "./Badge";
import { PatternChips } from "./PatternChips";
import { PatternDetails } from "./PatternDetails";
import { SolutionLadder } from "./SolutionLadder";

const DIFFICULTY_PIN: Record<LeetCodeDifficulty, PinColor> = {
  easy: "green",
  med: "yellow",
  hard: "red",
};

interface PinnedLeetCodeCardProps {
  item: LeetCodeItem;
  index: number;
  difficulty: LeetCodeDifficulty;
  done: boolean;
  isOpen: boolean;
  patternsById: Record<PatternId, AlgoPattern>;
  onToggleDone: () => void;
  onToggleOpen: () => void;
}

export function PinnedLeetCodeCard({
  item,
  index,
  difficulty,
  done,
  isOpen,
  patternsById,
  onToggleDone,
  onToggleOpen,
}: PinnedLeetCodeCardProps) {
  const { t, pick } = useLanguage();
  const url = `https://leetcode.com/problems/${item.s}/`;

  // Which pattern is unfolded inside this card. Card-local on purpose:
  // nothing outside it reads or sets this, so lifting it into the board
  // would only add a prop nobody else needs.
  const [openPattern, setOpenPattern] = useState<PatternId | null>(null);

  return (
    <PinnedCardShell
      index={index}
      pinColor={DIFFICULTY_PIN[difficulty]}
      done={done}
      onTogglePin={onToggleDone}
      pinLabel={t.pinAria(done, "solved")}
      meta={item.k}
      title={
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-link hover:text-link-hover hover:underline"
        >
          {item.t}
        </a>
      }
      overlay={
        isOpen && (
          <div className="border-t border-black/10 pt-2.5">
            <p className="mb-1.5 font-display text-[10.5px] font-semibold tracking-[.16em] text-ink-muted uppercase">
              {t.solutions.patterns}
            </p>
            <PatternChips
              ids={item.pat}
              patternsById={patternsById}
              openId={openPattern}
              onToggle={(id) => setOpenPattern((current) => (current === id ? null : id))}
            />

            {openPattern && (
              <div className="mt-2.5 border-l-[3px] border-link/40 pl-3">
                <p className="text-[14.5px] leading-snug text-ink-body">
                  {pick(patternsById[openPattern].idea, patternsById[openPattern].idearu)}
                </p>
                <p className="mt-1 font-mono text-[11.5px] text-ink-muted">{patternsById[openPattern].cx}</p>
                <PatternDetails pattern={patternsById[openPattern]} />
              </div>
            )}

            <p className="mt-3.5 mb-1.5 font-display text-[10.5px] font-semibold tracking-[.16em] text-ink-muted uppercase">
              {t.solutions.approaches}
            </p>
            <SolutionLadder approaches={item.sol} />
          </div>
        )
      }
    >
      <p className="font-hand text-[18px] leading-tight text-hand">{pick(item.why, item.whyru)}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge tone={difficulty}>{t.badges[difficulty === "med" ? "medium" : difficulty]}</Badge>
        {item.core && <Badge tone="core">{t.badges.core}</Badge>}
      </div>

      {/*
        The card header holds the problem link, so unfolding lives on its own
        control instead of a header click — otherwise every attempt to open
        LeetCode would also toggle the card underneath the pointer.
      */}
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        className="mt-3 flex items-center gap-1.5 font-display text-[11px] font-semibold tracking-[.1em] text-accent uppercase hover:text-accent-hover"
      >
        <span aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
        {t.solutions.toggle(item.sol.length)}
      </button>
    </PinnedCardShell>
  );
}
