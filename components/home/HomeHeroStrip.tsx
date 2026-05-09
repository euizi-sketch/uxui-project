import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { buildPersonalizedHomeFeed } from "../../home/personalizedHomeFeed";
import { loadChildrenFromStorage, loadMyPageProfileFromStorage } from "../../profile/momoProfileStorage";
import type { ChildProfileSlice } from "../../onboarding/types";
import { ageInMonthsFromBirth, parseBirthDate } from "./homeHeroBandImage";
import MetricCoachModal from "./MetricCoachModal";
import {
  preferenceClarityScore,
  recommendationFitScore,
  saveSignalScore,
  scoreToMeaningLevel,
  type MeaningLevel,
  type MetricCoachKey,
} from "./metricScores";
import { SCRAPS_UPDATED_EVENT, loadScrapsCleanedPersist } from "../../gear/gearScrapStorage";

export type { MeaningLevel };
export { scoreToMeaningLevel };

/** 홈 히어로 — 선명하고 생기 있는 오렌지(500) + 상단만 한 톤 밝게 */
const ORANGE = "#F97316";
const HERO_BASE = "bg-gradient-to-b from-[#FB923C] to-[#F97316]";

function readScrapCount(): number {
  return loadScrapsCleanedPersist().length;
}

function formatDotDate(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function childLabel(index: number, total: number) {
  if (total <= 1) return "우리 아이";
  if (index === 0) return "첫째 아이";
  if (index === 1) return "둘째 아이";
  return `아이 ${index + 1}`;
}

function genderKo(g: string) {
  if (g === "female") return "여아";
  if (g === "male") return "남아";
  return "";
}

function currentWeekLabelKorean() {
  const d = new Date();
  const w = Math.min(5, Math.ceil(d.getDate() / 7));
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${w}주차`;
}

const LEVEL_VISUAL: Record<
  MeaningLevel,
  {
    label: string;
    chipClass: string;
    stroke: string;
    fill: string;
    /** 종합 지수 등 큰 숫자용 */
    compositeNumClass: string;
  }
> = {
  low: {
    label: "낮음",
    chipClass:
      "border-amber-200/90 bg-amber-50 text-amber-900 ring-1 ring-amber-100",
    stroke: "#D97706",
    fill: "#FFFBEB",
    compositeNumClass: "text-amber-600",
  },
  mid: {
    label: "보통",
    chipClass:
      "border-[#BFDCE8]/90 bg-[#F4FAFD] text-[#1E5C74] ring-1 ring-[#D9ECF3]",
    stroke: "#2F7A96",
    fill: "#F2F9FC",
    compositeNumClass: "text-[#2F7A96]",
  },
  high: {
    label: "높음",
    chipClass:
      "border-[#A6CEDF]/90 bg-[#EFF7FB] text-[#174C62] ring-1 ring-[#CFE5EF]",
    stroke: "#1F5E78",
    fill: "#EAF4F9",
    compositeNumClass: "text-[#1F5E78]",
  },
};

/** 저장 활용도 전용 — 브랜드 오렌지 톤 (차트 점·칩) */
const SAVE_DOT = { stroke: ORANGE, fill: "#FFF7ED" };

const SAVE_LEVEL_CHIP: Record<MeaningLevel, string> = {
  low: "border-orange-200/90 bg-orange-50 text-orange-900 ring-1 ring-orange-100",
  mid: "border-orange-300/90 bg-orange-50 text-orange-950 ring-1 ring-orange-100",
  high: "border-[#F97316]/40 bg-[#FFF7ED] text-[#C2410C] ring-1 ring-orange-200/70",
};

function pickHomeStatsInsight(input: {
  interestCount: number;
  scrapCount: number;
  feedCount: number;
  pref: MeaningLevel;
  rec: MeaningLevel;
  save: MeaningLevel;
}): string {
  const { interestCount, scrapCount, feedCount, pref, rec, save } = input;

  if (interestCount >= 3 && rec === "high") {
    return "관심 영역이 풍부해져 추천 품질이 한 단계 올라갔어요.";
  }
  if (pref === "low" && interestCount <= 1) {
    return "관심 태그를 더하면 취향 파악도와 추천 정확도가 함께 좋아져요.";
  }
  if (scrapCount >= 2 && save !== "low") {
    return "저장 활동이 쌓이면서 맞춤 신호가 또렷해지고 있어요.";
  }
  if (feedCount >= 6 && interestCount >= 2) {
    return "맞춤 피드 구성이 안정적으로 유지되고 있어요.";
  }
  if (rec === "high" && pref === "mid") {
    return "추천 반영도는 좋아요. 관심 태그를 넓히면 체감이 더 정교해져요.";
  }
  if (save === "high") {
    return "저장 패턴이 분명해 개인화에 유리한 상태예요.";
  }
  return "활동을 이어 가면 맞춤 리포트가 더 정교해져요.";
}

/** 플레이그라운드 CTA — 무대·함께함 느낌의 미니 일러스트 */
function CtaPlaygroundArt({ className, gradientId }: { className?: string; gradientId: string }) {
  const gid = gradientId.replace(/\s/g, "");
  return (
    <svg viewBox="0 0 56 56" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`${gid}-spot`} x1="28" y1="6" x2="28" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" stopOpacity="0.45" />
          <stop offset="1" stopColor="#F97316" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gid}-deck`} x1="10" y1="38" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <path d="M28 8 L44 36 H12 Z" fill={`url(#${gid}-spot)`} />
      <ellipse cx="28" cy="41" rx="21" ry="7" fill={`url(#${gid}-deck)`} />
      <ellipse cx="28" cy="39.5" rx="18.5" ry="5.5" fill="#FFF7ED" opacity="0.95" />
      <circle cx="19" cy="29" r="4.2" fill="#F97316" />
      <path d="M19 33v5" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="28" cy="26.5" r="4.8" fill="#2F7A96" />
      <path d="M28 31v6" stroke="#2F7A96" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="37" cy="29" r="4.2" fill="#F97316" />
      <path d="M37 33v5" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M14 14l2 2M40 12v3M22 10h2"
        stroke="#FB923C"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

type Props = {
  interests: string[];
  /** 모모아 플레이그라운드 카드 선택 시 (예: 쿠폰함 오버레이) */
  onNavigatePlayground?: () => void;
};

export function HomeHeroStrip({ interests, onNavigatePlayground }: Props) {
  const statsGradientId = useId().replace(/:/g, "");
  const [slides, setSlides] = useState<ChildProfileSlice[]>(() => loadChildrenFromStorage());
  const [i, setI] = useState(0);
  const [scrapCount, setScrapCount] = useState(readScrapCount);
  const [nickname, setNickname] = useState(() => loadMyPageProfileFromStorage().nickname || "");
  const pausedRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [coachMetric, setCoachMetric] = useState<MetricCoachKey | null>(null);

  const sync = useCallback(() => {
    setSlides(loadChildrenFromStorage());
    setNickname(loadMyPageProfileFromStorage().nickname || "");
    setScrapCount(readScrapCount());
  }, []);

  useEffect(() => {
    const onProfileChanged = () => sync();
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    window.addEventListener(SCRAPS_UPDATED_EVENT, sync);
    window.addEventListener("momoA-profile-changed", onProfileChanged);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener(SCRAPS_UPDATED_EVENT, sync);
      window.removeEventListener("momoA-profile-changed", onProfileChanged);
    };
  }, [sync]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);

  const slideList = slides.length > 0 ? slides : [{ gender: "", birthDate: "", developmentStage: "", extraInfo: "" }];
  const len = slideList.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      setI((prev) => (prev + dir + len) % len);
    },
    [len]
  );

  useEffect(() => {
    if (reduceMotion || len <= 1) return undefined;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setI((p) => (p + 1) % len);
    }, 5500);
    return () => window.clearInterval(id);
  }, [len, reduceMotion]);

  useEffect(() => {
    setI((prev) => Math.min(prev, len - 1));
  }, [len]);

  const feedCount = useMemo(() => buildPersonalizedHomeFeed(interests, 8).length, [interests]);
  const interestCount = interests.filter(Boolean).length;

  const statsTitle = useMemo(() => {
    const n = nickname.trim();
    return n ? `${n}님의 맞춤 리포트` : "우리 집 맞춤 리포트";
  }, [nickname]);

  const meaningMetrics = useMemo(() => {
    const prefScore = preferenceClarityScore(interestCount);
    const recScore = recommendationFitScore(interestCount, feedCount);
    const saveScore = saveSignalScore(scrapCount);
    const prefLevel = scoreToMeaningLevel(prefScore);
    const recLevel = scoreToMeaningLevel(recScore);
    const saveLevel = scoreToMeaningLevel(saveScore);

    const rows = [
      {
        key: "pref",
        chartLabel: "취향 파악",
        cardTitle: "취향 파악도",
        blurb: "관심 영역이 얼마나 반영됐는지 보여요.",
        score: prefScore,
        level: prefLevel,
      },
      {
        key: "rec",
        chartLabel: "추천 정확도",
        cardTitle: "추천 정확도",
        blurb: "맞춤 피드와 관심의 연결 강도예요.",
        score: recScore,
        level: recLevel,
      },
      {
        key: "save",
        chartLabel: "저장 활용",
        cardTitle: "저장 활용도",
        blurb: "스크랩으로 쌓인 개인화 신호예요.",
        score: saveScore,
        level: saveLevel,
      },
    ];

    const insight = pickHomeStatsInsight({
      interestCount,
      scrapCount,
      feedCount,
      pref: prefLevel,
      rec: recLevel,
      save: saveLevel,
    });

    const composite = Math.round((prefScore + recScore + saveScore) / 3);

    return { rows, insight, composite, prefScore, recScore, saveScore };
  }, [scrapCount, interestCount, feedCount]);

  const coachCtx = useMemo(
    () => ({
      interestCount,
      feedCount,
      scrapCount,
      prefScore: meaningMetrics.prefScore,
      recScore: meaningMetrics.recScore,
      saveScore: meaningMetrics.saveScore,
    }),
    [
      interestCount,
      feedCount,
      scrapCount,
      meaningMetrics.prefScore,
      meaningMetrics.recScore,
      meaningMetrics.saveScore,
    ]
  );

  const chartPolyline = useMemo(() => {
    const w = 300;
    const h = 92;
    const padX = 14;
    const padTop = 14;
    const padBottom = 30;
    const innerH = h - padTop - padBottom;
    const { rows } = meaningMetrics;
    const n = rows.length;
    const coords = rows.map((d, ix) => {
      const x = padX + (ix * (w - padX * 2)) / Math.max(1, n - 1);
      const y = padTop + (1 - d.score / 100) * innerH;
      return { x, y, level: d.level, key: d.key };
    });
    const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
    const baseY = padTop + innerH;
    const first = coords[0]!;
    const last = coords[coords.length - 1]!;
    const area = `M ${first.x} ${baseY} ${coords.map((c) => `L ${c.x} ${c.y}`).join(" ")} L ${last.x} ${baseY} Z`;
    return { line, area, w, h, coords, padBottom, padTop };
  }, [meaningMetrics]);

  return (
    <div className="w-full">
      {/* 1) 아이 프로필 캐러셀 — 코랄·오렌지 톤, 패턴, 플랫(그림자 없음) */}
      <section className={`relative overflow-hidden ${HERO_BASE}`} aria-label="아이 프로필">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(135deg, rgba(255,255,255,.09) 0 2px, transparent 2px 14px),
              radial-gradient(circle at 18% 22%, rgba(255,255,255,.14) 0 1px, transparent 12px),
              radial-gradient(circle at 82% 68%, rgba(255,255,255,.12) 0 1px, transparent 14px)
            `,
          }}
          aria-hidden
        />

        <div
          className="relative px-4 pb-10 pt-6 sm:px-6 sm:pb-11 sm:pt-7"
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
        >
          <div className="relative mx-auto max-w-lg overflow-hidden sm:max-w-none">
            <div
              className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${i * 100}%)` }}
            >
              {slideList.map((child, slideIdx) => {
                const birth = parseBirthDate(child.birthDate);
                const months = birth ? ageInMonthsFromBirth(birth) : null;
                const metaLine = [birth ? formatDotDate(birth) : null, genderKo(child.gender)].filter(Boolean).join(" · ");
                return (
                  <div key={slideIdx} className="w-full shrink-0 text-white">
                    <div className="min-h-[8rem] pb-1 sm:min-h-[8.5rem]">
                      <div className="min-w-0">
                        <p className="text-2xl font-bold leading-tight tracking-tight sm:text-[1.65rem]">
                          {childLabel(slideIdx, slideList.length)}
                        </p>
                        {months != null ? (
                          <p className="mt-2 text-lg font-semibold text-white/95 sm:text-xl">
                            태어난 지 {months}개월
                          </p>
                        ) : (
                          <p className="mt-2 text-[15px] font-medium leading-snug text-white/90">
                            마이페이지에서 생일을 입력하면 월령이 표시돼요.
                          </p>
                        )}
                        {metaLine ? (
                          <p className="mt-2 text-[13px] font-medium text-white/80">{metaLine}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {len > 1 ? (
              <div
                className="mt-5 flex justify-center gap-2"
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
                  if (Math.abs(dx) < 36) return;
                  pausedRef.current = true;
                  if (dx < 0) go(1);
                  else go(-1);
                  window.setTimeout(() => {
                    pausedRef.current = false;
                  }, 6000);
                }}
              >
                {Array.from({ length: len }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`아이 프로필 ${idx + 1}`}
                    aria-current={idx === i ? "true" : undefined}
                    onClick={() => {
                      setI(idx);
                      pausedRef.current = true;
                      window.setTimeout(() => {
                        pausedRef.current = false;
                      }, 6000);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === i ? "w-8 bg-white" : "w-2 bg-white/45"
                    }`}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-2 h-2" aria-hidden />
            )}
          </div>
        </div>
      </section>

      {/* 2) 중앙 CTA — 글래스감·그라데이션 브릿지 */}
      <div className="relative z-[1] -mt-6 px-4 sm:px-6">
        <button
          type="button"
          aria-label="모모아 플레이그라운드로 이동"
          className="group relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 text-left shadow-[0_14px_44px_-14px_rgba(249,115,22,0.35)] ring-1 ring-orange-100/90 backdrop-blur-[6px] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_-14px_rgba(249,115,22,0.42)] hover:ring-orange-200 active:translate-y-0 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF7ED] sm:max-w-none"
          onClick={() => {
            document
              .getElementById("playground-section")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
            onNavigatePlayground?.();
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-90"
            aria-hidden
            style={{
              background:
                "linear-gradient(135deg, rgba(255,251,247,1) 0%, rgba(255,255,255,0.98) 42%, rgba(255,237,214,0.65) 100%)",
            }}
          />
          <div className="pointer-events-none absolute -left-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[#F97316]/[0.07] blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#7FB5CA]/[0.12] blur-3xl" aria-hidden />

          <div className="relative flex items-center gap-4 px-[1.15rem] py-[1.05rem] sm:gap-5 sm:px-6 sm:py-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#F97316]/12 px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#C2410C]">
                  플레이그라운드
                </span>
                <span className="text-[11px] font-semibold tracking-wide text-slate-400">
                  투표 · 후기 · 함께 참여
                </span>
              </div>
              <p className="mt-2.5 text-[1.06rem] font-bold leading-snug tracking-tight text-slate-900 sm:text-[1.12rem]">
                엄마들이 함께 만드는
                <br />
                작은 무대, 플레이그라운드
              </p>
              <div className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-[#EA580C] transition group-hover:gap-2.5">
                <span>아래로 — 모모아 플레이그라운드</span>
                <svg
                  className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-y-0.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M8 3v9M4 11l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="relative shrink-0">
              <div className="relative flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-white via-[#FFF9F5] to-[#FFE8D6] shadow-inner shadow-orange-950/5 ring-1 ring-orange-100 transition duration-300 group-hover:ring-orange-200/90 sm:h-[5.25rem] sm:w-[5.25rem]">
                <div className="pointer-events-none absolute inset-1 rounded-xl bg-gradient-to-br from-orange-400/15 to-transparent" aria-hidden />
                <CtaPlaygroundArt gradientId={`${statsGradientId}-cta-pg`} className="relative h-[3.05rem] w-[3.05rem] drop-shadow-[0_4px_14px_rgba(249,115,22,0.28)] sm:h-[3.35rem] sm:w-[3.35rem]" />
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* 3) 의미 중심 맞춤 리포트 — 그래프 중심 + 지표 카드 + 인사이트 */}
      <section className="mt-8 px-4 pb-6 sm:px-6" aria-labelledby="home-stats-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#F97316]">맞춤 인사이트</p>
        <h2 id="home-stats-heading" className="mt-1 text-lg font-bold tracking-tight text-slate-900">
          {statsTitle}
        </h2>

        <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                종합 맞춤 지수
              </p>
              <p className="mt-0.5 flex items-baseline gap-2">
                <span
                  className={`text-3xl font-black tabular-nums tracking-tight ${
                    LEVEL_VISUAL[scoreToMeaningLevel(meaningMetrics.composite)].compositeNumClass
                  }`}
                >
                  {meaningMetrics.composite}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </p>
            </div>
            <div
              className={`rounded-2xl px-3 py-2 text-center ${
                LEVEL_VISUAL[scoreToMeaningLevel(meaningMetrics.composite)].chipClass
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">전체 상태</p>
              <p className="text-sm font-bold">
                {LEVEL_VISUAL[scoreToMeaningLevel(meaningMetrics.composite)].label}
              </p>
            </div>
          </div>

          <p className="mb-3 text-xs font-semibold text-slate-700">맞춤 세 축 (0–100 기준)</p>
          <svg
            viewBox={`0 0 ${chartPolyline.w} ${chartPolyline.h + 20}`}
            className="h-auto w-full max-w-full overflow-visible"
            role="img"
            aria-label="취향 파악도, 추천 정확도, 저장 활용도 추이"
          >
            <title>맞춤 세 축 추이</title>
            <defs>
              <linearGradient id={`home-stats-area-${statsGradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ORANGE} stopOpacity="0.28" />
                <stop offset="100%" stopColor={ORANGE} stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 50, 100].map((tick) => {
              const y =
                chartPolyline.padTop +
                (1 - tick / 100) * (chartPolyline.h - chartPolyline.padTop - chartPolyline.padBottom);
              return (
                <g key={tick}>
                  <line
                    x1="10"
                    x2={chartPolyline.w - 10}
                    y1={y}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray={tick === 0 || tick === 100 ? "0" : "4 6"}
                    strokeWidth="1"
                  />
                  <text x="8" y={y + 3} className="fill-slate-300" style={{ fontSize: "8px" }}>
                    {tick}
                  </text>
                </g>
              );
            })}

            <path d={chartPolyline.area} fill={`url(#home-stats-area-${statsGradientId})`} />
            <polyline
              fill="none"
              stroke={ORANGE}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={chartPolyline.line}
            />
            {meaningMetrics.rows.map((d, ix) => {
              const c = chartPolyline.coords[ix];
              if (!c) return null;
              const lv = LEVEL_VISUAL[d.level];
              const dot =
                d.key === "save" ? SAVE_DOT : { stroke: lv.stroke, fill: lv.fill };
              return (
                <g key={d.key}>
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r="6"
                    fill={dot.fill}
                    stroke={dot.stroke}
                    strokeWidth="2.25"
                  />
                  <text
                    x={c.x}
                    y={chartPolyline.h + 14}
                    textAnchor="middle"
                    className={d.key === "save" ? "fill-[#EA580C]" : "fill-slate-600"}
                    style={{ fontSize: "10px", fontWeight: 600 }}
                  >
                    {d.chartLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {meaningMetrics.rows.map((d) => {
            const lv = LEVEL_VISUAL[d.level];
            const chipClass = d.key === "save" ? SAVE_LEVEL_CHIP[d.level] : lv.chipClass;
            const lowTier = d.level === "low";
            return (
              <button
                type="button"
                key={d.key}
                onClick={() => setCoachMetric(d.key as MetricCoachKey)}
                className={`rounded-2xl border p-4 text-left shadow-sm shadow-slate-200/30 transition hover:brightness-[1.02] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/45 ${
                  d.key === "save"
                    ? "border-orange-100 bg-gradient-to-br from-orange-50/90 to-white ring-1 ring-orange-100/80 hover:ring-orange-300/70"
                    : `border-slate-100 bg-white hover:ring-2 hover:ring-[#DCEAF1] ${
                        lowTier ? "ring-1 ring-amber-100/90" : ""
                      }`
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm font-bold leading-snug ${
                      d.key === "save" ? "text-orange-950" : "text-slate-900"
                    }`}
                  >
                    {d.cardTitle}
                  </p>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${chipClass}`}>
                    {lv.label}
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{d.blurb}</p>
                <p className="mt-3 text-xs font-semibold tabular-nums text-slate-700">
                  지표 점수{" "}
                  <span className={d.key === "save" ? "text-[#F97316]" : "text-[#2F6F88]"}>{d.score}</span>
                  <span className="font-normal text-slate-400"> / 100</span>
                </p>
                <p className="mt-3 text-[11px] font-semibold text-[#F97316]/90">코치 보기 →</p>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[11px] leading-snug text-slate-400">
          카드를 탭하면 데이터 기반 원인 분석과 개선 행동을 안내해 드려요.
          {meaningMetrics.rows.some((r) => r.level === "low") ? (
            <span className="block text-amber-700/90">
              지금은 일부 지표가 낮게 보일 수 있어요 — 코치에서 바로 따라 할 수 있어요.
            </span>
          ) : null}
        </p>

        <div className="mt-4 rounded-2xl border border-[#D5E8F1] bg-gradient-to-br from-[#F4FAFD] to-white px-4 py-3.5 shadow-sm">
          <div className="flex gap-3">
            <span className="text-xl leading-none" aria-hidden>
              💡
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#1E5C74]/90">
                인사이트
              </p>
              <p className="mt-1 text-[13px] font-medium leading-relaxed text-slate-700">
                {meaningMetrics.insight}
              </p>
              <p className="mt-2 text-[11px] font-normal text-slate-400">{currentWeekLabelKorean()} 기준</p>
            </div>
          </div>
        </div>
      </section>

      <MetricCoachModal metricKey={coachMetric} onClose={() => setCoachMetric(null)} ctx={coachCtx} />
    </div>
  );
}
