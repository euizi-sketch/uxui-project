import { dispatchHubUpdated, issuePlaygroundBundleCoupon } from "../../profile/myPageHubStorage";
import { EVENT_CAROUSEL_ITEMS, type EventItem } from "./eventCarouselData";

const POLL_KEY = "momoA.playground.pollVotes";
const REVIEWS_KEY = "momoA.playground.realReviews";
const WALLET_KEY = "momoA.walletPoints";
const LEDGER_KEY = "momoA.pointLedger";
const COMPARE_KEY = "momoA.playground.compareTotals";
const PARENTS_KEY = "momoA.playground.parentsQueries";
const PERSONALITY_KEY = "momoA.playground.personality";
const REGRET_AGREE_KEY = "momoA.playground.regretAgrees";

/** 마이페이지 등에서 포인트 표시 갱신용 */
export const WALLET_UPDATED_EVENT = "momoA-wallet-updated";

export const REVIEW_SUBMIT_POINTS = 120;

export type PollVoteRecord = Record<string, string>; // eventId -> option

export function loadPollVotes(): PollVoteRecord {
  try {
    const raw = localStorage.getItem(POLL_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return {};
    const out: PollVoteRecord = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function savePollVote(eventId: string, option: string) {
  const prev = loadPollVotes();
  prev[eventId] = option;
  localStorage.setItem(POLL_KEY, JSON.stringify(prev));
}

/** 모달·스탬프 조건 계산 공통 — 시드 집계 + 내 투표 1표 반영 */
const POLL_COUNT_SEED: Record<string, Record<string, number>> = {
  "poll-sleep": { "수면 교육": 98, 수면템: 112, 버팀: 67, 기타: 35 },
};

export function mergePollCountsForPollEvent(event: EventItem): Record<string, number> {
  const opts = event.pollOptions ?? [];
  const seed =
    POLL_COUNT_SEED[event.id] ?? Object.fromEntries(opts.map((o) => [o, 40 + (o.length * 7) % 50]));
  const out: Record<string, number> = { ...seed };
  const votes = loadPollVotes();
  const mine = votes[event.id];
  if (mine && out[mine] != null) out[mine] += 1;
  return out;
}

function mergePollCountsForPollById(eventId: string): Record<string, number> | null {
  const event = EVENT_CAROUSEL_ITEMS.find((e) => e.id === eventId && e.variant === "poll");
  if (!event) return null;
  return mergePollCountsForPollEvent(event);
}

export type PlaygroundReview = {
  id: string;
  productName: string;
  rating: number;
  body: string;
  photoUrl: string;
  createdAt: number;
};

export function loadPlaygroundReviews(): PlaygroundReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (!raw) return [];
    const a = JSON.parse(raw) as unknown;
    if (!Array.isArray(a)) return [];
    return a.filter((x) => x && typeof x === "object") as PlaygroundReview[];
  } catch {
    return [];
  }
}

export function savePlaygroundReview(entry: Omit<PlaygroundReview, "id" | "createdAt">) {
  const list = loadPlaygroundReviews();
  const next: PlaygroundReview = {
    ...entry,
    id: `r_${Date.now()}`,
    createdAt: Date.now(),
  };
  list.unshift(next);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(list.slice(0, 50)));
  dispatchHubUpdated();
}

/** 플레이그라운드 적립 포함 모모아 포인트 (정수 P). 미설정 시 마이페이지 기본값과 동일하게 426 */
export function loadWalletPoints(): number {
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    if (raw == null) return 426;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 426;
  } catch {
    return 426;
  }
}

export type PointLedgerEntry = {
  id: string;
  delta: number;
  balanceAfter: number;
  label: string;
  createdAt: number;
};

export function loadPointLedger(): PointLedgerEntry[] {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (!raw) return [];
    const a = JSON.parse(raw) as unknown;
    if (!Array.isArray(a)) return [];
    return a.filter((x) => x && typeof x === "object") as PointLedgerEntry[];
  } catch {
    return [];
  }
}

export function addWalletPoints(delta: number, label = "적립"): number {
  const next = loadWalletPoints() + delta;
  localStorage.setItem(WALLET_KEY, String(next));
  const ledger = loadPointLedger();
  ledger.unshift({
    id: `pl_${Date.now()}`,
    delta,
    balanceAfter: next,
    label,
    createdAt: Date.now(),
  });
  localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger.slice(0, 100)));
  window.dispatchEvent(new CustomEvent(WALLET_UPDATED_EVENT));
  dispatchHubUpdated();
  return next;
}

export type CompareTotals = { regret: number; happy: number };

export function loadCompareTotals(): Record<string, CompareTotals> {
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return {};
    const out: Record<string, CompareTotals> = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (v && typeof v === "object" && "regret" in v && "happy" in v) {
        const r = (v as { regret: unknown; happy: unknown }).regret;
        const h = (v as { regret: unknown; happy: unknown }).happy;
        if (typeof r === "number" && typeof h === "number") {
          out[k] = { regret: Math.max(0, Math.floor(r)), happy: Math.max(0, Math.floor(h)) };
        }
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function getCompareCounts(
  productName: string,
  seedRegret: number,
  seedHappy: number
): CompareTotals {
  const all = loadCompareTotals();
  const cur = all[productName];
  if (cur && (cur.regret > 0 || cur.happy > 0)) return { ...cur };
  return { regret: seedRegret, happy: seedHappy };
}

export function voteCompare(productName: string, side: "regret" | "happy", seedRegret: number, seedHappy: number) {
  const all = loadCompareTotals();
  const prev = all[productName] ?? { regret: seedRegret, happy: seedHappy };
  const next: CompareTotals =
    side === "regret"
      ? { regret: prev.regret + 1, happy: prev.happy }
      : { regret: prev.regret, happy: prev.happy + 1 };
  all[productName] = next;
  localStorage.setItem(COMPARE_KEY, JSON.stringify(all));
}

export type ParentsQueryEntry = {
  months: number;
  concern: string;
  estimatedPeers: number;
  createdAt: number;
};

export function loadParentsQueries(): ParentsQueryEntry[] {
  try {
    const raw = localStorage.getItem(PARENTS_KEY);
    if (!raw) return [];
    const a = JSON.parse(raw) as unknown;
    if (!Array.isArray(a)) return [];
    return a.filter((x) => x && typeof x === "object") as ParentsQueryEntry[];
  } catch {
    return [];
  }
}

export function appendParentsQuery(entry: Pick<ParentsQueryEntry, "months" | "concern" | "estimatedPeers">) {
  const list = loadParentsQueries();
  const next: ParentsQueryEntry = {
    ...entry,
    createdAt: Date.now(),
  };
  list.unshift(next);
  localStorage.setItem(PARENTS_KEY, JSON.stringify(list.slice(0, 40)));
}

/** 저장된 검색·입력 패턴을 반영한 비슷한 부모 수 추정 */
export function estimateSimilarParents(months: number, concern: string): number {
  const history = loadParentsQueries();
  const band = Math.floor(Math.min(60, Math.max(0, months)) / 6);
  const sameBand = history.filter((q) => Math.floor(Math.min(60, Math.max(0, q.months)) / 6) === band).length;
  const concernNorm = concern.trim().toLowerCase();
  const sameTopic = history.filter(
    (q) => q.concern.trim().toLowerCase().slice(0, 12) === concernNorm.slice(0, 12) && concernNorm.length > 0
  ).length;

  const base = 40 + Math.min(36, Math.max(0, months)) * 6;
  const extra = (concern.trim().length % 180) + (concern.includes("수면") ? 42 : 0);
  const cohortBoost = sameBand * 12 + sameTopic * 35;
  return Math.min(982, base + extra + cohortBoost);
}

export type PersonalitySnapshot = {
  label: string;
  score: number;
  tip: string;
  savedAt: number;
};

export function loadPersonalityResult(): PersonalitySnapshot | null {
  try {
    const raw = localStorage.getItem(PERSONALITY_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return null;
    const p = o as Record<string, unknown>;
    if (typeof p.label !== "string" || typeof p.score !== "number" || typeof p.tip !== "string") return null;
    const savedAt = typeof p.savedAt === "number" ? p.savedAt : Date.now();
    return { label: p.label, score: p.score, tip: p.tip, savedAt };
  } catch {
    return null;
  }
}

export function savePersonalityResult(snapshot: Omit<PersonalitySnapshot, "savedAt">) {
  const full: PersonalitySnapshot = { ...snapshot, savedAt: Date.now() };
  localStorage.setItem(PERSONALITY_KEY, JSON.stringify(full));
}

export function loadRegretAgrees(): Record<number, number> {
  try {
    const raw = localStorage.getItem(REGRET_AGREE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return {};
    const out: Record<number, number> = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      const rk = Number(k);
      if (Number.isFinite(rk) && typeof v === "number") out[rk] = Math.max(0, Math.floor(v));
    }
    return out;
  } catch {
    return {};
  }
}

export function addRegretAgree(rank: number) {
  const m = loadRegretAgrees();
  m[rank] = (m[rank] ?? 0) + 1;
  localStorage.setItem(REGRET_AGREE_KEY, JSON.stringify(m));
}

// ——— 플레이그라운드 참여 스탬프 → 쿠폰 번들 ———

const STAMP_BUNDLE_KEY = "momoA.playground.stampBundle.v1";

export const PLAYGROUND_BUNDLE_STAMPS_NEEDED = 3;
export const PLAYGROUND_REWARD_UPDATED_EVENT = "momoA-playground-reward-updated";

type StampBundleState = {
  /** 이벤트 카드별 첫 참여 1스탬프 (같은 카드 중복 참여는 스탬프 추가 없음) */
  stampedEventIds: string[];
};

function loadStampBundle(): StampBundleState {
  try {
    const raw = localStorage.getItem(STAMP_BUNDLE_KEY);
    if (!raw) return { stampedEventIds: [] };
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return { stampedEventIds: [] };
    const ids = (o as { stampedEventIds?: unknown }).stampedEventIds;
    if (!Array.isArray(ids)) return { stampedEventIds: [] };
    return { stampedEventIds: ids.filter((x): x is string => typeof x === "string") };
  } catch {
    return { stampedEventIds: [] };
  }
}

function saveStampBundle(s: StampBundleState) {
  localStorage.setItem(STAMP_BUNDLE_KEY, JSON.stringify(s));
}

function dispatchPlaygroundRewardUpdated() {
  window.dispatchEvent(new CustomEvent(PLAYGROUND_REWARD_UPDATED_EVENT));
}

export function getPlaygroundStampProgress(): {
  stampCount: number;
  needed: number;
  canClaimBundle: boolean;
} {
  const s = loadStampBundle();
  const n = s.stampedEventIds.length;
  return {
    stampCount: n,
    needed: PLAYGROUND_BUNDLE_STAMPS_NEEDED,
    canClaimBundle: n >= PLAYGROUND_BUNDLE_STAMPS_NEEDED,
  };
}

export type StampAwardResult = {
  /** 조건 충족으로 이번에 스탬프가 새로 찍혔는지 */
  awarded: boolean;
  stampCount: number;
  canClaimBundle: boolean;
};

function stampBundleResult(stampedEventIds: string[], awarded: boolean): StampAwardResult {
  const n = stampedEventIds.length;
  return {
    awarded,
    stampCount: n,
    canClaimBundle: n >= PLAYGROUND_BUNDLE_STAMPS_NEEDED,
  };
}

function tryAddStamp(eventId: string): StampAwardResult {
  const s = loadStampBundle();
  if (s.stampedEventIds.includes(eventId)) {
    return stampBundleResult(s.stampedEventIds, false);
  }
  const stampedEventIds = [...s.stampedEventIds, eventId];
  saveStampBundle({ stampedEventIds });
  dispatchPlaygroundRewardUpdated();
  return stampBundleResult(stampedEventIds, true);
}

/** 투표: 집계상 1위(최다 득표) 보기에 투표했을 때만 */
export function tryAwardPollVoteStamp(eventId: string, chosenOption: string): StampAwardResult {
  const counts = mergePollCountsForPollById(eventId);
  if (!counts || !(chosenOption in counts)) return stampBundleResult(loadStampBundle().stampedEventIds, false);
  const max = Math.max(...Object.values(counts));
  if (counts[chosenOption] !== max) return stampBundleResult(loadStampBundle().stampedEventIds, false);
  return tryAddStamp(eventId);
}

/** 후기: 별점·글·사진 기준으로 ‘인기 후기’로 볼 만한 조건일 때만 */
export function playgroundReviewQualifiesPopular(body: string, rating: number, photoUrl: string): boolean {
  const t = body.trim();
  const len = t.length;
  const photo = Boolean(photoUrl.trim());
  if (rating <= 3) return false;
  if (rating >= 5 && len >= 45) return true;
  if (rating >= 4 && len >= 95) return true;
  if (photo && rating >= 4 && len >= 38) return true;
  return false;
}

export function tryAwardReviewStamp(
  eventId: string,
  args: { body: string; rating: number; photoUrl: string }
): StampAwardResult {
  if (!playgroundReviewQualifiesPopular(args.body, args.rating, args.photoUrl)) {
    return stampBundleResult(loadStampBundle().stampedEventIds, false);
  }
  return tryAddStamp(eventId);
}

/** 비교 투표: 후회/만족 중 비율이 더 높은 쪽에 맞춰 투표했을 때만 */
export function tryAwardCompareVoteStamp(
  eventId: string,
  productName: string,
  side: "regret" | "happy",
  seedRegret: number,
  seedHappy: number
): StampAwardResult {
  const c = getCompareCounts(productName, seedRegret, seedHappy);
  const leading: "regret" | "happy" | null =
    c.regret > c.happy ? "regret" : c.happy > c.regret ? "happy" : null;
  if (leading === null || side !== leading) {
    return stampBundleResult(loadStampBundle().stampedEventIds, false);
  }
  return tryAddStamp(eventId);
}

const PARENTS_PEER_STAMP_MIN = 165;

/** 비슷한 부모 수 추정이 일정 이상일 때만 (코호트가 두터울 때) */
export function tryAwardParentsStamp(eventId: string, estimatedPeers: number): StampAwardResult {
  if (estimatedPeers < PARENTS_PEER_STAMP_MIN) {
    return stampBundleResult(loadStampBundle().stampedEventIds, false);
  }
  return tryAddStamp(eventId);
}

/** 성향 테스트: 3문항 전부 같은 쪽(0점·6점)처럼 뚜렷한 유형일 때만 */
export function tryAwardPersonalityStamp(eventId: string, finalScore: number): StampAwardResult {
  if (finalScore !== 0 && finalScore !== 6) {
    return stampBundleResult(loadStampBundle().stampedEventIds, false);
  }
  return tryAddStamp(eventId);
}

/** 후회 TOP: 1위 항목에 공감했을 때만 */
export function tryAwardRegretStamp(eventId: string, rank: number): StampAwardResult {
  if (rank !== 1) return stampBundleResult(loadStampBundle().stampedEventIds, false);
  return tryAddStamp(eventId);
}

export function claimPlaygroundBundleReward(): { ok: boolean; message: string } {
  const s = loadStampBundle();
  if (s.stampedEventIds.length < PLAYGROUND_BUNDLE_STAMPS_NEEDED) {
    return {
      ok: false,
      message: `서로 다른 카드에서 참여해 스탬프를 ${PLAYGROUND_BUNDLE_STAMPS_NEEDED}개 모아 주세요.`,
    };
  }
  issuePlaygroundBundleCoupon();
  saveStampBundle({ stampedEventIds: [] });
  dispatchPlaygroundRewardUpdated();
  return {
    ok: true,
    message: "쿠폰함에 3천원 할인 쿠폰이 발급됐어요. 결제 전 쿠폰함에서 선택할 수 있어요.",
  };
}
