import { parseBirthDate } from "../components/home/homeHeroBandImage";
import type { IncomeBracket } from "../onboarding/types";
import { loadMyPageProfileFromStorage } from "../profile/momoProfileStorage";

const INCOME_LABEL: Record<Exclude<IncomeBracket, "">, string> = {
  lt400: "중위소득 400% 미만 구간",
  "400to700": "400~700% 구간",
  "700to1000": "700~1,000% 구간",
  gte1000: "1,000% 이상 구간",
};

function ageInMonthsFromBirthDate(birth: Date): number {
  const now = new Date();
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

const STAGE_KO: Record<string, string> = {
  infant: "영아기",
  toddler: "유아기",
  preschooler: "아동기",
};

/** 상담 시스템 프롬프트용 짧은 프로필 맥락 */
export function getConsultationProfileHint(): string {
  const p = loadMyPageProfileFromStorage();
  const parts: string[] = [];
  if (p.nickname.trim()) parts.push(`보호자 닉네임 ${p.nickname.trim()}`);
  const bd = parseBirthDate(p.birthDate || "");
  if (bd) {
    parts.push(`첫째 월령 약 ${ageInMonthsFromBirthDate(bd)}개월`);
  }
  if (p.developmentStage && STAGE_KO[p.developmentStage]) {
    parts.push(STAGE_KO[p.developmentStage]);
  }
  if (p.incomeBracket && INCOME_LABEL[p.incomeBracket as Exclude<IncomeBracket, "">]) {
    parts.push(`가구 소득 ${INCOME_LABEL[p.incomeBracket as Exclude<IncomeBracket, "">]}`);
  }
  if (p.interests?.length) parts.push(`관심사 ${p.interests.slice(0, 3).join("·")}`);
  return parts.length > 0 ? parts.join(" · ") : "프로필 정보가 적음 — 일반 시나리오 기준으로 안내합니다.";
}
