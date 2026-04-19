/**
 * 브라우저 로컬 데모용 계정 저장 (실서비스에서는 서버 API로 대체)
 */
const ACCOUNT_KEY = "momoA.accountCredentials";
const PHONE_KEY = "momoA.phone";

export type StoredAccount = {
  userId: string;
  password: string;
  /** 아이디/비밀번호 찾기 시 입력하는 이름과 비교 (가입 시 닉네임) */
  name: string;
  /** 숫자만, 예: 01012345678 */
  phone: string;
};

export function normalizePhoneDigits(phone1: string, phone2: string, phone3: string): string {
  return `${phone1}${phone2}${phone3}`.replace(/\D/g, "");
}

export function saveStoredAccount(acc: StoredAccount): void {
  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(acc));
    if (acc.phone) localStorage.setItem(PHONE_KEY, acc.phone);
  } catch {
    /* ignore */
  }
}

export function loadStoredAccount(): StoredAccount | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<StoredAccount>;
    if (
      typeof o.userId !== "string" ||
      typeof o.password !== "string" ||
      typeof o.name !== "string" ||
      typeof o.phone !== "string"
    ) {
      return null;
    }
    return {
      userId: o.userId,
      password: o.password,
      name: o.name,
      phone: o.phone.replace(/\D/g, ""),
    };
  } catch {
    return null;
  }
}

export function updateStoredPassword(newPassword: string): void {
  const acc = loadStoredAccount();
  if (!acc) return;
  saveStoredAccount({ ...acc, password: newPassword });
}

/** 이름(닉네임)·휴대폰이 저장된 정보와 일치하면 아이디 반환 */
export function tryFindUserId(name: string, phoneDigits: string): string | null {
  const acc = loadStoredAccount();
  if (!acc || !name.trim() || phoneDigits.length < 10) return null;
  if (acc.phone !== phoneDigits) return null;
  if (acc.name.trim().toLowerCase() !== name.trim().toLowerCase()) return null;
  return acc.userId;
}

export function canResetPassword(
  userId: string,
  name: string,
  phoneDigits: string
): boolean {
  const acc = loadStoredAccount();
  if (!acc) return false;
  return (
    acc.userId.trim() === userId.trim() &&
    acc.name.trim().toLowerCase() === name.trim().toLowerCase() &&
    acc.phone === phoneDigits
  );
}

export function verifyLogin(userId: string, password: string): boolean {
  const acc = loadStoredAccount();
  if (!acc) return false;
  return acc.userId === userId.trim() && acc.password === password;
}

/** 로그아웃 — 아이디·비밀번호 저장만 제거 (프로필·휴대폰 등 다른 로컬 키는 건드리지 않음) */
export function clearStoredAccount(): void {
  try {
    localStorage.removeItem(ACCOUNT_KEY);
  } catch {
    /* ignore */
  }
}
