import { useEffect, useMemo, useRef, useState } from "react";
import {
  getDmThread,
  getMomById,
  maybeAppendDemoReply,
  sendDmMessage,
  type DmMessage,
} from "./communityMomFriendsModel";

export default function CommunityDmModal({
  peerId,
  open,
  onClose,
}: {
  peerId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const peer = peerId ? getMomById(peerId) : undefined;
  const [tick, setTick] = useState(0);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const thread = useMemo(() => (peerId ? getDmThread(peerId) : undefined), [peerId, tick]);
  const messages = thread?.messages ?? [];

  useEffect(() => {
    const sync = () => setTick((n) => n + 1);
    window.addEventListener("momoA-community-dm-changed", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("momoA-community-dm-changed", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [open, messages.length]);

  useEffect(() => {
    if (!open) setDraft("");
  }, [open, peerId]);

  if (!open || !peer || !peerId) return null;

  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    sendDmMessage(peerId, t);
    setDraft("");
    setTick((n) => n + 1);
    maybeAppendDemoReply(peerId);
  };

  return (
    <div
      className="fixed inset-0 z-[85] flex flex-col bg-black/45 px-3 pt-[max(1rem,env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] sm:items-center sm:justify-center sm:pb-12 sm:pt-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dm-peer-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-transparent sm:backdrop-blur-[2px]"
        aria-label="닫기 배경"
        onClick={onClose}
      />
      <div className="relative z-[1] flex max-h-[min(92vh,760px)] w-full max-w-md flex-col overflow-hidden rounded-[1.35rem] bg-white shadow-2xl ring-1 ring-slate-200/90">
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-lg font-bold text-slate-600 hover:bg-slate-100"
          >
            ←
          </button>
          <img src={peer.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#FFD2BF]/70" />
          <div className="min-w-0 flex-1">
            <p id="dm-peer-title" className="truncate text-[15px] font-bold text-slate-900">
              {peer.nickname}
            </p>
            <p className="truncate text-[11px] font-medium text-slate-500">
              {peer.childAgeLabel ?? ""}
              {peer.region ? ` · ${peer.region}` : ""}
            </p>
          </div>
        </header>

        <div ref={scrollRef} className="min-h-[12rem] flex-1 overflow-y-auto overscroll-contain bg-[#FFF8F5] px-4 py-4">
          {messages.length === 0 ? (
            <p className="py-10 text-center text-[13px] font-medium text-slate-400">
              첫 인사를 남겨 보세요. 맘 친구와 정보를 나눌 수 있어요.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {messages.map((m: DmMessage) => (
                <div
                  key={m.id}
                  className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-[1.1rem] px-3.5 py-2.5 text-[13px] font-medium leading-relaxed shadow-sm ${
                      m.fromMe
                        ? "rounded-br-md bg-[#FF853E] text-white"
                        : "rounded-bl-md border border-orange-100/90 bg-white text-slate-800"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-slate-100 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="메시지 입력…"
              rows={2}
              className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#FFB089] focus:outline-none focus:ring-2 focus:ring-[#FF853E]/20"
            />
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={submit}
              className="shrink-0 self-end rounded-xl bg-[#FF853E] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm disabled:opacity-35"
            >
              보내기
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] font-medium text-slate-400">
            데모 · 상대 답장은 예시 문구로 시뮬레이션됩니다.
          </p>
        </footer>
      </div>
    </div>
  );
}
