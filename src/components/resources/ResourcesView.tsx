"use client";

import type { ResourceGroup } from "@/types/content";
import { useProgressSet } from "@/hooks/useProgressSet";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Badge } from "./Badge";
import { hostnameOf } from "@/lib/hostname";

const STORAGE_KEY = "unity-reading-progress";

export function ResourcesView({ resourceGroups }: { resourceGroups: ResourceGroup[] }) {
  const { done, toggle, reset, count } = useProgressSet(STORAGE_KEY);
  const total = resourceGroups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div>
      <div className="mt-4.5 rounded-lg border border-line border-l-3 border-l-accent bg-panel p-3.5 text-[13.5px]">
        Curated for senior devs brushing up — deep, engine-internals material, not beginner tutorials.
        <div className="mt-1.5 text-[11.5px] text-muted">
          Подборка для сеньоров, которые освежают знания: глубокие материалы про внутренности движка, а не туториалы
          для новичков. Отмечайте прочитанное — прогресс сохраняется в браузере.
        </div>
      </div>

      <ProgressBar label="read" count={count} total={total} onReset={reset} />

      {resourceGroups.map((group) => (
        <div key={group.g} className="mt-6.5">
          <h2 className="text-[17px] tracking-tight">{group.g}</h2>
          <div className="mb-2.5 text-[11.5px] text-muted">{group.gru}</div>

          {group.items.map((item) => (
            <label
              key={item.u}
              className={`mb-2 flex items-start gap-3 rounded-[10px] border border-line bg-panel p-3 ${
                done[item.u] ? "opacity-50" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(done[item.u])}
                onChange={() => toggle(item.u)}
                className="mt-1 h-3.75 w-3.75 accent-ok"
              />
              <div className="min-w-0 flex-1">
                <a
                  href={item.u}
                  target="_blank"
                  rel="noopener"
                  className="text-[14.5px] font-semibold text-accent hover:underline"
                >
                  {item.t}
                </a>
                <span className="ml-1.5 text-[11px] text-muted">{hostnameOf(item.u)}</span>
                <div className="mt-1 text-[13px]">{item.d}</div>
                <div className="mt-1 text-[11.5px] leading-relaxed text-muted">{item.dru}</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {item.b.map((badge) => (
                    <Badge key={badge} tone={badge}>
                      {badge === "must" ? "must read" : badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}
