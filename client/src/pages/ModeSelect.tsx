import { Navigate, useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
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

/** Экран выбора режима обучения по выбранной теме. */
export function ModeSelect() {
  const navigate = useNavigate();
  const { subjectId = "" } = useParams();
  const [params] = useSearchParams();
  const subject = findSubject(subjectId);
  const topic = params.get("topic")?.trim() || "Свободная тема";

  if (!subject) return <Navigate to="/subjects" replace />;
  const SubjIcon = SUBJECT_ICON[subject.id];

  const start = (mode: LearningMode) => {
    navigate(`/chat?subject=${subject.id}&mode=${mode}&topic=${encodeURIComponent(topic)}`);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={rise} className="mb-4 flex items-center gap-3">
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white ${SUBJECT_COLOR[subject.id]}`}
        >
          <SubjIcon size={24} strokeWidth={2.2} />
        </div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">{subject.title}</h1>
      </motion.div>

      {/* Выбранная тема + смена */}
      <motion.div
        variants={rise}
        className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 shadow-soft"
      >
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Тема</div>
          <div className="truncate font-bold tracking-tight">{topic}</div>
        </div>
        <Link
          to={`/subject/${subject.id}`}
          className="press shrink-0 rounded-full bg-chip px-3 py-1.5 text-sm font-semibold text-[var(--color-on-chip)]"
        >
          Сменить
        </Link>
      </motion.div>

      <motion.h2
        variants={rise}
        className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-ink-faint"
      >
        Как будем заниматься?
      </motion.h2>

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
