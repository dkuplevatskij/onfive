import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { LEARNING_MODES } from "@onfive/shared";
import type { LearningMode } from "@onfive/shared";
import { findSubject } from "../data/subjects";
import { Card } from "../components/ui/Card";

/**
 * Экран выбора темы и режима обучения.
 * Темы по ФГОС пока не заведены — используется поле «Своя тема».
 */
export function ModeSelect() {
  const navigate = useNavigate();
  const { subjectId = "" } = useParams();
  const subject = findSubject(subjectId);
  const [topic, setTopic] = useState("");

  if (!subject) {
    return <Navigate to="/subjects" replace />;
  }

  const start = (mode: LearningMode) => {
    const t = topic.trim() || "Свободная тема";
    navigate(
      `/chat?subject=${subject.id}&mode=${mode}&topic=${encodeURIComponent(t)}`,
    );
  };

  return (
    <div>
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold tracking-tight">
        <span>{subject.icon}</span> {subject.title}
      </h1>
      <p className="mb-4 text-gray-500">Введи тему и выбери режим.</p>

      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Тема (напр. «Дроби» или «Имя существительное»)"
        className="mb-6 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-blue-400"
      />

      <div className="grid gap-3">
        {(Object.keys(LEARNING_MODES) as LearningMode[]).map((mode) => {
          const meta = LEARNING_MODES[mode];
          return (
            <Card
              key={mode}
              onClick={() => start(mode)}
              className="flex items-center gap-3"
            >
              <span className="text-2xl">{meta.icon}</span>
              <div>
                <div className="font-medium">{meta.title}</div>
                <div className="text-sm text-gray-500">{meta.description}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
