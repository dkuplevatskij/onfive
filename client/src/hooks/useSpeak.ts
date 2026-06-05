import { useCallback, useEffect, useState } from "react";

/** Превращает Markdown/LaTeX в чистый текст для озвучки. */
function toPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ") // блоки кода
    .replace(/`([^`]+)`/g, "$1") // инлайн-код
    .replace(/\$\$([\s\S]*?)\$\$/g, " формула ") // блочные формулы
    .replace(/\$([^$]+)\$/g, " формула ") // строчные формулы
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // картинки
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // ссылки → текст
    .replace(/[*_#>~]/g, "") // markdown-разметка
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Озвучка ответов AI через SpeechSynthesis API (ru-RU).
 * Отслеживает, какое сообщение сейчас читается, чтобы кнопка работала
 * как переключатель (старт/стоп).
 */
export function useSpeak() {
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const [speakingId, setSpeakingId] = useState<number | null>(null);

  // Останавливаем озвучку при размонтировании.
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, [supported]);

  const toggle = useCallback(
    (id: number, text: string) => {
      if (!supported) return;
      if (speakingId === id) {
        cancel();
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(toPlainText(text));
      utter.lang = "ru-RU";
      utter.rate = 1;
      utter.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
      utter.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
      setSpeakingId(id);
      window.speechSynthesis.speak(utter);
    },
    [supported, speakingId, cancel],
  );

  return { supported, speakingId, toggle, cancel };
}
