import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

/** Базовая карточка в стиле Apple Cupertino: белый фон, мягкая тень, скругления. */
export function Card({ children, onClick, className = "" }: CardProps) {
  const interactive = onClick
    ? "cursor-pointer transition active:scale-[0.98] hover:shadow-md"
    : "";
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-white p-4 shadow-sm ${interactive} ${className}`}
    >
      {children}
    </div>
  );
}
