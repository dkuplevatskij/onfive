import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { useUserStore } from "../stores/user";
import { findSubject } from "../data/subjects";
import { SUBJECT_COLOR } from "../data/subjectColors";
import { SUBJECT_ICON } from "../data/subjectIcons";
import { topicsFor } from "../data/topics";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

/** Экран выбора темы занятия: разделы ФГОС + «своя тема». */
export function TopicSelect() {
  const navigate = useNavigate();
  const { subjectId = "" } = useParams();
  const grade = useUserStore((s) => s.grade);
  const subject = findSubject(subjectId);
  const [custom, setCustom] = useState("");

  if (grade === null) return <Navigate to="/" replace />;
  if (!subject) return <Navigate to="/subjects" replace />;

  const chapters = topicsFor(subject.id, grade);
  const SubjIcon = SUBJECT_ICON[subject.id];

  const goToMode = (topic: string) => {
    navigate(`/subject/${subject.id}/mode?topic=${encodeURIComponent(topic)}`);
  };

  const startCustom = () => {
    const t = custom.trim();
    if (t) goToMode(t);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={rise} className="mb-5 flex items-center gap-3">
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white ${SUBJECT_COLOR[subject.id]}`}
        >
          <SubjIcon size={24} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">{subject.title}</h1>
          <p className="text-sm text-ink-soft">{grade} класс · выбери тему</p>
        </div>
      </motion.div>

      {/* Своя тема */}
      <motion.div
        variants={rise}
        className="mb-6 rounded-[var(--radius-card)] bg-surface p-4 shadow-soft"
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <Sparkles size={15} className="text-violet" /> Своя тема
        </div>
        <div className="flex items-center gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") startCustom();
            }}
            placeholder="Напр. «Дроби» или «Имя существительное»"
            className="flex-1 rounded-2xl border border-hairline bg-bg px-4 py-3 font-medium outline-none transition focus:border-violet"
          />
          <button
            onClick={startCustom}
            disabled={!custom.trim()}
            aria-label="Перейти к теме"
            className="press aurora grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-glow disabled:opacity-40"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>

      {/* Разделы ФГОС */}
      {chapters.length > 0 ? (
        <div className="space-y-6">
          {chapters.map((ch) => (
            <motion.div key={ch.chapter} variants={rise}>
              <h2 className="mb-2.5 px-1 text-sm font-bold uppercase tracking-wide text-ink-faint">
                {ch.chapter}
              </h2>
              <div className="grid gap-2">
                {ch.topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => goToMode(topic)}
                    className="press flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3.5 text-left shadow-soft hover:shadow-glow"
                  >
                    <span className="font-semibold tracking-tight">{topic}</span>
                    <ChevronRight size={18} className="shrink-0 text-ink-faint" />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.p variants={rise} className="px-1 text-sm text-ink-soft">
          Для этого предмета пока нет готового списка тем — впиши свою тему выше,
          и начнём занятие 👆
        </motion.p>
      )}
    </motion.div>
  );
}
