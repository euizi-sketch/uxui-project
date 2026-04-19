/** 커뮤니티 토픽 방 — 피드 필터·스토리·글쓰기 방 선택에 공통 사용 */

export const FEATURED_ROOMS = [
  {
    id: "1",
    name: "육아템 나눔방",
    coverUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
  },
  {
    id: "2",
    name: "맘카페 수다",
    coverUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80",
  },
  {
    id: "3",
    name: "이유식 오늘 뭐",
    coverUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
  },
  {
    id: "4",
    name: "워킹맘 동지",
    coverUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80",
  },
  {
    id: "5",
    name: "초보맘 Q&A",
    coverUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80",
  },
] as const;

export type FeaturedRoom = (typeof FEATURED_ROOMS)[number];

export function getRoomById(id: string): FeaturedRoom | undefined {
  return FEATURED_ROOMS.find((r) => r.id === id);
}
