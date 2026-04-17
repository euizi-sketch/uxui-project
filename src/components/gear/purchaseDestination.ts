/** 외부 구매·인스타 등 연결 대상 표시용 — 상세 배지와 썸네일 칩에서 동일 규칙 사용 */

export type PurchaseLinkFields = {
  purchaseUrl?: string;
  instagramUrl?: string;
  externalPlatform?: string;
};

export type PurchaseDestinationKind = "instagram" | "coupang" | "naver" | "generic";

export function getPurchaseDestinationInfo(
  p: PurchaseLinkFields
): { kind: PurchaseDestinationKind; headline: string } | null {
  const igOnly = Boolean(p.instagramUrl && !p.purchaseUrl);
  const url = p.purchaseUrl ?? "";
  if (!url && !igOnly) return null;

  if (igOnly) return { kind: "instagram", headline: "Instagram" };
  if (url.includes("coupang.com")) return { kind: "coupang", headline: "쿠팡" };
  if (url.includes("brand.naver.com") || p.externalPlatform?.includes("네이버")) {
    return { kind: "naver", headline: "네이버 브랜드스토어" };
  }
  return { kind: "generic", headline: p.externalPlatform?.trim() || "외부 사이트" };
}

export function getPurchaseDestinationHeadline(p: PurchaseLinkFields): string | null {
  return getPurchaseDestinationInfo(p)?.headline ?? null;
}
