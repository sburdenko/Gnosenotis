"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { dictionaries, type Dictionary, type Lang } from "./translations";

const STORAGE_KEY = "unity-interview-lang";
const DEFAULT_LANG: Lang = "ru";

function readStoredLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "ru" ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

// Module-level listener set so every `useLanguage()` consumer re-renders
// when the language changes anywhere in the app — see the extended
// `useSyncExternalStore` explanation in src/hooks/useProgressSet.ts. Unlike
// the progress map there, the snapshot here is a plain string, so it needs
// no cache object: primitives compare correctly with `Object.is` on their
// own, `getSnapshot` can just re-read `localStorage` every time it's called.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function getServerSnapshot(): Lang {
  return DEFAULT_LANG;
}

function writeLang(next: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Best-effort persistence; listeners still get the in-memory update.
  }
  listeners.forEach((notify) => notify());
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dictionary;
  /** Picks the English or Russian variant of a bilingual content field, e.g. `pick(q.q, q.qru)`. */
  pick: (en: string, ru: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * App-wide language switch (EN/RU) for the bilingual content in `src/data`.
 *
 * Learning note (React Context): this is the standard way to share one
 * piece of state — here, the chosen language — with a whole subtree without
 * threading a `lang` prop through every component in between ("prop
 * drilling"). Any component below `<LanguageProvider>` can call
 * `useLanguage()` and re-renders automatically when the language changes.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readStoredLang, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => writeLang(next), []);
  const pick = useCallback((en: string, ru: string) => (lang === "en" ? en : ru), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: dictionaries[lang], pick }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
