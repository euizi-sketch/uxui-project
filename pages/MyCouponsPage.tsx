import { useMemo, useState } from "react";
import {
  loadCoupons,
  markCouponUsed,
  registerCouponCode,
} from "../profile/myPageHubStorage";

export default function MyCouponsPage({ onBack }: { onBack: () => void }) {
  const [tick, setTick] = useState(0);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const coupons = useMemo(() => loadCoupons(), [tick]);

  const unused = coupons.filter((c) => !c.used && c.expiresAt > Date.now());
  const expired = coupons.filter((c) => !c.used && c.expiresAt <= Date.now());
  const used = coupons.filter((c) => c.used);

  const tryRegister = () => {
    const r = registerCouponCode(code);
    setMsg(r.message);
    if (r.ok) {
      setCode("");
      setTick((t) => t + 1);
    }
  };

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
          <h1 className="flex-1 text-center text-base font-bold tracking-tight">쿠폰함</h1>
          <span className="w-10" />
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 pt-4">
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="쿠폰 코드 입력"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#FF853E]"
          />
          <button
            type="button"
            onClick={tryRegister}
            className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
          >
            등록
          </button>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">예시 코드: MOMOA2026, WELCOME</p>
        {msg ? <p className="mt-2 text-sm font-medium text-slate-700">{msg}</p> : null}

        <p className="mt-6 text-xs font-bold uppercase tracking-wide text-slate-400">사용 가능</p>
        <ul className="mt-2 space-y-2">
          {unused.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-2 rounded-2xl border border-orange-100 bg-[#FFF8F4] p-4 ring-1 ring-orange-100"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{c.title}</p>
                <span className="text-sm font-black text-[#FF853E]">
                  {c.discountWon.toLocaleString()}원
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {c.minOrderWon > 0 ? `${c.minOrderWon.toLocaleString()}원 이상 구매 시` : "조건 없음"} ·{" "}
                {new Date(c.expiresAt).toLocaleDateString("ko-KR")}까지
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("이 쿠폰을 사용 처리할까요? (데모: 결제 연동 전)")) {
                    markCouponUsed(c.id);
                    setTick((t) => t + 1);
                  }
                }}
                className="rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-800 hover:bg-slate-50"
              >
                사용하기
              </button>
            </li>
          ))}
        </ul>
        {unused.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">사용 가능한 쿠폰이 없어요.</p>
        ) : null}

        {expired.length > 0 ? (
          <>
            <p className="mt-8 text-xs font-bold uppercase tracking-wide text-slate-400">만료</p>
            <ul className="mt-2 space-y-2 opacity-60">
              {expired.map((c) => (
                <li key={c.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  {c.title}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {used.length > 0 ? (
          <>
            <p className="mt-8 text-xs font-bold uppercase tracking-wide text-slate-400">사용 완료</p>
            <ul className="mt-2 space-y-2 opacity-70">
              {used.map((c) => (
                <li key={c.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  {c.title}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </main>
    </div>
  );
}
