import { questions as rawQuestions } from "./questions";
import { deepDives } from "./deepDives";
import type { Question } from "@/types/content";

/**
 * Questions with their deep-dive HTML (if any) merged in as `question.d`.
 *
 * The original app did this with a mutating loop (`q.d = D[q.n]`). We build a
 * new array instead — nothing downstream can accidentally hand out a
 * `Question` object and have another module mutate it later.
 */
export const questionsWithDeepDives: Question[] = rawQuestions.map((question) => {
  const deepDive = deepDives[question.n];
  if (deepDive && question.d) {
    throw new Error(`Question ${question.n} has both an inline deep dive and one in src/data/deepDives`);
  }
  return deepDive ? { ...question, d: deepDive } : question;
});

// A lesson keyed to a question number that does not exist would never be
// reachable from the board; failing `next build` is the only way to notice.
const questionNumbers = new Set(rawQuestions.map((question) => question.n));
const orphans = Object.keys(deepDives).filter((key) => !questionNumbers.has(Number(key)));
if (orphans.length > 0) throw new Error(`Deep dives without a question: ${orphans.join(", ")}`);

export { resourceGroups } from "./resources";
export { leetcodeProblems, leetcodeTopicGroups } from "./leetcode";
export { patternGroups, patternsById } from "./patterns";
export { bugHuntGroups, bugHuntItems } from "./bughunt";
export type {
  Question,
  ResourceGroup,
  ResourceItem,
  LeetCodeProblem,
  LeetCodeTopicGroup,
  LeetTopicId,
  LeetCodeItem,
  LeetCodeDifficulty,
  AlgoPattern,
  PatternGroup,
  PatternId,
  SolutionApproach,
  BugHuntItem,
  BugHuntGroup,
  BugCategoryId,
} from "@/types/content";
