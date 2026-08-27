"use client";

import { useMemo, useState } from "react";
import type { Question } from "@/types/content";
import { QuestionCard } from "./QuestionCard";
import { DeepDiveModal } from "./DeepDiveModal";

export function QuestionsView({ questions }: { questions: Question[] }) {
  const [term, setTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  const [deepDiveId, setDeepDiveId] = useState<number | null>(null);

  // Derived from props, not stored in state — the category list only needs
  // to change when the question data itself changes, so recomputing it from
  // scratch on every render (memoized) is simpler than keeping it in sync by hand.
  const categories = useMemo(() => ["All", ...new Set(questions.map((q) => q.c))], [questions]);

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return questions.filter((q) => {
      if (activeCategory !== "All" && q.c !== activeCategory) return false;
      if (!needle) return true;
      return `${q.q}${q.qru}${q.a}${q.aru}${q.c}`.toLowerCase().includes(needle);
    });
  }, [questions, activeCategory, term]);

  function toggleCard(n: number) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  const deepDiveQuestion = questions.find((q) => q.n === deepDiveId) ?? null;

  return (
    <div>
      <div className="sticky top-0 z-20 mt-5 mb-2 border-b border-line bg-bg/92 py-3.5 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search questions and answers… / Поиск…"
            className="min-w-55 flex-1 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-txt outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => setOpenIds(new Set(filtered.map((q) => q.n)))}
            className="rounded-full border border-line bg-panel px-3 py-1.5 text-[12.5px] whitespace-nowrap text-muted hover:border-[#3a4655] hover:text-txt"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={() => setOpenIds(new Set())}
            className="rounded-full border border-line bg-panel px-3 py-1.5 text-[12.5px] whitespace-nowrap text-muted hover:border-[#3a4655] hover:text-txt"
          >
            Collapse all
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {categories.map((c) => {
            const n = c === "All" ? questions.length : questions.filter((q) => q.c === c).length;
            const isActive = activeCategory === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className={
                  isActive
                    ? "rounded-full border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-semibold whitespace-nowrap text-[#06121f]"
                    : "rounded-full border border-line bg-panel px-3 py-1.5 text-[12.5px] whitespace-nowrap text-muted hover:border-[#3a4655] hover:text-txt"
                }
              >
                {c} ({n})
              </button>
            );
          })}
        </div>
      </div>

      <div className="my-3.5 text-[12.5px] text-muted">
        {filtered.length} of {questions.length} questions
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-muted">Nothing found / Ничего не найдено</div>
      ) : (
        <div>
          {filtered.map((q) => (
            <QuestionCard
              key={q.n}
              question={q}
              term={term}
              isOpen={openIds.has(q.n)}
              onToggle={() => toggleCard(q.n)}
              onOpenDeepDive={setDeepDiveId}
            />
          ))}
        </div>
      )}

      <DeepDiveModal question={deepDiveQuestion} onClose={() => setDeepDiveId(null)} />
    </div>
  );
}
