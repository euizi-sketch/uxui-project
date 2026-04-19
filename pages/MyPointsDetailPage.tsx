import { useEffect, useMemo, useState } from "react";
import {
  loadPointLedger,
  loadWalletPoints,
  WALLET_UPDATED_EVENT,
} from "../components/events/playgroundStorage";

export default function MyPointsDetailPage({ onBack }: { onBack: () => void }) {
  const [tick, setTick] = useState(0);
  const balance = useMemo(() => loadWalletPoints(), [tick]);
  const ledger = useMemo(() => loadPointLedger(), [tick]);

  useEffect(() => {
    const fn = () => setTick((x) => x + 1);
    window.addEventListener(WALLET_UPDATED_EVENT, fn);
    return () => window.removeEventListener(WALLET_UPDATED_EVENT, fn);
  }, []);

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
          <h1 className="flex-1 text-center text-base font-bold tracking-tight">포인트</h1>
          <button
            type="button"
            onClick={() => setTick((x) => x + 1)}
            className="w-10 text-xs font-semibold text-[#FF853E]"
          >
            새로고침
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 pt-5">
        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-white px-5 py-6 ring-1 ring-orange-100">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">보유 포인트</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-[#EA580C]">
            {balance.toLocaleString()}P
          </p>
          <p className="mt-2 text-xs font-normal text-slate-500">
            플레이그라운드 후기 등 활동 시 적립돼요. 이 기기에 저장됩니다.
          </p>
        </div>

        <p className="mt-8 text-xs font-bold uppercase tracking-wide text-slate-400">적립·사용 내역</p>
        <ul className="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
          {ledger.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-slate-500">내역이 없어요.</li>
          ) : (
            ledger.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{e.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {new Date(e.createdAt).toLocaleString("ko-KR")} · 잔액 {e.balanceAfter.toLocaleString()}P
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-bold tabular-nums ${
                    e.delta >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {e.delta >= 0 ? "+" : ""}
                  {e.delta.toLocaleString()}P
                </span>
              </li>
            ))
          )}
        </ul>
      </main>
    </div>
  );
}
