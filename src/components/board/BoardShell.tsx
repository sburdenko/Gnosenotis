"use client";

import { useState } from "react";
import type { Question, ResourceGroup, LeetCodeGroup } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import { BrandHeader } from "./BrandHeader";
import { TabDrawers, type DrawerTab } from "./TabDrawers";
import { QuestionsBoard } from "./QuestionsBoard";
import { ResourcesBoard } from "./ResourcesBoard";
import { LeetCodeBoard } from "./LeetCodeBoard";

type Tab = "questions" | "resources" | "leetcode";

interface BoardShellProps {
  questions: Question[];
  resourceGroups: ResourceGroup[];
  leetcodeGroups: LeetCodeGroup[];
}

/**
 * Root interactive component, rendered from the Server Component
 * `src/app/page.tsx`.
 *
 * Learning note (Next.js App Router — Server vs. Client Components): this
 * file starts with `"use client"`, so it (and everything it imports) ships
 * to the browser as JavaScript and can use hooks like `useState`. `page.tsx`
 * does *not* have that directive, so it stays a Server Component: it reads
 * `src/data` directly at build time with zero client-side cost, then hands
 * the results to this component as plain props. Drawing the client boundary
 * this low — one root client component, not "use client" on every file —
 * keeps the amount of JavaScript sent to the browser as small as the
 * interactivity actually requires.
 *
 * All three tab boards stay mounted at once (toggled with Tailwind's
 * `hidden` utility) instead of only rendering the active one, so each tab's
 * own state — search text, expanded cards, filters, scroll position within
 * it — survives switching away and back.
 */
export function BoardShell({ questions, resourceGroups, leetcodeGroups }: BoardShellProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("questions");

  const tabs: DrawerTab<Tab>[] = [
    { key: "questions", label: t.tabs.questions, sub: t.tabSub.questions },
    { key: "resources", label: t.tabs.resources, sub: t.tabSub.resources },
    { key: "leetcode", label: t.tabs.leetcode, sub: t.tabSub.leetcode },
  ];

  return (
    <div className="tex-cork mx-auto max-w-[1060px] rounded border border-black/25 pb-[34px] shadow-board">
      <p className="sr-only" aria-live="polite">
        {t.siteSubtitle}
      </p>

      <BrandHeader />

      <TabDrawers
        tabs={tabs}
        active={tab}
        onChange={(key) => {
          setTab(key);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <div className={tab === "questions" ? "" : "hidden"}>
        <QuestionsBoard questions={questions} />
      </div>
      <div className={tab === "resources" ? "" : "hidden"}>
        <ResourcesBoard resourceGroups={resourceGroups} />
      </div>
      <div className={tab === "leetcode" ? "" : "hidden"}>
        <LeetCodeBoard leetcodeGroups={leetcodeGroups} />
      </div>
    </div>
  );
}
