export type Lang = "en" | "ru";

/**
 * Russian noun pluralization has three forms (1 вопрос / 2 вопроса / 5
 * вопросов) that don't map onto English's singular/plural split. This picks
 * the right one instead of reusing a single plural string for every count,
 * which is where a lot of "localized" UIs quietly stay wrong.
 */
export function pluralizeRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

/** English only needs singular/plural, so callers on that side use this instead. */
export function pluralizeEn(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

export interface Dictionary {
  siteEyebrow: string;
  siteTitle: string;
  /** Takes the live question count so this never goes stale when the dataset grows. */
  siteSubtitle: (questionCount: number) => string;
  languageToggleLabel: string;
  tabs: { questions: string; resources: string; leetcode: string };
  tabSub: { questions: (n: number) => string; resources: string; leetcode: string };
  searchPlaceholder: { questions: string; resources: string; leetcode: string };
  cardCount: (n: number) => string;
  expandAll: string;
  collapseAll: string;
  sectionsHeading: string;
  categoryAll: string;
  filteredCount: (visible: number, total: number) => string;
  emptyState: string;
  progress: (done: number, total: number, kind: "reviewed" | "read" | "solved") => string;
  pinAria: (done: boolean, kind: "reviewed" | "read" | "solved") => string;
  reset: string;
  badges: { mustRead: string; free: string; core: string; easy: string; medium: string; hard: string };
  deepDiveButton: string;
  deepDiveKicker: string;
  deepDiveRuOnly: string;
  closeModal: string;
  leetFilters: { all: string; easy: string; medium: string; hard: string; core: string };
  shelfNote: (remaining: number, kind: "questions" | "resources" | "leetcode") => string;
  weekTask: {
    eyebrow: string;
    text: (title: string) => string;
    cta: string;
  };
}

export const dictionaries: Record<Lang, Dictionary> = {
  en: {
    siteEyebrow: "Card catalog",
    siteTitle: "Unity Interview Board",
    siteSubtitle: (n) => `Senior / Lead level · ${n} questions · reading list · LeetCode`,
    languageToggleLabel: "Language",
    tabs: { questions: "Questions", resources: "Reading list", leetcode: "LeetCode" },
    tabSub: {
      questions: (n) => `${n} question${pluralizeEn(n, "", "s")}`,
      resources: "where to read",
      leetcode: "by difficulty",
    },
    searchPlaceholder: {
      questions: "search: boxing, GC, coroutines…",
      resources: "search the reading list…",
      leetcode: "search LeetCode problems…",
    },
    cardCount: (n) => `${n} card${pluralizeEn(n, "", "s")}`,
    expandAll: "Expand all",
    collapseAll: "Collapse all",
    sectionsHeading: "Sections",
    categoryAll: "All",
    filteredCount: (visible, total) => `${visible} of ${total}`,
    emptyState: "Empty. Pin your first card — nothing matches.",
    progress: (done, total, kind) => {
      const verb = kind === "reviewed" ? "reviewed" : kind === "read" ? "read" : "solved";
      return `${verb} ${done} / ${total}`;
    },
    pinAria: (done, kind) => {
      const verb = kind === "reviewed" ? "reviewed" : kind === "read" ? "read" : "solved";
      return done ? `Unmark as ${verb}` : `Mark as ${verb}`;
    },
    reset: "Reset",
    badges: { mustRead: "must read", free: "free", core: "core", easy: "easy", medium: "medium", hard: "hard" },
    deepDiveButton: "📖 Deep dive",
    deepDiveKicker: "Deep dive",
    deepDiveRuOnly: "This lesson is written in Russian only.",
    closeModal: "Close",
    leetFilters: { all: "All", easy: "Easy", medium: "Medium", hard: "Hard", core: "Core" },
    shelfNote: (remaining, kind) => {
      if (remaining <= 0) {
        return kind === "leetcode" ? "All solved. Time for harder ones." : "All caught up. Nicely done.";
      }
      const noun = kind === "questions" ? "questions" : kind === "resources" ? "articles" : "problems";
      return `${remaining} ${noun} left on the shelf.`;
    },
    weekTask: {
      eyebrow: "Card of the week",
      text: (title) => `This week's pick from the core set: "${title}". Solve it before you move on.`,
      cta: "Open on LeetCode",
    },
  },
  ru: {
    siteEyebrow: "Картотека",
    siteTitle: "Доска Unity-собеса",
    siteSubtitle: (n) =>
      `Уровень Senior / Lead · ${n} ${pluralizeRu(n, "вопрос", "вопроса", "вопросов")} · список чтения · LeetCode`,
    languageToggleLabel: "Язык",
    tabs: { questions: "Вопросы", resources: "Что читать", leetcode: "LeetCode" },
    tabSub: {
      questions: (n) => `${n} ${pluralizeRu(n, "вопрос", "вопроса", "вопросов")}`,
      resources: "где читать",
      leetcode: "задачи по сложности",
    },
    searchPlaceholder: {
      questions: "искать: боксинг, GC, корутины…",
      resources: "искать по списку чтения…",
      leetcode: "искать задачи LeetCode…",
    },
    cardCount: (n) => `${n} ${pluralizeRu(n, "карточка", "карточки", "карточек")}`,
    expandAll: "Развернуть всё",
    collapseAll: "Свернуть всё",
    sectionsHeading: "Разделы",
    categoryAll: "Всё",
    filteredCount: (visible, total) => `${visible} из ${total}`,
    emptyState: "Пусто. Ничего не найдено — приколи другую карточку.",
    progress: (done, total, kind) => {
      const verb = kind === "reviewed" ? "повторено" : kind === "read" ? "прочитано" : "решено";
      return `${verb} ${done} / ${total}`;
    },
    pinAria: (done, kind) => {
      if (kind === "reviewed") return done ? "Снять отметку «повторено»" : "Отметить как повторённое";
      if (kind === "read") return done ? "Снять отметку «прочитано»" : "Отметить как прочитанное";
      return done ? "Снять отметку «решено»" : "Отметить как решённое";
    },
    reset: "Сбросить",
    badges: {
      mustRead: "обязательно",
      free: "бесплатно",
      core: "core",
      easy: "easy",
      medium: "medium",
      hard: "hard",
    },
    deepDiveButton: "📖 Разобраться подробнее",
    deepDiveKicker: "Разбор",
    deepDiveRuOnly: "Материал есть только на русском.",
    closeModal: "Закрыть",
    leetFilters: { all: "Все", easy: "Easy", medium: "Medium", hard: "Hard", core: "Core" },
    shelfNote: (remaining, kind) => {
      if (remaining <= 0) {
        return kind === "leetcode" ? "Всё решено. Пора за сложные." : "Всё повторено. Красота.";
      }
      const noun =
        kind === "questions"
          ? pluralizeRu(remaining, "вопрос", "вопроса", "вопросов")
          : kind === "resources"
            ? pluralizeRu(remaining, "статья", "статьи", "статей")
            : pluralizeRu(remaining, "задача", "задачи", "задач");
      return `${remaining} ${noun} на полке.`;
    },
    weekTask: {
      eyebrow: "Карточка недели",
      text: (title) => `На этой неделе из core-набора: «${title}». Реши её, прежде чем идти дальше.`,
      cta: "Открыть на LeetCode",
    },
  },
};
