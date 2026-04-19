const SESSION_KEY = "momoA.smsVerificationSession";

type Session = { code: string; expiresAt: number };

export function startSmsVerification(): { code: string; expiresAt: number } {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + 3 * 60 * 1000;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ code, expiresAt }));
  } catch {
    /* ignore */
  }
  return { code, expiresAt };
}

export function peekSmsVerification(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (typeof s?.code !== "string" || typeof s?.expiresAt !== "number") return null;
    if (Date.now() > s.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

/** 입력한 코드가 현재 세션과 일치하면 세션 삭제 후 true */
export function verifySmsCode(input: string): boolean {
  const s = peekSmsVerification();
  if (!s) return false;
  if (input.trim() !== s.code) return false;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  return true;
}

export function clearSmsVerification(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
