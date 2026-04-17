import React, { useMemo } from "react";
import { buildPersonalizedHomeFeed } from "../../home/personalizedHomeFeed";
import { isInterestCategory } from "../../onboarding/interestCategories";

type Props = {
  interests: string[];
};

const kindLabel: Record<string, string> = {
  tip: "팁",
  article: "읽을거리",
  checklist: "체크리스트",
};

export function InterestPersonalizedSection({ interests }: Props) {
  const feed = useMemo(() => buildPersonalizedHomeFeed(interests, 8), [interests]);
  const known = interests.filter(isInterestCategory);

  return (
    <section
      className="mb-6 rounded-[28px] border border-slate-200/90 bg-white p-5 shadow-[0_14px_44px_-12px_rgba(15,23,42,0.14)] ring-1 ring-slate-200/70"
      aria-labelledby="interest-personalized-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#FF853E]">
            맞춤 피드
          </p>
          <h2
            id="interest-personalized-title"
            className="mt-1 text-xl font-black leading-snug tracking-tight text-slate-900"
          >
            회원가입 때 고른 관심 영역 기준으로 골랐어요
          </h2>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
            각 카드의 주제 태그와 내 관심사가 겹칠수록 위로 올라오도록 점수를 매겼어요. 가장 먼저 고른
            관심사에 맞는 글에는 살짝 더 가중치를 줬어요.
          </p>
        </div>
      </div>

      {known.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="내 관심 영역">
          {known.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#FFF8F4] px-2.5 py-1 text-[10px] font-extrabold text-[#FF853E] ring-1 ring-[#FFD2BF]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
          아직 저장된 관심 영역이 없어요. 마이페이지에서 관심사를 고르면 이 목록이 더 정확해져요.
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {feed.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() =>
                window.alert(
                  `[데모] ${item.title}\n\n관심 매칭: ${
                    item.matchedLabels.length > 0 ? item.matchedLabels.join(", ") : "전체 추천"
                  }\n순위 점수: ${item.score} (표시 ${index + 1}번째)`
                )
              }
              className="flex w-full gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left ring-1 ring-slate-100/80 transition hover:border-[#FFD2BF] hover:bg-[#FFF8F4]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF853E]/10 text-sm font-extrabold text-[#FF853E]">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-600">
                    {kindLabel[item.kind] ?? item.kind}
                  </span>
                  {item.categories.map((c) => (
                    <span
                      key={c}
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ring-1 ${
                        known.includes(c)
                          ? "bg-[#FF853E] text-white ring-[#FF853E]"
                          : "bg-white text-slate-500 ring-slate-200"
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-sm font-extrabold leading-snug text-slate-900 line-clamp-2">{item.title}</p>
                <p className="mt-0.5 text-xs font-semibold leading-relaxed text-slate-500 line-clamp-3">
                  {item.description}
                </p>
                <p className="mt-1 text-[10px] font-bold text-slate-400">
                  {item.matchedLabels.length > 0
                    ? `관심사와 ${item.matchedLabels.length}개 태그가 맞아요`
                    : "관심사 미설정 시 인기 순으로 보여드려요"}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
