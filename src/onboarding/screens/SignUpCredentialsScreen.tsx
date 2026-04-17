import { useMemo, useState } from "react";
import InputField from "../components/common/InputField";

interface SignUpCredentialsScreenProps {
  userId: string;
  password: string;
  passwordConfirm: string;
  onChange: (next: {
    userId?: string;
    password?: string;
    passwordConfirm?: string;
  }) => void;
}

export function validateSignUpCredentials(input: {
  userId: string;
  password: string;
  passwordConfirm: string;
}) {
  const errors: {
    userId?: string;
    password?: string;
    passwordConfirm?: string;
  } = {};

  if (!input.userId.trim()) errors.userId = "아이디를 입력해 주세요.";
  if (!input.password) errors.password = "비밀번호를 입력해 주세요.";
  if (!input.passwordConfirm) {
    errors.passwordConfirm = "비밀번호를 다시 입력해 주세요.";
  } else if (input.passwordConfirm !== input.password) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
  }

  return errors;
}

export default function SignUpCredentialsScreen({
  userId,
  password,
  passwordConfirm,
  onChange,
}: SignUpCredentialsScreenProps) {
  const [touched, setTouched] = useState({
    userId: false,
    password: false,
    passwordConfirm: false,
  });

  const errors = useMemo(() => {
    const raw = validateSignUpCredentials({ userId, password, passwordConfirm });
    return {
      userId: touched.userId ? raw.userId : undefined,
      password: touched.password ? raw.password : undefined,
      passwordConfirm: touched.passwordConfirm ? raw.passwordConfirm : undefined,
    };
  }, [
    password,
    passwordConfirm,
    touched.password,
    touched.passwordConfirm,
    touched.userId,
    userId,
  ]);

  return (
    <div className="space-y-4">
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
        autoComplete="new-password"
      />
      <InputField
        label="비밀번호 확인"
        type="password"
        value={passwordConfirm}
        onBlur={() => setTouched((t) => ({ ...t, passwordConfirm: true }))}
        onChange={(e) => onChange({ passwordConfirm: e.target.value })}
        error={errors.passwordConfirm}
        autoComplete="new-password"
      />
    </div>
  );
}

