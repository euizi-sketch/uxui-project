import React from "react";

const BRAND = "#FF6B00";

/**
 * 새 Home 화면이 사용하는 라우팅 path 목록.
 * App.tsx의 onNavigate 핸들러에서 기존 탭/오버레이로 매핑된다.
 * (현재 앱은 react-router-dom 미사용 → path 문자열 + 콜백 조합)
 */
export type HomeNavigatePath =
  | "/home"
  | "/profile"
  | "/consult"
  | "/gear"
  | "/community"
  | "/record"
  | "/today-recommend"
  | "/feed";

type NavigateFn = (path: HomeNavigatePath) => void;

type HomeProps = {
  onNavigate?: NavigateFn;
};

type QuickAction = {
  id: string;
  label: string;
  bg: string;
  icon: React.ReactNode;
  path: HomeNavigatePath;
};

type FeedCard = {
  id: string;
  category: string;
  categoryTone: "play" | "tip" | "review";
  title: string;
  subtitle: string;
  imageUrl: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "type-test",
    label: "유형 테스트",
    bg: "bg-orange-50",
    path: "/consult",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke={BRAND} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="2.5" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    ),
  },
  {
    id: "product",
    label: "제품 추천",
    bg: "bg-emerald-50",
    path: "/gear",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#10B981" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8h14l-1.2 11.2A2 2 0 0 1 15.8 21H8.2a2 2 0 0 1-2-1.8L5 8z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>
    ),
  },
  {
    id: "community",
    label: "커뮤니티",
    bg: "bg-violet-50",
    path: "/community",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#7C3AED" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z" />
      </svg>
    ),
  },
  {
    id: "record",
    label: "기록하기",
    bg: "bg-amber-50",
    path: "/record",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#F59E0B" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h12l4 4v10a2 2 0 0 1-2 2H4z" />
        <path d="M16 6v4h4" />
        <path d="M8 14h8M8 18h5" />
      </svg>
    ),
  },
];

const FEED_CARDS: FeedCard[] = [
  {
    id: "rainy",
    category: "놀이 아이디어",
    categoryTone: "play",
    title: "비 오는 날 실내 놀이",
    subtitle: "집에서 즐기는 7가지 아이디어",
    imageUrl:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=70",
  },
  {
    id: "sleep",
    category: "육아팁",
    categoryTone: "tip",
    title: "6개월 아기 수면 루틴",
    subtitle: "규칙적인 수면 습관 만들기",
    imageUrl:
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=600&q=70",
  },
  {
    id: "chair",
    category: "제품 후기",
    categoryTone: "review",
    title: "내돈내산 이유식 의자",
    subtitle: "실제 엄마들의 솔직 후기",
    imageUrl:
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=70",
  },
];

const CATEGORY_TONE: Record<FeedCard["categoryTone"], string> = {
  play: "bg-orange-100 text-orange-600",
  tip: "bg-rose-100 text-rose-500",
  review: "bg-sky-100 text-sky-600",
};

export default function Home({ onNavigate }: HomeProps = {}) {
  const navigate: NavigateFn = (path) => {
    onNavigate?.(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-50 pb-24">
        <TopBar />

        <main className="flex flex-col gap-4 px-4 pt-3">
          <ChildStatusKPI navigate={navigate} />
          <TodayRecommendation navigate={navigate} />
          <QuickActions navigate={navigate} />
          <ContentFeed navigate={navigate} />
          <SimilarMomsBanner navigate={navigate} />
        </main>
      </div>

      <BottomNavigation navigate={navigate} />
    </div>
  );
}

function TopBar() {
  return (
    <header className="flex items-center justify-between px-5 pt-5 pb-3">
      <h1
        className="text-[22px] font-extrabold tracking-tight"
        style={{ color: BRAND }}
      >
        MOMOA
      </h1>

      <div className="flex items-center gap-3 text-slate-500">
        <button
          type="button"
          aria-label="알림"
          className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
            <path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        <button
          type="button"
          aria-label="채팅"
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h16v11H8l-4 4z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function ChildStatusKPI({ navigate }: { navigate: NavigateFn }) {
  const goProfile = () => navigate("/profile");

  return (
    <section className="rounded-3xl bg-white p-4 shadow-[0_4px_18px_-10px_rgba(15,23,42,0.18)]">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={goProfile}
          aria-label="아이 프로필 열기"
          className="relative"
        >
          <div className="h-16 w-16 overflow-hidden rounded-full bg-orange-100 ring-2 ring-white">
            <img
              src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=200&q=70"
              alt="아이 프로필"
              className="h-full w-full object-cover"
            />
          </div>
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-white text-slate-500 shadow"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          </span>
        </button>

        <div className="flex-1">
          <p className="text-xs text-slate-400">우리 아이</p>
          <button
            type="button"
            onClick={goProfile}
            className="mt-0.5 flex items-center gap-1 text-[15px] font-bold text-slate-900"
          >
            태어난 지 6개월
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <p className="mt-1 text-[11px] text-slate-400">생장 180일 · 남아</p>
        </div>

        <button
          type="button"
          onClick={goProfile}
          aria-label="아이 상태 점수 보기"
          className="text-right"
        >
          <p className="text-[22px] font-extrabold leading-none text-slate-900">
            64<span className="text-xs font-semibold text-slate-400">/100</span>
          </p>
          <span
            className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ backgroundColor: BRAND }}
          >
            보통
          </span>
          <p className="mt-1 text-[10px] font-medium text-emerald-500">
            지난주보다 +5 ↑
          </p>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[13px]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={BRAND} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l4-4 4 4 5-5 5 5" />
            </svg>
          </span>
          <div>
            <p className="text-[12px] font-bold text-slate-800">수면 패턴이 불안정해요</p>
            <p className="text-[11px] text-slate-400">낮잠 시간이 일정하지 않아요</p>
          </div>
        </div>
        <button
          type="button"
          onClick={goProfile}
          className="text-[11px] font-semibold"
          style={{ color: BRAND }}
        >
          자세히 보기 →
        </button>
      </div>
    </section>
  );
}

function TodayRecommendation({ navigate }: { navigate: NavigateFn }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-white p-5 shadow-[0_4px_18px_-10px_rgba(15,23,42,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className="inline-block rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-500">
            오늘의 추천
          </span>
          <h2 className="mt-2 text-[18px] font-extrabold leading-snug text-slate-900">
            촉감 놀이 10분
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
            다양한 촉감을 경험하며
            <br />
            감각 발달에 도움을 줘요
          </p>
        </div>

        <CloudIllustration />
      </div>

      <button
        type="button"
        onClick={() => navigate("/today-recommend")}
        className="mt-4 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(255,107,0,0.6)]"
        style={{ backgroundColor: BRAND }}
      >
        <span className="flex-1 text-center">바로 시작하기</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </section>
  );
}

function CloudIllustration() {
  return (
    <div
      className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-orange-50"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-10 w-10"
        fill="none"
        stroke={BRAND}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 18h11a4 4 0 0 0 .8-7.9 6 6 0 0 0-11.6-1A4.5 4.5 0 0 0 7 18z" />
      </svg>
    </div>
  );
}

function QuickActions({ navigate }: { navigate: NavigateFn }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-[0_4px_18px_-10px_rgba(15,23,42,0.18)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-slate-900">빠른 메뉴</h3>
        <button
          type="button"
          onClick={() => navigate("/feed")}
          className="flex items-center gap-0.5 text-[11px] text-slate-400"
        >
          전체 보기
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className={`grid h-14 w-14 place-items-center rounded-2xl ${action.bg}`}
            >
              {action.icon}
            </span>
            <span className="text-[11px] font-semibold text-slate-700">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ContentFeed({ navigate }: { navigate: NavigateFn }) {
  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between px-1">
        <h3 className="text-[14px] font-bold text-slate-900">
          엄마들이 많이 보고 있어요
        </h3>
        <button
          type="button"
          onClick={() => navigate("/community")}
          className="flex items-center gap-0.5 text-[11px] text-slate-400"
        >
          더보기
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div
        className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {FEED_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => navigate("/community")}
            className="w-[40%] shrink-0 overflow-hidden rounded-2xl bg-white text-left shadow-[0_4px_14px_-10px_rgba(15,23,42,0.2)]"
          >
            <div className="px-2.5 pt-2.5">
              <span
                className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold ${CATEGORY_TONE[card.categoryTone]}`}
              >
                {card.category}
              </span>
              <h4 className="mt-1.5 text-[12px] font-bold leading-tight text-slate-900">
                {card.title}
              </h4>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-400">
                {card.subtitle}
              </p>
            </div>
            <div className="mt-2 h-24 w-full overflow-hidden">
              <img
                src={card.imageUrl}
                alt={card.title}
                className="h-full w-full object-cover"
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function SimilarMomsBanner({ navigate }: { navigate: NavigateFn }) {
  return (
    <section className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-[0_4px_18px_-10px_rgba(15,23,42,0.18)]">
      <div className="flex-1">
        <p className="text-[10px] text-slate-400">비슷한 월령의 엄마들이 선택했어요</p>
        <p className="mt-0.5 text-[13px] font-bold text-slate-900">
          지금 인기 있는 육아템 모아보기
        </p>
      </div>

      <div className="flex h-14 w-20 items-center justify-end gap-1">
        <div className="h-12 w-8 rounded-md bg-amber-100" />
        <div className="h-10 w-10 rounded-full bg-emerald-100" />
      </div>

      <button
        type="button"
        onClick={() => navigate("/gear")}
        aria-label="인기 육아템 모아보기"
        className="grid h-8 w-8 place-items-center rounded-full text-white"
        style={{ backgroundColor: BRAND }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </section>
  );
}

function BottomNavigation({ navigate }: { navigate: NavigateFn }) {
  const tabs: {
    id: string;
    label: string;
    path: HomeNavigatePath;
    active?: boolean;
    icon: React.ReactNode;
  }[] = [
    {
      id: "home",
      label: "홈",
      path: "/home",
      active: true,
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M12 3 3 11h2v9h5v-6h4v6h5v-9h2z" />
        </svg>
      ),
    },
    {
      id: "consult",
      label: "상담",
      path: "/consult",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z" />
        </svg>
      ),
    },
    {
      id: "gear",
      label: "육아용품",
      path: "/gear",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 8h14l-1.2 11.2A2 2 0 0 1 15.8 21H8.2a2 2 0 0 1-2-1.8L5 8z" />
          <path d="M9 8a3 3 0 0 1 6 0" />
        </svg>
      ),
    },
    {
      id: "community",
      label: "커뮤니티",
      path: "/community",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      ),
    },
    {
      id: "mypage",
      label: "마이페이지",
      path: "/profile",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-slate-100 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              type="button"
              onClick={() => navigate(tab.path)}
              className="flex w-full flex-col items-center gap-0.5 py-2.5"
              style={{ color: tab.active ? BRAND : "#9CA3AF" }}
            >
              {tab.icon}
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
