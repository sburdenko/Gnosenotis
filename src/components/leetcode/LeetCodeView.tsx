"use client";

import { useMemo, useState } from "react";
import type { LeetCodeGroup } from "@/types/content";
import { useProgressSet } from "@/hooks/useProgressSet";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Badge } from "@/components/resources/Badge";

const STORAGE_KEY = "unity-leetcode-progress";

type FilterKey = "all" | "easy" | "med" | "hard" | "core";

export function LeetCodeView({ leetcodeGroups }: { leetcodeGroups: LeetCodeGroup[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const { done, toggle, reset, count } = useProgressSet(STORAGE_KEY);

  const total = leetcodeGroups.reduce((sum, g) => sum + g.items.length, 0);
  const coreCount = leetcodeGroups.reduce((sum, g) => sum + g.items.filter((i) => i.core).length, 0);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: `All (${total})` },
    { key: "easy", label: `Easy (${leetcodeGroups[0]?.items.length ?? 0})` },
    { key: "med", label: `Medium (${leetcodeGroups[1]?.items.length ?? 0})` },
    { key: "hard", label: `Hard (${leetcodeGroups[2]?.items.length ?? 0})` },
    { key: "core", label: `Core (${coreCount})` },
  ];

  const visibleGroups = useMemo(() => {
    return leetcodeGroups
      .filter((g) => filter === "all" || filter === "core" || g.d === filter)
      .map((g) => ({ ...g, items: g.items.filter((i) => filter !== "core" || i.core) }))
      .filter((g) => g.items.length > 0);
  }, [leetcodeGroups, filter]);

  return (
    <div>
      <div className="mt-4.5 rounded-lg border border-line border-l-3 border-l-accent bg-panel p-3.5 text-[13.5px]">
        58 problems ordered by difficulty (18 easy · 30 medium · 10 hard), picked for gameplay/engine interviews —
        grids and pathfinding, intervals, caching, heaps, matrices. The 23 marked <Badge tone="core">core</Badge> are
        the ones to do first if you only have a week.
        <div className="mt-1.5 text-[11.5px] text-muted">
          58 задач по возрастанию сложности (18 easy · 30 medium · 10 hard), отобранных под геймплей- и движковые
          собесы: сетки и поиск пути, интервалы, кэширование, кучи, матрицы. 23 задачи с меткой core — делать первыми,
          если есть только неделя.
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={
              filter === f.key
                ? "rounded-full border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-semibold whitespace-nowrap text-[#06121f]"
                : "rounded-full border border-line bg-panel px-3 py-1.5 text-[12.5px] whitespace-nowrap text-muted hover:border-[#3a4655] hover:text-txt"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <ProgressBar label="solved" count={count} total={total} onReset={reset} />

      {visibleGroups.map((group) => (
        <div key={group.g} className="mt-6.5">
          <h2 className="text-[17px] tracking-tight">
            {group.g} <Badge tone={group.d}>{group.items.length}</Badge>
          </h2>
          <div className="mb-2.5 text-[11.5px] text-muted">{group.gru}</div>

          {group.items.map((item) => {
            const url = `https://leetcode.com/problems/${item.s}/`;
            return (
              <label
                key={item.s}
                className={`mb-2 flex items-start gap-3 rounded-[10px] border border-line bg-panel p-3 ${
                  done[item.s] ? "opacity-50" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(done[item.s])}
                  onChange={() => toggle(item.s)}
                  className="mt-1 h-3.75 w-3.75 accent-ok"
                />
                <div className="min-w-0 flex-1">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener"
                    className="text-[14.5px] font-semibold text-accent hover:underline"
                  >
                    {item.t}
                  </a>
                  <span className="ml-1.5 text-[11px] text-muted">{item.k}</span>
                  <div className="mt-1 text-[12.5px]">{item.why}</div>
                  <div className="mt-0.5 text-[11px] leading-relaxed text-muted">{item.whyru}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge tone={group.d}>{group.d === "med" ? "medium" : group.d}</Badge>
                    {item.core && <Badge tone="core">core</Badge>}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      ))}
    </div>
  );
}
