import { useEffect, useMemo, useState } from "react";
import { getPurchaseDestinationInfo } from "./purchaseDestination";

export type GearProductDetailModel = {
  id: number;
  name: string;
  price: string;
  score: number;
  tag: string;
  imageUrl: string;
  categoryId?: string;
  description?: string;
  reviewCount?: number;
  detailMetaLeft?: string;
  galleryUrls?: string[];
  sellerName?: string;
  sellerAvatarUrl?: string;
  purchaseUrl?: string;
  externalPlatform?: string;
  popularitySignal?: string;
  reviewBullets?: string[];
  specBullets?: string[];
  retailPriceNote?: string;
  instagramUrl?: string;
};

type Props = {
  product: GearProductDetailModel;
  categoryLabel: string;
  onClose: () => void;
  /** 장바구니에 실제 상품 라인 추가 */
  onAddToCart?: () => void;
  /** 담은 뒤 결제 화면까지 바로 진입 */
  onBuyNow?: () => void;
};

function defaultGallery(p: GearProductDetailModel): string[] {
  if (p.galleryUrls?.length) return p.galleryUrls;
  return [p.imageUrl, p.imageUrl, p.imageUrl];
}

/** 가격 아래 — 외부 구매·상세 이동 사이트 안내 */
function ExternalSiteBadge({ product }: { product: GearProductDetailModel }) {
  const info = getPurchaseDestinationInfo(product);
  if (!info) return null;

  const { headline, kind } = info;
  let shell =
    "border border-slate-200 bg-slate-50 text-slate-800 ring-1 ring-slate-100";
  let dot = "bg-slate-400";

  if (kind === "instagram") {
    shell =
      "border border-fuchsia-200/90 bg-fuchsia-50 text-fuchsia-950 ring-1 ring-fuchsia-100";
    dot = "bg-fuchsia-500 shadow-sm shadow-fuchsia-300/30";
  } else if (kind === "coupang") {
    shell =
      "border border-[#FFD2BF] bg-[#FFF8F4] text-[#9A3412] ring-1 ring-[#FFD2BF]/80";
    dot = "bg-[#FF853E] shadow-sm shadow-orange-300/35";
  } else if (kind === "naver") {
    shell =
      "border border-emerald-200 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-100";
    dot = "bg-[#03C75A] shadow-sm shadow-emerald-400/25";
  }

  return (
    <div
      className={`mt-3 flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${shell}`}
      role="status"
      aria-label={`연결 사이트 ${headline}`}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">연결 이동</p>
        <p className="mt-0.5 text-[13px] font-extrabold leading-tight">{headline}</p>
      </div>
      <span className="shrink-0 rounded-lg bg-white/80 px-2 py-1 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200/80">
        외부 앱·웹
      </span>
    </div>
  );
}

export default function GearProductDetail({ product, categoryLabel, onClose, onAddToCart, onBuyNow }: Props) {
  const [slide, setSlide] = useState(0);

  const gallery = useMemo(() => defaultGallery(product), [product]);
  const description =
    product.description?.trim() ||
    `${product.tag} · 맘카페·SNS에서 반복 추천되는 상품이에요. 구성과 사용 환경은 상세 안내를 참고해 주세요.`;

  const reviewCount = product.reviewCount ?? Math.max(3, Math.min(99, Math.round(product.score / 3)));
  const metaLeft = product.detailMetaLeft ?? "정가 · 구성 안내";
  const sellerName = product.sellerName ?? "모모아 큐레이터";
  const sellerAvatar =
    product.sellerAvatarUrl ??
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    setSlide(0);
  }, [product.id]);

  const n = gallery.length;

  return (
    <div className="app-viewport-fixed z-[80] flex flex-col bg-white">
      <header className="flex shrink-0 items-center gap-2 border-b border-slate-100 bg-white px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
          aria-label="뒤로"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="min-w-0 flex-1 px-2 text-center text-[15px] font-bold leading-snug text-slate-900 line-clamp-2 sm:text-base">
          {product.name}
        </h1>
        <span className="h-10 w-10 shrink-0" aria-hidden />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white pb-safe-tab">
        <div className="mx-auto w-full max-w-lg px-4 pb-10 pt-4 sm:px-5">
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
            <div className="w-full overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{
                  width: `${n * 100}%`,
                  transform: `translateX(-${(slide * 100) / n}%)`,
                }}
              >
                {gallery.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    className="aspect-square shrink-0 bg-[#FAFAFA]"
                    style={{ width: `${100 / n}%` }}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-2 py-3">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`이미지 ${i + 1}`}
                  aria-current={i === slide}
                  onClick={() => setSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === slide ? "w-7 bg-[#FF853E]" : "w-1.5 bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="mt-6 text-xs font-medium text-slate-500">{categoryLabel}</p>
          <h2 className="mt-1 text-[1.35rem] font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl">
            {product.name}
          </h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{description}</p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-900">{metaLeft}</span>
            <button
              type="button"
              onClick={() => window.alert("리뷰 목록(데모)")}
              className="shrink-0 text-sm font-semibold text-[#FF853E] hover:underline"
            >
              리뷰 {reviewCount}개
            </button>
          </div>

          {product.instagramUrl && !product.purchaseUrl ? (
            <p className="mt-4 text-lg font-extrabold text-fuchsia-700">Instagram 게시물 링크</p>
          ) : (
            <p className="mt-4 text-2xl font-extrabold tabular-nums text-slate-900">{product.price}원</p>
          )}

          <ExternalSiteBadge product={product} />

          {product.retailPriceNote && (
            <p className="mt-2 text-[12px] font-medium leading-relaxed text-slate-500">{product.retailPriceNote}</p>
          )}

          {product.instagramUrl && (
            <div className="mt-5 rounded-2xl border border-fuchsia-200/90 bg-fuchsia-50 px-4 py-4 ring-1 ring-fuchsia-100">
              {product.popularitySignal && (
                <p className="text-[12px] font-semibold text-slate-700">{product.popularitySignal}</p>
              )}
              <a
                href={product.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-600 py-3.5 text-[14px] font-bold text-white shadow-md transition hover:brightness-[1.05]"
              >
                Instagram에서 게시물 열기
                <span aria-hidden>↗</span>
              </a>
              <p className="mt-2 text-[10px] font-medium text-slate-500">
                Meta(Instagram) 서비스로 이동합니다. 앱 미설치 시 브라우저로 열릴 수 있어요.
              </p>
            </div>
          )}

          {product.purchaseUrl && (
            <div
              className={`mt-5 rounded-2xl px-4 py-4 ${
                product.purchaseUrl.includes("brand.naver.com") ||
                product.externalPlatform?.includes("네이버")
                  ? "border border-emerald-200/90 bg-emerald-50 ring-1 ring-emerald-100"
                  : "border border-[#FFD2BF]/80 bg-[#FFF8F4]"
              }`}
            >
              {product.popularitySignal && (
                <p className="text-[12px] font-semibold text-slate-700">{product.popularitySignal}</p>
              )}
              <a
                href={product.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-bold text-white shadow-md transition ${
                  product.purchaseUrl.includes("brand.naver.com") ||
                  product.externalPlatform?.includes("네이버")
                    ? "bg-[#03C75A] hover:brightness-[1.06]"
                    : "bg-[#FF853E] hover:brightness-[1.03]"
                }`}
              >
                {product.externalPlatform ?? "구매처"}에서 상품 페이지 열기
                <span aria-hidden>↗</span>
              </a>
              <p className="mt-2 text-[10px] font-medium text-slate-400">
                외부 사이트로 이동합니다. 가격·배송은 해당 쇼핑몰 안내를 확인해 주세요.
              </p>
            </div>
          )}

          {(product.reviewBullets?.length || product.specBullets?.length) ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {product.reviewBullets && product.reviewBullets.length > 0 ? (
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-sky-800">후기·반응</p>
                  <ul className="mt-2 space-y-2 text-[12px] font-medium leading-relaxed text-slate-700">
                    {product.reviewBullets.map((t, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-400" aria-hidden />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {product.specBullets && product.specBullets.length > 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-600">상품 정보</p>
                  <ul className="mt-2 space-y-2 text-[12px] font-medium leading-relaxed text-slate-700">
                    {product.specBullets.map((t, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#FF853E]" aria-hidden />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {!(product.instagramUrl && !product.purchaseUrl) ? (
            <div className="mt-6 flex gap-3">
              {onAddToCart && (
                <button
                  type="button"
                  onClick={() => onAddToCart()}
                  className="flex-1 rounded-2xl border-2 border-[#FFD2BF] bg-white py-4 text-[15px] font-bold text-[#E85A20] shadow-sm transition hover:bg-[#FFFCF9] active:scale-[0.99]"
                >
                  장바구니 담기
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (onBuyNow) {
                    onBuyNow();
                    return;
                  }
                  window.alert("결제 플로우(데모)");
                }}
                className={`rounded-2xl bg-[#FF853E] py-4 text-[15px] font-bold text-white shadow-md shadow-orange-200/40 transition hover:brightness-[1.02] active:scale-[0.99] ${onAddToCart ? "flex-1" : "w-full"}`}
              >
                {onBuyNow ? "바로 구매" : "바로 결제하기"}
              </button>
            </div>
          ) : null}

          <div className="my-8 h-2.5 rounded-full bg-slate-100" aria-hidden />

          <div className="flex items-center gap-3">
            <img
              src={sellerAvatar}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[#FFD2BF]/60"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">판매·안내</p>
              <p className="mt-0.5 text-base font-bold text-slate-900">{sellerName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
