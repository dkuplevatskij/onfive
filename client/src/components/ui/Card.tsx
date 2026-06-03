import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

/** Базовая карточка OnFive: крупный радиус, мягкая тень, spring-нажатие. */
export function Card({ children, onClick, className = "" }: CardProps) {
  const interactive = onClick
    ? "press cursor-pointer hover:shadow-glow"
    : "";
  return (
    <div
      onClick={onClick}
      className={`rounded-[var(--radius-card)] bg-surface p-5 shadow-soft ${interactive} ${className}`}
    >
      {children}
    </div>
  );
}
