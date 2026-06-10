import { useCallback, useEffect, useRef, useState } from "react";
import { synthesizeSpeech } from "../lib/tts";

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
 * Озвучка ответов AI. Сначала пробуем качественный голос ElevenLabs через
 * /api/tts; если он не настроен или недоступен — откатываемся на системный
 * SpeechSynthesis (ru-RU). Кнопка работает как переключатель старт/стоп,
 * `loadingId` подсвечивает загрузку аудио.
 */
export function useSpeak() {
  const webSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  // В браузере озвучка доступна всегда: либо ElevenLabs, либо системный голос.
  const supported = typeof window !== "undefined";

  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Защита от гонок: каждый новый запрос инвалидирует предыдущий.
  const reqRef = useRef(0);

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (webSupported) window.speechSynthesis.cancel();
  }, [webSupported]);

  useEffect(() => () => stopAll(), [stopAll]);

  const speakWithSystem = useCallback(
    (id: number, text: string) => {
      if (!webSupported) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "ru-RU";
      utter.rate = 1;
      utter.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
      utter.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
      setSpeakingId(id);
      window.speechSynthesis.speak(utter);
    },
    [webSupported],
  );

  const toggle = useCallback(
    async (id: number, raw: string) => {
      if (!supported) return;

      // Повторный тап по активному/загружающемуся сообщению — стоп.
      if (speakingId === id || loadingId === id) {
        stopAll();
        setSpeakingId(null);
        setLoadingId(null);
        return;
      }

      stopAll();
      setSpeakingId(null);
      const text = toPlainText(raw);
      const myReq = ++reqRef.current;
      setLoadingId(id);

      const url = await synthesizeSpeech(text);
      if (myReq !== reqRef.current) return; // запрос устарел — игнорируем

      setLoadingId((cur) => (cur === id ? null : cur));

      if (url) {
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setSpeakingId((cur) => (cur === id ? null : cur));
        audio.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
        setSpeakingId(id);
        audio.play().catch(() => setSpeakingId((cur) => (cur === id ? null : cur)));
      } else {
        // Серверная озвучка недоступна — системный голос.
        speakWithSystem(id, text);
      }
    },
    [supported, speakingId, loadingId, stopAll, speakWithSystem],
  );

  const cancel = useCallback(() => {
    stopAll();
    setSpeakingId(null);
    setLoadingId(null);
  }, [stopAll]);

  return { supported, speakingId, loadingId, toggle, cancel };
}
