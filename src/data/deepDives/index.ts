/**
 * Every deep-dive lesson, merged from one file per category.
 *
 * Split by category rather than kept in one 8000-line record: each file
 * stays readable on its own, and a lesson is found by the category of the
 * question it belongs to. The merge below refuses a question number that
 * appears in two files — the second copy would otherwise silently win.
 */
import { baseDeepDives } from "./base";
import { csharpDeepDives } from "./csharp";
import { renderingDeepDives } from "./rendering";
import { coreDeepDives } from "./core";
import { perfDeepDives } from "./perf";
import { physicsDeepDives } from "./physics";
import { animationDeepDives } from "./animation";
import { uiDeepDives } from "./ui";
import { memoryDeepDives } from "./memory";
import { netcodeDeepDives } from "./netcode";
import { toolingDeepDives } from "./tooling";

function mergeUnique(parts: Record<number, string>[]): Record<number, string> {
  const merged: Record<number, string> = {};
  for (const part of parts) {
    for (const [key, html] of Object.entries(part)) {
      const n = Number(key);
      if (merged[n] !== undefined) throw new Error(`Deep dive for question ${n} is defined twice`);
      merged[n] = html;
    }
  }
  return merged;
}

export const deepDives: Record<number, string> = mergeUnique([
  baseDeepDives,
  csharpDeepDives,
  renderingDeepDives,
  coreDeepDives,
  perfDeepDives,
  physicsDeepDives,
  animationDeepDives,
  uiDeepDives,
  memoryDeepDives,
  netcodeDeepDives,
  toolingDeepDives,
]);
