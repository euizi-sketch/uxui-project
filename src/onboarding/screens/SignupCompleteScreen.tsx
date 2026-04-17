export default function SignupCompleteScreen() {
  return (
    <div className="space-y-5">
      <div className="space-y-3 pt-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FF853E] text-2xl text-white">
          ✓
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">회원가입 완료!</h2>
        <p className="text-sm text-slate-600">
          가족이 된 것을 환영해요 :)
          <br />
          마이페이지에서 쿠폰함을 확인하세요!
        </p>
      </div>

      <div className="rounded-2xl bg-[#FFF1EA] px-4 py-3 text-center text-sm font-semibold text-[#FF853E]">
        마이페이지에서 쿠폰함을 확인하세요!
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-[#FFD6C2] bg-[#FFF6F1]">
          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-lg font-extrabold text-[#FF853E]">
                신규 가입 2,000p
              </p>
              <p className="mt-1 text-sm font-semibold text-[#FF9A62]">
                지급 완료!
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 text-3xl">
              🪙
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#A1D0DF] bg-[#EEF7FA]">
          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-lg font-extrabold text-[#2C6F87]">
                신규 가입 쿠폰 선물
              </p>
              <p className="mt-1 text-sm font-semibold text-[#4B8EA6]">
                지급 완료!
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 text-3xl">
              🎁
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

