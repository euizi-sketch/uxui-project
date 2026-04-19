import { useMemo, useState } from "react";
import { useOptionalCartScreen } from "../components/cart/CartScreenContext";
import {
  addReservation,
  loadOrders,
  loadReservations,
  orderStats,
  totalSpentWon,
  type StoredOrder,
} from "../profile/myPageHubStorage";

type MainSection = "order" | "reservation";

function formatWon(n: number) {
  return n.toLocaleString("ko-KR");
}

function orderDateLabel(o: StoredOrder) {
  return new Date(o.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

function statusLine(o: StoredOrder): string {
  if (o.status === "delivered") return "구매 확정 · 배송 완료";
  if (o.status === "shipping") return "배송 중";
  if (o.status === "cancelled") return "취소됨";
  return "상품 준비 중";
}

export default function OrderReservationHistoryPage({ onBack }: { onBack: () => void }) {
  const cart = useOptionalCartScreen();
  const [section, setSection] = useState<MainSection>("order");
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");

  const orders = useMemo(() => loadOrders(), [tick]);
  const reservations = useMemo(() => loadReservations(), [tick]);
  const stats = useMemo(() => orderStats(), [tick]);
  const spent = useMemo(() => totalSpentWon(), [tick]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      if (o.id.toLowerCase().includes(q)) return true;
      return o.items.some((it) => it.name.toLowerCase().includes(q));
    });
  }, [orders, query]);

  const [resTitle, setResTitle] = useState("");
  const [resPlace, setResPlace] = useState("");
  const [resDate, setResDate] = useState("");

  return (
    <div className="min-h-dvh bg-white pb-safe-tab text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
        <div className="relative flex h-14 items-center justify-center px-3">
          <button
            type="button"
            onClick={onBack}
            className="absolute left-2 inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
            aria-label="뒤로가기"
          >
            ←
          </button>
          <h1 className="text-base font-bold tracking-tight">주문 · 예약 내역</h1>
          <div className="absolute right-2 flex items-center gap-0.5">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="장바구니"
              onClick={() => cart?.openCart() ?? window.alert("장바구니를 열 수 없어요.")}
            >
              🛍️
            </button>
          </div>
        </div>

        <div className="flex px-2">
          <button
            type="button"
            onClick={() => setSection("order")}
            className={`relative flex-1 py-3 text-sm font-bold transition ${
              section === "order" ? "text-slate-900" : "text-slate-400"
            }`}
          >
            주문 내역
            {section === "order" && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-slate-900" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setSection("reservation")}
            className={`relative flex-1 py-3 text-sm font-bold transition ${
              section === "reservation" ? "text-slate-900" : "text-slate-400"
            }`}
          >
            예약 내역
            {section === "reservation" && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-slate-900" />
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-3">
        {section === "order" ? (
          <>
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 px-2 py-4">
              {[
                { label: "배송중", value: stats.shipping },
                { label: "배송완료", value: stats.delivered },
                { label: "취소 / 반품", value: stats.cancelled },
              ].map((row) => (
                <div key={row.label} className="text-center">
                  <p className="text-xl font-bold text-blue-600">{row.value}</p>
                  <p className="mt-1 text-[11px] font-normal text-slate-600">{row.label}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                window.alert(`모모아에서 총 ${formatWon(spent)}원 결제했어요. (저장된 주문 기준)`)
              }
              className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl bg-sky-50 px-4 py-3.5 text-left ring-1 ring-sky-100 transition hover:bg-sky-100/80"
            >
              <span className="text-sm font-medium text-slate-800">
                💰 지금까지 모모아에서 얼마나 썼을까?
              </span>
              <span className="shrink-0 text-xs font-bold text-blue-600">보러가기 &gt;</span>
            </button>

            <div className="mt-4 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="상품명 검색"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#FF853E]"
              />
              <button
                type="button"
                onClick={() => setTick((x) => x + 1)}
                className="rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-bold text-white"
              >
                새로고침
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {filteredOrders.map((order) => (
                <section key={order.id}>
                  <button
                    type="button"
                    className="mb-2 flex w-full items-center justify-between py-1 text-left"
                    onClick={() =>
                      window.alert(
                        `주문번호 ${order.id}\n결제 ${formatWon(order.totalWon)}원\n${order.paymentLabel}`
                      )
                    }
                  >
                    <span className="text-sm font-semibold text-slate-800">{orderDateLabel(order)}</span>
                    <span className="text-slate-400" aria-hidden="true">
                      ›
                    </span>
                  </button>
                  {order.items.map((item) => (
                    <div
                      key={`${order.id}-${item.productId}`}
                      className="mb-3 flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm last:mb-0"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold leading-snug text-slate-900">{statusLine(order)}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {formatWon(item.unitWon * item.quantity)}원
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs font-medium text-slate-800">{item.name}</p>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                          수량 {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </section>
              ))}
            </div>
            {filteredOrders.length === 0 ? (
              <p className="mt-10 text-center text-sm text-slate-500">검색 결과가 없어요.</p>
            ) : null}
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4">
              <p className="text-xs font-bold text-slate-700">예약 추가 (데모)</p>
              <input
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                placeholder="프로그램명"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
              <input
                value={resPlace}
                onChange={(e) => setResPlace(e.target.value)}
                placeholder="장소"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
              <input
                value={resDate}
                onChange={(e) => setResDate(e.target.value)}
                placeholder="일시 (예: 2026. 4. 20 14:00)"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  if (!resTitle.trim() || !resPlace.trim() || !resDate.trim()) {
                    window.alert("프로그램명, 장소, 일시를 입력해 주세요.");
                    return;
                  }
                  addReservation({
                    title: resTitle,
                    placeName: resPlace,
                    dateLabel: resDate,
                  });
                  setResTitle("");
                  setResPlace("");
                  setResDate("");
                  setTick((x) => x + 1);
                }}
                className="mt-3 w-full rounded-xl bg-[#FF853E] py-2.5 text-sm font-bold text-white"
              >
                예약 저장하기
              </button>
            </div>

            <ul className="mt-6 space-y-3">
              {reservations.map((r) => (
                <li key={r.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">{r.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{r.placeName}</p>
                  <p className="mt-1 text-sm font-semibold text-[#FF853E]">{r.dateLabel}</p>
                  <p className="mt-2 text-[11px] font-bold uppercase text-slate-400">
                    {r.status === "confirmed"
                      ? "예약 확정"
                      : r.status === "completed"
                        ? "참여 완료"
                        : "취소"}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
