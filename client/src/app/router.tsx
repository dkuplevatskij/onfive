import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./Layout";
import { TabLayout } from "./TabLayout";
import { PlainLayout } from "./PlainLayout";
import { Home } from "../pages/Home";
import { Tasks } from "../pages/Tasks";
import { Leaderboard } from "../pages/Leaderboard";
import { Profile } from "../pages/Profile";
import { GradeSelect } from "../pages/GradeSelect";
import { SubjectSelect } from "../pages/SubjectSelect";
import { ModeSelect } from "../pages/ModeSelect";
import { Chat } from "../pages/Chat";

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
          { path: "/onboarding", element: <GradeSelect /> },
          { path: "/subjects", element: <SubjectSelect /> },
          { path: "/subject/:subjectId", element: <ModeSelect /> },
          { path: "/chat", element: <Chat /> },
        ],
      },
    ],
  },
]);
