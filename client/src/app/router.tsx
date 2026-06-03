import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./Layout";
import { TabLayout } from "./TabLayout";
import { PlainLayout } from "./PlainLayout";
import { Home } from "../pages/Home";

// Ленивая загрузка — каждый экран отдельным чанком. Главная грузится
// сразу (первый экран), тяжёлые экраны (чат с KaTeX, квиз) — по требованию.
const Tasks = lazy(() => import("../pages/Tasks").then((m) => ({ default: m.Tasks })));
const Leaderboard = lazy(() =>
  import("../pages/Leaderboard").then((m) => ({ default: m.Leaderboard })),
);
const Profile = lazy(() => import("../pages/Profile").then((m) => ({ default: m.Profile })));
const Quiz = lazy(() => import("../pages/Quiz").then((m) => ({ default: m.Quiz })));
const Parent = lazy(() => import("../pages/Parent").then((m) => ({ default: m.Parent })));
const GradeSelect = lazy(() =>
  import("../pages/GradeSelect").then((m) => ({ default: m.GradeSelect })),
);
const SubjectSelect = lazy(() =>
  import("../pages/SubjectSelect").then((m) => ({ default: m.SubjectSelect })),
);
const TopicSelect = lazy(() =>
  import("../pages/TopicSelect").then((m) => ({ default: m.TopicSelect })),
);
const ModeSelect = lazy(() =>
  import("../pages/ModeSelect").then((m) => ({ default: m.ModeSelect })),
);
const Chat = lazy(() => import("../pages/Chat").then((m) => ({ default: m.Chat })));

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Вкладки с нижней навигацией
      {
        element: <TabLayout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/tasks", element: <Tasks /> },
          { path: "/leaderboard", element: <Leaderboard /> },
          { path: "/profile", element: <Profile /> },
        ],
      },
      // Экраны без таб-бара (воронка обучения, онбординг)
      {
        element: <PlainLayout />,
        children: [
          { path: "/quiz", element: <Quiz /> },
          { path: "/parent", element: <Parent /> },
          { path: "/onboarding", element: <GradeSelect /> },
          { path: "/subjects", element: <SubjectSelect /> },
          { path: "/subject/:subjectId", element: <TopicSelect /> },
          { path: "/subject/:subjectId/mode", element: <ModeSelect /> },
          { path: "/chat", element: <Chat /> },
        ],
      },
    ],
  },
]);
