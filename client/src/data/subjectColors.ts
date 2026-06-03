import type { SubjectId } from "@onfive/shared";

/** Цветовой акцент-градиент для плитки каждого предмета (Tailwind from/to). */
export const SUBJECT_COLOR: Record<SubjectId, string> = {
  russian: "from-rose-400 to-rose-500",
  literature: "from-amber-400 to-orange-500",
  math: "from-violet-400 to-indigo-500",
  algebra: "from-violet-400 to-purple-500",
  geometry: "from-sky-400 to-blue-500",
  physics: "from-cyan-400 to-teal-500",
  chemistry: "from-emerald-400 to-green-500",
  biology: "from-green-400 to-lime-500",
  geography: "from-teal-400 to-cyan-500",
  history: "from-amber-500 to-yellow-600",
  social: "from-slate-400 to-slate-600",
  english: "from-blue-400 to-indigo-500",
  informatics: "from-fuchsia-400 to-pink-500",
};
