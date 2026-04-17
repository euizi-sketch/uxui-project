import { useMemo, useState } from "react";
import InputField from "../components/common/InputField";

interface ResetPasswordScreenProps {
  newPassword: string;
  newPasswordConfirm: string;
  onChange: (next: { newPassword?: string; newPasswordConfirm?: string }) => void;
}

export function validateResetPassword(input: {
  newPassword: string;
  newPasswordConfirm: string;
}) {
  const errors: { newPassword?: string; newPasswordConfirm?: string } = {};
  if (!input.newPassword) errors.newPassword = "새 비밀번호를 입력해 주세요.";
  if (!input.newPasswordConfirm)
    errors.newPasswordConfirm = "새 비밀번호를 다시 입력해 주세요.";
  else if (input.newPasswordConfirm !== input.newPassword)
    errors.newPasswordConfirm = "비밀번호가 일치하지 않습니다.";
  return errors;
}

export default function ResetPasswordScreen({
  newPassword,
  newPasswordConfirm,
  onChange,
}: ResetPasswordScreenProps) {
  const [touched, setTouched] = useState({ p1: false, p2: false });

  const errors = useMemo(() => {
    const raw = validateResetPassword({ newPassword, newPasswordConfirm });
    return {
      newPassword: touched.p1 ? raw.newPassword : undefined,
      newPasswordConfirm: touched.p2 ? raw.newPasswordConfirm : undefined,
    };
  }, [newPassword, newPasswordConfirm, touched.p1, touched.p2]);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <InputField
        label="새 비밀번호"
        type="password"
        value={newPassword}
        onBlur={() => setTouched((t) => ({ ...t, p1: true }))}
        onChange={(e) => onChange({ newPassword: e.target.value })}
        error={errors.newPassword}
        autoComplete="new-password"
      />
      <InputField
        label="새 비밀번호 확인"
        type="password"
        value={newPasswordConfirm}
        onBlur={() => setTouched((t) => ({ ...t, p2: true }))}
        onChange={(e) => onChange({ newPasswordConfirm: e.target.value })}
        error={errors.newPasswordConfirm}
        autoComplete="new-password"
      />
      <p className="text-xs text-slate-500">
        비밀번호는 8자 이상, 영문/숫자 조합을 권장합니다.
      </p>
    </div>
  );
}

