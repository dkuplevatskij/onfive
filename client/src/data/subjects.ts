import type { Subject, Grade } from "@onfive/shared";

/**
 * Список предметов с указанием классов, в которых они доступны.
 * Правила набора предметов по классам — из спецификации OnFive:
 *  - 5–6: математика (без алгебры/геометрии), без физики и химии
 *  - 7:   появляются алгебра, геометрия, физика (математика уходит)
 *  - 8:   появляется химия
 *  - 9–11: все предметы
 */
export const SUBJECTS: Subject[] = [
  { id: "russian", title: "Русский язык", icon: "📝", grades: [5, 6, 7, 8, 9, 10, 11] },
  { id: "literature", title: "Литература", icon: "📚", grades: [5, 6, 7, 8, 9, 10, 11] },
  { id: "math", title: "Математика", icon: "➗", grades: [5, 6] },
  { id: "algebra", title: "Алгебра", icon: "🔢", grades: [7, 8, 9, 10, 11] },
  { id: "geometry", title: "Геометрия", icon: "📐", grades: [7, 8, 9, 10, 11] },
  { id: "physics", title: "Физика", icon: "⚛️", grades: [7, 8, 9, 10, 11] },
  { id: "chemistry", title: "Химия", icon: "🧪", grades: [8, 9, 10, 11] },
  { id: "biology", title: "Биология", icon: "🧬", grades: [5, 6, 7, 8, 9, 10, 11] },
  { id: "geography", title: "География", icon: "🌍", grades: [5, 6, 7, 8, 9, 10, 11] },
  { id: "history", title: "История", icon: "🏛️", grades: [5, 6, 7, 8, 9, 10, 11] },
  { id: "social", title: "Обществознание", icon: "⚖️", grades: [5, 6, 7, 8, 9, 10, 11] },
  { id: "english", title: "Английский язык", icon: "🇬🇧", grades: [5, 6, 7, 8, 9, 10, 11] },
  { id: "informatics", title: "Информатика", icon: "💻", grades: [5, 6, 7, 8, 9, 10, 11] },
];

/** Возвращает предметы, доступные для указанного класса. */
export function subjectsForGrade(grade: Grade): Subject[] {
  return SUBJECTS.filter((s) => s.grades.includes(grade));
}

/** Находит предмет по id. */
export function findSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}
