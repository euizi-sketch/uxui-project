/** 회원가입·마이페이지 관심 영역 — 단일 소스 */

/** 선택 가능한 관심 영역 개수 상한 */
export const INTEREST_SELECTION_MAX = 3;

export const INTEREST_CATEGORY_OPTIONS = [
  "언어",
  "놀이",
  "운동",
  "수면",
  "식습관",
  "정서",
  "건강",
  "안전",
  "발달",
  "사회성",
  "학습준비",
  "육아템",
  "부부·가족",
  "아빠육아",
  "독서",
  "예술·음악",
  "자연·야외",
  "스크린·미디어",
  "예방·병원",
  "피부·알레르기",
  "또래·친구",
] as const;

export type InterestCategory = (typeof INTEREST_CATEGORY_OPTIONS)[number];

export function isInterestCategory(value: string): value is InterestCategory {
  return (INTEREST_CATEGORY_OPTIONS as readonly string[]).includes(value);
}
