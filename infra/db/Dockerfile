# Кастомный образ PostgreSQL для OnFive Supabase.
#
# Зачем нужен: официальный self-hosted Supabase монтирует init-скрипты
# bind-mount'ами из исходников компоуза. В Coolify исходники компоуза
# лежат в эфемерной папке артефактов /artifacts/<uuid>, которая может быть
# недоступна в момент первого старта контейнера. Тогда Docker создаёт на
# месте отсутствующих файлов пустые директории, init-скрипты не выполняются,
# роли остаются без паролей, и auth/rest/realtime/storage падают с
# «password authentication failed». Чтобы это исключить навсегда — запекаем
# скрипты прямо в образ. Никаких bind-mount'ов, скрипты всегда на месте.
#
# Образ supabase/postgres исполняет при первой инициализации содержимое
# /docker-entrypoint-initdb.d. Свои базовые скрипты он держит в
# init-scripts/ и migrations/ внутри этого каталога, поэтому наши файлы
# кладём в те же подпапки с НЕконфликтующими именами (с большим префиксом),
# не затирая встроенные — иначе базовые роли (authenticator, supabase_admin,
# supabase_auth_admin, supabase_storage_admin) не создадутся.
FROM supabase/postgres:15.8.1.060

# Пароли ролям (берёт $POSTGRES_PASSWORD из окружения контейнера).
COPY init/00-roles.sql    /docker-entrypoint-initdb.d/init-scripts/99-roles.sql
# JWT-секрет на уровне базы.
COPY init/01-jwt.sql      /docker-entrypoint-initdb.d/init-scripts/99-jwt.sql
# Схема _realtime.
COPY init/02-realtime.sql /docker-entrypoint-initdb.d/migrations/99-realtime.sql
# Схема supabase_functions + pg_net (webhooks).
COPY init/03-webhooks.sql /docker-entrypoint-initdb.d/init-scripts/98-webhooks.sql
