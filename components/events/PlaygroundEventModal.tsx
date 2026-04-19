import React, { useCallback, useMemo, useState } from "react";
import { EVENT_CAROUSEL_ITEMS, type EventItem } from "./eventCarouselData";
import {
  addRegretAgree,
  addWalletPoints,
  appendParentsQuery,
  estimateSimilarParents,
  getCompareCounts,
  loadParentsQueries,
  loadPersonalityResult,
  loadPlaygroundReviews,
  loadPollVotes,
  loadRegretAgrees,
  REVIEW_SUBMIT_POINTS,
  savePersonalityResult,
  savePlaygroundReview,
  savePollVote,
  voteCompare,
} from "./playgroundStorage";

const POLL_SEED: Record<string, Record<string, number>> = {
  "poll-sleep": { "수면 교육": 98, 수면템: 112, 버팀: 67, 기타: 35 },
};

const COMPARE_CATALOG: { name: string; regret: number; happy: number; tip: string }[] = [
  {
    name: "휴대용 젖병 소독기",
    regret: 28,
    happy: 89,
    tip: "소음·크기 불만이 후회 리뷰에 자주 나와요.",
  },
  {
    name: "유기농 순면 기저귀 A형",
    regret: 12,
    happy: 94,
    tip: "사이즈만 맞으면 만족 비율이 매우 높아요.",
  },
  {
    name: "친환경 대나무 물티슈",
    regret: 18,
    happy: 91,
    tip: "향·두께 취향이 갈려요. 체험팩 후기를 참고해 보세요.",
  },
  {
    name: "무독성 실리콘 치발기",
    regret: 15,
    happy: 88,
    tip: "재질 인증 사진이 있는 리뷰가 신뢰도가 높아요.",
  },
  {
    name: "아기띠 올인원 캐리어",
    regret: 41,
    happy: 76,
    tip: "허리·어깨 피로 언급이 후회에 많아요. 체형별 후기를 꼭 읽어보세요.",
  },
];

const REGRET_TOP: { rank: number; name: string; reason: string; pct: number }[] = [
  { rank: 1, name: "소음 큰 흡입 젖병 세척기", reason: "야간 소음·진동 불만 다수", pct: 38 },
  { rank: 2, name: "뻣뻣한 아기띠 패드형", reason: "아기가 거부·땀답다는 후기", pct: 34 },
  { rank: 3, name: "향 강한 아기 로션", reason: "예민 피부 부모들의 향 불만", pct: 29 },
  { rank: 4, name: "조립 복잡한 대형 장난감", reason: "반품·방치 언급이 많음", pct: 26 },
  { rank: 5, name: "사이즈 작게 나온 실내화", reason: "교환 후기가 길게 이어짐", pct: 22 },
];

const TEST_Q = [
  {
    q: "낯선 환경에 가면 아이는?",
    a: ["예민하게 반응해요", "금방 적응해요"],
    scores: [2, 0],
  },
  {
    q: "루틴이 조금만 바뀌면?",
    a: ["예민해져요", "크게 상관없어요"],
    scores: [2, 0],
  },
  {
    q: "새로운 육아템을 줄 때?",
    a: ["천천히 받아들여요", "바로 호기심 많아요"],
    scores: [2, 0],
  },
];

function mergePollCounts(event: EventItem): Record<string, number> {
  const opts = event.pollOptions ?? [];
  const seed = POLL_SEED[event.id] ?? Object.fromEntries(opts.map((o) => [o, 40 + (o.length * 7) % 50]));
  const out: Record<string, number> = { ...seed };
  const votes = loadPollVotes();
  const mine = votes[event.id];
  if (mine && out[mine] != null) out[mine] += 1;
  return out;
}

type Props = {
  event: EventItem | null;
  onClose: () => void;
};

export function PlaygroundEventModal({ event, onClose }: Props) {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  if (!event) return null;

  return (
    <div className="app-viewport-fixed z-[85] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="relative z-[1] mb-0 max-h-[min(92dvh,720px)] w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-slate-200 sm:mb-0 sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#FF853E]">플레이그라운드</p>
            <h2 className="mt-1 text-base font-bold leading-snug text-slate-900 sm:text-lg">{event.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[min(78dvh,600px)] overflow-y-auto px-5 py-5">
          {event.variant === "poll" && <PollPanel event={event} onVoted={refresh} tick={tick} />}
          {event.variant === "challenge" && <ReviewPanel onClose={onClose} />}
          {event.variant === "compare" && <ComparePanel />}
          {event.variant === "parents" && <ParentsPanel />}
          {event.variant === "test" && <TypeTestPanel onClose={onClose} />}
          {event.variant === "regret" && <RegretPanel />}
        </div>
      </div>
    </div>
  );
}

function PollPanel({
  event,
  onVoted,
  tick,
}: {
  event: EventItem;
  onVoted: () => void;
  tick: number;
}) {
  const options = event.pollOptions ?? [];
  const counts = useMemo(() => mergePollCounts(event), [event, tick]);
  const myVote = loadPollVotes()[event.id];
  const total = Math.max(1, Object.values(counts).reduce((a, b) => a + b, 0));

  const submit = (opt: string) => {
    savePollVote(event.id, opt);
    onVoted();
  };

  return (
    <div className="space-y-5">
      <p className="text-sm font-normal text-slate-600">{event.description}</p>
      <div className="space-y-3">
        {options.map((opt) => {
          const n = counts[opt] ?? 0;
          const pct = Math.round((n / total) * 100);
          const active = myVote === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => submit(opt)}
              className={`flex w-full flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? "border-[#FF853E] bg-[#FFF8F4] ring-1 ring-[#FFD2BF]"
                  : "border-slate-200 bg-white hover:border-[#FFD2BF] hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">{opt}</span>
                <span className="text-xs font-bold text-[#FF853E]">{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#FF853E] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
      {myVote && (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
          내 선택은 <span className="font-bold">「{myVote}」</span>예요. 다른 항목을 누르면 투표를 바꿀 수
          있어요.
        </p>
      )}
    </div>
  );
}

function ReviewPanel({ onClose }: { onClose: () => void }) {
  const [productName, setProductName] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [done, setDone] = useState(false);
  const [balanceAfter, setBalanceAfter] = useState<number | null>(null);
  const recent = useMemo(() => loadPlaygroundReviews().slice(0, 3), [done]);

  const onPhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      let url = String(reader.result || "");
      if (url.length > 120_000) {
        url = "";
        window.alert("이미지가 너무 커요. 더 작은 사진을 선택해 주세요.");
      }
      setPhotoUrl(url);
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const submit = () => {
    if (!body.trim()) return;
    savePlaygroundReview({
      productName: productName.trim() || "(제품명 미입력)",
      rating,
      body: body.trim(),
      photoUrl: photoUrl.trim(),
    });
    const bal = addWalletPoints(REVIEW_SUBMIT_POINTS, "플레이그라운드 리얼 후기");
    setBalanceAfter(bal);
    setDone(true);
    setBody("");
    setPhotoUrl("");
    setProductName("");
  };

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-4xl" aria-hidden="true">
          ✨
        </p>
        <p className="text-base font-bold text-slate-900">리얼 후기가 등록됐어요!</p>
        <p className="text-sm font-normal text-slate-600">
          모모아 포인트{" "}
          <span className="font-bold text-[#FF853E]">+{REVIEW_SUBMIT_POINTS}P</span>가 적립됐어요.
        </p>
        {balanceAfter != null && (
          <p className="text-xs font-semibold text-slate-500">현재 보유 {balanceAfter.toLocaleString()}P</p>
        )}
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setBalanceAfter(null);
          }}
          className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          또 남기기
        </button>
        {recent.length > 0 && (
          <div className="rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-100">
            <p className="text-xs font-medium text-slate-500">방금 저장된 후기</p>
            {recent[0]?.photoUrl ? (
              <img
                src={recent[0].photoUrl}
                alt=""
                className="mt-2 max-h-28 w-full rounded-xl object-cover"
              />
            ) : null}
            <p className="mt-2 line-clamp-3 text-sm font-medium text-slate-800">{recent[0]?.body}</p>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl bg-[#FF853E] py-3 text-sm font-bold text-white hover:bg-[#FF6F1F]"
        >
          닫기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-normal text-slate-600">
        사진은 갤러리에서 고르거나, 아래에 URL을 적을 수 있어요. 솔직한 한 줄도 큰 도움이 돼요.
      </p>
      <label className="block text-xs font-semibold text-slate-700">제품명 (선택)</label>
      <input
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="예: 유기농 순면 기저귀 A형"
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF853E]"
      />
      <p className="text-xs font-semibold text-slate-700">만족도</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`flex-1 rounded-xl py-2 text-sm font-bold ${
              rating === n ? "bg-[#FF853E] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <label className="block text-xs font-semibold text-slate-700">리얼 후기</label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="사용 기간, 장단점, 아이 반응 등을 적어주세요."
        className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF853E]"
      />
      <label className="block text-xs font-semibold text-slate-700">사진 첨부 (선택)</label>
      <input
        type="file"
        accept="image/*"
        onChange={onPhotoFile}
        className="w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#FF853E] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
      />
      <label className="block text-xs font-semibold text-slate-700">또는 이미지 URL (선택)</label>
      <input
        value={photoUrl.startsWith("data:") ? "" : photoUrl}
        onChange={(e) => setPhotoUrl(e.target.value)}
        placeholder="https://..."
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF853E]"
      />
      {photoUrl.startsWith("data:") ? (
        <p className="text-[11px] font-medium text-emerald-700">사진이 첨부됐어요.</p>
      ) : null}
      <button
        type="button"
        onClick={submit}
        disabled={!body.trim()}
        className="w-full rounded-2xl bg-[#FF853E] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#FF6F1F] disabled:opacity-40"
      >
        후기 등록하기
      </button>
    </div>
  );
}

function ComparePanel() {
  const [idx, setIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const p = COMPARE_CATALOG[idx];

  const counts = useMemo(
    () => getCompareCounts(p.name, p.regret, p.happy),
    [p.name, p.regret, p.happy, tick]
  );
  const total = Math.max(1, counts.regret + counts.happy);
  const regretPct = Math.round((counts.regret / total) * 100);
  const happyPct = Math.round((counts.happy / total) * 100);

  const vote = (side: "regret" | "happy") => {
    voteCompare(p.name, side, p.regret, p.happy);
    setTick((t) => t + 1);
  };

  return (
    <div className="space-y-5">
      <label className="block text-xs font-semibold text-slate-700">제품 선택</label>
      <select
        value={idx}
        onChange={(e) => setIdx(Number(e.target.value))}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#FF853E]"
      >
        {COMPARE_CATALOG.map((c, i) => (
          <option key={c.name} value={i}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
        <p className="text-center text-xs font-bold uppercase tracking-wide text-slate-500">후회 vs 만족</p>
        <p className="mt-1 text-center text-[11px] text-slate-400">내 한 표가 아래 비율에 반영돼요</p>
        <div className="mt-4 flex gap-4">
          <div className="flex-1 text-center">
            <p className="text-2xl font-black text-rose-500">{regretPct}%</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">후회·아쉬움</p>
          </div>
          <div className="w-px bg-slate-200" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-black text-emerald-600">{happyPct}%</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">만족·재구매</p>
          </div>
        </div>
        <div className="mt-4 flex h-3 gap-0.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full min-w-0 rounded-l-full bg-rose-400" style={{ flex: counts.regret }} />
          <div className="h-full min-w-0 rounded-r-full bg-emerald-500" style={{ flex: counts.happy }} />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => vote("regret")}
          className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-800 transition hover:bg-rose-100"
        >
          나는 후회했어요
        </button>
        <button
          type="button"
          onClick={() => vote("happy")}
          className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-bold text-emerald-900 transition hover:bg-emerald-100"
        >
          나는 만족해요
        </button>
      </div>
      <p className="text-sm font-normal leading-relaxed text-slate-600">{p.tip}</p>
    </div>
  );
}

function ParentsPanel() {
  const [months, setMonths] = useState(6);
  const [concern, setConcern] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const history = useMemo(() => loadParentsQueries().slice(0, 5), [tick]);

  const run = () => {
    const trimmed = concern.trim();
    if (!trimmed) return;
    const estimated = estimateSimilarParents(months, trimmed);
    appendParentsQuery({ months, concern: trimmed, estimatedPeers: estimated });
    setResult(estimated);
    setTick((t) => t + 1);
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-semibold text-slate-700">아이 개월수</label>
      <input
        type="number"
        min={0}
        max={60}
        value={months}
        onChange={(e) => setMonths(Number(e.target.value) || 0)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF853E]"
      />
      <label className="block text-xs font-semibold text-slate-700">지금 고민 (한 줄)</label>
      <textarea
        value={concern}
        onChange={(e) => setConcern(e.target.value)}
        rows={3}
        placeholder="예: 밤에 자주 깨요, 이유식 거부..."
        className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF853E]"
      />
      <button
        type="button"
        onClick={run}
        disabled={!concern.trim()}
        className="w-full rounded-2xl bg-[#FF853E] py-3.5 text-sm font-bold text-white hover:bg-[#FF6F1F] disabled:opacity-40"
      >
        비슷한 부모 찾기
      </button>
      {result != null && (
        <div className="rounded-2xl bg-[#FFF8F4] p-4 text-center ring-1 ring-[#FFD2BF]">
          <p className="text-sm font-semibold text-slate-700">비슷한 상황으로 추정되는 부모</p>
          <p className="mt-2 text-3xl font-black text-[#FF853E]">약 {result}명</p>
          <p className="mt-2 text-xs font-normal text-slate-500">
            지금까지 입력한 고민·개월대가 쌓일수록 같은 상황 코호트 추정이 정교해져요.
          </p>
        </div>
      )}
      {history.length > 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">최근 입력</p>
          <ul className="mt-2 space-y-2">
            {history.map((h) => (
              <li key={h.createdAt} className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">{h.months}개월</span> ·{" "}
                <span className="line-clamp-2">{h.concern}</span>
                <span className="mt-0.5 block text-[10px] text-slate-400">
                  추정 약 {h.estimatedPeers}명 ·{" "}
                  {new Date(h.createdAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function personalityFromScore(finalScore: number): { label: string; tip: string } {
  const label =
    finalScore >= 5 ? "예민 탐험형" : finalScore <= 1 ? "여유 만만형" : "균형 완충형";
  const tip =
    finalScore >= 5
      ? "자극 적은 제품·예측 가능한 루틴을 추천해 드릴게요."
      : finalScore <= 1
        ? "새로운 경험도 천천히 받아들이는 편이에요. 탐색형 놀이를 넓혀 가면 좋아요."
        : "상황에 맞춰 템과 루틴을 섞어 쓰기 좋아요.";
  return { label, tip };
}

function TypeTestPanel({ onClose }: { onClose: () => void }) {
  type Phase = "intro" | "quiz" | "done";
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [savedSnap, setSavedSnap] = useState(() => loadPersonalityResult());

  const start = () => {
    setPhase("quiz");
    setQIndex(0);
    setScore(0);
  };

  const answer = (choice: 0 | 1) => {
    const q = TEST_Q[qIndex];
    if (!q) return;
    const nextScore = score + q.scores[choice];
    setScore(nextScore);
    if (qIndex + 1 >= TEST_Q.length) {
      const { label, tip } = personalityFromScore(nextScore);
      savePersonalityResult({ label, score: nextScore, tip });
      setSavedSnap(loadPersonalityResult());
      setPhase("done");
    } else {
      setQIndex((i) => i + 1);
    }
  };

  const finalScore = score;
  const { label, tip } = personalityFromScore(finalScore);

  if (phase === "intro") {
    const prev = savedSnap ?? loadPersonalityResult();
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm font-normal text-slate-600">짧은 3문항으로 우리 아이 성향을 가볍게 알아봐요.</p>
        {prev ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-left ring-1 ring-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">저장된 결과</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{prev.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {new Date(prev.savedAt).toLocaleDateString("ko-KR")} · 점수 {prev.score}
            </p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={start}
          className="w-full rounded-2xl bg-[#FF853E] py-3.5 text-sm font-bold text-white hover:bg-[#FF6F1F]"
        >
          테스트 시작
        </button>
        <button type="button" onClick={onClose} className="text-xs font-medium text-slate-500 hover:text-slate-800">
          닫기
        </button>
      </div>
    );
  }

  if (phase === "done") {
    const display = savedSnap ?? { label, tip, score: finalScore, savedAt: Date.now() };
    return (
      <div className="space-y-4 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-[#FF853E]">결과</p>
        <p className="text-2xl font-black text-slate-900">{display.label}</p>
        <p className="text-sm font-normal text-slate-600">{display.tip}</p>
        <p className="text-[11px] text-slate-400">기기에 저장됐어요. 맞춤 추천에 활용할 수 있어요.</p>
        <button
          type="button"
          onClick={() => {
            setPhase("intro");
            setQIndex(0);
            setScore(0);
          }}
          className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          다시 하기
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl bg-[#FF853E] py-3 text-sm font-bold text-white hover:bg-[#FF6F1F]"
        >
          닫기
        </button>
      </div>
    );
  }

  const q = TEST_Q[qIndex];
  if (!q) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-[#FF853E]">
        {qIndex + 1} / {TEST_Q.length}
      </p>
      <p className="text-base font-bold leading-snug text-slate-900">{q.q}</p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => answer(0)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left text-sm font-semibold text-slate-800 hover:border-[#FF853E] hover:bg-[#FFF8F4]"
        >
          {q.a[0]}
        </button>
        <button
          type="button"
          onClick={() => answer(1)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left text-sm font-semibold text-slate-800 hover:border-[#FF853E] hover:bg-[#FFF8F4]"
        >
          {q.a[1]}
        </button>
      </div>
    </div>
  );
}

function RegretPanel() {
  const [tick, setTick] = useState(0);
  const agrees = useMemo(() => loadRegretAgrees(), [tick]);

  return (
    <div className="space-y-3">
      <p className="text-sm font-normal text-slate-600">
        이번 주 후회 언급이 많았던 제품이에요. 나도 비슷했다면 공감을 남겨 주세요.
      </p>
      <ul className="space-y-2">
        {REGRET_TOP.map((row) => {
          const n = agrees[row.rank] ?? 0;
          return (
            <li
              key={row.rank}
              className="rounded-2xl border border-slate-100 bg-slate-50/90 p-3 ring-1 ring-slate-100"
            >
              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                  {row.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">{row.name}</p>
                  <p className="mt-1 text-xs font-normal text-slate-600">{row.reason}</p>
                  <p className="mt-1 text-[11px] font-bold text-rose-600">후회 언급 약 {row.pct}%</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  addRegretAgree(row.rank);
                  setTick((t) => t + 1);
                }}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 transition hover:border-[#FFD2BF] hover:bg-[#FFF8F4]"
              >
                나도 후회했어요 {n > 0 ? `· ${n}명` : ""}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PlaygroundAllEventsModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (e: EventItem) => void;
}) {
  if (!open) return null;
  return (
    <div className="app-viewport-fixed z-[85] flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-black/45" aria-label="닫기" onClick={onClose} />
      <div className="relative z-[1] max-h-[80dvh] w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">전체 이벤트</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-2xl text-slate-500 hover:bg-slate-100"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <ul className="max-h-[60dvh] overflow-y-auto p-3">
          {EVENT_CAROUSEL_ITEMS.map((ev) => (
            <li key={ev.id} className="mb-2">
              <button
                type="button"
                onClick={() => {
                  onPick(ev);
                  onClose();
                }}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left hover:border-[#FFD2BF] hover:bg-[#FFF8F4]"
              >
                <span className="text-2xl">{ev.accent}</span>
                <span className="min-w-0 flex-1 text-sm font-bold text-slate-900">{ev.title}</span>
                <span className="text-slate-400">›</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
