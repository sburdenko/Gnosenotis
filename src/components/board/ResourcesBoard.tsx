"use client";

import { useMemo, useState } from "react";
import type { ResourceGroup } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { useProgressSet } from "@/hooks/useProgressSet";
import { pinColorForIndex } from "@/lib/boardVisuals";
import { Toolbar } from "./Toolbar";
import { SectionSidebar } from "./SectionSidebar";
import { StickyNote } from "./StickyNote";
import { PinnedResourceCard } from "./PinnedResourceCard";
import { EmptyState } from "./EmptyState";

const PROGRESS_KEY = "unity-reading-progress";

export function ResourcesBoard({ resourceGroups }: { resourceGroups: ResourceGroup[] }) {
  const { t, pick } = useLanguage();
  const [term, setTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");
  const { done, toggle, count } = useProgressSet(PROGRESS_KEY);

  const total = useMemo(() => resourceGroups.reduce((sum, g) => sum + g.items.length, 0), [resourceGroups]);

  const sections = useMemo(
    () => [
      { id: "all", label: t.categoryAll, count: total },
      ...resourceGroups.map((g) => ({ id: g.g, label: pick(g.g, g.gru), count: g.items.length })),
    ],
    [resourceGroups, total, pick, t],
  );

  const needle = term.trim().toLowerCase();
  const visibleGroups = useMemo(() => {
    return resourceGroups
      .filter((g) => activeGroup === "all" || g.g === activeGroup)
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          if (!needle) return true;
          return `${item.t}${item.d}${item.dru}`.toLowerCase().includes(needle);
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [resourceGroups, activeGroup, needle]);

  const visibleCount = visibleGroups.reduce((sum, g) => sum + g.items.length, 0);
  const remaining = total - count;

  return (
    <div>
      <Toolbar
        query={term}
        onQueryChange={setTerm}
        searchPlaceholder={t.searchPlaceholder.resources}
        cardCountLabel={t.cardCount(total)}
        progressLabel={t.progress(count, total, "read")}
      />

      <div className="flex flex-col gap-[26px] px-4 pt-7 md:px-[30px] md:flex-row">
        <SectionSidebar
          sections={sections}
          activeId={activeGroup}
          onChange={setActiveGroup}
          ariaLabel={t.sectionsHeading}
          stickyNote={<StickyNote eyebrow={t.tabs.resources}>{t.shelfNote(remaining, "resources")}</StickyNote>}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-3.5 flex items-baseline justify-between">
            <p className="font-display text-[11px] font-semibold tracking-[.2em] text-cream-dim uppercase">
              {t.tabSub.resources}
            </p>
            <p className="font-mono text-[12px] text-cream-soft">{t.filteredCount(visibleCount, total)}</p>
          </div>

          {visibleGroups.length > 0 ? (
            visibleGroups.map((group) => {
              const groupIndex = resourceGroups.findIndex((g) => g.g === group.g);
              return (
                <div key={group.g} className="mb-7">
                  <h2 className="font-serif text-[17px] tracking-tight text-cream">{pick(group.g, group.gru)}</h2>
                  <div className="mt-3 grid grid-cols-1 gap-[22px] md:grid-cols-2">
                    {group.items.map((item, i) => (
                      <PinnedResourceCard
                        key={item.u}
                        item={item}
                        index={i}
                        pinColor={pinColorForIndex(groupIndex)}
                        done={Boolean(done[item.u])}
                        onToggleDone={() => toggle(item.u)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState>{t.emptyState}</EmptyState>
          )}
        </div>
      </div>
    </div>
  );
}
