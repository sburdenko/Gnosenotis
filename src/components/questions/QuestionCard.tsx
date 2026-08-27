"use client";

import type { Question } from "@/types/content";
import { Highlight } from "./Highlight";

interface QuestionCardProps {
  question: Question;
  term: string;
  isOpen: boolean;
  onToggle: () => void;
  onOpenDeepDive: (n: number) => void;
}

export function QuestionCard({ question, term, isOpen, onToggle, onOpenDeepDive }: QuestionCardProps) {
  function handleHeaderClick() {
    // Preserved from the legacy app: if the user just finished dragging a
    // text selection over the question, don't also collapse/expand the
    // card — they were trying to copy text, not click it.
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    onToggle();
  }

  return (
    <div className="mb-2 overflow-hidden rounded-[10px] border border-line bg-panel">
      <div
        className="flex cursor-pointer items-start gap-3 p-[13px_15px] hover:bg-panel-2"
        onClick={handleHeaderClick}
      >
        <div className="min-w-[26px] pt-0.5 text-[13px] tabular-nums text-muted">{question.n}</div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold">
            <Highlight text={question.q} term={term} />
          </div>
          <div className="mt-0.5 text-[11.5px] leading-tight text-muted">
            <Highlight text={question.qru} term={term} />
          </div>
          <span className="mt-1.5 inline-block rounded border border-accent-2/35 px-1.5 py-px text-[10.5px] uppercase tracking-wide text-accent-2">
            {question.c}
          </span>
        </div>
        <div className={`pt-0.5 text-xs text-muted transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</div>
      </div>

      {isOpen && (
        <div className="border-t border-line px-[15px] py-4 pl-[53px]">
          {/*
            `question.a` / `question.aru` are trusted static HTML we authored
            ourselves (see the comment on `Question.a` in
            src/types/content.ts) — that's what makes dangerouslySetInnerHTML
            safe here. Never copy this pattern for anything derived from user
            input, a CMS, or a network response without sanitizing it first.
          */}
          <div className="legacy-html text-[14.5px]" dangerouslySetInnerHTML={{ __html: question.a }} />
          <div
            className="legacy-html mt-3 border-t border-dashed border-line pt-2.5 text-[11.5px] text-muted"
            dangerouslySetInnerHTML={{ __html: question.aru }}
          />
          {question.d && (
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-[13px] font-semibold text-accent hover:bg-accent/20"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDeepDive(question.n);
              }}
            >
              📖 Разобраться подробнее / Deep dive
            </button>
          )}
        </div>
      )}
    </div>
  );
}
