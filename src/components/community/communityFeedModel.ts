/** 커뮤니티 피드 데모 — 게시글·댓글·좋아요를 로컬에 저장 */

export type FeedComment = {
  id: string;
  postId: string;
  parentId: string | null;
  author: string;
  body: string;
  createdAt: number;
};

export type FeedPost = {
  id: string;
  author: string;
  avatarUrl: string;
  images: string[];
  body: string;
  tags: string[];
  /** 토픽 방 id (FEATURED_ROOMS). 없으면 메인 피드에만 노출 */
  roomId?: string;
  createdAt: number;
  likeCount: number;
};

const POSTS_KEY = "momoA.communityFeedPosts";
const COMMENTS_KEY = "momoA.communityFeedComments";
const LIKED_KEY = "momoA.communityFeedLikedPostIds";

const demoAvatars = [
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
];

const demoImages = [
  "https://images.unsplash.com/photo-1544126592-807daa2b5d33?w=600&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
  "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80",
  "https://images.unsplash.com/photo-1558060379-71230465e879?w=600&q=80",
];

/** 구버전 로컬 데이터에 roomId 보강 */
const LEGACY_POST_ROOM: Record<string, string> = {
  p1: "1",
  p2: "3",
  p3: "4",
  p4: "2",
};

function seedPosts(): FeedPost[] {
  const now = Date.now();
  return [
    {
      id: "p1",
      author: "둘째맘수리",
      avatarUrl: demoAvatars[0],
      images: [demoImages[0]],
      body: "오늘 드디어 기저귀 사이즈 바꿨어요 ㅠㅠ 밤에 새는 줄 알았더니 작아서 그랬던 거였네요. 다들 몇 개월에 한 단계 올리셨어요?",
      tags: ["기저귀", "밤잠"],
      roomId: "1",
      createdAt: now - 1000 * 60 * 42,
      likeCount: 24,
    },
    {
      id: "p2",
      author: "연두맘🌿",
      avatarUrl: demoAvatars[1],
      images: [demoImages[1], demoImages[2]],
      body: "이유식 재료 장보기 전에 찍은 인증샷이에요. 브로콜리 삶는 냄새가 벌써 걱정된다는 남편 코멘트 🤣",
      tags: ["이유식", "일상"],
      roomId: "3",
      createdAt: now - 1000 * 60 * 180,
      likeCount: 51,
    },
    {
      id: "p3",
      author: "출근러지혜",
      avatarUrl: demoAvatars[2],
      images: [],
      body: "돌 임박인데 분리불안이 장난 아니에요… 어린이집 보낼 때 마음 아픈 거 공감되시나요 😢 조언 부탁드려요.",
      tags: ["워킹맘", "분리불안"],
      roomId: "4",
      createdAt: now - 1000 * 60 * 320,
      likeCount: 103,
    },
    {
      id: "p4",
      author: "초보맘히로",
      avatarUrl: demoAvatars[3],
      images: [demoImages[3]],
      body: "주말에 공원 산책만 하는데도 벌써부터 체력이 방전이에요. 근처 맘카페 추천 받아서 작은 놀이터 찾았어요 ☀️",
      tags: ["외출", "산책"],
      roomId: "2",
      createdAt: now - 1000 * 60 * 1440,
      likeCount: 17,
    },
  ];
}

function seedComments(): FeedComment[] {
  const now = Date.now();
  return [
    {
      id: "c1",
      postId: "p1",
      parentId: null,
      author: "영이맘",
      body: "저도 NB→S 넘길 때 밤에 깼어요 ㅠ 슬림형으로 바꿨더니 나아졌어요!",
      createdAt: now - 1000 * 60 * 35,
    },
    {
      id: "c2",
      postId: "p1",
      parentId: "c1",
      author: "둘째맘수리",
      body: "오 슬림형 체크해볼게요 감사해요 💛",
      createdAt: now - 1000 * 60 * 33,
    },
    {
      id: "c3",
      postId: "p3",
      parentId: null,
      author: "너구리아빠",
      body: "저희도 한 달 걸렸어요. 매일 좀 더 짧게 연습하고 안아주는 시간 줄여봤어요.",
      createdAt: now - 1000 * 60 * 300,
    },
  ];
}

function migratePostRoomIds(posts: FeedPost[]): FeedPost[] {
  let changed = false;
  const next = posts.map((p) => {
    if (p.roomId) return p;
    const rid = LEGACY_POST_ROOM[p.id];
    if (!rid) return p;
    changed = true;
    return { ...p, roomId: rid };
  });
  if (changed) savePostsRaw(next);
  return next;
}

export function loadPosts(): FeedPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) {
      const s = seedPosts();
      savePostsRaw(s);
      return s;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return seedPosts();
    return migratePostRoomIds(parsed as FeedPost[]);
  } catch {
    return seedPosts();
  }
}

function savePostsRaw(posts: FeedPost[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function loadComments(): FeedComment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (!raw) {
      const s = seedComments();
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return seedComments();
    return parsed as FeedComment[];
  } catch {
    return seedComments();
  }
}

function saveCommentsRaw(comments: FeedComment[]) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

export function loadLikedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    if (!raw) return new Set();
    const o = JSON.parse(raw) as unknown;
    if (!Array.isArray(o)) return new Set();
    return new Set(o.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export function saveLikedIds(ids: Set<string>) {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...ids]));
}

export function upsertPost(post: FeedPost) {
  const all = loadPosts();
  const i = all.findIndex((p) => p.id === post.id);
  if (i >= 0) all[i] = post;
  else all.unshift(post);
  savePostsRaw(all);
}

export function addPost(input: Omit<FeedPost, "id" | "createdAt" | "likeCount">): FeedPost {
  const post: FeedPost = {
    ...input,
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    likeCount: 0,
  };
  upsertPost(post);
  return post;
}

export function toggleLikePost(postId: string): { liked: boolean; likeCount: number } {
  const posts = loadPosts();
  const liked = loadLikedIds();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx < 0) return { liked: false, likeCount: 0 };

  let nextCount = posts[idx].likeCount;
  if (liked.has(postId)) {
    liked.delete(postId);
    nextCount = Math.max(0, nextCount - 1);
  } else {
    liked.add(postId);
    nextCount += 1;
  }
  posts[idx] = { ...posts[idx], likeCount: nextCount };
  savePostsRaw(posts);
  saveLikedIds(liked);
  return { liked: liked.has(postId), likeCount: nextCount };
}

export function addFeedComment(input: Omit<FeedComment, "id" | "createdAt">): FeedComment {
  const c: FeedComment = {
    ...input,
    id: `cm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  const all = loadComments();
  all.push(c);
  saveCommentsRaw(all);
  return c;
}

export function commentsForPost(postId: string): FeedComment[] {
  return loadComments().filter((c) => c.postId === postId).sort((a, b) => a.createdAt - b.createdAt);
}

export function formatFeedTime(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  return new Date(ms).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}
