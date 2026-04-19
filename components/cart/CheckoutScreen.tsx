import { useEffect, useMemo, useState } from "react";
import { addInAppNotification } from "../../settings/inAppNotifications";
import { appendCheckoutOrder } from "../../profile/myPageHubStorage";
import { useCartScreen } from "./CartScreenContext";

function formatWon(n: number): string {
  return n.toLocaleString("ko-KR");
}

export default function CheckoutScreen() {
  const {
    lines,
    backToCartFromCheckout,
    completeOrder,
    closeCart,
    checkoutCoupon,
  } = useCartScreen();

  const selectedLines = useMemo(() => lines.filter((l) => l.selected), [lines]);

  const subtotal = useMemo(
    () => selectedLines.reduce((s, l) => s + l.unitWon * l.quantity, 0),
    [selectedLines]
  );

  const instantDiscount = useMemo(
    () => Math.min(Math.floor(subtotal * 0.08), 12000),
    [subtotal]
  );

  const couponDiscount = checkoutCoupon?.discountWon ?? 0;
  const shipping = subtotal >= 30000 || subtotal === 0 ? 0 : 3000;
  const payTotal = Math.max(0, subtotal - instantDiscount - couponDiscount + shipping);

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<"kakao" | "card" | "transfer">("kakao");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const canPay =
    receiverName.trim().length > 0 &&
    receiverPhone.trim().length > 8 &&
    address.trim().length > 4 &&
    selectedLines.length > 0;

  const handlePay = () => {
    if (!canPay) return;
    const payLabels: Record<typeof payment, string> = {
      kakao: "카카오페이",
      card: "신용·체크카드",
      transfer: "무통장 입금",
    };
    appendCheckoutOrder({
      items: selectedLines.map((l) => ({
        productId: l.productId,
        name: l.name,
        imageUrl: l.imageUrl,
        quantity: l.quantity,
        unitWon: l.unitWon,
      })),
      subtotalWon: subtotal,
      discountWon: instantDiscount + couponDiscount,
      shippingWon: shipping,
      totalWon: payTotal,
      paymentLabel: payLabels[payment],
    });
    addInAppNotification({
      kind: "order",
      title: "주문이 접수됐어요",
      body: `총 ${formatWon(payTotal)}원 · ${payLabels[payment]}. 데모이므로 실제 결제는 이루어지지 않았어요.`,
    });
    setDone(true);
  };

  const handleDoneClose = () => {
    completeOrder();
  };

  if (selectedLines.length === 0 && !done) {
    return (
      <div className="app-viewport-fixed z-[95] flex flex-col bg-white">
        <header className="flex shrink-0 items-center border-b border-slate-100 bg-white px-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-2">
          <button
            type="button"
            onClick={backToCartFromCheckout}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-800 hover:bg-slate-100"
            aria-label="뒤로"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 text-center text-[16px] font-bold text-slate-900">결제</h1>
          <button
            type="button"
            onClick={closeCart}
            className="inline-flex h-11 min-w-[2.75rem] shrink-0 items-center justify-center px-2 text-[13px] font-normal text-slate-500"
          >
            닫기
          </button>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
          <p className="text-center text-sm font-normal text-slate-600">주문할 상품이 없어요.</p>
          <button
            type="button"
            onClick={backToCartFromCheckout}
            className="mt-5 rounded-full bg-[#FF853E] px-6 py-3 text-sm font-bold text-white"
          >
            장바구니로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-viewport-fixed z-[95] flex flex-col bg-white">
      <header className="flex shrink-0 items-center border-b border-slate-100 bg-white px-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-2">
        <button
          type="button"
          onClick={() => (done ? handleDoneClose() : backToCartFromCheckout())}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-800 hover:bg-slate-100"
          aria-label="뒤로"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="min-w-0 flex-1 text-center text-[16px] font-bold text-slate-900">
          {done ? "결제 완료" : "주문·결제"}
        </h1>
        <span className="h-11 w-11 shrink-0" aria-hidden />
      </header>

      {done ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-32">
          <span className="text-5xl" aria-hidden>
            ✓
          </span>
          <p className="mt-6 text-center text-lg font-bold text-slate-900">결제가 완료되었습니다</p>
          <p className="mt-2 text-center text-sm font-medium text-slate-500">
            데모 환경이라 실제 결제는 이루어지지 않았어요.
          </p>
          <p className="mt-1 text-center text-2xl font-bold tabular-nums text-[#FF853E]">
            {formatWon(payTotal)}원
          </p>
          <button
            type="button"
            onClick={handleDoneClose}
            className="mt-10 w-full max-w-sm rounded-xl bg-slate-900 py-4 text-[16px] font-bold text-white"
          >
            확인
          </button>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-36">
            <section className="border-b border-slate-100 px-4 py-4">
              <p className="text-[13px] font-bold text-slate-900">주문 상품</p>
              <ul className="mt-3 space-y-4">
                {selectedLines.map((l) => (
                  <li key={l.productId} className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                      <img src={l.imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[13px] font-bold leading-snug text-slate-900">{l.name}</p>
                      <p className="mt-1 text-[12px] font-medium text-slate-500">
                        {formatWon(l.unitWon)}원 · {l.quantity}개
                      </p>
                    </div>
                    <p className="shrink-0 text-[14px] font-bold tabular-nums text-slate-900">
                      {formatWon(l.unitWon * l.quantity)}원
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-b border-slate-100 px-4 py-4">
              <p className="text-[13px] font-bold text-slate-900">배송지</p>
              <div className="mt-3 space-y-3">
                <label className="block">
                  <span className="text-[11px] font-normal text-slate-500">받는 분</span>
                  <input
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="이름"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[14px] font-medium outline-none focus:border-[#FFB089] focus:ring-2 focus:ring-[#FF853E]/20"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-normal text-slate-500">연락처</span>
                  <input
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    inputMode="tel"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[14px] font-medium outline-none focus:border-[#FFB089] focus:ring-2 focus:ring-[#FF853E]/20"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-normal text-slate-500">주소</span>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="도로명 주소와 상세 주소를 입력해 주세요"
                    rows={3}
                    className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-[14px] font-medium outline-none focus:border-[#FFB089] focus:ring-2 focus:ring-[#FF853E]/20"
                  />
                </label>
              </div>
            </section>

            <section className="px-4 py-4">
              <p className="text-[13px] font-bold text-slate-900">결제 수단</p>
              <div className="mt-3 space-y-2">
                {(
                  [
                    { id: "kakao" as const, label: "카카오페이" },
                    { id: "card" as const, label: "신용·체크카드" },
                    { id: "transfer" as const, label: "무통장 입금" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPayment(opt.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-[14px] font-semibold transition ${
                      payment === opt.id
                        ? "border-[#FF853E] bg-[#FFF8F4] text-slate-900 ring-2 ring-[#FF853E]/25"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        payment === opt.id ? "border-[#FF853E] bg-[#FF853E]" : "border-slate-300"
                      }`}
                    >
                      {payment === opt.id ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-slate-50 px-4 py-4">
              <p className="text-[13px] font-bold text-slate-900">결제 금액</p>
              <div className="mt-3 space-y-2 text-[13px]">
                <div className="flex justify-between font-medium text-slate-700">
                  <span>상품 금액</span>
                  <span>{formatWon(subtotal)}원</span>
                </div>
                <div className="flex justify-between font-bold text-[#FF853E]">
                  <span>즉시 할인</span>
                  <span>-{formatWon(instantDiscount)}원</span>
                </div>
                {couponDiscount > 0 ? (
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>쿠폰 할인</span>
                    <span>-{formatWon(couponDiscount)}원</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-medium text-slate-700">
                  <span>배송비</span>
                  <span>{shipping === 0 ? "무료" : `${formatWon(shipping)}원`}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-[16px] font-bold text-slate-900">
                  <span>총 결제</span>
                  <span className="tabular-nums text-[#FF853E]">{formatWon(payTotal)}원</span>
                </div>
              </div>
            </section>

            <div className="h-12 shrink-0" aria-hidden />
          </div>

          <div className="app-bottom-fixed z-[96] border-t border-slate-200 bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3">
            <button
              type="button"
              disabled={!canPay}
              onClick={handlePay}
              className="w-full rounded-xl bg-slate-900 py-4 text-[16px] font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {formatWon(payTotal)}원 결제하기
            </button>
            {!canPay && (
              <p className="mt-2 text-center text-[11px] font-medium text-rose-600">
                배송 정보를 모두 입력해 주세요.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
