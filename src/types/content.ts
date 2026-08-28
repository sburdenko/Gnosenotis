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
