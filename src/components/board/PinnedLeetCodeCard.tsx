"use client";

import type { LeetCodeItem, LeetCodeDifficulty } from "@/types/content";
import { useLanguage } from "@/i18n/LanguageContext";
import type { PinColor } from "@/lib/boardVisuals";
import { PinnedCardShell } from "./PinnedCardShell";
import { Badge } from "./Badge";

const DIFFICULTY_PIN: Record<LeetCodeDifficulty, PinColor> = {
  easy: "green",
  med: "yellow",
  hard: "red",
};

interface PinnedLeetCodeCardProps {
  item: LeetCodeItem;
  index: number;
  difficulty: LeetCodeDifficulty;
  done: boolean;
  onToggleDone: () => void;
}

export function PinnedLeetCodeCard({ item, index, difficulty, done, onToggleDone }: PinnedLeetCodeCardProps) {
  const { t, pick } = useLanguage();
  const url = `https://leetcode.com/problems/${item.s}/`;

  return (
    <PinnedCardShell
      index={index}
      pinColor={DIFFICULTY_PIN[difficulty]}
      done={done}
      onTogglePin={onToggleDone}
      pinLabel={t.pinAria(done, "solved")}
      meta={item.k}
      title={
        <a href={url} target="_blank" rel="noreferrer" className="text-link hover:text-link-hover hover:underline">
          {item.t}
        </a>
      }
    >
      <p className="font-hand text-[18px] leading-tight text-hand">{pick(item.why, item.whyru)}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Badge tone={difficulty}>{t.badges[difficulty === "med" ? "medium" : difficulty]}</Badge>
        {item.core && <Badge tone="core">{t.badges.core}</Badge>}
      </div>
    </PinnedCardShell>
  );
}
