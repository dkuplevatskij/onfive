/** Определения миссий. progress(store) → текущее значение; target — цель. */
export interface MissionDef {
  id: string;
  title: string;
  description: string;
  target: number;
  xp: number;
  coins: number;
}

export const DAILY_MISSIONS: MissionDef[] = [
  {
    id: "ask5",
    title: "Любознательность",
    description: "Задай 5 вопросов репетитору",
    target: 5,
    xp: 30,
    coins: 3,
  },
  {
    id: "correct5",
    title: "Меткий ответ",
    description: "Дай 5 правильных ответов",
    target: 5,
    xp: 50,
    coins: 5,
  },
  {
    id: "lesson1",
    title: "Шаг вперёд",
    description: "Заверши любое занятие",
    target: 1,
    xp: 40,
    coins: 4,
  },
];

export const WEEKLY_MISSIONS: MissionDef[] = [
  {
    id: "streak7",
    title: "Неделя обучения",
    description: "Занимайся 7 дней подряд",
    target: 7,
    xp: 200,
    coins: 20,
  },
];
