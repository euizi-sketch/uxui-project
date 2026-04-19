export default function SignupCompleteScreen() {
  return (
    <div className="space-y-5">
      <div className="space-y-3 pt-1 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FF853E] text-2xl text-white shadow-md shadow-orange-300/40 ring-4 ring-[#FFD6C2]/60">
          ✓
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          오늘부터 저희와 함께해요.
          <br />
          부담 없이 둘러보시고, 필요할 때 언제든 찾아와 주세요.
        </p>
      </div>

      <div className="rounded-2xl bg-[#FFF1EA] px-4 py-3.5 text-center text-sm leading-relaxed text-[#9A3412]">
        <span className="font-bold text-[#F97316]">TIP</span>
        <span className="mx-1 text-slate-400">·</span>
        마이페이지에서 웰컴 선물과 쿠폰함을 살짝 열어보세요!
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-[#FFD6C2] bg-[#FFF6F1]">
          <div className="flex items-center justify-between gap-4 p-5">
            <div className="text-left">
              <p className="text-lg font-bold text-[#FF853E]">
                웰컴 포인트 2,000P
              </p>
              <p className="mt-1 text-sm font-medium text-[#F97316]/90">
                벌써 적립해 두었어요
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-3xl">
              🪙
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-sky-200 bg-sky-50">
          <div className="flex items-center justify-between gap-4 p-5">
            <div className="text-left">
              <p className="text-lg font-bold text-sky-900">
                웰컴 쿠폰 선물
              </p>
              <p className="mt-1 text-sm font-medium text-sky-700">
                쿠폰함에서 펼쳐보세요
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-3xl">
              🎁
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
