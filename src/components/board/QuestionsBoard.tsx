"use client";

import { useMemo, useState } from "react";
import { useEscapeToClose } from "@/hooks/useEscapeToClose";
import type { Question } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { useProgressSet } from "@/hooks/useProgressSet";
import { pinColorForIndex } from "@/lib/boardVisuals";
import { Toolbar } from "./Toolbar";
import { SectionSidebar } from "./SectionSidebar";
import { StickyNote } from "./StickyNote";
import { PinnedQuestionCard } from "./PinnedQuestionCard";
import { DeepDiveModal } from "./DeepDiveModal";
import { EmptyState } from "./EmptyState";

const PROGRESS_KEY = "unity-questions-progress";

export function QuestionsBoard({ questions }: { questions: Question[] }) {
  const { t } = useLanguage();
  const [term, setTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openId, setOpenId] = useState<number | null>(null);
  useEscapeToClose(openId !== null, () => setOpenId(null));
  const [deepDiveId, setDeepDiveId] = useState<number | null>(null);
  const { done: reviewed, toggle: toggleReviewed, count: reviewedCount } = useProgressSet(PROGRESS_KEY);

  const categories = useMemo(() => [...new Set(questions.map((q) => q.c))], [questions]);

  const sections = useMemo(
    () => [
      { id: "all", label: t.categoryAll, count: questions.length },
      ...categories.map((c) => ({ id: c, label: c, count: questions.filter((q) => q.c === c).length })),
    ],
    [categories, questions, t],
  );

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return questions.filter((q) => {
      if (activeCategory !== "all" && q.c !== activeCategory) return false;
      if (!needle) return true;
      return `${q.q}${q.qru}${q.a}${q.aru}${q.c}`.toLowerCase().includes(needle);
    });
  }, [questions, activeCategory, term]);

  const deepDiveQuestion = questions.find((q) => q.n === deepDiveId) ?? null;
  const remaining = questions.length - reviewedCount;

  return (
    <div>
      <Toolbar
        query={term}
        onQueryChange={setTerm}
        searchPlaceholder={t.searchPlaceholder.questions}
        cardCountLabel={t.cardCount(questions.length)}
        progressLabel={t.progress(reviewedCount, questions.length, "reviewed")}
      />

      <div className="flex flex-col gap-[26px] px-4 pt-7 md:px-[30px] md:flex-row">
        <SectionSidebar
          sections={sections}
          activeId={activeCategory}
          onChange={setActiveCategory}
          ariaLabel={t.sectionsHeading}
          stickyNote={
            <StickyNote eyebrow={t.tabs.questions}>{t.shelfNote(remaining, "questions")}</StickyNote>
          }
        />

        <div className="min-w-0 flex-1">
          <div className="mb-3.5 flex items-baseline justify-between">
            <p className="font-display text-[11px] font-semibold tracking-[.2em] text-cream-dim uppercase">
              {t.tabSub.questions(questions.length)}
            </p>
            <p className="font-mono text-[12px] text-cream-soft">
              {t.filteredCount(filtered.length, questions.length)}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-[22px] md:grid-cols-2">
              {filtered.map((q, i) => (
                <PinnedQuestionCard
                  key={q.n}
                  question={q}
                  index={i}
                  term={term}
                  pinColor={pinColorForIndex(categories.indexOf(q.c))}
                  isOpen={openId === q.n}
                  reviewed={Boolean(reviewed[q.n])}
                  onToggleOpen={() => setOpenId((current) => (current === q.n ? null : q.n))}
                  onToggleReviewed={() => toggleReviewed(String(q.n))}
                  onOpenDeepDive={setDeepDiveId}
                />
              ))}
            </div>
          ) : (
            <EmptyState>{t.emptyState}</EmptyState>
          )}
        </div>
      </div>

      <DeepDiveModal question={deepDiveQuestion} onClose={() => setDeepDiveId(null)} />
    </div>
  );
}
