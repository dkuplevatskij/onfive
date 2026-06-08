import type { Report } from "../../stores/reports";

/**
 * Слияние локального и облачного прогресса.
 *
 * Сеть и устройства ненадёжны: ученик мог копить XP офлайн на телефоне, а потом
 * открыть приложение на планшете. Чтобы прогресс не терялся и не «откатывался»,
 * слияние делаем конфликт-свободным:
 *  - монотонные счётчики (xp, coins, streak) — берём максимум;
 *  - даты-маркеры (lastActive, dailyBonusDate) — берём самую позднюю;
 *  - доклады — объединяем по id, при конфликте побеждает более свежий updatedAt.
 *
 * Такой merge ассоциативен и коммутативен, поэтому порядок синхронизации
 * устройств не важен — результат всегда один и тот же.
 */

/** Снимок геймификации, который синхронизируется с облаком. */
export interface GamificationSnapshot {
  xp: number;
  coins: number;
  streak: number;
  lastActive: string | null;
  dailyBonusDate: string | null;
}

/** Берёт максимум двух чисел, считая отсутствующее значение нулём. */
function maxNum(a: number | undefined | null, b: number | undefined | null): number {
  return Math.max(a ?? 0, b ?? 0);
}

/**
 * Самая поздняя из двух дат (строки сравниваются лексикографически —
 * это корректно для форматов YYYY-MM-DD и ISO-8601). null игнорируется.
 */
function laterDate(a: string | null, b: string | null): string | null {
  if (a === null) return b;
  if (b === null) return a;
  return a >= b ? a : b;
}

/** Сливает два снимка геймификации без потери прогресса. */
export function mergeGamification(
  a: GamificationSnapshot,
  b: GamificationSnapshot,
): GamificationSnapshot {
  return {
    xp: maxNum(a.xp, b.xp),
    coins: maxNum(a.coins, b.coins),
    streak: maxNum(a.streak, b.streak),
    lastActive: laterDate(a.lastActive, b.lastActive),
    dailyBonusDate: laterDate(a.dailyBonusDate, b.dailyBonusDate),
  };
}

/**
 * Сливает два списка докладов. Доклады сопоставляются по id; при конфликте
 * остаётся версия с более поздним updatedAt. Результат отсортирован по
 * createdAt (новые сверху) — так же, как их показывает список докладов.
 */
export function mergeReports(a: Report[], b: Report[]): Report[] {
  // Облако отдаёт даты в формате PG timestamptz, локально — toISOString();
  // сравниваем как реальные моменты времени, а не лексикографически.
  const ms = (iso: string): number => {
    const t = Date.parse(iso);
    return Number.isNaN(t) ? 0 : t;
  };
  const byId = new Map<string, Report>();
  for (const r of [...a, ...b]) {
    const existing = byId.get(r.id);
    if (!existing || ms(r.updatedAt) > ms(existing.updatedAt)) {
      byId.set(r.id, r);
    }
  }
  return [...byId.values()].sort((x, y) => ms(y.createdAt) - ms(x.createdAt));
}
