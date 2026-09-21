/**
 * The "Bug hunt" catalog: 100 snippets that compile, run, and are wrong.
 *
 * One file per family, and an index that does nothing but order them — the
 * same split as `src/data/patterns` and for the same reason.
 */
import type { BugHuntGroup, BugHuntItem } from "@/types/content";
import { csharpBugs } from "./csharp";
import { unityBugs } from "./unity";
import { asyncBugs } from "./async";
import { physicsBugs } from "./physics";
import { perfBugs } from "./perf";

export const bugHuntGroups: BugHuntGroup[] = [
  { id: "csharp", g: "C# language", gru: "Язык C#", items: csharpBugs },
  { id: "unity", g: "Unity API & lifecycle", gru: "API и жизненный цикл Unity", items: unityBugs },
  { id: "async", g: "Async & threads", gru: "Асинхронность и потоки", items: asyncBugs },
  { id: "physics", g: "Physics, input & time", gru: "Физика, ввод и время", items: physicsBugs },
  { id: "perf", g: "Performance & rendering", gru: "Производительность и рендер", items: perfBugs },
];

/**
 * Build-time validation of the answer keys.
 *
 * The answer to a card is a set of line *numbers*, which is exactly the kind
 * of data that silently rots when a snippet gains a line. This module is
 * reached from a Server Component, so these checks run during `next build`:
 * an answer pointing past the end of its snippet fails the build instead of
 * producing a card that can never be solved.
 */
function validate(groups: BugHuntGroup[]): BugHuntItem[] {
  const seen = new Set<string>();
  const all: BugHuntItem[] = [];

  for (const group of groups) {
    for (const item of group.items) {
      if (seen.has(item.id)) throw new Error(`Duplicate bug-hunt id: ${item.id}`);
      seen.add(item.id);

      if (item.c !== group.id) {
        throw new Error(`Bug ${item.id} is filed under "${group.id}" but tagged "${item.c}"`);
      }

      const lineCount = item.code.split("\n").length;
      if (item.bug.length === 0) throw new Error(`Bug ${item.id} has no answer lines`);
      for (const line of item.bug) {
        if (line < 1 || line > lineCount) {
          throw new Error(`Bug ${item.id} points at line ${line} of a ${lineCount}-line snippet`);
        }
      }

      all.push(item);
    }
  }

  return all;
}

/** Every snippet in one flat list — used for the total count and the "all" filter. */
export const bugHuntItems: BugHuntItem[] = validate(bugHuntGroups);
