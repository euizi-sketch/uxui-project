import React, { useEffect, useMemo, useRef, useState } from 'react';
import Onboarding from "./onboarding/Onboarding";
import ReloginScreen from "./onboarding/ReloginScreen";
import {
  CustomizableDefaultAvatar,
  loadDefaultAvatarStyleFromStorage,
  saveDefaultAvatarStyleToStorage,
  HAIR_COLOR_PRESETS,
  SHIRT_COLOR_PRESETS,
  HAIR_LABELS,
  SHIRT_LABELS,
  type DefaultAvatarStyle,
  type HairStyleId,
  type ShirtStyleId,
} from "./components/CustomizableDefaultAvatar";
import MainScreenTopBar from "./components/MainScreenTopBar";
import { GearTopSearchRow } from "./components/gear/GearTopSearchRow";
import GearPromoBanner, { GEAR_PROMO_FAMILY_MONTH_IMAGE_URL } from "./components/gear/GearPromoBanner";
import GearProductDetail from "./components/gear/GearProductDetail";
import { ProductThumbnailDestinationBadge } from "./components/gear/ProductThumbnailDestinationBadge";
import {
  GearHorizontalRail,
  GearSectionHeader,
  GearShowcaseCard,
} from "./components/gear/GearShowcaseCard";
import { GearCategoryFullScreen } from "./components/gear/GearCategoryFullScreen";
import GrowthRhythmProfileCard from "./components/profile/GrowthRhythmProfileCard";
import { InterestPersonalizedSection } from "./components/home/InterestPersonalizedSection";
import { HomeHeroStrip } from "./components/home/HomeHeroStrip";
import { EventCarousel } from "./components/events/EventCarousel";
import {
  loadPlaygroundReviews,
  loadWalletPoints,
  WALLET_UPDATED_EVENT,
} from "./components/events/playgroundStorage";
import {
  HUB_UPDATED_EVENT,
  issueCartStackCoupon,
  loadCoupons,
  loadInquiries,
  loadOrders,
  loadReservations,
} from "./profile/myPageHubStorage";
import { MAIN_TAB_EVENT } from "./components/home/MetricCoachModal";
import ProfileEditPage from "./pages/ProfileEditPage";
import ReviewHubPage from "./pages/ReviewHubPage";
import WeeklyTop10DetailPage from "./pages/WeeklyTop10DetailPage";
import OrderReservationHistoryPage from "./pages/OrderReservationHistoryPage";
import MyWrittenReviewsPage from "./pages/MyWrittenReviewsPage";
import MyInquiriesPage from "./pages/MyInquiriesPage";
import MyCouponsPage from "./pages/MyCouponsPage";
import MyPointsDetailPage from "./pages/MyPointsDetailPage";
import { SituationalRecommendSection } from "./pages/SituationalRecommendSection";
import CommunityEmpathyScreen from "./components/community/CommunityEmpathyScreen";
import SettingsScreen from "./settings/SettingsScreen";
import {
  isOnboardingCompleted,
  isSessionSignedOut,
  markOnboardingCompleted,
  markSessionSignedIn,
} from "./settings/accountActions";
import NotificationInboxPage from "./pages/NotificationInboxPage";
import { CartScreenProvider, useCartScreen, useOptionalCartScreen } from "./components/cart/CartScreenContext";
import ParentingConsultation3Min from "./components/consultation/ParentingConsultation3Min";
import {
  loadConsultationResult,
  type CategoryId,
  type ConsultationResult,
  type Tier,
} from "./consultation/parentingConsultation";
import { compareGearProductsByIncomeScore } from "./profile/gearIncomeRecommendation";
import {
  loadChildrenFromStorage,
  loadMyPageProfileFromStorage,
} from "./profile/momoProfileStorage";
import type { ChildProfileSlice, IncomeBracket } from "./onboarding/types";
import {
  type ScrapItem,
  SCRAP_TTL_DAYS,
  SCRAPS_UPDATED_EVENT,
  cleanupScraps,
  loadScraps,
  saveScraps,
} from "./gear/gearScrapStorage";

type MainTab = "home" | "gear" | "community" | "reviews" | "mypage";

export type Product = {
  id: number;
  name: string;
  price: string;
  score: number;
  tag: string;
  imageUrl: string;
  /** 육아용품 탭 카테고리 필터용 */
  categoryId?: string;
  /** TOP10: 추천 발달 단계 (없으면 전 단계 공통으로 정렬 가산 동일) */
  momTop10Stages?: Array<Exclude<ChildProfileSlice["developmentStage"], "">>;
  /** TOP10 정렬 가산: 아이 성별과 같을 때 앞쪽으로 */
  momTop10GenderBoost?: "female" | "male";
  /** 상품 상세 — 소개 문구 (없으면 자동 생성) */
  description?: string;
  /** 상품 상세 — 리뷰 개수 표시 */
  reviewCount?: number;
  /** 상품 상세 — 가격 메타 왼쪽 (예: 교재 포함) */
  detailMetaLeft?: string;
  /** 상품 상세 — 캐러셀 (없으면 대표 이미지로 채움) */
  galleryUrls?: string[];
  sellerName?: string;
  sellerAvatarUrl?: string;
  /** 외부 마켓(쿠팡 등) 상품 페이지 — 새 탭으로 구매 이동 */
  purchaseUrl?: string;
  externalPlatform?: string;
  /** 인기 지표 한 줄 (카드 하단 요약) */
  popularitySignal?: string;
  /** 후기·반응 요약 불릿 */
  reviewBullets?: string[];
  /** 스펙·유의사항 불릿 */
  specBullets?: string[];
  /** 가격 안내 — 상세 상단 등 */
  retailPriceNote?: string;
  /** 인스타그램 등 SNS 원본 링크 (맞춤 인기·큐레이션용) */
  instagramUrl?: string;
};

/** 첫째 아이 프로필 기준 TOP10 정렬 (발달 단계 우선 → 성별 가산 → 점수·소득구간별 가격 가중) */
function compareMomTop10Products(
  a: Product,
  b: Product,
  child: { developmentStage: string; gender: string },
  incomeBracket: IncomeBracket
): number {
  const stage = child.developmentStage as ChildProfileSlice["developmentStage"] | "";
  const stageRank = (p: Product) => {
    const s = p.momTop10Stages;
    if (!stage) return 0;
    if (!s?.length) return 1;
    return s.includes(stage) ? 2 : 0;
  };
  const sr = stageRank(b) - stageRank(a);
  if (sr !== 0) return sr;
  const genderBoost = (p: Product) =>
    child.gender && p.momTop10GenderBoost === child.gender ? 1 : 0;
  const gr = genderBoost(b) - genderBoost(a);
  if (gr !== 0) return gr;
  if (stage === "infant" && child.gender === "female") {
    const infantFemaleSpotlight = (p: Product) =>
      p.momTop10Stages?.includes("infant") && p.momTop10GenderBoost === "female" ? 1 : 0;
    const sp = infantFemaleSpotlight(b) - infantFemaleSpotlight(a);
    if (sp !== 0) return sp;
  }
  return compareGearProductsByIncomeScore(a, b, incomeBracket);
}

/** 맞춤 인기 1·2위 고정 (쿠팡·인스타 연동 데모) */
const PINNED_TOP10_IDS: readonly number[] = [501, 502];

function buildWeeklyMomVerifiedTop10(
  pool: Product[],
  child: { developmentStage: string; gender: string },
  incomeBracket: IncomeBracket
): Product[] {
  const sorted = [...pool].sort((x, y) => compareMomTop10Products(x, y, child, incomeBracket));
  const pinnedSet = new Set(PINNED_TOP10_IDS);
  const pinnedList = PINNED_TOP10_IDS.map((id) => sorted.find((p) => p.id === id)).filter(
    (p): p is Product => p != null
  );
  const rest = sorted.filter((p) => !pinnedSet.has(p.id));
  if (pinnedList.length === 0) return sorted.slice(0, 10);
  return [...pinnedList, ...rest].slice(0, 10);
}

/** 프로필 사진 미선택 시 마이페이지 기본(기본 프로필 캐릭터) */
const DEFAULT_PROFILE_AVATAR_SRC = "/avatars/avatar-default.png";

const REVIEW_SCORES_KEY = "momoA.purchaseReviewScores";
const REVIEW_TEXTS_KEY = "momoA.purchaseReviewTexts";

function loadPurchaseReviewScores(): Record<number, number> {
  try {
    const raw = localStorage.getItem(REVIEW_SCORES_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<number, number> = {};
    for (const [k, v] of Object.entries(o)) {
      const id = Number(k);
      const n = Number(v);
      if (!Number.isFinite(id) || !Number.isFinite(n)) continue;
      if (n < 0 || n > 5) continue;
      out[id] = n;
    }
    return out;
  } catch {
    return {};
  }
}

function savePurchaseReviewScores(scores: Record<number, number>) {
  try {
    const serializable: Record<string, number> = {};
    for (const [k, v] of Object.entries(scores)) serializable[String(k)] = v;
    localStorage.setItem(REVIEW_SCORES_KEY, JSON.stringify(serializable));
  } catch {
    /* ignore */
  }
}

function loadPurchaseReviewTexts(): Record<number, string> {
  try {
    const raw = localStorage.getItem(REVIEW_TEXTS_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<number, string> = {};
    for (const [k, v] of Object.entries(o)) {
      const id = Number(k);
      if (!Number.isFinite(id)) continue;
      if (typeof v !== "string") continue;
      out[id] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function savePurchaseReviewTexts(texts: Record<number, string>) {
  try {
    const serializable: Record<string, string> = {};
    for (const [k, v] of Object.entries(texts)) serializable[String(k)] = v;
    localStorage.setItem(REVIEW_TEXTS_KEY, JSON.stringify(serializable));
  } catch {
    /* ignore */
  }
}

/** 상담 탭 — 구매 제품(데모) */
const PURCHASED_FOR_REVIEW: Product[] = [
  {
    id: 1,
    name: "유기농 순면 기저귀 A형",
    price: "32,000",
    score: 95,
    tag: "구매 완료",
    imageUrl: "https://images.unsplash.com/photo-1544126592-807daa2b5d33?w=300&q=80",
  },
  {
    id: 2,
    name: "친환경 대나무 물티슈",
    price: "15,800",
    score: 88,
    tag: "구매 완료",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&q=80",
  },
  {
    id: 3,
    name: "무독성 실리콘 치발기",
    price: "12,000",
    score: 92,
    tag: "구매 완료",
    imageUrl: "https://images.unsplash.com/photo-1532210317175-013d482c7e91?w=300&q=80",
  },
  {
    id: 4,
    name: "휴대용 젖병 소독기",
    price: "89,000",
    score: 90,
    tag: "구매 완료",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80",
  },
];

/** 육아용품 왼쪽 카테고리 (짧은 세로 라벨, title로 전체 이름) */
const GEAR_CATEGORIES = [
  { id: "all", short: "전체", title: "전체" },
  { id: "diaper", short: "위생", title: "기저귀·위생" },
  { id: "feed", short: "수유", title: "수유·이유식" },
  { id: "out", short: "외출", title: "외출·이동" },
  { id: "toy", short: "놀이", title: "놀이·완구" },
  { id: "safe", short: "안전", title: "안전·가전" },
] as const;

function gearCategoryLabel(categoryId: string | undefined): string {
  if (!categoryId) return "육아용품";
  const row = GEAR_CATEGORIES.find((c) => c.id === categoryId);
  return row?.short ?? "육아용품";
}

/** 마이페이지 스크랩 묶음용 — 카탈로그에 없는 ID는 기타로 */
function gearScrapBucketKey(categoryId: string | undefined): string {
  if (!categoryId) return "other";
  return GEAR_CATEGORIES.some((c) => c.id === categoryId) ? categoryId : "other";
}

function gearScrapSectionTitle(bucketId: string): string {
  if (bucketId === "other") return "기타·미분류";
  return GEAR_CATEGORIES.find((c) => c.id === bucketId)?.title ?? bucketId;
}

/** 쿠팡 상품 페이지 (직접 구매 연결) — 가격·배송은 쿠팡 실시간 안내 기준 */
const COUPANG_AIBODLE_SHAMPOO_URL =
  "https://www.coupang.com/vp/products/9334754074?itemId=23420960215&vendorItemId=76522924288";

/** 맞춤 인기 2위 — 네이버 브랜드스토어(아가드) 상품 페이지 */
const NAVER_AGUARD_POTTY_URL =
  "https://m.brand.naver.com/aguard/products/13157218044";

/** 이번주 엄마 검증 TOP10 — 첫째 아이 발달 단계·성별로 순서 가중 (데모 풀) */
const WEEKLY_MOM_TOP10_POOL: Product[] = [
  {
    id: 501,
    name: "아이보들 샴푸, 300ml, 1개",
    price: "18,900",
    score: 100,
    tag: "맞춤 인기 1위",
    imageUrl: "/products/ibodle-shampoo.png",
    momTop10Stages: ["infant", "toddler", "preschooler"],
    momTop10GenderBoost: "female",
    categoryId: "safe",
    description:
      "유아 두피·모발용 샴푸로, 거품을 내어 부드럽게 마사지 후 헹궈 주면 돼요. 피부 상태에 따라 사용을 조절하고, 이상 반응이 있으면 사용을 중단해 주세요.",
    detailMetaLeft: "와우 회원 할인가 참고 · 쿠팡판매가 21,000원",
    reviewCount: 455,
    retailPriceNote: "쿠팡 노출 기준 와우할인 약 18,900원 · 판매가는 변동될 수 있어요.",
    purchaseUrl: COUPANG_AIBODLE_SHAMPOO_URL,
    externalPlatform: "쿠팡",
    popularitySignal: "한 달간 1,000명 이상 구매 (쿠팡 노출 기준)",
    reviewBullets: [
      "등록 리뷰 약 455건 — 같은 상품에 대한 구매 후기를 한곳에서 확인하기 좋아요.",
      "로켓 배송 등 배송 안내는 주소·재고에 따라 달라질 수 있어 결제 전 쿠팡에서 확인해 주세요.",
    ],
    specBullets: [
      "용량 300ml · 젤·크림 타입 · 유향(프레시 푸르티 시트러스 허브 계열)",
      "제조국: 대한민국 · 유통기한은 입고 로트별로 상세페이지에서 확인",
      "쿠팡상품번호 9334754074 · 민감 피부는 패치 테스트를 권장해요.",
    ],
  },
  {
    id: 502,
    name: "아가드 분리형 유아변기",
    price: "69,800",
    score: 99,
    tag: "맞춤 인기 2위",
    imageUrl: "/products/aguard-potty-rank2.png",
    momTop10Stages: ["infant", "toddler", "preschooler"],
    momTop10GenderBoost: "female",
    categoryId: "safe",
    description:
      "분리형이라 세척·보관이 수월하고, 단계적으로 배변 훈련을 이어가기 좋아요. 아이 키·발 발치에 맞춰 안정적으로 앉히고 옆에서 도와 주세요.",
    detailMetaLeft: "네이버 브랜드스토어 · 아가드 공식",
    reviewCount: 11,
    purchaseUrl: NAVER_AGUARD_POTTY_URL,
    externalPlatform: "네이버 브랜드스토어",
    popularitySignal: "아가드 공식 스토어 노출 기준 평점 4.91 · 등록 리뷰 11건",
    reviewBullets: [
      "네이버플러스 스토어에서 구매 후기와 별점을 바로 확인할 수 있어요.",
      "배송·결제 혜택은 계정·이벤트 기간에 따라 달라지니 결제 전 상세 페이지를 확인해 주세요.",
    ],
    specBullets: [
      "분리형 유아변기 · 배변 훈련·연습용으로 활용 가능해요.",
      "색상·구성·품절 여부는 스토어 상세 정보를 확인해 주세요.",
      "본 링크는 결제 페이지로 이동 가능한 상품 페이지입니다.",
    ],
    retailPriceNote:
      "표시 금액은 데모용 예시예요. 실제 판매가·할인은 네이버 브랜드스토어 상품 페이지에서 확인해 주세요.",
  },
  {
    id: 503,
    name: "무독성 실리콘 치발기",
    price: "12,000",
    score: 96,
    tag: "안전 인증",
    imageUrl: "https://images.unsplash.com/photo-1532210317175-013d482c7e91?w=200&q=80",
    momTop10Stages: ["infant"],
    momTop10GenderBoost: "female",
    categoryId: "toy",
  },
  {
    id: 504,
    name: "휴대용 젖병 소독기",
    price: "89,000",
    score: 95,
    tag: "출산 준비템",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&q=80",
    momTop10Stages: ["infant"],
    momTop10GenderBoost: "male",
    categoryId: "feed",
  },
  {
    id: 505,
    name: "아기띠 올인원 캐리어",
    price: "128,000",
    score: 94,
    tag: "허리 부담↓",
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200&q=80",
    momTop10Stages: ["infant", "toddler"],
    categoryId: "out",
  },
  {
    id: 506,
    name: "온습도계·공기청정 연동",
    price: "45,900",
    score: 93,
    tag: "수면 환경",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&q=80",
    momTop10Stages: ["infant", "toddler", "preschooler"],
    categoryId: "safe",
  },
  {
    id: 507,
    name: "저자극 아기 바스",
    price: "36,500",
    score: 92,
    tag: "신생아 필수",
    imageUrl: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=200&q=80",
    momTop10Stages: ["infant"],
    momTop10GenderBoost: "female",
    categoryId: "safe",
  },
  {
    id: 508,
    name: "유아용 칫솔 세트",
    price: "9,800",
    score: 91,
    tag: "구강 케어",
    imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=200&q=80",
    momTop10Stages: ["toddler", "preschooler"],
    categoryId: "feed",
  },
  {
    id: 509,
    name: "블록 장난감 100p",
    price: "24,000",
    score: 90,
    tag: "발달 놀이",
    imageUrl: "https://images.unsplash.com/photo-1558060379-71230465e879?w=200&q=80",
    momTop10Stages: ["toddler", "preschooler"],
    categoryId: "toy",
  },
  {
    id: 510,
    name: "아기 모기 기피 패치",
    price: "11,200",
    score: 89,
    tag: "야외 필수",
    imageUrl: "/products/baby-mosquito-patch-rank10.png",
    momTop10Stages: ["infant", "toddler", "preschooler"],
    categoryId: "out",
  },
];

function consultationPoolByTier(
  pool: Product[],
  result: ConsultationResult,
  tier: Tier,
  incomeBracket: IncomeBracket
): Product[] {
  const tierCategories: CategoryId[] =
    tier === "must"
      ? result.mustCategories.map((c) => c.id)
      : tier === "nice"
        ? result.niceCategories.map((c) => c.id)
        : result.deferCategories.map((c) => c.id);

  const catOrder = new Map<CategoryId, number>(tierCategories.map((id, i) => [id, i]));

  const filtered = pool.filter((p) => {
    const cid = p.categoryId as CategoryId | undefined;
    if (!cid || !result.categoryTier[cid]) return false;
    return result.categoryTier[cid] === tier;
  });

  return [...filtered].sort((a, b) => {
    const ca = a.categoryId as CategoryId | undefined;
    const cb = b.categoryId as CategoryId | undefined;
    if (catOrder.size > 0) {
      const oa = ca !== undefined ? catOrder.get(ca) ?? 999 : 999;
      const ob = cb !== undefined ? catOrder.get(cb) ?? 999 : 999;
      if (oa !== ob) return oa - ob;
    }
    return compareGearProductsByIncomeScore(a, b, incomeBracket);
  });
}

const GEAR_DEMO_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "유기농 순면 기저귀 A형",
    price: "32,000",
    score: 95,
    tag: "전문가 검증",
    imageUrl: "https://images.unsplash.com/photo-1544126592-807daa2b5d33?w=300&q=80",
    categoryId: "diaper",
  },
  {
    id: 2,
    name: "친환경 대나무 물티슈",
    price: "15,800",
    score: 88,
    tag: "인기 급상승",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&q=80",
    categoryId: "diaper",
  },
  {
    id: 3,
    name: "무독성 실리콘 치발기",
    price: "12,000",
    score: 92,
    tag: "KC인증 완료",
    imageUrl: "https://images.unsplash.com/photo-1532210317175-013d482c7e91?w=300&q=80",
    categoryId: "toy",
  },
];

function mergeGearProductCatalog(): Product[] {
  const m = new Map<number, Product>();
  for (const p of GEAR_DEMO_PRODUCTS) m.set(p.id, p);
  for (const p of WEEKLY_MOM_TOP10_POOL) m.set(p.id, p);
  return Array.from(m.values());
}

/** 스크랩·최근 본 등에 쓰는 통합 데모 카탈로그 (ID 중복 시 TOP10 메타가 유지됨) */
const GEAR_PRODUCT_CATALOG: Product[] = mergeGearProductCatalog();

// 1-가. 육아용품 탭 — 상담 기반 우선순위·검색·제품 목록·후기 통합 진입
function BabyGearScreen({
  onOpenReviewHub,
  onOpenConsultTab,
  detailProduct,
  onDetailProductChange,
  onOpenTop10Detail,
}: {
  onOpenReviewHub: () => void;
  onOpenConsultTab: () => void;
  detailProduct: Product | null;
  onDetailProductChange: (product: Product | null) => void;
  onOpenTop10Detail: (payload: { products: Product[]; title: string; description: string }) => void;
}) {
  const setDetailProduct = onDetailProductChange;
  const [searchTerm, setSearchTerm] = useState("");
  const [gearCategory, setGearCategory] = useState<(typeof GEAR_CATEGORIES)[number]["id"]>("all");
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);
  const [familyMonthPromoOpen, setFamilyMonthPromoOpen] = useState(false);
  const [promoSheet, setPromoSheet] = useState<{ title: string; body: string } | null>(null);

  const { addToCart, openCheckout } = useCartScreen();

  useEffect(() => {
    if (!familyMonthPromoOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFamilyMonthPromoOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [familyMonthPromoOpen]);

  const [top10ChildContext, setTop10ChildContext] = useState(() => {
    const p = loadMyPageProfileFromStorage();
    return { developmentStage: p.developmentStage, gender: p.gender };
  });

  const [incomeBracket, setIncomeBracket] = useState<IncomeBracket>(
    () => loadMyPageProfileFromStorage().incomeBracket
  );

  const [consultation, setConsultation] = useState<ConsultationResult | null>(() =>
    loadConsultationResult()
  );

  useEffect(() => {
    const sync = () => {
      const p = loadMyPageProfileFromStorage();
      setTop10ChildContext({ developmentStage: p.developmentStage, gender: p.gender });
      setIncomeBracket(p.incomeBracket);
    };
    window.addEventListener("momoA-profile-changed", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("momoA-profile-changed", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  useEffect(() => {
    const sync = () => setConsultation(loadConsultationResult());
    window.addEventListener("momoA-consultation-changed", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("momoA-consultation-changed", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const [scraps, setScraps] = useState<ScrapItem[]>(() => cleanupScraps(loadScraps()));

  useEffect(() => {
    // 1) 앱 진입 시 자동 정리(기간 만료 삭제)
    const cleaned = cleanupScraps(loadScraps());
    setScraps(cleaned);
    saveScraps(cleaned);
  }, []);

  useEffect(() => {
    // 2) 일정 간격으로도 자동 정리 (탭 켜둔 상태)
    const id = window.setInterval(() => {
      setScraps((prev) => {
        const cleaned = cleanupScraps(prev);
        if (cleaned.length !== prev.length) saveScraps(cleaned);
        return cleaned;
      });
    }, 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    saveScraps(scraps);
  }, [scraps]);

  const isScrapped = (productId: number) => scraps.some((s) => s.productId === productId);
  const toggleScrap = (productId: number) => {
    setScraps((prev) => {
      const exists = prev.some((s) => s.productId === productId);
      if (exists) return prev.filter((s) => s.productId !== productId);
      return [{ productId, savedAt: Date.now() }, ...prev];
    });
  };

  const filteredProducts = useMemo(() => {
    const list = GEAR_DEMO_PRODUCTS.filter((p) => {
      const inCategory = gearCategory === "all" || p.categoryId === gearCategory;
      return inCategory && p.name.includes(searchTerm);
    });
    return [...list].sort((a, b) => compareGearProductsByIncomeScore(a, b, incomeBracket));
  }, [gearCategory, searchTerm, incomeBracket]);

  /** 첫째 아이 성별·발달 단계·소득 구간에 맞춰 순서 조정된 TOP10 */
  const weeklyMomVerifiedTop10: Product[] = useMemo(
    () => buildWeeklyMomVerifiedTop10(WEEKLY_MOM_TOP10_POOL, top10ChildContext, incomeBracket),
    [top10ChildContext.developmentStage, top10ChildContext.gender, incomeBracket]
  );

  const top10StageLabel =
    top10ChildContext.developmentStage === "infant"
      ? "영아기"
      : top10ChildContext.developmentStage === "toddler"
        ? "유아기"
        : top10ChildContext.developmentStage === "preschooler"
          ? "아동기"
          : "";

  const top10GenderLabel =
    top10ChildContext.gender === "female" ? "여아" : top10ChildContext.gender === "male" ? "남아" : "";

  /** 마이페이지 첫째 기준 영아기 + 여아일 때 인기 순위·카피 강조 */
  const isInfantFemaleProfile =
    top10ChildContext.developmentStage === "infant" && top10ChildContext.gender === "female";

  const top10DetailPayload = useMemo(
    () => ({
      products: weeklyMomVerifiedTop10,
      title: isInfantFemaleProfile
        ? "영아기·여아 맞춤 인기"
        : top10StageLabel && top10GenderLabel
          ? `${top10StageLabel}·${top10GenderLabel} 맞춤 인기`
          : "이번 주 엄마들이 많이 본 순위",
      description: isInfantFemaleProfile
        ? incomeBracket
          ? "영아기 여아 기준으로 자주 찾는 품목을 앞에 모았어요. 프로필의 소득 구간에 맞춰 가격 순서도 조정했어요."
          : "영아기 여아 기준으로 자주 찾는 품목을 앞에 모았어요."
        : incomeBracket
          ? "맘카페·SNS·구매 후기를 모은 뒤, 반복 추천·만족 반응이 두드러진 순으로 정렬했어요. 소득 구간에 맞춰 가격대 순서를 조정했어요."
          : "맘카페·SNS·구매 후기를 모아 반복 추천·만족 반응이 두드러진 육아템 순이에요.",
    }),
    [
      weeklyMomVerifiedTop10,
      isInfantFemaleProfile,
      top10StageLabel,
      top10GenderLabel,
      incomeBracket,
    ]
  );

  const tierMust = useMemo(
    () =>
      consultation ? consultationPoolByTier(GEAR_PRODUCT_CATALOG, consultation, "must", incomeBracket) : [],
    [consultation, incomeBracket]
  );
  const tierNice = useMemo(
    () =>
      consultation ? consultationPoolByTier(GEAR_PRODUCT_CATALOG, consultation, "nice", incomeBracket) : [],
    [consultation, incomeBracket]
  );
  const tierDefer = useMemo(
    () =>
      consultation ? consultationPoolByTier(GEAR_PRODUCT_CATALOG, consultation, "defer", incomeBracket) : [],
    [consultation, incomeBracket]
  );

  return (
    <div className="flex min-h-dvh flex-col font-sans">
      <div className="shrink-0 px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
        <MainScreenTopBar />
      </div>
      <GearTopSearchRow
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenCategoryPanel={() => setCategoryPanelOpen(true)}
      />
      <GearPromoBanner
        onSlideCta={(_slideIndex, slide) => {
          if (slide.id === "consult") onOpenConsultTab();
          else if (slide.id === "sale") setFamilyMonthPromoOpen(true);
          else if (slide.id === "coupon") {
            issueCartStackCoupon();
            setPromoSheet({
              title: "첫 구매 쿠폰팩",
              body: "쿠폰함에 중복 할인 쿠폰이 발급됐어요. 장바구니 또는 결제 단계에서 적용할 수 있습니다.",
            });
          } else if (slide.id === "guide") {
            setPromoSheet({
              title: "KC 인증·안전 마크",
              body: "유아 제품 선택 시 KC 인증 여부·소재·세척 방법을 함께 확인해 보세요. 데모 앱에서는 구매처 상세 페이지에서 최종 규격을 확인하는 것을 권장합니다.",
            });
          } else {
            setPromoSheet({
              title: slide.title.replace(/\n/g, " "),
              body: slide.sub,
            });
          }
        }}
      />

      <div className="min-w-0 flex-1 space-y-8 overflow-x-hidden px-4 pb-safe-tab pt-5 sm:px-5">
        {consultation ? (
          <>
            <div className="rounded-2xl border border-white/90 bg-white p-5 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)]">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#FF853E]">상담 반영</p>
              <h2 className="mt-1.5 text-base font-bold text-slate-900">필수 · 추천 · 나중에</h2>
              <p className="mt-2 text-sm font-semibold leading-snug text-slate-800">{consultation.direction}</p>
              <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">
                {consultation.oneLiner}
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] font-medium text-slate-400">
                {isInfantFemaleProfile ? (
                  <>
                    <span className="inline-flex items-center rounded-full border border-[#FFD2BF] bg-[#FFF1EA] px-2 py-0.5 font-bold text-[#C2410C]">
                      영아·여아
                    </span>
                    <span>프로필 반영{incomeBracket ? " · 가격대 반영" : ""}</span>
                  </>
                ) : top10StageLabel || top10GenderLabel ? (
                  <>
                    <span>{[top10StageLabel, top10GenderLabel].filter(Boolean).join(" · ")}</span>
                    <span>·</span>
                    <span>프로필 반영{incomeBracket ? " · 가격대 반영" : ""}</span>
                  </>
                ) : incomeBracket ? (
                  "가구 소득에 맞춘 가격 순서"
                ) : (
                  "프로필을 채우면 더 정확해져요"
                )}
              </p>
            </div>

            {(
              [
                {
                  key: "must",
                  title: "지금 필수",
                  hint: "상담에서 먼저 보라고 한 카테고리 순",
                  list: tierMust,
                  badge: "필수",
                },
                {
                  key: "nice",
                  title: "있으면 좋음",
                  hint: "여유 생기면",
                  list: tierNice,
                  badge: "추천",
                },
                {
                  key: "defer",
                  title: "나중에",
                  hint: "우선순위 낮음",
                  list: tierDefer,
                  badge: "보류",
                },
              ] as const
            ).map((block) => (
              <section key={block.key} aria-label={block.title}>
                <GearSectionHeader
                  title={block.title}
                  onMore={() =>
                    setPromoSheet({
                      title: block.title,
                      body: "상담 결과로 카테고리 순위를 정했고, 같은 줄 안에서는 가격·프로필 가중 순이에요. 카드를 누르면 상세로 이동해요.",
                    })
                  }
                />
                <p className="mb-3 text-[12px] font-medium text-slate-400">{block.hint}</p>
                {block.list.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-white py-8 text-center text-xs font-medium text-slate-400">
                    이 단계에 해당하는 상품이 없어요.
                  </p>
                ) : (
                  <GearHorizontalRail>
                    {block.list.map((p) => (
                      <GearShowcaseCard
                        key={p.id}
                        product={p}
                        categoryLabel={gearCategoryLabel(p.categoryId)}
                        badge={block.badge}
                        instagramListing={Boolean(p.instagramUrl && !p.purchaseUrl)}
                        onSelect={() => setDetailProduct(p)}
                        isScrapped={isScrapped(p.id)}
                        onToggleScrap={(e) => {
                          e.stopPropagation();
                          toggleScrap(p.id);
                        }}
                      />
                    ))}
                  </GearHorizontalRail>
                )}
              </section>
            ))}

            <button
              type="button"
              onClick={onOpenConsultTab}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#FFD2BF] bg-white py-3.5 text-sm font-semibold text-[#E85A20] shadow-sm transition hover:bg-[#FFFCF9]"
            >
              상담 다시
              <span aria-hidden>→</span>
            </button>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-[#FFD2BF]/50 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-900">
                <span className="text-sky-600">AI 상담</span>
                <span className="text-slate-900"> 후 아래 추천이 켜져요</span>
              </p>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-500">
                필수·추천·나중에 순서는 상담 답변을 따라가요.
              </p>
              <button
                type="button"
                onClick={onOpenConsultTab}
                className="mt-4 w-full rounded-full bg-[#FF853E] py-3 text-sm font-bold text-white shadow-md shadow-orange-200/40"
              >
                상담 받기
              </button>
            </div>

            <section aria-label="이번 주 인기 순위">
              <GearSectionHeader
                title={
                  isInfantFemaleProfile ? (
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-[#FF853E] px-3 py-1 text-[13px] font-bold leading-tight text-white shadow-sm">
                        영아기 여아
                      </span>
                      <span>맞춤 인기</span>
                    </span>
                  ) : top10StageLabel && top10GenderLabel ? (
                    `${top10StageLabel}·${top10GenderLabel} 맞춤 인기`
                  ) : (
                    "이번 주 엄마들이 많이 본 순위"
                  )
                }
                onMore={() => onOpenTop10Detail(top10DetailPayload)}
              />
              <p className="mb-3 text-[12px] font-medium text-slate-500">
                {isInfantFemaleProfile ? (
                  <>
                    <span className="font-semibold text-[#E85A20]">영아기 여아</span> 기준으로 자주 찾는 품목을 앞에 모았어요.
                    {incomeBracket ? (
                      <span className="mt-1.5 block">소득 구간에 맞춰 가격 순서도 조정했어요.</span>
                    ) : null}
                  </>
                ) : (
                  <>
                    맘카페·SNS·구매 후기를 모아 반복 추천·만족 반응이 두드러진 육아템이에요.
                    {incomeBracket ? " · 프로필의 소득 구간에 맞춰 가격대 순서를 조정했어요." : ""}
                  </>
                )}
              </p>
              <GearHorizontalRail>
                {weeklyMomVerifiedTop10.map((p, index) => (
                  <GearShowcaseCard
                    key={p.id}
                    product={p}
                    categoryLabel={gearCategoryLabel(p.categoryId)}
                    rank={index + 1}
                    instagramListing={Boolean(p.instagramUrl && !p.purchaseUrl)}
                    onSelect={() => setDetailProduct(p)}
                    isScrapped={isScrapped(p.id)}
                    onToggleScrap={(e) => {
                      e.stopPropagation();
                      toggleScrap(p.id);
                    }}
                  />
                ))}
              </GearHorizontalRail>

              <button
                type="button"
                onClick={() => onOpenTop10Detail(top10DetailPayload)}
                className="mt-4 w-full rounded-full bg-[#FF853E] py-3.5 text-sm font-bold text-white shadow-md shadow-orange-200/30 transition hover:brightness-[1.02]"
              >
                순위 자세히 보기
              </button>
            </section>
          </>
        )}

        <section className="mt-1 space-y-3" aria-label="멀티채널 후기">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-600">Review hub</p>
            <h2 className="mt-0.5 text-[17px] font-bold leading-snug tracking-tight text-slate-900">
              멀티채널 후기 모아보기
            </h2>
            <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
              관심 물품을 고르면 출처별 후기를 한 화면에서 비교해요.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenReviewHub}
            className="relative w-full overflow-hidden rounded-[1.35rem] border border-sky-200/90 bg-gradient-to-br from-sky-100 via-sky-50 to-white text-left shadow-sm shadow-sky-900/10 ring-1 ring-sky-200/55 transition hover:shadow-md hover:ring-sky-300/50 active:scale-[0.992]"
          >
            <div className="relative p-4 sm:p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "맘카페", className: "bg-white text-sky-900 ring-sky-200/90" },
                    { label: "인스타", className: "bg-white text-sky-900 ring-sky-200/90" },
                    { label: "쿠팡", className: "bg-white text-sky-900 ring-sky-200/90" },
                    { label: "네이버", className: "bg-white text-sky-900 ring-sky-200/90" },
                  ].map((ch) => (
                    <span
                      key={ch.label}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${ch.className}`}
                    >
                      {ch.label}
                    </span>
                  ))}
                </div>
                <p className="mt-2.5 text-[15px] font-bold leading-snug text-slate-900">
                  맘카페·SNS·쇼핑몰 후기 한번에 비교
                </p>
                <p className="mt-1 text-[12px] font-medium leading-snug text-slate-600">
                  같은 제품도 채널마다 톤이 달라요. 통합 요약으로만 골라보세요.
                </p>
              </div>
            </div>
          </button>
        </section>

        <section className="mt-8 space-y-4" aria-label="추천 제품">
          <div>
            <h2 className="text-[17px] font-bold leading-snug tracking-tight text-slate-900">추천 제품</h2>
            <p className="mt-1 text-[12px] font-medium text-slate-500">검색·카테고리에 맞춰 골라둔 육아템이에요.</p>
          </div>
          <div className="space-y-3">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetailProduct(product)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDetailProduct(product);
                    }
                  }}
                  className="group relative cursor-pointer overflow-hidden rounded-[1.35rem] border border-[#FFD2BF]/70 bg-white shadow-[0_8px_28px_-12px_rgba(255,133,62,0.12)] transition hover:border-[#FFC4A8] hover:shadow-md active:scale-[0.993]"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="relative h-[5.25rem] w-[5.25rem] shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-inner ring-2 ring-white">
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      <div className="pointer-events-none absolute inset-0 bg-slate-900/5" />
                      <ProductThumbnailDestinationBadge
                        purchaseUrl={product.purchaseUrl}
                        instagramUrl={product.instagramUrl}
                        externalPlatform={product.externalPlatform}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-bold leading-snug text-slate-900">{product.name}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2">
                        <span className="rounded-full bg-[#FFF1EA] px-2.5 py-0.5 text-[10px] font-bold text-[#E85A20] ring-1 ring-[#FFD2BF]/80">
                          신뢰 {product.score}점
                        </span>
                        <span className="rounded-md bg-slate-100/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          {product.tag}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleScrap(product.id);
                          }}
                          className={`ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[15px] ring-1 transition ${
                            isScrapped(product.id)
                              ? "bg-[#FFF1EA] text-[#FF853E] ring-[#FFD2BF] shadow-sm"
                              : "bg-white text-slate-400 ring-slate-200 hover:bg-slate-50"
                          }`}
                          aria-label={isScrapped(product.id) ? "스크랩 해제" : "스크랩"}
                        >
                          {isScrapped(product.id) ? "★" : "☆"}
                        </button>
                      </div>
                      <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-slate-100/90 pt-2.5">
                        <p className="text-lg font-bold tabular-nums tracking-tight text-slate-900">
                          {product.price}
                          <span className="text-sm font-normal text-slate-500">원</span>
                        </p>
                        <span className="text-[11px] font-semibold text-[#FF853E] opacity-0 transition group-hover:opacity-100">
                          상세 보기
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 py-14 text-center">
                <p className="text-sm font-normal text-slate-500">검색 결과가 없어요</p>
                <p className="mt-1 text-xs font-medium text-slate-400">다른 검색어나 카테고리를 선택해 보세요.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {promoSheet && (
        <div
          className="app-viewport-fixed z-[81] flex items-end justify-center bg-black/45 px-4 pb-safe-tab pt-12"
          role="dialog"
          aria-modal="true"
          aria-labelledby="promo-sheet-title"
        >
          <div className="w-full max-w-lg rounded-t-3xl bg-white px-5 pb-8 pt-6 shadow-2xl">
            <p id="promo-sheet-title" className="text-[17px] font-bold text-slate-900">
              {promoSheet.title}
            </p>
            <p className="mt-3 text-[13px] font-medium leading-relaxed text-slate-600">{promoSheet.body}</p>
            <button
              type="button"
              onClick={() => setPromoSheet(null)}
              className="mt-6 w-full rounded-2xl bg-[#FF853E] py-3.5 text-sm font-bold text-white"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {familyMonthPromoOpen && (
        <div
          className="app-viewport-fixed z-[82] flex flex-col bg-white"
          role="dialog"
          aria-modal="true"
          aria-labelledby="family-month-promo-title"
        >
          <header className="flex shrink-0 items-center gap-2 border-b border-slate-100 bg-white px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:px-4">
            <button
              type="button"
              onClick={() => setFamilyMonthPromoOpen(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-800 hover:bg-slate-100"
              aria-label="닫기"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h1 id="family-month-promo-title" className="min-w-0 flex-1 text-center text-[16px] font-bold text-slate-900">
              가정의 달 특가
            </h1>
            <span className="h-10 w-10 shrink-0" aria-hidden />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white pb-safe-tab">
            <div className="mx-auto w-full max-w-lg px-5 pb-10 pt-6 sm:px-6">
              <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
                <img
                  src={GEAR_PROMO_FAMILY_MONTH_IMAGE_URL}
                  alt=""
                  className="aspect-[16/10] w-full object-cover"
                  decoding="async"
                />
              </div>
              <p className="mt-2 text-center text-[11px] font-medium text-slate-400">가정의 달 · 가족과 함께하는 시간</p>
              <h2 className="mt-6 text-xl font-bold leading-snug tracking-tight text-slate-900">
                2026 가정의 달 기념 구독·혜택 특가
              </h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                가정의 달을 맞아 모모아 구독과 인기 육아템 혜택을 한데 모았어요. 맘카페에서 반응이 좋았던 상품 위주로
                구성했으며, 앱에서만 제공되는 할인과 무료배송 쿠폰도 함께 확인해 보세요.
              </p>
              <ul className="mt-6 space-y-3 text-sm font-medium leading-relaxed text-slate-700">
                <li className="flex gap-2">
                  <span className="text-[#F97316]" aria-hidden>
                    •
                  </span>
                  구독 서비스 첫 달 할인 및 추가 월 할인 쿠폰
                </li>
                <li className="flex gap-2">
                  <span className="text-[#F97316]" aria-hidden>
                    •
                  </span>
                  가정의 달 한정 묶음 특가 및 무료배송
                </li>
                <li className="flex gap-2">
                  <span className="text-[#F97316]" aria-hidden>
                    •
                  </span>
                  이벤트 기간 및 대상 상품은 앱 내 안내를 따릅니다.
                </li>
              </ul>
              <p className="mt-8 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-center text-xs font-medium text-slate-500">
                데모 화면입니다. 실제 결제·구독은 서비스 오픈 후 안내예요.
              </p>
            </div>
          </div>
        </div>
      )}

      {detailProduct && (
        <GearProductDetail
          product={detailProduct}
          categoryLabel={gearCategoryLabel(detailProduct.categoryId)}
          onClose={() => setDetailProduct(null)}
          isScrapped={isScrapped(detailProduct.id)}
          onToggleScrap={() => toggleScrap(detailProduct.id)}
          {...(detailProduct.instagramUrl && !detailProduct.purchaseUrl
            ? {}
            : {
                onAddToCart: () => {
                  addToCart({
                    id: detailProduct.id,
                    name: detailProduct.name,
                    price: detailProduct.price,
                    imageUrl: detailProduct.imageUrl,
                  });
                },
                onBuyNow: () => {
                  addToCart({
                    id: detailProduct.id,
                    name: detailProduct.name,
                    price: detailProduct.price,
                    imageUrl: detailProduct.imageUrl,
                  });
                  openCheckout();
                  setDetailProduct(null);
                },
              })}
        />
      )}

      <GearCategoryFullScreen
        open={categoryPanelOpen}
        onClose={() => setCategoryPanelOpen(false)}
        categories={GEAR_CATEGORIES}
        selectedCategoryId={gearCategory}
        onSelectCategory={(id) => setGearCategory(id as (typeof GEAR_CATEGORIES)[number]["id"])}
      />
    </div>
  );
}

// 1-나. 홈 — 동네·MOMOA·알림 + 안내 (탭 이탈 시 언마운트 → 재진입 시 관심사 다시 로드)
function Home() {
  const [interests, setInterests] = useState(() => loadMyPageProfileFromStorage().interests);

  useEffect(() => {
    const sync = () => setInterests(loadMyPageProfileFromStorage().interests);
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col font-sans">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <MainScreenTopBar />
      </div>

      <HomeHeroStrip interests={interests} />

      <div className="mt-6 flex flex-col gap-6 px-5 pb-safe-tab sm:px-6">
        <EventCarousel />
        <InterestPersonalizedSection interests={interests} />
      </div>
    </div>
  );
}

function MyPage({
  onOpenSettings,
  onOpenOrderHistory,
  onOpenWrittenReviews,
  onOpenInquiries,
  onOpenCoupons,
  onOpenPoints,
  onOpenNotifications,
}: {
  onOpenSettings: () => void;
  onOpenOrderHistory: () => void;
  onOpenWrittenReviews: () => void;
  onOpenInquiries: () => void;
  onOpenCoupons: () => void;
  onOpenPoints: () => void;
  onOpenNotifications: () => void;
}) {
  const cart = useOptionalCartScreen();
  const recentViewProducts = useMemo(() => GEAR_PRODUCT_CATALOG.slice(0, 6), []);

  const [scrapCategoryTab, setScrapCategoryTab] = useState<
    (typeof GEAR_CATEGORIES)[number]["id"] | "other"
  >("all");
  const [momoBannerOpen, setMomoBannerOpen] = useState(false);
  const [scraps, setScraps] = useState<ScrapItem[]>(() => cleanupScraps(loadScraps()));
  const [profile, setProfile] = useState(() => loadMyPageProfileFromStorage());
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileImageDataUrl, setProfileImageDataUrl] = useState(() => {
    return localStorage.getItem("momoA.profileImage") || DEFAULT_PROFILE_AVATAR_SRC;
  });
  const [defaultAvatarStyle, setDefaultAvatarStyle] = useState<DefaultAvatarStyle>(() =>
    loadDefaultAvatarStyleFromStorage()
  );
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [walletPoints, setWalletPoints] = useState(() => loadWalletPoints());
  const avatarScrollRef = useRef<HTMLDivElement | null>(null);

  const [hubTick, setHubTick] = useState(0);

  useEffect(() => {
    const onWallet = () => setWalletPoints(loadWalletPoints());
    window.addEventListener(WALLET_UPDATED_EVENT, onWallet);
    return () => window.removeEventListener(WALLET_UPDATED_EVENT, onWallet);
  }, []);

  useEffect(() => {
    const onHub = () => setHubTick((x) => x + 1);
    window.addEventListener(HUB_UPDATED_EVENT, onHub);
    return () => window.removeEventListener(HUB_UPDATED_EVENT, onHub);
  }, []);

  const hubCounts = useMemo(() => {
    const orderN = loadOrders().length;
    const resN = loadReservations().length;
    const reviewN = loadPlaygroundReviews().length;
    const inqN = loadInquiries().length;
    const couponN = loadCoupons().filter((c) => !c.used && c.expiresAt > Date.now()).length;
    return {
      orderReservation: orderN + resN,
      reviews: reviewN,
      inquiries: inqN,
      coupons: couponN,
    };
  }, [hubTick, walletPoints]);

  /** 카드 192px + gap-4(16px) */
  const AVATAR_SCROLL_STEP = 208;
  const scrollAvatarStrip = (dir: -1 | 1) => {
    avatarScrollRef.current?.scrollBy({
      left: dir * AVATAR_SCROLL_STEP,
      behavior: "smooth",
    });
  };

  const presetProfileAvatars: { id: string; src: string; label: string }[] = [
    { id: "a2", src: "/avatars/avatar-2.png", label: "주부맘" },
    { id: "a1", src: "/avatars/avatar-1.png", label: "워킹맘" },
    { id: "a4", src: "/avatars/avatar-house-pa.png", label: "주부파" },
    { id: "a3", src: "/avatars/avatar-working-pa.png", label: "워킹파" },
    { id: "a5", src: "/avatars/avatar-grandma.png", label: "그랜마" },
    { id: "a6", src: "/avatars/avatar-grandpa.png", label: "그랜파" },
    { id: "a0", src: DEFAULT_PROFILE_AVATAR_SRC, label: "기본 프로필" },
  ];

  const isDefaultPresetSelected = profileImageDataUrl === DEFAULT_PROFILE_AVATAR_SRC;

  const patchDefaultAvatarStyle = (patch: Partial<DefaultAvatarStyle>) => {
    setDefaultAvatarStyle((prev) => {
      const next = { ...prev, ...patch };
      saveDefaultAvatarStyleToStorage(next);
      return next;
    });
  };

  const applyProfileImage = (value: string) => {
    const trimmed = value.trim();
    setProfileImageDataUrl(trimmed || DEFAULT_PROFILE_AVATAR_SRC);
    if (trimmed) localStorage.setItem("momoA.profileImage", trimmed);
    else localStorage.removeItem("momoA.profileImage");
  };

  useEffect(() => {
    const cleaned = cleanupScraps(loadScraps());
    setScraps(cleaned);
    saveScraps(cleaned);
  }, []);

  useEffect(() => {
    const sync = () => setScraps(cleanupScraps(loadScraps()));
    window.addEventListener(SCRAPS_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SCRAPS_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    // 설정/온보딩 이후 재진입 시 최신 프로필 반영
    const handler = () => {
      setProfile(loadMyPageProfileFromStorage());
      setProfileImageDataUrl(
        localStorage.getItem("momoA.profileImage") || DEFAULT_PROFILE_AVATAR_SRC
      );
      setDefaultAvatarStyle(loadDefaultAvatarStyleFromStorage());
    };
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setScraps((prev) => {
        const cleaned = cleanupScraps(prev);
        if (cleaned.length !== prev.length) saveScraps(cleaned);
        return cleaned;
      });
    }, 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const scrapResolved = useMemo(() => {
    const map = new Map(GEAR_PRODUCT_CATALOG.map((p) => [p.id, p]));
    const rows = scraps
      .map((s) => {
        const p = map.get(s.productId);
        if (!p) return null;
        return { ...p, savedAt: s.savedAt };
      })
      .filter(Boolean) as (Product & { savedAt: number })[];
    rows.sort((a, b) => b.savedAt - a.savedAt);
    return rows;
  }, [scraps]);

  const scrapGrouped = useMemo(() => {
    const g = new Map<string, (Product & { savedAt: number })[]>();
    for (const row of scrapResolved) {
      const key = gearScrapBucketKey(row.categoryId);
      const arr = g.get(key) ?? [];
      arr.push(row);
      g.set(key, arr);
    }
    for (const arr of g.values()) {
      arr.sort((a, b) => b.savedAt - a.savedAt);
    }
    return g;
  }, [scrapResolved]);

  const scrapCategoryOrder = useMemo(
    () => GEAR_CATEGORIES.filter((c) => c.id !== "all").map((c) => c.id),
    []
  );

  useEffect(() => {
    if (scrapCategoryTab === "all") return;
    const n = scrapGrouped.get(scrapCategoryTab)?.length ?? 0;
    if (n === 0) setScrapCategoryTab("all");
  }, [scrapCategoryTab, scrapGrouped]);

  const removeScrap = (productId: number) => {
    const next = scraps.filter((s) => s.productId !== productId);
    setScraps(next);
    saveScraps(next);
  };

  const isScrappedProduct = (productId: number) => scraps.some((s) => s.productId === productId);
  const toggleScrapProduct = (productId: number) => {
    setScraps((prev) => {
      const exists = prev.some((s) => s.productId === productId);
      const next = exists
        ? prev.filter((s) => s.productId !== productId)
        : [{ productId, savedAt: Date.now() }, ...prev];
      saveScraps(next);
      return next;
    });
  };

  const userTypeLabel =
    profile.userType === "mom"
      ? "엄마"
      : profile.userType === "dad"
        ? "아빠"
        : profile.userType === "grandparent"
          ? "조부모"
          : profile.userType === "guardian"
            ? "보호자"
            : profile.userType === "other"
              ? "기타"
              : "";

  const genderLabel =
    profile.gender === "female" ? "여아" : profile.gender === "male" ? "남아" : "";

  const stageLabel =
    profile.developmentStage === "infant"
      ? "영아"
      : profile.developmentStage === "toddler"
        ? "유아"
        : profile.developmentStage === "preschooler"
          ? "아동기"
          : "";

  /** 예: 영아, 여아 1명 / 유아, 남아·여아 2명 */
  const childSummaryLine = useMemo(() => {
    const kids = loadChildrenFromStorage();
    const n = Math.max(1, kids.length);
    const females = kids.filter((k) => k.gender === "female").length;
    const males = kids.filter((k) => k.gender === "male").length;

    let tail: string;
    if (females > 0 && males > 0) {
      tail = `여아·남아 ${n}명`;
    } else if (females === n && males === 0) {
      tail = `여아 ${n}명`;
    } else if (males === n && females === 0) {
      tail = `남아 ${n}명`;
    } else {
      tail = `아이 ${n}명`;
    }

    const head = stageLabel || "아이 정보";
    return `${head}, ${tail}`;
  }, [profile.developmentStage, profile.childrenCount, stageLabel]);

  const parsedBirth = useMemo(() => {
    const raw = (profile.birthDate || "").trim();
    // Accept "YYYY-MM-DD" or "YYYY.MM.DD" or "YYYY/MM/DD"
    const m = raw.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
    const dt = new Date(y, mo - 1, d);
    if (Number.isNaN(dt.getTime())) return null;
    // Guard against Date overflow coercion
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    return dt;
  }, [profile.birthDate]);

  const ageMonths = useMemo(() => {
    if (!parsedBirth) return null;
    const now = new Date();
    let months = (now.getFullYear() - parsedBirth.getFullYear()) * 12 + (now.getMonth() - parsedBirth.getMonth());
    if (now.getDate() < parsedBirth.getDate()) months -= 1;
    return Math.max(0, months);
  }, [parsedBirth]);

  const dPlus = useMemo(() => {
    if (!parsedBirth) return null;
    const now = new Date();
    const start = new Date(parsedBirth.getFullYear(), parsedBirth.getMonth(), parsedBirth.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.floor((today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, diff);
  }, [parsedBirth]);

  const birthKorean = useMemo(() => {
    if (!parsedBirth) return "";
    const y = parsedBirth.getFullYear();
    const m = parsedBirth.getMonth() + 1;
    const d = parsedBirth.getDate();
    return `${y}년 ${m}월 ${d}일`;
  }, [parsedBirth]);

  const ProfileChip = ({ label }: { label: string }) => (
    <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700">
      {label}
    </span>
  );

  return (
    <div className="min-h-dvh px-5 pb-safe-tab pt-6 sm:px-6 sm:pt-8">
      <header className="mb-5">
        <div className="flex min-h-[2.75rem] items-center justify-between gap-3">
          <h1 className="min-w-0 shrink text-left text-lg font-bold text-slate-900">마이페이지</h1>
          <div className="flex shrink-0 justify-end gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label="설정"
          >
            <span className="text-lg">⚙️</span>
          </button>
          <button
            type="button"
            onClick={onOpenNotifications}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label="알림"
          >
            <span className="text-lg">🔔</span>
          </button>
          <button
            type="button"
            onClick={() => cart?.openCart() ?? window.alert("장바구니(데모)")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label="장바구니"
          >
            <span className="text-lg">🛒</span>
          </button>
          </div>
        </div>
      </header>

      <div className="px-0 pb-2 pt-1">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div className="mx-auto shrink-0 sm:mx-0">
            <button
              type="button"
              onClick={() => setAvatarPickerOpen(true)}
              className="relative h-40 w-40 shrink-0 overflow-hidden rounded-3xl bg-[#FFF8F4]"
              aria-label="프로필 사진 수정"
            >
              {isDefaultPresetSelected ? (
                <div className="flex h-full w-full items-center justify-center bg-[#FFF8F4]">
                  <CustomizableDefaultAvatar
                    avatarStyle={defaultAvatarStyle}
                    size={144}
                    className="max-h-[92%] w-auto"
                  />
                </div>
              ) : profileImageDataUrl ? (
                <img
                  src={profileImageDataUrl}
                  alt="프로필 사진"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-[#FF853E]">
                  {profile.nickname?.trim() ? profile.nickname.trim().slice(0, 1) : "M"}
                </div>
              )}
              <span
                className="absolute bottom-[-6px] right-[-6px] inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm text-slate-700 shadow-md"
                aria-hidden="true"
              >
                ✎
              </span>
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start gap-2">
                  <p className="min-w-0 max-w-full text-base font-bold leading-snug text-slate-900 sm:text-lg">
                    {profile.nickname?.trim() ? profile.nickname.trim() : "사용자"}
                  </p>
                  {userTypeLabel && (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-[#FFF1EA] px-2 py-0.5 text-[11px] font-bold text-[#FF853E]">
                      {userTypeLabel}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-normal leading-relaxed text-slate-500">{childSummaryLine}</p>
              </div>
              <button
                type="button"
                onClick={() => setProfileEditOpen(true)}
                className="shrink-0 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                나의 프로필 정보 <span aria-hidden="true">›</span>
              </button>
            </div>

            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                관심 카테고리
              </p>
              {profile.interests.filter(Boolean).length > 0 ? (
                <div
                  className="rounded-2xl bg-[#FFF8F4]/90 px-2.5 py-2"
                  aria-label="설정한 관심사"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.filter(Boolean).map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-lg bg-white px-2 py-0.5 text-[11px] font-bold text-[#FF853E] shadow-sm sm:text-xs"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50/90 px-2.5 py-2 text-[11px] font-normal leading-snug text-slate-500 sm:text-xs">
                  관심사 없음 · 프로필에서 추가할 수 있어요
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <GrowthRhythmProfileCard dense />
        </div>

        <div className="mt-3 rounded-2xl bg-slate-50/70 py-3">
          <div className="grid grid-cols-5 gap-1 text-center">
            {[
              {
                label: "주문·예약",
                value: hubCounts.orderReservation,
                icon: "🧾",
                onClick: onOpenOrderHistory,
              },
              {
                label: "리뷰",
                value: hubCounts.reviews,
                icon: "✍️",
                onClick: onOpenWrittenReviews,
              },
              {
                label: "문의",
                value: hubCounts.inquiries,
                icon: "❓",
                onClick: onOpenInquiries,
              },
              {
                label: "쿠폰",
                value: `${hubCounts.coupons}장`,
                icon: "🎟️",
                onClick: onOpenCoupons,
              },
              {
                label: "포인트",
                value: `${walletPoints.toLocaleString()}P`,
                icon: "P",
                onClick: onOpenPoints,
              },
            ].map((x) => (
              <button
                key={x.label}
                type="button"
                onClick={x.onClick}
                className="rounded-xl px-1 py-2 hover:bg-white/90"
              >
                <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-xs font-semibold text-slate-700 shadow-sm">
                  {x.icon}
                </div>
                <p className="text-[10px] font-normal text-slate-500">{x.label}</p>
                <p className="mt-0.5 text-[11px] font-bold text-slate-900">
                  {typeof x.value === "number" ? x.value.toLocaleString() : x.value}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {ageMonths !== null && <ProfileChip label={`생후 ${ageMonths}개월`} />}
          {dPlus !== null && <ProfileChip label={`D+${dPlus}`} />}
          {birthKorean && <ProfileChip label={`출생일 ${birthKorean}`} />}
          {genderLabel && <ProfileChip label={genderLabel} />}
        </div>

        {avatarPickerOpen && (
          <div className="app-viewport-fixed z-[70] flex items-end justify-center bg-black/40 sm:items-center">
            <button
              type="button"
              className="absolute inset-0"
              aria-label="닫기"
              onClick={() => setAvatarPickerOpen(false)}
            />
            <div className="relative z-[71] mx-auto w-full max-w-full rounded-t-3xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-3xl sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xl font-bold text-slate-900">프로필 사진</p>
                <button
                  type="button"
                  onClick={() => setAvatarPickerOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100"
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>
              <p className="mb-6 text-base font-normal text-slate-500">캐릭터를 골라 주세요.</p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="inline-flex h-14 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-bold leading-none text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                  aria-label="이전 캐릭터"
                  onClick={() => scrollAvatarStrip(-1)}
                >
                  ‹
                </button>
                <div
                  ref={avatarScrollRef}
                  className="min-w-0 flex-1 overflow-x-auto overflow-y-visible py-5 [scrollbar-width:thin]"
                >
                  <div className="flex w-max snap-x snap-mandatory gap-4 px-4">
                  {presetProfileAvatars.map((a) => {
                    const selected = profileImageDataUrl === a.src;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          applyProfileImage(a.src);
                          setAvatarPickerOpen(false);
                        }}
                        className={`relative w-[192px] shrink-0 snap-start rounded-3xl bg-white p-1 transition ${
                          selected
                            ? "z-[1] ring-4 ring-[#FF853E] ring-offset-4 ring-offset-white"
                            : "ring-2 ring-transparent ring-offset-4 ring-offset-white hover:ring-slate-300"
                        }`}
                      >
                        <div className="overflow-hidden rounded-2xl bg-[#FFF8F4]">
                          <div className="flex aspect-square items-center justify-center p-5">
                            {a.id === "a0" ? (
                              <CustomizableDefaultAvatar
                                avatarStyle={defaultAvatarStyle}
                                size={148}
                                className="max-h-full w-auto"
                              />
                            ) : (
                              <img
                                src={a.src}
                                alt={a.label}
                                className="h-full w-full object-contain"
                              />
                            )}
                          </div>
                        </div>
                        <span className="block px-1 py-3 text-center text-sm font-bold leading-tight text-slate-700">
                          {a.label}
                        </span>
                      </button>
                    );
                  })}
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-14 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-bold leading-none text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                  aria-label="다음 캐릭터"
                  onClick={() => scrollAvatarStrip(1)}
                >
                  ›
                </button>
              </div>

              {isDefaultPresetSelected && (
                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:p-6">
                  <p className="text-sm font-bold text-slate-900">기본 프로필 꾸미기</p>
                  <p className="mt-1 text-xs font-normal text-slate-500">
                    머리 스타일·색과 옷 스타일·색을 바꿀 수 있어요.
                  </p>
                  <div className="mx-auto mt-4 flex justify-center">
                    <CustomizableDefaultAvatar
                      avatarStyle={defaultAvatarStyle}
                      size={168}
                      className="drop-shadow-sm"
                    />
                  </div>
                  <div className="mt-6 space-y-5">
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-600">머리 스타일</p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(HAIR_LABELS) as HairStyleId[]).map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => patchDefaultAvatarStyle({ hairStyle: id })}
                            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                              defaultAvatarStyle.hairStyle === id
                                ? "bg-[#FF853E] text-white shadow-sm"
                                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {HAIR_LABELS[id]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-600">머리 색</p>
                      <div className="flex flex-wrap gap-2">
                        {HAIR_COLOR_PRESETS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            aria-label={`머리 색 ${c}`}
                            onClick={() => patchDefaultAvatarStyle({ hairColor: c })}
                            className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-white transition ${
                              defaultAvatarStyle.hairColor === c
                                ? "ring-[#FF853E]"
                                : "ring-transparent hover:ring-slate-300"
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-600">옷 스타일</p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(SHIRT_LABELS) as ShirtStyleId[]).map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => patchDefaultAvatarStyle({ shirtStyle: id })}
                            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                              defaultAvatarStyle.shirtStyle === id
                                ? "bg-[#FF853E] text-white shadow-sm"
                                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {SHIRT_LABELS[id]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-600">옷 색</p>
                      <div className="flex flex-wrap gap-2">
                        {SHIRT_COLOR_PRESETS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            aria-label={`옷 색 ${c}`}
                            onClick={() => patchDefaultAvatarStyle({ shirtColor: c })}
                            className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-white transition ${
                              defaultAvatarStyle.shirtColor === c
                                ? "ring-[#FF853E]"
                                : "ring-transparent hover:ring-slate-300"
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl bg-[#FF853E] shadow-sm">
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">모모아와 함께 더 쉽게</p>
            <p className="mt-1 text-xs font-semibold text-white/90">
              나에게 맞는 육아템을 추천받고 기록해보세요.
            </p>
            <button
              type="button"
              onClick={() => setMomoBannerOpen(true)}
              className="mt-3 rounded-2xl bg-white/95 px-4 py-2 text-xs font-bold text-[#FF853E] ring-1 ring-white/70 hover:bg-white"
            >
              자세히 보기
            </button>
          </div>

          <div className="relative h-24 w-20 shrink-0">
            <div className="absolute inset-0 rotate-6 rounded-[28px] bg-white/70 shadow-sm" />
            <div className="absolute left-1 top-1 h-[86px] w-[62px] rotate-6 rounded-[22px] bg-slate-900/90" />
            <div className="absolute left-[10px] top-[10px] h-[70px] w-[44px] rotate-6 rounded-[16px] bg-[#FFF1EA]" />
            <div className="absolute left-[24px] top-[16px] h-2 w-2 rotate-6 rounded-full bg-slate-900/50" />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">최근 본 상품</p>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent(MAIN_TAB_EVENT, { detail: { tab: "gear" } }))
            }
            className="text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            더보기 <span aria-hidden="true">›</span>
          </button>
        </div>
        <div className="-mx-1 overflow-x-auto px-1 sm:mx-0 sm:px-0">
          <div className="flex gap-3 pb-2">
            {recentViewProducts.map((p) => (
              <div
                key={p.id}
                className="w-[11.25rem] shrink-0 overflow-hidden rounded-3xl bg-white/95 shadow-sm sm:w-44"
              >
                <div className="relative h-28 bg-slate-100">
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  <ProductThumbnailDestinationBadge
                    purchaseUrl={p.purchaseUrl}
                    instagramUrl={p.instagramUrl}
                    externalPlatform={p.externalPlatform}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleScrapProduct(p.id);
                    }}
                    className={`absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-2xl shadow-sm hover:bg-white ${
                      isScrappedProduct(p.id)
                        ? "bg-[#FFF1EA] text-[#FF853E]"
                        : "bg-white/90 text-slate-700"
                    }`}
                    aria-label={isScrappedProduct(p.id) ? "스크랩 해제" : "스크랩"}
                  >
                    {isScrappedProduct(p.id) ? "★" : "☆"}
                  </button>
                </div>
                <div className="flex min-h-[4.25rem] flex-col p-3">
                  <p className="line-clamp-3 text-[13px] font-semibold leading-snug text-slate-700">{p.name}</p>
                  <p className="mt-auto pt-2 text-sm font-bold text-slate-900">{p.price}원</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 px-0 py-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-bold text-slate-900">스크랩</p>
            <p className="mt-1 text-xs font-normal text-slate-500">
              스크랩은 {SCRAP_TTL_DAYS}일이 지나면 자동으로 정리돼요.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-2xl bg-[#FF853E] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#ff7a2a]"
          >
            설정
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setScrapCategoryTab("all")}
            className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
              scrapCategoryTab === "all"
                ? "bg-[#FFF1EA] text-[#FF853E]"
                : "bg-slate-100 text-[#FF853E] hover:bg-slate-200"
            }`}
          >
            전체 ({scrapResolved.length})
          </button>
          {scrapCategoryOrder.map((cid) => {
            const n = scrapGrouped.get(cid)?.length ?? 0;
            if (n === 0) return null;
            const label = GEAR_CATEGORIES.find((c) => c.id === cid)?.short ?? cid;
            return (
              <button
                key={cid}
                type="button"
                onClick={() => setScrapCategoryTab(cid)}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
                  scrapCategoryTab === cid
                    ? "bg-[#FFF1EA] text-[#FF853E]"
                    : "bg-slate-100 text-[#FF853E] hover:bg-slate-200"
                }`}
              >
                {label} ({n})
              </button>
            );
          })}
          {(scrapGrouped.get("other")?.length ?? 0) > 0 ? (
            <button
              type="button"
              onClick={() => setScrapCategoryTab("other")}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
                scrapCategoryTab === "other"
                  ? "bg-[#FFF1EA] text-[#FF853E]"
                  : "bg-slate-100 text-[#FF853E] hover:bg-slate-200"
              }`}
            >
              기타 ({scrapGrouped.get("other")!.length})
            </button>
          ) : null}
        </div>

        <div className="mt-4 space-y-5">
          {scrapResolved.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-normal text-slate-500">
                아직 스크랩한 육아용품이 없어요.
              </p>
              <p className="mt-1 text-xs font-normal text-slate-400">
                육아용품 탭에서 카드나 목록의 ☆를 눌러 저장해 보세요.
              </p>
            </div>
          ) : scrapCategoryTab === "all" ? (
            <>
              {scrapCategoryOrder.map((cid) => {
                const group = scrapGrouped.get(cid);
                if (!group?.length) return null;
                return (
                  <div key={cid} className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      {gearScrapSectionTitle(cid)}
                    </p>
                    <div className="space-y-3">
                      {group.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-4 rounded-2xl bg-white/70 p-4 shadow-sm"
                        >
                          <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                            <ProductThumbnailDestinationBadge
                              variant="compact"
                              purchaseUrl={p.purchaseUrl}
                              instagramUrl={p.instagramUrl}
                              externalPlatform={p.externalPlatform}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold leading-snug text-slate-900 line-clamp-2">
                              {p.name}
                            </p>
                            <p className="mt-1.5 text-[11px] font-normal text-slate-500">
                              신뢰 {p.score}점 · {p.price}원
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeScrap(p.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                            aria-label="스크랩 삭제"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {(scrapGrouped.get("other")?.length ?? 0) > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    {gearScrapSectionTitle("other")}
                  </p>
                  <div className="space-y-3">
                    {scrapGrouped.get("other")!.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-4 rounded-2xl bg-white/70 p-4 shadow-sm"
                      >
                        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                          <ProductThumbnailDestinationBadge
                            variant="compact"
                            purchaseUrl={p.purchaseUrl}
                            instagramUrl={p.instagramUrl}
                            externalPlatform={p.externalPlatform}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold leading-snug text-slate-900 line-clamp-2">
                            {p.name}
                          </p>
                          <p className="mt-1.5 text-[11px] font-normal text-slate-500">
                            신뢰 {p.score}점 · {p.price}원
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeScrap(p.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                          aria-label="스크랩 삭제"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="space-y-3">
              {(scrapGrouped.get(scrapCategoryTab) ?? []).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 rounded-2xl bg-white/70 p-4 shadow-sm"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                    <ProductThumbnailDestinationBadge
                      variant="compact"
                      purchaseUrl={p.purchaseUrl}
                      instagramUrl={p.instagramUrl}
                      externalPlatform={p.externalPlatform}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="min-w-0 flex-1 text-sm font-bold leading-snug text-slate-900 line-clamp-2">
                      {p.name}
                    </p>
                    <p className="mt-1.5 text-[11px] font-normal text-slate-500">
                      신뢰 {p.score}점 · {p.price}원
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeScrap(p.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200"
                    aria-label="스크랩 삭제"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {momoBannerOpen && (
        <div
          className="app-viewport-fixed z-[70] flex items-center justify-center bg-black/45 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="momo-banner-info-title"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <p id="momo-banner-info-title" className="text-[17px] font-bold text-slate-900">
              모모아와 함께 더 쉽게
            </p>
            <p className="mt-3 text-[13px] font-medium leading-relaxed text-slate-600">
              프로필·상담·스크랩을 쌓을수록 홈과 육아용품 추천이 정교해져요. 알림과 쿠폰은 설정·마이페이지에서
              확인할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={() => setMomoBannerOpen(false)}
              className="mt-6 w-full rounded-2xl bg-[#FF853E] py-3 text-sm font-bold text-white"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {profileEditOpen && (
        <ProfileEditPage
          onBack={() => setProfileEditOpen(false)}
          onSaved={() => {
            setProfile(loadMyPageProfileFromStorage());
            setProfileEditOpen(false);
          }}
        />
      )}
    </div>
  );
}

function StarScorePicker({
  value,
  onChange,
  productName,
}: {
  value: number;
  onChange: (next: number) => void;
  productName: string;
}) {
  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={`${productName} 만족도`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${
              active
                ? "bg-[#FFF1EA] text-[#FF853E] ring-1 ring-[#FFD2BF]"
                : "bg-slate-50 text-slate-300 ring-1 ring-slate-100 hover:bg-slate-100 hover:text-slate-400"
            }`}
            aria-label={`${star}점`}
            aria-pressed={active}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

function ReviewsScreen() {
  const [scores, setScores] = useState<Record<number, number>>(() => loadPurchaseReviewScores());
  const [reviewTexts, setReviewTexts] = useState<Record<number, string>>(() => loadPurchaseReviewTexts());

  const setProductScore = (productId: number, next: number) => {
    setScores((prev) => {
      const merged = { ...prev, [productId]: next };
      savePurchaseReviewScores(merged);
      return merged;
    });
  };

  const setProductReviewText = (productId: number, text: string) => {
    setReviewTexts((prev) => {
      const merged = { ...prev, [productId]: text };
      savePurchaseReviewTexts(merged);
      return merged;
    });
  };

  useEffect(() => {
    const onFocus = () => {
      setScores(loadPurchaseReviewScores());
      setReviewTexts(loadPurchaseReviewTexts());
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <div className="min-h-dvh p-5 pb-safe-tab font-sans sm:p-6">
      <MainScreenTopBar />
      <ParentingConsultation3Min />
      <SituationalRecommendSection />

      <section className="card-soft mt-4 p-6">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">구매 제품 평가</h2>
        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
          배송·품질 경험을 별점으로 알려주시면 다른 엄마들에게도 도움이 돼요.
        </p>

        <ul className="mt-5 space-y-4">
          {PURCHASED_FOR_REVIEW.map((p) => {
            const myScore = scores[p.id] ?? 0;
            return (
              <li
                key={p.id}
                className="rounded-2xl border border-slate-100/80 bg-white/70 p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                    <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#FF853E]">{p.tag}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm font-bold text-slate-900">{p.name}</p>
                    <p className="mt-1 text-xs font-normal text-slate-500">{p.price}원</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <StarScorePicker
                    value={myScore}
                    onChange={(n) => setProductScore(p.id, n)}
                    productName={p.name}
                  />
                  <p className="text-xs font-medium text-slate-600 sm:text-right">
                    {myScore > 0 ? (
                      <>
                        내 점수 <span className="text-[#FF853E]">{myScore}</span> / 5
                      </>
                    ) : (
                      <span className="text-slate-400">별을 눌러 점수를 선택해 주세요</span>
                    )}
                  </p>
                </div>
                {myScore > 0 && (
                  <div className="mt-4 border-t border-slate-200/80 pt-4">
                    <label
                      className="text-xs font-semibold text-slate-800"
                      htmlFor={`purchase-review-text-${p.id}`}
                    >
                      더 자세한 후기
                    </label>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      배송·포장·사용감 등을 적어 주시면 다른 엄마들에게 큰 도움이 돼요.
                    </p>
                    <textarea
                      id={`purchase-review-text-${p.id}`}
                      value={reviewTexts[p.id] ?? ""}
                      onChange={(e) => setProductReviewText(p.id, e.target.value)}
                      rows={4}
                      placeholder="예: 소재가 부드럽고 사이즈가 잘 맞았어요. 야간에도 새지 않아서 만족해요."
                      className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-relaxed text-slate-800 outline-none ring-1 ring-slate-100 transition placeholder:text-slate-400 focus:border-[#FFD2BF] focus:ring-2 focus:ring-[#FF853E]/25"
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-5 rounded-2xl border border-dashed border-slate-200/80 bg-white/50 p-5 text-center backdrop-blur-sm">
        <p className="text-sm font-medium text-slate-500">
          상담·문의는 마이페이지 또는 고객센터로 연결될 예정이에요.
        </p>
      </section>
    </div>
  );
}

function BottomNav({
  active,
  onChange,
}: {
  active: MainTab;
  onChange: (tab: MainTab) => void;
}) {
  const items: { key: MainTab; label: React.ReactNode; icon: React.ReactNode }[] = [
    {
      key: "home",
      label: "홈",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z" />
        </svg>
      ),
    },
    {
      key: "reviews",
      label: "상담",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
        </svg>
      ),
    },
    {
      key: "gear",
      label: "육아용품",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l-1 12H6L5 9z" />
        </svg>
      ),
    },
    {
      key: "community",
      label: "커뮤니티",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.6-9.5 9-9.5 9Z" />
        </svg>
      ),
    },
    {
      key: "mypage",
      label: "마이페이지",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="app-bottom-fixed z-40 rounded-t-[1.75rem] border border-white/60 bg-white/85 shadow-[0_-12px_40px_-16px_rgba(15,23,42,0.08)] backdrop-blur-md">
      <div className="flex w-full items-stretch justify-between px-1.5 pb-[calc(0.85rem+env(safe-area-inset-bottom,0px))] pt-3">
        {items.map((item) => {
          const selected = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`flex w-full min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 py-2 font-medium transition sm:px-1 ${
                selected ? "text-[#FF853E]" : "text-slate-500"
              }`}
              aria-current={selected ? "page" : undefined}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                  selected ? "bg-[#FFF1EA] text-[#FF853E] shadow-sm shadow-orange-100/80" : "text-slate-400"
                }`}
              >
                {item.icon}
              </div>
              <div className="max-w-full text-center text-[10px] font-medium leading-tight sm:text-[11px] [word-break:keep-all] line-clamp-2">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function MainTabs() {
  const [tab, setTab] = useState<MainTab>("home");
  const [overlay, setOverlay] = useState<
    | null
    | "settings"
    | "notifications"
    | "reviewHub"
    | "orderHistory"
    | "writtenReviews"
    | "inquiries"
    | "coupons"
    | "points"
  >(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const t = (e as CustomEvent<{ tab?: MainTab }>).detail?.tab;
      if (t === "home" || t === "gear" || t === "community" || t === "reviews" || t === "mypage") {
        setTab(t);
      }
    };
    window.addEventListener(MAIN_TAB_EVENT, handler as EventListener);
    return () => window.removeEventListener(MAIN_TAB_EVENT, handler as EventListener);
  }, []);
  const [gearDetailProduct, setGearDetailProduct] = useState<Product | null>(null);
  const [top10DetailPayload, setTop10DetailPayload] = useState<{
    products: Product[];
    title: string;
    description: string;
  } | null>(null);

  return (
    <CartScreenProvider>
    <div
      className={`relative w-full min-h-dvh ${tab === "reviews" ? "app-screen-consult" : "bg-white"}`}
    >
      {tab === "home" && <Home />}
      {tab === "gear" && (
        <BabyGearScreen
          onOpenReviewHub={() => setOverlay("reviewHub")}
          onOpenConsultTab={() => setTab("reviews")}
          detailProduct={gearDetailProduct}
          onDetailProductChange={setGearDetailProduct}
          onOpenTop10Detail={setTop10DetailPayload}
        />
      )}
      {tab === "community" && <CommunityEmpathyScreen />}
      {tab === "reviews" && <ReviewsScreen />}
      {tab === "mypage" && (
        <MyPage
          onOpenSettings={() => setOverlay("settings")}
          onOpenOrderHistory={() => setOverlay("orderHistory")}
          onOpenWrittenReviews={() => setOverlay("writtenReviews")}
          onOpenInquiries={() => setOverlay("inquiries")}
          onOpenCoupons={() => setOverlay("coupons")}
          onOpenPoints={() => setOverlay("points")}
          onOpenNotifications={() => setOverlay("notifications")}
        />
      )}

      {overlay === "settings" && (
        <div className="app-viewport-fixed z-[60] overflow-y-auto bg-white">
          <SettingsScreen
            appVersion="v4.2.3(664)"
            onBack={() => setOverlay(null)}
            onOpenInquiries={() => setOverlay("inquiries")}
          />
        </div>
      )}

      {overlay === "notifications" && (
        <div className="app-viewport-fixed z-[60] overflow-y-auto bg-white">
          <NotificationInboxPage onBack={() => setOverlay(null)} />
        </div>
      )}

      {overlay === "reviewHub" && (
        <div className="app-viewport-fixed z-[60] overflow-y-auto bg-white">
          <ReviewHubPage onBack={() => setOverlay(null)} />
        </div>
      )}

      {overlay === "orderHistory" && (
        <div className="app-viewport-fixed z-[60] overflow-y-auto bg-white">
          <OrderReservationHistoryPage onBack={() => setOverlay(null)} />
        </div>
      )}

      {overlay === "writtenReviews" && (
        <div className="app-viewport-fixed z-[60] overflow-y-auto bg-white">
          <MyWrittenReviewsPage onBack={() => setOverlay(null)} />
        </div>
      )}

      {overlay === "inquiries" && (
        <div className="app-viewport-fixed z-[60] overflow-y-auto bg-white">
          <MyInquiriesPage onBack={() => setOverlay(null)} />
        </div>
      )}

      {overlay === "coupons" && (
        <div className="app-viewport-fixed z-[60] overflow-y-auto bg-white">
          <MyCouponsPage onBack={() => setOverlay(null)} />
        </div>
      )}

      {overlay === "points" && (
        <div className="app-viewport-fixed z-[60] overflow-y-auto bg-white">
          <MyPointsDetailPage onBack={() => setOverlay(null)} />
        </div>
      )}

      {top10DetailPayload && (
        <div className="app-viewport-fixed z-[60] overflow-y-auto">
          <WeeklyTop10DetailPage
            title={top10DetailPayload.title}
            description={top10DetailPayload.description}
            products={top10DetailPayload.products}
            onBack={() => setTop10DetailPayload(null)}
            onSelectProduct={(p) => {
              setGearDetailProduct(p);
              setTop10DetailPayload(null);
            }}
          />
        </div>
      )}

      <BottomNav active={tab} onChange={setTab} />
    </div>
    </CartScreenProvider>
  );
}

// 2. 메인 App 컴포넌트 (온보딩 포함)
export default function App() {
  const [view, setView] = useState<"onboarding" | "home" | "relogin">(() => {
    if (typeof window === "undefined") return "onboarding";

    try {
      let completed = isOnboardingCompleted();
      const p = loadMyPageProfileFromStorage();
      const hasNickname = Boolean(p.nickname?.trim());

      if (!completed && hasNickname) {
        markOnboardingCompleted();
        completed = true;
      }

      if (completed && isSessionSignedOut()) return "relogin";
      if (!completed) return "onboarding";
      return "home";
    } catch {
      const completed = isOnboardingCompleted();
      if (completed && isSessionSignedOut()) return "relogin";
      if (!completed) return "onboarding";
      return "home";
    }
  });

  const handleFinishOnboarding = () => {
    markOnboardingCompleted();
    markSessionSignedIn();
    setView("home");
  };

  return (
    <div className="flex min-h-dvh flex-1 justify-center bg-white">
      <div className="relative flex min-h-dvh w-full max-w-app flex-1 flex-col bg-white shadow-[0_0_0_1px_rgba(148,163,184,0.15),0_20px_50px_-18px_rgba(15,23,42,0.08)]">
        {view === "onboarding" ? (
          <Onboarding onComplete={handleFinishOnboarding} />
        ) : view === "relogin" ? (
          <ReloginScreen onSuccess={() => setView("home")} />
        ) : (
          <MainTabs />
        )}
      </div>
    </div>
  );
}