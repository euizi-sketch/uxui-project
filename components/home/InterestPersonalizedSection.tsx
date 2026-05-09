import React, { useMemo } from "react";
import { buildPersonalizedHomeFeed } from "../../home/personalizedHomeFeed";
import { isInterestCategory, type InterestCategory } from "../../onboarding/interestCategories";

type Props = {
  interests: string[];
  /** 관심사 칩·추천 카드 클릭 시 육아용품 검색으로 이동 */
  onNavigateGear?: (keyword: string) => void;
};

const kindLabel: Record<string, string> = {
  tip: "팁",
  article: "읽을거리",
  checklist: "체크리스트",
};

function keywordForFeedItem(item: {
  matchedLabels: InterestCategory[];
  categories: InterestCategory[];
}, interestsKnown: InterestCategory[]): string | null {
  if (item.matchedLabels.length > 0) return item.matchedLabels[0];
  if (item.categories.length > 0) return item.categories[0];
  if (interestsKnown.length > 0) return interestsKnown[0];
  return null;
}

export function InterestPersonalizedSection({ interests, onNavigateGear }: Props) {
  const feed = useMemo(() => buildPersonalizedHomeFeed(interests, 8), [interests]);
  const known = interests.filter(isInterestCategory);

  return (
    <section
      className="mb-6 rounded-[28px] bg-transparent p-0 pt-1"
      aria-labelledby="interest-personalized-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[#F97316]">
            맞춤 피드
          </p>
          <h2
            id="interest-personalized-title"
            className="mt-1 text-xl font-bold leading-snug tracking-tight text-slate-900"
          >
            선택한 관심사 위주로 모았어요
          </h2>
          <p className="mt-1 text-xs font-normal leading-relaxed text-slate-500">
            각 카드의 주제 태그와 내 관심사가 겹칠수록 위로 올라오도록 점수를 매겼어요. 가장 먼저 고른
            관심사에 맞는 글에는 살짝 더 가중치를 줬어요.
          </p>
        </div>
      </div>

      {known.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="내 관심 영역">
          {known.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onNavigateGear?.(tag)}
              title="육아용품 탭에서 이 관심사로 검색"
              className="rounded-full bg-[#FFF7ED] px-2.5 py-1 text-[10px] font-bold text-[#F97316] transition hover:bg-[#FFEDD5] hover:ring-1 hover:ring-[#FDBA74] active:scale-[0.98]"
            >
              {tag}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-2xl bg-slate-50/90 px-3 py-2 text-xs font-normal text-slate-600">
          아직 저장된 관심 영역이 없어요. 마이페이지에서 관심사를 고르면 이 목록이 더 정확해져요.
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {feed.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => {
                const kw = keywordForFeedItem(item, known);
                if (kw && onNavigateGear) {
                  onNavigateGear(kw);
                  return;
                }
                window.alert(
                  `[데모] ${item.title}\n\n관심 매칭: ${
                    item.matchedLabels.length > 0 ? item.matchedLabels.join(", ") : "전체 추천"
                  }\n순위 점수: ${item.score} (표시 ${index + 1}번째)`
                );
              }}
              className="flex w-full gap-3 rounded-2xl border border-slate-100 bg-white/90 p-3 text-left transition hover:bg-[#FFF7ED]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F97316]/12 text-sm font-bold text-[#F97316]">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                    {kindLabel[item.kind] ?? item.kind}
                  </span>
                  {item.categories.map((c) => (
                    <span
                      key={c}
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        known.includes(c)
                          ? "bg-[#F97316] text-white"
                          : "bg-slate-100/90 text-slate-500"
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-sm font-bold leading-snug text-slate-900 line-clamp-2">{item.title}</p>
                <p className="mt-0.5 text-xs font-normal leading-relaxed text-slate-500 line-clamp-3">
                  {item.description}
                </p>
                <p className="mt-1 text-[10px] font-bold text-slate-400">
                  {item.matchedLabels.length > 0
                    ? `관심사와 ${item.matchedLabels.length}개 태그가 맞아요 · 탭하면 관련 템 검색`
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
