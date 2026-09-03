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

/** What a board counts as "done" — drives both the progress line and the pin's label. */
export type ProgressKind = "reviewed" | "read" | "solved" | "learned";

/** Which board the sticky note under the sidebar belongs to. */
export type ShelfKind = "questions" | "resources" | "leetcode" | "patterns";

export interface Dictionary {
  siteEyebrow: string;
  siteTitle: string;
  /** Takes the live question count so this never goes stale when the dataset grows. */
  siteSubtitle: (questionCount: number) => string;
  languageToggleLabel: string;
  tabs: {
    questions: string;
    resources: string;
    leetcode: string;
    patterns: string;
  };
  tabSub: {
    questions: (n: number) => string;
    resources: string;
    leetcode: string;
    patterns: string;
  };
  searchPlaceholder: {
    questions: string;
    resources: string;
    leetcode: string;
    patterns: string;
  };
  cardCount: (n: number) => string;
  sectionsHeading: string;
  categoryAll: string;
  filteredCount: (visible: number, total: number) => string;
  emptyState: string;
  progress: (done: number, total: number, kind: ProgressKind) => string;
  pinAria: (done: boolean, kind: ProgressKind) => string;
  reset: string;
  badges: {
    mustRead: string;
    free: string;
    core: string;
    easy: string;
    medium: string;
    hard: string;
  };
  deepDiveButton: string;
  deepDiveKicker: string;
  deepDiveRuOnly: string;
  closeModal: string;
  /** Label on the tab-shaped close control at the foot of a deep dive. */
  closeLesson: string;
  /** Hand-written hint under it; desktop-only, since phones have no Esc key. */
  closeHint: string;
  leetFilters: {
    all: string;
    easy: string;
    medium: string;
    hard: string;
    core: string;
  };
  /** Labels on the unfolded part of a LeetCode card. */
  solutions: {
    toggle: (n: number) => string;
    patterns: string;
    approaches: string;
    pick: string;
    time: string;
    space: string;
  };
  /** Labels on a pattern card. */
  patterns: {
    expand: string;
    collapse: string;
    when: string;
    template: string;
    traps: string;
    practiseOn: (n: number) => string;
    /** Header meta on a pattern card: how many problems drill it. */
    problemCount: (n: number) => string;
  };
  shelfNote: (remaining: number, kind: ShelfKind) => string;
  weekTask: {
    eyebrow: string;
    text: (title: string) => string;
    cta: string;
  };
}

/**
 * Progress verbs kept as lookup tables rather than nested ternaries: adding
 * a fifth board should mean one new row here, not another `kind === "…"`
 * branch in three separate functions.
 */
const EN_PROGRESS_VERB: Record<ProgressKind, string> = {
  reviewed: "reviewed",
  read: "read",
  solved: "solved",
  learned: "learned",
};

const RU_PROGRESS: Record<ProgressKind, { verb: string; mark: string }> = {
  reviewed: { verb: "повторено", mark: "повторённое" },
  read: { verb: "прочитано", mark: "прочитанное" },
  solved: { verb: "решено", mark: "решённое" },
  learned: { verb: "изучено", mark: "изученное" },
};

export const dictionaries: Record<Lang, Dictionary> = {
  en: {
    siteEyebrow: "Card catalog",
    siteTitle: "Unity Interview Board",
    siteSubtitle: (n) => `Senior / Lead level · ${n} questions · reading list · patterns · LeetCode`,
    languageToggleLabel: "Language",
    tabs: {
      questions: "Questions",
      resources: "Reading list",
      leetcode: "LeetCode",
      patterns: "Patterns",
    },
    tabSub: {
      questions: (n) => `${n} question${pluralizeEn(n, "", "s")}`,
      resources: "where to read",
      leetcode: "by difficulty",
      patterns: "the toolbox",
    },
    searchPlaceholder: {
      questions: "search: boxing, GC, coroutines…",
      resources: "search the reading list…",
      leetcode: "search LeetCode problems…",
      patterns: "search: window, Dijkstra, knapsack…",
    },
    cardCount: (n) => `${n} card${pluralizeEn(n, "", "s")}`,
    sectionsHeading: "Sections",
    categoryAll: "All",
    filteredCount: (visible, total) => `${visible} of ${total}`,
    emptyState: "Empty. Pin your first card — nothing matches.",
    progress: (done, total, kind) => `${EN_PROGRESS_VERB[kind]} ${done} / ${total}`,
    pinAria: (done, kind) =>
      done ? `Unmark as ${EN_PROGRESS_VERB[kind]}` : `Mark as ${EN_PROGRESS_VERB[kind]}`,
    reset: "Reset",
    badges: {
      mustRead: "must read",
      free: "free",
      core: "core",
      easy: "easy",
      medium: "medium",
      hard: "hard",
    },
    deepDiveButton: "📖 Deep dive",
    deepDiveKicker: "Deep dive",
    deepDiveRuOnly: "This lesson is written in Russian only.",
    closeModal: "Close",
    closeLesson: "Back to the board",
    closeHint: "…or just hit Esc",
    leetFilters: {
      all: "All",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      core: "Core",
    },
    solutions: {
      toggle: (n) => `${n} approach${pluralizeEn(n, "", "es")}`,
      patterns: "Patterns",
      approaches: "Approaches",
      pick: "say this one",
      time: "time",
      space: "space",
    },
    patterns: {
      expand: "Template & pitfalls",
      collapse: "Hide details",
      when: "Reach for it when",
      template: "Template (C#)",
      traps: "Where people slip",
      practiseOn: (n) => `Practise on (${n})`,
      problemCount: (n) => `${n} problem${pluralizeEn(n, "", "s")}`,
    },
    shelfNote: (remaining, kind) => {
      if (remaining <= 0) {
        if (kind === "leetcode") return "All solved. Time for harder ones.";
        if (kind === "patterns") return "Whole toolbox covered. Now use it.";
        return "All caught up. Nicely done.";
      }
      const noun =
        kind === "questions"
          ? "questions"
          : kind === "resources"
            ? "articles"
            : kind === "patterns"
              ? "patterns"
              : "problems";
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
      `Уровень Senior / Lead · ${n} ${pluralizeRu(n, "вопрос", "вопроса", "вопросов")} · список чтения · паттерны · LeetCode`,
    languageToggleLabel: "Язык",
    tabs: {
      questions: "Вопросы",
      resources: "Что читать",
      leetcode: "LeetCode",
      patterns: "Паттерны",
    },
    tabSub: {
      questions: (n) => `${n} ${pluralizeRu(n, "вопрос", "вопроса", "вопросов")}`,
      resources: "где читать",
      leetcode: "задачи по сложности",
      patterns: "рабочий инструментарий",
    },
    searchPlaceholder: {
      questions: "искать: боксинг, GC, корутины…",
      resources: "искать по списку чтения…",
      leetcode: "искать задачи LeetCode…",
      patterns: "искать: окно, Дейкстра, рюкзак…",
    },
    cardCount: (n) => `${n} ${pluralizeRu(n, "карточка", "карточки", "карточек")}`,
    sectionsHeading: "Разделы",
    categoryAll: "Всё",
    filteredCount: (visible, total) => `${visible} из ${total}`,
    emptyState: "Пусто. Ничего не найдено — приколи другую карточку.",
    progress: (done, total, kind) => `${RU_PROGRESS[kind].verb} ${done} / ${total}`,
    pinAria: (done, kind) => {
      const { verb, mark } = RU_PROGRESS[kind];
      return done ? `Снять отметку «${verb}»` : `Отметить как ${mark}`;
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
    closeLesson: "Вернуться на доску",
    closeHint: "…или просто нажми Esc",
    leetFilters: {
      all: "Все",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      core: "Core",
    },
    solutions: {
      toggle: (n) => `${n} ${pluralizeRu(n, "решение", "решения", "решений")}`,
      patterns: "Паттерны",
      approaches: "Варианты решения",
      pick: "это и говорить",
      time: "время",
      space: "память",
    },
    patterns: {
      expand: "Шаблон и грабли",
      collapse: "Свернуть детали",
      when: "Когда применять",
      template: "Шаблон (C#)",
      traps: "Где сыплются",
      practiseOn: (n) => `Отработать на задачах (${n})`,
      problemCount: (n) => `${n} ${pluralizeRu(n, "задача", "задачи", "задач")}`,
    },
    shelfNote: (remaining, kind) => {
      if (remaining <= 0) {
        if (kind === "leetcode") return "Всё решено. Пора за сложные.";
        if (kind === "patterns") return "Инструментарий закрыт. Теперь применять.";
        return "Всё повторено. Красота.";
      }
      const noun =
        kind === "questions"
          ? pluralizeRu(remaining, "вопрос", "вопроса", "вопросов")
          : kind === "resources"
            ? pluralizeRu(remaining, "статья", "статьи", "статей")
            : kind === "patterns"
              ? pluralizeRu(remaining, "паттерн", "паттерна", "паттернов")
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
