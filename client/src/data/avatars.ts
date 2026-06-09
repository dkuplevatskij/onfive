/**
 * Пресеты аватаров OnFive — стильные градиенты вместо эмодзи-зверей.
 * Значение `avatar` в профиле может быть:
 *  - id пресета (напр. "aurora") → рисуем градиент + инициал;
 *  - URL (https://…) → загруженное фото;
 *  - произвольная строка-эмодзи → legacy, рисуем как символ.
 */

export interface AvatarPreset {
  id: string;
  gradient: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "aurora", gradient: "linear-gradient(135deg, #7C5CFC, #4DA3FF)" },
  { id: "grape", gradient: "linear-gradient(135deg, #A668FF, #FF6BD6)" },
  { id: "ocean", gradient: "linear-gradient(135deg, #3A8DFF, #2BD9D9)" },
  { id: "mint", gradient: "linear-gradient(135deg, #2BD9B0, #4DA3FF)" },
  { id: "lime", gradient: "linear-gradient(135deg, #9BE15D, #00C9A7)" },
  { id: "gold", gradient: "linear-gradient(135deg, #FFC24B, #FF7A45)" },
  { id: "ember", gradient: "linear-gradient(135deg, #FF7A45, #FF4D6D)" },
  { id: "berry", gradient: "linear-gradient(135deg, #FF5F9E, #A24BFF)" },
  { id: "sky", gradient: "linear-gradient(135deg, #56CCF2, #6C7BFF)" },
  { id: "teal", gradient: "linear-gradient(135deg, #17C3B2, #227C9D)" },
  { id: "violet", gradient: "linear-gradient(135deg, #8E7BFF, #5A4BFF)" },
  { id: "coral", gradient: "linear-gradient(135deg, #FF8A8A, #FFB36B)" },
];

/** Пресет по умолчанию для новых профилей. */
export const DEFAULT_AVATAR = "aurora";

const PRESET_MAP = new Map(AVATAR_PRESETS.map((p) => [p.id, p.gradient]));

/** Градиент пресета по id или null, если это не пресет. */
export function presetGradient(id: string): string | null {
  return PRESET_MAP.get(id) ?? null;
}

/** true, если значение — ссылка на загруженное фото. */
export function isPhotoUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}
