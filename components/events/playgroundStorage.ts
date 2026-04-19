import { dispatchHubUpdated } from "../../profile/myPageHubStorage";

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
