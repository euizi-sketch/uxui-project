import { useCallback, useEffect, useState } from "react";
import {
  PLAYGROUND_REWARD_UPDATED_EVENT,
  claimPlaygroundBundleReward,
  getPlaygroundStampProgress,
} from "./playgroundStorage";
import { HUB_UPDATED_EVENT } from "../../profile/myPageHubStorage";

export function PlaygroundRewardStrip() {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const onReward = () => refresh();
    const onHub = () => refresh();
    window.addEventListener(PLAYGROUND_REWARD_UPDATED_EVENT, onReward);
    window.addEventListener(HUB_UPDATED_EVENT, onHub);
    return () => {
      window.removeEventListener(PLAYGROUND_REWARD_UPDATED_EVENT, onReward);
      window.removeEventListener(HUB_UPDATED_EVENT, onHub);
    };
  }, [refresh]);

  const { stampCount, needed, canClaimBundle } = getPlaygroundStampProgress();

  const onClaim = () => {
    const res = claimPlaygroundBundleReward();
    if (res.ok) window.alert(res.message);
    else window.alert(res.message);
    refresh();
  };

  const slots = Array.from({ length: needed }, (_, i) => i < stampCount);

  return (
    <div className="mb-4 rounded-[1.35rem] border border-[#FFD2BF]/80 bg-gradient-to-br from-white via-[#FFF8F4] to-[#FFF0E6] px-4 py-4 shadow-[0_8px_28px_-12px_rgba(249,115,22,0.35)] sm:px-5 sm:py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#C2410C]">참여 혜택</p>
          <p className="mt-1 text-sm font-bold leading-snug text-slate-900">
            조건 달성 시에만 스탬프 · {needed}개 모으면{" "}
            <span className="text-[#EA580C]">3천원 할인 쿠폰</span>
          </p>
          <p className="mt-1 text-[11px] font-normal leading-relaxed text-slate-600">
            예: 다수가 고른 투표 보기·인기 후기 수준 글·비교에서 비율이 높은 쪽 표·비슷한 부모 수가 일정 이상·TOP1
            후회 공감 등 — 카드마다 조건이 달라요.
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5 pt-1" aria-label={`스탬프 ${stampCount}/${needed}`}>
          {slots.map((filled, i) => (
            <span
              key={i}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-black shadow-inner ${
                filled
                  ? "bg-[#F97316] text-white shadow-orange-400/40"
                  : "border border-dashed border-orange-200/90 bg-white/70 text-orange-300"
              }`}
              aria-hidden
            >
              {filled ? "✓" : ""}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold tabular-nums text-slate-700">
          진행 <span className="text-[#EA580C]">{stampCount}</span> / {needed}
        </p>
        <button
          type="button"
          onClick={onClaim}
          disabled={!canClaimBundle}
          className="rounded-2xl bg-[#F97316] px-5 py-2.5 text-center text-[13px] font-bold text-white shadow-md shadow-orange-400/35 transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          쿠폰 받기 (3천원)
        </button>
      </div>
    </div>
  );
}
