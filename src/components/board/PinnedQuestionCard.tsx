"use client";

import type { Question } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import type { PinColor } from "@/lib/boardVisuals";
import { PinnedCardShell } from "./PinnedCardShell";
import { Highlight } from "./Highlight";
import { Badge } from "./Badge";

interface PinnedQuestionCardProps {
  question: Question;
  index: number;
  term: string;
  pinColor: PinColor;
  isOpen: boolean;
  reviewed: boolean;
  onToggleOpen: () => void;
  onToggleReviewed: () => void;
  onOpenDeepDive: (n: number) => void;
}

export function PinnedQuestionCard({
  question,
  index,
  term,
  pinColor,
  isOpen,
  reviewed,
  onToggleOpen,
  onToggleReviewed,
  onOpenDeepDive,
}: PinnedQuestionCardProps) {
  const { t, pick } = useLanguage();

  function handleHeaderClick() {
    // Preserved from the legacy app: if the user just finished dragging a
    // text selection over the question, don't also collapse/expand the
    // card — they were trying to copy text, not click it.
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    onToggleOpen();
  }

  return (
    <PinnedCardShell
      index={index}
      pinColor={pinColor}
      done={reviewed}
      onTogglePin={onToggleReviewed}
      pinLabel={t.pinAria(reviewed, "reviewed")}
      onHeaderClick={handleHeaderClick}
      meta={
        <span className="flex items-center gap-1.5">
          {question.c}
          {question.p === "core" && <Badge tone="core">{t.badges.core}</Badge>}
        </span>
      }
      title={<Highlight text={pick(question.q, question.qru)} term={term} />}
    >
      {isOpen && (
        <div>
          {/*
            `question.a` / `question.aru` are trusted static HTML we authored
            ourselves (see the comment on `Question.a` in
            src/types/content.ts) — that's what makes dangerouslySetInnerHTML
            safe here. Never copy this pattern for anything derived from user
            input, a CMS, or a network response without sanitizing it first.
          */}
          <div
            className="legacy-html text-[15.5px]"
            dangerouslySetInnerHTML={{ __html: pick(question.a, question.aru) }}
          />
          {question.d && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDeepDive(question.n);
              }}
              className="stamp mt-3 inline-block rounded-none px-3 py-1.5 font-display text-[11px] font-semibold tracking-[.1em] uppercase"
            >
              {t.deepDiveButton}
            </button>
          )}
        </div>
      )}
    </PinnedCardShell>
  );
}
