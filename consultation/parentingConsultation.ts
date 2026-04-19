/**
 * 3분 육아용품 우선순위 상담 — 로컬 규칙 기반 진단(데모)
 * 육아용품 탭 추천 분류와 localStorage 동기화
 */

export const CONSULTATION_STORAGE_KEY = "momoA.parentingConsultation.v1";

export type PainMomentId = "sleep" | "out" | "feed" | "play" | "hygiene";

export type CategoryId = "diaper" | "feed" | "out" | "toy" | "safe";

export type ConsultationAnswers = {
  q1: PainMomentId;
  q2: string;
  q3: string;
  q4: string;
};

export type Tier = "must" | "nice" | "defer";

export type ConsultationResult = {
  updatedAt: number;
  summary: string;
  direction: string;
  mustCategories: { id: CategoryId; label: string }[];
  niceCategories: { id: CategoryId; label: string }[];
  deferCategories: { id: CategoryId; label: string }[];
  oneLiner: string;
  categoryTier: Record<CategoryId, Tier>;
};

const CAT_LABEL: Record<CategoryId, string> = {
  diaper: "기저귀·위생",
  feed: "수유·이유식",
  out: "외출·이동",
  toy: "놀이·완구",
  safe: "안전·가전·환경",
};

export const Q1_OPTIONS: { id: PainMomentId; text: string }[] = [
  { id: "sleep", text: "밤이 길어지는 수면·돌봄" },
  { id: "out", text: "외출·이동을 준비할 때마다" },
  { id: "feed", text: "수유·이유식·설거지가 한꺼번에 몰릴 때" },
  { id: "play", text: "놀이와 시간을 채우는 게 버거울 때" },
  { id: "hygiene", text: "빨래·위생·정리가 끝나지 않을 때" },
];

export function getQ2Options(pain: PainMomentId): { id: string; text: string }[] {
  const m: Record<PainMomentId, { id: string; text: string }[]> = {
    sleep: [
      { id: "s1", text: "눈을 뜨기 아픈 새벽, 돌봄이 이어질 때" },
      { id: "s2", text: "낮잠·밤잠 리듬이 자꾸 흔들릴 때" },
      { id: "s3", text: "아이는 자는데 내 마음이 안 내려앉을 때" },
      { id: "s4", text: "밤에 세척·준비로 손이 또 바뀔 때" },
    ],
    out: [
      { id: "o1", text: "짐 싸기 전부터 이미 지칠 때" },
      { id: "o2", text: "이동 중 아이가 버틸지 마음이 쫄릴 때" },
      { id: "o3", text: "도착해서 정리할 힘이 없을 때" },
      { id: "o4", text: "날씨·온도 때문에 계획이 자꾸 바뀔 때" },
    ],
    feed: [
      { id: "f1", text: "젖·분유·유축이 한 줄에 겹칠 때" },
      { id: "f2", text: "이유식 준비·설거지가 동시에 밀릴 때" },
      { id: "f3", text: "먹는 속도와 내 일정이 안 맞을 때" },
      { id: "f4", text: "소독·보관을 매번 새로 챙겨야 할 때" },
    ],
    play: [
      { id: "p1", text: "놀아주다 보면 시간만 훅 갈 때" },
      { id: "p2", text: "같은 놀이가 반복돼 내가 먼저 지칠 때" },
      { id: "p3", text: "집안에서 소음·안전이 같이 신경 쓰일 때" },
      { id: "p4", text: "밖에서 쉬지 못하고 돌아올 때" },
    ],
    hygiene: [
      { id: "h1", text: "빨래가 마르기 전에 또 쌓일 때" },
      { id: "h2", text: "씻기기·기저귀 갈기가 겹칠 때" },
      { id: "h3", text: "정리해도 금방 어질러질 때" },
      { id: "h4", text: "위생용품이 곳곳에 흩어져 있을 때" },
    ],
  };
  return m[pain];
}

export function getQ3Options(pain: PainMomentId): { id: string; text: string }[] {
  const m: Record<PainMomentId, { id: string; text: string }[]> = {
    sleep: [
      { id: "a1", text: "조용해야 할 시간에 손이 더 바빠지는 느낌" },
      { id: "a2", text: "환경(온도·소음·빛)이 신경 쓰일 때" },
      { id: "a3", text: "내 수면만큼은 기대도 못 할 때" },
      { id: "a4", text: "낮과 밤의 기준이 흐려질 때" },
    ],
    out: [
      { id: "b1", text: "짐을 줄이고 싶은데 줄어들지 않을 때" },
      { id: "b2", text: "이동 중 아이 상태를 계속 확인해야 할 때" },
      { id: "b3", text: "돌아온 뒤 정리까지 내 몫일 때" },
      { id: "b4", text: "약속 시간에 쫓기는 느낌" },
    ],
    feed: [
      { id: "c1", text: "손이 부족해 동시에 못 할 때" },
      { id: "c2", text: "준비해도 바로 더러워질 때" },
      { id: "c3", text: "남는 시간에 유축·세척이 겹칠 때" },
      { id: "c4", text: "냉장·보관을 매번 확인해야 할 때" },
    ],
    play: [
      { id: "d1", text: "아이는 만족하는데 내 에너지는 바닥일 때" },
      { id: "d2", text: "놀이가 집 안을 더 어지럽힐 때" },
      { id: "d3", text: "밖에서 쉬지 못하고 집이 유일한 놀이터일 때" },
      { id: "d4", text: "스크린 없이 버티기가 빡빡할 때" },
    ],
    hygiene: [
      { id: "e1", text: "빨래·정리·위생이 한 묶음으로 몰릴 때" },
      { id: "e2", text: "용품이 많아질수록 더 헷갈릴 때" },
      { id: "e3", text: "씻기기 전후로 물건을 또 옮겨야 할 때" },
      { id: "e4", text: "답이 나와도 마음이 가벼워지지 않을 때" },
    ],
  };
  return m[pain];
}

/** Q4: 공통 — 지금 가장 덜고 싶은 부담 (우선순위 가중) */
export const Q4_OPTIONS: { id: string; text: string }[] = [
  { id: "burden_time", text: "시간이 쪼개지는 부담" },
  { id: "burden_body", text: "몸이 먼저 말하는 부담" },
  { id: "burden_mind", text: "마음이 쌓이는 부담" },
  { id: "burden_money", text: "지출을 의식하는 부담" },
];

/**
 * Q2+Q3 통합 — 탭 한 번에 장면 선택 (스코어는 기존 q2/q3 id 규칙 유지)
 */
export function getQuickSceneOptions(
  pain: PainMomentId
): { q2: string; q3: string; text: string }[] {
  const m: Record<PainMomentId, { q2: string; q3: string; text: string }[]> = {
    sleep: [
      { q2: "s1", q3: "a1", text: "새벽 돌봄이 이어질 때 · 조용한 시간에 손이 더 바빠지는 느낌" },
      { q2: "s2", q3: "a2", text: "낮잠·밤잠 리듬이 흔들릴 때 · 온도·소음·빛이 같이 신경 쓰일 때" },
      { q2: "s3", q3: "a3", text: "아이는 자는데 내 마음이 안 내려앉을 때 · 내 수면은 기대도 못 할 때" },
      { q2: "s4", q3: "a4", text: "밤 세척·준비로 손이 또 바뀔 때 · 낮과 밤의 기준이 흐려질 때" },
    ],
    out: [
      { q2: "o1", q3: "b1", text: "짐 싸기 전부터 지칠 때 · 짐을 줄이고 싶은데 줄지 않을 때" },
      { q2: "o2", q3: "b2", text: "이동 중 아이가 버틸지 쫄릴 때 · 상태를 계속 확인해야 할 때" },
      { q2: "o3", q3: "b3", text: "도착해서 정리할 힘이 없을 때 · 돌아온 뒤 정리까지 내 몫일 때" },
      { q2: "o4", q3: "b4", text: "날씨·온도 때문에 계획이 바뀔 때 · 약속 시간에 쫓기는 느낌" },
    ],
    feed: [
      { q2: "f1", q3: "c1", text: "젖·분유·유축이 한 줄에 겹칠 때 · 손이 부족해 동시에 못 할 때" },
      { q2: "f2", q3: "c2", text: "이유식·설거지가 동시에 밀릴 때 · 준비해도 바로 더러워질 때" },
      { q2: "f3", q3: "c3", text: "먹는 속도와 내 일정이 안 맞을 때 · 남는 시간에 유축·세척이 겹칠 때" },
      { q2: "f4", q3: "c4", text: "소독·보관을 매번 챙겨야 할 때 · 냉장·보관을 매번 확인해야 할 때" },
    ],
    play: [
      { q2: "p1", q3: "d1", text: "놀아주다 시간만 훅 갈 때 · 아이는 만족하는데 내 에너지는 바닥일 때" },
      { q2: "p2", q3: "d2", text: "같은 놀이 반복에 내가 먼저 지칠 때 · 놀이가 집 안을 더 어지럽힐 때" },
      { q2: "p3", q3: "d3", text: "집안 소음·안전이 같이 신경 쓰일 때 · 밖에서 쉬지 못하고 집이 유일한 놀이터일 때" },
      { q2: "p4", q3: "d4", text: "밖에서 쉬지 못하고 돌아올 때 · 스크린 없이 버티기가 빡빡할 때" },
    ],
    hygiene: [
      { q2: "h1", q3: "e1", text: "빨래가 마르기 전에 또 쌓일 때 · 빨래·정리·위생이 한 묶음으로 몰릴 때" },
      { q2: "h2", q3: "e2", text: "씻기기·기저귀 갈기가 겹칠 때 · 용품이 많아질수록 더 헷갈릴 때" },
      { q2: "h3", q3: "e3", text: "정리해도 금방 어질러질 때 · 씻기기 전후로 물건을 또 옮겨야 할 때" },
      { q2: "h4", q3: "e4", text: "위생용품이 곳곳에 흩어질 때 · 답이 나와도 마음이 가벼워지지 않을 때" },
    ],
  };
  return m[pain];
}

function scoreCategories(a: ConsultationAnswers): Record<CategoryId, number> {
  const base: Record<CategoryId, number> = {
    diaper: 1,
    feed: 1,
    out: 1,
    toy: 1,
    safe: 1,
  };

  const bump = (id: CategoryId, n: number) => {
    base[id] += n;
  };

  switch (a.q1) {
    case "sleep":
      bump("safe", 4);
      bump("feed", 2);
      break;
    case "out":
      bump("out", 5);
      bump("safe", 1);
      break;
    case "feed":
      bump("feed", 5);
      bump("diaper", 1);
      break;
    case "play":
      bump("toy", 4);
      bump("safe", 2);
      break;
    case "hygiene":
      bump("diaper", 4);
      bump("safe", 2);
      break;
    default:
      break;
  }

  if (a.q4 === "burden_time") {
    bump("out", 1);
    bump("feed", 1);
  }
  if (a.q4 === "burden_body") {
    bump("out", 2);
    bump("safe", 1);
  }
  if (a.q4 === "burden_mind") {
    bump("safe", 2);
    bump("toy", 1);
  }
  if (a.q4 === "burden_money") {
    bump("diaper", 1);
    bump("feed", 1);
  }

  /** Q3 장면 보강 (id 접두: a 안전·환경, b 외출, c 수유, d 놀이, e 위생) */
  const head = a.q3.charAt(0);
  if (head === "a") bump("safe", 2);
  else if (head === "b") bump("out", 2);
  else if (head === "c") bump("feed", 2);
  else if (head === "d") bump("toy", 2);
  else if (head === "e") bump("diaper", 2);

  return base;
}

function assignTiers(scores: Record<CategoryId, number>): Record<CategoryId, Tier> {
  const entries = (Object.keys(scores) as CategoryId[]).map((id) => ({ id, s: scores[id] }));
  entries.sort((x, y) => y.s - x.s);
  const tier: Record<CategoryId, Tier> = {
    diaper: "nice",
    feed: "nice",
    out: "nice",
    toy: "nice",
    safe: "nice",
  };
  tier[entries[0].id] = "must";
  tier[entries[1].id] = "must";
  tier[entries[2].id] = "nice";
  tier[entries[3].id] = "nice";
  tier[entries[4].id] = "defer";
  return tier;
}

function buildCopy(a: ConsultationAnswers, tier: Record<CategoryId, Tier>): Omit<ConsultationResult, "updatedAt" | "categoryTier"> {
  const painLabel = Q1_OPTIONS.find((o) => o.id === a.q1)?.text ?? "육아";
  const summary = `맘카페·SNS마다 다른 이야기에 마음이 흔들리지 않도록, 지금은 「${painLabel}」에 에너지가 많이 가는 흐름만 기준으로 잡았어요. 과장 광고나 스폰 후기는 잠깐 접어 두고, 우리 집에 맞는 순서만 볼게요.`;

  const direction =
    a.q4 === "burden_time"
      ? "시간이 잘리는 순간을 줄이는 쪽 — 준비·이동·세척을 한 번에 묶을 수 있는 품목부터 육아용품 탭에서 골라볼게요."
      : a.q4 === "burden_body"
        ? "몸이 먼저 신호를 보내는 순간 — 무게·자세·이동 부담을 덜 수 있는 구성부터 우선 추천할게요."
        : a.q4 === "burden_mind"
          ? "마음이 쌓이는 순간 — 안전·환경·예측 가능한 루틴에 맞는 것만 남기고 나머지는 미룰게요."
          : "지출 부담을 의식하는 순간 — 꼭 당장 살 것과 나중으로 미뤄도 되는 것부터 육아용품 탭에서 나눴어요.";

  const must: CategoryId[] = [];
  const nice: CategoryId[] = [];
  const defer: CategoryId[] = [];
  (Object.keys(tier) as CategoryId[]).forEach((id) => {
    const t = tier[id];
    if (t === "must") must.push(id);
    else if (t === "nice") nice.push(id);
    else defer.push(id);
  });

  const oneLiner = `난립 정보 대신 지금 우리 집 니즈에 맞춰 ${must.map((id) => CAT_LABEL[id]).join(", ")}를 먼저 보고, 나머지는 천천히 가져가도 괜찮아요.`;

  return {
    summary,
    direction,
    mustCategories: must.map((id) => ({ id, label: CAT_LABEL[id] })),
    niceCategories: nice.map((id) => ({ id, label: CAT_LABEL[id] })),
    deferCategories: defer.map((id) => ({ id, label: CAT_LABEL[id] })),
    oneLiner,
  };
}

export function computeConsultationResult(answers: ConsultationAnswers): ConsultationResult {
  const scores = scoreCategories(answers);
  const categoryTier = assignTiers(scores);
  const body = buildCopy(answers, categoryTier);
  return {
    updatedAt: Date.now(),
    categoryTier,
    ...body,
  };
}

export function loadConsultationResult(): ConsultationResult | null {
  try {
    const raw = localStorage.getItem(CONSULTATION_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<ConsultationResult>;
    if (!o.summary || !o.categoryTier || !o.oneLiner) return null;
    return o as ConsultationResult;
  } catch {
    return null;
  }
}

export function saveConsultationResult(r: ConsultationResult) {
  try {
    localStorage.setItem(CONSULTATION_STORAGE_KEY, JSON.stringify(r));
    window.dispatchEvent(new CustomEvent("momoA-consultation-changed"));
  } catch {
    /* ignore */
  }
}

export function clearConsultationResult() {
  try {
    localStorage.removeItem(CONSULTATION_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("momoA-consultation-changed"));
  } catch {
    /* ignore */
  }
}
