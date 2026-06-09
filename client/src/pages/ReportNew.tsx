import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import type { ReportLength, ReportMode, SubjectId } from "@onfive/shared";
import { useUserStore } from "../stores/user";
import { useReportsStore } from "../stores/reports";
import { subjectsForGrade } from "../data/subjects";
import { SUBJECT_COLOR } from "../data/subjectColors";
import { SUBJECT_ICON } from "../data/subjectIcons";
import { REPORT_MODES, REPORT_LENGTHS } from "../data/reportModes";

const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

/** Мастер создания доклада: предмет → тема+объём → режим. */
export function ReportNew() {
  const navigate = useNavigate();
  const grade = useUserStore((s) => s.grade);
  const recordReport = useUserStore((s) => s.recordReport);
  const createReport = useReportsStore((s) => s.create);

  const [subject, setSubject] = useState<SubjectId | null>(null);
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState<ReportLength>("medium");

  if (grade === null) return <Navigate to="/" replace />;
  const subjects = subjectsForGrade(grade);

  const finish = (mode: ReportMode) => {
    if (!subject || !topic.trim()) return;
    const id = createReport({
      subject,
      topic: topic.trim(),
      length,
      mode,
    });
    recordReport();
    navigate(`/reports/${id}`, { replace: true });
  };

  // Шаг 1: предмет
  if (!subject) {
    return (
      <motion.div initial="hidden" animate="show">
        <motion.h1 variants={rise} className="mb-4 font-display text-2xl font-extrabold tracking-tight">
          О чём доклад?
        </motion.h1>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((s) => {
            const Icon = SUBJECT_ICON[s.id];
            return (
              <motion.button
                key={s.id}
                variants={rise}
                onClick={() => setSubject(s.id)}
                className="press flex flex-col items-start gap-2 rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-soft hover:shadow-glow"
              >
                <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-white ${SUBJECT_COLOR[s.id]}`}>
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <span className="font-bold tracking-tight">{s.title}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // Шаг 2: тема + объём → выбор режима запускает создание
  return (
    <motion.div initial="hidden" animate="show">
      <motion.h1 variants={rise} className="mb-4 font-display text-2xl font-extrabold tracking-tight">
        Тема и объём
      </motion.h1>

      <motion.input
        variants={rise}
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Например: Жизнь и реформы Петра I"
        className="mb-4 w-full rounded-2xl border border-hairline bg-surface px-4 py-3 shadow-soft outline-none transition focus:border-violet"
      />

      <motion.div variants={rise} className="mb-5 grid grid-cols-3 gap-2">
        {REPORT_LENGTHS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLength(l.id)}
            className={`press rounded-2xl p-3 text-center shadow-soft ${
              length === l.id ? "aurora text-white" : "bg-surface text-ink"
            }`}
          >
            <div className="text-sm font-bold">{l.title}</div>
            <div className={`text-xs ${length === l.id ? "text-white/80" : "text-ink-faint"}`}>{l.hint}</div>
          </button>
        ))}
      </motion.div>

      <motion.h2 variants={rise} className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-ink-faint">
        Как помочь?
      </motion.h2>
      <div className="grid gap-3">
        {REPORT_MODES.map((m) => (
          <motion.button
            key={m.id}
            variants={rise}
            disabled={!topic.trim()}
            onClick={() => finish(m.id)}
            className="press flex items-center gap-4 rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-soft hover:shadow-glow disabled:opacity-50"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-bg text-ink">
              <m.Icon size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-bold tracking-tight">{m.title}</div>
              <div className="text-sm text-ink-soft">{m.description}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
