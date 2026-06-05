import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

/** Базовая карточка OnFive: крупный радиус, мягкая тень, spring-нажатие.
 *  Кликабельная карточка рендерится как <button> — доступна с клавиатуры. */
export function Card({ children, onClick, className = "" }: CardProps) {
  const base = `rounded-[var(--radius-card)] bg-surface p-5 shadow-soft ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`press w-full cursor-pointer text-left hover:shadow-glow ${base}`}
      >
        {children}
      </button>
    );
  }

  return <div className={base}>{children}</div>;
}
