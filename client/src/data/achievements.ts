import type { LucideIcon } from "lucide-react";
import { Footprints, Flame, Award, Coins, Crown, Target } from "lucide-react";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  unlocked: (s: { xp: number; coins: number; streak: number }) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first",
    title: "Первый шаг",
    description: "Начни первое занятие",
    Icon: Footprints,
    unlocked: (s) => s.xp > 0,
  },
  {
    id: "week",
    title: "В ударе",
    description: "7 дней подряд",
    Icon: Flame,
    unlocked: (s) => s.streak >= 7,
  },
  {
    id: "expert",
    title: "Знаток",
    description: "Набери 300 XP",
    Icon: Award,
    unlocked: (s) => s.xp >= 300,
  },
  {
    id: "rich",
    title: "Копилка",
    description: "Накопи 50 монет",
    Icon: Coins,
    unlocked: (s) => s.coins >= 50,
  },
  {
    id: "sharp",
    title: "Меткий",
    description: "Набери 700 XP",
    Icon: Target,
    unlocked: (s) => s.xp >= 700,
  },
  {
    id: "genius",
    title: "Гений",
    description: "Набери 2000 XP",
    Icon: Crown,
    unlocked: (s) => s.xp >= 2000,
  },
];
