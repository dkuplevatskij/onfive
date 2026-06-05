import { Navigate, useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { useUserStore } from "../stores/user";
import { subjectsForGrade } from "../data/subjects";
import { SUBJECT_COLOR } from "../data/subjectColors";
import { SUBJECT_ICON } from "../data/subjectIcons";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const pop: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

/** Экран выбора предмета: яркие плитки с SVG-иконками и цветовым кодом. */
export function SubjectSelect() {
  const navigate = useNavigate();
  const grade = useUserStore((s) => s.grade);

  if (grade === null) return <Navigate to="/" replace />;

  const subjects = subjectsForGrade(grade);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Выбери <span className="text-violet">предмет</span>
      </h1>
      <p className="mb-7 mt-2 text-ink-soft">{grade} класс</p>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {subjects.map((subject) => {
          const Icon = SUBJECT_ICON[subject.id];
          return (
            <motion.button
              key={subject.id}
              variants={pop}
              onClick={() => navigate(`/subject/${subject.id}`)}
              className="press flex flex-col items-start gap-3 rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-soft hover:shadow-glow"
            >
              <div
                className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white ${SUBJECT_COLOR[subject.id]}`}
              >
                <Icon size={24} strokeWidth={2.2} />
              </div>
              <span className="font-bold leading-tight tracking-tight">{subject.title}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
