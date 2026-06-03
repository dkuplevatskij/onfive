import { useMemo } from "react";
import { marked } from "marked";
import katex from "katex";

/** Рендерит математику $...$ / $$...$$ через KaTeX, остальное — через marked. */
function renderMath(src: string): string {
  const store: string[] = [];
  const stash = (html: string) => {
    store.push(html);
    return `@@MATH${store.length - 1}@@`;
  };

  // Блочные $$...$$
  let text = src.replace(/\$\$([\s\S]+?)\$\$/g, (_m, expr) => {
    try {
      return stash(katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false }));
    } catch {
      return _m;
    }
  });
  // Строчные $...$
  text = text.replace(/\$([^$\n]+?)\$/g, (_m, expr) => {
    try {
      return stash(katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false }));
    } catch {
      return _m;
    }
  });

  let html = marked.parse(text, { async: false }) as string;
  html = html.replace(/@@MATH(\d+)@@/g, (_m, i) => store[Number(i)] ?? "");
  return html;
}

/** Минимальная очистка от опасных конструкций (вывод из нашего бэкенда). */
function sanitize(html: string): string {
  return html
    .replace(/<\s*(script|iframe|object|embed|style)[\s\S]*?<\/\s*\1\s*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi, "$1=\"#\"");
}

export function Markdown({ content }: { content: string }) {
  const html = useMemo(() => sanitize(renderMath(content)), [content]);
  return (
    <div
      className="prose-chat space-y-2 leading-relaxed [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_li]:ml-4 [&_li]:list-disc [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-black/80 [&_pre]:p-3 [&_pre]:text-white [&_strong]:font-bold"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
