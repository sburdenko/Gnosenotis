/**
 * Curated LeetCode problems, grouped by difficulty.
 *
 * One file per difficulty bucket rather than a single module: the problem
 * set grew a solution ladder and pattern references per entry, and the
 * groups themselves are the only thing that belongs in the index.
 */
import type { LeetCodeGroup } from "@/types/content";
import { easyProblems } from "./easy";
import { mediumProblems } from "./medium";
import { hardProblems } from "./hard";

export const leetcodeGroups: LeetCodeGroup[] = [
  {
    g: "Easy — warm-up",
    gru: "Easy — разминка",
    d: "easy",
    items: easyProblems,
  },
  {
    g: "Medium — the interview core",
    gru: "Medium — ядро собеседований",
    d: "med",
    items: mediumProblems,
  },
  {
    g: "Hard — the differentiators",
    gru: "Hard — то, что отличает",
    d: "hard",
    items: hardProblems,
  },
];
