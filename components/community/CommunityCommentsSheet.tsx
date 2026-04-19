import { useEffect, useMemo, useRef, useState } from "react";
import type { FeedComment } from "./communityFeedModel";
import { addFeedComment, formatFeedTime } from "./communityFeedModel";

type Props = {
  open: boolean;
  postId: string | null;
  comments: FeedComment[];
  onClose: () => void;
  onCommentsChange: () => void;
  /** 로컬 데모용 표시 이름 */
  myDisplayName?: string;
};

export default function CommunityCommentsSheet({
  open,
  postId,
  comments,
  onClose,
  onCommentsChange,
  myDisplayName = "나",
}: Props) {
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<FeedComment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setText("");
      setReplyTo(null);
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const tree = useMemo(() => {
    if (!postId) return [];
    const roots = comments.filter((c) => c.postId === postId && !c.parentId);
    const childrenOf = (parentId: string) =>
      comments.filter((c) => c.postId === postId && c.parentId === parentId);
    type Node = { c: FeedComment; replies: FeedComment[] };
    const out: Node[] = roots.map((c) => ({
      c,
      replies: childrenOf(c.id),
    }));
    return out;
  }, [comments, postId]);

  const submit = () => {
    const t = text.trim();
    if (!t || !postId) return;
    addFeedComment({
      postId,
      parentId: replyTo?.id ?? null,
      author: myDisplayName,
      body: t,
    });
    setText("");
    setReplyTo(null);
    onCommentsChange();
  };

  if (!open || !postId) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="댓글 닫기"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-[61] mx-auto flex max-h-[min(72dvh,560px)] w-full max-w-app flex-col rounded-t-[1.25rem] bg-white shadow-[0_-8px_40px_-12px_rgba(15,23,42,0.2)] ring-1 ring-slate-200/80">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-bold text-slate-900">댓글 · 채팅</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
          >
            닫기
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
          {tree.length === 0 ? (
            <p className="py-8 text-center text-sm font-medium text-slate-400">첫 댓글을 남겨 보세요 💬</p>
          ) : (
            tree.map(({ c, replies }) => (
              <div key={c.id} className="rounded-2xl bg-slate-50/90 px-3 py-2.5 ring-1 ring-slate-100">
                <div className="flex gap-2">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF1EA] text-xs font-bold text-[#FF853E]">
                    {c.author.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-[13px] font-bold text-slate-900">{c.author}</span>
                      <span className="text-[11px] font-medium text-slate-400">{formatFeedTime(c.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-[13px] font-medium leading-relaxed text-slate-700">{c.body}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTo(c);
                        inputRef.current?.focus();
                      }}
                      className="mt-1.5 text-[11px] font-bold text-[#FF853E]"
                    >
                      답글
                    </button>
                  </div>
                </div>
                {replies.length > 0 && (
                  <ul className="mt-3 space-y-2 border-l-2 border-[#FFD2BF]/60 pl-3">
                    {replies.map((r) => (
                      <li key={r.id} className="flex gap-2">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                          {r.author.slice(0, 1)}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-2">
                            <span className="text-[12px] font-semibold text-slate-800">{r.author}</span>
                            <span className="text-[10px] font-medium text-slate-400">{formatFeedTime(r.createdAt)}</span>
                          </div>
                          <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-slate-600">{r.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-2">
          {replyTo && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-[#FFF8F4] px-3 py-2 text-[11px] ring-1 ring-[#FFD2BF]/50">
              <span className="truncate font-semibold text-slate-600">
                <span className="text-[#FF853E]">{replyTo.author}</span> 님에게 답글
              </span>
              <button type="button" className="font-bold text-slate-400 hover:text-slate-600" onClick={() => setReplyTo(null)}>
                취소
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={replyTo ? "답글을 입력해 주세요" : "댓글을 입력해 주세요"}
              className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] font-medium text-slate-800 outline-none ring-1 ring-slate-100 focus:border-[#FFD2BF] focus:ring-2 focus:ring-[#FF853E]/20"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!text.trim()}
              className="shrink-0 rounded-full bg-[#FF853E] px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:brightness-[1.03] disabled:opacity-40"
            >
              등록
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
