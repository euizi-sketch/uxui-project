import { useEffect, useMemo, useState } from "react";
import { addWalletPoints } from "../events/playgroundStorage";
import type { Coupon } from "../../profile/myPageHubStorage";
import { issueCartStackCoupon, loadCoupons } from "../../profile/myPageHubStorage";
import { useCartScreen } from "./CartScreenContext";

function formatWon(n: number): string {
  return n.toLocaleString("ko-KR");
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function ShoppingCartScreen() {
  const {
    lines,
    closeCart,
    setLineQuantity,
    removeLine,
    toggleLineSelected,
    setAllSelected,
    openCheckout,
    removeSelectedLines,
    checkoutCoupon,
    applyCheckoutCoupon,
  } = useCartScreen();

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [optionLineId, setOptionLineId] = useState<number | null>(null);
  const [missionHint, setMissionHint] = useState<string | null>(null);

  const selectedCount = lines.filter((l) => l.selected).length;
  const allSelected = lines.length > 0 && selectedCount === lines.length;

  const selectedLines = useMemo(() => lines.filter((l) => l.selected), [lines]);

  const subtotal = useMemo(
    () => selectedLines.reduce((s, l) => s + l.unitWon * l.quantity, 0),
    [selectedLines]
  );

  const lineDiscountTotal = useMemo(
    () =>
      selectedLines.reduce((s, l) => {
        const orig = Math.floor(l.unitWon * 1.12);
        return s + Math.max(0, orig - l.unitWon) * l.quantity;
      }, 0),
    [selectedLines]
  );
  const shipping = subtotal >= 30000 || subtotal === 0 ? 0 : 3000;
  const couponWon = checkoutCoupon?.discountWon ?? 0;
  const payTotal = Math.max(0, subtotal + shipping - couponWon);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleOrder = () => {
    if (selectedLines.length === 0) {
      window.alert("주문할 상품을 선택해 주세요.");
      return;
    }
    openCheckout();
  };

  const handleCartMissionTap = () => {
    const key = `momoA.cartMissionTap:${todayKey()}`;
    if (localStorage.getItem(key)) {
      setMissionHint("오늘은 이미 받았어요. 내일 다시 도전해 보세요!");
      window.setTimeout(() => setMissionHint(null), 2800);
      return;
    }
    localStorage.setItem(key, "1");
    addWalletPoints(10, "장바구니 미션");
    setMissionHint("10P가 적립됐어요!");
    window.setTimeout(() => setMissionHint(null), 2800);
  };

  const handleExtraMissionTap = () => {
    const key = `momoA.cartExtraMission:${todayKey()}`;
    if (localStorage.getItem(key)) {
      setMissionHint("추가 미션은 하루 1회예요.");
      window.setTimeout(() => setMissionHint(null), 2800);
      return;
    }
    localStorage.setItem(key, "1");
    addWalletPoints(Math.min(500, Math.max(50, Math.floor(subtotal * 0.02))), "추가 할인 미션");
    setMissionHint("미션 포인트가 적립됐어요!");
    window.setTimeout(() => setMissionHint(null), 2800);
  };

  const handleSelectDelete = () => {
    const n = selectedLines.length;
    if (n === 0) {
      window.alert("삭제할 상품을 선택해 주세요.");
      return;
    }
    removeSelectedLines();
  };

  const usableCoupons = useMemo(() => {
    const now = Date.now();
    return loadCoupons().filter((c) => !c.used && c.expiresAt > now && subtotal >= c.minOrderWon);
  }, [subtotal, couponModalOpen, lines]);

  const pickCoupon = (c: Coupon | null) => {
    applyCheckoutCoupon(c);
    setCouponModalOpen(false);
  };

  return (
    <div className="app-viewport-fixed z-[90] flex flex-col bg-white">
      <header className="flex shrink-0 items-center border-b border-slate-100 bg-white px-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-2">
        <button
          type="button"
          onClick={closeCart}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-800 hover:bg-slate-100"
          aria-label="뒤로"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="min-w-0 flex-1 text-center text-[16px] font-bold text-slate-900">장바구니</h1>
        <span className="h-11 w-11 shrink-0" aria-hidden />
      </header>

      {missionHint && (
        <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-2 text-center text-[12px] font-semibold text-emerald-900">
          {missionHint}
        </div>
      )}

      {lines.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 pb-28">
          <p className="text-center text-[15px] font-bold text-slate-800">장바구니가 비어 있어요</p>
          <p className="mt-2 text-center text-sm font-medium text-slate-500">
            육아용품에서 마음에 드는 상품을 담아 보세요.
          </p>
          <button
            type="button"
            onClick={closeCart}
            className="mt-8 rounded-full bg-[#FF853E] px-8 py-3.5 text-sm font-bold text-white shadow-md"
          >
            계속 쇼핑하기
          </button>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/90 px-4 py-2.5 text-left"
              onClick={handleCartMissionTap}
            >
              <span className="flex min-w-0 items-center gap-2 text-[12px] font-medium text-slate-800">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FEE500] text-[10px] font-bold text-[#191919]">
                  P
                </span>
                <span className="break-keep text-left leading-snug line-clamp-2">지금 클릭만 해도 10원 적립</span>
              </span>
              <span className="shrink-0 text-[12px] font-bold text-blue-600">포인트 받기 ›</span>
            </button>

            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <button
                type="button"
                onClick={() => setAllSelected(!allSelected)}
                className="flex items-center gap-2 text-[13px] font-semibold text-slate-900"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                    allSelected ? "bg-[#FF853E] shadow-sm shadow-orange-200/50" : "border-2 border-slate-300 bg-white"
                  }`}
                  aria-hidden
                >
                  {allSelected ? "✓" : ""}
                </span>
                전체선택 ({selectedCount}/{lines.length})
              </button>
              <button
                type="button"
                className="text-[13px] font-normal text-slate-500"
                onClick={handleSelectDelete}
              >
                선택삭제
              </button>
            </div>

            <div className="border-b border-slate-100 bg-white px-4 pb-4 pt-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-[14px] font-bold text-slate-900">MOMOA 배송상품</p>
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700"
                  onClick={() => {
                    issueCartStackCoupon();
                    window.alert("중복 할인 쿠폰이 쿠폰함에 발급됐어요. 결제 전 장바구니에서 쿠폰을 선택할 수 있어요.");
                  }}
                >
                  <span aria-hidden>⬇</span>
                  중복 쿠폰 받기
                </button>
              </div>

              <div className="space-y-6">
                {lines.map((line) => {
                  const linePay = line.unitWon * line.quantity;
                  const fakeOrig = Math.floor(line.unitWon * 1.12);
                  return (
                    <div key={line.productId} className="border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="mt-1 shrink-0"
                          onClick={() => toggleLineSelected(line.productId)}
                          aria-pressed={line.selected}
                          aria-label="상품 선택"
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                              line.selected ? "bg-[#FF853E] shadow-sm shadow-orange-200/50" : "border-2 border-slate-300 bg-white"
                            }`}
                          >
                            {line.selected ? "✓" : ""}
                          </span>
                        </button>

                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                          <img src={line.imageUrl} alt="" className="h-full w-full object-cover" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-[11px] font-normal text-slate-500">모모아 스토어</p>
                            <button
                              type="button"
                              className="shrink-0 rounded-lg p-0.5 text-slate-400 hover:bg-slate-100"
                              aria-label="삭제"
                              onClick={() => removeLine(line.productId)}
                            >
                              ✕
                            </button>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[13px] font-bold leading-snug text-slate-900">
                            {line.name}
                          </p>
                          <span className="mt-1 inline-block rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800">
                            오늘출발
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="mt-3 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-[12px] font-medium text-slate-700"
                        onClick={() => setOptionLineId(line.productId)}
                      >
                        <span className="line-clamp-2">기본 상품 · {line.priceLabel}원</span>
                        <span className="shrink-0 text-slate-400" aria-hidden>
                          ▼
                        </span>
                      </button>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white">
                          <button
                            type="button"
                            className="px-3 py-2 text-lg font-semibold text-slate-600 disabled:opacity-40"
                            disabled={line.quantity <= 1}
                            onClick={() => setLineQuantity(line.productId, line.quantity - 1)}
                            aria-label="수량 감소"
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center text-[14px] font-bold tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            className="px-3 py-2 text-lg font-semibold text-slate-600"
                            onClick={() => setLineQuantity(line.productId, line.quantity + 1)}
                            aria-label="수량 증가"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] font-medium text-slate-400 line-through">
                            {(fakeOrig * line.quantity).toLocaleString("ko-KR")}원
                          </p>
                          <p className="text-[17px] font-bold text-slate-900">{formatWon(linePay)}원</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 px-4 py-4">
              <p className="text-[14px] font-bold text-slate-900">예상 결제금액</p>
              <div className="mt-3 space-y-2.5 text-[13px]">
                <div className="flex justify-between font-medium text-slate-700">
                  <span>총 상품금액</span>
                  <span>{formatWon(subtotal + lineDiscountTotal)}원</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>상품할인</span>
                  <span>-{formatWon(lineDiscountTotal)}원</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">쿠폰할인</span>
                  <div className="flex items-center gap-2">
                    {checkoutCoupon ? (
                      <span className="text-[12px] font-bold text-emerald-700">
                        -{formatWon(checkoutCoupon.discountWon)}원
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-md border border-blue-500 px-2.5 py-1 text-[12px] font-bold text-blue-600"
                      onClick={() => setCouponModalOpen(true)}
                    >
                      쿠폰 선택
                    </button>
                  </div>
                </div>
                {checkoutCoupon ? (
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-slate-500 underline"
                    onClick={() => pickCoupon(null)}
                  >
                    쿠폰 적용 취소
                  </button>
                ) : null}
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">배송비</span>
                  <span className="font-bold text-[#FF853E]">
                    {shipping === 0 ? "무료배송" : `${formatWon(shipping)}원`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-[15px] font-bold text-slate-900">
                  <span>합계</span>
                  <span className="tabular-nums text-[#FF853E]">{formatWon(payTotal)}원</span>
                </div>
              </div>

              <button
                type="button"
                className="mt-4 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3 text-left"
                onClick={handleExtraMissionTap}
              >
                <span className="flex items-center gap-2">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    첫구매 할인
                  </span>
                  <span className="text-[12px] font-semibold text-slate-700">
                    미션하고 최대 {(payTotal * 0.08).toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원 더 할인
                  </span>
                </span>
                <span className="text-slate-400">›</span>
              </button>
            </div>

            <div className="h-28 shrink-0" aria-hidden />
          </div>

          <div className="app-bottom-fixed z-[91] border-t border-slate-200 bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3">
            <div className="relative mx-auto max-w-lg">
              <span className="absolute -top-2 right-3 z-[1] inline-flex items-center gap-0.5 rounded-full bg-[#FF853E] px-2 py-0.5 text-[10px] font-bold text-white shadow-md ring-2 ring-white">
                <span aria-hidden>🚚</span>
                {shipping === 0 ? "무료배송" : `배송비 ${formatWon(shipping)}`}
              </span>
              <button
                type="button"
                onClick={handleOrder}
                className="relative w-full rounded-xl bg-[#FF853E] py-4 text-[16px] font-bold text-white shadow-md shadow-orange-300/45 transition hover:brightness-[1.03] active:scale-[0.99]"
              >
                {formatWon(payTotal)}원 주문하기
              </button>
            </div>
          </div>
        </>
      )}

      {couponModalOpen && (
        <div
          className="app-viewport-fixed z-[92] flex flex-col justify-end bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coupon-sheet-title"
        >
          <button type="button" className="min-h-0 flex-1" aria-label="닫기" onClick={() => setCouponModalOpen(false)} />
          <div className="max-h-[70dvh] overflow-y-auto rounded-t-3xl bg-white px-4 pb-safe-tab pt-4 shadow-2xl">
            <p id="coupon-sheet-title" className="text-center text-[16px] font-bold text-slate-900">
              쿠폰 선택
            </p>
            <p className="mt-1 text-center text-[12px] font-medium text-slate-500">
              선택한 상품 금액 {formatWon(subtotal)}원 기준
            </p>
            <div className="mt-4 space-y-2 pb-6">
              {usableCoupons.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">사용 가능한 쿠폰이 없어요.</p>
              ) : (
                usableCoupons.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickCoupon(c)}
                    className="flex w-full flex-col rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-bold text-slate-900">{c.title}</span>
                    <span className="mt-1 text-[12px] font-medium text-emerald-700">
                      {formatWon(c.discountWon)}원 할인 · 최소 {formatWon(c.minOrderWon)}원
                    </span>
                  </button>
                ))
              )}
              <button
                type="button"
                onClick={() => setCouponModalOpen(false)}
                className="mt-2 w-full rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {optionLineId != null && (
        <div className="app-viewport-fixed z-[92] flex items-center justify-center bg-black/45 px-6" role="dialog">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-center text-[16px] font-bold text-slate-900">옵션 안내</p>
            <p className="mt-3 text-center text-[13px] font-medium leading-relaxed text-slate-600">
              데모 스토어는 단일 옵션만 제공해요. 수량은 아래에서 바꿀 수 있어요.
            </p>
            <button
              type="button"
              onClick={() => setOptionLineId(null)}
              className="mt-6 w-full rounded-2xl bg-[#FF853E] py-3 text-sm font-bold text-white"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
