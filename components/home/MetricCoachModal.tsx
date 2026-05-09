import {
  type MeaningLevel,
  type MetricCoachKey,
  preferenceClarityScore,
  recommendationFitScore,
  saveSignalScore,
  scoreToMeaningLevel,
} from "./metricScores";

export const MAIN_TAB_EVENT = "momoA-request-main-tab";

export function requestMainTab(tab: "home" | "gear" | "family" | "reviews" | "mypage") {
  window.dispatchEvent(new CustomEvent(MAIN_TAB_EVENT, { detail: { tab } }));
}

function scrollToElement(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export type CoachContext = {
  interestCount: number;
  feedCount: number;
  scrapCount: number;
  prefScore: number;
  recScore: number;
  saveScore: number;
};

type CoachCause = { lead: string; detail?: string };
type CoachImprovement = { title: string; bullets: string[] };
type CoachStep = { step: number; title: string; bullets: string[] };

type CoachPlan = {
  metricKey: MetricCoachKey;
  level: MeaningLevel;
  currentScore: number;
  projectedScore: number;
  headline: string;
  /** 한 줄로 스캔 가능한 상태 요약 */
  summaryOneLiner: string;
  causes: CoachCause[];
  improvements: CoachImprovement[];
  steps: CoachStep[];
  ctas: {
    label: string;
    primary?: boolean;
    onActivate: () => void;
  }[];
};

function buildPlan(metricKey: MetricCoachKey, ctx: CoachContext, onClose: () => void): CoachPlan {
  const { interestCount, feedCount, scrapCount, prefScore, recScore, saveScore } = ctx;
  let score = prefScore;
  if (metricKey === "rec") score = recScore;
  if (metricKey === "save") score = saveScore;
  const level = scoreToMeaningLevel(score);

  if (metricKey === "pref") {
    const tagsAddedPlan = Math.min(5, Math.max(1, 4 - interestCount));
    const projected = preferenceClarityScore(Math.min(interestCount + tagsAddedPlan + 1, 8));
    const delta = Math.max(0, projected - prefScore);
    const gainRoom = Math.min(22 * (8 - interestCount), 100 - prefScore);

    const summaryOneLiner =
      level === "low"
        ? `관심 태그가 적어요 · 지금 ${prefScore}점`
        : level === "mid"
          ? `조금만 더 채우면 좋아져요 · ${prefScore}점`
          : `취향 신호가 충분해요 · ${prefScore}점`;

    const causes: CoachCause[] =
      level === "low"
        ? [
            { lead: `관심 태그 ${interestCount}개`, detail: "태그가 적을수록 취향 신호가 약해져요." },
            { lead: "태그 1개당 약 +22점", detail: "최대 100점까지 반영돼요." },
            interestCount === 0
              ? { lead: "태그 없음", detail: "추천·피드 매칭에서 우선순위가 낮아질 수 있어요." }
              : {
                  lead: `현재 ${prefScore}점`,
                  detail: `'보통' 구간까지 약 ${Math.max(0, 38 - prefScore)}점 필요해 보여요.`,
                },
          ]
        : level === "mid"
          ? [
              { lead: `태그 ${interestCount}개 · ${prefScore}점`, detail: "한 단계만 더 채우면 체감이 좋아져요." },
              { lead: "태그 추가 여지", detail: `최대 약 ${gainRoom}점까지` },
            ]
          : [
              { lead: `태그 ${interestCount}개 · ${prefScore}점`, detail: "관심 정보가 충분히 쌓였어요." },
              { lead: "가끔 관심사 업데이트", detail: "최신 트렌드 반영 폭이 넓어져요." },
            ];

    const improvements: CoachImprovement[] =
      level === "high"
        ? [{ title: "유지 · 고도화", bullets: ["분기마다 관심사 한 번 점검", "월령에 맞는 추천 유지에 도움"] }]
        : [
            {
              title: `관심 태그 ${tagsAddedPlan}개 이상`,
              bullets: [`목표 달성 시 예상 약 ${projected}점`, `+${delta}점 가늠`],
            },
            { title: "중복 태그 정리", bullets: ["비슷한 태그는 하나로", "가중치가 또렷해져요"] },
          ];

    const steps: CoachStep[] =
      level === "high"
        ? [
            { step: 1, title: "진단", bullets: [`${interestCount}개 태그`, "취향 신호 충분"] },
            { step: 2, title: "유지", bullets: ["월령·관심 변화 시 태그만 업데이트"] },
            { step: 3, title: "기대", bullets: ["맞춤 피드·추천이 함께 좋아지는 경우가 많아요"] },
          ]
        : [
            {
              step: 1,
              title: "진단",
              bullets: [`태그 ${interestCount}개`, `취향 파악도 ${prefScore}점`, "'보통' 이상은 보통 2~3개 태그"],
            },
            { step: 2, title: "행동", bullets: ["마이페이지에서", `관심 영역 ${tagsAddedPlan}개 이상 추가`] },
            { step: 3, title: "예상", bullets: [`약 ${projected}점(+${delta})`, "종합 지수에도 반영"] },
          ];

    return {
      metricKey,
      level,
      currentScore: prefScore,
      projectedScore: projected,
      headline: "취향 파악 코치",
      summaryOneLiner,
      causes,
      improvements,
      steps,
      ctas: [
        {
          label: "마이페이지에서 관심사 설정",
          primary: true,
          onActivate: () => {
            requestMainTab("mypage");
            onClose();
          },
        },
        {
          label: "맞춤 피드 확인하기",
          onActivate: () => {
            scrollToElement("interest-personalized-title");
            onClose();
          },
        },
      ],
    };
  }

  if (metricKey === "rec") {
    const projected = recommendationFitScore(Math.min(interestCount + 2, 12), Math.max(feedCount, 6));
    const delta = Math.max(0, projected - recScore);

    const summaryOneLiner =
      level === "low"
        ? `추천 반영 여지 있음 · ${recScore}점`
        : level === "mid"
          ? `관심·피드 보강하면 더 좋아요 · ${recScore}점`
          : `추천이 잘 맞물려 있어요 · ${recScore}점`;

    const causes: CoachCause[] =
      level === "low"
        ? [
            {
              lead: `맞춤 피드 후보 약 ${feedCount}건`,
              detail: `태그 ${interestCount}개와 교차가 적으면 반영도가 낮아져요.`,
            },
            { lead: "점수 구성", detail: "관심 가중(+20)·피드 분량(+52)·기본값" },
            { lead: `추천 반영도 ${recScore}점`, detail: "관심·피드를 함께 늘리면 효율이 좋아요." },
          ]
        : level === "mid"
          ? [
              { lead: `피드 ${feedCount}건 · 태그 ${interestCount}개`, detail: `${recScore}점` },
              { lead: "태그 1~2개만 더해도", detail: "가중치가 눈에 띄게 붙는 구간이에요." },
            ]
          : [
              { lead: `추천 반영도 ${recScore}점`, detail: "관심과 피드가 균형 있게 맞물려 있어요." },
            ];

    const improvements: CoachImprovement[] =
      level === "high"
        ? [{ title: "유지", bullets: ["관심 변경 시 피드 상단만 훑어보기", "최신 매칭 확인"] }]
        : [
            {
              title: "관심 +2 · 피드 주 3회",
              bullets: [`예상 약 ${projected}점(+${delta})`, "피드 후보 6건 이상이면 가산 커져요"],
            },
            { title: "플레이그라운드", bullets: ["투표·후기가 추천 품질에 도움"] },
          ];

    const steps: CoachStep[] = [
      { step: 1, title: "진단", bullets: [`피드 ${feedCount}건`, `태그 ${interestCount}개`, `${recScore}점`] },
      { step: 2, title: "행동", bullets: ["관심 보강 후 맞춤 피드·플레이그라운드 이용"] },
      { step: 3, title: "예상", bullets: [`약 ${projected}점(+${delta})`] },
    ];

    return {
      metricKey,
      level,
      currentScore: recScore,
      projectedScore: projected,
      headline: "추천 정확 코치",
      summaryOneLiner,
      causes,
      improvements,
      steps,
      ctas: [
        {
          label: "맞춤 피드로 이동",
          primary: true,
          onActivate: () => {
            scrollToElement("interest-personalized-title");
            onClose();
          },
        },
        {
          label: "플레이그라운드 보기",
          onActivate: () => {
            scrollToElement("playground-section");
            onClose();
          },
        },
      ],
    };
  }

  /* save */
  const scrapsToAdd = level === "low" ? 5 : level === "mid" ? 3 : 2;
  const projectedSave = saveSignalScore(scrapCount + scrapsToAdd);
  const deltaSave = Math.max(0, projectedSave - saveSignalScore(scrapCount));
  const savePts = saveSignalScore(scrapCount);

  const summaryOneLiner =
    level === "low"
      ? `저장 신호 약함 · ${savePts}점`
      : level === "mid"
        ? `저장 조금 더하면 개선 · ${savePts}점`
        : `저장 패턴 분명 · ${savePts}점`;

  const causes: CoachCause[] =
    level === "low"
      ? [
          { lead: `스크랩 ${scrapCount}건`, detail: "개인화 학습 신호가 약해요." },
          { lead: "저장 1건당 약 +17점", detail: "최대 100점" },
          scrapCount === 0
            ? { lead: "저장 이력 없음", detail: "선호 패턴을 잡기 어려워요." }
            : { lead: "패턴이 쌓일수록", detail: "유사 상품 추천이 좋아져요." },
        ]
      : level === "mid"
        ? [
            { lead: `저장 ${scrapCount}건 · ${savePts}점`, detail: "주간 기준 소량만 추가해도 체감이 달라져요." },
          ]
        : [
            { lead: `저장 ${scrapCount}건 · ${savePts}점`, detail: "활동이 활발해요." },
            { lead: "패턴이 분명할수록", detail: "장바구니·추천 연계가 좋아져요." },
          ];

  const improvements: CoachImprovement[] =
    level === "high"
      ? [{ title: "패턴 유지", bullets: ["월 1회만이라도 마음에 드는 상품 저장", "추천 신선도 유지"] }]
      : [
          {
            title: `이번 주 스크랩 ${scrapsToAdd}건`,
            bullets: [
              `예상 약 ${projectedSave}점(+${deltaSave})`,
              `하루 1건이면 약 ${Math.ceil(scrapsToAdd / 7)}주 내 달성 가능`,
            ],
          },
          { title: "카테고리 분산", bullets: ["기저귀·완구 등 여러 카테고리 섞어 저장", "신호 다양성 ↑"] },
        ];

  const steps: CoachStep[] = [
    { step: 1, title: "진단", bullets: [`스크랩 ${scrapCount}건`, `저장 활용도 ${savePts}점`] },
    { step: 2, title: "행동", bullets: ["육아용품 탭에서 ♡ 스크랩으로 남기기"] },
    { step: 3, title: "예상", bullets: [`약 ${projectedSave}점(+${deltaSave})`] },
  ];

  return {
    metricKey,
    level,
    currentScore: savePts,
    projectedScore: projectedSave,
    headline: "저장 활용 코치",
    summaryOneLiner,
    causes,
    improvements,
    steps,
    ctas: [
      {
        label: "육아용품에서 스크랩하기",
        primary: true,
        onActivate: () => {
          requestMainTab("gear");
          onClose();
        },
      },
      {
        label: "홈 맞춤 리포트로 돌아오기",
        onActivate: () => {
          scrollToElement("home-stats-heading");
          onClose();
        },
      },
    ],
  };
}

type Props = {
  metricKey: MetricCoachKey | null;
  onClose: () => void;
  ctx: CoachContext;
};

export default function MetricCoachModal({ metricKey, onClose, ctx }: Props) {
  if (!metricKey) return null;

  const plan = buildPlan(metricKey, ctx, onClose);
  const pct = (n: number) => `${Math.min(100, Math.max(0, n))}%`;
  const low = plan.level === "low";
  const projectedDisplay =
    plan.level === "high" ? plan.currentScore : Math.min(100, plan.projectedScore);
  const gainPts = Math.max(0, projectedDisplay - plan.currentScore);

  return (
    <div className="app-viewport-fixed z-[85] flex items-end justify-center bg-black/45 sm:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="닫기" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="metric-coach-title"
        className="relative z-[86] max-h-[88dvh] w-full max-w-app overflow-y-auto rounded-t-[1.75rem] bg-[#FAFBFC] shadow-2xl sm:max-h-[85dvh] sm:rounded-3xl sm:ring-1 sm:ring-slate-200/80"
      >
        <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-sm sm:rounded-t-3xl">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#F97316]">맞춤 리포트 코치</p>
            <h2 id="metric-coach-title" className="mt-0.5 text-lg font-bold text-slate-900">
              {plan.headline}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 px-5 pb-8 pt-4">
          <p className="rounded-2xl border border-orange-100/90 bg-gradient-to-br from-orange-50 to-white px-4 py-3 text-[15px] font-semibold leading-snug text-slate-900 shadow-sm">
            {plan.summaryOneLiner}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                low
                  ? "bg-amber-100 text-amber-900 ring-1 ring-amber-200"
                  : plan.level === "mid"
                    ? "bg-sky-100 text-sky-900 ring-1 ring-sky-200"
                    : "bg-sky-100 text-sky-950 ring-1 ring-sky-300"
              }`}
            >
              현재 {plan.level === "low" ? "낮음" : plan.level === "mid" ? "보통" : "높음"}
            </span>
            <span className="text-sm font-semibold tabular-nums text-slate-700">
              지표 <span className="text-[#F97316]">{plan.currentScore}</span> / 100
            </span>
          </div>

          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">진단 요약</h3>
            <ul className="mt-3 space-y-2.5">
              {plan.causes.map((c, i) => (
                <li
                  key={`cause-${i}`}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 leading-snug"
                >
                  <p className="text-[13px] font-semibold text-slate-900">{c.lead}</p>
                  {c.detail ? <p className="mt-1 text-[12px] leading-snug text-slate-500">{c.detail}</p> : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">다음 행동</h3>
            <ul className="mt-3 space-y-3">
              {plan.improvements.map((im) => (
                <li key={im.title} className="rounded-xl bg-slate-50/90 px-3 py-3 ring-1 ring-slate-100">
                  <p className="text-sm font-bold text-slate-900">{im.title}</p>
                  <ul className="mt-2 space-y-1.5">
                    {im.bullets.map((b, bi) => (
                      <li key={`${im.title}-${bi}`} className="flex gap-2 text-[13px] leading-snug text-slate-600">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#FB923C]" aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/80 to-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">점수 예상</h3>
            <p className="mt-1 text-xs text-slate-500">같은 산출식 기준 (참고)</p>
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>현재</span>
                  <span className="tabular-nums text-slate-800">{plan.currentScore}점</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-slate-300 to-slate-400 transition-all"
                    style={{ width: pct(plan.currentScore) }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>행동 후 예상</span>
                  <span className="tabular-nums font-bold text-[#EA580C]">
                    약 {projectedDisplay}점 (+{gainPts})
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-orange-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FB923C] to-[#F97316] transition-all"
                    style={{ width: pct(projectedDisplay) }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">3단계 요약</h3>
            <ol className="mt-4 space-y-0">
              {plan.steps.map((s, i) => (
                <li key={s.step} className="relative flex gap-3 pb-6 last:pb-0">
                  {i < plan.steps.length - 1 ? (
                    <span
                      className="absolute left-[15px] top-8 bottom-0 w-px bg-gradient-to-b from-orange-200 to-transparent"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-xs font-black text-white shadow-md shadow-orange-200/50">
                    {s.step}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-bold text-slate-900">{s.title}</p>
                    <ul className="mt-1.5 space-y-1">
                      {s.bullets.map((b, bi) => (
                        <li key={`${s.step}-${bi}`} className="flex gap-2 text-[13px] leading-snug text-slate-600">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-300" aria-hidden />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap">
            {plan.ctas.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={c.onActivate}
                className={`min-h-[48px] flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition active:scale-[0.99] ${
                  c.primary
                    ? "bg-[#F97316] text-white shadow-lg shadow-orange-200/50 hover:brightness-[1.03]"
                    : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
