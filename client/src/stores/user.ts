import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Grade } from "@onfive/shared";

export type Theme = "light" | "dark";

/** Локальная дата YYYY-MM-DD (для дейли-логики). */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

interface DailyCounters {
  date: string;
  messages: number;
  correct: number;
  lessons: number;
}

/** Редактируемые поля профиля ученика. */
export interface ProfileFields {
  nickname: string;
  firstName: string;
  lastName: string;
  telegram: string;
  vk: string;
  avatar: string;
}

interface UserState {
  grade: Grade | null;
  theme: Theme;
  /** Цели из онбординг-квиза (для персонализации). */
  goals: string[];
  /** Семейный код для привязки родителя (ONF5-XXXXXX). */
  familyCode: string;
  /** PIN родительской панели (4 цифры) или null. */
  parentPin: string | null;

  /** Ник для рейтинга (пустое → показываем «Ученик»). */
  nickname: string;
  /** Имя (по желанию). */
  firstName: string;
  /** Фамилия. */
  lastName: string;
  /** Telegram (@username или ссылка). */
  telegram: string;
  /** VK (id или ссылка). */
  vk: string;
  /** Эмодзи-аватар для рейтинга и профиля. */
  avatar: string;

  // Геймификация
  xp: number;
  coins: number;
  streak: number;
  lastActive: string | null;
  dailyBonusDate: string | null;
  daily: DailyCounters;

  setGrade: (grade: Grade) => void;
  setGoals: (goals: string[]) => void;
  setParentPin: (pin: string) => void;
  /** Частичное обновление полей профиля (ник, имя, фамилия, контакты, аватар). */
  setProfile: (patch: Partial<ProfileFields>) => void;
  toggleTheme: () => void;

  /** Отметка входа: обновляет стрик (continuous days). */
  checkIn: () => void;
  /** Забрать ежедневный бонус за вход (раз в день). */
  claimDailyBonus: () => boolean;

  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  /** Зафиксировать сообщение ученика (для дейли-миссий + XP). */
  recordMessage: () => void;
  recordCorrect: () => void;
  recordLesson: () => void;
  /** Зафиксировать создание доклада (+15 XP). */
  recordReport: () => void;

  reset: () => void;
}

/** Генерирует семейный код вида ONF5-AB12CD. */
function makeFamilyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `ONF5-${s}`;
}

const freshDaily = (): DailyCounters => ({
  date: today(),
  messages: 0,
  correct: 0,
  lessons: 0,
});

/** Сбрасывает дневные счётчики, если наступил новый день. */
function rollDaily(d: DailyCounters): DailyCounters {
  return d.date === today() ? d : freshDaily();
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      grade: null,
      theme: "dark",
      goals: [],
      familyCode: makeFamilyCode(),
      parentPin: null,
      nickname: "",
      firstName: "",
      lastName: "",
      telegram: "",
      vk: "",
      avatar: "",
      xp: 0,
      coins: 0,
      streak: 0,
      lastActive: null,
      dailyBonusDate: null,
      daily: freshDaily(),

      setGrade: (grade) => set({ grade }),
      setGoals: (goals) => set({ goals }),
      setParentPin: (pin) => set({ parentPin: pin }),
      setProfile: (patch) =>
        set((s) => ({
          nickname: (patch.nickname ?? s.nickname).slice(0, 24),
          firstName: (patch.firstName ?? s.firstName).slice(0, 40),
          lastName: (patch.lastName ?? s.lastName).slice(0, 40),
          telegram: (patch.telegram ?? s.telegram).slice(0, 64),
          vk: (patch.vk ?? s.vk).slice(0, 128),
          avatar: patch.avatar ?? s.avatar,
        })),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      checkIn: () => {
        const { lastActive, streak } = get();
        const t = today();
        if (lastActive === t) {
          set({ daily: rollDaily(get().daily) });
          return;
        }
        const nextStreak = lastActive === yesterday() ? streak + 1 : 1;
        set({ lastActive: t, streak: nextStreak, daily: rollDaily(get().daily) });
      },

      claimDailyBonus: () => {
        const t = today();
        if (get().dailyBonusDate === t) return false;
        set((s) => ({ dailyBonusDate: t, xp: s.xp + 100, coins: s.coins + 5 }));
        return true;
      },

      addXp: (amount) => set((s) => ({ xp: s.xp + amount })),
      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

      recordMessage: () =>
        set((s) => {
          const d = rollDaily(s.daily);
          return {
            xp: s.xp + 5,
            daily: { ...d, messages: d.messages + 1 },
          };
        }),
      recordCorrect: () =>
        set((s) => {
          const d = rollDaily(s.daily);
          return {
            xp: s.xp + 15,
            coins: s.coins + 1,
            daily: { ...d, correct: d.correct + 1 },
          };
        }),
      recordLesson: () =>
        set((s) => {
          const d = rollDaily(s.daily);
          return {
            coins: s.coins + 2,
            daily: { ...d, lessons: d.lessons + 1 },
          };
        }),

      recordReport: () =>
        set((s) => ({ xp: s.xp + 15 })),

      reset: () =>
        set({
          grade: null,
          goals: [],
          xp: 0,
          coins: 0,
          streak: 0,
          lastActive: null,
          dailyBonusDate: null,
          daily: freshDaily(),
        }),
    }),
    { name: "onfive-user" },
  ),
);
