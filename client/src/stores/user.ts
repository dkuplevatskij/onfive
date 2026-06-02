import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Grade } from "@onfive/shared";

interface UserState {
  /** Выбранный класс ученика; null — ещё не выбран. */
  grade: Grade | null;
  /** Накопленный опыт. */
  xp: number;
  setGrade: (grade: Grade) => void;
  addXp: (amount: number) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      grade: null,
      xp: 0,
      setGrade: (grade) => set({ grade }),
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      reset: () => set({ grade: null, xp: 0 }),
    }),
    { name: "onfive-user" },
  ),
);
