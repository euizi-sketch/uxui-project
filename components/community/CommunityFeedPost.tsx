import { useEffect, useState } from "react";
import type { FeedPost } from "./communityFeedModel";
import { formatFeedTime, toggleLikePost } from "./communityFeedModel";

type Props = {
  post: FeedPost;
  liked: boolean;
  commentCount: number;
  onLikeChange: (postId: string) => void;
  onOpenComments: (postId: string) => void;
};

export default function CommunityFeedPost({
  post,
  liked: likedInitial,
  commentCount,
  onLikeChange,
  onOpenComments,
}: Props) {
  const [liked, setLiked] = useState(likedInitial);
  const [count, setCount] = useState(post.likeCount);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    setLiked(likedInitial);
    setCount(post.likeCount);
  }, [post.id, post.likeCount, likedInitial]);

  const onHeart = () => {
    const { liked: L, likeCount } = toggleLikePost(post.id);
    setLiked(L);
    setCount(likeCount);
    onLikeChange(post.id);
  };

  return (
    <article id={`feed-post-${post.id}`} className="scroll-mt-28 border-b border-slate-100 bg-white pb-5 pt-4 last:border-b-0">
      <div className="flex items-start gap-3 px-1">
        <img
          src={post.avatarUrl}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#FFD2BF]/40"
          width={40}
          height={40}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[14px] font-bold text-slate-900">{post.author}</span>
            <span className="text-[11px] font-medium text-slate-400">{formatFeedTime(post.createdAt)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-[14px] font-medium leading-relaxed text-slate-800">{post.body}</p>
          {post.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-[#FFF8F4] px-2 py-0.5 text-[11px] font-bold text-[#E85A20] ring-1 ring-[#FFD2BF]/50"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {post.images.length > 0 && (
        <div className="relative mt-3 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-100">
          <img
            src={post.images[imgIdx]}
            alt=""
            className="aspect-[4/3] w-full object-cover sm:aspect-video"
          />
          {post.images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="이전 사진"
                onClick={() => setImgIdx((i) => (i - 1 + post.images.length) % post.images.length)}
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="다음 사진"
                onClick={() => setImgIdx((i) => (i + 1) % post.images.length)}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50"
              >
                ›
              </button>
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                {post.images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${i === imgIdx ? "bg-white" : "bg-white/45"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-1 sm:gap-4">
          <button
            type="button"
            onClick={onHeart}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-bold transition hover:bg-[#FFF8F4]"
            aria-pressed={liked}
          >
            <span className="text-lg" aria-hidden>
              {liked ? "❤️" : "🤍"}
            </span>
            <span className="text-[13px] font-semibold text-slate-700">{count}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenComments(post.id)}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <span className="text-lg" aria-hidden>
              💬
            </span>
            <span className="text-[13px] font-bold">채팅 {commentCount}</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => window.alert("공유하기 (데모)")}
          className="rounded-full p-2 text-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          aria-label="공유"
        >
          ↗
        </button>
      </div>
    </article>
  );
}
