interface StickyNoteProps {
  eyebrow: string;
  children: React.ReactNode;
}

/** Small tilted yellow sticky-note callout, used under the section sidebar. */
export function StickyNote({ eyebrow, children }: StickyNoteProps) {
  return (
    <aside className="mt-4 -rotate-[1.8deg] bg-sticky px-4 py-3.5 shadow-[2px_4px_9px_rgba(40,20,0,.3)]">
      <p className="mb-2 font-display text-[10px] font-semibold tracking-[.18em] text-[#8a6a12] uppercase">
        {eyebrow}
      </p>
      <p className="font-hand text-[19px] leading-tight text-sticky-ink">{children}</p>
    </aside>
  );
}
