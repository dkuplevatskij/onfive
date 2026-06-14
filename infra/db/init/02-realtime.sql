-- Схема для Supabase Realtime. Владелец — postgres (дефолтный суперюзер
-- supabase/postgres). В апстриме здесь \set pguser из $POSTGRES_USER, но
-- мы это env не задаём — хардкод во избежание пустой строки.
create schema if not exists _realtime;
alter schema _realtime owner to postgres;
