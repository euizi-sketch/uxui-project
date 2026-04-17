import type { Product } from "../App";
import { ProductThumbnailDestinationBadge } from "../components/gear/ProductThumbnailDestinationBadge";

function gearCategoryShort(categoryId: string | undefined): string {
  const m: Record<string, string> = {
    diaper: "위생",
    feed: "수유",
    out: "외출",
    toy: "놀이",
    safe: "안전",
  };
  return categoryId ? m[categoryId] ?? "육아용품" : "육아용품";
}

type Props = {
  title: string;
  description: string;
  products: Product[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
};

export default function WeeklyTop10DetailPage({
  title,
  description,
  products,
  onBack,
  onSelectProduct,
}: Props) {
  return (
    <div className="min-h-dvh bg-[#dff6fb]">
      <header className="sticky top-0 z-10 border-b border-white/50 bg-[#dff6fb]/95 px-4 py-3.5 shadow-[0_8px_24px_-18px_rgba(13,148,136,0.2)] backdrop-blur-md">
        <div className="mx-auto flex max-w-app items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-lg text-slate-700 shadow-sm ring-1 ring-white/90 transition hover:bg-white hover:shadow-md"
            aria-label="뒤로"
          >
            ←
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-teal-700/90">Weekly TOP10</p>
            <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900">순위 자세히 보기</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-app px-4 pb-safe-tab pt-5 sm:px-5">
        <h2 className="text-[1.05rem] font-extrabold leading-snug text-slate-900 sm:text-lg">{title}</h2>
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-600">{description}</p>
        <p className="mt-3 text-[11px] font-semibold text-slate-400">
          총 <span className="tabular-nums text-slate-600">{products.length}</span>개 · 위에서부터 1위
        </p>

        <ol className="mt-6 space-y-3" aria-label="TOP10 순위 목록">
          {products.map((p, index) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelectProduct(p)}
                className="group flex w-full items-center gap-3 overflow-hidden rounded-[1.25rem] border border-teal-100/90 bg-white/95 p-3 text-left shadow-[0_10px_36px_-22px_rgba(13,148,136,0.35)] ring-1 ring-white/90 transition hover:border-teal-200 hover:shadow-md active:scale-[0.992] sm:gap-4 sm:p-3.5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FF853E] text-[15px] font-black tabular-nums text-white shadow-md sm:h-11 sm:w-11 sm:text-base">
                  {index + 1}
                </span>
                <div className="relative h-[4.25rem] w-[4.25rem] shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-white">
                  <img src={p.imageUrl} alt="" className="h-full w-full object-cover" loading={index < 4 ? "eager" : "lazy"} />
                  <ProductThumbnailDestinationBadge
                    variant="compact"
                    purchaseUrl={p.purchaseUrl}
                    instagramUrl={p.instagramUrl}
                    externalPlatform={p.externalPlatform}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-teal-700">{gearCategoryShort(p.categoryId)}</p>
                  <p className="mt-0.5 line-clamp-2 text-[14px] font-extrabold leading-snug tracking-tight text-slate-900">
                    {p.name}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-900 ring-1 ring-teal-100">
                      신뢰 {p.score}점
                    </span>
                    <span className="rounded-md bg-slate-100/95 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{p.tag}</span>
                  </div>
                  <p className="mt-2 text-[13px] font-extrabold tabular-nums text-slate-900">
                    {p.price}
                    <span className="text-xs font-bold text-slate-500">원</span>
                  </p>
                </div>
                <span className="hidden shrink-0 text-teal-600 opacity-70 sm:inline group-hover:opacity-100">›</span>
              </button>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
