import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Grade } from "@onfive/shared";

export type Theme = "light" | "dark";

interface UserState {
  /** Выбранный класс ученика; null — ещё не выбран. */
  grade: Grade | null;
  /** Накопленный опыт. */
  xp: number;
  /** Тема оформления. */
  theme: Theme;
  setGrade: (grade: Grade) => void;
  addXp: (amount: number) => void;
  toggleTheme: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      grade: null,
      xp: 0,
      theme: "dark",
      setGrade: (grade) => set({ grade }),
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      reset: () => set({ grade: null, xp: 0 }),
    }),
    { name: "onfive-user" },
  ),
);
