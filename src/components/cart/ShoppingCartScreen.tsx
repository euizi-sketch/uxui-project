import { useEffect, useMemo } from "react";
import { useCartScreen } from "./CartScreenContext";

function formatWon(n: number): string {
  return n.toLocaleString("ko-KR");
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
  } = useCartScreen();

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
  const payTotal = Math.max(0, subtotal + shipping);

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
              onClick={() => window.alert("포인트 미션(데모)")}
            >
              <span className="flex min-w-0 items-center gap-2 text-[12px] font-semibold text-slate-800">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FEE500] text-[10px] font-extrabold text-[#191919]">
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
                className="text-[13px] font-semibold text-slate-500"
                onClick={() => window.alert("선택 삭제(데모)")}
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
                  onClick={() => window.alert("중복 쿠폰(데모)")}
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
                            <p className="text-[11px] font-semibold text-slate-500">모모아 스토어</p>
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
                        onClick={() => window.alert("옵션 변경(데모)")}
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
                          <p className="text-[17px] font-extrabold text-slate-900">{formatWon(linePay)}원</p>
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
                  <button
                    type="button"
                    className="rounded-md border border-blue-500 px-2.5 py-1 text-[12px] font-bold text-blue-600"
                    onClick={() => window.alert("쿠폰 선택(데모)")}
                  >
                    쿠폰 선택
                  </button>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">배송비</span>
                  <span className="font-bold text-[#FF853E]">
                    {shipping === 0 ? "무료배송" : `${formatWon(shipping)}원`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="mt-4 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3 text-left"
                onClick={() => window.alert("추가 할인 미션(데모)")}
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
    </div>
  );
}
