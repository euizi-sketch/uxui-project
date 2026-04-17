const POLL_KEY = "momoA.playground.pollVotes";
const REVIEWS_KEY = "momoA.playground.realReviews";

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
}
