#!/usr/bin/env python3
"""Генерация ANON_KEY и SERVICE_ROLE_KEY для self-hosted Supabase.

Эти ключи — JWT-токены (HS256), подписанные тем же JWT_SECRET, что и стек
Supabase. Скрипт без внешних зависимостей (только стандартная библиотека).

Запуск:
    JWT_SECRET="<твой JWT_SECRET>" python3 gen-keys.py
    # или
    python3 gen-keys.py "<твой JWT_SECRET>"

Важно: JWT_SECRET здесь ОБЯЗАН совпадать с переменной JWT_SECRET в .env
стека, иначе авторизация (anon/service_role) работать не будет.
"""

import base64
import hashlib
import hmac
import json
import os
import sys
import time

# Срок жизни ключей — 10 лет (как в дефолтном self-hosted Supabase).
TTL_SECONDS = 60 * 60 * 24 * 365 * 10


def _b64url(raw: bytes) -> bytes:
    """Base64URL без хвостовых '='."""
    return base64.urlsafe_b64encode(raw).rstrip(b"=")


def make_jwt(secret: str, role: str, iat: int, exp: int) -> str:
    """Собирает подписанный HS256 JWT для указанной роли Supabase."""
    header = _b64url(
        json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode()
    )
    payload = _b64url(
        json.dumps(
            {"role": role, "iss": "supabase", "iat": iat, "exp": exp},
            separators=(",", ":"),
        ).encode()
    )
    signing_input = header + b"." + payload
    signature = _b64url(
        hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    )
    return (signing_input + b"." + signature).decode()


def main() -> int:
    secret = os.environ.get("JWT_SECRET") or (sys.argv[1] if len(sys.argv) > 1 else "")
    if not secret:
        print(
            "Ошибка: задай JWT_SECRET.\n"
            '  JWT_SECRET="..." python3 gen-keys.py\n'
            "  python3 gen-keys.py \"...\"",
            file=sys.stderr,
        )
        return 1

    iat = int(time.time())
    exp = iat + TTL_SECONDS

    print("ANON_KEY=" + make_jwt(secret, "anon", iat, exp))
    print("SERVICE_ROLE_KEY=" + make_jwt(secret, "service_role", iat, exp))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
