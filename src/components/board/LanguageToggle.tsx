"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import type { Lang } from "@/i18n/translations";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "ru", label: "RU" },
  { value: "en", label: "EN" },
];

/**
 * EN/RU switch, styled like a little two-tab punch card rather than a
 * generic toggle switch, to stay in the card-catalog visual language.
 *
 * Switching languages swaps *content* (question/answer/resource text — see
 * `useLanguage().pick`) everywhere at once; it deliberately does not show
 * both languages side by side, so the page reads like a normal single-
 * language site instead of a translation exercise.
 */
export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.languageToggleLabel}
      className="flex shrink-0 overflow-hidden rounded-sm border border-black/25 shadow-[1px_2px_4px_rgba(0,0,0,.3)]"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === lang;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setLang(option.value)}
            className={
              "px-3 py-1.5 font-display text-[12px] font-semibold tracking-[.08em] transition-colors " +
              (isActive ? "bg-accent text-cream" : "bg-kraft-dim text-ink-body hover:bg-kraft-hover")
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
