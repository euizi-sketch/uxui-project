import { useMemo, useState } from "react";
import InputField from "../components/common/InputField";

interface ExistingUserLoginProps {
  userId: string;
  password: string;
  error?: string;
  onChange: (next: { userId?: string; password?: string }) => void;
  onFindId: () => void;
  onFindPassword: () => void;
}

export default function ExistingUserLogin({
  userId,
  password,
  error,
  onChange,
  onFindId,
  onFindPassword,
}: ExistingUserLoginProps) {
  const [touched, setTouched] = useState({ userId: false, password: false });

  const errors = useMemo(() => {
    return {
      userId:
        touched.userId && !userId.trim() ? "아이디를 입력해 주세요." : undefined,
      password:
        touched.password && !password ? "비밀번호를 입력해 주세요." : undefined,
    };
  }, [password, touched.password, touched.userId, userId]);

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </p>
      ) : null}
      <InputField
        label="아이디"
        value={userId}
        onBlur={() => setTouched((t) => ({ ...t, userId: true }))}
        onChange={(e) => onChange({ userId: e.target.value })}
        error={errors.userId}
        autoComplete="username"
      />
      <InputField
        label="비밀번호"
        type="password"
        value={password}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        onChange={(e) => onChange({ password: e.target.value })}
        error={errors.password}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-end gap-3 text-xs">
        <button
          type="button"
          onClick={onFindId}
          className="font-medium text-slate-500 hover:text-slate-700"
        >
          아이디 찾기
        </button>
        <span className="text-slate-300">|</span>
        <button
          type="button"
          onClick={onFindPassword}
          className="font-semibold text-[#FF853E] hover:text-[#FF6F1F]"
        >
          비밀번호 찾기
        </button>
      </div>
    </div>
  );
}

