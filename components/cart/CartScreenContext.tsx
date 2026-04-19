import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { parseGearPriceToWon } from "../../profile/gearIncomeRecommendation";
import type { Coupon } from "../../profile/myPageHubStorage";
import { loadCoupons, markCouponUsed } from "../../profile/myPageHubStorage";
import type { CartLine, CartProductInput } from "./cartTypes";
import { loadCartLines, saveCartLines } from "./cartPersistence";
import ShoppingCartScreen from "./ShoppingCartScreen";
import CheckoutScreen from "./CheckoutScreen";

type Overlay = "cart" | "checkout";

export type AppliedCheckoutCoupon = { id: string; discountWon: number };

type CartScreenContextValue = {
  lines: CartLine[];
  /** 담긴 총 수량(배지) */
  itemCount: number;
  /** 주문에 포함될 선택 품목 수량 */
  totalQuantity: number;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: CartProductInput) => void;
  setLineQuantity: (productId: number, quantity: number) => void;
  removeLine: (productId: number) => void;
  removeSelectedLines: () => void;
  toggleLineSelected: (productId: number) => void;
  setAllSelected: (value: boolean) => void;
  clearCart: () => void;
  overlay: Overlay;
  openCheckout: () => void;
  backToCartFromCheckout: () => void;
  completeOrder: () => void;
  /** 결제에 적용된 쿠폰 할인(선택 품목 기준) */
  checkoutCoupon: AppliedCheckoutCoupon | null;
  applyCheckoutCoupon: (coupon: Coupon | null) => void;
};

const CartScreenContext = createContext<CartScreenContextValue | null>(null);

function selectedSubtotalWon(lines: CartLine[]): number {
  return lines.filter((l) => l.selected).reduce((s, l) => s + l.unitWon * l.quantity, 0);
}

export function CartScreenProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => loadCartLines());
  const [open, setOpen] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>("cart");
  const [checkoutCoupon, setCheckoutCoupon] = useState<AppliedCheckoutCoupon | null>(null);

  useEffect(() => {
    saveCartLines(lines);
  }, [lines]);

  const itemCount = useMemo(
    () => lines.reduce((acc, l) => acc + l.quantity, 0),
    [lines]
  );
  const totalQuantity = useMemo(
    () => lines.reduce((acc, l) => acc + (l.selected ? l.quantity : 0), 0),
    [lines]
  );

  const subtotalSel = useMemo(() => selectedSubtotalWon(lines), [lines]);

  useEffect(() => {
    if (!checkoutCoupon) return;
    const c = loadCoupons().find((x) => x.id === checkoutCoupon.id);
    if (!c || c.used || c.expiresAt <= Date.now() || subtotalSel < c.minOrderWon) {
      setCheckoutCoupon(null);
      return;
    }
    const discount = Math.min(c.discountWon, subtotalSel);
    if (discount !== checkoutCoupon.discountWon) {
      setCheckoutCoupon({ id: c.id, discountWon: discount });
    }
  }, [lines, checkoutCoupon, subtotalSel]);

  const addToCart = useCallback((product: CartProductInput) => {
    const unitWon = parseGearPriceToWon(product.price);
    const priceLabel = product.price.replace(/\s/g, "");
    setLines((prev) => {
      const i = prev.findIndex((l) => l.productId === product.id);
      if (i >= 0) {
        const next = [...prev];
        const cur = next[i];
        next[i] = { ...cur, quantity: cur.quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          priceLabel,
          unitWon,
          quantity: 1,
          selected: true,
        },
      ];
    });
  }, []);

  const setLineQuantity = useCallback((productId: number, quantity: number) => {
    const q = Math.max(1, Math.min(99, Math.floor(quantity)));
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, quantity: q } : l))
    );
  }, []);

  const removeLine = useCallback((productId: number) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const removeSelectedLines = useCallback(() => {
    setLines((prev) => prev.filter((l) => !l.selected));
  }, []);

  const toggleLineSelected = useCallback((productId: number) => {
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, selected: !l.selected } : l))
    );
  }, []);

  const setAllSelected = useCallback((value: boolean) => {
    setLines((prev) => prev.map((l) => ({ ...l, selected: value })));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    setCheckoutCoupon(null);
  }, []);

  const applyCheckoutCoupon = useCallback(
    (coupon: Coupon | null) => {
      if (!coupon) {
        setCheckoutCoupon(null);
        return;
      }
      const sub = selectedSubtotalWon(lines);
      if (sub < coupon.minOrderWon) return;
      const discount = Math.min(coupon.discountWon, sub);
      setCheckoutCoupon({ id: coupon.id, discountWon: discount });
    },
    [lines]
  );

  const openCart = useCallback(() => {
    setOverlay("cart");
    setOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setOpen(false);
    setOverlay("cart");
  }, []);

  /** 장바구니 안에서 또는 바로구매 시 결제 화면으로 이동 */
  const openCheckout = useCallback(() => {
    setOverlay("checkout");
    setOpen(true);
  }, []);

  const backToCartFromCheckout = useCallback(() => {
    setOverlay("cart");
  }, []);

  const completeOrder = useCallback(() => {
    if (checkoutCoupon) markCouponUsed(checkoutCoupon.id);
    setCheckoutCoupon(null);
    clearCart();
    setOpen(false);
    setOverlay("cart");
  }, [checkoutCoupon, clearCart]);

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      totalQuantity,
      openCart,
      closeCart,
      addToCart,
      setLineQuantity,
      removeLine,
      removeSelectedLines,
      toggleLineSelected,
      setAllSelected,
      clearCart,
      overlay,
      openCheckout,
      backToCartFromCheckout,
      completeOrder,
      checkoutCoupon,
      applyCheckoutCoupon,
    }),
    [
      lines,
      itemCount,
      totalQuantity,
      openCart,
      closeCart,
      addToCart,
      setLineQuantity,
      removeLine,
      removeSelectedLines,
      toggleLineSelected,
      setAllSelected,
      clearCart,
      overlay,
      openCheckout,
      backToCartFromCheckout,
      completeOrder,
      checkoutCoupon,
      applyCheckoutCoupon,
    ]
  );

  return (
    <CartScreenContext.Provider value={value}>
      {children}
      {open &&
        (overlay === "checkout" ? (
          <CheckoutScreen />
        ) : (
          <ShoppingCartScreen />
        ))}
    </CartScreenContext.Provider>
  );
}

export function useOptionalCartScreen() {
  return useContext(CartScreenContext);
}

export function useCartScreen() {
  const ctx = useContext(CartScreenContext);
  if (!ctx) {
    throw new Error("useCartScreen must be used within CartScreenProvider");
  }
  return ctx;
}
