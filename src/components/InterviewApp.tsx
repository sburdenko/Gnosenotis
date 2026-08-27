"use client";

import { useState } from "react";
import type { Question, ResourceGroup, LeetCodeGroup } from "@/types/content";
import { QuestionsView } from "@/components/questions/QuestionsView";
import { ResourcesView } from "@/components/resources/ResourcesView";
import { LeetCodeView } from "@/components/leetcode/LeetCodeView";

type Tab = "questions" | "resources" | "leetcode";

const TABS: { key: Tab; label: string; sub: string }[] = [
  { key: "questions", label: "Questions", sub: "310 вопросов" },
  { key: "resources", label: "Reading list", sub: "где читать" },
  { key: "leetcode", label: "LeetCode", sub: "задачи по сложности" },
];

interface InterviewAppProps {
  questions: Question[];
  resourceGroups: ResourceGroup[];
  leetcodeGroups: LeetCodeGroup[];
}

/**
 * Root interactive component for the app, rendered from the Server
 * Component `src/app/page.tsx`.
 *
 * Learning note (Next.js App Router — Server vs. Client Components): this
 * file starts with `"use client"`, which means it (and everything it
 * imports) ships to the browser as JavaScript and can use hooks like
 * `useState`. `page.tsx` does *not* have that directive, so it stays a
 * Server Component: it can read `src/data` directly and do file/network work
 * with zero client-side cost, then hand the results to this component as
 * plain props. Drawing the client boundary as low as this — one root client
 * component, not "use client" on every file — keeps the amount of
 * JavaScript sent to the browser as small as the interactivity requires.
 *
 * All three tab views stay mounted at once (toggled with Tailwind's
 * `hidden` utility, exactly like the legacy app's `.view[hidden]` rule)
 * instead of only rendering the active one. That preserves each tab's own
 * state — search text, expanded cards, filters — when you switch away and back.
 */
export function InterviewApp({ questions, resourceGroups, leetcodeGroups }: InterviewAppProps) {
  const [tab, setTab] = useState<Tab>("questions");

  return (
    <div className="mx-auto max-w-[940px] px-5 pt-8 pb-20">
      <header>
        <h1 className="m-0 text-[30px] tracking-tight">Unity Interview — 310 Questions</h1>
        <p className="m-0 text-sm text-muted">
          Senior / Lead level · 100 C# · 50 rendering · 20+ in every other category
          <br />
          <span className="text-[11.5px]">
            Уровень Senior / Lead · геймплей и C# · графика и производительность. Клик по вопросу — раскрыть ответ.
          </span>
        </p>
      </header>

      <nav className="mt-5.5 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`border-b-2 px-4 py-2.5 text-sm ${
              tab === t.key ? "border-accent font-semibold text-txt" : "border-transparent text-muted hover:text-txt"
            }`}
          >
            {t.label}
            <span className="mt-0.5 block text-[10.5px] font-normal text-muted">{t.sub}</span>
          </button>
        ))}
      </nav>

      <div className={tab === "questions" ? "" : "hidden"}>
        <QuestionsView questions={questions} />
      </div>
      <div className={tab === "resources" ? "" : "hidden"}>
        <ResourcesView resourceGroups={resourceGroups} />
      </div>
      <div className={tab === "leetcode" ? "" : "hidden"}>
        <LeetCodeView leetcodeGroups={leetcodeGroups} />
      </div>
    </div>
  );
}
