/**
 * The algorithm patterns catalog, grouped into families.
 *
 * Split across one file per family rather than one 1000-line module: each
 * file below stays readable on its own, and this index is the only place
 * that decides the order they appear in.
 */
import { PATTERN_IDS, type AlgoPattern, type PatternGroup, type PatternId } from "@/types/content";
import { arrayPatterns } from "./arrays";
import { searchPatterns } from "./search";
import { linearPatterns } from "./linear";
import { graphPatterns } from "./graphs";
import { dpPatterns } from "./dp";
import { designPatterns } from "./design";

export const patternGroups: PatternGroup[] = [
  {
    id: "arrays",
    g: "Arrays & strings",
    gru: "Массивы и строки",
    items: arrayPatterns,
  },
  {
    id: "search",
    g: "Search & ordering",
    gru: "Поиск и порядок",
    items: searchPatterns,
  },
  {
    id: "linear",
    g: "Hashing, bits, lists & stacks",
    gru: "Хэши, биты, списки и стеки",
    items: linearPatterns,
  },
  {
    id: "graphs",
    g: "Trees & graphs",
    gru: "Деревья и графы",
    items: graphPatterns,
  },
  {
    id: "dp",
    g: "Dynamic programming",
    gru: "Динамическое программирование",
    items: dpPatterns,
  },
  {
    id: "design",
    g: "Design round",
    gru: "Проектирование структур",
    items: designPatterns,
  },
];

/**
 * Lookup used by the LeetCode cards to turn a `PatternId` reference into a
 * readable chip.
 *
 * The two assertions below run during `next build` (this module is reached
 * from a Server Component), so a pattern that is declared in `PATTERN_IDS`
 * but never written — or written twice — fails the build instead of
 * rendering an empty card mid-session.
 */
function buildIndex(groups: PatternGroup[]): Record<PatternId, AlgoPattern> {
  const byId = {} as Record<PatternId, AlgoPattern>;

  for (const group of groups) {
    for (const pattern of group.items) {
      if (byId[pattern.id]) throw new Error(`Duplicate pattern id: ${pattern.id}`);
      byId[pattern.id] = pattern;
    }
  }

  const missing = PATTERN_IDS.filter((id) => !byId[id]);
  if (missing.length > 0) throw new Error(`Patterns declared but not written: ${missing.join(", ")}`);

  return byId;
}

export const patternsById: Record<PatternId, AlgoPattern> = buildIndex(patternGroups);
