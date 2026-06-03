import type { Grade, SubjectId } from "@onfive/shared";

/** Раздел (глава учебника) со списком тем внутри. */
export interface TopicChapter {
  /** Название раздела/главы, напр. «Дроби». */
  chapter: string;
  /** Темы-параграфы внутри раздела. */
  topics: string[];
}

/** Темы предмета на конкретный класс, сгруппированные по разделам. */
export type SubjectTopics = Partial<Record<SubjectId, TopicChapter[]>>;

/** Темы по всем предметам для одного класса. */
export type GradeTopics = SubjectTopics;

/** Карта классов → предметов → разделов. */
export type TopicsMap = Partial<Record<Grade, GradeTopics>>;
