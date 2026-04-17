import { useState } from "react";

const SLIDES = [
  {
    title: "가족의 달 맞이 육아템 특가",
    sub: "맘카페·SNS 후기로 골라 담은 인기 육아템을 한곳에서 만나보세요.",
    cta: "자세히 보기",
  },
  {
    title: "3분 AI 상담으로 살 순서만 정하기",
    sub: "지금 우리 집에 꼭 필요한 것부터 차례대로 정리해 드려요.",
    cta: "상담 시작하기",
  },
];

type GearPromoBannerProps = {
  onSlideCta?: (slideIndex: number) => void;
};

export default function GearPromoBanner({ onSlideCta }: GearPromoBannerProps) {
  const [i, setI] = useState(0);
  const s = SLIDES[i];

  return (
    <section
      className="relative overflow-hidden rounded-b-[2rem] bg-[#FF853E] px-5 pb-7 pt-7 text-white shadow-[0_12px_40px_-12px_rgba(255,107,61,0.45)] sm:px-6 sm:pb-8 sm:pt-8"
      aria-label="프로모션 배너"
    >
      <div className="pointer-events-none absolute -right-8 top-4 h-28 w-28 rounded-full bg-white/10 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-6 left-0 h-24 w-24 rounded-full bg-white/5 blur-2xl" aria-hidden />

      <div className="relative max-w-lg">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">MOMOA</p>
        <h2 className="mt-2 text-[1.35rem] font-bold leading-snug tracking-tight sm:text-[1.5rem]">{s.title}</h2>
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-white/90 sm:text-sm">{s.sub}</p>
        <button
          type="button"
          onClick={() => onSlideCta?.(i)}
          className="mt-5 rounded-full border border-white/50 bg-white/15 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/25"
        >
          {s.cta}
        </button>
      </div>

      <div className="relative mt-6 flex justify-center gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`배너 ${idx + 1}페이지`}
            aria-current={idx === i}
            onClick={() => setI(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === i ? "w-7 bg-white shadow-sm" : "w-1.5 bg-white/35 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
