// Общие типы OnFive, используемые клиентом и сервером.

/** Классы российской школы, которые поддерживает OnFive. */
export type Grade = 5 | 6 | 7 | 8 | 9 | 10 | 11;

/** Идентификатор предмета (slug). */
export type SubjectId =
  | "russian"
  | "literature"
  | "math"
  | "algebra"
  | "geometry"
  | "physics"
  | "chemistry"
  | "biology"
  | "geography"
  | "history"
  | "social"
  | "english"
  | "informatics";

export interface Subject {
  id: SubjectId;
  /** Отображаемое название, напр. «Русский язык». */
  title: string;
  /** Эмодзи-иконка для карточки предмета. */
  icon: string;
  /** Классы, в которых предмет доступен. */
  grades: Grade[];
}

/** Тема (параграф) внутри предмета. */
export interface Topic {
  id: string;
  title: string;
  /** Раздел/глава учебника. */
  chapter?: string;
}

/** Пять режимов обучения. */
export type LearningMode =
  | "explain"
  | "homework"
  | "quiz"
  | "exam"
  | "free";

/** Роль автора сообщения в чате. */
export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** Контекст занятия, передаётся на бэкенд при каждом запросе в чат. */
export interface ChatContext {
  grade: Grade;
  subject: SubjectId;
  topic: string;
  mode: LearningMode;
}

/** Тело запроса POST /api/chat. */
export interface ChatRequest {
  context: ChatContext;
  messages: ChatMessage[];
}

/** Ответ POST /api/chat. */
export interface ChatResponse {
  reply: string;
}
