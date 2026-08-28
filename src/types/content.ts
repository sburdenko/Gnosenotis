/**
 * Shared content types for the interview-prep site.
 *
 * Learning note (TypeScript): these `interface`s exist purely to describe the
 * *shape* of our data files (`src/data/*.ts`). Unlike the original vanilla-JS
 * version — where a typo like `qru` vs `qRu` would only surface as a blank
 * spot in the rendered page — TypeScript checks every data entry and every
 * component prop against these shapes at build time, so a mistake fails the
 * build instead of shipping silently.
 */

/** A single interview question, as shown in the "Questions" tab. */
export interface Question {
  /** Stable sequential id (1..340). Used as the React `key` and to link a card to its deep dive. */
  n: number;
  /** Category tag (e.g. "C#", "Rendering") — powers the category filter pills. */
  c: string;
  /**
   * Priority within its category, for the newer batch of questions only
   * ("core" = ask this first, "mid" = good follow-up). Older questions
   * predate this field and omit it — treat missing as "unranked", not "low priority".
   */
  p?: "core" | "mid";
  /** Question text, English. Plain text: rendered as text, never as HTML. */
  q: string;
  /** Question text, Russian translation. Plain text, same rules as `q`. */
  qru: string;
  /**
   * Answer, English. Contains hand-authored inline HTML (`<code>…</code>`)
   * for term highlighting. This is static content we wrote ourselves, not
   * user input, which is what makes rendering it with `dangerouslySetInnerHTML`
   * safe later in `PinnedQuestionCard` — see the comment there before copying
   * this pattern anywhere that touches untrusted data.
   */
  a: string;
  /** Answer, Russian translation. Same trusted-HTML rules as `a`. */
  aru: string;
  /**
   * Optional "deep dive" lesson body (trusted HTML). Either authored inline
   * on the question itself, or merged in at load time from
   * `src/data/deepDives.ts` — see `src/data/index.ts`. Only ~140 of the 340
   * questions currently have one.
   */
  d?: string;
}

/** One link in the curated "Reading list" tab. */
export interface ResourceItem {
  /** Link title, shown as the clickable text. */
  t: string;
  /** Target URL. */
  u: string;
  /** Badges rendered next to the title, e.g. "must read" / "free". */
  b: string[];
  /** Why it matters, English. */
  d: string;
  /** Why it matters, Russian translation. */
  dru: string;
}

/** A themed group of reading-list links (e.g. "Graphics & shaders"). */
export interface ResourceGroup {
  /** Group heading, English. */
  g: string;
  /** Group heading, Russian translation. */
  gru: string;
  items: ResourceItem[];
}

/** Difficulty bucket used both as a filter key and a badge label. */
export type LeetCodeDifficulty = "easy" | "med" | "hard";

/** One curated LeetCode problem in the "LeetCode" tab. */
export interface LeetCodeItem {
  /** Problem title. */
  t: string;
  /** LeetCode URL slug — the full link is built as `https://leetcode.com/problems/{s}/`. */
  s: string;
  /** Underlying technique/concept, shown as a small topic label. */
  k: string;
  /** Present (and `1`) when this problem is in the "do these first" core set. */
  core?: 1;
  /** Why this problem is worth doing, English. */
  why: string;
  /** Why this problem is worth doing, Russian translation. */
  whyru: string;
  /**
   * Patterns this problem drills, most relevant first. Typed as `PatternId`,
   * so every reference here is guaranteed to resolve to a real pattern card.
   */
  pat: PatternId[];
  /** Solution ladder, from the naive answer to the one to write live. */
  sol: SolutionApproach[];
}

/** A difficulty-grouped bucket of LeetCode problems. */
export interface LeetCodeGroup {
  /** Group heading, English. */
  g: string;
  /** Group heading, Russian translation. */
  gru: string;
  /** Difficulty bucket this group belongs to. */
  d: LeetCodeDifficulty;
  items: LeetCodeItem[];
}

/**
 * Every algorithm pattern the site teaches, as a closed list.
 *
 * Declaring the ids `as const` and deriving `PatternId` from them is what
 * makes the cross-references in `src/data/leetcode/*` compile-checked: a
 * typo like `"two-pointer"` in a problem's `pat` array fails `next build`
 * instead of quietly rendering a chip that links nowhere.
 */
export const PATTERN_IDS = [
  "two-pointers",
  "sliding-window",
  "prefix-sum",
  "intervals",
  "in-place",
  "matrix-traversal",
  "binary-search",
  "binary-search-answer",
  "heap-topk",
  "quickselect",
  "monotonic",
  "greedy",
  "hash-map",
  "bitwise",
  "fast-slow",
  "list-surgery",
  "stack",
  "tree-dfs",
  "tree-bfs",
  "grid-flood",
  "graph-traversal",
  "bfs-shortest",
  "dijkstra",
  "topo-sort",
  "union-find",
  "backtracking",
  "dp-1d",
  "dp-grid",
  "dp-knapsack",
  "design-composite",
  "serialization",
] as const;

export type PatternId = (typeof PATTERN_IDS)[number];

/**
 * One way to solve a problem. A problem carries several of these, ordered
 * from the naive answer to the one worth writing live, so the card shows the
 * *path* between them rather than only the final trick.
 */
export interface SolutionApproach {
  /** Approach name, English (e.g. "Brute force", "Hash map in one pass"). */
  n: string;
  /** Approach name, Russian. */
  nru: string;
  /** How it works, English. Two sentences at most — this is a reminder, not a tutorial. */
  i: string;
  /** How it works, Russian. */
  iru: string;
  /** Time complexity, e.g. "O(n log n)". */
  t: string;
  /** Space complexity, e.g. "O(1)". */
  sp: string;
  /** Present (and `1`) on the approach to actually write in an interview. */
  pick?: 1;
}

/** A reusable algorithm pattern, as shown in the "Patterns" tab. */
export interface AlgoPattern {
  id: PatternId;
  /** Pattern name, English. */
  n: string;
  /** Pattern name, Russian. */
  nru: string;
  /** The core idea in one sentence, English. */
  idea: string;
  /** The core idea in one sentence, Russian. */
  idearu: string;
  /** Recognition signals — "reach for this when you see…", English. */
  when: string[];
  /** Recognition signals, Russian. */
  whenru: string[];
  /** Typical complexity of the pattern, e.g. "O(n) time / O(1) space". */
  cx: string;
  /**
   * C# skeleton to reproduce from memory. Plain text, rendered inside
   * `<pre>` by React — unlike `Question.a`, this is *not* HTML and must
   * never be passed to `dangerouslySetInnerHTML`.
   */
  code: string;
  /** Mistakes people actually make under interview pressure, English. */
  traps: string[];
  /** Same pitfalls, Russian. */
  trapsru: string[];
}

/** A themed family of patterns (e.g. "Trees & graphs"). */
export interface PatternGroup {
  /** Filter key used by the sidebar. */
  id: string;
  /** Group heading, English. */
  g: string;
  /** Group heading, Russian. */
  gru: string;
  items: AlgoPattern[];
}
