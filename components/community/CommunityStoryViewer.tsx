import { useCallback, useEffect, useState } from "react";
import type { FeedPost } from "./communityFeedModel";
import { formatFeedTime } from "./communityFeedModel";
import type { FeaturedRoom } from "./communityRooms";

type Props = {
  room: FeaturedRoom;
  posts: FeedPost[];
  onClose: () => void;
};

/** 방별 최근 글을 스토리처럼 넘겨 보기 (사진 우선 정렬) */
export default function CommunityStoryViewer({ room, posts, onClose }: Props) {
  const slides = [...posts].sort((a, b) => {
    const ai = a.images.length ? 1 : 0;
    const bi = b.images.length ? 1 : 0;
    if (bi !== ai) return bi - ai;
    return b.createdAt - a.createdAt;
  });

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const next = useCallback(() => {
    setIdx((i) => Math.min(slides.length - 1, i + 1));
  }, [slides.length]);

  const prev = useCallback(() => {
    setIdx((i) => Math.max(0, i - 1));
  }, []);

  const cur = slides[idx];
  const bgUrl = cur?.images[0] ?? room.coverUrl;

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 z-[80] flex flex-col bg-slate-900 text-white">
        <div className="flex items-center justify-between px-4 py-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <p className="min-w-0 flex-1 text-sm font-bold leading-snug line-clamp-2">{room.name}</p>
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-bold hover:bg-white/10">
            닫기
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="text-sm font-medium text-white/80">아직 이 방에 올라온 글이 없어요.</p>
          <button type="button" onClick={onClose} className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black">
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-3 pt-[max(0.5rem,env(safe-area-inset-top))] text-white">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded-full bg-white/15 p-0.5 ring-2 ring-[#FF853E]/80">
            <img src={room.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" width={36} height={36} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold leading-snug line-clamp-2">{room.name}</p>
            <p className="text-[11px] font-medium text-white/70">
              {cur.author} · {formatFeedTime(cur.createdAt)}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="shrink-0 rounded-full bg-white/15 px-4 py-2 text-[13px] font-bold backdrop-blur-sm">
          ✕
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <button type="button" aria-label="이전" onClick={prev} disabled={idx <= 0} className="absolute left-0 top-0 z-10 h-full w-[28%] disabled:opacity-0" />
        <button type="button" aria-label="다음" onClick={next} disabled={idx >= slides.length - 1} className="absolute right-0 top-0 z-10 h-full w-[28%] disabled:opacity-0" />

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgUrl})` }}
        >
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-[1] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-24">
          <p className="text-[15px] font-semibold leading-relaxed text-white drop-shadow-md">{cur.body}</p>
          {cur.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {cur.tags.map((t) => (
                <span key={t} className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-[max(5.5rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}번째`}
              onClick={() => setIdx(i)}
              className={`h-1 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-white/45"}`}
            />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 justify-center gap-3 border-t border-white/10 bg-black/60 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={prev} disabled={idx <= 0} className="rounded-full bg-white/15 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-30">
          이전
        </button>
        <button type="button" onClick={next} disabled={idx >= slides.length - 1} className="rounded-full bg-[#FF853E] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-30">
          다음
        </button>
      </div>
    </div>
  );
}
