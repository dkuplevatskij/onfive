import { Sparkles } from "lucide-react";
import { DEFAULT_AVATAR, dicebearSeed, dicebearUrl, isPhotoUrl } from "../../data/avatars";

interface AvatarProps {
  /** Значение из профиля: `dicebear:<seed>`, URL фото или legacy. */
  value: string;
  /** Имя/ник — для альтa и подписи в a11y. */
  name?: string;
  /** Сторона в пикселях. */
  size?: number;
  /** Доп. классы (скругление, тень). Скругление задаётся здесь. */
  className?: string;
}

/**
 * Универсальный аватар: персонаж DiceBear / фото / legacy-значение / дефолт.
 * SVG-персонажи масштабируются без потерь и кешируются по стабильному URL.
 */
export function Avatar({ value, name = "", size = 48, className = "" }: AvatarProps) {
  const base = `grid shrink-0 place-items-center overflow-hidden ${className}`;
  const style: React.CSSProperties = { width: size, height: size };
  const altName = name.trim() || "Аватар";

  // Фото (https://…).
  if (value && isPhotoUrl(value)) {
    return (
      <div className={base} style={style}>
        <img src={value} alt={altName} className="h-full w-full object-cover" />
      </div>
    );
  }

  // Персонаж DiceBear. Пустое значение → дефолтный персонаж.
  const seed = value ? dicebearSeed(value) : dicebearSeed(DEFAULT_AVATAR);
  if (seed) {
    return (
      <div className={`${base} bg-chip`} style={style}>
        <img src={dicebearUrl(seed)} alt={altName} className="h-full w-full" loading="lazy" />
      </div>
    );
  }

  // Legacy: эмодзи или старые id-градиенты — показываем как символ/искру.
  return (
    <div className={`${base} bg-chip text-[var(--color-on-chip)]`} style={style}>
      {value ? (
        <span style={{ fontSize: size * 0.52 }}>{value}</span>
      ) : (
        <Sparkles size={size * 0.42} />
      )}
    </div>
  );
}
