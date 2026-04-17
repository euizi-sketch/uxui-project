import type { IncomeBracket } from "../onboarding/types";

export function normalizeIncomeBracket(raw: string | null | undefined): IncomeBracket {
  const v = raw ?? "";
  if (v === "lt400" || v === "400to700" || v === "700to1000" || v === "gte1000") return v;
  return "";
}

/** 가격 문자열 → 원화 숫자 (비교·가중치용) */
export function parseGearPriceToWon(priceLabel: string): number {
  const n = Number(String(priceLabel).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * 소득 구간별 가격 선호를 점수에 곱하는 배율로 반영 (상대적으로 저가·고가 순위 변동).
 * 만원 미만 구간은 저가 우선, 고소득은 고가 제품 가중.
 */
export function incomeScoreMultiplier(won: number, bracket: IncomeBracket): number {
  if (!bracket) return 1;
  const t = Math.min(1, won / 200000);
  switch (bracket) {
    case "lt400":
      return 1 + (1 - t) * 0.14;
    case "400to700":
      return 1 + (1 - t) * 0.06;
    case "700to1000":
      return 1 + t * 0.08;
    case "gte1000":
      return 1 + t * 0.15;
    default:
      return 1;
  }
}

/** 상담 결과 풀 등 단순 점수 정렬용 */
export function compareGearProductsByIncomeScore(
  a: { score: number; price: string },
  b: { score: number; price: string },
  bracket: IncomeBracket
): number {
  const sa = a.score * incomeScoreMultiplier(parseGearPriceToWon(a.price), bracket);
  const sb = b.score * incomeScoreMultiplier(parseGearPriceToWon(b.price), bracket);
  return sb - sa;
}
