#!/bin/bash
# OnFive — первичная настройка VPS под Coolify (Timeweb)
# Запуск под root: bash setup.sh
# Протестировано на Ubuntu 24.04 LTS
#
# Coolify сам ставит Docker + Compose, поэтому здесь — только хардненинг
# сервера и установка самого Coolify.

set -euo pipefail

echo "=== [1/5] Обновление пакетов ==="
apt-get update -qq && apt-get upgrade -y -qq

echo "=== [2/5] Базовые утилиты + безопасность ==="
apt-get install -y -qq curl git ufw fail2ban htop

echo "=== [3/5] Настройка UFW (файрвол) ==="
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp     # Traefik (Coolify)
ufw allow 443/tcp    # Traefik (Coolify)
ufw allow 8000/tcp   # Coolify dashboard (закрой после привязки домена)
# БД-порты наружу НЕ открываем — контейнеры общаются по внутренней docker-сети

echo "=== [4/5] fail2ban (защита SSH) ==="
systemctl enable fail2ban
systemctl start fail2ban

echo "=== [5/5] Установка Coolify ==="
# Официальный инсталлятор: ставит Docker, Compose, Traefik, поднимает панель
if [[ ! -d /data/coolify ]]; then
  curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
else
  echo "  Coolify уже установлен — пропускаю"
fi

echo ""
echo "✅ Сервер готов!"
echo ""
echo "Дальше — в браузере:"
echo "  1. Открой http://<IP_сервера>:8000 — создай админ-аккаунт Coolify"
echo "  2. Привяжи домены и заверши настройку по infra/COOLIFY.md"
echo "  3. После привязки домена закрой порт 8000: ufw delete allow 8000/tcp"
