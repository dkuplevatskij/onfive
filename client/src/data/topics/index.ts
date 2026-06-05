import type { Grade, SubjectId } from "@onfive/shared";
import type { TopicChapter, TopicsMap } from "./types";
import { GRADE5 } from "./grade5";
import { GRADE6 } from "./grade6";
import { GRADE7 } from "./grade7";
import { GRADE8 } from "./grade8";
import { GRADE9 } from "./grade9";
import { GRADE10 } from "./grade10";
import { GRADE11 } from "./grade11";

export type { TopicChapter } from "./types";

/** Полная карта тем по классам ФГОС. */
export const TOPICS: TopicsMap = {
  5: GRADE5,
  6: GRADE6,
  7: GRADE7,
  8: GRADE8,
  9: GRADE9,
  10: GRADE10,
  11: GRADE11,
};

/** Возвращает разделы с темами для предмета и класса (или пустой список). */
export function topicsFor(subject: SubjectId, grade: Grade): TopicChapter[] {
  return TOPICS[grade]?.[subject] ?? [];
}

/** Есть ли структурированные темы ФГОС для предмета и класса. */
export function hasTopics(subject: SubjectId, grade: Grade): boolean {
  return topicsFor(subject, grade).length > 0;
}
