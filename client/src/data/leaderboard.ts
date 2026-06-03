/** Моковый глобальный рейтинг (до подключения бэкенда). */
export interface LeaderRow {
  name: string;
  xp: number;
  level: number;
}

export const MOCK_LEADERBOARD: LeaderRow[] = [
  { name: "Zangar B.", xp: 30120, level: 217 },
  { name: "Амаль Н.", xp: 28700, level: 198 },
  { name: "Dimash", xp: 26400, level: 181 },
  { name: "Bondar T.", xp: 16700, level: 164 },
  { name: "Абылай А.", xp: 16100, level: 161 },
  { name: "Leila U.", xp: 14100, level: 141 },
  { name: "Иван П.", xp: 13900, level: 140 },
  { name: "Марк Р.", xp: 13200, level: 132 },
  { name: "София К.", xp: 9800, level: 98 },
  { name: "Артём Д.", xp: 7400, level: 74 },
  { name: "Полина М.", xp: 5200, level: 52 },
  { name: "Тимур А.", xp: 3100, level: 31 },
];
