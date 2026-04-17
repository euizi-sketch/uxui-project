/** 후기 통합 허브 — 데모용 다채널 후기 집계 (실서비스에서는 API·크롤링 대체) */

export type ReviewChannelId = "momcafe" | "instagram" | "coupang" | "naver";

export type ChannelReview = {
  quote: string;
  meta?: string;
};

export type ChannelReviewGroup = {
  id: ReviewChannelId;
  label: string;
  sub: string;
  chipClass: string;
  panelClass: string;
  reviews: ChannelReview[];
};

export type IntegratedReviewPayload = {
  productId: number;
  headline: string;
  summaryBullets: string[];
  channelNote?: string;
  channels: ChannelReviewGroup[];
};

/** 물품 선택 목록 — 육아용품 탭 TOP10 풀과 동기 (데모) */
export const REVIEW_HUB_PRODUCT_PICKER: {
  id: number;
  name: string;
  imageUrl: string;
  tag: string;
}[] = [
  {
    id: 501,
    name: "아이보들 샴푸, 300ml, 1개",
    imageUrl: "/products/ibodle-shampoo.png",
    tag: "맞춤 인기 1위",
  },
  {
    id: 502,
    name: "아가드 분리형 유아변기",
    imageUrl: "/products/aguard-potty-rank2.png",
    tag: "맞춤 인기 2위",
  },
  {
    id: 503,
    name: "무독성 실리콘 치발기",
    imageUrl: "https://images.unsplash.com/photo-1532210317175-013d482c7e91?w=200&q=80",
    tag: "안전 인증",
  },
  {
    id: 504,
    name: "휴대용 젖병 소독기",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&q=80",
    tag: "출산 준비템",
  },
  {
    id: 505,
    name: "아기띠 올인원 캐리어",
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200&q=80",
    tag: "허리 부담↓",
  },
  {
    id: 506,
    name: "온습도계·공기청정 연동",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&q=80",
    tag: "수면 환경",
  },
  {
    id: 507,
    name: "저자극 아기 바스",
    imageUrl: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=200&q=80",
    tag: "신생아 필수",
  },
  {
    id: 508,
    name: "유아용 칫솔 세트",
    imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=200&q=80",
    tag: "구강 케어",
  },
  {
    id: 509,
    name: "블록 장난감 100p",
    imageUrl: "https://images.unsplash.com/photo-1558060379-71230465e879?w=200&q=80",
    tag: "발달 놀이",
  },
  {
    id: 510,
    name: "아기 모기 기피 패치",
    imageUrl: "/products/baby-mosquito-patch-rank10.png",
    tag: "야외 필수",
  },
];

const PRESET: Partial<Record<number, IntegratedReviewPayload>> = {
  501: {
    productId: 501,
    headline:
      "거품이 부드럽고 향이 부담 없다는 의견이 많았어요. 다만 피부 타입에 따라 건조함을 느낀 후기도 일부 있었어요.",
    summaryBullets: [
      "쿠팡·오픈마켓 후기: ‘민감 두피에도 순함’, ‘재구매’ 언급 비중 높음",
      "맘카페: 세정력 vs 보습 중 어디에 두느냐로 의견이 갈림",
      "SNS·짧은 후기: 향·거품 질감 언급이 가장 많음",
    ],
    channelNote: "데모 데이터예요. 실제 통합 시에는 최근성·신뢰도 가중치가 반영됩니다.",
    channels: [
      {
        id: "momcafe",
        label: "맘카페·커뮤니티",
        sub: "게시판·댓글 발췌",
        chipClass: "bg-rose-500 text-white ring-2 ring-white shadow-sm",
        panelClass: "border-rose-100 bg-rose-50",
        reviews: [
          {
            quote:
              "저자극 찾다가 정착했어요. 유아 샴푸 중에서는 거품이 오래 가는 편이라 아이가 목까지 금방 헹구게 돼요.",
            meta: "○○맘카페 · 댓글 24 · 답글 반응 좋음",
          },
          {
            quote: "향이 거의 안 나서 좋다 vs 향이 없어서 아쉽다 의견이 반반. 우리 집은 전자예요.",
            meta: "지역 육아 카페 · 게시글 요약",
          },
        ],
      },
      {
        id: "instagram",
        label: "인스타그램",
        sub: "릴스·저장 많은 글",
        chipClass: "bg-fuchsia-600 text-white ring-2 ring-white shadow-sm",
        panelClass: "border-fuchsia-100 bg-fuchsia-50",
        reviews: [
          {
            quote: "용량 대비 거품 잘 나와서 소량만 써도 됨. 욕실 바닥 미끄러짐 주의 글 많음 😅",
            meta: "릴스 댓글 요약 · 저장 1.2k",
          },
          {
            quote: "민감 피부 아기 사진 비포·애프터 올린 계정 보면 트러블 줄었다는 후기 몇 건.",
            meta: "해시태그 후기 스레드",
          },
        ],
      },
      {
        id: "coupang",
        label: "쿠팡",
        sub: "구매 리뷰·별점 코멘트",
        chipClass: "bg-[#FA622F] text-white ring-2 ring-white shadow-sm",
        panelClass: "border-orange-100 bg-orange-50",
        reviews: [
          {
            quote: "로켓으로 빨리 와서 좋음. 유통기한 넉넉히 온 편. 와우 할인 때 쟁여둠.",
            meta: "★★★★☆ 비율 높음 · 배송·가격 언급 다수",
          },
          {
            quote: "겨울에 두피 건조해졌다는 글도 있음. 아이마다 차이 있는 듯.",
            meta: "필터: 최신순 상위 키워드",
          },
        ],
      },
      {
        id: "naver",
        label: "네이버·블로그",
        sub: "검색·장문 리뷰",
        chipClass: "bg-[#03C75A] text-white ring-2 ring-white shadow-sm",
        panelClass: "border-emerald-100 bg-emerald-50",
        reviews: [
          {
            quote: "성분표랑 용량 비교해서 샀어요. 브랜드 신뢰보다는 ‘순해서 계속 씀’ 결론인 글이 많았어요.",
            meta: "블로그 장문 후기 요약",
          },
          {
            quote: "형제 같이 쓰기 좋다는 글 vs 유아만 쓰라는 글 — 용도에 따라 선택이 갈려요.",
            meta: "지식iN·카페 링크형 답변",
          },
        ],
      },
    ],
  },
  502: {
    productId: 502,
    headline:
      "분리형이라 세척 편하다는 글이 압도적이에요. 높이·발 디딤감은 아이 체격에 따라 호불호가 나뉩니다.",
    summaryBullets: [
      "브랜드 스토어·커뮤니티 공통: 물 빠짐·위생 관리 만족",
      "카페: ‘처음엔 무서워함’ → 적응 후 편함 패턴 자주 등장",
      "리뷰에서 색상·단종 옵션 문의가 간헐적으로 보임",
    ],
    channels: [
      {
        id: "momcafe",
        label: "맘카페·커뮤니티",
        sub: "배변 훈련 글 중심",
        chipClass: "bg-rose-500 text-white ring-2 ring-white shadow-sm",
        panelClass: "border-rose-100 bg-rose-50",
        reviews: [
          {
            quote:
              "남아라 앞판 있어서 튀는 거 걱정 덜었어요. 분리해서 소독하기 편해요.",
            meta: "○○동 맘 모임 · 추천 댓글 다수",
          },
          {
            quote: "바닥 미끄러우면 미끄럼 방지 매트 같이 쓰라는 팁 많음.",
            meta: "후기 공유 스레드",
          },
        ],
      },
      {
        id: "instagram",
        label: "인스타그램",
        sub: "육아 인플루언서·일상",
        chipClass: "bg-fuchsia-600 text-white ring-2 ring-white shadow-sm",
        panelClass: "border-fuchsia-100 bg-fuchsia-50",
        reviews: [
          {
            quote: "미니멀 디자인이라 거실에 둬도 티 안 난다는 반응. 브랜드 로고 노출 있는 샷 많음.",
            meta: "스토리 클립 요약",
          },
          {
            quote: "단계별로 컵형 전환하기 좋다는 후기 vs 바로 좌변기 올린 집도 있다는 댓글.",
            meta: "고정 댓글 참고",
          },
        ],
      },
      {
        id: "coupang",
        label: "오픈마켓·쿠팡류",
        sub: "동일 카테고리 비교 언급",
        chipClass: "bg-[#FA622F] text-white ring-2 ring-white shadow-sm",
        panelClass: "border-orange-100 bg-orange-50",
        reviews: [
          {
            quote: "비슷한 가격대 제품이랑 비교글 많음. 기본적으로 세척 편의가 이 제품쪽으로 기우는 편.",
            meta: "키워드: 분리형·세척",
          },
          {
            quote: "배송 박스 크고 안전하게 왔다는 평가 다수.",
            meta: "구매 후기 요약",
          },
        ],
      },
      {
        id: "naver",
        label: "네이버 브랜드스토어",
        sub: "공식 채널 후기 톤",
        chipClass: "bg-[#03C75A] text-white ring-2 ring-white shadow-sm",
        panelClass: "border-emerald-100 bg-emerald-50",
        reviews: [
          {
            quote: "공식몰 후기는 구성품·색상 확인 후 구매했다는 글이 많고, 고객 응대 언급도 보임.",
            meta: "스토어 노출 리뷰 패턴",
          },
          {
            quote: "화장실 공간 좁으면 각도 조절해서 두는 후기 있음.",
            meta: "장문 후기 발췌",
          },
        ],
      },
    ],
  },
};

function genericChannels(productName: string): ChannelReviewGroup[] {
  return [
    {
      id: "momcafe",
      label: "맘카페·커뮤니티",
      sub: "게시판·댓글",
      chipClass: "bg-rose-500 text-white ring-2 ring-white shadow-sm",
      panelClass: "border-rose-100 bg-rose-50",
      reviews: [
        {
          quote: `「${productName}」 실사용 후기 검색하면 중복 추천 글이 많아요. 택배·교환 경험도 함께 적힌 글이 도움이 됐다는 반응이 있었어요.`,
          meta: "커뮤니티 검색 결과 요약",
        },
        {
          quote:
            "월령·환경 따라 체감 차이 있다는 답글이 많아요. 우리 아이에게 맞는지 필터링이 필요해요.",
          meta: "댓글 톤 분석",
        },
      ],
    },
    {
      id: "instagram",
      label: "인스타그램",
      sub: "숏폼·저장",
      chipClass: "bg-fuchsia-600 text-white ring-2 ring-white shadow-sm",
      panelClass: "border-fuchsia-100 bg-fuchsia-50",
      reviews: [
        {
          quote:
            "짧은 후기 중에서는 ‘처음엔 고민 → 쓰고 나선 편함’ 패턴이 자주 보였어요. 영상마다 세팅이 달라 비교는 어렵다는 댓글도 있었어요.",
          meta: "릴스·카드글 요약",
        },
        {
          quote: "태그 검색 시 실내 조명·필터 때문에 색감 차이 주의하라는 팁이 반복돼요.",
          meta: "해시태그 코멘트",
        },
      ],
    },
    {
      id: "coupang",
      label: "쿠팡·오픈마켓",
      sub: "구매 리뷰",
      chipClass: "bg-[#FA622F] text-white ring-2 ring-white shadow-sm",
      panelClass: "border-orange-100 bg-orange-50",
      reviews: [
        {
          quote:
            "배송·포장 만족 언급 비율이 높은 편이에요. 가격 변동·할인 타이밍에 대한 코멘트도 함께 달리는 경우가 많아요.",
          meta: "평점 분포 데모",
        },
        {
          quote: "제품명과 유사한 다른 모델과 혼동했다는 글이 간헐적으로 보여요. 옵션 확인을 권장해요.",
          meta: "최근 리뷰 키워드",
        },
      ],
    },
    {
      id: "naver",
      label: "네이버·블로그",
      sub: "장문·비교글",
      chipClass: "bg-[#03C75A] text-white ring-2 ring-white shadow-sm",
      panelClass: "border-emerald-100 bg-emerald-50",
      reviews: [
        {
          quote: `블로그에서는 「${productName}」 장단점을 표로 비교한 글이 상위에 노출되는 경향이 있었어요.`,
          meta: "검색 상위 글 패턴",
        },
        {
          quote: "공식 스토어 vs 오픈마켓 구성 차이 언급 글이 일부 있었어요.",
          meta: "케이스 스터디 요약",
        },
      ],
    },
  ];
}

export function getIntegratedReviewsForProduct(product: {
  id: number;
  name: string;
}): IntegratedReviewPayload {
  const preset = PRESET[product.id];
  if (preset) return preset;

  return {
    productId: product.id,
    headline: `「${product.name}」에 대해 맘카페·SNS·쇼핑몰·블로그 글을 묶어 보면, 공통으로 꼽히는 포인트와 채널별로 다른 반응이 함께 보여요.`,
    summaryBullets: [
      "커뮤니티: 장기 사용 후기·육아 환경별 팁형 글이 많음",
      "쇼핑몰: 배송·포장·교환 경험이 상대적으로 구체적으로 적힘",
      "SNS: 짧고 감성적인 표현 비율이 높음 — 사실 확인은 상세 스펙과 함께 보는 게 좋아요",
    ],
    channelNote: "이 물품은 데모용 일반 요약이에요. 상위 2개 품목은 채널별 샘플 후기가 더 자세히 준비돼 있어요.",
    channels: genericChannels(product.name),
  };
}
