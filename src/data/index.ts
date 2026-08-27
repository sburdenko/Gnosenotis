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
  return deepDive ? { ...question, d: deepDive } : question;
});

export { resourceGroups } from "./resources";
export { leetcodeGroups } from "./leetcode";
export type { Question, ResourceGroup, ResourceItem, LeetCodeGroup, LeetCodeItem, LeetCodeDifficulty } from "@/types/content";
