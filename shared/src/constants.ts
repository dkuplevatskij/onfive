import type { Grade, LearningMode } from "./types.js";

/** Все поддерживаемые классы. */
export const GRADES: Grade[] = [5, 6, 7, 8, 9, 10, 11];

/** Метаданные пяти режимов обучения. */
export const LEARNING_MODES: Record<
  LearningMode,
  { title: string; icon: string; description: string }
> = {
  explain: {
    title: "Объяснить тему",
    icon: "📖",
    description: "Пошаговое объяснение с проверочными вопросами",
  },
  homework: {
    title: "Помощь с домашкой",
    icon: "✏️",
    description: "Подсказки и наводящие вопросы, не готовые ответы",
  },
  quiz: {
    title: "Проверь меня",
    icon: "✅",
    description: "Вопросы по одному, разбор ошибок",
  },
  exam: {
    title: "К контрольной",
    icon: "🎯",
    description: "План повторения и тренировочные задания",
  },
  free: {
    title: "Свободный вопрос",
    icon: "💬",
    description: "Любой вопрос по предмету",
  },
};

/** XP-награды за действия. */
export const XP = {
  perMessage: 5,
  sessionBonus: 10,
  correctAnswer: 15,
} as const;

/**
 * Подсказки для системного промпта по целям ученика из квиза.
 * Ключи совпадают с id вариантов на шаге «Какой результат нужен?».
 */
export const GOAL_HINTS: Record<string, string> = {
  time: "ученик хочет освободить время — объясняй ёмко, без лишней воды",
  logic: "ученику важно развить логику и самостоятельность — дольше держи его в режиме самостоятельного поиска ответа",
  marks: "ученик хочет подтянуть оценки — обращай внимание на типичные ошибки и аккуратность",
  exams: "ученик готовится к контрольным и ОГЭ/ЕГЭ — связывай тему с форматом экзаменационных заданий",
};

/** Пороги уровней геймификации. */
export const LEVELS: { threshold: number; title: string }[] = [
  { threshold: 0, title: "Новичок" },
  { threshold: 100, title: "Ученик" },
  { threshold: 300, title: "Знаток" },
  { threshold: 700, title: "Мастер" },
  { threshold: 1200, title: "Профессор" },
  { threshold: 2000, title: "Гений" },
];
