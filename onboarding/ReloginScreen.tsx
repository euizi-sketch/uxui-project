import { useState } from "react";
import OnboardingLayout from "./components/layout/OnboardingLayout";
import ExistingUserLogin from "./screens/ExistingUserLogin";
import { loadStoredAccount, verifyLogin } from "../profile/accountCredentialsStorage";
import { markSessionSignedIn } from "../settings/accountActions";

export default function ReloginScreen({ onSuccess }: { onSuccess: () => void }) {
  const storedHint = loadStoredAccount();
  const [userId, setUserId] = useState(() => storedHint?.userId ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const uid = userId.trim();
    const pw = password;
    if (!uid || !pw) return;

    const acc = loadStoredAccount();
    if (acc && !verifyLogin(uid, pw)) {
      setError("아이디 또는 비밀번호가 일치하지 않습니다.");
      return;
    }

    setError("");
    markSessionSignedIn();
    onSuccess();
  };

  return (
    <OnboardingLayout
      title="다시 로그인"
      description="회원 정보와 저장된 로그인 정보는 이 기기에 그대로 있습니다. 같은 아이디로 로그인하면 이전과 동일하게 이용할 수 있어요."
      showStep={false}
      ctaLabel="로그인"
      ctaDisabled={!userId.trim() || !password}
      onCtaClick={handleSubmit}
      containerClassName="bg-transparent px-5 pb-10"
      mainClassName="space-y-0"
    >
      <ExistingUserLogin
        userId={userId}
        password={password}
        error={error}
        onChange={(next) => {
          setError("");
          if (next.userId !== undefined) setUserId(next.userId ?? "");
          if (next.password !== undefined) setPassword(next.password ?? "");
        }}
        onFindId={() =>
          window.alert(
            "데모에서는 이 화면에서 아이디 찾기를 제공하지 않아요. 저장된 계정이 있으면 아이디 입력란에 미리 채워 두었습니다."
          )
        }
        onFindPassword={() =>
          window.alert(
            "비밀번호를 잊었다면 처음 설치했을 때의 회원가입·로그인 플로우에서 비밀번호 찾기를 이용할 수 있어요(데모)."
          )
        }
      />
    </OnboardingLayout>
  );
}
