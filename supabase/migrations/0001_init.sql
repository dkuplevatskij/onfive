-- OnFive — начальная схема Supabase: профили, доклады, рейтинг.
--
-- Модель доступа: фронтенд ходит в Supabase напрямую с anon-ключом и анонимной
-- (или связанной) сессией. Данные защищены политиками RLS: каждый видит и меняет
-- только свою строку. Публичный рейтинг отдаётся через SECURITY DEFINER-функцию,
-- которая раскрывает лишь безопасные поля (ник, аватар, XP, стрик, класс).

-- ───────────────────────────── profiles ─────────────────────────────
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  nickname         text not null default '',
  first_name       text not null default '',
  last_name        text not null default '',
  telegram         text not null default '',
  vk               text not null default '',
  avatar           text not null default '',
  grade            int,
  goals            jsonb not null default '[]'::jsonb,
  xp               int  not null default 0,
  coins            int  not null default 0,
  streak           int  not null default 0,
  last_active      date,
  daily_bonus_date date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ───────────────────────────── reports ──────────────────────────────
create table if not exists public.reports (
  id         uuid primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  subject    text not null,
  topic      text not null,
  length     text not null,
  mode       text not null,
  messages   jsonb not null default '[]'::jsonb,
  draft      text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_user_id_idx on public.reports (user_id);

alter table public.reports enable row level security;

drop policy if exists "reports_all_own" on public.reports;
create policy "reports_all_own" on public.reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ──────────────────────────── leaderboard ───────────────────────────
-- Возвращает топ по XP. SECURITY DEFINER обходит RLS, но раскрывает только
-- публичные поля — личные контакты (telegram, vk, имя) наружу не попадают.
create or replace function public.onfive_leaderboard(limit_count int default 100)
returns table (
  id       uuid,
  nickname text,
  avatar   text,
  xp       int,
  streak   int,
  grade    int
)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.nickname, p.avatar, p.xp, p.streak, p.grade
  from public.profiles p
  order by p.xp desc, p.updated_at asc
  limit least(greatest(limit_count, 1), 200);
$$;

grant execute on function public.onfive_leaderboard(int) to anon, authenticated;
