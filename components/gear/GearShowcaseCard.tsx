import type { MouseEvent, ReactNode } from "react";
import { ProductThumbnailDestinationBadge } from "./ProductThumbnailDestinationBadge";

/**
 * 육아용품 탭 — 쇼핑 레퍼런스형 가로 스크롤 카드 (카테고리·할인·가격·관심 지표)
 */

export type GearShowcaseProduct = {
  id: number;
  name: string;
  price: string;
  score: number;
  tag?: string;
  imageUrl: string;
  categoryId?: string;
  purchaseUrl?: string;
  instagramUrl?: string;
  externalPlatform?: string;
};

type GearShowcaseCardProps = {
  product: GearShowcaseProduct;
  categoryLabel: string;
  /** 좌상단 작은 뱃지 (필수·추천·모모아 등) */
  badge?: string;
  /** 1~10 순위 뱃지 (badge 없을 때) */
  rank?: number;
  /** 인스타 등 링크형 큐레이션 — 할인율·원가 대신 SNS 안내 */
  instagramListing?: boolean;
  /** 탭 시 상품 상세 */
  onSelect?: () => void;
  /** 스크랩 토글 — 있으면 썸네일 우측 상단에 표시 */
  isScrapped?: boolean;
  onToggleScrap?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export function GearShowcaseCard({
  product,
  categoryLabel,
  badge,
  rank,
  instagramListing,
  onSelect,
  isScrapped,
  onToggleScrap,
}: GearShowcaseCardProps) {
  const discount = Math.max(6, Math.min(42, 100 - Math.floor(product.score * 0.22)));

  const shellClass =
    "w-[160px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white text-left shadow-[0_6px_24px_-8px_rgba(15,23,42,0.1)] ring-1 ring-slate-100/90 transition hover:-translate-y-0.5 hover:shadow-md sm:w-[164px]";

  const inner = (
    <>
      <div className="relative aspect-square bg-[#FAFAFA] p-2">
        {badge ? (
          <span className="absolute left-2 top-2 z-[1] max-w-[calc(100%-0.75rem)] rounded-md bg-white/95 px-1.5 py-0.5 text-left text-[9px] font-bold leading-snug text-[#FF853E] shadow-sm ring-1 ring-[#FFD2BF]/70 line-clamp-2">
            {badge}
          </span>
        ) : rank != null ? (
          <span className="absolute left-2 top-2 z-[1] flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#FF853E] px-1 text-[11px] font-bold tabular-nums text-white shadow-md">
            {rank}
          </span>
        ) : null}
        <img
          src={product.imageUrl}
          alt=""
          className="h-full w-full rounded-xl object-cover"
          loading="lazy"
        />
        <ProductThumbnailDestinationBadge
          purchaseUrl={product.purchaseUrl}
          instagramUrl={product.instagramUrl}
          externalPlatform={product.externalPlatform}
        />
        {onToggleScrap && (
          <button
            type="button"
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onToggleScrap(e);
            }}
            className={`absolute right-2 top-2 z-[2] inline-flex h-8 w-8 items-center justify-center rounded-xl text-[14px] shadow-sm ring-1 transition ${
              isScrapped
                ? "bg-[#FFF1EA] text-[#FF853E] ring-[#FFD2BF]"
                : "bg-white/95 text-slate-400 ring-slate-200/90 hover:bg-white"
            }`}
            aria-label={isScrapped ? "스크랩 해제" : "스크랩"}
          >
            {isScrapped ? "★" : "☆"}
          </button>
        )}
      </div>
      <div className="px-3 pb-3.5 pt-2">
        <p className="text-[10px] font-medium text-slate-400">{categoryLabel}</p>
        <p className="mt-0.5 line-clamp-3 min-h-[2.85rem] text-[12px] font-bold leading-snug text-slate-900">
          {product.name}
        </p>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-1 text-[11px]">
          {instagramListing ? (
            <span className="font-bold text-fuchsia-600">Instagram에서 보기</span>
          ) : (
            <>
              <span className="font-bold text-[#FF853E]">{discount}%</span>
              <span className="font-bold text-slate-900">{product.price}원</span>
            </>
          )}
        </p>
        <p className="mt-1.5 text-[10px] text-slate-400">
          관심 <span className="font-normal text-slate-500">{product.score}</span>
          <span className="mx-1 text-slate-300">·</span>
          후기 반영
        </p>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} className={shellClass}>
        {inner}
      </button>
    );
  }

  return (
    <article className={shellClass}>
      {inner}
    </article>
  );
}

export function GearSectionHeader({
  title,
  moreLabel = "더보기",
  onMore,
}: {
  title: ReactNode;
  moreLabel?: string;
  onMore?: () => void;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="min-w-0 text-[17px] font-bold leading-snug tracking-tight text-slate-900">{title}</h2>
      {onMore && (
        <button
          type="button"
          onClick={onMore}
          className="shrink-0 text-[12px] font-medium text-slate-400 transition hover:text-slate-600"
        >
          {moreLabel}
        </button>
      )}
    </div>
  );
}

export function GearHorizontalRail({ children }: { children: ReactNode }) {
  return (
    <div className="relative -mx-1">
      <div className="overflow-x-auto pb-1 pt-0.5 [scrollbar-width:thin] scroll-pl-1 scroll-pr-4">
        <div className="flex w-max snap-x snap-mandatory gap-3 pl-1 pr-4">{children}</div>
      </div>
    </div>
  );
}
