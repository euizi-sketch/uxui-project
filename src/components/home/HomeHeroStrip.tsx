import { useCallback, useEffect, useMemo, useState } from "react";
import { buildPersonalizedHomeFeed } from "../../home/personalizedHomeFeed";
import { loadMyPageProfileFromStorage } from "../../profile/momoProfileStorage";
import {
  HERO_STRIP_BASE_SOLID_CLASS,
  heroBandImageSrc,
  resolveHeroBand,
} from "./homeHeroBandImage";

type ScrapItem = { productId: number; savedAt: number };

function readScrapCount(): number {
  try {
    const raw = localStorage.getItem("momoA.scraps");
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return 0;
    return parsed.filter((x) => x && typeof (x as ScrapItem).productId === "number").length;
  } catch {
    return 0;
  }
}

type Props = {
  interests: string[];
};

export function HomeHeroStrip({ interests }: Props) {
  const [scrapCount, setScrapCount] = useState(readScrapCount);
  const [childBirthDate, setChildBirthDate] = useState(
    () => loadMyPageProfileFromStorage().birthDate || ""
  );
  const [childDevelopmentStage, setChildDevelopmentStage] = useState(
    () => loadMyPageProfileFromStorage().developmentStage || ""
  );
  const [childGender, setChildGender] = useState(() => loadMyPageProfileFromStorage().gender || "");
  const [nickname, setNickname] = useState(() => loadMyPageProfileFromStorage().nickname || "");

  const sync = useCallback(() => {
    const p = loadMyPageProfileFromStorage();
    setChildBirthDate(p.birthDate || "");
    setChildDevelopmentStage(p.developmentStage || "");
    setChildGender(p.gender || "");
    setNickname(p.nickname || "");
    setScrapCount(readScrapCount());
  }, []);

  useEffect(() => {
    const onProfileChanged = () => sync();
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("momoA-profile-changed", onProfileChanged);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("momoA-profile-changed", onProfileChanged);
    };
  }, [sync]);

  const feedCount = useMemo(() => buildPersonalizedHomeFeed(interests, 8).length, [interests]);
  const interestCount = interests.filter(Boolean).length;

  const preciousChildLine = useMemo(() => {
    const n = nickname.trim();
    return n ? `${n}님의 귀한 아이` : "회원님의 귀한 아이";
  }, [nickname]);

  const heroBand = useMemo(
    () => resolveHeroBand(childBirthDate, childDevelopmentStage),
    [childBirthDate, childDevelopmentStage]
  );

  const heroImageSrc = useMemo(
    () => heroBandImageSrc(heroBand, childGender),
    [heroBand, childGender]
  );

  const heroImageAlt = useMemo(() => {
    const bandKo =
      heroBand === "infant" ? "영아기" : heroBand === "toddler" ? "유아기" : "아동기";
    const gKo = childGender === "female" ? "여아" : "남아";
    return `${bandKo} ${gKo} 맞춤 홈 일러스트`;
  }, [heroBand, childGender]);

  const showHeroImage = Boolean(heroImageSrc);

  const titleClass =
    "z-[12] max-w-[min(100%,18rem)] break-words text-left text-xl font-extrabold leading-snug tracking-tight text-white sm:max-w-[min(100%,20rem)] sm:text-2xl" +
    (showHeroImage ? " shrink min-w-0 pb-0.5" : "");

  return (
    <section className="mb-1 w-full" aria-label="홈 환영 영역">
      <div
        className={`relative isolate overflow-x-hidden overflow-y-visible rounded-b-[2rem] px-3 pb-6 pt-3 sm:rounded-b-[2.25rem] sm:px-5 sm:pb-7 sm:pt-4 ${HERO_STRIP_BASE_SOLID_CLASS}`}
      >
        {showHeroImage ? (
          <div className="relative z-[1] flex min-h-[10rem] w-full flex-row items-end justify-between gap-3 sm:min-h-[11.5rem]">
            <p className={titleClass} aria-label={preciousChildLine}>
              {preciousChildLine}
            </p>
            <div className="relative z-[30] isolate flex shrink-0 items-end justify-end self-end">
              <div
                className="pointer-events-none absolute -bottom-2 -right-0.5 h-[min(10rem,44vw)] w-[min(8.5rem,36vw)] rounded-[1.75rem] bg-[#FFD0C4]/90 blur-[32px] sm:-bottom-3 sm:h-[12rem] sm:w-[10.5rem] sm:blur-[38px]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute bottom-0.5 right-1.5 h-16 w-16 rounded-full bg-[#FFE4DC]/80 blur-xl sm:bottom-1 sm:h-20 sm:w-20"
                aria-hidden
              />
              <img
                key={heroImageSrc}
                src={heroImageSrc}
                alt={heroImageAlt}
                className="relative z-[1] block h-auto max-h-[9rem] w-auto max-w-[min(40vw,9.5rem)] bg-transparent object-contain object-bottom sm:max-h-[11rem] sm:max-w-[11rem]"
                decoding="async"
              />
            </div>
          </div>
        ) : (
          <>
            <p
              className="pointer-events-none absolute bottom-6 left-3 z-[12] max-w-[min(100%,18rem)] break-words text-left text-xl font-extrabold leading-snug tracking-tight text-white sm:bottom-7 sm:left-5 sm:max-w-[20rem] sm:text-2xl"
              aria-label={preciousChildLine}
            >
              {preciousChildLine}
            </p>
            <div className="relative z-[1] flex min-h-[6rem] items-end justify-center sm:min-h-[7rem]" aria-hidden="true" />
          </>
        )}
      </div>

      <div className="relative z-10 -mt-4 px-1 sm:-mt-5 md:px-2">
        <div className="mx-auto max-w-lg rounded-3xl bg-white px-5 pb-5 pt-8 shadow-[0_16px_48px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/80 sm:max-w-none sm:pt-9">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <div className="px-1 text-center">
              <p className="text-2xl font-black tabular-nums text-[#FF853E] md:text-3xl">{scrapCount}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-500 md:text-xs">스크랩</p>
            </div>
            <div className="px-1 text-center">
              <p className="text-2xl font-black tabular-nums text-[#FF853E] md:text-3xl">{interestCount}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-500 md:text-xs">관심 태그</p>
            </div>
            <div className="px-1 text-center">
              <p className="text-2xl font-black tabular-nums text-[#FF853E] md:text-3xl">{feedCount}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-500 md:text-xs">맞춤 피드</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#FFF8F4] px-3 py-2.5 ring-1 ring-[#FFD2BF]/80">
            <span className="text-lg" aria-hidden="true">
              ✓
            </span>
            <p className="text-left text-xs font-semibold leading-snug text-slate-700">
              관심사를 바꾸면 홈 맞춤 피드가 바로 다시 정렬돼요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
