import { useState, useRef, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Plus, Download, MessageSquare, FileText } from "lucide-react";
import type { ChatContext, ChatMessage } from "@onfive/shared";
import { useUserStore } from "../stores/user";
import { useReportsStore } from "../stores/reports";
import { sendChat } from "../lib/api";
import { Markdown } from "../components/chat/Markdown";
import { findSubject } from "../data/subjects";
import { findReportMode } from "../data/reportModes";
import { safeFileName } from "../lib/export/filename";

type Tab = "chat" | "text";

/** Скачивает Blob под именем name. */
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportWorkspace() {
  const { id = "" } = useParams();
  const grade = useUserStore((s) => s.grade);
  const recordMessage = useUserStore((s) => s.recordMessage);
  const report = useReportsStore((s) => s.get(id));
  const update = useReportsStore((s) => s.update);
  const appendToDraft = useReportsStore((s) => s.appendToDraft);

  const [tab, setTab] = useState<Tab>("chat");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [report?.messages, loading]);

  if (grade === null) return <Navigate to="/" replace />;
  if (!report) return <Navigate to="/reports" replace />;

  const subject = findSubject(report.subject);
  const modeMeta = findReportMode(report.mode);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages: ChatMessage[] = [...report.messages, { role: "user", content: text }];
    update(id, { messages: nextMessages });
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const context: ChatContext = {
        grade,
        subject: report.subject,
        topic: report.topic,
        mode: "free",
        reportMode: report.mode,
        reportLength: report.length,
      };
      const reply = await sendChat(context, nextMessages);
      update(id, { messages: [...nextMessages, { role: "assistant", content: reply }] });
      recordMessage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось получить ответ.");
    } finally {
      setLoading(false);
    }
  };

  // docx/jspdf тяжёлые — грузим их динамически только при экспорте,
  // чтобы не раздувать основной чанк рабочего пространства.
  const exportDocx = async () => {
    const { buildDocxBlob } = await import("../lib/export/docx");
    const blob = await buildDocxBlob(report.topic, report.draft);
    download(blob, `${safeFileName(report.topic)}-onfive.docx`);
  };
  const exportPdf = async () => {
    const { buildPdfBlob, loadFontBase64 } = await import("../lib/export/pdf");
    const font = await loadFontBase64();
    const blob = await buildPdfBlob(report.topic, report.draft, font);
    download(blob, `${safeFileName(report.topic)}-onfive.pdf`);
  };

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col">
      {/* Шапка */}
      <div className="mb-3">
        <h1 className="truncate font-display text-xl font-extrabold tracking-tight">{report.topic}</h1>
        <p className="text-sm text-ink-soft">
          {subject?.title ?? report.subject} · {modeMeta?.title ?? report.mode}
        </p>
      </div>

      {/* Переключатель вкладок */}
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1 shadow-soft">
        <button
          onClick={() => setTab("chat")}
          className={`press flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold ${
            tab === "chat" ? "aurora text-white" : "text-ink-soft"
          }`}
        >
          <MessageSquare size={15} /> Чат
        </button>
        <button
          onClick={() => setTab("text")}
          className={`press flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold ${
            tab === "text" ? "aurora text-white" : "text-ink-soft"
          }`}
        >
          <FileText size={15} /> Текст
        </button>
      </div>

      {tab === "chat" ? (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto pb-4">
            {report.messages.length === 0 && (
              <p className="text-ink-faint">Напиши, с чего начать. AI предложит план доклада. 👇</p>
            )}
            {report.messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[82%] overflow-hidden rounded-3xl ${
                    m.role === "user"
                      ? "aurora rounded-br-lg text-white shadow-glow"
                      : "rounded-bl-lg bg-surface text-ink shadow-soft"
                  }`}
                >
                  <div className={`px-4 py-3 ${m.role === "user" ? "whitespace-pre-wrap" : ""}`}>
                    {m.role === "user" ? m.content : <Markdown content={m.content} />}
                    {m.role === "assistant" && (
                      <button
                        onClick={() => {
                          appendToDraft(id, m.content);
                          setTab("text");
                        }}
                        className="press mt-2 inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-1 text-xs font-semibold text-ink-soft"
                      >
                        <Plus size={13} /> В доклад
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

          <div className="flex items-end gap-2 pt-1">
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
              placeholder="Твоё сообщение…"
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
        </>
      ) : (
        <>
          <textarea
            value={report.draft}
            onChange={(e) => update(id, { draft: e.target.value })}
            placeholder="Здесь собирается текст доклада. Добавляй ответы AI кнопкой «В доклад» или пиши сам."
            className="flex-1 resize-none rounded-2xl border border-hairline bg-surface p-4 shadow-soft outline-none transition focus:border-violet"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => void exportDocx()}
              disabled={!report.draft.trim()}
              className="press flex items-center justify-center gap-2 rounded-2xl bg-surface py-3 font-semibold text-ink shadow-soft disabled:opacity-50"
            >
              <Download size={18} /> .docx
            </button>
            <button
              onClick={() => void exportPdf()}
              disabled={!report.draft.trim()}
              className="press flex items-center justify-center gap-2 rounded-2xl bg-surface py-3 font-semibold text-ink shadow-soft disabled:opacity-50"
            >
              <Download size={18} /> .pdf
            </button>
          </div>
        </>
      )}
    </div>
  );
}
