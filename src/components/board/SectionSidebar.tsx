"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export interface SidebarSection {
  id: string;
  label: string;
  count: number;
}

interface SectionSidebarProps {
  sections: SidebarSection[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  stickyNote?: React.ReactNode;
}

/**
 * Left-hand "разделы" filter column, shared by all four tabs — each one
 * just hands it a different `sections` list (question categories, resource
 * groups, pattern families, or LeetCode difficulty buckets) and the same
 * component handles layout, active-state styling, and counts.
 *
 * Below `md` the list collapses behind a summary row showing the current
 * filter: on a phone the questions tab has 15 categories, and leaving them
 * expanded pushed the first card most of a screen down. Above `md` there is
 * a real column to put them in, so the list is always open and the summary
 * row is not rendered at all.
 */
export function SectionSidebar({ sections, activeId, onChange, ariaLabel, stickyNote }: SectionSidebarProps) {
  const { t } = useLanguage();
  const [isOpenOnMobile, setIsOpenOnMobile] = useState(false);

  const active = sections.find((section) => section.id === activeId);

  return (
    <nav className="flex w-full shrink-0 flex-col gap-2 md:w-[190px]" aria-label={ariaLabel}>
      <p className="mb-1 hidden font-display text-[11px] font-semibold tracking-[.2em] text-cream-dim uppercase md:block">
        {t.sectionsHeading}
      </p>

      <button
        type="button"
        aria-expanded={isOpenOnMobile}
        onClick={() => setIsOpenOnMobile((open) => !open)}
        className="flex items-center justify-between gap-2 border-l-[5px] border-accent bg-kraft px-3.5 py-2.5 text-left shadow-tab-active md:hidden"
      >
        <span className="font-display text-[11px] font-semibold tracking-[.2em] text-[#5a4d38] uppercase">
          {t.sectionsHeading}
        </span>
        <span className="flex items-center gap-2 font-serif text-[15px] font-bold text-[#2b2115]">
          {active?.label}
          <span className="font-mono text-[12px] font-normal text-ink-count">{active?.count}</span>
          <span aria-hidden="true" className="text-accent">
            {isOpenOnMobile ? "▾" : "▸"}
          </span>
        </span>
      </button>

      <div className={(isOpenOnMobile ? "flex" : "hidden") + " flex-col gap-2 md:flex"}>
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <button
              key={section.id}
              type="button"
              aria-current={isActive ? "true" : undefined}
              onClick={() => {
                onChange(section.id);
                setIsOpenOnMobile(false);
              }}
              className={
                "flex items-start justify-between gap-2 border-l-[5px] px-3.5 py-2.5 text-left font-serif text-[15px] " +
                (isActive
                  ? "border-accent bg-kraft font-bold text-[#2b2115] shadow-tab-active"
                  : "border-accent/25 bg-kraft-dim text-[#3d3323] shadow-tab hover:bg-kraft-hover")
              }
            >
              <span className="leading-tight">{section.label}</span>
              <span className="shrink-0 font-mono text-[12px] font-normal text-ink-count">
                {section.count}
              </span>
            </button>
          );
        })}
      </div>

      {stickyNote}
    </nav>
  );
}
