export type ScrapItem = {
  productId: number;
  savedAt: number;
};

export const SCRAP_STORAGE_KEY = "momoA.scraps";
export const SCRAPS_UPDATED_EVENT = "momoA-scraps-updated";

/** 만료 후 로컬에서 제거되는 기간 (일) */
export const SCRAP_TTL_DAYS = 30;
export const SCRAP_TTL_MS = SCRAP_TTL_DAYS * 24 * 60 * 60 * 1000;

export function loadScraps(): ScrapItem[] {
  try {
    const raw = localStorage.getItem(SCRAP_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => {
        const obj = x as Partial<ScrapItem>;
        if (typeof obj.productId !== "number") return null;
        if (typeof obj.savedAt !== "number") return null;
        return { productId: obj.productId, savedAt: obj.savedAt };
      })
      .filter(Boolean) as ScrapItem[];
  } catch {
    return [];
  }
}

export function cleanupScraps(scraps: ScrapItem[], now = Date.now()): ScrapItem[] {
  return scraps.filter((s) => now - s.savedAt <= SCRAP_TTL_MS);
}

/** 만료분 제거 후 저장까지 한 번에 (히어로 카운트 등) */
export function loadScrapsCleanedPersist(): ScrapItem[] {
  const raw = loadScraps();
  const cleaned = cleanupScraps(raw);
  if (cleaned.length !== raw.length) {
    saveScraps(cleaned);
  }
  return cleaned;
}

export function saveScraps(next: ScrapItem[]): void {
  try {
    localStorage.setItem(SCRAP_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(SCRAPS_UPDATED_EVENT));
}
