import { Sparkles } from "lucide-react";
import { DEFAULT_AVATAR, isPhotoUrl, presetGradient } from "../../data/avatars";

interface AvatarProps {
  /** Значение из профиля: id пресета, URL фото или legacy-эмодзи. */
  value: string;
  /** Имя/ник — для инициала на градиентном аватаре. */
  name?: string;
  /** Сторона в пикселях. */
  size?: number;
  /** Доп. классы (скругление, тень). Скругление задаётся здесь. */
  className?: string;
}

/**
 * Универсальный аватар: фото / градиентный пресет с инициалом / legacy-эмодзи.
 * Если значение пустое — показываем дефолтный градиент с инициалом или искрой.
 */
export function Avatar({ value, name = "", size = 48, className = "" }: AvatarProps) {
  const base = `grid shrink-0 place-items-center overflow-hidden ${className}`;
  const style: React.CSSProperties = { width: size, height: size };
  const initial = name.trim().charAt(0).toUpperCase();

  if (value && isPhotoUrl(value)) {
    return (
      <div className={base} style={style}>
        <img src={value} alt="Аватар" className="h-full w-full object-cover" />
      </div>
    );
  }

  const gradient = value ? presetGradient(value) : null;

  // Пресет или пустое значение → градиент + инициал (или искра).
  if (gradient || !value) {
    return (
      <div
        className={base}
        style={{ ...style, backgroundImage: gradient ?? presetGradient(DEFAULT_AVATAR)! }}
      >
        {initial ? (
          <span className="font-display font-extrabold text-white" style={{ fontSize: size * 0.42 }}>
            {initial}
          </span>
        ) : (
          <Sparkles className="text-white" size={size * 0.42} />
        )}
      </div>
    );
  }

  // Legacy-эмодзи.
  return (
    <div className={`${base} bg-chip`} style={style}>
      <span style={{ fontSize: size * 0.52 }}>{value}</span>
    </div>
  );
}
