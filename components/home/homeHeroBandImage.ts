/** 홈 오렌지 밴드: 발달 단계·성별 등 히어로 관련 유틸 */

/** 주황 히어로 박스 배경 (단색, HomeHeroStrip 외곽과 동일 톤) */
export const HERO_STRIP_BASE_SOLID_CLASS = "bg-[#FF853E]";

export type HeroBand = "infant" | "toddler" | "preschool";

export function parseBirthDate(raw: string): Date | null {
  const t = raw.trim();
  const m = t.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  const dt = new Date(y, mo - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

/** 출생일 기준 만 개월수(대략) — 홈 프로필·히어로 등에서 공통 사용 */
export function ageInMonthsFromBirth(birth: Date): number {
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

/**
 * 홈 히어로 구간: 마이페이지에서 고른 발달 단계를 우선하고, 비어 있을 때만 생일 월령으로 추정.
 * (생일만 보고 유아로 잡히면 영아 일러스트가 안 뜨는 문제 방지)
 */
export function resolveHeroBand(birthDate: string, developmentStage: string): HeroBand {
  const stage = developmentStage.trim();
  if (stage === "infant" || stage === "toddler" || stage === "preschooler") {
    if (stage === "infant") return "infant";
    if (stage === "toddler") return "toddler";
    return "preschool";
  }

  const parsed = parseBirthDate(birthDate);
  if (parsed) {
    const m = ageInMonthsFromBirth(parsed);
    if (m < 12) return "infant";
    if (m < 48) return "toddler";
    return "preschool";
  }
  return "infant";
}

/** 홈 히어로 측면 일러스트 URL. 빈 문자열이면 이미지 없음. (영아 남아/여아 PNG는 사용하지 않음) */
export function heroBandImageSrc(_band: HeroBand, _gender: string): string {
  return "";
}
