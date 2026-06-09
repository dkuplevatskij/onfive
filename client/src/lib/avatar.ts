import { supabase } from "./supabase";

const BUCKET = "avatars";

/**
 * Обрезает картинку в квадрат и уменьшает до maxSize, отдаёт webp-Blob.
 * Так аватары лёгкие (несколько КБ) и одинаково квадратные.
 */
async function downscaleSquare(file: File, maxSize = 256): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = maxSize;
  canvas.height = maxSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Не удалось обработать изображение.");
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, maxSize, maxSize);
  bitmap.close?.();

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Не удалось сжать изображение."))),
      "image/webp",
      0.9,
    ),
  );
}

/**
 * Загружает фото-аватар текущего ученика в Supabase Storage и возвращает
 * публичный URL. Доступно только при подключённом облаке.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!supabase) {
    throw new Error("Загрузка фото доступна после подключения облака.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Выбери файл изображения.");
  }

  const blob = await downscaleSquare(file);
  // Папка = userId: так RLS-политика разрешает писать только в свою.
  const path = `${userId}/avatar.webp`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { upsert: true, contentType: "image/webp" });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Cache-bust, чтобы новое фото показалось сразу вместо старого из кэша.
  return `${data.publicUrl}?v=${Date.now()}`;
}
