/**
 * Превращает произвольную тему в безопасное имя файла:
 * убирает спецсимволы, схлопывает пробелы в дефисы.
 * Кириллицу сохраняем (современные ОС её поддерживают).
 */
export function safeFileName(topic: string): string {
  const cleaned = topic
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "доклад";
}
