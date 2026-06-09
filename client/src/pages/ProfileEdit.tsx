import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Check, Send, AtSign } from "lucide-react";
import { useUserStore } from "../stores/user";

/** Набор эмодзи-аватаров на выбор. */
const AVATARS = [
  "🦊", "🐱", "🐼", "🦉", "🐧", "🐢", "🦄", "🐲",
  "🚀", "🎓", "⭐️", "🔥", "🧠", "🎯", "🎮", "🏆",
];

const fieldClass =
  "w-full rounded-2xl bg-bg px-4 py-3 text-ink outline-none ring-1 ring-transparent transition focus:ring-violet placeholder:text-ink-faint";
const labelClass = "mb-1.5 block text-sm font-bold text-ink-soft";

/** Экран редактирования профиля: аватар, ник, имя/фамилия, контакты. */
export function ProfileEdit() {
  const navigate = useNavigate();
  const grade = useUserStore((s) => s.grade);
  const setProfile = useUserStore((s) => s.setProfile);

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
      <div className="grid grid-cols-8 gap-2">
        {AVATARS.map((a) => (
          <button
            key={a}
            onClick={() => update({ avatar: a })}
            className={`press grid aspect-square place-items-center rounded-2xl text-2xl shadow-soft transition ${
              form.avatar === a ? "aurora ring-2 ring-violet" : "bg-surface"
            }`}
          >
            {a}
          </button>
        ))}
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
