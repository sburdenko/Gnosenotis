"use client";

import type { AlgoPattern } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import type { PinColor } from "@/lib/boardVisuals";
import type { PatternUsage } from "@/lib/patternUsage";
import { PinnedCardShell } from "./PinnedCardShell";
import { Badge } from "./Badge";

interface PinnedPatternCardProps {
  pattern: AlgoPattern;
  index: number;
  pinColor: PinColor;
  isOpen: boolean;
  learned: boolean;
  /** Problems that reference this pattern — derived, never hand-listed. */
  usage: PatternUsage[];
  onToggleOpen: () => void;
  onToggleLearned: () => void;
}

export function PinnedPatternCard({
  pattern,
  index,
  pinColor,
  isOpen,
  learned,
  usage,
  onToggleOpen,
  onToggleLearned,
}: PinnedPatternCardProps) {
  const { t, pick } = useLanguage();

  const when = pick(pattern.when, pattern.whenru);
  const traps = pick(pattern.traps, pattern.trapsru);

  return (
    <PinnedCardShell
      index={index}
      pinColor={pinColor}
      done={learned}
      onTogglePin={onToggleLearned}
      pinLabel={t.pinAria(learned, "learned")}
      onHeaderClick={onToggleOpen}
      meta={t.patterns.problemCount(usage.length)}
      title={pick(pattern.n, pattern.nru)}
    >
      <p className="text-[15px] leading-snug text-ink-body">{pick(pattern.idea, pattern.idearu)}</p>

      {/*
        Complexity sits in the body rather than the header's meta slot: the
        strings run to "O(n) time / O(1) space — each element enters and
        leaves once", which overflows a right-aligned, non-shrinking header cell.
      */}
      <p className="mt-2 font-mono text-[11.5px] text-ink-muted">{pattern.cx}</p>

      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        className="mt-3 flex items-center gap-1.5 font-display text-[11px] font-semibold tracking-[.1em] text-accent uppercase hover:text-accent-hover"
      >
        <span aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
        {isOpen ? t.patterns.collapse : t.patterns.expand}
      </button>

      {isOpen && (
        <div className="mt-2.5 border-t border-black/10 pt-2.5">
          <Section title={t.patterns.when}>
            <ul className="ml-4 list-disc text-[14.5px] leading-snug text-ink-body">
              {when.map((signal) => (
                <li key={signal} className="mt-1">
                  {signal}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={t.patterns.template}>
            {/*
              Plain text in a <pre>, not trusted HTML: React escapes it, so a
              template that happens to contain `<` or `&` renders as code
              rather than as markup. Do not "upgrade" this to
              dangerouslySetInnerHTML for syntax highlighting.
            */}
            <pre className="code-block">{pattern.code}</pre>
          </Section>

          <Section title={t.patterns.traps}>
            <ul className="ml-4 list-disc text-[14.5px] leading-snug text-ink-body">
              {traps.map((trap) => (
                <li key={trap} className="mt-1">
                  {trap}
                </li>
              ))}
            </ul>
          </Section>

          {usage.length > 0 && (
            <Section title={t.patterns.practiseOn(usage.length)}>
              <div className="flex flex-wrap gap-1.5">
                {usage.map((problem) => (
                  <a
                    key={problem.s}
                    href={`https://leetcode.com/problems/${problem.s}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-sm border border-black/15 bg-kraft-dim/60 px-2 py-px font-mono text-[11px] text-link hover:border-link hover:bg-kraft-hover"
                  >
                    {problem.t}
                    <Badge tone={problem.d}>{t.badges[problem.d === "med" ? "medium" : problem.d]}</Badge>
                  </a>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </PinnedCardShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 first:mt-0">
      <p className="mb-1.5 font-display text-[10.5px] font-semibold tracking-[.16em] text-ink-muted uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}
