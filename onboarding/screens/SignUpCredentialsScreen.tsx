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

/** 영문(a–z, A–Z)과 숫자를 모두 포함하고 8자 이상 */
export function isValidSignUpPassword(password: string): boolean {
  if (password.length < 8) return false;
  return /[A-Za-z]/.test(password) && /\d/.test(password);
}

const HANGUL_RE = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;

/** 영문·숫자만 허용, 한글·특수문자·공백 불가 */
export function validateUserId(userId: string): string | undefined {
  const t = userId.trim();
  if (!t) return "아이디를 입력해 주세요.";
  if (HANGUL_RE.test(t)) {
    return "아이디는 영문만 사용할 수 있습니다.";
  }
  if (/[^A-Za-z0-9]/.test(t)) {
    return "아이디에는 특수문자를 사용할 수 없습니다. 영문과 숫자만 입력해 주세요.";
  }
  return undefined;
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

  const userIdError = validateUserId(input.userId);
  if (userIdError) errors.userId = userIdError;
  if (!input.password) {
    errors.password = "비밀번호를 입력해 주세요.";
  } else if (!isValidSignUpPassword(input.password)) {
    errors.password =
      "비밀번호는 영문과 숫자를 포함해 8자 이상으로 입력해 주세요.";
  }
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
      <p className="text-xs text-slate-500">
        영문과 숫자만 사용할 수 있으며, 한글과 특수문자는 사용할 수 없습니다.
      </p>
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
      <p className="text-xs text-slate-500">
        비밀번호는 8자 이상이며 영문과 숫자를 모두 포함해야 합니다.
      </p>
    </div>
  );
}

