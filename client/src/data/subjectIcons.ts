import type { LucideIcon } from "lucide-react";
import {
  PenLine,
  BookOpen,
  Calculator,
  Sigma,
  Triangle,
  Atom,
  FlaskConical,
  Dna,
  Globe2,
  Landmark,
  Scale,
  Languages,
  Code,
} from "lucide-react";
import type { SubjectId } from "@onfive/shared";

/** SVG-иконка (Lucide) для каждого предмета. */
export const SUBJECT_ICON: Record<SubjectId, LucideIcon> = {
  russian: PenLine,
  literature: BookOpen,
  math: Calculator,
  algebra: Sigma,
  geometry: Triangle,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  geography: Globe2,
  history: Landmark,
  social: Scale,
  english: Languages,
  informatics: Code,
};
