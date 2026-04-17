import { useState } from "react";
import { useOptionalCartScreen } from "../components/cart/CartScreenContext";

type MainSection = "order" | "reservation";

const DEMO_ORDERS = [
  {
    dateLabel: "2026. 02. 21",
    statusLine: "구매 확정 · 2/24(화) 배송 완료",
    price: "12,800",
    badge: "오늘출발",
    title: "클로버 키링 실리콘 에어팟 프로 케이스",
    option: "ONE | 에어팟 프로",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=200&q=80",
  },
  {
    dateLabel: "2026. 02. 18",
    statusLine: "배송중 · 2/22(토) 도착 예정",
    price: "32,000",
    badge: null as string | null,
    title: "유기농 순면 기저귀 A형",
    option: "NB · 1팩",
    image: "https://images.unsplash.com/photo-1544126592-807daa2b5d33?w=200&q=80",
  },
];

export default function OrderReservationHistoryPage({ onBack }: { onBack: () => void }) {
  const cart = useOptionalCartScreen();
  const [section, setSection] = useState<MainSection>("order");

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
          <h1 className="text-base font-extrabold tracking-tight">주문 · 예약 내역</h1>
          <div className="absolute right-2 flex items-center gap-0.5">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="검색"
              onClick={() => window.alert("주문 검색(데모)")}
            >
              🔍
            </button>
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="장바구니"
              onClick={() => cart?.openCart() ?? window.alert("장바구니(데모)")}
            >
              🛍️
              <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                2
              </span>
            </button>
          </div>
        </div>

        <div className="flex px-2">
          <button
            type="button"
            onClick={() => setSection("order")}
            className={`relative flex-1 py-3 text-sm font-extrabold transition ${
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
            className={`relative flex-1 py-3 text-sm font-extrabold transition ${
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
                { label: "배송중", value: 0 },
                { label: "배송완료", value: 0 },
                { label: "취소 / 반품", value: 0 },
              ].map((row) => (
                <div key={row.label} className="text-center">
                  <p className="text-xl font-extrabold text-blue-600">{row.value}</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-600">{row.label}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => window.alert("모모아에서 총 얼마 썼는지(데모)")}
              className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl bg-sky-50 px-4 py-3.5 text-left ring-1 ring-sky-100 transition hover:bg-sky-100/80"
            >
              <span className="text-sm font-semibold text-slate-800">
                💰 지금까지 모모아에서 얼마나 썼을까?
              </span>
              <span className="shrink-0 text-xs font-extrabold text-blue-600">
                보러가기 &gt;
              </span>
            </button>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => window.alert("주문 검색(데모)")}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-extrabold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                🔍 검색
              </button>
              <button
                type="button"
                onClick={() => window.alert("필터(데모)")}
                className="inline-flex min-w-[5.5rem] items-center justify-center gap-1 rounded-xl bg-slate-700 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-slate-800"
              >
                전체 <span className="text-xs">▾</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.alert("자주 구매한 상품(데모)")}
              className="mt-4 flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 text-left shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=120&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-900">자주 구매한 상품 9</p>
              </div>
              <span className="shrink-0 text-xs font-extrabold text-blue-600">전체보기 &gt;</span>
            </button>

            <div className="mt-6 space-y-6">
              {DEMO_ORDERS.map((order, idx) => (
                <section key={`${order.dateLabel}-${idx}`}>
                  <button
                    type="button"
                    className="mb-2 flex w-full items-center justify-between py-1 text-left"
                    onClick={() => window.alert(`${order.dateLabel} 주문 상세(데모)`)}
                  >
                    <span className="text-sm font-extrabold text-slate-800">{order.dateLabel}</span>
                    <span className="text-slate-400" aria-hidden="true">
                      ›
                    </span>
                  </button>
                  <div className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={order.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold leading-snug text-slate-900">
                        {order.statusLine}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900">
                          {order.price}원
                        </span>
                        {order.badge && (
                          <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-extrabold text-sky-700">
                            {order.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-800">
                        {order.title}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-500">{order.option}</p>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm font-extrabold text-slate-700">예약 내역이 없어요</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">
                체험·클래스 예약이 생기면 이곳에 표시돼요.
              </p>
              <button
                type="button"
                onClick={() => window.alert("클래스 둘러보기(데모)")}
                className="mt-4 rounded-xl bg-[#FF853E] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#ff7a2a]"
              >
                원데이클래스 둘러보기
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
