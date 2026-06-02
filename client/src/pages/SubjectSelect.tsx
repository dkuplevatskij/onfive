import { Navigate, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/user";
import { subjectsForGrade } from "../data/subjects";
import { Card } from "../components/ui/Card";

/** Экран выбора предмета для текущего класса. */
export function SubjectSelect() {
  const navigate = useNavigate();
  const grade = useUserStore((s) => s.grade);

  if (grade === null) {
    return <Navigate to="/" replace />;
  }

  const subjects = subjectsForGrade(grade);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Выбери предмет</h1>
      <p className="mb-6 text-gray-500">{grade} класс</p>
      <div className="grid grid-cols-2 gap-3">
        {subjects.map((subject) => (
          <Card
            key={subject.id}
            onClick={() => navigate(`/subject/${subject.id}`)}
            className="flex items-center gap-3"
          >
            <span className="text-2xl">{subject.icon}</span>
            <span className="font-medium">{subject.title}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
