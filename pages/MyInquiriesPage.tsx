import { useMemo, useState } from "react";
import {
  appendInquiry,
  loadInquiries,
  simulateInquiryAnswer,
} from "../profile/myPageHubStorage";

export default function MyInquiriesPage({ onBack }: { onBack: () => void }) {
  const [tick, setTick] = useState(0);
  const list = useMemo(() => loadInquiries(), [tick]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = () => {
    const r = appendInquiry(title, body);
    if (r) {
      setTitle("");
      setBody("");
      setTick((t) => t + 1);
      window.setTimeout(() => {
        simulateInquiryAnswer(r.id);
        setTick((x) => x + 1);
      }, 1800);
    }
  };

  return (
    <div className="min-h-dvh bg-white pb-safe-tab text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
        <div className="relative flex h-14 items-center px-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
            aria-label="뒤로가기"
          >
            ←
          </button>
          <h1 className="flex-1 text-center text-base font-bold tracking-tight">1:1 문의</h1>
          <span className="w-10" />
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 pt-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-bold text-slate-700">새 문의 남기기</p>
          <label className="mt-3 block text-[11px] font-semibold text-slate-500">제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문의 제목"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#FF853E]"
          />
          <label className="mt-3 block text-[11px] font-semibold text-slate-500">내용</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="문의 내용을 적어 주세요."
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#FF853E]"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!title.trim() || !body.trim()}
            className="mt-3 w-full rounded-xl bg-[#FF853E] py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            등록하기
          </button>
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-wide text-slate-400">내 문의</p>
        <ul className="mt-2 space-y-3">
          {list.map((q) => (
            <li key={q.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{q.title}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    q.status === "answered"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {q.status === "answered" ? "답변 완료" : "접수"}
                </span>
              </div>
              <p className="mt-2 text-sm font-normal text-slate-600">{q.body}</p>
              {q.answer ? (
                <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-100">
                  <p className="text-[10px] font-bold text-slate-400">답변</p>
                  <p className="mt-1">{q.answer}</p>
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-slate-400">답변 준비 중이에요…</p>
              )}
              <p className="mt-2 text-[10px] text-slate-400">
                {new Date(q.createdAt).toLocaleString("ko-KR")}
              </p>
            </li>
          ))}
        </ul>
        {list.length === 0 ? (
          <p className="mt-6 text-center text-sm text-slate-500">등록된 문의가 없어요.</p>
        ) : null}
      </main>
    </div>
  );
}
