/** 브라우저에 저장된 모모아 관련 로컬 데이터 삭제 */
export function clearAllMomoLocalKeys(): number {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith("momoA.")) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
  return keys.length;
}

/** 온보딩(회원가입 플로우) 완료 여부 — 앱 최초 진입 시 메인 탭 표시용 */
export const ONBOARDING_COMPLETED_KEY = "momoA.onboardingCompleted";

export function markOnboardingCompleted(): void {
  try {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "1";
  } catch {
    return false;
  }
}

/** 로그아웃 상태 — 회원 정보·저장 로그인 정보는 두고 세션만 끊음 */
export const SESSION_SIGNED_OUT_KEY = "momoA.sessionSignedOut";

export function isSessionSignedOut(): boolean {
  try {
    return localStorage.getItem(SESSION_SIGNED_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSessionSignedOut(): void {
  try {
    localStorage.setItem(SESSION_SIGNED_OUT_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function markSessionSignedIn(): void {
  try {
    localStorage.removeItem(SESSION_SIGNED_OUT_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * 로그아웃 — 저장된 아이디·비밀번호·프로필 등은 유지하고 로그인 세션만 종료합니다.
 * 동일 계정으로 다시 로그인하면 그대로 복구됩니다.
 */
export function logoutLocalSession(): void {
  markSessionSignedOut();
}

/**
 * 회원 탈퇴 등 — 이 기기의 모모아 로컬 데이터 전부 삭제.
 */
export function endLocalSession(): number {
  return clearAllMomoLocalKeys();
}

/** 삭제 대상 안내용 — 회원 탈퇴 등 전체 삭제 시 (UI 불릿) */
export const LOCAL_DATA_CATEGORIES: { title: string; detail: string }[] = [
  { title: "계정·로그인", detail: "저장된 아이디·비밀번호, 로그인 상태" },
  { title: "프로필·가족", detail: "닉네임, 아이 정보, 관심사, 프로필 이미지 등" },
  { title: "활동 기록", detail: "주문·예약·문의·리뷰·쿠폰·포인트·스크랩·장바구니 등" },
  { title: "앱 설정", detail: "알림 설정, 인앱 알림함, 상담·플레이그라운드 저장 데이터 등" },
];

/** 로그아웃 후에도 유지되는 기기 데이터 안내용 */
export const DEVICE_DATA_RETAINED_AFTER_LOGOUT: { title: string; detail: string }[] = [
  { title: "저장된 로그인 정보", detail: "이 기기에 보관된 아이디·비밀번호(데모 로컬 계정)" },
  { title: "프로필·가족", detail: "닉네임, 아이 정보, 관심사, 프로필 이미지 등" },
  { title: "활동·쇼핑", detail: "주문·예약·문의·리뷰·쿠폰·포인트·스크랩·장바구니 등" },
  { title: "앱 설정", detail: "알림 설정, 인앱 알림함 등" },
];
