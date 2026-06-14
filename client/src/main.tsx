import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { router } from "./app/router";
// Self-hosted шрифты (Google Fonts заблокирован в РФ — отсюда таймауты при
// загрузке). Начертания — как в прежнем @import. Подключаем до index.css,
// где они задаются в --font-display (Unbounded) и --font-sans (Manrope).
import "@fontsource/unbounded/500.css";
import "@fontsource/unbounded/600.css";
import "@fontsource/unbounded/700.css";
import "@fontsource/unbounded/800.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Не найден корневой элемент #root");
}

createRoot(rootElement).render(
  <StrictMode>
    {/* reducedMotion="user" — все framer-анимации уважают prefers-reduced-motion */}
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  </StrictMode>,
);
