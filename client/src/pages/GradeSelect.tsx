import { useNavigate } from "react-router-dom";
import { GRADES } from "@onfive/shared";
import { useUserStore } from "../stores/user";
import { Card } from "../components/ui/Card";

/** Экран выбора класса (5–11). */
export function GradeSelect() {
  const navigate = useNavigate();
  const setGrade = useUserStore((s) => s.setGrade);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight">В каком ты классе?</h1>
      <p className="mb-6 text-gray-500">Подберём предметы по программе ФГОС.</p>
      <div className="grid grid-cols-3 gap-3">
        {GRADES.map((grade) => (
          <Card
            key={grade}
            onClick={() => {
              setGrade(grade);
              navigate("/subjects");
            }}
            className="flex aspect-square flex-col items-center justify-center"
          >
            <span className="text-3xl font-bold text-blue-500">{grade}</span>
            <span className="text-sm text-gray-500">класс</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
