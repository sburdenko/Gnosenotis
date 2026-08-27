const BADGE_STYLES: Record<string, string> = {
  must: "text-accent border-accent/50",
  free: "text-[#2f7a1c] border-[#2f7a1c]/40",
  core: "text-link border-link/40",
  easy: "text-[#2f7a1c] border-[#2f7a1c]/40",
  med: "text-[#b5810f] border-[#b5810f]/45",
  hard: "text-accent border-accent/50",
};

/** Small uppercase pill used for "must read", "free", difficulty, and "core" labels. */
export function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  const toneClasses = BADGE_STYLES[tone] ?? "text-ink-muted border-black/20";
  return (
    <span className={`rounded-sm border px-1.5 py-px font-mono text-[10px] tracking-wide uppercase ${toneClasses}`}>
      {children}
    </span>
  );
}
