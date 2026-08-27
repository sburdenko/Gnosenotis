const BADGE_STYLES: Record<string, string> = {
  must: "text-accent-2 border-accent-2/40",
  free: "text-ok border-ok/35",
  core: "text-accent border-accent/40",
  easy: "text-ok border-ok/35",
  med: "text-[#d29922] border-[#d29922]/40",
  hard: "text-[#f85149] border-[#f85149]/40",
};

/** Small uppercase pill used for "must read", "free", difficulty, and "core" labels. */
export function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  const toneClasses = BADGE_STYLES[tone] ?? "text-muted border-line";
  return (
    <span className={`rounded border px-1.5 py-px text-[10px] tracking-wide uppercase ${toneClasses}`}>
      {children}
    </span>
  );
}
