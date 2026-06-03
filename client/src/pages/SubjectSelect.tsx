import { Navigate, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/user";
import { subjectsForGrade } from "../data/subjects";
import { SUBJECT_COLOR } from "../data/subjectColors";

/** Экран выбора предмета: яркие плитки с цветовым кодом. */
export function SubjectSelect() {
  const navigate = useNavigate();
  const grade = useUserStore((s) => s.grade);

  if (grade === null) return <Navigate to="/" replace />;

  const subjects = subjectsForGrade(grade);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Выбери <span className="aurora-text">предмет</span>
      </h1>
      <p className="mb-7 mt-2 text-ink-soft">{grade} класс</p>

      <div className="grid grid-cols-2 gap-3">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => navigate(`/subject/${subject.id}`)}
            className="press flex flex-col items-start gap-3 rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-soft hover:shadow-glow"
          >
            <div
              className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-2xl ${SUBJECT_COLOR[subject.id]}`}
            >
              {subject.icon}
            </div>
            <span className="font-bold leading-tight tracking-tight">
              {subject.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
