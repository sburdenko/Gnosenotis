"use client";

import { useEffect } from "react";
import type { Question } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";

interface DeepDiveModalProps {
  question: Question | null;
  onClose: () => void;
}

/**
 * Full-screen "deep dive" lesson overlay, styled as an oversized index card
 * pulled out of the catalog rather than a generic dialog box.
 *
 * Learning note (React): the component renders `null` when there's no
 * question selected — no manual DOM node creation/cleanup needed, unlike a
 * vanilla-JS version that would build one overlay `<div>` once and mutate it.
 */
export function DeepDiveModal({ question, onClose }: DeepDiveModalProps) {
  const { t, pick } = useLanguage();

  // Close on Escape and lock page scroll while the modal is open — both are
  // side effects tied to whether `question` is set, so they belong in an
  // effect, not in the render body.
  useEffect(() => {
    if (!question) return;

    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [question, onClose]);

  if (!question || !question.d) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-10"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="tex-paper-ruled relative my-auto w-full max-w-3xl rotate-[-.3deg] border border-black/15 p-9 shadow-card-hover">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.closeModal}
          className="absolute top-4 right-4 flex size-[34px] items-center justify-center rounded-full border border-black/20 bg-kraft text-ink-body shadow-tab transition hover:bg-kraft-hover hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ✕
        </button>
        <div className="font-mono text-[11px] tracking-[.14em] text-accent uppercase">
          {t.deepDiveKicker} · {question.c} · #{question.n}
        </div>
        <h2 className="mt-1.5 font-serif text-2xl leading-tight font-bold text-ink">
          {pick(question.q, question.qru)}
        </h2>
        <p className="mt-2 border-b-2 border-[rgba(170,50,40,.45)] pb-3 font-mono text-[12px] text-ink-muted">
          {t.deepDiveRuOnly}
        </p>
        {/* Trusted static lesson HTML — see src/data/deepDives.ts for the trust rationale. */}
        <div className="legacy-html" dangerouslySetInnerHTML={{ __html: question.d }} />

        {/*
          A second way out at the foot of the lesson: the ✕ in the corner has
          scrolled far off the top of a phone screen by the time you finish
          reading, and the backdrop is barely reachable on a tall card. Drawn
          as a catalog drawer tab torn off along a perforation rather than
          another cross — it belongs to the paper, and it says where it takes you.
        */}
        <footer className="mt-9 flex flex-col items-center border-t-2 border-dashed border-[rgba(170,50,40,.4)] pt-7">
          <button
            type="button"
            onClick={onClose}
            className="group inline-flex items-center gap-2.5 rounded-t-[3px] rounded-b-lg border border-black/20 bg-kraft px-6 py-2.5 shadow-tab transition hover:-translate-y-0.5 hover:bg-kraft-hover hover:shadow-tab-active focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px active:shadow-none"
          >
            <span
              aria-hidden
              className="text-[15px] leading-none text-accent transition-transform group-hover:-translate-x-0.5"
            >
              ↩
            </span>
            <span className="font-display text-[12px] font-semibold tracking-[.14em] text-[#2b2115] uppercase">
              {t.closeLesson}
            </span>
          </button>
          {/* Esc only exists on a keyboard, so the hint stays off phone screens. */}
          <p className="mt-3 hidden font-hand text-[16px] text-hand md:block">{t.closeHint}</p>
        </footer>
      </div>
    </div>
  );
}
