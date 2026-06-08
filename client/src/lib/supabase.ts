import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Клиент Supabase с «мягкой» деградацией.
 *
 * Пока проект Supabase не создан (нет VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY),
 * приложение полностью работает на localStorage — облачные функции просто
 * пропускаются. Как только ключи добавлены в окружение, включается анонимная
 * авторизация, синхронизация прогресса и живой рейтинг — без изменений в коде.
 *
 * Anon-ключ публичен по дизайну Supabase: доступ к данным ограничивается
 * политиками RLS на стороне БД (см. supabase/migrations).
 */

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** true, если облако сконфигурировано и его можно использовать. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/** Клиент Supabase или null, если облако не настроено. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        // Анонимная сессия должна переживать перезагрузку и автоматически
        // продлеваться — иначе ученик терял бы привязку прогресса.
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "onfive-auth",
      },
    })
  : null;
