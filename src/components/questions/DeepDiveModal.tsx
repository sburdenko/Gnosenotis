"use client";

import { useEffect } from "react";
import type { Question } from "@/types/content";

interface DeepDiveModalProps {
  question: Question | null;
  onClose: () => void;
}

/**
 * Full-screen "deep dive" lesson overlay.
 *
 * Learning note (React): the legacy app built one `<div class="overlay">`
 * once and mutated its `innerHTML`/class list. Here the modal is just a
 * component that renders nothing (`null`) when there's no question selected
 * — no manual DOM node bookkeeping needed, React handles mount/unmount.
 */
export function DeepDiveModal({ question, onClose }: DeepDiveModalProps) {
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
      className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative my-auto w-full max-w-3xl rounded-2xl border border-line bg-panel p-8 pt-9">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="sticky top-0 float-right -mt-4 -mr-5 flex h-8.5 w-8.5 items-center justify-center rounded-full border border-line bg-panel-2 text-muted hover:text-txt"
        >
          ✕
        </button>
        <div className="text-[11px] font-semibold tracking-widest text-accent-2 uppercase">
          Deep dive · {question.c} · #{question.n}
        </div>
        <h2 className="mt-1.5 text-2xl leading-tight font-semibold tracking-tight">{question.q}</h2>
        <div className="mb-2 text-[13px] text-muted">{question.qru}</div>
        {/* Trusted static lesson HTML — see src/data/deepDives.ts for the trust rationale. */}
        <div className="legacy-html" dangerouslySetInnerHTML={{ __html: question.d }} />
      </div>
    </div>
  );
}
