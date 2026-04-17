import React, { useState } from "react";
import type { EventItem } from "./eventCarouselData";

type Props = {
  event: EventItem;
  onOpenPlayground: (event: EventItem) => void;
};

export function EventCard({ event, onOpenPlayground }: Props) {
  const [pollChoice, setPollChoice] = useState<string | null>(null);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    onOpenPlayground(event);
  };

  const participantsClass = event.popular
    ? "font-extrabold text-[#FF853E]"
    : "font-bold text-slate-600";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenPlayground(event);
        }
      }}
      className="group relative flex h-full min-h-[280px] w-full cursor-pointer flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_8px_30px_-8px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/80 transition duration-300 ease-out hover:shadow-[0_12px_36px_-10px_rgba(255,133,62,0.18)] md:hover:scale-[1.02] md:active:scale-[0.99]"
    >
      {event.hot && (
        <span className="absolute right-4 top-4 z-10 rounded-full bg-[#FF853E] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
          HOT
        </span>
      )}

      <div className="flex items-center justify-between gap-3 bg-[#FFF8F4] px-5 pb-3 pt-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm ring-1 ring-slate-100">
          {event.accent}
        </div>
        {event.topBadge && event.variant !== "regret" && (
          <span className="max-w-[60%] rounded-full bg-[#FFF1EA] px-3 py-1.5 text-center text-[10px] font-extrabold leading-tight text-[#FF853E] ring-1 ring-[#FFD2BF]">
            {event.topBadge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-1">
        <h3 className="line-clamp-3 text-lg font-extrabold leading-snug tracking-tight text-slate-900">{event.title}</h3>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600 line-clamp-4">{event.description}</p>

        {event.variant === "poll" && event.pollOptions && (
          <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            {event.pollOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setPollChoice(opt)}
                className={`rounded-full px-3 py-2 text-xs font-extrabold transition ring-1 ${
                  pollChoice === opt
                    ? "bg-[#FF853E] text-white ring-[#FF853E]"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-[#FFF8F4] hover:ring-[#FFD2BF]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {event.variant === "compare" &&
          event.compareRegretPct != null &&
          event.compareHappyPct != null && (
            <div className="mt-4 flex gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <div className="flex-1 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">후회</p>
                <p className="mt-1 text-xl font-extrabold text-rose-500">{event.compareRegretPct}%</p>
              </div>
              <div className="w-px self-stretch bg-slate-200" />
              <div className="flex-1 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">만족</p>
                <p className="mt-1 text-xl font-extrabold text-emerald-600">{event.compareHappyPct}%</p>
              </div>
            </div>
          )}

        {event.variant === "parents" && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3">
            <span className="text-2xl" aria-hidden="true">
              ✏️
            </span>
            <p className="text-xs font-semibold text-slate-500">월령·고민을 입력하면 비슷한 부모 수를 알려드려요</p>
          </div>
        )}

        {event.variant === "test" && (
          <div className="mt-4 flex justify-center gap-1.5 rounded-2xl bg-[#FFF8F4] py-4 ring-1 ring-[#FFD2BF]/60">
            {["A", "B", "C", "?"].map((c, i) => (
              <span
                key={c}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-[#FF853E] shadow-sm ring-1 ring-slate-100"
                style={{ transform: `translateY(${i % 2 === 0 ? 0 : 4}px)` }}
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {event.variant === "regret" && event.topBadge && (
          <div className="mt-4 flex justify-center">
            <span className="rounded-2xl bg-slate-900 px-6 py-2 text-sm font-extrabold tracking-widest text-white shadow-md">
              {event.topBadge}
            </span>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-5">
          <p className={`text-xs ${participantsClass}`}>
            <span className="inline-flex items-center gap-1">
              <span className="text-slate-400">👥</span>
              {event.participants.toLocaleString()}명 참여
            </span>
            {event.popular && (
              <span className="ml-2 text-[10px] font-extrabold text-[#FF853E]">· 지금 뜨는 참여</span>
            )}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPlayground(event);
            }}
            className="w-full rounded-2xl bg-[#FF853E] py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#FF6F1F] active:scale-[0.98]"
          >
            {event.ctaLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
