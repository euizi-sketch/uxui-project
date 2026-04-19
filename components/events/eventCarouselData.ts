export type EventVariant = "poll" | "challenge" | "compare" | "parents" | "test" | "regret";

export type EventItem = {
  id: string;
  variant: EventVariant;
  title: string;
  description: string;
  participants: number;
  ctaLabel: string;
  /** 인기 이벤트 HOT */
  hot?: boolean;
  /** 참여 수 강조 스타일 */
  popular?: boolean;
  /** 카드 상단 일러스트/이모지 */
  accent: string;
  pollOptions?: string[];
  compareRegretPct?: number;
  compareHappyPct?: number;
  topBadge?: string;
};

export const EVENT_CAROUSEL_ITEMS: EventItem[] = [
  {
    id: "poll-sleep",
    variant: "poll",
    title: "우리 아기, 이럴 때 어떻게 했어요?",
    description: "비슷한 부모들의 선택을 확인해보세요",
    participants: 312,
    ctaLabel: "투표 참여하기",
    hot: true,
    popular: true,
    accent: "🗳️",
    pollOptions: ["수면 교육", "수면템", "버팀", "기타"],
  },
  {
    id: "real-review",
    variant: "challenge",
    title: "광고 없는 진짜 후기 모으기",
    description: "사진과 함께 리얼 후기를 남기면 포인트 지급",
    participants: 528,
    ctaLabel: "후기 남기기",
    hot: true,
    popular: true,
    accent: "📷",
    topBadge: "이번 주 리얼 후기 TOP",
  },
  {
    id: "fail-success",
    variant: "compare",
    title: "이 제품, 사도 될까?",
    description: "후회 vs 만족 데이터를 비교해보세요",
    participants: 1042,
    ctaLabel: "결과 보기",
    popular: true,
    accent: "⚖️",
    compareRegretPct: 32,
    compareHappyPct: 90,
  },
  {
    id: "similar-parents",
    variant: "parents",
    title: "나랑 비슷한 부모는 몇 명?",
    description: "같은 상황의 부모 데이터를 확인해보세요",
    participants: 891,
    ctaLabel: "내 상황 입력하기",
    accent: "👨‍👩‍👧",
  },
  {
    id: "type-test",
    variant: "test",
    title: "우리 아기 유형 테스트",
    description: "예민형? 안정형? 맞춤 육아템 추천",
    participants: 674,
    ctaLabel: "테스트 시작하기",
    accent: "🧩",
  },
  {
    id: "regret-top",
    variant: "regret",
    title: "이번 주 가장 많이 후회한 제품",
    description: "구매 전에 꼭 확인하세요",
    participants: 1205,
    ctaLabel: "확인하기",
    hot: true,
    popular: true,
    accent: "📉",
    topBadge: "TOP 5",
  },
];
