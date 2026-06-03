import { useNavigate } from "react-router-dom";
import { GRADES } from "@onfive/shared";
import { useUserStore } from "../stores/user";

/** Экран выбора класса (5–11) в стиле «Искра». */
export function GradeSelect() {
  const navigate = useNavigate();
  const grade = useUserStore((s) => s.grade);
  const setGrade = useUserStore((s) => s.setGrade);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        В каком ты <span className="aurora-text">классе?</span>
      </h1>
      <p className="mb-7 mt-2 text-ink-soft">Подберём предметы по программе ФГОС.</p>

      <div className="grid grid-cols-3 gap-3">
        {GRADES.map((g) => {
          const active = g === grade;
          return (
            <button
              key={g}
              onClick={() => {
                setGrade(g);
                navigate("/subjects");
              }}
              className={`press flex aspect-square flex-col items-center justify-center rounded-[var(--radius-card)] ${
                active
                  ? "aurora text-white shadow-glow"
                  : "bg-surface shadow-soft hover:shadow-glow"
              }`}
            >
              <span
                className={`font-display text-4xl font-extrabold ${
                  active ? "text-white" : "aurora-text"
                }`}
              >
                {g}
              </span>
              <span
                className={`text-xs font-semibold ${
                  active ? "text-white/70" : "text-ink-faint"
                }`}
              >
                класс
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
