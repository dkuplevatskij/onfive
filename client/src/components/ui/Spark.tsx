/**
 * Фирменный знак OnFive — «Искра»: 5-конечная звезда-вспышка,
 * символ момента понимания (сократический инсайт). Также отсылка к «пятёрке».
 */
export function Spark({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="spark-aurora" x1="4" y1="6" x2="44" y2="42">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="50%" stopColor="#4F7BFF" />
          <stop offset="100%" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>
      {/* четырёхлучевая искра с мягкими вогнутыми гранями */}
      <path
        d="M24 2c1.4 9.4 6.6 14.6 16 16 -9.4 1.4 -14.6 6.6 -16 16 -1.4 -9.4 -6.6 -14.6 -16 -16 9.4 -1.4 14.6 -6.6 16 -16Z"
        fill="url(#spark-aurora)"
      />
      {/* малый блик */}
      <path
        d="M38 30c.6 4 2.8 6.2 6.8 6.8 -4 .6 -6.2 2.8 -6.8 6.8 -.6 -4 -2.8 -6.2 -6.8 -6.8 4 -.6 6.2 -2.8 6.8 -6.8Z"
        fill="url(#spark-aurora)"
        opacity="0.7"
      />
    </svg>
  );
}
