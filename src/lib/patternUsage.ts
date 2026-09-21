import type { LeetCodeDifficulty, LeetCodeProblem, PatternId } from "@/types/content";

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
 * with the cards it points at. Note it indexes *every* pattern a problem
 * references, not just the first one the board files it under.
 */
export function buildPatternUsage(problems: LeetCodeProblem[]): Partial<Record<PatternId, PatternUsage[]>> {
  const usage: Partial<Record<PatternId, PatternUsage[]>> = {};

  for (const problem of problems) {
    for (const patternId of problem.pat) {
      const entry: PatternUsage = {
        t: problem.t,
        s: problem.s,
        d: problem.d,
        core: problem.core,
      };
      usage[patternId] = [...(usage[patternId] ?? []), entry];
    }
  }

  return usage;
}
