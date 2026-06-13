/**
 * Аватары OnFive — стильные иллюстрированные персонажи в духе игровых
 * масок/операторов (Standoff-like), подходящие для школьников 5–11 класса.
 *
 * Используется бесплатный open-source сервис DiceBear (без API-ключа):
 * каждый seed даёт уникальный персонаж с разными причёсками, масками,
 * аксессуарами. Стиль `adventurer-neutral` — анимешные «герои» с капюшонами,
 * масками и характером, без излишней «детскости».
 *
 * Формат значения `avatar` в профиле:
 *  - `dicebear:<seed>`       → персонаж DiceBear (новый стандарт);
 *  - URL (https://…)         → загруженное пользователем фото;
 *  - legacy id/эмодзи        → старые данные, поддержка для совместимости.
 */

const DICEBEAR_STYLE = "adventurer-neutral";
const DICEBEAR_BASE = `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg`;
/** Размер SVG-канвы (фиксируем, чтобы URL был стабильным и кешировался). */
const DICEBEAR_SIZE = 128;
/** Палитра фоновых кругов под персонажем — даёт цветовое разнообразие. */
const BACKGROUND_COLORS = "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,ffe4b8,c7f0db,e0c4ff";

/** Сиды персонажей. Названия подобраны так, чтобы получались разные образы. */
export const AVATAR_SEEDS = [
  "Phoenix",
  "Shadow",
  "Storm",
  "Nova",
  "Raven",
  "Onyx",
  "Frost",
  "Blaze",
  "Echo",
  "Sage",
  "Cosmo",
  "Vega",
] as const;

/** Дефолтный аватар для новых профилей. */
export const DEFAULT_AVATAR = `dicebear:${AVATAR_SEEDS[0]}`;

/** Префикс, по которому опознаётся персонаж DiceBear. */
const DICEBEAR_PREFIX = "dicebear:";

/** Строит URL картинки персонажа. SVG, масштабируется без потерь. */
export function dicebearUrl(seed: string): string {
  return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}&size=${DICEBEAR_SIZE}&backgroundColor=${BACKGROUND_COLORS}&radius=50`;
}

/** Если значение — персонаж DiceBear, возвращает seed. Иначе null. */
export function dicebearSeed(value: string): string | null {
  return value.startsWith(DICEBEAR_PREFIX) ? value.slice(DICEBEAR_PREFIX.length) : null;
}

/** true, если значение — ссылка на загруженное фото (но не DiceBear). */
export function isPhotoUrl(value: string): boolean {
  return /^https?:\/\//.test(value) && !value.startsWith(DICEBEAR_PREFIX);
}
