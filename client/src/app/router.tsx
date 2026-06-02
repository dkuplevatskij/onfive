import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./Layout";
import { Home } from "../pages/Home";
import { GradeSelect } from "../pages/GradeSelect";
import { SubjectSelect } from "../pages/SubjectSelect";
import { ModeSelect } from "../pages/ModeSelect";
import { Chat } from "../pages/Chat";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/onboarding", element: <GradeSelect /> },
      { path: "/subjects", element: <SubjectSelect /> },
      { path: "/subject/:subjectId", element: <ModeSelect /> },
      { path: "/chat", element: <Chat /> },
    ],
  },
]);
