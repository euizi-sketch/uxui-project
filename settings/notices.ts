export type NoticeItem = {
  id: string;
  title: string;
  dateLabel: string;
  body: string;
};

export const APP_NOTICES: NoticeItem[] = [
  {
    id: "n1",
    title: "가정의 달 이벤트 안내",
    dateLabel: "2026.04.01",
    body: "육아용품 탭에서 가정의 달 특가 배너를 확인해 보세요. 데모 앱에서는 실제 결제가 이루어지지 않습니다.",
  },
  {
    id: "n2",
    title: "알림 설정 개선",
    dateLabel: "2026.03.18",
    body: "설정 > 알림에서 마케팅·주문·커뮤니티 알림을 구분해 끄고 켤 수 있습니다. 기기 푸시는 브라우저 알림 권한이 필요합니다.",
  },
  {
    id: "n3",
    title: "문의 접수 처리 안내",
    dateLabel: "2026.03.05",
    body: "1:1 문의는 마이페이지 > 문의에서 남겨 주세요. 데모에서는 로컬에 저장되며 실제 고객센터와 연동되지 않습니다.",
  },
];
