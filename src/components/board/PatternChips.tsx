"use client";

import type { AlgoPattern, PatternId } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";

interface PatternChipsProps {
  ids: PatternId[];
  patternsById: Record<PatternId, AlgoPattern>;
  /** Jumps to the Patterns tab with that card opened — see `BoardShell`. */
  onOpenPattern: (id: PatternId) => void;
}

/** Row of clickable pattern references shown on an unfolded LeetCode card. */
export function PatternChips({ ids, patternsById, onOpenPattern }: PatternChipsProps) {
  const { pick } = useLanguage();

  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const pattern = patternsById[id];
        return (
          <button
            key={id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPattern(id);
            }}
            className="rounded-sm border border-link/40 bg-kraft-dim/60 px-2 py-px font-mono text-[11px] text-link hover:border-link hover:bg-kraft-hover"
          >
            {pick(pattern.n, pattern.nru)}
          </button>
        );
      })}
    </div>
  );
}
