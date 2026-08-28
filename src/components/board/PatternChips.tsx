"use client";

import type { AlgoPattern, PatternId } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";

interface PatternChipsProps {
  ids: PatternId[];
  patternsById: Record<PatternId, AlgoPattern>;
  /** The chip currently unfolded below the row, if any. */
  openId: PatternId | null;
  onToggle: (id: PatternId) => void;
}

/**
 * Row of pattern references on an unfolded LeetCode card. Each chip toggles
 * the pattern open *in place* rather than navigating to the Patterns tab —
 * you are mid-problem, and being thrown onto another board to read the
 * template loses your place.
 */
export function PatternChips({ ids, patternsById, openId, onToggle }: PatternChipsProps) {
  const { pick } = useLanguage();

  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const isOpen = id === openId;
        return (
          <button
            key={id}
            type="button"
            aria-expanded={isOpen}
            onClick={() => onToggle(id)}
            className={
              "flex items-center gap-1.5 rounded-sm border px-2 py-px font-mono text-[11px] " +
              (isOpen
                ? "border-link bg-link/10 text-link"
                : "border-link/40 bg-kraft-dim/60 text-link hover:border-link hover:bg-kraft-hover")
            }
          >
            <span aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
            {pick(patternsById[id].n, patternsById[id].nru)}
          </button>
        );
      })}
    </div>
  );
}
