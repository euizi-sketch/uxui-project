import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ChatMsg = { role: "bot" | "user"; text: string };
import {
  Q1_OPTIONS,
  Q4_OPTIONS,
  computeConsultationResult,
  getQuickSceneOptions,
  loadConsultationResult,
  saveConsultationResult,
  clearConsultationResult,
  type ConsultationAnswers,
  type ConsultationResult,
  type PainMomentId,
} from "../../consultation/parentingConsultation";
import {
  buildRichConsultationFallback,
  buildSystemMessage,
  getConsultationOpenAIKey,
  mergeSlotsFromText,
  slotsComplete,
  streamOpenAIConsultationReply,
  type ChatSlots,
} from "../../consultation/consultationChatAI";
import { buildChannelSignalDigest } from "../../consultation/consultationSignalDigest";
import { getConsultationProfileHint } from "../../consultation/consultationProfileContext";

type Step = "intro" | "chooseMode" | "chat" | 1 | "scene" | 4 | "result";

const TOTAL_STEPS = 3;

const stepProgressIndex = (s: Step): number => {
  if (s === "intro" || s === "result" || s === "chooseMode") return 0;
  if (s === "chat") return 1;
  if (s === 1) return 1;
  if (s === "scene") return 2;
  if (s === 4) return 3;
  return 0;
};

const pillChoiceLight =
  "w-full rounded-2xl border border-[#FFD2BF]/50 bg-white px-4 py-3.5 text-left text-[13px] font-medium leading-snug text-slate-800 shadow-sm transition hover:border-[#FFB089] hover:bg-[#FFFCF9] hover:shadow-md active:scale-[0.99] sm:py-4 sm:text-sm";

const modePickCard =
  "flex w-full flex-col gap-1 rounded-2xl border border-[#FFD2BF]/70 bg-white/95 px-4 py-4 text-left shadow-[0_4px_20px_-8px_rgba(15,23,42,0.06)] ring-1 ring-[#FFD2BF]/30 transition hover:border-[#FFB089] hover:bg-[#FFFCF9] hover:shadow-md active:scale-[0.99] sm:px-5 sm:py-5";

const brandDisplay = {
  fontFamily: '"GeekbleMalang2", "Pretendard Variable", system-ui, sans-serif',
} as const;

const AI_WELCOME_MESSAGE =
  "안녕하세요, 모모아 AI 상담사예요 :)\n지금 필요한 육아템을 함께 정리해볼게요.\n\n" +
  "하루 중 가장 버겁게 느껴지는 순간이 언제인지,\n그때 어떤 점이 특히 힘든지,\n먼저 줄이고 싶은 부담이 무엇인지 편하게 말씀해주세요.\n\n" +
  "추천 문구를 눌러 시작하셔도 되고, 직접 적어주셔도 돼요.";

/** 트렌디한 미니멀 아바타 — 텍스트 배지 대신 스파클 아이콘 */
function ConsultAssistantAvatar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 shadow-[0_8px_24px_-6px_rgba(251,146,60,0.55)] ring-[2.5px] ring-white/95 ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[1.35rem] w-[1.35rem] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        <path d="M20 3v4M22 5h-4M4 17v2M5 18H3" opacity="0.9" />
      </svg>
    </div>
  );
}

function ChatMessageBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end pl-10">
        <div
          className="relative max-w-[90%] rounded-[1.2rem] rounded-br-md bg-gradient-to-br from-[#FF853E] to-[#FF6B2C] px-4 py-3 text-[13px] font-semibold leading-relaxed text-white shadow-[0_8px_24px_-6px_rgba(234,88,32,0.55)] ring-1 ring-white/25"
        >
          <p className="whitespace-pre-wrap">{msg.text}</p>
        </div>
      </div>
    );
  }

  const paragraphs = msg.text.split(/\n\n+/).filter(Boolean);
  return (
    <div className="flex justify-start gap-2.5 sm:gap-3">
      <ConsultAssistantAvatar />
      <div className="min-w-0 max-w-[min(100%,18.5rem)] flex-1 sm:max-w-[20rem]">
        <p className="mb-1 pl-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#E85A20]">
          모모아 AI 상담
        </p>
        <div className="rounded-[1.2rem] rounded-tl-sm border border-orange-100/90 bg-gradient-to-b from-white via-[#FFFCF9] to-[#FFF3E8] px-4 py-3.5 shadow-[0_12px_40px_-14px_rgba(251,146,60,0.55)]">
          <div className="space-y-2.5">
            {paragraphs.map((para, i) => (
              <p key={i} className="whitespace-pre-line text-[13px] font-medium leading-relaxed text-slate-800">
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StreamingBotBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start gap-2.5 sm:gap-3">
      <ConsultAssistantAvatar />
      <div className="min-w-0 flex-1">
        <p className="mb-1 pl-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#E85A20]">
          모모아 AI 상담
        </p>
        <div className="rounded-[1.2rem] rounded-tl-sm border border-orange-100/90 bg-gradient-to-b from-white via-[#FFFCF9] to-[#FFF3E8] px-4 py-3.5 shadow-[0_12px_40px_-14px_rgba(251,146,60,0.55)]">
          <p className="text-[13px] font-medium leading-relaxed text-slate-800">
            {text}
            <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse rounded-full bg-[#FF853E]" aria-hidden />
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ParentingConsultation3Min() {
  const [saved, setSaved] = useState<ConsultationResult | null>(() => loadConsultationResult());
  const [step, setStep] = useState<Step>(() => (loadConsultationResult() ? "result" : "intro"));

  const isConsultationActive = step !== "intro";

  useEffect(() => {
    if (!isConsultationActive) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isConsultationActive]);
  const [q1, setQ1] = useState<PainMomentId | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatSlots, setChatSlots] = useState<ChatSlots>({});
  const [chatInput, setChatInput] = useState("");
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const chatAbortRef = useRef<AbortController | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const sceneList = useMemo(() => (q1 ? getQuickSceneOptions(q1) : []), [q1]);
  const chatSceneList = useMemo(
    () => (chatSlots.q1 ? getQuickSceneOptions(chatSlots.q1) : []),
    [chatSlots.q1]
  );

  const progressNum = useMemo(() => {
    if (step === "chat") {
      if (chatSlots.q1 && chatSlots.q2 && chatSlots.q3 && chatSlots.q4) return 3;
      if (chatSlots.q1 && chatSlots.q2 && chatSlots.q3) return 2;
      if (chatSlots.q1) return 1;
      return 0;
    }
    return stepProgressIndex(step);
  }, [step, chatSlots]);

  const resetFlow = () => {
    setQ1(null);
    setQ2(null);
    setQ3(null);
    setChatMessages([]);
    setChatSlots({});
    setChatInput("");
    setStreamingText(null);
    setStep("intro");
  };

  const startSurveyFlow = () => {
    setQ1(null);
    setQ2(null);
    setQ3(null);
    setChatMessages([]);
    setChatSlots({});
    setChatInput("");
    setStep(1);
  };

  const startChatFlow = () => {
    setQ1(null);
    setQ2(null);
    setQ3(null);
    setChatSlots({});
    setChatInput("");
    setStreamingText(null);
    setChatMessages([{ role: "bot", text: AI_WELCOME_MESSAGE }]);
    setStep("chat");
  };

  const applyResult = useCallback((answers: ConsultationAnswers) => {
    const r = computeConsultationResult(answers);
    saveConsultationResult(r);
    setSaved(r);
    setStep("result");
  }, []);

  const sendChatMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || step !== "chat" || isSending) return;
      chatAbortRef.current?.abort();
      chatAbortRef.current = new AbortController();
      setIsSending(true);
      setChatInput("");

      const userMsg: ChatMsg = { role: "user", text };
      const merged = mergeSlotsFromText(text, chatSlots);
      setChatSlots(merged);
      const nextMessages = [...chatMessages, userMsg];
      setChatMessages(nextMessages);

      if (slotsComplete(merged)) {
        setChatMessages([
          ...nextMessages,
          {
            role: "bot",
            text: "맘카페·쿠팡·인스타·모모아에서 모은 신호를 반영해 우선순위를 정리했어요!",
          },
        ]);
        applyResult({
          q1: merged.q1,
          q2: merged.q2,
          q3: merged.q3,
          q4: merged.q4,
        });
        setIsSending(false);
        return;
      }

      const historyForApi = nextMessages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));

      const apiKey = getConsultationOpenAIKey();
      const channelDigest = buildChannelSignalDigest(merged, text);
      const profileHint = getConsultationProfileHint();
      const systemContent = buildSystemMessage(merged, { channelDigest, profileHint });

      try {
        if (apiKey) {
          setStreamingText("");
          const full = await streamOpenAIConsultationReply(
            apiKey,
            [{ role: "system", content: systemContent }, ...historyForApi],
            (chunk) => setStreamingText((prev) => (prev ?? "") + chunk),
            chatAbortRef.current.signal
          );
          setStreamingText(null);
          const botText = full.trim() || buildRichConsultationFallback(merged, text);
          setChatMessages((prev) => [...prev, { role: "bot", text: botText }]);
        } else {
          const reply = buildRichConsultationFallback(merged, text);
          setChatMessages((prev) => [...prev, { role: "bot", text: reply }]);
        }
      } catch {
        setStreamingText(null);
        const reply = buildRichConsultationFallback(merged, text);
        setChatMessages((prev) => [...prev, { role: "bot", text: reply }]);
      } finally {
        setIsSending(false);
      }
    },
    [step, isSending, chatSlots, chatMessages, applyResult]
  );

  useEffect(() => {
    if (step !== "chat") return;
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [step, chatMessages, streamingText]);

  const clearAndRestart = () => {
    clearConsultationResult();
    setSaved(null);
    resetFlow();
  };

  /** 설문·챗 진행 중 → 상담 방식 선택으로 (상태 초기화) */
  const goBackToChooseMode = useCallback(() => {
    chatAbortRef.current?.abort();
    setChatMessages([]);
    setChatSlots({});
    setChatInput("");
    setStreamingText(null);
    setQ1(null);
    setQ2(null);
    setQ3(null);
    setStep("chooseMode");
  }, []);

  const showProgress = step === "chat" || step === 1 || step === "scene" || step === 4;

  return (
    <section className={step === "intro" ? "mb-8" : ""} aria-label="3분 AI 육아용품 우선순위 상담">
      {/* ——— 진입: 육아 플랫폼 무드 — 부드럽고 귀엽게, 포인트는 또렷하게 ——— */}
      {step === "intro" && (
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#FFF7F0]">
          <div className="pointer-events-none absolute -left-16 top-8 h-44 w-44 rounded-full bg-[#FF853E]/18 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -right-10 bottom-4 h-40 w-40 rounded-full bg-[#FFB089]/35 blur-3xl" aria-hidden />
          <div className="relative px-5 pb-8 pt-7 sm:px-8 sm:pb-10 sm:pt-9">
            <span
              className="inline-flex items-center gap-1 rounded-full bg-[#FFF1EA] px-3.5 py-2 text-[12px] font-bold tracking-tight text-[#FF853E] ring-2 ring-[#FF853E]/35 shadow-[0_4px_14px_-4px_rgba(255,107,61,0.45)] sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-[14px]"
              style={brandDisplay}
            >
              3분
              <span className="font-black tracking-tight text-sky-600">
                AI
              </span>
              상담
            </span>

            <div className="mt-5 flex items-start gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold leading-snug tracking-wide text-slate-500 sm:text-[12px] sm:text-slate-600">
                  우리 집 맞춤 육아템
                </p>
                <h2 className="mt-1 text-[1.05rem] font-bold leading-[1.38] tracking-tight text-slate-900 sm:text-[1.2rem] sm:leading-[1.34]">
                  복잡한 정보는
                  <br />
                  잠깐 멈추고,
                  <br />
                  <span className="inline-block text-[1.1rem] leading-[1.36] sm:text-[1.28rem] sm:leading-[1.32]">
                    <span className="text-[#FF853E]">
                      지금 필요한 정보
                    </span>
                    만 골라볼까요?
                  </span>
                </h2>
              </div>
              <img
                src="/hero/consultation-baby-hug.png?v=hairorig"
                alt=""
                className="h-32 w-32 shrink-0 object-contain [filter:drop-shadow(0_3px_14px_rgba(255,133,62,0.22))] sm:h-36 sm:w-36"
                width={144}
                height={144}
                decoding="async"
              />
            </div>

            <p className="mt-4 w-full text-[11px] font-medium leading-[1.63] text-slate-600 sm:text-[12px] sm:leading-[1.67]">
              바쁜데.. 넘쳐나는 후기와 광고! 뭘 사야할지 모르겠다면,
              <br />
              지금 우리 아이에게 필요한 육아용품부터 먼저 찾아볼까요?
            </p>

            <button
              type="button"
              onClick={() => setStep("chooseMode")}
              style={brandDisplay}
              className="mt-8 flex w-full items-center justify-center rounded-full bg-[#FF853E] py-4 text-[17px] font-light leading-tight text-white shadow-[0_12px_36px_-10px_rgba(255,133,62,0.55)] ring-2 ring-[#FFB089]/50 transition hover:brightness-[1.03] active:scale-[0.99] sm:py-[1.125rem] sm:text-[19px]"
            >
              상담 시작하기
            </button>
            {saved && (
              <button
                type="button"
                onClick={() => setStep("result")}
                className="mt-3 w-full rounded-full border-2 border-[#FFD2BF] bg-white py-3 text-[13px] font-bold text-[#E85A20] shadow-sm transition hover:bg-[#FFFCF9] sm:py-3.5 sm:text-sm"
              >
                지난 결과 다시 보기
              </button>
            )}
          </div>
        </div>
      )}

      {/* 상담 방식 선택: 이전 단계와 겹치는 이중 배경 제거 → 단일 레이어 전체 화면 */}
      {isConsultationActive && step === "chooseMode" && (
        <div
          className="fixed left-1/2 z-[35] flex w-full max-w-[430px] -translate-x-1/2 flex-col rounded-t-none bg-[#FF853E] px-3 pb-0 pt-3 top-[calc(env(safe-area-inset-top,0px)+5rem)] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))]"
          role="dialog"
          aria-modal="true"
          aria-label="상담 방식 선택"
        >
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-xl bg-[#FFF8F5]">
            <header className="relative z-[1] flex shrink-0 items-center gap-2 border-b border-[#FFD2BF]/70 bg-[#FFF8F5] px-3 py-2.5 sm:px-4">
              <button
                type="button"
                onClick={() => setStep("intro")}
                className="inline-flex h-10 shrink-0 items-center gap-0.5 rounded-xl px-1.5 text-slate-800 hover:bg-white/90 active:scale-[0.98]"
                aria-label="상담 소개 화면으로 돌아가기"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                </svg>
                <span className="pr-1 text-[15px] font-bold">이전</span>
              </button>
              <p className="min-w-0 flex-1 px-2 text-center text-[15px] font-bold leading-snug text-slate-900 line-clamp-2">
                상담 방식 선택
              </p>
              <span className="h-10 w-10 shrink-0" aria-hidden />
            </header>
            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pt-5 sm:px-8 sm:pb-10 sm:pt-7">
              <h2 className="text-[1.08rem] font-bold leading-snug text-slate-900 sm:text-[1.22rem]">어떻게 진행할까요?</h2>
              <p className="mt-2 text-[12px] font-medium leading-relaxed text-slate-600 sm:text-[13px]">
                챗봇은 대화형으로, 설문은 버튼만 빠르게 골라요. 결과는 같아요.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <button type="button" onClick={startChatFlow} className={modePickCard}>
                  <span className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                    <span className="text-xl" aria-hidden>
                      💬
                    </span>
                    챗봇으로 상담
                  </span>
                  <span className="text-[12px] font-medium leading-snug text-slate-600">
                    질문에 맞춰 메시지로 안내해요. 답은 터치로 고르기만 하면 돼요.
                  </span>
                </button>
                <button type="button" onClick={startSurveyFlow} className={modePickCard}>
                  <span className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                    <span className="text-xl" aria-hidden>
                      📋
                    </span>
                    설문으로 상담
                  </span>
                  <span className="text-[12px] font-medium leading-snug text-slate-600">
                    STEP 1~3만 골라요. 지금 화면과 같은 방식이에요.
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ——— 질문 진행 (3단계) · 챗봇 · 결과 ——— */}
      {isConsultationActive && step !== "chooseMode" && (
        <div
          className="fixed left-1/2 z-[35] flex w-full max-w-[430px] -translate-x-1/2 flex-col rounded-t-2xl bg-[#FF853E] px-3 pb-0 pt-3 top-[calc(env(safe-area-inset-top,0px)+5rem)] bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))]"
          role="dialog"
          aria-modal="true"
          aria-label="3분 AI 상담"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-t-xl bg-[#FFF8F5] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <div
          className={`relative overflow-hidden rounded-t-xl ${
            step === "result"
              ? "bg-[#FFF5ED]"
              : "bg-[#FFF8F5]"
          }`}
        >
          <div className="pointer-events-none absolute -right-12 top-0 h-36 w-36 rounded-full bg-[#FF853E]/15 blur-2xl" aria-hidden />
          <div className="relative px-5 pb-2 pt-6 sm:px-7 sm:pt-7">
            {step !== "result" && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  {(step === 1 || step === "chat") && (
                    <button
                      type="button"
                      onClick={goBackToChooseMode}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FFD2BF]/80 bg-white/95 text-[#C2410C] shadow-sm transition hover:bg-white active:scale-[0.98]"
                      aria-label="상담 방식 선택 화면으로 돌아가기"
                    >
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                  )}
                  <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1EA] px-4 py-1.5 text-[13px] font-bold text-[#C2410C] ring-2 ring-[#FF853E]/35 shadow-sm sm:px-4 sm:py-2 sm:text-[14px]">
                      3분
                      <span className="font-bold text-sky-600">
                        AI
                      </span>
                      상담
                    </span>
                    {showProgress && (
                      <span className="text-[12px] font-normal text-slate-500">
                        {progressNum}/{TOTAL_STEPS}
                      </span>
                    )}
                  </div>
                </div>
                {showProgress && (
                  <div className="mx-auto mt-4 max-w-full sm:mx-0" aria-hidden>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                      <div
                        className="h-full rounded-full bg-[#FF853E] transition-[width] duration-300 ease-out"
                        style={{ width: `${(progressNum / TOTAL_STEPS) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                <h2 className="mt-4 text-[1.15rem] font-bold leading-snug tracking-tight text-slate-900 sm:text-[1.25rem]">
                  {(step === 1 || (step === "chat" && !chatSlots.q1)) && (
                    <>
                      STEP 1 ·{" "}
                      <span className="text-[#FF853E]">지금</span> 에너지가 가장 많이 쓰이는 순간은?
                    </>
                  )}
                  {(step === "scene" || (step === "chat" && chatSlots.q1 && (!chatSlots.q2 || !chatSlots.q3))) &&
                    (step === "scene" ? q1 : chatSlots.q1) && (
                    <>
                      STEP 2 · 그때 가장 가까운 장면을{" "}
                      <span className="text-[#FF853E]">하나만</span> 골라주세요
                    </>
                  )}
                  {(step === 4 || (step === "chat" && chatSlots.q1 && chatSlots.q2 && chatSlots.q3 && !chatSlots.q4)) && (
                    <>
                      STEP 3 · 지금 가장 먼저 덜고 싶은 건?
                    </>
                  )}
                </h2>
                <p className="mt-2 text-[12px] font-medium leading-relaxed text-slate-600 sm:text-[13px]">
                  {step === "chat"
                    ? "자유롭게 입력하거나 아래 추천을 눌러 주세요. 대화하듯 이어가면 돼요."
                    : "정답 없어요. 오늘 느낌에 가장 가까운 것만 선택하면 돼요."}
                </p>
              </>
            )}
          </div>

          <div className="relative px-5 pb-7 pt-2 sm:px-7 sm:pb-8">
            {step === "chat" && (
              <div className="mx-auto flex max-w-lg flex-col gap-3">
                <div
                  ref={chatScrollRef}
                  className="flex max-h-[min(58vh,480px)] min-h-[12rem] flex-col gap-4 overflow-y-auto rounded-[1.35rem] border border-orange-100/60 bg-gradient-to-b from-white/95 to-[#FFF8F3]/90 px-3 py-4 shadow-inner shadow-orange-500/5 sm:px-4"
                >
                  {chatMessages.map((m, i) => (
                    <ChatMessageBubble key={i} msg={m} />
                  ))}
                  {streamingText !== null && <StreamingBotBubble text={streamingText} />}
                </div>

                {!chatSlots.q1 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-normal text-slate-500">추천 (터치하면 입력됨)</p>
                    <div className="flex flex-col gap-2">
                      {Q1_OPTIONS.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          disabled={isSending}
                          onClick={() => void sendChatMessage(o.text)}
                          className={pillChoiceLight}
                        >
                          {o.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatSlots.q1 && (!chatSlots.q2 || !chatSlots.q3) && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-normal text-slate-500">장면 추천</p>
                    <div className="flex flex-col gap-2">
                      {chatSceneList.map((o) => (
                        <button
                          key={o.q2 + o.q3}
                          type="button"
                          disabled={isSending}
                          onClick={() => void sendChatMessage(o.text)}
                          className={pillChoiceLight}
                        >
                          {o.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatSlots.q1 && chatSlots.q2 && chatSlots.q3 && !chatSlots.q4 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-normal text-slate-500">부담 추천</p>
                    <div className="flex flex-col gap-2">
                      {Q4_OPTIONS.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          disabled={isSending}
                          onClick={() => void sendChatMessage(o.text)}
                          className={pillChoiceLight}
                        >
                          {o.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-white/95 p-2">
                  <div className="flex gap-2">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void sendChatMessage(chatInput);
                        }
                      }}
                      placeholder="모모아 상담에 답해 주세요… (Enter 전송 · Shift+Enter 줄바꿈)"
                      rows={2}
                      disabled={isSending}
                      className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#FFB089] focus:outline-none focus:ring-2 focus:ring-[#FF853E]/25 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={isSending || !chatInput.trim()}
                      onClick={() => void sendChatMessage(chatInput)}
                      className="shrink-0 self-end rounded-xl bg-[#FF853E] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:brightness-[1.03] disabled:opacity-40"
                    >
                      전송
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mx-auto max-w-lg space-y-3">
                <div className="flex flex-col gap-2.5">
                  {Q1_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        setQ1(o.id);
                        setQ2(null);
                        setQ3(null);
                        setStep("scene");
                      }}
                      className={pillChoiceLight}
                    >
                      {o.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === "scene" && q1 && (
              <div className="mx-auto max-w-lg space-y-3">
                <div className="flex flex-col gap-2.5">
                  {sceneList.map((o) => (
                    <button
                      key={o.q2 + o.q3}
                      type="button"
                      onClick={() => {
                        setQ2(o.q2);
                        setQ3(o.q3);
                        setStep(4);
                      }}
                      className={pillChoiceLight}
                    >
                      {o.text}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center pt-1 sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-full px-4 py-2 text-xs font-normal text-slate-500 hover:bg-white/80"
                  >
                    ← 이전
                  </button>
                </div>
              </div>
            )}

            {step === 4 && q1 && q2 && q3 && (
              <div className="mx-auto max-w-lg space-y-3">
                <div className="flex flex-col gap-2.5">
                  {Q4_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        const answers: ConsultationAnswers = { q1, q2, q3, q4: o.id };
                        applyResult(answers);
                      }}
                      className={pillChoiceLight}
                    >
                      {o.text}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center pt-1 sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setStep("scene")}
                    className="rounded-full px-4 py-2 text-xs font-normal text-slate-500 hover:bg-white/80"
                  >
                    ← 이전
                  </button>
                </div>
              </div>
            )}

            {step === "result" && saved && (
              <div className="mx-auto max-w-lg space-y-4 pt-2">
                <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-2 sm:justify-center">
                  <span className="text-2xl" aria-hidden>
                    ✨
                  </span>
                  <p className="text-center text-base font-bold text-slate-900 sm:text-left">우리 집 기준으로 정리했어요</p>
                </div>

                <div className="rounded-2xl border border-[#FFD2BF]/50 bg-[#FFF8F4] p-5 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF853E]">왜 이렇게 나왔나요</p>
                  <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-800">{saved.summary}</p>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sky-700">다음에 볼 방향</p>
                  <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-800">{saved.direction}</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#FFD2BF]/50 bg-[#FFF8F4] p-4 shadow-sm">
                    <p className="text-[11px] font-bold text-[#C2410C]">꼭 필요해요</p>
                    <ul className="mt-2 space-y-1.5 text-[12px] font-medium leading-snug text-slate-800">
                      {saved.mustCategories.map((c) => (
                        <li key={c.id} className="flex gap-2">
                          <span className="text-[#FF853E]" aria-hidden>
                            ●
                          </span>
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-amber-100/90 bg-amber-50 p-4 shadow-sm">
                    <p className="text-[11px] font-bold text-amber-900">있으면 좋아요</p>
                    <ul className="mt-2 space-y-1.5 text-[12px] font-medium leading-snug text-slate-800">
                      {saved.niceCategories.map((c) => (
                        <li key={c.id} className="flex gap-2">
                          <span className="text-amber-500" aria-hidden>
                            ○
                          </span>
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 shadow-sm">
                    <p className="text-[11px] font-medium text-slate-500">지금은 미뤄도 돼요</p>
                    <ul className="mt-2 space-y-1.5 text-[12px] font-medium leading-snug text-slate-600">
                      {saved.deferCategories.map((c) => (
                        <li key={c.id} className="flex gap-2">
                          <span className="text-slate-400" aria-hidden>
                            ·
                          </span>
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="rounded-2xl border-2 border-[#FF853E]/30 bg-[#FFF8F4] p-5 shadow-sm">
                  <p className="text-[11px] font-bold text-[#FF853E]">한 줄 요약</p>
                  <p className="mt-2 text-[13px] font-bold leading-relaxed text-slate-900">{saved.oneLiner}</p>
                </div>
                <p className="text-center text-[12px] font-normal text-slate-500">
                  육아용품 탭에서 이 순서로 추천이 나뉘어요.
                </p>
                <button
                  type="button"
                  onClick={clearAndRestart}
                  className="w-full rounded-full border border-[#FFD2BF]/80 bg-white py-3.5 text-sm font-bold text-slate-800 shadow-sm hover:bg-[#FFFCF9]"
                >
                  처음부터 다시 상담하기
                </button>
              </div>
            )}
          </div>
        </div>
          </div>
        </div>
      )}
    </section>
  );
}
