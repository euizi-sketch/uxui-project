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
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
        기존 사용자는 로그인 후 바로 홈으로 이동하고, 신규 사용자는 온보딩을
        진행합니다.
      </div>
      <PrimaryButton onClick={onExistingUser}>기존 사용자 로그인</PrimaryButton>
      <button
        type="button"
        onClick={onNewUser}
        className="h-12 w-full rounded-xl border border-violet-300 text-sm font-semibold text-violet-700"
      >
        처음 사용자 시작하기
      </button>
    </div>
  );
}
