import { useEffect } from "react";
import { useUserStore } from "../stores/user";

/** Применяет выбранную тему к <html> (класс .dark). */
export function useApplyTheme() {
  const theme = useUserStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.setProperty(
      "--meta-theme",
      theme === "dark" ? "#090a0f" : "#f4f5fb",
    );
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#090a0f" : "#f4f5fb");
  }, [theme]);
}
