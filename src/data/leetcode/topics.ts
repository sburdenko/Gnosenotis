/**
 * Topic headings for the LeetCode board, and the pattern → topic table.
 *
 * A problem's topic is derived from the first entry of its `pat` array
 * (documented as "most relevant first") rather than authored separately:
 * a second field would be a second source of truth, and the first thing to
 * disagree with the pattern chips printed on the same card.
 */
import { PATTERN_IDS, type LeetTopicId, type PatternId } from "@/types/content";

export interface LeetTopicMeta {
  id: LeetTopicId;
  g: string;
  gru: string;
}

export const LEET_TOPICS: LeetTopicMeta[] = [
  { id: "scan", g: "Two pointers & sliding window", gru: "Два указателя и окно" },
  { id: "hashing", g: "Hash maps & counting", gru: "Хэш-мапы и счётчики" },
  { id: "bits", g: "Bit manipulation", gru: "Побитовые операции" },
  { id: "linear", g: "Lists & stacks", gru: "Списки и стеки" },
  { id: "search", g: "Binary search", gru: "Бинарный поиск" },
  { id: "ordering", g: "Sorting, heaps & greedy", gru: "Сортировка, кучи и жадность" },
  { id: "trees", g: "Trees", gru: "Деревья" },
  { id: "graphs", g: "Graphs", gru: "Графы" },
  { id: "dp", g: "Dynamic programming", gru: "Динамическое программирование" },
  { id: "backtracking", g: "Backtracking", gru: "Бэктрекинг" },
  { id: "design", g: "Data structure design", gru: "Проектирование структур" },
];

const TOPIC_BY_PATTERN: Record<PatternId, LeetTopicId> = {
  "two-pointers": "scan",
  "sliding-window": "scan",
  "prefix-sum": "scan",
  "in-place": "scan",
  "matrix-traversal": "scan",
  "hash-map": "hashing",
  bitwise: "bits",
  "fast-slow": "linear",
  "list-surgery": "linear",
  stack: "linear",
  monotonic: "linear",
  "binary-search": "search",
  "binary-search-answer": "search",
  "heap-topk": "ordering",
  quickselect: "ordering",
  greedy: "ordering",
  intervals: "ordering",
  "tree-dfs": "trees",
  "tree-bfs": "trees",
  "grid-flood": "graphs",
  "graph-traversal": "graphs",
  "bfs-shortest": "graphs",
  dijkstra: "graphs",
  "topo-sort": "graphs",
  "union-find": "graphs",
  backtracking: "backtracking",
  "dp-1d": "dp",
  "dp-grid": "dp",
  "dp-knapsack": "dp",
  "design-composite": "design",
  serialization: "design",
};

// Runs during `next build` (this module is reached from a Server Component):
// a pattern added to PATTERN_IDS without a topic fails the build instead of
// quietly dropping every problem that drills it off the board.
const unmapped = PATTERN_IDS.filter((id) => !TOPIC_BY_PATTERN[id]);
if (unmapped.length > 0) throw new Error(`Patterns without a topic: ${unmapped.join(", ")}`);

export function topicForPattern(pattern: PatternId): LeetTopicId {
  return TOPIC_BY_PATTERN[pattern];
}
