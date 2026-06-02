import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

/** Кнопка в iOS-стиле. */
export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-blue-500 text-white active:bg-blue-600"
      : "bg-gray-200 text-gray-900 active:bg-gray-300";
  return (
    <button
      className={`rounded-xl px-4 py-2.5 font-medium transition active:scale-[0.98] disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}
