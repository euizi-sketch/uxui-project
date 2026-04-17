import type { CartLine } from "./cartTypes";

const KEY = "momoA.cartLines";

function normalizeLine(raw: unknown): CartLine | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const productId = Number(o.productId);
  const quantity = Number(o.quantity);
  const unitWon = Number(o.unitWon);
  if (!Number.isFinite(productId) || !Number.isFinite(quantity) || quantity < 1) return null;
  if (!Number.isFinite(unitWon) || unitWon < 0) return null;
  const name = typeof o.name === "string" ? o.name : "";
  const imageUrl = typeof o.imageUrl === "string" ? o.imageUrl : "";
  const priceLabel = typeof o.priceLabel === "string" ? o.priceLabel : "";
  const selected = o.selected === false ? false : true;
  return { productId, name, imageUrl, priceLabel, unitWon, quantity, selected };
}

export function loadCartLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeLine).filter(Boolean) as CartLine[];
  } catch {
    return [];
  }
}

export function saveCartLines(lines: CartLine[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* ignore */
  }
}
