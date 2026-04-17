import type { GearCategoryItem } from "./gearCategoryTypes";

export type { GearCategoryItem };

type Props = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  /** 햄버거 → 전체 화면 카테고리 패널 */
  onOpenCategoryPanel: () => void;
  searchPlaceholder?: string;
};

export function GearTopSearchRow({
  searchTerm,
  onSearchChange,
  onOpenCategoryPanel,
  searchPlaceholder = "18개월 아이에게 좋은 이유식?",
}: Props) {
  return (
    <div className="flex w-full items-center gap-2.5 bg-[#FF853E] px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5">
      <button
        type="button"
        onClick={onOpenCategoryPanel}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-md shadow-orange-900/10 ring-1 ring-white/90 transition active:scale-[0.98]"
        aria-label="카테고리 열기"
      >
        <span className="flex w-5 flex-col gap-[5px]" aria-hidden>
          <span className="h-0.5 rounded-full bg-slate-600" />
          <span className="h-0.5 rounded-full bg-slate-600" />
          <span className="h-0.5 rounded-full bg-slate-600" />
        </span>
      </button>

      <label className="relative flex min-w-0 flex-1 items-center rounded-full bg-white/95 py-2.5 pl-4 pr-10 shadow-inner shadow-white/20 ring-1 ring-white/70">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full min-w-0 border-0 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          enterKeyHint="search"
          autoComplete="off"
        />
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M20 20l-3.2-3.2" />
          </svg>
        </span>
      </label>
    </div>
  );
}
