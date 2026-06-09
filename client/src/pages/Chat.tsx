import { useState, useRef, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Send, ImagePlus, X, Volume2, Square } from "lucide-react";
import type { ChatContext, ChatMessage, LearningMode, SubjectId } from "@onfive/shared";
import { useUserStore } from "../stores/user";
import { sendChat } from "../lib/api";
import { useSpeech } from "../hooks/useSpeech";
import { useSpeak } from "../hooks/useSpeak";
import { Markdown } from "../components/chat/Markdown";

/** Сообщение с опциональным прикреплённым фото (для отображения). */
type UiMessage = ChatMessage & { image?: string };

/** Экран чата с AI-репетитором. */
export function Chat() {
  const [params] = useSearchParams();
  const grade = useUserStore((s) => s.grade);
  const goals = useUserStore((s) => s.goals);
  const recordMessage = useUserStore((s) => s.recordMessage);

  const general = params.get("general") === "1";
  const subject = params.get("subject") as SubjectId | null;
  const mode = params.get("mode") as LearningMode | null;
  const topic = general ? "Свободный чат" : params.get("topic") ?? "Свободная тема";

  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [attached, setAttached] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { supported: voiceSupported, listening, toggle: toggleVoice } = useSpeech(setInput);
  const { supported: ttsSupported, speakingId, toggle: toggleSpeak } = useSpeak();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (grade === null || (!general && (!subject || !mode))) {
    return <Navigate to="/" replace />;
  }

  const context: ChatContext = general
    ? { grade, topic, mode: "free", goals, general: true }
    : { grade, subject: subject!, topic, mode: mode!, goals };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAttached(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && !attached) || loading) return;

    const image = attached ?? undefined;
    const content = text || "Помоги разобраться с этим заданием на фото.";
    const next: UiMessage[] = [...messages, { role: "user", content, image }];
    setMessages(next);
    setInput("");
    setAttached(null);
    setError(null);
    setLoading(true);

    try {
      const history: ChatMessage[] = next.map(({ role, content }) => ({ role, content }));
      const reply = await sendChat(context, history, image);
      setMessages([...next, { role: "assistant", content: reply }]);
      recordMessage();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось получить ответ. Проверь, что сервер запущен.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col">
      <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm shadow-soft">
        <span className="text-ink-faint">Тема:</span>
        <span className="font-semibold text-ink">{topic}</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <p className="text-ink-faint">
            Напиши вопрос или 📷 сфотографируй задание — разберёмся вместе. 👇
          </p>
        )}
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={`max-w-[82%] overflow-hidden rounded-3xl ${
                m.role === "user"
                  ? "aurora rounded-br-lg text-white shadow-glow"
                  : "rounded-bl-lg bg-surface text-ink shadow-soft"
              }`}
            >
              {m.image && (
                <img src={m.image} alt="Фото задания" className="max-h-60 w-full object-cover" />
              )}
              <div className={`px-4 py-3 ${m.role === "user" ? "whitespace-pre-wrap" : ""}`}>
                {m.role === "user" ? m.content : <Markdown content={m.content} />}
                {m.role === "assistant" && ttsSupported && (
                  <button
                    onClick={() => toggleSpeak(i, m.content)}
                    aria-label={speakingId === i ? "Остановить озвучку" : "Озвучить ответ"}
                    className="press mt-2 inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-1 text-xs font-semibold text-ink-soft"
                  >
                    {speakingId === i ? <Square size={12} /> : <Volume2 size={13} />}
                    {speakingId === i ? "Стоп" : "Озвучить"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex items-center gap-1.5 text-ink-faint">
            <span className="h-2 w-2 animate-bounce rounded-full bg-violet [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-teal [animation-delay:0.2s]" />
          </div>
        )}
        {error && <div className="text-coral">{error}</div>}
        <div ref={bottomRef} />
      </div>

      {/* Превью прикреплённого фото */}
      {attached && (
        <div className="mb-2 flex items-center gap-3 rounded-2xl bg-surface p-2 shadow-soft">
          <img src={attached} alt="Превью" className="h-14 w-14 rounded-xl object-cover" />
          <span className="flex-1 text-sm text-ink-soft">Фото задания прикреплено</span>
          <button onClick={() => setAttached(null)} aria-label="Убрать фото" className="press grid h-8 w-8 place-items-center rounded-full bg-bg text-ink-soft">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 pt-1">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPickFile} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          aria-label="Прикрепить фото"
          className="press grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface text-ink-soft shadow-soft"
        >
          <ImagePlus size={20} />
        </button>
        {voiceSupported && (
          <button
            onClick={toggleVoice}
            aria-label="Голосовой ввод"
            className={`press grid h-12 w-12 shrink-0 place-items-center rounded-2xl shadow-soft ${
              listening ? "aurora text-white shadow-glow" : "bg-surface text-ink-soft"
            }`}
          >
            <Mic size={20} className={listening ? "animate-pulse" : ""} />
          </button>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          placeholder={listening ? "Говори…" : "Твой вопрос…"}
          className="flex-1 resize-none rounded-2xl border border-hairline bg-surface px-4 py-3 shadow-soft outline-none transition focus:border-violet"
        />
        <button
          onClick={() => void send()}
          disabled={loading}
          aria-label="Отправить"
          className="press aurora grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-glow disabled:opacity-50"
        >
          <Send size={19} />
        </button>
      </div>
    </div>
  );
}
