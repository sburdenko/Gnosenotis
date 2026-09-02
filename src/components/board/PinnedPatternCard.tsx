"use client";

import type { AlgoPattern } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import type { PinColor } from "@/lib/boardVisuals";
import type { PatternUsage } from "@/lib/patternUsage";
import { PinnedCardShell } from "./PinnedCardShell";
import { PatternDetails } from "./PatternDetails";

interface PinnedPatternCardProps {
  pattern: AlgoPattern;
  index: number;
  pinColor: PinColor;
  isOpen: boolean;
  learned: boolean;
  /** Problems that reference this pattern — derived, never hand-listed. */
  usage: PatternUsage[];
  onToggleOpen: () => void;
  onToggleLearned: () => void;
}

export function PinnedPatternCard({
  pattern,
  index,
  pinColor,
  isOpen,
  learned,
  usage,
  onToggleOpen,
  onToggleLearned,
}: PinnedPatternCardProps) {
  const { t, pick } = useLanguage();

  return (
    <PinnedCardShell
      index={index}
      pinColor={pinColor}
      done={learned}
      onTogglePin={onToggleLearned}
      pinLabel={t.pinAria(learned, "learned")}
      onHeaderClick={onToggleOpen}
      meta={t.patterns.problemCount(usage.length)}
      title={pick(pattern.n, pattern.nru)}
      overlay={
        isOpen && (
          <div className="border-t border-black/10 pt-2.5">
            <PatternDetails pattern={pattern} usage={usage} />
          </div>
        )
      }
    >
      <p className="text-[15px] leading-snug text-ink-body">{pick(pattern.idea, pattern.idearu)}</p>

      {/*
        Complexity sits in the body rather than the header's meta slot: the
        strings run to "O(n) time / O(1) space — each element enters and
        leaves once", which overflows a right-aligned, non-shrinking header cell.
      */}
      <p className="mt-2 font-mono text-[11.5px] text-ink-muted">{pattern.cx}</p>

      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        className="mt-3 flex items-center gap-1.5 font-display text-[11px] font-semibold tracking-[.1em] text-accent uppercase hover:text-accent-hover"
      >
        <span aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
        {isOpen ? t.patterns.collapse : t.patterns.expand}
      </button>
    </PinnedCardShell>
  );
}
