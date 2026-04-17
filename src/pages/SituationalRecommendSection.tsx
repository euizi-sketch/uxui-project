import React, { useState } from "react";
import { parseBirthDate } from "../components/home/homeHeroBandImage";
import { loadMyPageProfileFromStorage } from "../profile/momoProfileStorage";

export type AppMainTab = "home" | "gear" | "community" | "reviews" | "voucher" | "mypage";

type RecProduct = {
  id: string;
  name: string;
  imageUrl: string;
  reason: string;
  trustScore: number;
  reviewSummary: string;
};

type GuideBlock = {
  title: string;
  intro: string;
  checklist: string[];
  linkLabel: string;
};

type TrustBlock = {
  reviewCount: number;
  positiveRate: number;
  repurchaseRate: number;
  tags: { label: string; kind: "pro" | "con" }[];
  badges: string[];
};

type SituationResult = {
  headline: string;
  contextLine: string;
  products: RecProduct[];
  guide: GuideBlock;
  trust: TrustBlock;
  similarProductNames: string[];
};

const CONCERNS = [
  "수면",
  "수유",
  "이유식",
  "배변",
  "외출",
  "놀이",
  "위생",
  "피부",
  "안전",
] as const;

const BEHAVIORS = [
  "밤에 자주 깸",
  "낮잠을 짧게 잠",
  "분유를 잘 안 먹음",
  "이유식을 잘 안 먹음",
  "외출 시 많이 보챔",
  "기저귀 발진이 있음",
  "목욕을 싫어함",
  "이가 나서 잘 못 잠",
  "체온·감기 걱정",
] as const;

const MONTH_OPTIONS = Array.from({ length: 37 }, (_, i) => i);

function clampMonths(m: number): number {
  return Math.min(36, Math.max(0, Math.round(m)));
}

function ageInMonthsFromBirthDate(birth: Date): number {
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

/** 검색·입력 없이 보여 줄 기본 추천 조건 (프로필 생일 있으면 월령 반영) */
function getDefaultSituationInputs(): { months: number; concern: string; behavior: string; note: string } {
  const p = loadMyPageProfileFromStorage();
  const parsed = parseBirthDate(p.birthDate || "");
  let months = 6;
  if (parsed) {
    months = clampMonths(ageInMonthsFromBirthDate(parsed));
  }
  return {
    months,
    concern: "수면",
    behavior: "밤에 자주 깸",
    note: "",
  };
}

function sleepNightDemo(months: number, concern: string, behavior: string): boolean {
  return (
    months >= 4 &&
    months <= 9 &&
    concern === "수면" &&
    (behavior === "밤에 자주 깸" || behavior === "이가 나서 잘 못 잠")
  );
}

function buildResult(
  months: number,
  concern: string,
  behavior: string,
  note: string
): SituationResult {
  const useSleepDemo = sleepNightDemo(months, concern, behavior);
  const noteHint = note.includes("밤") || note.includes("잠");

  if (useSleepDemo || (concern === "수면" && noteHint)) {
    return {
      headline: "밤 수면 리듬이 아직 성숙하는 시기예요",
      contextLine: `지금은 ${months}개월 아이에게 흔히 나타나는 패턴이에요. MOMOA는 맘카페·쇼핑몰 리뷰를 모아, “왜 이 제품이 도움이 되는지”까지 함께 정리했어요.`,
      products: [
        {
          id: "p1",
          name: "수면 스와들 속싸개 L",
          imageUrl:
            "https://images.unsplash.com/photo-1544126592-807daa2b5d33?w=200&q=80",
          reason:
            "밤에 팔다리가 저절로 움직이며 깨는 경우가 많아요. 가벼운 압박감으로 몸의 긴장을 낮춰 주는 제품이 리뷰에서 재구매 언급이 많았어요.",
          trustScore: 94,
          reviewSummary:
            "“첫날부터 수면 시간이 늘었다”는 글이 많고, 사이즈 교환 후기도 상세해요.",
        },
        {
          id: "p2",
          name: "백색 소음기 (야간등)",
          imageUrl:
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&q=80",
          reason:
            "자궁 속 소리와 비슷한 백색 소음이 안정감을 준다는 부모 후기가 반복돼요. 타이머·음량 조절이 있는 모델이 신뢰 점수가 높았어요.",
          trustScore: 91,
          reviewSummary:
            "“너무 크지 않은 볼륨”이 장점으로 많이 적혀 있고, 야간 수유 후 다시 잠들기 좋다는 언급이 많아요.",
        },
        {
          id: "p3",
          name: "온습도·미세먼지 연동 공기청정",
          imageUrl:
            "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&q=80",
          reason:
            "방이 건조하면 코·목이 불편해 잠이 얕아질 수 있어요. 실내 습도를 일정하게 유지한 부모들의 ‘수면 환경’ 후기가 많았어요.",
          trustScore: 88,
          reviewSummary:
            "소음 수준이 낮은 모델이 긍정 비율이 높고, 필터 교체 비용에 대한 솔직한 단점 후기도 있어요.",
        },
      ],
      guide: {
        title: "함께 보면 좋은 수면 루틴",
        intro:
          "제품만으로 해결되지 않을 수 있어요. 아래 루틴을 병행하면 ‘왜 밤에 깨는지’를 줄이는 데 도움이 돼요.",
        checklist: [
          "잠들기 30분 전부터 조명·소리를 낮춰요 (흩어진 정보를 한 루틀로 모아요).",
          "낮 활동량을 조금 늘리고, 낮 마지막 낮잠 종료 시간을 고정해 보세요.",
          "밤 수유는 조용·짧게: ‘다시 잠들 신호’만 주고 바로 어둡게 해요.",
          "방 온도 20~22℃, 습도 50~60% 근처를 유지해 볼 수 있어요.",
        ],
        linkLabel: "수면 루틴 체크리스트 PDF (데모)",
      },
      trust: {
        reviewCount: 1842,
        positiveRate: 87,
        repurchaseRate: 34,
        tags: [
          { label: "첫날 효과 체감", kind: "pro" },
          { label: "사이즈 고민", kind: "con" },
          { label: "세탁 후에도 유지", kind: "pro" },
          { label: "소음 약간 있음", kind: "con" },
        ],
        badges: ["광고성 리뷰 비율 낮음", "재구매 언급 다수", "부정 리뷰도 구체적"],
      },
      similarProductNames: [
        "접이식 침대 가드",
        "암막 커튼 슬라이드형",
        "체온계 스마트 패치",
      ],
    };
  }

  return {
    headline: `${months}개월, ${concern} 고민을 중심으로 정리했어요`,
    contextLine:
      behavior && note
        ? `선택하신 “${behavior}”와 남겨주신 메모를 함께 읽었어요. MOMOA는 흩어진 후기를 모아 신뢰도 높은 선택을 돕는 플랫폼이에요.`
        : `선택하신 “${behavior}” 패턴을 바탕으로, 비슷한 부모들이 많이 찾은 흐름을 요약했어요.`,
    products: [
      {
        id: "g1",
        name: "저자극 올인원 보습 밤",
        imageUrl:
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&q=80",
        reason: `${concern} 상황에서 피부 장벽을 지키는 게 리뷰에서 반복 언급됐어요.`,
        trustScore: 89,
        reviewSummary: "“끈적임 적다”는 표현이 많고, 성분 사진을 올린 리뷰가 신뢰를 높여요.",
      },
      {
        id: "g2",
        name: "유아용 멸균 티슈",
        imageUrl:
          "https://images.unsplash.com/photo-1532210317175-013d482c7e91?w=200&q=80",
        reason: "위생·피부 관리를 동시에 챙기려는 부모 선택 비율이 높았어요.",
        trustScore: 86,
        reviewSummary: "쿠팡·맘카페 교차 언급이 많아 가격 대비 만족도 비교가 쉬워요.",
      },
      {
        id: "g3",
        name: "휴대용 젖병 세척팩",
        imageUrl:
          "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&q=80",
        reason: "외출·야간에 루틴이 흐트러질 때 ‘최소 준비’로 도움이 된다는 후기가 있어요.",
        trustScore: 84,
        reviewSummary: "단점으로 ‘물 사용량’ 언급이 있어 균형 잡힌 판단에 도움이 돼요.",
      },
    ],
    guide: {
      title: "지금 단계에서의 작은 루틴",
      intro:
        "한 번에 바꾸기 어려우면 3일 단위로만 적용해 보세요. 작은 성공이 쌓이면 아이도 부모도 안정감을 느껴요.",
      checklist: [
        "하루 중 고정된 ‘알림 시간’ 2개만 정해요 (예: 아침·저녁).",
        "아이 기분이 좋을 때 짧게 시도하고, 무리하지 않아요.",
        "배우자·돌봄이와 역할을 나눠 같은 말로 안내해요.",
        "변화는 메모로 남겨 다음 주 방문 진료·상담에 활용해요.",
      ],
      linkLabel: "관련 전문가 칼럼 보기 (데모)",
    },
    trust: {
      reviewCount: 920,
      positiveRate: 81,
      repurchaseRate: 22,
      tags: [
        { label: "가성비", kind: "pro" },
        { label: "향 강함", kind: "con" },
        { label: "배송 빠름", kind: "pro" },
      ],
      badges: ["리뷰 톤 일관성 높음", "사진 후기 비율 높음"],
    },
    similarProductNames: ["온도 조절 물티슈 워머", "휴대용 기저귀 매트", "아기 캐리어 경량형"],
  };
}

type FlowView = "landing" | "form" | "results";

export function SituationalRecommendSection() {
  const [view, setView] = useState<FlowView>("landing");
  const [fromInstantRecommend, setFromInstantRecommend] = useState(false);

  const [months, setMonths] = useState<number | null>(null);
  const [concern, setConcern] = useState<string>("");
  const [behavior, setBehavior] = useState<string>("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{
    months?: string;
    concern?: string;
    behavior?: string;
  }>({});
  const [result, setResult] = useState<SituationResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const goInstantRecommend = () => {
    const d = getDefaultSituationInputs();
    setMonths(d.months);
    setConcern(d.concern);
    setBehavior(d.behavior);
    setNote(d.note);
    setErrors({});
    const r = buildResult(d.months, d.concern, d.behavior, d.note);
    setResult(r);
    setFromInstantRecommend(true);
    setShowResult(false);
    requestAnimationFrame(() => {
      setShowResult(true);
      setView("results");
      window.setTimeout(() => {
        document.getElementById("momoa-situation-result")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    });
  };

  const validate = () => {
    const e: typeof errors = {};
    if (months === null) e.months = "개월수를 선택해 주세요.";
    if (!concern) e.concern = "고민 카테고리를 선택해 주세요.";
    if (!behavior) e.behavior = "행동 패턴을 선택해 주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const r = buildResult(months!, concern, behavior, note);
    setResult(r);
    setFromInstantRecommend(false);
    setShowResult(false);
    requestAnimationFrame(() => {
      setShowResult(true);
      setView("results");
      window.setTimeout(() => {
        document.getElementById("momoa-situation-result")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    });
  };

  const resetForm = () => {
    setResult(null);
    setShowResult(false);
    setNote("");
    setErrors({});
    setMonths(null);
    setConcern("");
    setBehavior("");
    setFromInstantRecommend(false);
    setView("form");
  };

  const backToLanding = () => {
    setView("landing");
  };

  const landingHero = (
    <section className="overflow-hidden rounded-3xl bg-[#FFF8F4] p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
      <p className="text-center text-[11px] font-extrabold uppercase tracking-wide text-[#FF853E]">
        지금 우리 아이에게 필요한 추천
      </p>
      <h2 className="mt-2 text-center text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl md:text-[26px]">
        무엇부터 챙길지 어렵다면,
        <br className="sm:hidden" /> 개월과 고민만으로 필요한 순서부터 알려 드려요.
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm font-semibold leading-relaxed text-slate-600">
        몇 개월인지, 요즘 무엇이 가장 부담인지만 선택해 주세요. 맘카페·쇼핑 후기 속 헷갈림을 줄이고{" "}
        <span className="font-extrabold text-slate-700">제품 · 한 줄 요약 · 후기 속 핵심</span>을 한 화면에 모았습니다.
        검색 시간은 줄이고 선택은 명확하게—<span className="font-extrabold text-[#FF853E]">MOMOA</span>에서 함께 확인해 보세요.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={goInstantRecommend}
          className="w-full max-w-sm rounded-2xl bg-[#FF853E] px-6 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#ff7a2a] active:scale-[0.99] sm:w-auto"
        >
          다음: 맞춤 육아템 추천 보기
        </button>
        <button
          type="button"
          onClick={() => setView("form")}
          className="text-[13px] font-semibold text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-[#FF853E]"
        >
          개월수·고민을 직접 입력할게요
        </button>
      </div>
    </section>
  );

  const situationFormSection = (
      <section
        id="momoa-situation-form"
        className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7"
      >
        <h3 className="text-lg font-extrabold text-slate-900">육아 상황을 알려주세요</h3>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          초보 부모도 부담 없이 — 개월수, 고민, 패턴만 골라도 분석을 시작할 수 있어요.
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <label className="text-sm font-extrabold text-slate-800" htmlFor="child-months">
              아이 개월수
            </label>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">0~36개월 중 선택</p>
            <select
              id="child-months"
              className={`mt-2 w-full rounded-2xl border bg-slate-50/80 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition focus:ring-2 focus:ring-[#FF853E] ${
                errors.months ? "border-red-300 ring-1 ring-red-200" : "border-slate-200"
              }`}
              value={months === null ? "" : String(months)}
              onChange={(e) => {
                const v = e.target.value;
                setMonths(v === "" ? null : Number(v));
                setErrors((x) => ({ ...x, months: undefined }));
              }}
            >
              <option value="">선택해 주세요</option>
              {MONTH_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}개월
                </option>
              ))}
            </select>
            {errors.months && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.months}</p>}
          </div>

          <div>
            <p className="text-sm font-extrabold text-slate-800">고민 카테고리</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">가장 가까운 것 하나를 골라주세요</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CONCERNS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setConcern(c);
                    setErrors((x) => ({ ...x, concern: undefined }));
                  }}
                  className={`rounded-2xl px-3 py-2 text-xs font-extrabold transition ring-1 ${
                    concern === c
                      ? "bg-[#FFF1EA] text-[#FF853E] ring-[#FFD2BF]"
                      : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {errors.concern && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.concern}</p>}
          </div>

          <div>
            <p className="text-sm font-extrabold text-slate-800">세부 증상 · 행동 패턴</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">요즘 가장 마음에 걸리는 하나를 선택해 주세요</p>
            <div className="mt-2 flex flex-col gap-2">
              {BEHAVIORS.map((b) => (
                <label
                  key={b}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                    behavior === b
                      ? "border-[#FFD2BF] bg-[#FFF8F4] ring-1 ring-[#FFD2BF]"
                      : "border-slate-100 bg-slate-50/60 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="behavior"
                    checked={behavior === b}
                    onChange={() => {
                      setBehavior(b);
                      setErrors((x) => ({ ...x, behavior: undefined }));
                    }}
                    className="h-4 w-4 accent-[#FF853E]"
                  />
                  <span className="text-sm font-semibold text-slate-800">{b}</span>
                </label>
              ))}
            </div>
            {errors.behavior && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.behavior}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-extrabold text-slate-800" htmlFor="free-note">
              조금 더 자세히 (선택)
            </label>
            <textarea
              id="free-note"
              rows={3}
              placeholder="예: 6개월 아기인데 밤에 2~3번씩 깨고 재우기가 힘들어요"
              className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:ring-2 focus:ring-[#FF853E]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <p className="mt-1 text-[11px] font-semibold text-slate-400">
              입력하신 내용은 이 기기에서만 데모로 처리돼요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-[#FF853E] py-4 text-base font-extrabold text-white shadow-md transition hover:bg-[#ff7a2a] active:scale-[0.99]"
          >
            분석하고 추천받기
          </button>
        </div>
      </section>
  );

  return (
    <div className="space-y-8">
      {view === "landing" && landingHero}

      {view === "form" && (
        <>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={backToLanding}
              className="inline-flex items-center gap-1 rounded-2xl px-3 py-2 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              ← 안내로
            </button>
          </div>
          {situationFormSection}
        </>
      )}

      {view === "results" && result && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={backToLanding}
              className="inline-flex w-fit items-center gap-1 rounded-2xl px-3 py-2 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              ← 안내로
            </button>
            <div className="flex flex-wrap items-center gap-2">
              {fromInstantRecommend ? (
                <span className="inline-flex items-center rounded-full bg-[#FFF1EA] px-3 py-1.5 text-[11px] font-extrabold text-[#FF853E] ring-1 ring-[#FFD2BF]">
                  검색 없이 · {months}개월
                  {parseBirthDate(loadMyPageProfileFromStorage().birthDate || "") ? "(프로필 생일)" : "(대표 패턴)"} ·{" "}
                  {concern} · {behavior}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-extrabold text-slate-700 ring-1 ring-slate-200">
                  입력하신 조건 반영 · {months}개월 · {concern} · {behavior}
                </span>
              )}
            </div>
          </div>

          {/* 4. 결과 */}
        <div
          id="momoa-situation-result"
          className={`space-y-5 transition-all duration-500 ease-out ${
            showResult ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <div className="rounded-3xl border border-[#FFD2BF] bg-[#FFF8F4] p-5 ring-1 ring-[#FFD2BF]/60 sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#FF853E]">분석 요약</p>
            <h3 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">{result.headline}</h3>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{result.contextLine}</p>
          </div>

          {/* A. 제품 */}
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <h4 className="text-base font-extrabold text-slate-900">지금 필요한 추천 제품</h4>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              왜 이 추천이 나왔는지 — 리뷰 속에서 자주 등장한 이유를 한 줄로 묶었어요.
            </p>
            <ul className="mt-5 space-y-4">
              {result.products.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row"
                >
                  <div className="h-36 w-full shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100 sm:h-32 sm:w-32">
                    <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold leading-snug text-slate-900 line-clamp-3">{p.name}</p>
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600 line-clamp-4">{p.reason}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-[#FFF1EA] px-2.5 py-0.5 text-[10px] font-extrabold text-[#FF853E]">
                        신뢰 {p.trustScore}점
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] font-semibold text-slate-500">{p.reviewSummary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-xl bg-[#FF853E] px-3 py-2 text-xs font-extrabold text-white hover:bg-[#ff7a2a]"
                        onClick={() => window.alert(`${p.name} 상세(데모)`)}
                      >
                        자세히 보기
                      </button>
                      <button
                        type="button"
                        className="rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                        onClick={() => window.alert(`${p.name} 비교(데모)`)}
                      >
                        비교하기
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* B. 가이드 */}
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <h4 className="text-base font-extrabold text-slate-900">함께 보면 좋은 해결 방법</h4>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{result.guide.intro}</p>
            <p className="mt-3 text-sm font-extrabold text-slate-900">{result.guide.title}</p>
            <ul className="mt-3 space-y-2">
              {result.guide.checklist.map((line) => (
                <li key={line} className="flex gap-2 text-sm font-semibold text-slate-700">
                  <span className="mt-0.5 text-[#FF853E]" aria-hidden="true">
                    ✓
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-slate-900 py-3 text-sm font-extrabold text-white hover:bg-slate-800 sm:w-auto sm:px-6"
              onClick={() => window.alert(`${result.guide.linkLabel}`)}
            >
              {result.guide.linkLabel}
            </button>
          </section>

          {/* C. 신뢰 */}
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <h4 className="text-base font-extrabold text-slate-900">리뷰 기반 신뢰 포인트</h4>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              맘카페·쇼핑몰 등 흩어진 후기를 모아, 숫자와 태그로 요약했어요.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-100">
                <p className="text-2xl font-extrabold text-[#FF853E]">
                  {result.trust.reviewCount.toLocaleString()}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">분석된 리뷰 수</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-100">
                <p className="text-2xl font-extrabold text-[#FF853E]">{result.trust.positiveRate}%</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">긍정 리뷰 비율</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-100">
                <p className="text-2xl font-extrabold text-[#FF853E]">{result.trust.repurchaseRate}%</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">재구매 언급 비율</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {result.trust.tags.map((t) => (
                <span
                  key={t.label}
                  className={`rounded-full px-3 py-1 text-[11px] font-extrabold ring-1 ${
                    t.kind === "pro"
                      ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                      : "bg-amber-50 text-amber-900 ring-amber-100"
                  }`}
                >
                  {t.kind === "pro" ? "장점" : "단점"} · {t.label}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {result.trust.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-[#FFF1EA] px-3 py-1.5 text-[11px] font-extrabold text-[#FF853E] ring-1 ring-[#FFD2BF]"
                >
                  {b}
                </span>
              ))}
            </div>
          </section>

          {/* 5. 추가 UX */}
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <h4 className="text-base font-extrabold text-slate-900">비슷한 상황의 부모들이 많이 본 제품</h4>
            <ul className="mt-3 space-y-2">
              {result.similarProductNames.map((n) => (
                <li
                  key={n}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-100"
                >
                  <span>{n}</span>
                  <button
                    type="button"
                    className="text-xs font-extrabold text-[#FF853E]"
                    onClick={() => window.alert(`${n} 보기(데모)`)}
                  >
                    보기 ›
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                다른 고민으로 다시 추천받기
              </button>
              <button
                type="button"
                onClick={() => window.alert("추천 결과가 저장되었어요 (데모)")}
                className="rounded-2xl bg-[#FF853E] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#ff7a2a]"
              >
                추천 결과 저장
              </button>
              <button
                type="button"
                onClick={() => window.alert("공유하기(데모)")}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
              >
                공유하기
              </button>
            </div>
          </section>
        </div>

          <button
            type="button"
            onClick={() => setView("form")}
            className="w-full rounded-2xl border border-[#FFD2BF] bg-white py-3 text-sm font-extrabold text-[#E85A20] shadow-sm transition hover:bg-[#FFFCF9] sm:w-auto sm:px-5"
          >
            조건 바꿔 다시 받기
          </button>
        </>
      )}
    </div>
  );
}
