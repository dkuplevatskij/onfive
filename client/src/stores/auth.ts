import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

/**
 * Статус облачной авторизации:
 *  - disabled — облако не настроено, работаем только локально;
 *  - loading  — устанавливаем анонимную сессию;
 *  - ready    — сессия есть, известен userId;
 *  - error    — не удалось авторизоваться (например, выключен Anonymous Sign-In).
 */
export type AuthStatus = "disabled" | "loading" | "ready" | "error";

interface AuthState {
  status: AuthStatus;
  userId: string | null;
  /** Сессия анонимная (можно предложить «сохранить прогресс» через апгрейд). */
  isAnonymous: boolean;
  /** E-mail аккаунта или null (анонимный/не задан). */
  email: string | null;
  /** Идемпотентная инициализация: вызывается один раз на старте приложения. */
  init: () => Promise<void>;
}

let initStarted = false;

export const useAuthStore = create<AuthState>()((set) => ({
  status: isSupabaseConfigured ? "loading" : "disabled",
  userId: null,
  isAnonymous: false,
  email: null,

  init: async () => {
    if (!supabase || initStarted) return;
    initStarted = true;

    // Реагируем на смену сессии (логин, выход, продление токена).
    supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      set({
        userId: user?.id ?? null,
        isAnonymous: user?.is_anonymous ?? false,
        email: user?.email ?? null,
        status: user ? "ready" : "loading",
      });
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({
          userId: session.user.id,
          isAnonymous: session.user.is_anonymous ?? false,
          email: session.user.email ?? null,
          status: "ready",
        });
        return;
      }
      // Сессии нет — заводим анонимную, чтобы сразу синхронизировать прогресс.
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data.user) {
        set({ status: "error" });
        return;
      }
      set({ userId: data.user.id, isAnonymous: true, email: null, status: "ready" });
    } catch {
      set({ status: "error" });
    }
  },
}));
