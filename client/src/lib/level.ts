import { LEVELS } from "@onfive/shared";

export interface LevelInfo {
  /** Название текущего уровня, напр. «Ученик». */
  title: string;
  /** Индекс текущего уровня в LEVELS. */
  index: number;
  /** XP-порог текущего уровня. */
  current: number;
  /** XP-порог следующего уровня; null — достигнут максимум. */
  next: number | null;
  /** Прогресс до следующего уровня, 0..1 (1, если максимум). */
  progress: number;
}

/** Вычисляет уровень геймификации по накопленному XP. */
export function levelFromXp(xp: number): LevelInfo {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].threshold) index = i;
  }

  const current = LEVELS[index].threshold;
  const next = index + 1 < LEVELS.length ? LEVELS[index + 1].threshold : null;
  const progress =
    next === null ? 1 : Math.min(1, (xp - current) / (next - current));

  return { title: LEVELS[index].title, index, current, next, progress };
}
