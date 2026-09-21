"use client";

import type { BugHuntItem } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import type { PinColor } from "@/lib/boardVisuals";
import { PinnedCardShell } from "./PinnedCardShell";
import { InlineCode } from "./InlineCode";

/**
 * What the reader has done with one snippet so far.
 *
 * `solved` and `revealed` are separate states rather than one "answered"
 * flag: finding the line yourself and asking to be shown it are different
 * outcomes, and only the first one counts as progress.
 */
export interface BugGuess {
  /** Line numbers clicked so far, in order. */
  picked: number[];
  solved: boolean;
  revealed: boolean;
}

export const FRESH_GUESS: BugGuess = { picked: [], solved: false, revealed: false };

interface PinnedBugCardProps {
  item: BugHuntItem;
  index: number;
  pinColor: PinColor;
  guess: BugGuess;
  found: boolean;
  isOpen: boolean;
  onPickLine: (line: number) => void;
  onReveal: () => void;
  onRetry: () => void;
  onToggleOpen: () => void;
  onToggleFound: () => void;
}

type LineState = "idle" | "hit" | "miss" | "shown";

function lineState(line: number, item: BugHuntItem, guess: BugGuess): LineState {
  const isAnswer = item.bug.includes(line);
  if (isAnswer && guess.solved) return "hit";
  if (isAnswer && guess.revealed) return "shown";
  if (guess.picked.includes(line)) return "miss";
  return "idle";
}

const LINE_STYLES: Record<LineState, string> = {
  idle: "border-transparent hover:bg-black/[.05]",
  hit: "border-[#2f7a1c] bg-[#2f7a1c]/15",
  shown: "border-[#b5810f] bg-[#b5810f]/15",
  miss: "border-accent/70 bg-accent/10 opacity-70",
};

export function PinnedBugCard({
  item,
  index,
  pinColor,
  guess,
  found,
  isOpen,
  onPickLine,
  onReveal,
  onRetry,
  onToggleOpen,
  onToggleFound,
}: PinnedBugCardProps) {
  const { t, pick } = useLanguage();

  const lines = item.code.split("\n");
  const answered = guess.solved || guess.revealed;
  const misses = guess.picked.filter((line) => !item.bug.includes(line)).length;

  const status = guess.solved
    ? t.bugHunt.solved
    : guess.revealed
      ? t.bugHunt.revealed
      : misses > 0
        ? t.bugHunt.wrong
        : t.bugHunt.prompt;

  return (
    <PinnedCardShell
      index={index}
      pinColor={pinColor}
      done={found}
      onTogglePin={onToggleFound}
      pinLabel={t.pinAria(found, "found")}
      onHeaderClick={answered ? onToggleOpen : undefined}
      onCollapse={answered && isOpen ? onToggleOpen : undefined}
      title={pick(item.t, item.tru)}
      meta={t.bugHunt.category[item.c]}
      overlay={
        answered && isOpen ? (
          <div className="pt-3 text-[15px] text-ink-body">
            <p className="font-display text-[11px] font-semibold tracking-[.15em] text-ink-muted uppercase">
              {t.bugHunt.whatsWrong}
            </p>
            <p className="mt-1 leading-snug">
              <InlineCode text={pick(item.a, item.aru)} />
            </p>

            <p className="mt-3 font-display text-[11px] font-semibold tracking-[.15em] text-ink-muted uppercase">
              {t.bugHunt.howToFix}
            </p>
            <p className="mt-1 leading-snug">
              <InlineCode text={pick(item.fix, item.fixru)} />
            </p>
          </div>
        ) : undefined
      }
    >
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {lines.map((text, i) => {
            const number = i + 1;
            const state = lineState(number, item, guess);
            return (
              <button
                key={number}
                type="button"
                disabled={answered}
                aria-label={t.bugHunt.lineAria(number)}
                onClick={() => onPickLine(number)}
                className={
                  "flex w-full items-start gap-2 border-l-[3px] py-px pr-2 pl-1 text-left transition-colors " +
                  LINE_STYLES[state]
                }
              >
                <span className="w-5 shrink-0 text-right font-mono text-[11px] leading-5 text-ink-muted select-none">
                  {number}
                </span>
                <code className="font-mono text-[12.5px] leading-5 whitespace-pre text-ink">
                  {text === "" ? " " : text}
                </code>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <p
          className={
            "font-hand text-[18px] leading-tight " +
            (guess.solved ? "text-[#2f7a1c]" : guess.revealed ? "text-[#b5810f]" : "text-hand")
          }
        >
          {status}
        </p>

        {misses > 0 && (
          <span className="font-mono text-[11px] text-ink-muted">{t.bugHunt.misses(misses)}</span>
        )}

        <span className="ml-auto flex gap-2">
          {answered ? (
            <button
              type="button"
              onClick={onRetry}
              className="font-display text-[11px] font-semibold tracking-[.1em] text-link uppercase underline-offset-2 hover:underline"
            >
              {t.bugHunt.tryAgain}
            </button>
          ) : (
            <button
              type="button"
              onClick={onReveal}
              className="font-display text-[11px] font-semibold tracking-[.1em] text-ink-muted uppercase underline-offset-2 hover:underline"
            >
              {t.bugHunt.showAnswer}
            </button>
          )}
        </span>
      </div>
    </PinnedCardShell>
  );
}
