import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { LEARNING_MODES } from "@onfive/shared";
import type { LearningMode } from "@onfive/shared";
import { findSubject } from "../data/subjects";
import { SUBJECT_COLOR } from "../data/subjectColors";
import { SUBJECT_ICON } from "../data/subjectIcons";
import { MODE_ICON } from "../data/modeIcons";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

/** Экран выбора темы и режима обучения. */
export function ModeSelect() {
  const navigate = useNavigate();
  const { subjectId = "" } = useParams();
  const subject = findSubject(subjectId);
  const [topic, setTopic] = useState("");

  if (!subject) return <Navigate to="/subjects" replace />;
  const SubjIcon = SUBJECT_ICON[subject.id];

  const start = (mode: LearningMode) => {
    const t = topic.trim() || "Свободная тема";
    navigate(`/chat?subject=${subject.id}&mode=${mode}&topic=${encodeURIComponent(t)}`);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={rise} className="mb-5 flex items-center gap-3">
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white ${SUBJECT_COLOR[subject.id]}`}
        >
          <SubjIcon size={24} strokeWidth={2.2} />
        </div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">{subject.title}</h1>
      </motion.div>

      <motion.label variants={rise} className="mb-2 block text-sm font-semibold text-ink-soft">
        Тема занятия
      </motion.label>
      <motion.input
        variants={rise}
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Напр. «Дроби» или «Имя существительное»"
        className="mb-6 w-full rounded-2xl border border-hairline bg-surface px-4 py-3.5 font-medium shadow-soft outline-none transition focus:border-violet"
      />

      <div className="grid gap-3">
        {(Object.keys(LEARNING_MODES) as LearningMode[]).map((mode) => {
          const meta = LEARNING_MODES[mode];
          const Icon = MODE_ICON[mode];
          return (
            <motion.button
              key={mode}
              variants={rise}
              onClick={() => start(mode)}
              className="press flex items-center gap-4 rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-soft hover:shadow-glow"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-bg text-ink">
                <Icon size={22} strokeWidth={2.2} />
              </div>
              <div>
                <div className="font-bold tracking-tight">{meta.title}</div>
                <div className="text-sm text-ink-soft">{meta.description}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
