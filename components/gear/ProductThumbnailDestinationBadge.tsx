import {
  getPurchaseDestinationInfo,
  type PurchaseDestinationKind,
  type PurchaseLinkFields,
} from "./purchaseDestination";

type Props = PurchaseLinkFields & {
  /** 기본은 하단 바. 작은 썸네일용으로 `compact` 권장 */
  variant?: "default" | "compact";
};

const TEXT_ON_TINT =
  "[text-shadow:0_1px_0_rgba(255,255,255,0.98),0_1px_2px_rgba(0,0,0,0.14),0_0_3px_rgba(255,255,255,0.7)]";

const KIND_CLASS: Record<PurchaseDestinationKind, string> = {
  coupang: `bg-white/90 text-[#FA622F] ring-2 ring-[#FA622F]/45 shadow-[0_2px_12px_rgba(250,98,47,0.28)] ${TEXT_ON_TINT}`,
  naver: `bg-white/90 text-[#03C75A] ring-2 ring-[#03C75A]/40 shadow-[0_2px_12px_rgba(3,199,90,0.26)] ${TEXT_ON_TINT}`,
  instagram: `bg-white/90 text-fuchsia-600 ring-2 ring-fuchsia-500/45 shadow-[0_2px_12px_rgba(192,38,211,0.28)] ${TEXT_ON_TINT}`,
  generic: `bg-white/90 text-slate-800 ring-2 ring-slate-400/45 shadow-[0_2px_10px_rgba(15,23,42,0.14)] ${TEXT_ON_TINT}`,
};

const SIZE_CLASS: Record<NonNullable<Props["variant"]>, string> = {
  default:
    "absolute bottom-1.5 left-1.5 right-1.5 z-[1] line-clamp-2 max-h-[2.55rem] rounded-lg px-1.5 py-0.5 text-center text-[8px] font-black leading-snug antialiased sm:text-[9px]",
  compact:
    "absolute bottom-1 left-1 right-1 z-[1] line-clamp-2 max-h-[2.1rem] rounded-md px-1 py-0.5 text-center text-[7px] font-black leading-snug antialiased sm:text-[8px]",
};

export function ProductThumbnailDestinationBadge({
  variant = "default",
  purchaseUrl,
  instagramUrl,
  externalPlatform,
}: Props) {
  const info = getPurchaseDestinationInfo({ purchaseUrl, instagramUrl, externalPlatform });
  if (!info) return null;

  const { headline, kind } = info;

  return (
    <span className={`${SIZE_CLASS[variant]} ${KIND_CLASS[kind]}`} title={headline}>
      {headline}
    </span>
  );
}
