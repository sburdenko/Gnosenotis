"use client";

import type { AlgoPattern } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import type { PatternUsage } from "@/lib/patternUsage";
import { Badge } from "./Badge";

interface PatternDetailsProps {
  pattern: AlgoPattern;
  /**
   * Problems that drill this pattern. Omitted where the host already *is*
   * one of them — a LeetCode card listing itself back would be noise.
   */
  usage?: PatternUsage[];
}

/**
 * The body of a pattern — recognition signals, C# template, pitfalls.
 *
 * Shared by the two places a pattern can be read: its own card on the
 * Patterns board, and inline inside a LeetCode card when you unfold the
 * chip for it. One renderer, so the two can't drift apart.
 */
export function PatternDetails({ pattern, usage }: PatternDetailsProps) {
  const { t, pick } = useLanguage();

  return (
    <>
      <Section title={t.patterns.when}>
        <ul className="ml-4 list-disc text-[14.5px] leading-snug text-ink-body">
          {pick(pattern.when, pattern.whenru).map((signal) => (
            <li key={signal} className="mt-1">
              {signal}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.patterns.template}>
        {/*
          Plain text in a <pre>, not trusted HTML: React escapes it, so a
          template that happens to contain `<` or `&` renders as code rather
          than as markup. Do not "upgrade" this to dangerouslySetInnerHTML
          for syntax highlighting.
        */}
        <pre className="code-block">{pattern.code}</pre>
      </Section>

      <Section title={t.patterns.traps}>
        <ul className="ml-4 list-disc text-[14.5px] leading-snug text-ink-body">
          {pick(pattern.traps, pattern.trapsru).map((trap) => (
            <li key={trap} className="mt-1">
              {trap}
            </li>
          ))}
        </ul>
      </Section>

      {usage && usage.length > 0 && (
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
    </>
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
