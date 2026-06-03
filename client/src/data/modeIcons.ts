import type { LucideIcon } from "lucide-react";
import { BookOpen, PencilLine, CheckCircle2, Target, MessageCircle } from "lucide-react";
import type { LearningMode } from "@onfive/shared";

/** SVG-иконка (Lucide) для каждого режима обучения. */
export const MODE_ICON: Record<LearningMode, LucideIcon> = {
  explain: BookOpen,
  homework: PencilLine,
  quiz: CheckCircle2,
  exam: Target,
  free: MessageCircle,
};
