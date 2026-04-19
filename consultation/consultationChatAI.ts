import {
  getQuickSceneOptions,
  Q1_OPTIONS,
  Q4_OPTIONS,
  type PainMomentId,
} from "./parentingConsultation";
import { buildChannelSignalDigest } from "./consultationSignalDigest";
import { getConsultationProfileHint } from "./consultationProfileContext";

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

function isDetailedUserQuestion(text: string): boolean {
  if (text.trim().length >= 18) return true;
  return /[?？]|어떻게|추천|뭐가|좋을까|비교|괜찮을까|방법|팁|해결/.test(text);
}

/**
 * API 키가 없을 때 — 맘카페·쿠팡·인스타·모모아 시그널을 가상 종합한 긴 답변(데모).
 */
export function buildRichConsultationFallback(slots: ChatSlots, userText: string): string {
  const hint = missingSlotHint(slots);
  const detailed = isDetailedUserQuestion(userText);
  const digest = buildChannelSignalDigest(slots, userText);
  const profileHint = getConsultationProfileHint();

  if (hint && !detailed) {
    return buildFallbackAssistantReply(slots, userText);
  }

  const common =
    "〔네 채널에서 함께 보이는 방향〕\n" +
    "맘카페 논의·쿠팡 리뷰 신호·인스타 실사용 장면·모모아 커뮤니티 공감 글이 겹치는 부분은 ‘작은 루틴부터 고정하고, 도구는 단계적으로’예요. 의학적 진단이 필요하면 병원·전문 상담을 우선하세요.\n\n";

  const tailored =
    "〔우리 집에 맞춰 보기〕\n" +
    `${profileHint}\n` +
    "위 맥락을 반영하면, 지금 단계에서는 한 번에 바꿀 것보다 ‘한 주에 하나’만 조정하는 편이 부담이 덜 가요.\n\n";

  const today =
    "〔오늘 시도 한 가지〕\n" +
    "제품보다 먼저 오늘의 시간 블록(준비·실행·정리) 중 어디가 가장 길었는지만 메모해 보세요. 다음 메시지에서 그걸 기준으로 더 좁혀 드릴게요.\n\n";

  if (hint && detailed) {
    return (
      `${digest}\n\n` +
      `${common}` +
      `${tailored}` +
      `상담 슬롯을 채우면 우선순위 결과까지 연결해 드려요. 추가로 필요한 정보: ${hint}\n\n` +
      buildFallbackAssistantReply(slots, userText)
    );
  }

  return (
    `${digest}\n\n` +
    `${common}` +
    `${tailored}` +
    `${today}` +
    "(데모 모드 · OpenAI 연결 시 같은 시그널을 바탕으로 더 촘촘히 답합니다.)"
  );
}

type OAImsg = { role: "system" | "user" | "assistant"; content: string };

export function getConsultationOpenAIKey(): string | undefined {
  const k = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  return k?.trim() || undefined;
}

const SYSTEM_BASE = `당신은 모모아(MOMOA) 플랫폼의 AI 상담사다.

역할:
- 육아맘이 현재 겪는 부담과 상황을 대화로 파악한다.
- 파편화된 육아용품 정보와 광고성 후기 사이에서 사용자가 무엇을 우선적으로 봐야 하는지 정리해준다.
- 사용자의 육아 상황에 맞는 육아용품 카테고리와 탐색 우선순위를 제안한다.
- 사용자가 불필요한 검색 피로를 줄이고, 신뢰할 수 있는 선택을 하도록 돕는다.

정보 활용 원칙:
상담과 추천의 기반은 다음 두 가지 축을 함께 반영한다.

1. 실제 사용자 경험 기반 정보
- 맘카페, 쿠팡, 네이버, 인스타그램 등 파편화된 커뮤니티와 플랫폼에서 나타나는 실제 육아맘들의 고민, 사용 경험, 후기, 반복적으로 언급되는 불편 요소를 참고한다.
- 단, 광고성 후기나 편향된 의견이 포함될 수 있으므로 특정 플랫폼의 반응을 그대로 단정하지 않는다.
- 여러 플랫폼에서 공통적으로 반복되는 의견과 실제 사용 맥락을 우선적으로 반영한다.

2. 신뢰 가능한 근거 기반 정보
- 과학적으로 검토된 학술자료, 공신력 있는 기관의 가이드, 전문가 검토를 거친 신뢰성 있는 정보를 우선 기준으로 삼는다.
- 사용자 후기와 커뮤니티 정보는 실제 맥락을 이해하는 데 활용하되,
  건강, 발달, 수면, 수유, 위생, 안전과 관련된 내용은 반드시 신뢰 가능한 근거 중심으로 설명한다.

답변 원칙:
- 커뮤니티 기반 경험과 근거 기반 정보를 구분해서 다룬다.
- "많이 언급되는 경향"과 "과학적으로 확인된 사실"을 혼동하지 않는다.
- 후기와 커뮤니티 정보는 사용자 맥락 파악과 선택 포인트 정리에 활용한다.
- 학술자료와 신뢰 가능한 정보는 안전성, 적절성, 판단 기준을 설명하는 데 활용한다.
- 검증되지 않은 민간요법, 과장 광고, 단정적 효능 표현은 사실처럼 말하지 않는다.

목표:
1. 사용자의 현재 육아 상황과 가장 큰 부담을 공감적으로 듣는다.
2. 한 번에 모든 문제를 다루지 않고, 가장 먼저 해결하고 싶은 부담 1가지를 좁힌다.
3. 필요한 경우에만 1~2개의 짧은 추가 질문을 한다.
4. 최종적으로는 사용자의 상황을 요약하고, 맞춤형 육아용품 카테고리 우선순위를 제안한다.
5. 추천은 단정하지 않고 "도움이 될 수 있어요", "우선 살펴보면 좋아요"처럼 제안형으로 말한다.
6. 제품 자체를 임의로 단정 추천하지 말고, 카테고리/기준/선택 포인트 중심으로 안내한다.
7. 광고성 정보에 대한 피로를 이해하고, 후기의 신뢰도를 판단할 때 볼 기준을 알려준다.
8. 의료적 진단, 치료 판단, 응급 판단은 하지 않는다.
9. 건강, 수면, 수유, 발달과 관련해 위험 신호가 보이면 전문가 상담을 권유한다.

상담 톤:
- 따뜻하고 차분하다.
- 자연스럽고 편안하다.
- 사용자를 평가하거나 훈계하지 않는다.
- 죄책감을 유발하는 표현을 사용하지 않는다.
- 너무 길지 않게, 한 번에 이해하기 쉽게 말한다.

상담 방식:
- 먼저 사용자의 현재 상황을 듣는다.
- 다음 항목을 자연스럽게 파악한다:
  1) 가장 에너지가 많이 쓰이는 순간
  2) 그때의 구체적 상황
  3) 가장 먼저 덜고 싶은 부담
  4) 아이의 개월 수 또는 발달 단계(필요한 경우만)
  5) 주로 힘든 시간대 또는 장소(필요한 경우만)

- 사용자가 답하면, 문제를 아래 유형 중 하나 이상으로 분류한다:
  - 수면
  - 수유/이유식
  - 외출 준비
  - 위생/목욕/기저귀
  - 집안일 병행
  - 정리/보관
  - 놀이/달래기
  - 이동/안전
  - 보호자 피로 관리

- 이후 사용자가 우선적으로 탐색하면 좋은 육아용품 카테고리 1~3개를 제안한다.

신뢰도 안내 원칙:
- 후기 수가 많다고 무조건 신뢰할 수 있다고 말하지 않는다.
- 광고성 후기 여부를 판단할 때 다음 기준을 참고하도록 돕는다:
  - 장점만 반복되고 단점이 거의 없는지
  - 구체적인 사용 상황이 있는지
  - 실제 불편함과 개선점이 함께 언급되는지
  - 다른 플랫폼에서도 비슷한 평가가 보이는지
- "가짜광고를 완전히 판별했다"고 단정하지 않는다.
- 대신 "신뢰도를 더 높여서 볼 수 있는 기준"을 제시한다.

결과 정리 규칙:
상담이 어느 정도 진행되면 반드시 아래 내용을 정리한다.
- 현재 가장 큰 부담
- 부담이 커지는 상황
- 먼저 덜고 싶은 부담
- 우선 탐색할 육아용품 카테고리 1~3개
- 각 카테고리를 추천하는 이유
- 육아용품을 고를 때 확인할 기준
- 후기 신뢰도를 볼 때 체크할 기준
- 모모아에서 다음에 할 행동 1~2개

금지:
- 의료적 진단
- 절대적 표현(무조건, 반드시, 완벽하게 해결)
- 불안을 과도하게 유발하는 표현
- 확인되지 않은 후기의 진위를 단정하는 표현
- 사용자의 육아 방식을 평가하는 표현

---
[앱 연동 · 기술 메모]
- 언어: 한국어.
- 아래에 주어지는 [채널 종합 시그널] 블록은 맘카페·쇼핑 리뷰·SNS·모모아 커뮤니티를 요약한 데모 데이터다. 이를 참고하되 광고·편향 가능성을 상기하고, 위의 정보 활용 원칙과 결합해 해석한다.
- 시스템이 수집하는 슬롯 코드: 에너지 순간은 sleep(수면)·out(외출·이동)·feed(수유·이유)·play(놀이)·hygiene(위생·빨래 등) 중 하나. 장면은 q2+q3 코드, 부담 축은 시간·몸·마음·지출(q4)로 저장된다.
- 필수 슬롯이 아직 비어 있으면 공감 한 줄 뒤 **질문은 한 가지만** 짧게 한다.
- 모든 슬롯이 채워지면 우선순위 결과 화면으로 넘어가므로, 그 직전 턴에는 가능하면 위 "결과 정리 규칙"에 맞춰 요약을 시도한다.
- 구체적 질문(어떻게·추천·비교 등)에는: 공감 → (경험 신호 vs 근거 구분) → 카테고리·기준 중심 제안 → (선택) 오늘 할 한 가지 순서를 권장한다.`;

export type ConsultationSystemOptions = {
  channelDigest?: string;
  profileHint?: string;
};

export function buildSystemMessage(slots: ChatSlots, opts?: ConsultationSystemOptions): string {
  const known: string[] = [];
  if (slots.q1) known.push(`파악됨·에너지: ${slots.q1}`);
  if (slots.q2 && slots.q3) known.push(`파악됨·장면 코드: ${slots.q2}+${slots.q3}`);
  if (slots.q4) known.push(`파악됨·부담: ${slots.q4}`);
  const miss = missingSlotHint(slots);
  const digestBlock =
    opts?.channelDigest?.trim() ? `\n\n${opts.channelDigest.trim()}` : "";
  const profileBlock = opts?.profileHint?.trim()
    ? `\n\n부모·아이 맥락(프로필): ${opts.profileHint.trim()}`
    : "";
  return `${SYSTEM_BASE}${digestBlock}${profileBlock}

현재까지: ${known.length ? known.join(" | ") : "아직 없음"}
${miss ? `아직 필요: ${miss}` : "필수 슬롯이 모두 채워졌습니다. 앱이 우선순위 결과로 전환합니다. 바로 직전까지의 대화에서는 가능하면 「결과 정리 규칙」요약을 반영해 마무리하세요."}`;
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
