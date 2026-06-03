import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { LEARNING_MODES } from "@onfive/shared";
import type { LearningMode } from "@onfive/shared";
import { findSubject } from "../data/subjects";
import { SUBJECT_COLOR } from "../data/subjectColors";

/** Экран выбора темы и режима обучения. */
export function ModeSelect() {
  const navigate = useNavigate();
  const { subjectId = "" } = useParams();
  const subject = findSubject(subjectId);
  const [topic, setTopic] = useState("");

  if (!subject) return <Navigate to="/subjects" replace />;

  const start = (mode: LearningMode) => {
    const t = topic.trim() || "Свободная тема";
    navigate(
      `/chat?subject=${subject.id}&mode=${mode}&topic=${encodeURIComponent(t)}`,
    );
  };

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-2xl ${SUBJECT_COLOR[subject.id]}`}
        >
          {subject.icon}
        </div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          {subject.title}
        </h1>
      </div>

      <label className="mb-2 block text-sm font-semibold text-ink-soft">
        Тема занятия
      </label>
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Напр. «Дроби» или «Имя существительное»"
        className="mb-6 w-full rounded-2xl border border-hairline bg-surface px-4 py-3.5 font-medium shadow-soft outline-none transition focus:border-violet"
      />

      <div className="grid gap-3">
        {(Object.keys(LEARNING_MODES) as LearningMode[]).map((mode) => {
          const meta = LEARNING_MODES[mode];
          return (
            <button
              key={mode}
              onClick={() => start(mode)}
              className="press flex items-center gap-4 rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-soft hover:shadow-glow"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-bg text-2xl">
                {meta.icon}
              </div>
              <div>
                <div className="font-bold tracking-tight">{meta.title}</div>
                <div className="text-sm text-ink-soft">{meta.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
