/** 마이페이지 활동 — 주문·예약·문의·쿠폰 등 로컬 영속화 */

export const HUB_UPDATED_EVENT = "momoA-hub-updated";

export function dispatchHubUpdated() {
  window.dispatchEvent(new CustomEvent(HUB_UPDATED_EVENT));
}

const ORDERS_KEY = "momoA.orders";
const ORDERS_SEEDED = "momoA.ordersDemoSeeded";
const RESERVATIONS_KEY = "momoA.reservations";
const RES_SEEDED = "momoA.reservationsDemoSeeded";
const INQUIRIES_KEY = "momoA.inquiries";
const COUPONS_KEY = "momoA.coupons";
const COUPONS_SEEDED = "momoA.couponsDemoSeeded";

export type StoredOrderItem = {
  productId: number;
  name: string;
  imageUrl: string;
  quantity: number;
  unitWon: number;
};

export type OrderStatus = "preparing" | "shipping" | "delivered" | "cancelled";

export type StoredOrder = {
  id: string;
  createdAt: number;
  totalWon: number;
  subtotalWon: number;
  discountWon: number;
  shippingWon: number;
  status: OrderStatus;
  paymentLabel: string;
  items: StoredOrderItem[];
};

export type StoredReservation = {
  id: string;
  title: string;
  placeName: string;
  dateLabel: string;
  status: "confirmed" | "completed" | "cancelled";
  createdAt: number;
};

export type Inquiry = {
  id: string;
  title: string;
  body: string;
  status: "received" | "answered";
  answer?: string;
  createdAt: number;
};

export type Coupon = {
  id: string;
  title: string;
  discountWon: number;
  minOrderWon: number;
  expiresAt: number;
  used: boolean;
};

function demoOrdersSeed(): StoredOrder[] {
  const t = Date.now();
  return [
    {
      id: "seed_ord_1",
      createdAt: t - 86400000 * 26,
      totalWon: 12800,
      subtotalWon: 14000,
      discountWon: 1200,
      shippingWon: 0,
      status: "delivered",
      paymentLabel: "카카오페이",
      items: [
        {
          productId: 901,
          name: "클로버 키링 실리콘 에어팟 프로 케이스",
          imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=200&q=80",
          quantity: 1,
          unitWon: 12800,
        },
      ],
    },
    {
      id: "seed_ord_2",
      createdAt: t - 86400000 * 29,
      totalWon: 35000,
      subtotalWon: 32000,
      discountWon: 0,
      shippingWon: 3000,
      status: "shipping",
      paymentLabel: "신용·체크카드",
      items: [
        {
          productId: 1,
          name: "유기농 순면 기저귀 A형",
          imageUrl: "https://images.unsplash.com/photo-1544126592-807daa2b5d33?w=200&q=80",
          quantity: 1,
          unitWon: 32000,
        },
      ],
    },
  ];
}

function demoReservationsSeed(): StoredReservation[] {
  return [
    {
      id: "seed_res_1",
      title: "감각 놀이 원데이 (6~12개월)",
      placeName: "모모아 파트너 스튜디오 강남",
      dateLabel: "2026. 3. 15 (토) 10:30",
      status: "confirmed",
      createdAt: Date.now() - 86400000 * 3,
    },
  ];
}

function demoCouponsSeed(): Coupon[] {
  const far = Date.now() + 86400000 * 60;
  return [
    {
      id: "c_welcome",
      title: "첫 구매 감사",
      discountWon: 5000,
      minOrderWon: 30000,
      expiresAt: far,
      used: false,
    },
    {
      id: "c_ship",
      title: "배송비 무료",
      discountWon: 3000,
      minOrderWon: 20000,
      expiresAt: far,
      used: false,
    },
    {
      id: "c_event",
      title: "봄맞이 10% (최대 1만원)",
      discountWon: 10000,
      minOrderWon: 50000,
      expiresAt: far,
      used: false,
    },
    {
      id: "c_used",
      title: "신규 가입 축하",
      discountWon: 2000,
      minOrderWon: 10000,
      expiresAt: Date.now() - 1000,
      used: true,
    },
  ];
}

export function loadOrders(): StoredOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    let list: StoredOrder[] = [];
    if (raw) {
      const a = JSON.parse(raw) as unknown;
      if (Array.isArray(a)) list = a.filter((x) => x && typeof x === "object") as StoredOrder[];
    }
    if (list.length === 0 && !localStorage.getItem(ORDERS_SEEDED)) {
      list = demoOrdersSeed();
      localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
      localStorage.setItem(ORDERS_SEEDED, "1");
    }
    return list;
  } catch {
    return [];
  }
}

export function appendCheckoutOrder(payload: {
  items: StoredOrderItem[];
  subtotalWon: number;
  discountWon: number;
  shippingWon: number;
  totalWon: number;
  paymentLabel: string;
}): StoredOrder {
  const order: StoredOrder = {
    id: `ord_${Date.now()}`,
    createdAt: Date.now(),
    totalWon: payload.totalWon,
    subtotalWon: payload.subtotalWon,
    discountWon: payload.discountWon,
    shippingWon: payload.shippingWon,
    status: "preparing",
    paymentLabel: payload.paymentLabel,
    items: payload.items,
  };
  const list = loadOrders();
  list.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(list.slice(0, 50)));
  dispatchHubUpdated();
  return order;
}

export function loadReservations(): StoredReservation[] {
  try {
    const raw = localStorage.getItem(RESERVATIONS_KEY);
    let list: StoredReservation[] = [];
    if (raw) {
      const a = JSON.parse(raw) as unknown;
      if (Array.isArray(a)) list = a.filter((x) => x && typeof x === "object") as StoredReservation[];
    }
    if (list.length === 0 && !localStorage.getItem(RES_SEEDED)) {
      list = demoReservationsSeed();
      localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(list));
      localStorage.setItem(RES_SEEDED, "1");
    }
    return list;
  } catch {
    return [];
  }
}

export function addReservation(input: { title: string; placeName: string; dateLabel: string }) {
  const list = loadReservations().filter((r) => !r.id.startsWith("seed_"));
  const next: StoredReservation = {
    id: `res_${Date.now()}`,
    title: input.title.trim(),
    placeName: input.placeName.trim(),
    dateLabel: input.dateLabel.trim(),
    status: "confirmed",
    createdAt: Date.now(),
  };
  const merged = [next, ...list];
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(merged.slice(0, 40)));
  dispatchHubUpdated();
}

export function loadInquiries(): Inquiry[] {
  try {
    const raw = localStorage.getItem(INQUIRIES_KEY);
    if (!raw) return [];
    const a = JSON.parse(raw) as unknown;
    if (!Array.isArray(a)) return [];
    return a.filter((x) => x && typeof x === "object") as Inquiry[];
  } catch {
    return [];
  }
}

export function appendInquiry(title: string, body: string) {
  const t = title.trim();
  const b = body.trim();
  if (!t || !b) return null;
  const list = loadInquiries();
  const next: Inquiry = {
    id: `inq_${Date.now()}`,
    title: t,
    body: b,
    status: "received",
    createdAt: Date.now(),
  };
  list.unshift(next);
  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(list.slice(0, 50)));
  dispatchHubUpdated();
  return next;
}

/** 데모용: 일정 시간 후 답변 달리는 것처럼 (클라이언트만) */
export function simulateInquiryAnswer(id: string) {
  const list = loadInquiries();
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return;
  list[i] = {
    ...list[i],
    status: "answered",
    answer:
      "안녕하세요, 모모아 고객센터입니다. 문의 주신 내용 확인했습니다. 추가로 필요하시면 이 스레드에 답글 남겨 주세요.",
  };
  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(list));
  dispatchHubUpdated();
}

export function loadCoupons(): Coupon[] {
  try {
    const raw = localStorage.getItem(COUPONS_KEY);
    let list: Coupon[] = [];
    if (raw) {
      const a = JSON.parse(raw) as unknown;
      if (Array.isArray(a)) list = a.filter((x) => x && typeof x === "object") as Coupon[];
    }
    if (list.length === 0 && !localStorage.getItem(COUPONS_SEEDED)) {
      list = demoCouponsSeed();
      localStorage.setItem(COUPONS_KEY, JSON.stringify(list));
      localStorage.setItem(COUPONS_SEEDED, "1");
    }
    return list;
  } catch {
    return [];
  }
}

const REGISTERED_CODES: Record<string, Omit<Coupon, "id" | "used">> = {
  MOMOA2026: {
    title: "코드 등록 — 3,000P 할인",
    discountWon: 3000,
    minOrderWon: 15000,
    expiresAt: Date.now() + 86400000 * 90,
  },
  WELCOME: {
    title: "웰컴 코드 — 배송비 무료",
    discountWon: 3000,
    minOrderWon: 0,
    expiresAt: Date.now() + 86400000 * 30,
  },
};

const redeemedCodes = (): Set<string> => {
  try {
    const raw = localStorage.getItem("momoA.redeemedCouponCodes");
    if (!raw) return new Set();
    const a = JSON.parse(raw) as unknown;
    if (!Array.isArray(a)) return new Set();
    return new Set(a.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
};

function saveRedeemed(set: Set<string>) {
  localStorage.setItem("momoA.redeemedCouponCodes", JSON.stringify([...set]));
}

export function registerCouponCode(raw: string): { ok: boolean; message: string } {
  const code = raw.trim().toUpperCase();
  if (!code) return { ok: false, message: "코드를 입력해 주세요." };
  const def = REGISTERED_CODES[code];
  if (!def) return { ok: false, message: "유효하지 않은 코드예요." };
  const used = redeemedCodes();
  if (used.has(code)) return { ok: false, message: "이미 등록한 코드예요." };
  used.add(code);
  saveRedeemed(used);
  const list = loadCoupons();
  const coupon: Coupon = {
    id: `c_reg_${Date.now()}`,
    title: def.title,
    discountWon: def.discountWon,
    minOrderWon: def.minOrderWon,
    expiresAt: def.expiresAt,
    used: false,
  };
  list.unshift(coupon);
  localStorage.setItem(COUPONS_KEY, JSON.stringify(list.slice(0, 30)));
  dispatchHubUpdated();
  return { ok: true, message: "쿠폰이 발급됐어요. 결제 시 선택할 수 있어요." };
}

export function markCouponUsed(id: string) {
  const list = loadCoupons().map((c) => (c.id === id ? { ...c, used: true } : c));
  localStorage.setItem(COUPONS_KEY, JSON.stringify(list));
  dispatchHubUpdated();
}

/** 장바구니 ‘중복 쿠폰 받기’ 등으로 즉시 발급 */
export function issueCartStackCoupon(): Coupon {
  const c: Coupon = {
    id: `c_stack_${Date.now()}`,
    title: "장바구니 중복 할인 쿠폰",
    discountWon: 2000,
    minOrderWon: 10000,
    expiresAt: Date.now() + 86400000 * 14,
    used: false,
  };
  const list = loadCoupons();
  list.unshift(c);
  localStorage.setItem(COUPONS_KEY, JSON.stringify(list.slice(0, 30)));
  dispatchHubUpdated();
  return c;
}

export function totalSpentWon(): number {
  return loadOrders().reduce((s, o) => s + (o.status === "cancelled" ? 0 : o.totalWon), 0);
}

export function orderStats() {
  const orders = loadOrders();
  let shipping = 0;
  let delivered = 0;
  let cancelled = 0;
  for (const o of orders) {
    if (o.status === "shipping") shipping += 1;
    else if (o.status === "delivered") delivered += 1;
    else if (o.status === "cancelled") cancelled += 1;
    else if (o.status === "preparing") shipping += 1;
  }
  return { shipping, delivered, cancelled, total: orders.length };
}
