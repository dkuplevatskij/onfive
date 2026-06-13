-- OnFive — рейтинг «Друзья».
--
-- Ученик делится своим family_code. Друг добавляет код у себя → видит этого
-- ученика в своём мини-рейтинге. Функция отдаёт публичные поля (как рейтинг),
-- отсортированные по XP. Запусти после 0003. Идемпотентно.

create or replace function public.onfive_friends(p_codes text[])
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
  where p.family_code = any(p_codes)
  order by p.xp desc
  limit 100;
$$;

grant execute on function public.onfive_friends(text[]) to anon, authenticated;
