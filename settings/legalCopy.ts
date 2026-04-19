export type LegalDocId = "terms" | "privacy" | "location" | "membership";

export function legalTitle(id: LegalDocId): string {
  switch (id) {
    case "terms":
      return "서비스 이용약관";
    case "privacy":
      return "개인정보 처리방침";
    case "location":
      return "위치기반서비스 이용약관";
    case "membership":
      return "맘맘 멤버십 이용약관";
    default:
      return "약관";
  }
}

/** 앱 내 표시용 요약 본문 (실제 법적 효력 없음 — 데모/참고용) */
export function legalSections(id: LegalDocId): { heading: string; paragraphs: string[] }[] {
  const common =
    "본 문서는 모모아 데모 앱에서 제공하는 참고용 요약입니다. 실제 서비스 오픈 시 법무 검토를 거친 최종 약관이 적용됩니다.";
  switch (id) {
    case "terms":
      return [
        {
          heading: "제1조 (목적)",
          paragraphs: [
            common,
            "이 약관은 모모아(이하 ‘서비스’)의 이용과 관련하여 회사와 이용자 간 권리·의무 및 책임사항을 규정함을 목적으로 합니다.",
          ],
        },
        {
          heading: "제2조 (서비스 내용)",
          paragraphs: [
            "서비스는 육아 관련 정보 큐레이션, 커뮤니티, 상품 레퍼런스 링크, 로컬 저장 기반 프로필·주문 데모 기능을 포함할 수 있습니다.",
            "데모 환경에서는 외부 결제·실명 인증이 연결되지 않을 수 있습니다.",
          ],
        },
        {
          heading: "제3조 (이용자의 의무)",
          paragraphs: [
            "이용자는 타인의 권리를 침해하는 게시물을 작성해서는 안 되며, 서비스 운영을 방해하는 행위를 해서는 안 됩니다.",
          ],
        },
      ];
    case "privacy":
      return [
        {
          heading: "1. 수집 항목",
          paragraphs: [
            common,
            "데모 앱에서는 브라우저 로컬 저장소(localStorage)에 프로필, 스크랩, 주문·문의·포인트 등을 저장할 수 있습니다.",
          ],
        },
        {
          heading: "2. 이용 목적",
          paragraphs: [
            "맞춤 추천·화면 표시·고객 지원 시뮬레이션에 활용됩니다. 실제 개인정보는 사용자 기기 내에 머무르며 서버로 전송되지 않습니다(데모 기준).",
          ],
        },
        {
          heading: "3. 보관 및 파기",
          paragraphs: [
            "이용자는 브라우저 설정 또는 앱 내 ‘데이터 초기화’로 저장된 정보를 삭제할 수 있습니다.",
          ],
        },
      ];
    case "location":
      return [
        {
          heading: "위치정보의 이용",
          paragraphs: [
            common,
            "위치 기반 기능을 제공할 경우, 이용 목적·보관 기간·제3자 제공 여부를 별도 고지합니다. 데모에서는 GPS 연동이 없을 수 있습니다.",
          ],
        },
        {
          heading: "동의 철회",
          paragraphs: ["이용자는 설정 또는 기기 권한에서 위치 이용에 대한 동의를 철회할 수 있습니다."],
        },
      ];
    case "membership":
      return [
        {
          heading: "멤버십 혜택",
          paragraphs: [
            common,
            "멤버십 가입 시 포인트 적립·쿠폰 등 혜택이 제공될 수 있으며, 세부 조건은 이벤트 페이지에 따릅니다.",
          ],
        },
        {
          heading: "해지",
          paragraphs: ["이용자는 언제든지 멤버십 해지를 요청할 수 있으며, 잔여 혜택은 정책에 따라 소멸될 수 있습니다."],
        },
      ];
    default:
      return [{ heading: "안내", paragraphs: [common] }];
  }
}
