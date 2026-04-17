import {
  getQuickSceneOptions,
  Q1_OPTIONS,
  Q4_OPTIONS,
  type PainMomentId,
} from "./parentingConsultation";

/** 챗봇 상담에서 파악 중인 슬롯 (q2·q3는 장면 한 묶음) */
export type ChatSlots = {
  q1?: PainMomentId;
  q2?: string;
  q3?: string;
  q4?: string;
};

const Q1_KEYWORDS: Record<PainMomentId, string[]> = {
  sleep: ["잠", "수면", "밤", "새벽", "낮잠", "밤잠", "재우", "울음", "쿨쿨", "코", "잠들"],
  out: ["외출", "이동", "나들이", "짐", "유모차", "차 ", "차타", "나가", "이동할"],
  feed: ["수유", "분유", "이유식", "젖", "먹이", "유축", "젖병", "흘리", "설거지", "소독"],
  play: ["놀이", "놀아", "장난감", "책 ", "놀아주", "심심"],
  hygiene: ["빨래", "기저귀", "씻", "위생", "정리", "어지러", "치우"],
};

const Q4_KEYWORDS: Record<string, string[]> = {
  burden_time: ["시간", "바쁘", "쪼개", "부족", "동시", "쫓기", "빠듯", "여유"],
  burden_body: ["몸", "허리", "어깨", "피곤", "체력", "무거", "힘들", "육체"],
  burden_mind: ["마음", "불안", "스트레스", "초조", "신경", "멘탈", "걱정"],
  burden_money: ["돈", "비용", "지출", "가격", "부담스럽", "비싸", "아끼", "절약"],
};

function scoreKeywords(text: string, keywords: string[]): number {
  let s = 0;
  const lower = text;
  for (const k of keywords) {
    if (lower.includes(k)) s += k.length >= 2 ? 2 : 1;
  }
  return s;
}

export function inferQ1(text: string): PainMomentId | null {
  let best: PainMomentId | null = null;
  let bestScore = 0;
  (Object.keys(Q1_KEYWORDS) as PainMomentId[]).forEach((id) => {
    const sc = scoreKeywords(text, Q1_KEYWORDS[id]);
    if (sc > bestScore) {
      bestScore = sc;
      best = id;
    }
  });
  if (bestScore >= 2 && best) return best;
  for (const o of Q1_OPTIONS) {
    if (text.includes(o.text.slice(0, Math.min(5, o.text.length)))) return o.id;
  }
  return null;
}

function tokenOverlapScore(userText: string, optionText: string): number {
  const parts = optionText.split(/[·,\s]+/).filter((p) => p.length > 1);
  let sc = 0;
  for (const p of parts) {
    if (userText.includes(p)) sc += 3;
  }
  if (optionText.length > 8 && userText.includes(optionText.slice(0, 12))) sc += 6;
  return sc;
}

export function inferScene(
  text: string,
  q1: PainMomentId
): { q2: string; q3: string } | null {
  const opts = getQuickSceneOptions(q1);
  let best: { q2: string; q3: string } | null = null;
  let bestScore = 0;
  for (const o of opts) {
    const sc = tokenOverlapScore(text, o.text);
    if (sc > bestScore) {
      bestScore = sc;
      best = { q2: o.q2, q3: o.q3 };
    }
  }
  if (bestScore < 2) return null;
  return best;
}

export function inferQ4(text: string): string | null {
  let best: string | null = null;
  let bestScore = 0;
  for (const o of Q4_OPTIONS) {
    const sc = scoreKeywords(text, Q4_KEYWORDS[o.id] ?? []) + (text.includes(o.text.slice(0, 3)) ? 3 : 0);
    if (sc > bestScore) {
      bestScore = sc;
      best = o.id;
    }
  }
  if (bestScore < 2) {
    for (const o of Q4_OPTIONS) {
      const compact = o.text.replace(/\s+/g, "");
      if (compact.length >= 4 && text.includes(compact.slice(0, 4))) return o.id;
    }
    return null;
  }
  return best;
}

/** 한 번의 사용자 발화로 슬롯을 순서대로 채움 (이미 채워진 값은 유지) */
export function mergeSlotsFromText(text: string, slots: ChatSlots): ChatSlots {
  const next: ChatSlots = { ...slots };
  if (!next.q1) {
    const q1 = inferQ1(text);
    if (q1) next.q1 = q1;
  }
  if (next.q1 && (!next.q2 || !next.q3)) {
    const scene = inferScene(text, next.q1);
    if (scene) {
      next.q2 = scene.q2;
      next.q3 = scene.q3;
    }
  }
  if (next.q1 && next.q2 && next.q3 && !next.q4) {
    const q4 = inferQ4(text);
    if (q4) next.q4 = q4;
  }
  return next;
}

export function slotsComplete(s: ChatSlots): s is Required<ChatSlots> {
  return Boolean(s.q1 && s.q2 && s.q3 && s.q4);
}

export function missingSlotHint(slots: ChatSlots): string {
  if (!slots.q1) return "에너지가 가장 많이 쓰이는 순간(수면·외출·수유·놀이·위생 중 어디에 가까운지)";
  if (!slots.q2 || !slots.q3) return "그때 가장 가까운 구체적 장면";
  if (!slots.q4) return "지금 가장 먼저 덜고 싶은 부담(시간·몸·마음·지출 중 무엇에 가까운지)";
  return "";
}

export function buildFallbackAssistantReply(slots: ChatSlots, lastUserText: string): string {
  const hint = missingSlotHint(slots);
  if (!hint) {
    return "알려주신 내용을 바탕으로 우선순위를 정리할게요.";
  }
  if (!slots.q1) {
    return `말씀해 주셔서 고마워요. "${lastUserText.slice(0, 40)}${lastUserText.length > 40 ? "…" : ""}"에서 어떤 순간이 가장 에너지를 많이 쓰는지 조금만 더 알려주실 수 있을까요?\n\n예: 밤잠·새벽 돌봄, 외출·이동 준비, 수유·이유식, 놀이, 빨래·위생 중 가까운 쪽이면 돼요.`;
  }
  if (!slots.q2 || !slots.q3) {
    return `그때 상황을 한 가지로만 짚어 주세요. 예를 들어 "${Q1_OPTIONS.find((o) => o.id === slots.q1)?.text}"일 때 어떤 장면이 가장 가까우신가요? 아래 추천 중에서 고르거나, 비슷한 말로 적어 주셔도 돼요.`;
  }
  if (!slots.q4) {
    return "지금 가장 먼저 덜고 싶은 건 무엇에 가까우세요? 시간이 잘리는 부담, 몸의 피로, 마음의 무게, 지출 부담 중에서요. 편하게 한 줄만 적어 주세요.";
  }
  return "정리할게요!";
}

type OAImsg = { role: "system" | "user" | "assistant"; content: string };

export function getConsultationOpenAIKey(): string | undefined {
  const k = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  return k?.trim() || undefined;
}

const SYSTEM_BASE = `당신은 MOMOA 앱의 육아용품 우선순위 상담 AI입니다.
한국어로 짧고 따뜻하게(2~5문장)만 답하세요. 의학적 진단이나 단정적 처방은 하지 마세요.
부모의 상황에 공감하고, 아래 정보가 부족하면 한 가지만 물어보세요.

상담에 필요한 정보:
1) 에너지가 가장 많이 쓰이는 때 — 수면·외출·수유·놀이·위생 중 어디에 가까운지
2) 그때의 구체적 장면
3) 지금 가장 먼저 덜고 싶은 부담 — 시간 / 몸 / 마음 / 지출 중 무엇에 가까운지`;

export function buildSystemMessage(slots: ChatSlots): string {
  const known: string[] = [];
  if (slots.q1) known.push(`파악됨·에너지: ${slots.q1}`);
  if (slots.q2 && slots.q3) known.push(`파악됨·장면 코드: ${slots.q2}+${slots.q3}`);
  if (slots.q4) known.push(`파악됨·부담: ${slots.q4}`);
  const miss = missingSlotHint(slots);
  return `${SYSTEM_BASE}

현재까지: ${known.length ? known.join(" | ") : "아직 없음"}
${miss ? `아직 필요: ${miss}` : "모든 항목이 채워졌습니다. 곧 정리해 드린다고 안내하세요."}`;
}

/** OpenAI Chat Completions 스트리밍 (브라우저). 실패 시 throw */
export async function streamOpenAIConsultationReply(
  apiKey: string,
  messages: OAImsg[],
  onDelta: (chunk: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      stream: true,
      temperature: 0.7,
      messages,
    }),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(errText || `OpenAI HTTP ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const dec = new TextDecoder();
  let full = "";
  let lineBuf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    lineBuf += dec.decode(value, { stream: true });
    const lines = lineBuf.split("\n");
    lineBuf = lines.pop() ?? "";
    for (const raw of lines) {
      const t = raw.trim();
      if (!t.startsWith("data: ")) continue;
      const data = t.slice(6);
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
        };
        const c = json.choices?.[0]?.delta?.content;
        if (c) {
          full += c;
          onDelta(c);
        }
      } catch {
        /* skip malformed */
      }
    }
  }

  return full;
}
