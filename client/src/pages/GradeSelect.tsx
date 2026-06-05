import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { GRADES } from "@onfive/shared";
import { useUserStore } from "../stores/user";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const pop: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 320, damping: 22 } },
};

/** Экран выбора класса (5–11) в стиле «Искра». */
export function GradeSelect() {
  const navigate = useNavigate();
  const grade = useUserStore((s) => s.grade);
  const setGrade = useUserStore((s) => s.setGrade);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        В каком ты <span className="text-violet">классе?</span>
      </h1>
      <p className="mb-7 mt-2 text-ink-soft">Подберём предметы по программе ФГОС.</p>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-3"
      >
        {GRADES.map((g) => {
          const active = g === grade;
          return (
            <motion.button
              key={g}
              variants={pop}
              onClick={() => {
                setGrade(g);
                navigate("/subjects");
              }}
              className={`press flex aspect-square flex-col items-center justify-center rounded-[var(--radius-card)] ${
                active ? "aurora text-white shadow-glow" : "bg-surface shadow-soft hover:shadow-glow"
              }`}
            >
              <span
                className={`font-display text-4xl font-extrabold ${
                  active ? "text-white" : "text-violet"
                }`}
              >
                {g}
              </span>
              <span
                className={`text-xs font-semibold ${active ? "text-white/70" : "text-ink-faint"}`}
              >
                класс
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
