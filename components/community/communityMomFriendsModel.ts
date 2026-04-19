/**
 * 커뮤니티 맘 친구 · 쪽지(1:1) — 로컬 데모 (실서비스는 서버 API로 대체)
 */

import { loadMyPageProfileFromStorage } from "../../profile/momoProfileStorage";

export type DemoMom = {
  id: string;
  nickname: string;
  avatarUrl: string;
  region?: string;
  childAgeLabel?: string;
  bio?: string;
};

export type DmMessage = {
  id: string;
  body: string;
  fromMe: boolean;
  createdAt: number;
};

export type DmThread = {
  peerId: string;
  messages: DmMessage[];
  updatedAt: number;
};

type FriendStateFile = {
  friends: string[];
  outgoing: string[];
  incoming: string[];
};

const FRIEND_STATE_KEY = "momoA.communityFriendState.v1";
const DM_KEY = "momoA.communityDmThreads.v1";

const AV = [
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&q=80",
];

export const DEMO_MOMS: DemoMom[] = [
  {
    id: "mom-d1",
    nickname: "둘째맘수리",
    avatarUrl: AV[0],
    region: "송파구",
    childAgeLabel: "생후 9개월",
    bio: "밤잠·기저귀 질문 많이 해요",
  },
  {
    id: "mom-d2",
    nickname: "연두맘🌿",
    avatarUrl: AV[1],
    region: "강남구",
    childAgeLabel: "돌 반년차",
    bio: "이유식·외출 준비 정리 중",
  },
  {
    id: "mom-d3",
    nickname: "출근러지혜",
    avatarUrl: AV[2],
    region: "마포구",
    childAgeLabel: "만 2세",
    bio: "워킹맘 병행 팁 나눠요",
  },
  {
    id: "mom-d4",
    nickname: "초보맘히로",
    avatarUrl: AV[3],
    region: "용산구",
    childAgeLabel: "생후 5개월",
    bio: "산책·외출 질문 환영",
  },
  {
    id: "mom-d5",
    nickname: "달빛소라",
    avatarUrl: AV[4],
    region: "성북구",
    childAgeLabel: "생후 14개월",
    bio: "수면 루틴 같이 맞춰요",
  },
  {
    id: "mom-d6",
    nickname: "토리맘78",
    avatarUrl: AV[5],
    region: "영등포구",
    childAgeLabel: "예비 초등",
    bio: "책·놀이 추천 받아요",
  },
];

function loadFriendState(): FriendStateFile {
  try {
    const raw = localStorage.getItem(FRIEND_STATE_KEY);
    if (!raw) return { friends: [], outgoing: [], incoming: [] };
    const o = JSON.parse(raw) as Partial<FriendStateFile>;
    return {
      friends: Array.isArray(o.friends) ? o.friends : [],
      outgoing: Array.isArray(o.outgoing) ? o.outgoing : [],
      incoming: Array.isArray(o.incoming) ? o.incoming : [],
    };
  } catch {
    return { friends: [], outgoing: [], incoming: [] };
  }
}

function saveFriendState(s: FriendStateFile) {
  try {
    localStorage.setItem(FRIEND_STATE_KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("momoA-community-friends-changed"));
  } catch {
    /* ignore */
  }
}

/** 최초 진입 시 받은 요청 1건 시드 (데모) */
export function seedCommunityFriendsDemoIfNeeded() {
  try {
    const raw = localStorage.getItem(FRIEND_STATE_KEY);
    if (raw) return;
    const s: FriendStateFile = {
      friends: [],
      outgoing: [],
      incoming: ["mom-d5"],
    };
    saveFriendState(s);
  } catch {
    /* ignore */
  }
}

export function getMomById(id: string): DemoMom | undefined {
  return DEMO_MOMS.find((m) => m.id === id);
}

export function loadFriendStateSnapshot(): FriendStateFile {
  return loadFriendState();
}

export function sendFriendRequest(peerId: string) {
  const s = loadFriendState();
  if (s.friends.includes(peerId)) return;
  if (s.outgoing.includes(peerId)) return;
  if (s.incoming.includes(peerId)) {
    acceptFriendRequest(peerId);
    return;
  }
  s.outgoing.push(peerId);
  saveFriendState(s);
}

export function cancelOutgoingRequest(peerId: string) {
  const s = loadFriendState();
  s.outgoing = s.outgoing.filter((id) => id !== peerId);
  saveFriendState(s);
}

export function acceptFriendRequest(peerId: string) {
  const s = loadFriendState();
  s.incoming = s.incoming.filter((id) => id !== peerId);
  s.outgoing = s.outgoing.filter((id) => id !== peerId);
  if (!s.friends.includes(peerId)) s.friends.push(peerId);
  saveFriendState(s);
}

export function declineIncoming(peerId: string) {
  const s = loadFriendState();
  s.incoming = s.incoming.filter((id) => id !== peerId);
  saveFriendState(s);
}

export function removeFriend(peerId: string) {
  const s = loadFriendState();
  s.friends = s.friends.filter((id) => id !== peerId);
  saveFriendState(s);
}

function loadDmThreads(): DmThread[] {
  try {
    const raw = localStorage.getItem(DM_KEY);
    if (!raw) return [];
    const a = JSON.parse(raw) as unknown;
    if (!Array.isArray(a)) return [];
    return a.filter(
      (t): t is DmThread =>
        t &&
        typeof t === "object" &&
        typeof (t as DmThread).peerId === "string" &&
        Array.isArray((t as DmThread).messages)
    );
  } catch {
    return [];
  }
}

function saveDmThreads(threads: DmThread[]) {
  try {
    localStorage.setItem(DM_KEY, JSON.stringify(threads));
    window.dispatchEvent(new CustomEvent("momoA-community-dm-changed"));
  } catch {
    /* ignore */
  }
}

export function getDmThread(peerId: string): DmThread | undefined {
  return loadDmThreads().find((t) => t.peerId === peerId);
}

export function sendDmMessage(peerId: string, body: string) {
  const text = body.trim();
  if (!text) return;
  const threads = loadDmThreads();
  const id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const msg: DmMessage = { id, body: text, fromMe: true, createdAt: Date.now() };
  let t = threads.find((x) => x.peerId === peerId);
  if (!t) {
    t = { peerId, messages: [], updatedAt: Date.now() };
    threads.push(t);
  }
  t.messages.push(msg);
  t.updatedAt = Date.now();
  saveDmThreads(threads);
}

/** 데모: 상대 맘이 보낸 것처럼 자동 답장 1통 (친구일 때만, 가끔) */
export function maybeAppendDemoReply(peerId: string) {
  const s = loadFriendState();
  if (!s.friends.includes(peerId)) return;
  const replies = [
    "저도 그때 비슷했어요 ㅎㅎ 나중에 카페에서 이야기 더 나눠요!",
    "도움이 됐다니 다행이에요 🙌 육아템 탭 추천도 한번 봐 보세요.",
    "오늘 하루도 파이팅이에요 💪",
  ];
  const threads = loadDmThreads();
  let t = threads.find((x) => x.peerId === peerId);
  if (!t) return;
  const last = t.messages[t.messages.length - 1];
  if (!last?.fromMe) return;
  window.setTimeout(() => {
    const threads2 = loadDmThreads();
    let t2 = threads2.find((x) => x.peerId === peerId);
    if (!t2) return;
    const last2 = t2.messages[t2.messages.length - 1];
    if (!last2?.fromMe || last2.id !== last.id) return;
    const rid = `m-${Date.now()}-bot`;
    t2.messages.push({
      id: rid,
      body: replies[Math.floor(Math.random() * replies.length)],
      fromMe: false,
      createdAt: Date.now(),
    });
    t2.updatedAt = Date.now();
    saveDmThreads(threads2);
    window.dispatchEvent(new CustomEvent("momoA-community-dm-changed"));
  }, 900 + Math.random() * 800);
}

export function appendIncomingDmDemo(peerId: string, body: string) {
  const threads = loadDmThreads();
  let t = threads.find((x) => x.peerId === peerId);
  if (!t) {
    t = { peerId, messages: [], updatedAt: Date.now() };
    threads.push(t);
  }
  t.messages.push({
    id: `m-in-${Date.now()}`,
    body,
    fromMe: false,
    createdAt: Date.now(),
  });
  t.updatedAt = Date.now();
  saveDmThreads(threads);
}

export function listThreadsSorted(): DmThread[] {
  return [...loadDmThreads()].sort((a, b) => b.updatedAt - a.updatedAt);
}

/** 추천 목록: 이미 친구·진행 중 요청 제외 */
export function listDiscoverableMoms(): DemoMom[] {
  const st = loadFriendState();
  const blocked = new Set([...st.friends, ...st.outgoing, ...st.incoming]);
  const myNick = loadMyPageProfileFromStorage().nickname.trim();
  return DEMO_MOMS.filter((m) => !blocked.has(m.id) && (!myNick || m.nickname !== myNick));
}

export function unreadIncomingRequestCount(): number {
  return loadFriendState().incoming.length;
}
