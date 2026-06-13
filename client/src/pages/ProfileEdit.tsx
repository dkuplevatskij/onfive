import { useRef, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Check, Send, AtSign, ImagePlus, Loader2 } from "lucide-react";
import { useUserStore } from "../stores/user";
import { useAuthStore } from "../stores/auth";
import { Avatar } from "../components/ui/Avatar";
import { AVATAR_SEEDS, dicebearUrl } from "../data/avatars";
import { uploadAvatar } from "../lib/avatar";
import { isSupabaseConfigured } from "../lib/supabase";

const fieldClass =
  "w-full rounded-2xl bg-bg px-4 py-3 text-ink outline-none ring-1 ring-transparent transition focus:ring-violet placeholder:text-ink-faint";
const labelClass = "mb-1.5 block text-sm font-bold text-ink-soft";

/** Экран редактирования профиля: аватар, ник, имя/фамилия, контакты. */
export function ProfileEdit() {
  const navigate = useNavigate();
  const grade = useUserStore((s) => s.grade);
  const setProfile = useUserStore((s) => s.setProfile);
  const userId = useAuthStore((s) => s.userId);

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const canUpload = isSupabaseConfigured && !!userId;

  // Начальные значения формы читаем один раз из стора (lazy initializer):
  // селектор не должен возвращать новый объект на каждый рендер — иначе
  // zustand v5 (useSyncExternalStore) уходит в бесконечный цикл ре-рендера.
  const [form, setForm] = useState(() => {
    const s = useUserStore.getState();
    return {
      nickname: s.nickname,
      firstName: s.firstName,
      lastName: s.lastName,
      telegram: s.telegram,
      vk: s.vk,
      avatar: s.avatar,
    };
  });

  if (grade === null) return <Navigate to="/" replace />;

  const update = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    setProfile(form);
    navigate("/profile");
  };

  const onPickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !userId) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadAvatar(userId, file);
      update({ avatar: url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Не удалось загрузить фото.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button
        onClick={() => navigate("/profile")}
        className="press mb-4 flex items-center gap-1 text-sm font-bold text-ink-soft"
      >
        <ChevronLeft size={18} /> Профиль
      </button>

      <h1 className="font-display text-2xl font-extrabold tracking-tight">Профиль</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Ник и аватар видны в рейтинге. Контакты — только для тебя и родителей.
      </p>

      {/* Выбор аватара */}
      <h2 className={`${labelClass} mt-6`}>Аватар</h2>

      <div className="flex items-center gap-4">
        <Avatar value={form.avatar} name={form.nickname} size={72} className="rounded-3xl shadow-soft" />
        <div className="flex-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onPickPhoto}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={!canUpload || uploading}
            className="press inline-flex items-center gap-2 rounded-2xl bg-surface px-4 py-2.5 text-sm font-bold text-ink shadow-soft disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
            {uploading ? "Загружаем…" : "Загрузить фото"}
          </button>
          <p className="mt-1.5 text-xs text-ink-faint">
            {canUpload
              ? "Или выбери готовый аватар ниже"
              : "Загрузка фото — после подключения облака. Пока выбери аватар ниже."}
          </p>
        </div>
      </div>
      {uploadError && <p className="mt-2 text-sm text-coral">{uploadError}</p>}

      <div className="mt-4 grid grid-cols-4 gap-2.5">
        {AVATAR_SEEDS.map((seed) => {
          const val = `dicebear:${seed}`;
          const active = form.avatar === val;
          return (
            <button
              key={seed}
              onClick={() => update({ avatar: val })}
              aria-label={`Аватар ${seed}`}
              className={`press relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-surface shadow-soft transition ${
                active ? "ring-2 ring-violet ring-offset-2 ring-offset-bg" : ""
              }`}
            >
              <img src={dicebearUrl(seed)} alt="" className="h-full w-full" loading="lazy" />
              {active && (
                <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-violet text-white shadow-glow">
                  <Check size={11} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className={labelClass}>Ник</label>
          <input
            className={fieldClass}
            value={form.nickname}
            maxLength={24}
            placeholder="Как тебя показать в рейтинге"
            onChange={(e) => update({ nickname: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Имя <span className="text-ink-faint">· по желанию</span></label>
            <input
              className={fieldClass}
              value={form.firstName}
              maxLength={40}
              placeholder="Имя"
              onChange={(e) => update({ firstName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Фамилия</label>
            <input
              className={fieldClass}
              value={form.lastName}
              maxLength={40}
              placeholder="Фамилия"
              onChange={(e) => update({ lastName: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Telegram</label>
          <div className="relative">
            <Send size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              className={`${fieldClass} pl-10`}
              value={form.telegram}
              maxLength={64}
              placeholder="@username"
              onChange={(e) => update({ telegram: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>VK</label>
          <div className="relative">
            <AtSign size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              className={`${fieldClass} pl-10`}
              value={form.vk}
              maxLength={128}
              placeholder="vk.com/username"
              onChange={(e) => update({ vk: e.target.value })}
            />
          </div>
        </div>
      </div>

      <button
        onClick={save}
        className="aurora press mt-7 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white shadow-glow"
      >
        <Check size={18} /> Сохранить
      </button>
    </motion.div>
  );
}
