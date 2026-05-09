import { useCallback, useEffect, useRef, useState } from "react";

const AUTO_MS = 4500;

/** 참고 UI 톤: 소프트 오렌지·피치, 플랫(그림자 없음) */
const C = {
  shell: "bg-[#FFF9F4]",
  cardSoft: "bg-[#FFF2E6]",
  cardBold: "bg-[#FFB366]",
  ink: "text-[#C2410C]",
  inkMuted: "text-[#B45309]",
  dotOn: "bg-[#F97316]",
  dotOff: "bg-[#E8D5C8]",
};

export type GearPromoSlide = {
  id: string;
  tag: "혜택" | "이벤트" | "정보";
  title: string;
  sub: string;
  imageUrl: string;
  cta: string;
  /** true면 연한 카드 | false면 오렌지 단색 카드(큰 헤드라인용) */
  variant?: "soft" | "bold";
};

/** 가정의 달 배너·상세 공통 — 가족·홈 분위기 */
export const GEAR_PROMO_FAMILY_MONTH_IMAGE_URL =
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&q=85";

const SLIDES: GearPromoSlide[] = [
  {
    id: "sale",
    tag: "이벤트",
    title: "가정의 달 기념\n구독·혜택 특가",
    sub: "맘카페에서 반응 좋았던 인기템만 모았어요.",
    imageUrl: GEAR_PROMO_FAMILY_MONTH_IMAGE_URL,
    cta: "자세히 보기",
    variant: "bold",
  },
  {
    id: "coupon",
    tag: "혜택",
    title: "첫 구매 쿠폰팩",
    sub: "앱 전용 할인과 무료배송을 한번에 받아보세요.",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
    cta: "혜택 받기",
    variant: "soft",
  },
  {
    id: "consult",
    tag: "정보",
    title: "3분 AI 상담\n살 순서 정하기",
    sub: "답한 내용으로 아래 추천 순서가 바뀌어요.",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80",
    cta: "상담하기",
    variant: "soft",
  },
  {
    id: "guide",
    tag: "정보",
    title: "KC 인증·안전 마크",
    sub: "고를 때 꼭 확인할 체크리스트예요.",
    imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80",
    cta: "가이드 보기",
    variant: "soft",
  },
];

type GearPromoBannerProps = {
  onSlideCta?: (slideIndex: number, slide: GearPromoSlide) => void;
};

export default function GearPromoBanner({ onSlideCta }: GearPromoBannerProps) {
  const [i, setI] = useState(0);
  const pausedRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  const len = SLIDES.length;
  const go = useCallback(
    (dir: -1 | 1) => {
      setI((prev) => (prev + dir + len) % len);
    },
    [len]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const tick = () => {
      if (pausedRef.current) return;
      setI((prev) => (prev + 1) % len);
    };
    const id = window.setInterval(tick, AUTO_MS);
    return () => window.clearInterval(id);
  }, [len, reduceMotion]);

  return (
    <section
      className={`relative px-4 pb-6 pt-4 sm:px-5 ${C.shell}`}
      aria-label="혜택·이벤트·정보 배너"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className="relative mx-auto max-w-lg sm:max-w-none">
        <div className="mb-4">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${C.inkMuted}`}>혜택 · 이벤트 · 정보</p>
          <p className={`mt-1 text-base font-bold tracking-tight ${C.ink}`}>모모아에서만 만나요</p>
        </div>

        <div className="relative overflow-hidden rounded-[1.5rem] border border-[#F0D9C4]/90">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {SLIDES.map((s, slideIdx) => {
              const bold = s.variant === "bold";
              return (
                <article key={s.id} className="w-full shrink-0" aria-hidden={slideIdx !== i}>
                  <div
                    className={`flex min-h-[11.5rem] flex-col gap-4 px-5 py-6 sm:min-h-[12rem] sm:flex-row sm:items-center sm:gap-6 ${
                      bold ? `${C.cardBold} text-white` : `${C.cardSoft}`
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          bold ? "bg-white/25 text-white" : `border border-[#F0C9A8] bg-white ${C.ink}`
                        }`}
                      >
                        {s.tag}
                      </span>
                      <h2
                        className={`mt-3 whitespace-pre-line text-lg font-bold leading-snug tracking-tight sm:text-xl ${
                          bold ? "text-white" : C.ink
                        }`}
                      >
                        {s.title}
                      </h2>
                      <p
                        className={`mt-2 text-[13px] font-medium leading-relaxed line-clamp-3 sm:text-sm ${
                          bold ? "text-white/90" : C.inkMuted
                        }`}
                      >
                        {s.sub}
                      </p>
                      <button
                        type="button"
                        onClick={() => onSlideCta?.(slideIdx, s)}
                        className={`mt-5 inline-flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                          bold
                            ? "border border-[#F97316]/45 bg-white text-[#F97316] hover:bg-[#FFF8F0]"
                            : "bg-[#F97316] text-white hover:bg-[#EA580C]"
                        }`}
                      >
                        {s.cta}
                        <span aria-hidden className="text-xs opacity-95">
                          →
                        </span>
                      </button>
                    </div>

                    <div className="mx-auto shrink-0 sm:mx-0">
                      <div
                        className={`h-[6.5rem] w-[6.5rem] overflow-hidden rounded-2xl sm:h-28 sm:w-28 ${
                          bold ? "border border-white/35 bg-white/15" : "border border-[#F0C9A8] bg-white"
                        }`}
                      >
                        <img
                          src={s.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          loading={slideIdx === 0 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center justify-between gap-3 border-t px-4 py-3 sm:px-5 ${
                      bold ? "border-white/25 bg-[#FF9F40]" : "border-[#F0D9C4]/80 bg-white"
                    }`}
                  >
                    <span className={`text-[11px] font-semibold tabular-nums ${bold ? "text-white/90" : C.inkMuted}`}>
                      {slideIdx + 1} / {len}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="이전 배너"
            onClick={() => {
              pausedRef.current = true;
              go(-1);
              window.setTimeout(() => {
                pausedRef.current = false;
              }, AUTO_MS * 2);
            }}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8C9A8] bg-white text-lg font-medium text-[#C2410C] transition hover:bg-[#FFF8F0] active:scale-95 sm:left-3"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="다음 배너"
            onClick={() => {
              pausedRef.current = true;
              go(1);
              window.setTimeout(() => {
                pausedRef.current = false;
              }, AUTO_MS * 2);
            }}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8C9A8] bg-white text-lg font-medium text-[#C2410C] transition hover:bg-[#FFF8F0] active:scale-95 sm:right-3"
          >
            ›
          </button>
        </div>

        {!reduceMotion && (
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#F5E6DA]">
            <div
              key={i}
              className="h-full origin-left rounded-full bg-[#F97316] motion-reduce:animate-none animate-promo-progress"
            />
          </div>
        )}

        <div
          className="mt-4 flex touch-pan-x justify-center gap-2"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touchStartX.current;
            touchStartX.current = null;
            if (start == null) return;
            const end = e.changedTouches[0]?.clientX;
            if (end == null) return;
            const dx = end - start;
            if (Math.abs(dx) < 40) return;
            pausedRef.current = true;
            if (dx < 0) go(1);
            else go(-1);
            window.setTimeout(() => {
              pausedRef.current = false;
            }, AUTO_MS * 2);
          }}
        >
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`배너 ${idx + 1}페이지`}
              aria-current={idx === i ? "true" : undefined}
              onClick={() => {
                setI(idx);
                pausedRef.current = true;
                window.setTimeout(() => {
                  pausedRef.current = false;
                }, AUTO_MS * 2);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === i ? `w-8 ${C.dotOn}` : `w-2 ${C.dotOff}`
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
