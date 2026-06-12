-- OnFive — привязка родителя к прогрессу ребёнка по семейному коду.
--
-- Ребёнок делится своим family_code (ONF5-XXXXXX). Родитель на своём
-- устройстве вводит код и видит прогресс ребёнка (только чтение) через
-- SECURITY DEFINER-функцию — наружу отдаются лишь безопасные поля прогресса,
-- без личных контактов и содержимого докладов.
-- Запусти после 0002. Идемпотентно.

alter table public.profiles add column if not exists family_code text;
create index if not exists profiles_family_code_idx on public.profiles (family_code);

create or replace function public.onfive_child_progress(p_code text)
returns table (
  nickname      text,
  avatar        text,
  grade         int,
  xp            int,
  coins         int,
  streak        int,
  last_active   date,
  reports_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.nickname,
    p.avatar,
    p.grade,
    p.xp,
    p.coins,
    p.streak,
    p.last_active,
    (select count(*) from public.reports r where r.user_id = p.id) as reports_count
  from public.profiles p
  where p.family_code = p_code
  limit 1;
$$;

grant execute on function public.onfive_child_progress(text) to anon, authenticated;
