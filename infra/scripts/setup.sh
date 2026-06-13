#!/bin/bash
# OnFive — первичная настройка сервера Timeweb
# Запуск: bash setup.sh (под root или sudo)
# Протестировано на Ubuntu 22.04 LTS

set -euo pipefail

echo "=== [1/7] Обновление пакетов ==="
apt-get update -qq && apt-get upgrade -y -qq

echo "=== [2/7] Установка зависимостей ==="
apt-get install -y -qq \
  curl git nginx certbot python3-certbot-nginx \
  ufw fail2ban htop

echo "=== [3/7] Установка Docker ==="
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

if ! command -v docker compose &>/dev/null; then
  COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -Po '"tag_name": "\K[^"]+')
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

echo "=== [4/7] Настройка UFW (файрвол) ==="
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
# Supabase порты — только локально, не снаружи
ufw deny 5432/tcp   # Postgres
ufw deny 8000/tcp   # Kong
ufw deny 8443/tcp   # Kong HTTPS

echo "=== [5/7] Директория проекта ==="
mkdir -p /opt/onfive
cd /opt/onfive

echo "=== [6/7] Настройка автобэкапов ==="
mkdir -p /opt/onfive/backups
# Ежедневный дамп Postgres в 3:00 (хранится 7 дней)
cat > /etc/cron.d/onfive-backup <<'CRON'
0 3 * * * root docker exec $(docker ps -q -f name=onfive-db) pg_dumpall -U postgres | gzip > /opt/onfive/backups/pg_$(date +\%Y\%m\%d).sql.gz && find /opt/onfive/backups -name "pg_*.sql.gz" -mtime +7 -delete
CRON

echo "=== [7/7] Systemd unit для автозапуска ==="
cat > /etc/systemd/system/onfive-supabase.service <<'UNIT'
[Unit]
Description=OnFive Self-hosted Supabase
After=docker.service
Requires=docker.service

[Service]
WorkingDirectory=/opt/onfive
ExecStart=/usr/local/lib/docker/cli-plugins/docker-compose up
ExecStop=/usr/local/lib/docker/cli-plugins/docker-compose down
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable onfive-supabase

echo ""
echo "✅ Сервер настроен!"
echo ""
echo "Следующие шаги:"
echo "  1. cd /opt/onfive"
echo "  2. git clone https://github.com/dkuplevatskij/onfive.git ."
echo "  3. cp infra/.env.example infra/.env && nano infra/.env"
echo "  4. bash infra/scripts/deploy.sh"
echo "  5. sudo certbot --nginx -d api.onfive.ru"
