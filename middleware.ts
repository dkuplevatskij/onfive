import { next } from "@vercel/edge";

/**
 * Защита бизнес-документов (/docs/*) Basic-авторизацией.
 * Само приложение остаётся публичным — middleware срабатывает только на /docs.
 *
 * Логин/пароль задаются переменными окружения в Vercel:
 *   DOCS_USER     (необязательно, по умолчанию "onfive")
 *   DOCS_PASSWORD (обязательно — без него /docs закрыт для всех)
 */
export const config = {
  matcher: "/docs/:path*",
};

export default function middleware(request: Request): Response {
  const user = process.env.DOCS_USER || "onfive";
  const pass = process.env.DOCS_PASSWORD;

  // Пароль не задан — держим закрытым (а не публичным).
  if (!pass) {
    return new Response(
      "Доступ к /docs закрыт. Задайте DOCS_PASSWORD в переменных окружения Vercel.",
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  const header = request.headers.get("authorization") || "";
  const expected = "Basic " + btoa(`${user}:${pass}`);
  if (header === expected) {
    return next();
  }

  return new Response("Требуется авторизация", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="OnFive docs", charset="UTF-8"',
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
