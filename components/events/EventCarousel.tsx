import React, { useCallback, useEffect, useRef, useState } from "react";
import { EventCard } from "./EventCard";
import { EVENT_CAROUSEL_ITEMS, type EventItem } from "./eventCarouselData";
import { MomCommunityIcon } from "./MomCommunityIcon";
import { PlaygroundEventModal } from "./PlaygroundEventModal";

export function EventCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playgroundEvent, setPlaygroundEvent] = useState<EventItem | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });
  const suppressClick = useRef(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const hintDone = useRef(false);

  const updateArrowsAndIndex = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft;
    setCanLeft(left > 8);
    setCanRight(left < max - 8);

    const cards = el.querySelectorAll<HTMLElement>("[data-event-card-slot]");
    if (cards.length === 0) return;
    let best = 0;
    let bestDist = Infinity;
    const mid = left + el.clientWidth / 2;
    cards.forEach((node, i) => {
      const r = node.offsetLeft + node.offsetWidth / 2;
      const d = Math.abs(r - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActiveIndex(best);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrowsAndIndex();
    const onScroll = () => {
      updateArrowsAndIndex();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateArrowsAndIndex);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateArrowsAndIndex);
    };
  }, [updateArrowsAndIndex]);

  /** 첫 진입 힌트: 살짝 오른쪽으로 밀었다가 복귀 */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || hintDone.current) return;
    hintDone.current = true;
    const t1 = window.setTimeout(() => {
      el.scrollBy({ left: 56, behavior: "smooth" });
    }, 400);
    const t2 = window.setTimeout(() => {
      el.scrollTo({ left: 0, behavior: "smooth" });
    }, 1400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-event-card-slot]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  useEffect(() => {
    if (autoPaused) return;
    const id = window.setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollByDir(1);
      }
    }, 9000);
    return () => window.clearInterval(id);
  }, [autoPaused, activeIndex]);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    suppressClick.current = false;
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    const el = scrollerRef.current;
    if (!el) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    if (drag.current.moved) {
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 320);
    }
    drag.current.down = false;
    drag.current.moved = false;
  };

  const progress = EVENT_CAROUSEL_ITEMS.length > 1 ? activeIndex / (EVENT_CAROUSEL_ITEMS.length - 1) : 1;

  return (
    <section
      id="playground-section"
      className="rounded-[28px] bg-transparent p-0 pt-1 scroll-mt-4 sm:p-0 sm:scroll-mt-6"
      aria-labelledby="momoa-event-carousel-title"
      onMouseEnter={() => setAutoPaused(true)}
      onMouseLeave={() => setAutoPaused(false)}
    >
      <div className="mb-5">
        <div className="relative overflow-hidden rounded-[22px] bg-[#FFF7ED]/95 p-5 shadow-[0_8px_32px_-14px_rgba(249,115,22,0.22)] sm:p-6">
            <div
              className="pointer-events-none absolute -right-4 top-0 h-36 w-36 rounded-full bg-[#F97316]/22 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-8 left-0 h-32 w-44 rounded-full bg-sky-300/25 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-[1] flex flex-wrap items-center gap-2 break-keep">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F97316] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-orange-300/45">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Live
              </span>
              <span className="max-w-none rounded-2xl bg-white/90 px-3 py-1.5 text-[10px] font-bold leading-snug text-slate-600 shadow-sm sm:text-[11px] sm:leading-tight">
                엄마들의 선택 데이터가 쌓이는 공간
              </span>
            </div>

            <h2
              id="momoa-event-carousel-title"
              className="relative z-[1] mt-4 break-keep text-balance"
            >
              <span
                className="block text-[clamp(1.55rem,5.2vmin,2.25rem)] leading-[1.08] tracking-tight text-[#F97316] drop-shadow-[0_2px_12px_rgba(249,115,22,0.38)]"
                style={{ fontFamily: '"GeekbleMalang2", "Pretendard Variable", system-ui, sans-serif' }}
              >
                모모아
              </span>
              <span className="mt-1 block text-[clamp(1.4rem,4.6vmin,1.95rem)] font-black leading-[1.15] tracking-tight">
                <span className="text-slate-900">
                  플레이그라운드
                </span>
              </span>
              <span
                className="mt-4 inline-flex h-2 w-[min(12rem,55%)] rounded-full bg-[#F97316] shadow-sm shadow-orange-300/45"
                aria-hidden="true"
              />
            </h2>

            <div className="relative z-[1] mt-5 space-y-2 text-left text-base font-semibold leading-relaxed text-slate-700 sm:text-[1.05rem]">
              <p className="break-keep">정답 맞히기가 아니라,</p>
              <p className="break-keep">
                <span className="font-bold text-[#F97316] drop-shadow-[0_1px_0_rgba(249,115,22,0.25)]">
                  엄마들이 같이 짓는 작은 무대
                </span>
                에요!
              </p>
            </div>

            <div className="relative z-[1] mt-5 rounded-2xl bg-white/90 py-5 pl-4 pr-[5.25rem] text-left shadow-sm backdrop-blur-[2px] sm:pl-5 sm:pr-28">
              <div
                className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-[#F97316]"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute right-2 top-2 z-[2] flex h-[4.25rem] w-[4.25rem] items-center justify-center sm:right-3 sm:top-3 sm:h-[4.5rem] sm:w-[4.5rem]"
                aria-hidden="true"
              >
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#F97316]/28" />
                <MomCommunityIcon className="relative h-[3.35rem] w-[3.35rem] drop-shadow-[0_4px_12px_rgba(249,115,22,0.24)] sm:h-[3.65rem] sm:w-[3.65rem]" />
              </div>
              <div className="min-w-0 pl-3 sm:pl-4">
                <p className="text-left leading-snug">
                  <span className="block break-keep text-[11px] font-bold tracking-tight text-slate-900 text-pretty sm:text-xs sm:leading-snug">
                    한 표·한 후기가 쌓일수록 흩어진 정보가 모이고,
                  </span>
                  <span className="mt-1.5 block break-keep text-[10px] font-normal leading-relaxed text-slate-500 text-pretty sm:mt-2 sm:text-[11px] sm:leading-relaxed">
                    그게 다시 우리 집 맞춤 추천과, 엄마들이 남긴 믿음으로 돌아와요!
                  </span>
                </p>
              </div>
            </div>
          </div>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="이전 카드"
          onClick={() => scrollByDir(-1)}
          disabled={!canLeft}
          className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white text-lg text-slate-700 shadow-md transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="다음 카드"
          onClick={() => scrollByDir(1)}
          disabled={!canRight}
          className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 translate-x-2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white text-lg text-slate-700 shadow-md transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-0 sm:flex"
        >
          ›
        </button>

        <div
          ref={scrollerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={(e) => {
            if (suppressClick.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          className="flex touch-pan-x cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 pl-1 pr-1 pt-1 [scrollbar-width:none] active:cursor-grabbing sm:scroll-pl-2 sm:scroll-pr-2 [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {EVENT_CAROUSEL_ITEMS.map((event) => (
            <div
              key={event.id}
              data-event-card-slot
              className="w-[min(22.5rem,100%)] max-w-full shrink-0 snap-center"
            >
              <EventCard event={event} onOpenPlayground={setPlaygroundEvent} />
            </div>
          ))}
        </div>

      </div>

      <div className="mt-4 space-y-3">
        <div
          className="mx-auto h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={activeIndex + 1}
          aria-valuemin={1}
          aria-valuemax={EVENT_CAROUSEL_ITEMS.length}
          aria-label="캐러셀 진행"
        >
          <div
            className="h-full rounded-full bg-[#F97316] transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>
        <div className="flex justify-center gap-1.5">
          {EVENT_CAROUSEL_ITEMS.map((ev, i) => (
            <button
              key={ev.id}
              type="button"
              aria-label={`${i + 1}번째 이벤트로 이동`}
              onClick={() => {
                const el = scrollerRef.current;
                const node = el?.querySelectorAll<HTMLElement>("[data-event-card-slot]")[i];
                node?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-[#F97316]" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>

      <PlaygroundEventModal event={playgroundEvent} onClose={() => setPlaygroundEvent(null)} />
    </section>
  );
}
