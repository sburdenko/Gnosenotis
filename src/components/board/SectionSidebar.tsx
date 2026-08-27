"use client";

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
 * Left-hand "разделы" filter column, shared by all three tabs — each one
 * just hands it a different `sections` list (question categories, resource
 * groups, or LeetCode difficulty buckets) and the same component handles
 * layout, active-state styling, and counts.
 */
export function SectionSidebar({ sections, activeId, onChange, ariaLabel, stickyNote }: SectionSidebarProps) {
  const { t } = useLanguage();

  return (
    <nav className="flex w-full shrink-0 flex-col gap-2 md:w-[190px]" aria-label={ariaLabel}>
      <p className="mb-1 font-display text-[11px] font-semibold tracking-[.2em] text-cream-dim uppercase">
        {t.sectionsHeading}
      </p>

      {sections.map((section) => {
        const isActive = section.id === activeId;
        return (
          <button
            key={section.id}
            type="button"
            aria-current={isActive ? "true" : undefined}
            onClick={() => onChange(section.id)}
            className={
              "flex items-start justify-between gap-2 border-l-[5px] px-3.5 py-2.5 text-left font-serif text-[15px] " +
              (isActive
                ? "border-accent bg-kraft font-bold text-[#2b2115] shadow-tab-active"
                : "border-accent/25 bg-kraft-dim text-[#3d3323] shadow-tab hover:bg-kraft-hover")
            }
          >
            <span className="leading-tight">{section.label}</span>
            <span className="shrink-0 font-mono text-[12px] font-normal text-ink-count">{section.count}</span>
          </button>
        );
      })}

      {stickyNote}
    </nav>
  );
}
