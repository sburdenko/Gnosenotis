/**
 * Curated LeetCode problems.
 *
 * Authored one file per difficulty — which file a problem lives in *is* its
 * difficulty — and served grouped by topic, because that is how people
 * actually prepare ("I am weak on graphs", not "I am weak on mediums").
 * Difficulty survives the regrouping as a badge on each card and as the
 * board's filter.
 */
import type {
  LeetCodeDifficulty,
  LeetCodeItem,
  LeetCodeProblem,
  LeetCodeTopicGroup,
} from "@/types/content";
import { easyProblems } from "./easy";
import { mediumProblems } from "./medium";
import { hardProblems } from "./hard";
import { LEET_TOPICS, topicForPattern } from "./topics";

/** Difficulty order inside a topic: the ladder you would climb, not file order. */
const DIFFICULTY_ORDER: LeetCodeDifficulty[] = ["easy", "med", "hard"];

function withDifficulty(items: LeetCodeItem[], d: LeetCodeDifficulty): LeetCodeProblem[] {
  return items.map((item) => ({ ...item, d }));
}

/** Every problem, each carrying the difficulty of the file it was authored in. */
export const leetcodeProblems: LeetCodeProblem[] = [
  ...withDifficulty(easyProblems, "easy"),
  ...withDifficulty(mediumProblems, "med"),
  ...withDifficulty(hardProblems, "hard"),
];

/**
 * The same problems grouped by topic, in `LEET_TOPICS` order.
 *
 * A problem is filed under the topic of its *first* pattern, so one that
 * drills bit tricks and a hash set lands with the bit problems and still
 * shows both chips when unfolded.
 */
export const leetcodeTopicGroups: LeetCodeTopicGroup[] = LEET_TOPICS.map((topic) => ({
  ...topic,
  items: DIFFICULTY_ORDER.flatMap((difficulty) =>
    leetcodeProblems.filter(
      (problem) => problem.d === difficulty && topicForPattern(problem.pat[0]) === topic.id,
    ),
  ),
})).filter((group) => group.items.length > 0);
