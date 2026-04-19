import { useMemo, useState } from "react";
import { loadPlaygroundReviews } from "../components/events/playgroundStorage";

export default function MyWrittenReviewsPage({ onBack }: { onBack: () => void }) {
  const [tick, setTick] = useState(0);
  const list = useMemo(() => loadPlaygroundReviews(), [tick]);

  return (
    <div className="min-h-dvh bg-white pb-safe-tab text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
        <div className="relative flex h-14 items-center px-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
            aria-label="뒤로가기"
          >
            ←
          </button>
          <h1 className="flex-1 text-center text-base font-bold tracking-tight">작성한 리뷰</h1>
          <span className="w-10" />
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 pt-4">
        <p className="text-sm font-normal text-slate-600">
          플레이그라운드에서 남긴 리얼 후기가 여기 모여요.
        </p>
        {list.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-slate-50 px-4 py-12 text-center ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-700">아직 작성한 리뷰가 없어요</p>
            <p className="mt-2 text-xs text-slate-500">홈 → 플레이그라운드에서 후기를 남겨 보세요.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {list.map((r) => (
              <li key={r.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">{r.productName}</p>
                  <span className="shrink-0 text-xs font-bold text-[#FF853E]">★ {r.rating}</span>
                </div>
                <p className="mt-2 line-clamp-4 text-sm font-normal text-slate-700">{r.body}</p>
                {r.photoUrl ? (
                  <img
                    src={r.photoUrl}
                    alt=""
                    className="mt-3 max-h-40 w-full rounded-xl object-cover"
                  />
                ) : null}
                <p className="mt-2 text-[11px] text-slate-400">
                  {new Date(r.createdAt).toLocaleString("ko-KR")}
                </p>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => setTick((x) => x + 1)}
          className="mt-6 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          새로고침
        </button>
      </main>
    </div>
  );
}
