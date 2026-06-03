import { useEffect, useState } from "react";
import { animate } from "framer-motion";

/** Плавно «накручивает» число от предыдущего значения к новому. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const controls = animate(display, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={`tabular-nums ${className ?? ""}`}>{display}</span>;
}
