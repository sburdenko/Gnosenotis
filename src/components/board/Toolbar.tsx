interface ToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder: string;
  cardCountLabel: string;
  progressLabel: string;
}

/**
 * Per-tab search + progress row: a "paper strip" pinned directly onto the
 * cork background, echoing the search field from the design handoff without
 * repeating the full wood header (which is shared across tabs — see `BrandHeader`).
 */
export function Toolbar({ query, onQueryChange, searchPlaceholder, cardCountLabel, progressLabel }: ToolbarProps) {
  return (
    <div className="mx-[30px] mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="focus-within:shadow-[inset_0_2px_5px_rgba(90,70,30,.25),0_0_0_2px_rgba(155,47,34,.35)] flex flex-1 -rotate-[.4deg] items-center justify-between border border-black/20 bg-[#fbf5e4] px-4 py-[11px] shadow-paper-inset">
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="w-full bg-transparent font-serif text-[16px] text-ink-body outline-none placeholder:text-[#8b8069]"
        />
        <span className="ml-4 shrink-0 font-mono text-[12px] text-[#a89a7d]">{cardCountLabel}</span>
      </div>
      <p className="shrink-0 font-hand text-[20px] leading-tight text-hand sm:ml-2">{progressLabel}</p>
    </div>
  );
}
