/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL проекта Supabase, напр. https://xxxx.supabase.co. Необязателен. */
  readonly VITE_SUPABASE_URL?: string;
  /** Публичный anon-ключ Supabase (безопасен для фронтенда при включённом RLS). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
