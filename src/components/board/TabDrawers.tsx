"use client";

export interface DrawerTab<T extends string> {
  key: T;
  label: string;
  sub: string;
}

interface TabDrawersProps<T extends string> {
  tabs: DrawerTab<T>[];
  active: T;
  onChange: (key: T) => void;
}

/**
 * The three content sections (Questions / Reading list / LeetCode) as
 * card-catalog drawer labels, sitting on the cork board above the section
 * sidebar — the physical-index-card equivalent of a tab bar.
 */
export function TabDrawers<T extends string>({ tabs, active, onChange }: TabDrawersProps<T>) {
  return (
    <div className="flex gap-1.5 px-[30px] pt-6">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            aria-current={isActive ? "true" : undefined}
            onClick={() => onChange(tab.key)}
            className={
              "rounded-t-sm border border-b-0 border-black/20 px-5 py-2.5 text-left transition-transform " +
              (isActive ? "z-[1] translate-y-0 bg-kraft shadow-tab-active" : "translate-y-1 bg-kraft-dim hover:bg-kraft-hover")
            }
          >
            <span
              className={
                "block font-display text-[11px] font-semibold tracking-[.16em] uppercase " +
                (isActive ? "text-[#2b2115]" : "text-[#5a4d38]")
              }
            >
              {tab.label}
            </span>
            <span className="block font-mono text-[10.5px] text-ink-count">{tab.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
