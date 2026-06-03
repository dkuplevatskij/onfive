import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gradient" | "soft" | "ghost";
  size?: "md" | "lg";
};

/** Кнопка OnFive: фирменный градиент, мягкая или призрачная. */
export function Button({
  variant = "gradient",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const styles = {
    gradient: "aurora text-white shadow-glow",
    soft: "bg-white text-ink shadow-soft",
    ghost: "bg-transparent text-ink-soft hover:text-ink",
  }[variant];

  const sizing = size === "lg" ? "px-7 py-4 text-base" : "px-5 py-3 text-sm";

  return (
    <button
      className={`press cursor-pointer rounded-2xl font-bold tracking-tight disabled:opacity-50 ${styles} ${sizing} ${className}`}
      {...props}
    />
  );
}
