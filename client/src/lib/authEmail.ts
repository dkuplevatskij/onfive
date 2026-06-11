import { supabase } from "./supabase";

/**
 * Апгрейд анонимной сессии и вход по e-mail (OTP-код).
 *
 * - "link"   — анонимный пользователь привязывает e-mail (updateUser).
 *              userId сохраняется, весь прогресс остаётся за аккаунтом.
 * - "signin" — возвращающийся пользователь входит в существующий аккаунт
 *              (signInWithOtp). На новом устройстве облачный прогресс
 *              подтянется автоматически (см. useCloudSync).
 *
 * Подтверждение — 6-значным кодом из письма (verifyOtp). Переход по ссылке
 * из письма тоже работает: сессия обновится через onAuthStateChange.
 */
export type EmailMode = "link" | "signin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** Шаг 1: отправить код на e-mail. */
export async function startEmail(email: string, mode: EmailMode): Promise<void> {
  if (!supabase) throw new Error("Облако не подключено.");
  const e = email.trim();
  if (mode === "link") {
    const { error } = await supabase.auth.updateUser({ email: e });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.auth.signInWithOtp({
      email: e,
      options: { shouldCreateUser: false },
    });
    if (error) throw new Error(error.message);
  }
}

/** Шаг 2: подтвердить код из письма. */
export async function verifyEmail(email: string, token: string, mode: EmailMode): Promise<void> {
  if (!supabase) throw new Error("Облако не подключено.");
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: mode === "link" ? "email_change" : "email",
  });
  if (error) throw new Error(error.message);
}

/** Выход из аккаунта (на следующем старте заведётся новая анонимная сессия). */
export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}
