import {
  INTEREST_CATEGORY_OPTIONS,
  type InterestCategory,
} from "../onboarding/interestCategories";

export type PersonalFeedItem = {
  id: string;
  categories: InterestCategory[];
  title: string;
  description: string;
  kind: "tip" | "article" | "checklist";
};

export type ScoredPersonalFeedItem = PersonalFeedItem & {
  /** 사용자 관심사와 겹치는 태그 수 */
  matchCount: number;
  matchedLabels: InterestCategory[];
  /** 정렬용: matchCount 가중 + 첫 번째로 고른 관심사 보너스 + 안정적 타이브레이커 */
  score: number;
};

const CATALOG: PersonalFeedItem[] = [
  {
    id: "sleep-1",
    categories: ["수면"],
    title: "밤 깸 줄이는 방 온도·습도 가이드",
    description: "맘카페·후기에서 자주 언급된 수면 환경 체크리스트예요.",
    kind: "checklist",
  },
  {
    id: "sleep-2",
    categories: ["수면"],
    title: "낮잠 패턴 조정, 이런 순서로 시도해 보세요",
    description: "같은 월령대 부모들이 시도 순서로 남긴 경험을 요약했어요.",
    kind: "tip",
  },
  {
    id: "lang-1",
    categories: ["언어"],
    title: "말이 늘 때 도움이 된 그림책 대화 루틴",
    description: "짧은 질문·기다리기·확장하기 3단계로 정리했어요.",
    kind: "article",
  },
  {
    id: "lang-2",
    categories: ["언어"],
    title: "이 나이대에 자주 나오는 표현만 골라보기",
    description: "발달 단계별로 커뮤니티에 많이 올라온 표현 목록이에요.",
    kind: "tip",
  },
  {
    id: "play-1",
    categories: ["놀이"],
    title: "실내 감각 놀이 세트, 후기만 모아 비교",
    description: "쿠팡·SNS 후기에서 소음·정리 편의 키워드를 뽑았어요.",
    kind: "article",
  },
  {
    id: "play-2",
    categories: ["놀이"],
    title: "스크린 없이 15분 채우기 아이디어",
    description: "집에 있는 물건 위주로 정리한 짧은 놀이 모음이에요.",
    kind: "tip",
  },
  {
    id: "move-1",
    categories: ["운동"],
    title: "뒤집기·기어가기 구간 안전 체크",
    description: "거실 모서리·콘센트 등 사고 후기가 많이 겹친 항목이에요.",
    kind: "checklist",
  },
  {
    id: "move-2",
    categories: ["운동"],
    title: "대근육에 좋은 공원 놀이기구 고르는 법",
    description: "월령별로 부모들이 추천한 순서대로 정리했어요.",
    kind: "article",
  },
  {
    id: "food-1",
    categories: ["식습관"],
    title: "이유식 시작 주간 식재료 플래너",
    description: "알레르기 체크와 함께 자주 묻는 조합을 한 장으로 모았어요.",
    kind: "checklist",
  },
  {
    id: "food-2",
    categories: ["식습관"],
    title: "편식 구간별로 써 본 대응 멘트 모음",
    description: "맘카페 댓글에서 반복된 표현을 부드럽게 다듬었어요.",
    kind: "tip",
  },
  {
    id: "emo-1",
    categories: ["정서"],
    title: "분리불안 줄이는 작별 인사 루틴",
    description: "짧게 약속하고 돌아와서 지키는 패턴 위주로 정리했어요.",
    kind: "article",
  },
  {
    id: "emo-2",
    categories: ["정서"],
    title: "기분 단어 카드, 집에서 만드는 법",
    description: "그림·사진 붙이기만으로도 충분해요.",
    kind: "tip",
  },
  {
    id: "mix-1",
    categories: ["수면", "정서"],
    title: "밤에 자주 깨는 날, 정서·수면을 같이 보는 체크",
    description: "두 영역 후기에서 겹쳐 나온 원인 후보를 묶었어요.",
    kind: "checklist",
  },
  {
    id: "mix-2",
    categories: ["놀이", "언어"],
    title: "역할 놀이로 말 늘리기 — 대본 없이 시작하기",
    description: "짧은 상황극으로 언어·놀이를 한 번에 잡는 방법이에요.",
    kind: "article",
  },
  {
    id: "mix-3",
    categories: ["식습관", "운동"],
    title: "식후 바로 뛰어노는 습관, 언제부터 조절할까",
    description: "운동량과 소화 언급이 같이 나온 글만 골라 요약했어요.",
    kind: "tip",
  },
  {
    id: "health-1",
    categories: ["건강"],
    title: "감기·열 날 집에서 바로 체크하는 신호등 표",
    description: "응급 vs 내원 기준이 후기에서 자주 겹친 경우만 묶었어요.",
    kind: "checklist",
  },
  {
    id: "health-2",
    categories: ["건강"],
    title: "월령별 영양 드실 때 부모들이 챙긴 비타민·유산균 노트",
    description: "의학적 조언은 전문가에게 맡기고, 커뮤니티 경험만 정리했어요.",
    kind: "article",
  },
  {
    id: "safe-1",
    categories: ["안전"],
    title: "거실·주방 모서리·문 손낌 방지 설치 순서 추천",
    description: "사고 후기에서 빈도 높은 순으로 정렬했어요.",
    kind: "checklist",
  },
  {
    id: "safe-2",
    categories: ["안전"],
    title: "카시트·유모차 안전 클립 체크 포인트만 모음",
    description: "후기 속 ‘이거 놓쳤다’가 많은 항목 위주예요.",
    kind: "tip",
  },
  {
    id: "dev-1",
    categories: ["발달"],
    title: "정기 검진 전에 적어 두면 좋은 관찰 메모 양식",
    description: "소아과·발달센터 방문 후기에서 공통으로 꼽은 질문이에요.",
    kind: "checklist",
  },
  {
    id: "dev-2",
    categories: ["발달"],
    title: "월령별 ‘지금 보통인가?’ 자주 묻는 행동 리스트",
    description: "커뮤니티 질문 빈도를 기준으로 묶었어요.",
    kind: "article",
  },
  {
    id: "soc-1",
    categories: ["사회성"],
    title: "첫 놀이모임·학교 앞 인사 연습 시나리오",
    description: "또래 부모들이 미리 연습했다고 한 표현만 추렸어요.",
    kind: "tip",
  },
  {
    id: "soc-2",
    categories: ["사회성"],
    title: "싸움 났을 때 개입 타이밍 — 선생님·맘카페 공통 멘트",
    description: "즉시 개입 vs 기다리기 경험을 균형 있게 요약했어요.",
    kind: "article",
  },
  {
    id: "study-1",
    categories: ["학습준비"],
    title: "미술·음악 체험 고를 때 학부모 후기에서 나온 질문 리스트",
    description: "비용·거리 외에 ‘아이 성향’ 질문이 많았어요.",
    kind: "checklist",
  },
  {
    id: "study-2",
    categories: ["학습준비"],
    title: "숫자·글자 전에 손가락 힘 기르기 소활동 모음",
    description: "집에서 재료 적게 쓰는 순서로 정리했어요.",
    kind: "tip",
  },
  {
    id: "gear-1",
    categories: ["육아템"],
    title: "대형 육아템 중고 거래 시 직거래 안전 체크리스트",
    description: "사기·하자 분쟁 후기에서 반복된 확인 항목이에요.",
    kind: "checklist",
  },
  {
    id: "gear-2",
    categories: ["육아템"],
    title: "월령 지난 카시트·유모차, 교체 타이밍 후기만 모음",
    description: "법률·안전 기준은 안내와 함께 확인해 주세요.",
    kind: "article",
  },
  {
    id: "fam-1",
    categories: ["부부·가족"],
    title: "야간 돌봄 분담 바꿀 때 부부 대화 예시 문장",
    description: "맘카페에서 효과 있었다고 한 표현 위주예요.",
    kind: "tip",
  },
  {
    id: "fam-2",
    categories: ["부부·가족"],
    title: "조부모 도움 받을 때 미리 맞추면 좋은 룰 샘플",
    description: "오해 줄이려고 적어 두는 항목들을 묶었어요.",
    kind: "article",
  },
  {
    id: "dad-1",
    categories: ["아빠육아"],
    title: "출퇴근 시간에 할 수 있는 짧은 육아 루틴 아이디어",
    description: "아빠 커뮤니티 후기에서 반복된 패턴이에요.",
    kind: "tip",
  },
  {
    id: "dad-2",
    categories: ["아빠육아"],
    title: "외출 준비·카시트 체크, 아빠가 맡기 쉬운 역할 분리표",
    description: "실제 분담 예시만 추렸어요.",
    kind: "checklist",
  },
  {
    id: "book-1",
    categories: ["독서"],
    title: "그림책 고를 때 도서관 사서 추천 질문 리스트",
    description: "연령·관심사 한 줄 질문만 모았어요.",
    kind: "tip",
  },
  {
    id: "book-2",
    categories: ["독서"],
    title: "낮잠 전 10분 책 읽기 루틴 후기 요약",
    description: "수면과 겹치는 후기만 따로 모았어요.",
    kind: "article",
  },
  {
    id: "art-1",
    categories: ["예술·음악"],
    title: "집에서 소음 적게 즐기는 리듬 놀이 재료 리스트",
    description: "아파트 후기에서 많이 나온 재료예요.",
    kind: "tip",
  },
  {
    id: "art-2",
    categories: ["예술·음악"],
    title: "미술 활동 후 정리 시간 줄이는 순서 팁",
    description: "준비·마무리 순서만 짧게 정리했어요.",
    kind: "checklist",
  },
  {
    id: "nature-1",
    categories: ["자연·야외"],
    title: "근처 숲·강변 산책 코스, 유모차 가능 후기만 골라보기",
    description: "계단·진입로 언급이 있는 글 위주예요.",
    kind: "article",
  },
  {
    id: "nature-2",
    categories: ["자연·야외"],
    title: "모기·자외선 대비 체크, 계절별 짐 리스트",
    description: "짧게 들고 나가도 되는 물건부터 적었어요.",
    kind: "checklist",
  },
  {
    id: "screen-1",
    categories: ["스크린·미디어"],
    title: "스크린 시간 줄일 때 부모들이 바꾼 ‘대체 활동’ 순위",
    description: "같은 월령대 후기에서 반복된 대안이에요.",
    kind: "article",
  },
  {
    id: "screen-2",
    categories: ["스크린·미디어"],
    title: "유튜브·키즈 앱 고를 때 확인한 설정 체크리스트",
    description: "후기 속 ‘켜두면 안심’ 설정만 모았어요.",
    kind: "checklist",
  },
  {
    id: "clinic-1",
    categories: ["예방·병원"],
    title: "예방접종 당일 준비물·간격 착각 많은 포인트",
    description: "커뮤니티 질문에서 많이 나온 오해 위주예요.",
    kind: "checklist",
  },
  {
    id: "clinic-2",
    categories: ["예방·병원"],
    title: "소아 응급 가기 전 전화할 때 적어 두면 좋은 정보",
    description: "실제 방문 후기에서 공통으로 적은 항목이에요.",
    kind: "tip",
  },
  {
    id: "skin-1",
    categories: ["피부·알레르기"],
    title: "이유식·새 제품 도입 시 알레르기 메모 양식",
    description: "병원 가져가기 좋게 한 장으로 정리했어요.",
    kind: "checklist",
  },
  {
    id: "skin-2",
    categories: ["피부·알레르기"],
    title: "기저귀·로션 바꿀 때 순서 줄이는 패치 테스트 팁",
    description: "트러블 후기에서 자주 언급된 순서예요.",
    kind: "article",
  },
  {
    id: "peer-1",
    categories: ["또래·친구"],
    title: "놀이 초대·생일 파티 준비할 때 부담 줄이는 선물 기준",
    description: "맘카페에서 반복된 ‘이 정도면 됐다’ 기준이에요.",
    kind: "tip",
  },
  {
    id: "peer-2",
    categories: ["또래·친구"],
    title: "친구와 다툴 때 부모가 자주 쓴 중재 멘트 모음",
    description: "짧고 또박또박 말하는 예문 위주예요.",
    kind: "article",
  },
  {
    id: "mix-4",
    categories: ["건강", "예방·병원"],
    title: "독감 시즌 전후로 집에서 챙기는 체온·수분 체크",
    description: "건강·병원 후기가 겹친 글만 요약했어요.",
    kind: "checklist",
  },
  {
    id: "mix-5",
    categories: ["자연·야외", "안전"],
    title: "야외 놀이터·물놀이 전 안전 습관 한 번에 보기",
    description: "현장 후기에서 함께 언급된 주의점이에요.",
    kind: "tip",
  },
];

function normalizeInterests(raw: string[]): InterestCategory[] {
  const out: InterestCategory[] = [];
  const set = new Set<string>();
  for (const x of raw) {
    if (INTEREST_CATEGORY_OPTIONS.includes(x as InterestCategory) && !set.has(x)) {
      set.add(x);
      out.push(x as InterestCategory);
    }
  }
  return out;
}

function tieBreakId(id: string): number {
  let s = 0;
  for (let i = 0; i < id.length; i++) s += id.charCodeAt(i);
  return s % 97;
}

/**
 * 관심사 기반 홈 피드 정렬
 * - 각 카드의 categories 와 사용자 관심의 교집합 크기(matchCount)를 주 신호로 사용
 * - 온보딩에서 먼저 고른 관심사(배열 앞쪽)에 맞는 카드에 소량 보너스
 * - 동점이면 tieBreakId로 안정 정렬
 */
export function buildPersonalizedHomeFeed(
  interests: string[],
  maxItems = 8
): ScoredPersonalFeedItem[] {
  const user = normalizeInterests(interests);
  const primary = user[0];

  const scored: ScoredPersonalFeedItem[] = CATALOG.map((item) => {
    const matchedLabels = item.categories.filter((c) => user.includes(c));
    const matchCount = matchedLabels.length;
    let score = matchCount * 100;
    if (primary && item.categories.includes(primary)) score += 15;
    score += tieBreakId(item.id);
    return {
      ...item,
      matchCount,
      matchedLabels,
      score,
    };
  });

  scored.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    if (b.score !== a.score) return b.score - a.score;
    return a.id.localeCompare(b.id);
  });

  const seen = new Set<string>();
  const out: ScoredPersonalFeedItem[] = [];
  for (const row of scored) {
    if (out.length >= maxItems) break;
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }

  return out;
}
