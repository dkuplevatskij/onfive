import type { LucideIcon } from "lucide-react";
import { PenLine, FileText, CheckCheck } from "lucide-react";
import type { ReportMode, ReportLength } from "@onfive/shared";

/** Метаданные режима работы над докладом для карточек выбора. */
export interface ReportModeMeta {
  id: ReportMode;
  title: string;
  description: string;
  Icon: LucideIcon;
}

export const REPORT_MODES: ReportModeMeta[] = [
  { id: "write", title: "Помоги написать", description: "AI задаёт вопросы, ты отвечаешь — вместе собираем доклад", Icon: PenLine },
  { id: "draft", title: "Сгенерируй черновик", description: "AI делает черновик, ты редактируешь под себя", Icon: FileText },
  { id: "review", title: "Проверь мой доклад", description: "Вставь свой текст — AI даст обратную связь", Icon: CheckCheck },
];

/** Метаданные объёма доклада. */
export interface ReportLengthMeta {
  id: ReportLength;
  title: string;
  hint: string;
}

export const REPORT_LENGTHS: ReportLengthMeta[] = [
  { id: "short", title: "Краткий", hint: "~500 слов" },
  { id: "medium", title: "Средний", hint: "~1000 слов" },
  { id: "long", title: "Подробный", hint: "~2000 слов" },
];

/** Найти метаданные режима по id. */
export function findReportMode(id: string): ReportModeMeta | undefined {
  return REPORT_MODES.find((m) => m.id === id);
}
