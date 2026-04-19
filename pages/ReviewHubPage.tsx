import React, { useMemo, useState } from "react";
import {
  getIntegratedReviewsForProduct,
  REVIEW_HUB_PRODUCT_PICKER,
  type IntegratedReviewPayload,
  type ChannelReviewGroup,
} from "../data/integratedReviews";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-4-4" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}

const CHANNEL_BAR: Record<ChannelReviewGroup["id"], string> = {
  momcafe: "bg-rose-500 shadow-[2px_0_12px_rgba(244,63,94,0.35)]",
  instagram: "bg-fuchsia-600 shadow-[2px_0_12px_rgba(192,38,211,0.35)]",
  coupang: "bg-[#FA622F] shadow-[2px_0_12px_rgba(250,98,47,0.35)]",
  naver: "bg-[#03C75A] shadow-[2px_0_12px_rgba(3,199,90,0.35)]",
};

export default function ReviewHubPage({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return REVIEW_HUB_PRODUCT_PICKER;
    return REVIEW_HUB_PRODUCT_PICKER.filter(
      (p) => p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q)
    );
  }, [query]);

  const selectedProduct = useMemo(
    () => REVIEW_HUB_PRODUCT_PICKER.find((p) => p.id === selectedId) ?? null,
    [selectedId]
  );

  const aggregate: IntegratedReviewPayload | null = useMemo(() => {
    if (!selectedProduct) return null;
    return getIntegratedReviewsForProduct(selectedProduct);
  }, [selectedProduct]);

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.06)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-app">
          <div className="relative flex items-center justify-center px-4 py-3.5">
            <button
              type="button"
              onClick={() => {
                if (selectedId != null) setSelectedId(null);
                else onBack();
              }}
              className="absolute left-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-lg text-slate-700 shadow-sm ring-1 ring-white/80 transition hover:bg-white hover:shadow-md"
              aria-label={selectedId != null ? "물품 목록으로" : "뒤로가기"}
            >
              ←
            </button>
            <div className="min-w-0 px-12 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600/90">Review hub</p>
              <h1 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">후기 통합</h1>
              {selectedProduct && (
                <p className="mt-1 line-clamp-2 text-[11px] font-normal leading-snug text-slate-500">
                  {selectedProduct.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-app px-4 pb-safe-tab pt-4 sm:px-5">
        {aggregate && selectedProduct ? (
          <IntegratedReviewResult
            product={selectedProduct}
            aggregate={aggregate}
            onClearProduct={() => setSelectedId(null)}
          />
        ) : (
          <ProductPickerSection
            query={query}
            onQueryChange={setQuery}
            filtered={filtered}
            onSelect={(id) => setSelectedId(id)}
          />
        )}

        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-white/60 bg-white/35 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
          <p className="text-[11px] font-normal leading-relaxed text-slate-500">
            표시 내용은 서비스 데모예요. 실제 서비스에서는 허용된 범위 내 수집·요약 정책을 따릅니다.
          </p>
        </div>
      </main>
    </div>
  );
}

function ProductPickerSection({
  query,
  onQueryChange,
  filtered,
  onSelect,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  filtered: typeof REVIEW_HUB_PRODUCT_PICKER;
  onSelect: (id: number) => void;
}) {
  const channels = [
    {
      label: "맘카페",
      sub: "게시판 · 댓글",
      bar: "border-l-rose-500",
      card: "bg-white/95 ring-slate-200/80",
    },
    {
      label: "인스타",
      sub: "릴스 · 후기",
      bar: "border-l-fuchsia-500",
      card: "bg-white/95 ring-slate-200/80",
    },
    {
      label: "쿠팡",
      sub: "구매 리뷰",
      bar: "border-l-[#FA622F]",
      card: "bg-white/95 ring-slate-200/80",
    },
    {
      label: "네이버",
      sub: "블로그 · 검색",
      bar: "border-l-[#03C75A]",
      card: "bg-white/95 ring-slate-200/80",
    },
  ] as const;

  return (
    <>
      <section
        className="relative overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.25)] ring-1 ring-white/80"
        aria-label="후기 통합 안내"
      >
        <div className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-teal-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-cyan-300/35 blur-3xl" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 gap-y-2">
              <p className="text-[11px] font-bold tracking-wide text-teal-800">후기 통합</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50/90 py-1 pl-1 pr-2.5 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur-sm">
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200/80">
                  Beta
                </span>
                <span className="pr-0.5 text-slate-700">출처별 모음</span>
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-[1.35rem]">
              보고 싶은 물품을 고르면
              <span className="text-teal-700">
                {" "}
                채널별 후기를 한곳에{" "}
              </span>
              정리해 드려요
            </h2>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-500">
              맘카페·인스타·쿠팡·네이버 등 출처별 톤을 살리면서, 반복되는 관점만 묶어 요약했어요.
            </p>
          </div>
        </div>

        <div className="relative mt-5 -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 pt-0.5 [scrollbar-width:thin] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
          {channels.map((src) => (
            <div
              key={src.label}
              className={`min-w-[9.25rem] shrink-0 snap-start rounded-xl border-l-[3px] px-3.5 py-3 shadow-sm ring-1 sm:min-w-0 ${src.bar} ${src.card}`}
            >
              <p className="whitespace-nowrap text-[13px] font-bold tracking-tight text-slate-900">{src.label}</p>
              <p className="mt-1 whitespace-nowrap text-[11px] font-medium text-slate-500">{src.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6" aria-label="물품 검색 및 선택">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-teal-500/70" />
          <label htmlFor="review-hub-search" className="sr-only">
            물품 이름 검색
          </label>
          <input
            id="review-hub-search"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="물품 이름으로 검색…"
            className="w-full rounded-2xl border border-teal-100/80 bg-white py-3.5 pl-11 pr-4 text-[15px] font-semibold text-slate-900 shadow-inner shadow-slate-900/5 outline-none ring-1 ring-slate-100/80 transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-2 focus:ring-teal-200/80"
          />
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
          <span className="inline-block h-px w-6 bg-teal-400/70" aria-hidden />
          카드를 누르면 해당 물품 기준으로 후기가 통합돼요.
        </p>

        <ul className="mt-5 space-y-4">
          {filtered.length === 0 ? (
            <li className="rounded-[1.35rem] border border-dashed border-slate-200/90 bg-white/80 px-6 py-14 text-center shadow-sm backdrop-blur-sm">
              <p className="text-4xl" aria-hidden>
                🔍
              </p>
              <p className="mt-3 text-sm font-bold text-slate-700">검색 결과가 없어요</p>
              <p className="mt-1 text-[13px] font-medium text-slate-500">다른 키워드로 찾아보세요.</p>
            </li>
          ) : (
            filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  className="group relative w-full overflow-hidden rounded-[1.35rem] border border-teal-100/90 bg-teal-50/40 shadow-[0_14px_44px_-22px_rgba(13,148,136,0.35)] ring-1 ring-teal-100/60 transition-all duration-300 hover:shadow-[0_20px_48px_-18px_rgba(13,148,136,0.42)] hover:ring-teal-300/70 active:scale-[0.992]"
                >
                  <div className="relative flex items-center gap-4 rounded-[1.28rem] bg-white/95 px-3 py-3 sm:gap-5 sm:px-4 sm:py-3.5">
                    <div className="relative h-[4.75rem] w-[4.75rem] shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-inner ring-2 ring-white">
                      <img src={p.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <span className="inline-flex rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold tracking-tight text-teal-900 ring-1 ring-teal-100/90">
                        {p.tag}
                      </span>
                      <p className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-slate-900">
                        {p.name}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-[#FF853E] transition group-hover:gap-1.5">
                        통합 후기 보기
                        <ChevronRightIcon className="h-4 w-4 translate-x-0 opacity-90 transition group-hover:translate-x-0.5" />
                      </p>
                    </div>
                    <div className="hidden shrink-0 sm:flex">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100/80 transition group-hover:scale-105 group-hover:bg-teal-100">
                        <ChevronRightIcon className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </>
  );
}

function IntegratedReviewResult({
  product,
  aggregate,
  onClearProduct,
}: {
  product: (typeof REVIEW_HUB_PRODUCT_PICKER)[number];
  aggregate: IntegratedReviewPayload;
  onClearProduct: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[#FFD2BF]/70 bg-[#FFF8F4] p-6 shadow-[0_20px_44px_-22px_rgba(255,133,62,0.22)] ring-1 ring-white">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#FF853E]/12 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" aria-hidden />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FF853E] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              통합 요약
            </span>
            <span className="text-[11px] font-normal text-slate-500">여러 채널 의견을 한 줄로</span>
          </div>
          <h2 className="mt-3 text-[17px] font-bold leading-snug tracking-tight text-slate-900 sm:text-lg">
            {aggregate.headline}
          </h2>
          <ul className="mt-5 space-y-3">
            {aggregate.summaryBullets.map((line, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-2xl border border-[#FFD2BF]/55 bg-white px-3 py-2.5 text-[13px] font-semibold leading-relaxed text-slate-700 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)]"
              >
                <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF853E] text-[10px] font-black text-white shadow-sm">
                  {i + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          {aggregate.channelNote && (
            <p className="mt-5 rounded-xl border border-slate-200/90 bg-slate-50/90 px-3.5 py-2.5 text-[11px] font-medium leading-relaxed text-slate-600">
              {aggregate.channelNote}
            </p>
          )}
          <button
            type="button"
            onClick={onClearProduct}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF853E] py-3 text-[13px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(255,133,62,0.45)] ring-2 ring-[#FFD2BF]/60 transition hover:brightness-[1.04] active:scale-[0.99]"
          >
            다른 물품 후기 보기
            <ChevronRightIcon className="h-4 w-4 text-white" />
          </button>
        </div>
      </section>

      <section aria-label="채널별 후기">
        <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold tracking-tight text-slate-900">출처별 후기</h3>
          <span className="shrink-0 text-[12px] font-medium tabular-nums text-slate-400">
            {aggregate.channels.length}곳 요약
          </span>
        </div>

        <div className="space-y-5">
          {aggregate.channels.map((ch) => (
            <article
              key={ch.id}
              className={`relative overflow-hidden rounded-[1.35rem] shadow-[0_12px_36px_-20px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/70 ${ch.panelClass}`}
            >
              <div
                className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${CHANNEL_BAR[ch.id]}`}
                aria-hidden
              />
              <div className="border-b border-black/[0.06] bg-white/40 px-4 py-3.5 pl-6 backdrop-blur-[2px] sm:pl-7">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="inline-flex shrink-0 rounded-lg bg-white/90 px-2 py-1 text-[12px] font-bold text-slate-800 shadow-sm ring-1 ring-slate-200/90">
                    {ch.label}
                  </span>
                  <span className="text-[12px] font-medium leading-snug text-slate-500 line-clamp-2">{ch.sub}</span>
                </div>
              </div>
              <ul className="divide-y divide-slate-100/90 bg-white/50">
                {ch.reviews.map((r, idx) => (
                  <li key={idx} className="relative px-4 py-4 pl-6 sm:pl-8">
                    <span
                      className="absolute left-3 top-5 font-serif text-3xl leading-none text-slate-200 sm:left-4"
                      aria-hidden
                    >
                      “
                    </span>
                    <p className="relative text-[14px] font-semibold leading-relaxed text-slate-800">{r.quote}</p>
                    {r.meta && (
                      <p className="relative mt-3 text-[11px] font-medium leading-snug text-slate-500">
                        {r.meta}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.35rem] border border-teal-100/80 bg-teal-50/50 p-5 text-center shadow-[0_16px_40px_-28px_rgba(13,148,136,0.25)] ring-1 ring-white">
        <p className="text-[13px] font-semibold text-slate-600">
          선택한 물품
          <span className="mt-1 block text-[15px] font-bold leading-snug text-slate-900">{product.name}</span>
        </p>
        <p className="mt-3 text-[12px] font-medium leading-relaxed text-slate-500">
          육아용품 탭 TOP10과 같은 상품명 기준으로 데모 후기를 붙였어요.
        </p>
      </section>
    </div>
  );
}
