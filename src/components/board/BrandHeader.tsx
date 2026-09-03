"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

/** Wood-textured top bar: site branding and the language switch. Rendered once, shared by every tab. */
export function BrandHeader() {
  const { t } = useLanguage();

  return (
    <header className="tex-wood flex items-center justify-between gap-4 border-b-[3px] border-[rgba(50,28,8,.5)] px-4 py-5 shadow-header md:px-[30px]">
      <div>
        <p className="font-display text-[11px] font-semibold tracking-[.26em] text-gold uppercase">
          {t.siteEyebrow}
        </p>
        <h1 className="mt-[3px] font-serif text-[27px] leading-tight font-bold text-cream">{t.siteTitle}</h1>
      </div>
      <LanguageToggle />
    </header>
  );
}
