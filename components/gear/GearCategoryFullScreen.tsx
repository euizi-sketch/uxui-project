import { useEffect, useMemo, useState } from "react";
import type { GearCategoryItem } from "./gearCategoryTypes";
import { GEAR_SUBCATEGORIES } from "./gearCategorySubData";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: readonly GearCategoryItem[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
};

export function GearCategoryFullScreen({
  open,
  onClose,
  categories,
  selectedCategoryId,
  onSelectCategory,
}: Props) {
  const [activeMainId, setActiveMainId] = useState(selectedCategoryId);

  useEffect(() => {
    if (open) setActiveMainId(selectedCategoryId);
  }, [open, selectedCategoryId]);

  const activeMain = useMemo(
    () => categories.find((c) => c.id === activeMainId) ?? categories[0],
    [categories, activeMainId]
  );

  const subs = GEAR_SUBCATEGORIES[activeMainId] ?? GEAR_SUBCATEGORIES.all;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="app-viewport-fixed z-[200] flex flex-col bg-white"
      role="dialog"
      aria-modal="true"
      aria-label="카테고리"
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 bg-white px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
          aria-label="뒤로"
        >
          <span className="text-2xl leading-none" aria-hidden>
            ‹
          </span>
        </button>
        <h1 className="min-w-0 flex-1 text-lg font-bold text-slate-900">카테고리</h1>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 좌측 대분류 */}
        <nav
          className="w-[5.25rem] shrink-0 overflow-y-auto border-r border-slate-100 bg-slate-100 sm:w-28"
          aria-label="대분류"
        >
          {categories.map((c) => {
            const on = c.id === activeMainId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveMainId(c.id);
                  onSelectCategory(c.id);
                }}
                className={`w-full px-2 py-3.5 text-center text-[11px] font-bold leading-snug sm:text-xs ${
                  on ? "bg-white text-slate-900 shadow-[inset_3px_0_0_0_#FF853E]" : "text-slate-500 hover:bg-slate-50/80"
                }`}
              >
                {c.short}
              </button>
            );
          })}
        </nav>

        {/* 우측 서브 그리드 */}
        <div className="min-w-0 flex-1 overflow-y-auto bg-white">
          <div className="sticky top-0 z-[1] border-b border-slate-50 bg-white/95 px-4 pb-3 pt-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FF853E] text-[10px] font-bold text-white">
                M
              </span>
              <p className="text-sm font-bold text-slate-900">
                {activeMain.title}
                <span className="text-slate-400"> ›</span>
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="min-h-[2.25rem] flex-1 rounded-xl border border-[#FF853E] bg-[#FFF8F4] py-2 text-[11px] font-bold text-[#FF853E] sm:text-xs"
              >
                신상품 보기
              </button>
              <button
                type="button"
                className="min-h-[2.25rem] flex-1 rounded-xl border border-[#FF853E] bg-white py-2 text-[11px] font-bold text-[#FF853E] sm:text-xs"
              >
                전체 보기
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            {subs.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onClose()}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-50 py-3 ring-1 ring-slate-100 transition hover:bg-[#FFF8F4] hover:ring-[#FFD2BF]"
              >
                <span className="text-2xl" aria-hidden>
                  {s.emoji}
                </span>
                <span className="px-1 text-center text-[10px] font-bold leading-tight text-slate-800 sm:text-[11px]">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
