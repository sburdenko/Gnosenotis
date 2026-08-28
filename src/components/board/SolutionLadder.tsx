"use client";

import type { SolutionApproach } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * The list of approaches shown when a LeetCode card is unfolded, ordered
 * from the naive answer to the one worth writing live.
 *
 * The ordering is the point: an interview answer is the *path* between
 * those, not just the final trick, so the naive entries are rendered with
 * the same weight as the recommended one rather than hidden away.
 */
export function SolutionLadder({ approaches }: { approaches: SolutionApproach[] }) {
  const { t, pick } = useLanguage();

  return (
    <ol className="mt-1 flex flex-col gap-2.5">
      {approaches.map((approach, i) => (
        <li
          key={approach.n}
          className={"border-l-[3px] pl-3 " + (approach.pick ? "border-accent/70" : "border-black/15")}
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono text-[11px] text-ink-muted">{i + 1}.</span>
            <span className="font-serif text-[15px] font-bold text-ink">
              {pick(approach.n, approach.nru)}
            </span>
            {approach.pick === 1 && (
              <span className="rounded-sm border border-accent/50 px-1.5 py-px font-mono text-[10px] tracking-wide text-accent uppercase">
                {t.solutions.pick}
              </span>
            )}
          </div>

          <p className="mt-1 text-[14.5px] leading-snug text-ink-body">{pick(approach.i, approach.iru)}</p>

          <p className="mt-1 font-mono text-[11.5px] text-ink-muted">
            {t.solutions.time}: {approach.t} · {t.solutions.space}: {approach.sp}
          </p>
        </li>
      ))}
    </ol>
  );
}
