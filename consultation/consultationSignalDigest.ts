import type { ChatSlots } from "./consultationChatAI";
import type { PainMomentId } from "./parentingConsultation";
import { Q1_OPTIONS, Q4_OPTIONS } from "./parentingConsultation";

type ChannelPack = {
  momcafe: string;
  coupang: string;
  instagram: string;
  momoa: string;
};

const BY_PAIN: Record<PainMomentId, ChannelPack> = {
  sleep: {
    momcafe:
      "수면·밤잠 게시에서 ‘루틴 고정·환경(소음·온도)’ 조언의 공감 수가 높았습니다.",
    coupang:
      "수면 보조·안전 카테고리에서 로켓 리뷰 평점 상위인 속싸개·백색소음기·모니터 언급이 많았습니다.",
    instagram:
      "육아 인플루언서 게시에서 ‘전조 신호 잡기·낮 활동량 조절’ 키워드 노출이 잦았습니다.",
    momoa:
      "같은 고민 태그 글에서 ‘기대치 조정 후 단계 시도’에 대한 공감 비율이 높았습니다.",
  },
  out: {
    momcafe:
      "외출·이동 글에서 ‘짐 줄이기·유모차 무게’ 관련 토론과 현장 노하우 공유가 많았습니다.",
    coupang:
      "아기띠·기저귀 파우치·휴대 소독 등 외출 세트류의 리뷰 수와 재구매 언급이 두드러졌습니다.",
    instagram:
      "야외·이동 릴에서 ‘날씨 대비·이동 시간 단축’ 팁이 반복적으로 소개되었습니다.",
    momoa:
      "단거리 외출 위주 부모 글에서 ‘최소 짐 구성’ 체크리스트 공유가 유용함으로 집계되었습니다.",
  },
  feed: {
    momcafe:
      "수유·이유식 게시에서 ‘세척·소독 루틴·손 부족’ 이야기와 시간 절약 꿀팁 공감이 많았습니다.",
    coupang:
      "젖병·소독기·이유식 용기류에서 로켓 배송 리뷰와 가격 대비 만족 비교 글이 많았습니다.",
    instagram:
      "식단·유축 관련 게시에서 ‘준비 시간 블록 잡기’ ‘소분 보관’이 자주 등장했습니다.",
    momoa:
      "혼합수유·이유 시작 글에서 ‘한 번에 하나만 바꾸기’ 실천 사례가 높은 반응을 받았습니다.",
  },
  play: {
    momcafe:
      "놀이·시간 글에서 ‘반복 놀이 지옥·정리 부담’ 공감과 짧게 끊는 방법 논의가 많았습니다.",
    coupang:
      "완구·보드북류에서 연령 표기와 안전 인증 확인 후기가 길게 남는 편이었습니다.",
    instagram:
      "홈 놀이 릴에서 ‘소재·안전·소음’을 함께 고려한 장면이 클립 수가 많았습니다.",
    momoa:
      "연령별 놀이 시간 글에서 ‘부모 에너지까지 고려한 일정’ 추천이 저장 수가 높았습니다.",
  },
  hygiene: {
    momcafe:
      "위생·빨래 글에서 ‘번들 돌리기·용품 한곳 모으기’ 노하우 공유가 반복 추천되었습니다.",
    coupang:
      "기저귀·물티슈·세제류에서 대용량·정기 배송 후기와 자극 적음 키워드가 많았습니다.",
    instagram:
      "주방·세탁 관련 숏폼에서 ‘동선 줄이는 수납’ 장면이 저장·공유 비율이 높았습니다.",
    momoa:
      "집안 위생 글에서 ‘아이 단계별로 필요한 빈도만 유지하기’ 공감 댓글이 많았습니다.",
  },
};

const GENERIC: ChannelPack = {
  momcafe: "최근 육아 게시 전반에서 ‘현실적인 루틴 조정’ 조언의 공감 수가 높았습니다.",
  coupang: "카테고리별 로켓 리뷰와 재구매 언급을 기준으로 만족도 신호를 모았습니다.",
  instagram: "육아 크리에이터 콘텐츠에서 ‘안전·소재·사용 빈도’가 함께 언급되는 비중이 컸습니다.",
  momoa: "모모아 커뮤니티에서 같은 월령·비슷한 고민 글의 해시태그와 저장 수를 반영했습니다.",
};

function guessPainFromText(text: string): PainMomentId | null {
  const t = text;
  if (/밤|잠|수면|낮잠|재우|새벽/.test(t)) return "sleep";
  if (/외출|이동|유모차|차\s|짐/.test(t)) return "out";
  if (/수유|분유|이유|젖|소독|젖병/.test(t)) return "feed";
  if (/놀이|장난감|심심|놀아/.test(t)) return "play";
  if (/빨래|기저귀|씻|위생|정리/.test(t)) return "hygiene";
  return null;
}

function labelForQ1(id: PainMomentId | undefined): string {
  if (!id) return "";
  return Q1_OPTIONS.find((o) => o.id === id)?.text ?? "";
}

/**
 * 데모용 채널 시그널 요약.
 * 실서비스에서는 맘카페·쇼핑·SNS·모모아를 API로 집계한 결과를 치환합니다.
 */
export function buildChannelSignalDigest(slots: ChatSlots, userText: string): string {
  const pain = slots.q1 ?? guessPainFromText(userText);
  const pack = pain ? BY_PAIN[pain] : GENERIC;
  const burdenLabel = slots.q4 ? Q4_OPTIONS.find((o) => o.id === slots.q4)?.text : null;
  const painLabel = labelForQ1(pain ?? slots.q1);

  const lines = [
    `• 맘카페: ${pack.momcafe}`,
    `• 쿠팡: ${pack.coupang}`,
    `• 인스타그램: ${pack.instagram}`,
    `• 모모아 커뮤니티: ${pack.momoa}`,
  ];

  const extra: string[] = [];
  if (painLabel) extra.push(`우선 고민 축: 「${painLabel}」`);
  if (burdenLabel) extra.push(`덜고 싶은 부담: 「${burdenLabel}」`);

  const header =
    "[채널 종합 시그널 · 데모 요약]\n" +
    "실제 서비스에서는 게시글·상품 리뷰·SNS 큐레이션·모모아 글을 실시간 집계합니다.\n";

  return (
    header +
    lines.join("\n") +
    (extra.length ? `\n• 정렬 기준 참고: ${extra.join(" · ")}` : "")
  );
}
