import PrimaryButton from "../components/common/PrimaryButton";

interface LoginScreenProps {
  onExistingUser: () => void;
  onNewUser: () => void;
}

export default function LoginScreen({
  onExistingUser,
  onNewUser,
}: LoginScreenProps) {
  return (
    <div className="relative w-full py-2">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-sky-100" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-400/35 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-[#FF853E]/20 blur-3xl" />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-3 text-center">
          <img
            src="/app-icon-transparent.png"
            alt="앱 아이콘"
            className="mx-auto mb-7 h-24 w-24 origin-center scale-[1.35] object-contain"
          />
          <h2 className="text-2xl font-bold text-slate-900">로그인</h2>
          <p className="text-sm text-slate-600">
            기존 사용자로 로그인하거나, 처음 사용자로 시작할 수 있어요.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-3">
            <PrimaryButton onClick={onExistingUser}>기존 사용자 로그인</PrimaryButton>
            <button
              type="button"
              onClick={onNewUser}
              className="h-12 w-full rounded-xl border border-[#FF853E] bg-white text-sm font-semibold text-[#FF853E] transition hover:bg-[#FFF1EA]"
            >
              처음 사용자 시작하기
            </button>
          </div>
        </div>

        <div className="space-y-0.5 text-center text-xs leading-snug text-slate-400">
          <p>계속 진행하면 서비스 이용약관 및 개인정보 처리방침에</p>
          <p>동의한 것으로 간주됩니다.</p>
        </div>
      </div>
    </div>
  );
}
