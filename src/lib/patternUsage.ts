import type { LeetCodeDifficulty, LeetCodeGroup, PatternId } from "@/types/content";

/** One problem that drills a given pattern, as listed on the pattern card. */
export interface PatternUsage {
  /** Problem title. */
  t: string;
  /** LeetCode slug, used to build the link. */
  s: string;
  d: LeetCodeDifficulty;
  core?: 1;
}

/**
 * Reverse index: pattern id → the problems that reference it.
 *
 * Derived from the LeetCode data rather than listed a second time on each
 * pattern. A hand-written list would be a second source of truth that goes
 * stale the moment a problem's `pat` array changes; this cannot disagree
 * with the cards it points at.
 */
export function buildPatternUsage(groups: LeetCodeGroup[]): Partial<Record<PatternId, PatternUsage[]>> {
  const usage: Partial<Record<PatternId, PatternUsage[]>> = {};

  for (const group of groups) {
    for (const item of group.items) {
      for (const patternId of item.pat) {
        const entry: PatternUsage = {
          t: item.t,
          s: item.s,
          d: group.d,
          core: item.core,
        };
        usage[patternId] = [...(usage[patternId] ?? []), entry];
      }
    }
  }

  return usage;
}
